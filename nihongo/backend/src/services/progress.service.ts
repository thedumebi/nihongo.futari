import type { AggregateEvent, KnownKanji, ProgressSummary, Readiness, Streak } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import {
  kana,
  kanji,
  languageLevels,
  languages,
  srsCards,
  srsDailyStats,
  srsReviewLogs,
  streakFreezes,
  studyItemFacets,
  studyItems,
  users,
  userSettings,
  userStreaks,
  userXp,
  xpEvents
} from '@nihongo/shared/db/schema'
import { aggregateReviews, computeStreak, studyDateFor, studyDayRange } from '@nihongo/shared/lib'
import { and, eq, gte, inArray, isNull, sql } from 'drizzle-orm'

import { countDue } from './srs.service.js'

/**
 * Progress aggregates.
 *
 * Every write here is replay-safe by construction:
 *
 *   - `srs_daily_stats` is DELETE+INSERT for the affected dates. Never `+= 1`,
 *     because a replayed review can land in any past day and an increment has
 *     no way to unwind the old value.
 *   - `xp_events` is INSERT ... ON CONFLICT DO NOTHING against
 *     `unique(userId, source, refId)` where refId is the review-log id. Re-emit
 *     the same award a hundred times and it counts once.
 *   - `user_streaks` is derived from the set of study days, so a review that
 *     fills a gap correctly joins two runs into one.
 *
 * Nothing in this file reads a stored counter and adds to it.
 */

interface UserContext {
  timezone: string
  dayBoundaryHour: number
}

async function loadUserContext(userId: string): Promise<UserContext> {
  const [row] = await db
    .select({ timezone: users.timezone, dayBoundaryHour: userSettings.dayBoundaryHour })
    .from(users)
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1)

  return {
    timezone: row?.timezone ?? 'UTC',
    dayBoundaryHour: row?.dayBoundaryHour ?? 4
  }
}

/**
 * Turn review logs into the minimal shape the aggregate fold needs.
 *
 * A lapse is a review that pushed a card OUT of Review state — that is the
 * moment the learner actually forgot something, as distinct from a wrong answer
 * on a card that was already in relearning.
 */
function toAggregateEvents(rows: Array<{
  id: string
  reviewedAt: Date
  rating: number
  stateBefore: number | null
  stateAfter: number | null
  durationMs: number | null
}>): AggregateEvent[] {
  return rows.map(r => ({
    logId: r.id,
    reviewedAt: r.reviewedAt,
    rating: r.rating as AggregateEvent['rating'],
    stateBefore: r.stateBefore ?? 0,
    lapsed: r.stateBefore === 2 && r.stateAfter === 3,
    durationMs: r.durationMs ?? 0
  }))
}

/**
 * Recompute every aggregate for one user + language from the review log.
 *
 * `since` limits the rebuild to recent history for the common case. Pass it
 * undefined after a replay: a review inserted into the middle of history can
 * change any later day, so the only safe answer is to redo the lot.
 *
 * The cutoff is SNAPPED BACK to the start of its study day. A raw timestamp
 * would exclude earlier reviews from that same day while still listing the day
 * in `affectedDates`, so the DELETE+INSERT below would replace a complete row
 * with a partial one — silent data loss, and exactly the class of bug this
 * whole recompute-wholesale approach exists to avoid.
 */
export async function recomputeProgress(userId: string, languageId: string, since?: Date): Promise<Streak> {
  const { timezone, dayBoundaryHour } = await loadUserContext(userId)

  const cutoff = since
    ? studyDayRange(studyDateFor(since, timezone, dayBoundaryHour), timezone, dayBoundaryHour).start
    : undefined

  const logs = await db
    .select({
      id: srsReviewLogs.id,
      reviewedAt: srsReviewLogs.reviewedAt,
      rating: srsReviewLogs.rating,
      stateBefore: srsReviewLogs.stateBefore,
      stateAfter: srsReviewLogs.stateAfter,
      durationMs: srsReviewLogs.durationMs
    })
    .from(srsReviewLogs)
    .where(and(
      eq(srsReviewLogs.userId, userId),
      eq(srsReviewLogs.languageId, languageId),
      eq(srsReviewLogs.superseded, false),
      ...(cutoff ? [gte(srsReviewLogs.reviewedAt, cutoff)] : [])
    ))

  const aggregate = aggregateReviews(toAggregateEvents(logs), { timezone, dayBoundaryHour })

  await db.transaction(async (tx) => {
    if (aggregate.affectedDates.length > 0) {
      // Wholesale replacement of the touched days.
      await tx
        .delete(srsDailyStats)
        .where(and(
          eq(srsDailyStats.userId, userId),
          eq(srsDailyStats.languageId, languageId),
          inArray(srsDailyStats.localDate, aggregate.affectedDates)
        ))

      await tx.insert(srsDailyStats).values(
        aggregate.daily.map(d => ({
          userId,
          languageId,
          localDate: d.localDate,
          timezone: d.timezone,
          newCount: d.newCount,
          reviewCount: d.reviewCount,
          correctCount: d.correctCount,
          lapseCount: d.lapseCount,
          timeMs: d.timeMs,
          xpEarned: d.xpEarned
        }))
      )
    }

    if (aggregate.xp.length > 0) {
      // Idempotent on (userId, source, refId) — the dedupe index does the work.
      await tx
        .insert(xpEvents)
        .values(aggregate.xp.map(x => ({
          userId,
          languageId,
          source: x.source,
          refId: x.refId,
          amount: x.amount
        })))
        .onConflictDoNothing()
    }

    // user_xp is a cache of the sum, recomputed rather than incremented.
    const [totals] = await tx
      .select({ total: sql<number>`coalesce(sum(${xpEvents.amount}), 0)`.mapWith(Number) })
      .from(xpEvents)
      .where(and(eq(xpEvents.userId, userId), eq(xpEvents.languageId, languageId)))

    const totalXp = totals?.total ?? 0
    await tx
      .insert(userXp)
      .values({ userId, languageId, totalXp, level: xpToLevel(totalXp) })
      .onConflictDoUpdate({
        target: [userXp.userId, userXp.languageId],
        set: { totalXp, level: xpToLevel(totalXp), updatedAt: new Date() }
      })
  })

  return persistStreak(userId, languageId, timezone, dayBoundaryHour)
}

/** Rebuild the streak from the full set of study days. */
async function persistStreak(
  userId: string,
  languageId: string,
  timezone: string,
  dayBoundaryHour: number
): Promise<Streak> {
  const days = await db
    .select({ localDate: srsDailyStats.localDate })
    .from(srsDailyStats)
    .where(and(
      eq(srsDailyStats.userId, userId),
      eq(srsDailyStats.languageId, languageId),
      sql`${srsDailyStats.reviewCount} > 0`
    ))

  const [freezes] = await db
    .select({ available: sql<number>`count(*)`.mapWith(Number) })
    .from(streakFreezes)
    .where(and(eq(streakFreezes.userId, userId), isNull(streakFreezes.usedOnDate)))

  const today = studyDateFor(new Date(), timezone, dayBoundaryHour)
  const streak = computeStreak(days.map(d => d.localDate), {
    today,
    freezesAvailable: freezes?.available ?? 0
  })

  await db
    .insert(userStreaks)
    .values({
      userId,
      languageId,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDate: streak.lastActiveDate,
      timezoneAtLastActive: timezone,
      freezeCount: streak.freezesRemaining
    })
    .onConflictDoUpdate({
      target: [userStreaks.userId, userStreaks.languageId],
      set: {
        currentStreak: streak.currentStreak,
        // Never let a recompute shrink the record — it is a lifetime best.
        longestStreak: sql`greatest(${userStreaks.longestStreak}, ${streak.longestStreak})`,
        lastActiveDate: streak.lastActiveDate,
        timezoneAtLastActive: timezone,
        freezeCount: streak.freezesRemaining,
        updatedAt: new Date()
      }
    })

  return streak
}

/** Level curve: each level costs 100 XP more than the last. */
export function xpToLevel(totalXp: number): number {
  return Math.max(1, Math.floor((Math.sqrt(1 + (8 * totalXp) / 100) - 1) / 2) + 1)
}

/** Headline numbers for the progress page. All scoped to one user. */
export async function getSummary(userId: string): Promise<ProgressSummary> {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  const empty: ProgressSummary = {
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    started: 0,
    learned: 0,
    due: 0,
    dueCards: 0,
    learning: 0,
    newAvailable: 0
  }
  if (!language)
    return empty

  const [xp] = await db
    .select({ totalXp: userXp.totalXp, level: userXp.level })
    .from(userXp)
    .where(and(eq(userXp.userId, userId), eq(userXp.languageId, language.id)))
    .limit(1)

  const [streak] = await db
    .select({ current: userStreaks.currentStreak, longest: userStreaks.longestStreak })
    .from(userStreaks)
    .where(and(eq(userStreaks.userId, userId), eq(userStreaks.languageId, language.id)))
    .limit(1)

  const [cards] = await db
    .select({
      // Every card that EXISTS — i.e. every item started. Deliberately not
      // called "learned" any more: it counted a card seen once the same as one
      // genuinely retained, and sat directly above a coverage panel using the
      // stricter graduated-only definition. Two numbers, one page, contradicting
      // each other.
      started: sql<number>`count(*)`.mapWith(Number),
      // Graduated past the learning steps: the honest "learned".
      learned: sql<number>`count(*) filter (where ${srsCards.state} >= 2)`.mapWith(Number),
      // How many of those are on a learning step, for the caption. NOT a
      // headline: shown as a peer number it read as a second backlog, and this
      // page said "5 due · 21 in learning" while the list it linked to showed
      // 26. `due` itself now comes from `countDue` below — the one definition
      // every surface shares — rather than a fourth one written here.
      learning: sql<number>`count(*) filter (where ${srsCards.due} <= now() and ${srsCards.state} in (1, 3) and not ${srsCards.suspended})`.mapWith(Number)
    })
    .from(srsCards)
    .where(and(eq(srsCards.userId, userId), eq(srsCards.languageId, language.id)))

  // The canonical count, in items, exactly as the due list and Study report it.
  const due = await countDue(userId, language.id)

  const [unseen] = await db
    .select({ total: sql<number>`count(*)`.mapWith(Number) })
    .from(studyItemFacets)
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .leftJoin(srsCards, and(eq(srsCards.facetId, studyItemFacets.id), eq(srsCards.userId, userId)))
    .where(and(
      eq(studyItems.languageId, language.id),
      eq(studyItems.published, true),
      eq(studyItems.active, true),
      eq(studyItemFacets.enabled, true),
      isNull(srsCards.id)
    ))

  return {
    totalXp: xp?.totalXp ?? 0,
    level: xp?.level ?? 1,
    currentStreak: streak?.current ?? 0,
    longestStreak: streak?.longest ?? 0,
    started: cards?.started ?? 0,
    learned: cards?.learned ?? 0,
    due: due.items,
    dueCards: due.cards,
    learning: cards?.learning ?? 0,
    newAvailable: unseen?.total ?? 0
  }
}

/**
 * Kanji this user knows, for the "furigana over unknown kanji only" mode.
 *
 * "Known" = the card graduated past FSRS's learning steps (state 2 Review or
 * 3 Relearning). Relearning counts: you knew it well enough to be tested on a
 * long interval, and hiding ruby you were relying on mid-lapse would be a
 * strange punishment for having forgotten once.
 */
export async function getKnownKanji(userId: string, languageCode: string): Promise<KnownKanji> {
  const [language] = await db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, languageCode))
    .limit(1)
  if (!language)
    return { characters: [] }

  // Kanji AND kana. The set is "characters this reader can read", and it used
  // to hold only kanji — which was invisible while it drove furigana, since
  // kana never carry furigana anyway. It stopped being invisible the moment
  // romaji readings arrived: those go over kana too, so a set that cannot say
  // whether あ is known has nothing to filter on for exactly the characters
  // the romaji mode exists to help with.
  const rows = await db.execute(sql`
    select distinct c.character
    from ${srsCards} sc
    join ${studyItemFacets} f on f.id = sc.facet_id
    join ${studyItems} si on si.id = f.study_item_id
    join lateral (
      select k.character from ${kanji} k where k.id = si.kanji_id
      union all
      select ka.character from ${kana} ka where ka.id = si.kana_id
    ) c on true
    where sc.user_id = ${userId}
      and sc.language_id = ${language.id}
      and sc.state >= 2
  `)

  return { characters: (rows.rows ?? []).map(r => String((r as Record<string, unknown>).character)) }
}

/**
 * Coverage of a JLPT level.
 *
 * "Known" means the card graduated past FSRS's learning steps (state >= 2).
 * Counting anything merely SEEN would inflate the number precisely when it
 * matters — right after a big study session, when nothing has been retained yet.
 */
export async function getReadiness(userId: string, languageCode: string, levelCode: string): Promise<Readiness | null> {
  const [language] = await db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, languageCode))
    .limit(1)
  if (!language)
    return null

  const [level] = await db
    .select({ id: languageLevels.id, code: languageLevels.code })
    .from(languageLevels)
    .where(and(eq(languageLevels.languageId, language.id), eq(languageLevels.code, levelCode)))
    .limit(1)
  if (!level)
    return null

  const rows = await db
    .select({
      kind: studyItems.kind,
      total: sql<number>`count(distinct ${studyItemFacets.id})::int`,
      known: sql<number>`count(distinct ${studyItemFacets.id}) filter (where ${srsCards.state} >= 2)::int`,
      learning: sql<number>`count(distinct ${studyItemFacets.id}) filter (where ${srsCards.state} = 1)::int`
    })
    .from(studyItems)
    .innerJoin(studyItemFacets, eq(studyItemFacets.studyItemId, studyItems.id))
    .leftJoin(srsCards, and(eq(srsCards.facetId, studyItemFacets.id), eq(srsCards.userId, userId)))
    .where(and(
      eq(studyItems.languageId, language.id),
      eq(studyItems.levelId, level.id),
      eq(studyItems.published, true),
      eq(studyItems.active, true),
      eq(studyItemFacets.enabled, true)
    ))
    .groupBy(studyItems.kind)

  const coverage = rows.map(r => ({
    kind: r.kind,
    total: Number(r.total),
    known: Number(r.known),
    learning: Number(r.learning)
  }))

  const total = coverage.reduce((a, c) => a + c.total, 0)
  const known = coverage.reduce((a, c) => a + c.known, 0)

  // The weakest AREA, not the smallest count: a kind with 3 of 10 is worse off
  // than one with 200 of 1000, and telling someone to study the bigger pile
  // would be advice by volume rather than by need.
  const withRatio = coverage.filter(c => c.total > 0)
  const weakest = withRatio.length === 0
    ? null
    : withRatio.reduce((worst, c) => (c.known / c.total < worst.known / worst.total ? c : worst)).kind

  const grammarCount = coverage.find(c => c.kind === 'grammar')?.total ?? 0

  return {
    level: level.code,
    coverage,
    percent: total === 0 ? 0 : Math.round((known / total) * 1000) / 10,
    // Stated plainly rather than buried: a percentage of a partial curriculum
    // is not a percentage of the exam, and presenting it as one would be the
    // dishonest part of this feature.
    curriculumNote: grammarCount === 0
      ? `This app has no ${level.code} grammar yet, so the figure covers vocabulary and kanji only.`
      : `Measured against this app's ${level.code} content, not the full exam syllabus.`,
    weakest
  }
}
