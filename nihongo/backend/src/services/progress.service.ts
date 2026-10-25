import type { ActivityKind } from '@nihongo/shared/constants'
import type { QuestProgress, ReviewGoalCard } from '@nihongo/shared/lib'
import type { AggregateEvent, KnownKanji, ProgressSummary, Readiness, ReviewEvent, Streak } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import {
  kana,
  kanji,
  languageLevels,
  languages,
  learningActivities,
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
import { aggregateReviews, computeStreak, DEFAULT_DAY_BOUNDARY_HOUR, QUEST_XP, questProgress, questsFor, replay, reviewGoal, studyDateFor, studyDayRange, xpToLevel } from '@nihongo/shared/lib'
import { and, eq, gte, inArray, isNull, lt, sql } from 'drizzle-orm'

import { recomputeAchievements } from './achievements.service.js'
import { ghostBossHasCards } from './games.service.js'
import { countDue, loadPolicy, newWordsToday } from './srs.service.js'

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

export async function loadUserContext(userId: string): Promise<UserContext> {
  const [row] = await db
    .select({ timezone: users.timezone, dayBoundaryHour: userSettings.dayBoundaryHour })
    .from(users)
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1)

  return {
    timezone: row?.timezone ?? 'UTC',
    dayBoundaryHour: row?.dayBoundaryHour ?? DEFAULT_DAY_BOUNDARY_HOUR
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
  })

  return recomputeHabit(userId, languageId)
}

/**
 * Everything derived from WHETHER and HOW MUCH the learner did, not from
 * individual reviews: the XP total and the streak. Run after reviews and after
 * any learning activity — a lesson, a Speak session, a crossword.
 *
 * Wholesale, never incremented: the XP total is the sum of the keyed award
 * rows, the streak a fold over every study day. So it can run as often as it
 * likes, in any order, and land on the same answer.
 */
export async function recomputeHabit(userId: string, languageId: string): Promise<Streak> {
  const { timezone, dayBoundaryHour } = await loadUserContext(userId)

  // Today's quests: a finished one earns its XP once, keyed by quest and day.
  const { localDate, quests } = await todayQuests(userId, languageId)
  const done = quests.filter(q => q.done)
  if (done.length > 0) {
    await db
      .insert(xpEvents)
      .values(done.map(q => ({ userId, languageId, source: 'quest', refId: `${q.code}:${localDate}`, amount: QUEST_XP })))
      .onConflictDoNothing()
  }

  // user_xp is a cache of the sum, recomputed rather than incremented.
  const [totals] = await db
    .select({ total: sql<number>`coalesce(sum(${xpEvents.amount}), 0)`.mapWith(Number) })
    .from(xpEvents)
    .where(and(eq(xpEvents.userId, userId), eq(xpEvents.languageId, languageId)))

  const totalXp = totals?.total ?? 0
  await db
    .insert(userXp)
    .values({ userId, languageId, totalXp, level: xpToLevel(totalXp) })
    .onConflictDoUpdate({
      target: [userXp.userId, userXp.languageId],
      set: { totalXp, level: xpToLevel(totalXp), updatedAt: new Date() }
    })

  const streak = await persistStreak(userId, languageId, timezone, dayBoundaryHour)
  await recomputeAchievements(userId, languageId)
  return streak
}

/**
 * The cards behind today's review goal: every card that could have been owed
 * a review today. For a card already answered today, where it stood before
 * that first answer comes from replaying its log, the source of truth (the
 * log's own before-columns are not filled in). `reviewGoal` decides which
 * were waiting when the day began.
 */
async function reviewGoalCards(userId: string, languageId: string, day: { start: Date, end: Date }): Promise<ReviewGoalCard[]> {
  const rows = await db.execute<{ id: string, state: number, due: Date, created_at: Date, reviewed: boolean }>(sql`
    select c.id, c.state, c.due, c.created_at,
      exists (select 1 from srs_review_logs l where l.card_id = c.id and l.reviewed_at >= ${day.start} and l.reviewed_at < ${day.end}) as reviewed
    from srs_cards c
    join study_item_facets f on f.id = c.facet_id and f.enabled
    join study_items si on si.id = f.study_item_id and si.published and si.active
    where c.user_id = ${userId} and c.language_id = ${languageId} and not c.suspended
      and c.created_at < ${day.start}
      and (
        (c.state in (1, 2, 3) and c.due < ${day.end})
        or exists (select 1 from srs_review_logs l where l.card_id = c.id and l.reviewed_at >= ${day.start} and l.reviewed_at < ${day.end})
      )
  `)

  const answered = rows.rows.filter(r => r.reviewed).map(r => r.id)
  const before = new Map<string, { stateBefore: number, dueBefore: Date }>()
  if (answered.length > 0) {
    const [{ fsrsParams }, logs] = await Promise.all([
      loadPolicy(userId),
      db.select({ id: srsReviewLogs.id, cardId: srsReviewLogs.cardId, rating: srsReviewLogs.rating, reviewedAt: srsReviewLogs.reviewedAt, clientId: srsReviewLogs.clientId })
        .from(srsReviewLogs)
        .where(and(eq(srsReviewLogs.userId, userId), inArray(srsReviewLogs.cardId, answered), lt(srsReviewLogs.reviewedAt, day.end)))
    ])
    const byCard = new Map<string, typeof logs>()
    for (const log of logs)
      byCard.set(log.cardId, [...(byCard.get(log.cardId) ?? []), log])
    for (const [cardId, history] of byCard) {
      const at = new Map(history.map(h => [h.id, h.reviewedAt]))
      const { snapshots } = replay(history.map(h => ({ id: h.id, rating: h.rating as ReviewEvent['rating'], reviewedAt: h.reviewedAt, clientId: h.clientId })), fsrsParams)
      const first = snapshots.find(snap => at.get(snap.logId)! >= day.start)
      if (first)
        before.set(cardId, { stateBefore: first.stateBefore, dueBefore: first.dueBefore })
    }
  }

  return rows.rows.map(r => ({
    state: Number(r.state),
    due: new Date(r.due),
    createdAt: new Date(r.created_at),
    firstToday: r.reviewed ? before.get(r.id) ?? { stateBefore: null, dueBefore: null } : null
  }))
}

/**
 * Today's quests and how far each has got, from today's reviews and
 * activities, so it can be asked at any moment and agrees with itself.
 *
 * The review goal is fixed by the reviews waiting when the day began
 * (`reviewGoal`): it used to be done-plus-still-due, which grew every time a
 * missed card came back, so the owner saw 15/15 one hour and 26/26 the next.
 */
export async function todayQuests(userId: string, languageId: string, now = new Date()): Promise<{ localDate: string, quests: QuestProgress[] }> {
  const { timezone, dayBoundaryHour } = await loadUserContext(userId)
  const localDate = studyDateFor(now, timezone, dayBoundaryHour)
  const day = studyDayRange(localDate, timezone, dayBoundaryHour)
  const [activities, cards, newWords, ghosts] = await Promise.all([
    db.select({ kind: learningActivities.kind }).from(learningActivities).where(and(eq(learningActivities.userId, userId), eq(learningActivities.languageId, languageId), eq(learningActivities.localDate, localDate))),
    reviewGoalCards(userId, languageId, day),
    // Words, as the daily limit counts them: a second card of a word met
    // before is practice, not a new word.
    newWordsToday(userId, languageId, now),
    // Whether this week's ghost boss has anyone to face, by its own rule.
    ghostBossHasCards(userId, languageId)
  ])
  const goal = reviewGoal(cards, day)
  return {
    localDate,
    quests: questProgress(questsFor(userId, localDate, goal.available, { ghosts }), {
      reviews: goal.reviewed,
      newWords,
      activities: activities.map(a => ({ kind: a.kind as ActivityKind }))
    })
  }
}

/**
 * Every day the learner studied: a day with a review, or with any learning
 * activity. Reviews alone made a day of Speak and lessons count for nothing.
 */
async function studyDays(userId: string, languageId: string): Promise<string[]> {
  const rows = await db.execute<{ local_date: string }>(sql`
    select local_date::text as local_date from ${srsDailyStats}
    where ${srsDailyStats.userId} = ${userId} and ${srsDailyStats.languageId} = ${languageId} and ${srsDailyStats.reviewCount} > 0
    union
    select local_date::text from ${learningActivities}
    where ${learningActivities.userId} = ${userId} and ${learningActivities.languageId} = ${languageId}
  `)
  return rows.rows.map(r => r.local_date)
}

/** Rebuild the streak from the full set of study days. */
async function persistStreak(
  userId: string,
  languageId: string,
  timezone: string,
  dayBoundaryHour: number
): Promise<Streak> {
  const days = await studyDays(userId, languageId)

  // Granted freezes only — earned ones are the fold's own output, below.
  const [granted] = await db
    .select({ available: sql<number>`count(*)`.mapWith(Number) })
    .from(streakFreezes)
    .where(and(eq(streakFreezes.userId, userId), eq(streakFreezes.reason, 'admin'), isNull(streakFreezes.usedOnDate)))

  const today = studyDateFor(new Date(), timezone, dayBoundaryHour)
  const streak = computeStreak(days, {
    today,
    freezesAvailable: granted?.available ?? 0
  })

  // Earned freezes are rebuilt wholesale from the fold — which ones exist, and
  // which day each covered — so a replay that fills a past day can hand one
  // back, and nothing is ever spent twice.
  await db.transaction(async (tx) => {
    await tx
      .delete(streakFreezes)
      .where(and(eq(streakFreezes.userId, userId), eq(streakFreezes.languageId, languageId), eq(streakFreezes.reason, 'earned')))
    if (streak.freezes.length > 0) {
      await tx.insert(streakFreezes).values(streak.freezes.map(f => ({
        userId,
        languageId,
        reason: 'earned',
        earnedOn: f.earnedOn,
        usedOnDate: f.usedOn
      })))
    }
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

/**
 * Whether a lesson (kana or grammar) was finished today, in the learner's own
 * study day, and which day that is. The same log the "Finish a lesson" quest reads.
 */
export async function lessonDoneToday(userId: string, languageId: string, now = new Date()): Promise<{ done: boolean, day: string }> {
  const { timezone, dayBoundaryHour } = await loadUserContext(userId)
  const day = studyDateFor(now, timezone, dayBoundaryHour)
  const [row] = await db
    .select({ id: learningActivities.id })
    .from(learningActivities)
    .where(and(
      eq(learningActivities.userId, userId),
      eq(learningActivities.languageId, languageId),
      eq(learningActivities.localDate, day),
      inArray(learningActivities.kind, ['lesson', 'kana-lesson'])
    ))
    .limit(1)
  return { done: row !== undefined, day }
}

/** Whether the learner has done anything counted today, in their own study day. */
export async function studiedToday(userId: string, languageId: string, now = new Date()): Promise<boolean> {
  const { timezone, dayBoundaryHour } = await loadUserContext(userId)
  const today = studyDateFor(now, timezone, dayBoundaryHour)
  const [row] = await db
    .select({ reviews: srsDailyStats.reviewCount })
    .from(srsDailyStats)
    .where(and(eq(srsDailyStats.userId, userId), eq(srsDailyStats.languageId, languageId), eq(srsDailyStats.localDate, today)))
    .limit(1)
  if ((row?.reviews ?? 0) > 0)
    return true
  const [activity] = await db
    .select({ id: learningActivities.id })
    .from(learningActivities)
    .where(and(eq(learningActivities.userId, userId), eq(learningActivities.languageId, languageId), eq(learningActivities.localDate, today)))
    .limit(1)
  return activity !== undefined
}

/** Headline numbers for the progress page. All scoped to one user. */
export async function getSummary(userId: string, languageCode = 'ja'): Promise<ProgressSummary> {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, languageCode)).limit(1)
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
    newAvailable: 0,
    newLevel: ''
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

  // What New words can still hand out, at the learner's level, in ITEMS. It
  // was every card at every level — 33,691 — including kinds New words never
  // gives (grammar comes through lessons, Speak through its sessions), which
  // said nothing anyone could act on.
  const [settings] = await db.select({ level: userSettings.studyLevel }).from(userSettings).where(eq(userSettings.userId, userId)).limit(1)
  const newLevel = settings?.level ?? ''
  const unseenRows = await db.execute<{ total: number }>(sql`
    select count(*)::int as total
    from study_items si
    left join language_levels l on l.id = si.level_id
    where si.language_id = ${language.id} and si.published and si.active
      and si.kind not in ('grammar', 'speak')
      and (${newLevel} = '' or l.code = ${newLevel})
      and not exists (
        select 1 from study_item_facets f join srs_cards c on c.facet_id = f.id
        where f.study_item_id = si.id and c.user_id = ${userId})`)
  const unseen = unseenRows.rows[0]

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
    newAvailable: Number(unseen?.total ?? 0),
    newLevel
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

  // Conversations and Speak are practised, not reviewed: doing one makes no
  // review card, so counting cards said "0 conversations" beside a
  // Conversations page full of ticks. Those two count what was done instead.
  const [dialogueDone, speakDone] = await Promise.all([
    db.execute<{ total: number, done: number }>(sql`
      select count(*)::int as total,
        count(*) filter (where exists (
          select 1 from learning_activities a
          where a.user_id = ${userId} and a.kind = 'conversation' and a.ref_id = d.code))::int as done
      from dialogues d where d.language_id = ${language.id} and d.level_id = ${level.id} and d.published`),
    db.execute<{ total: number, done: number }>(sql`
      select count(*)::int as total,
        count(*) filter (where exists (
          select 1 from speak_progress p where p.user_id = ${userId} and p.session_id = s.id))::int as done
      from speak_sessions s where s.language_id = ${language.id} and s.level_id = ${level.id} and s.published`)
  ])
  const practised = (kind: string, r?: { total: number, done: number }) =>
    ({ kind, total: Number(r?.total ?? 0), known: Number(r?.done ?? 0), learning: 0, unit: 'done' as const })

  const coverage = [
    ...rows
      .filter(r => r.kind !== 'dialogue' && r.kind !== 'speak')
      .map(r => ({
        kind: r.kind,
        total: Number(r.total),
        known: Number(r.known),
        learning: Number(r.learning),
        unit: 'cards' as const
      })),
    practised('dialogue', dialogueDone.rows[0]),
    practised('speak', speakDone.rows[0])
  ].filter(c => c.total > 0).sort((a, b) => a.kind.localeCompare(b.kind))

  // The percentage is of cards: sessions and conversations are another unit.
  const cards = coverage.filter(c => c.unit === 'cards')
  const total = cards.reduce((a, c) => a + c.total, 0)
  const known = cards.reduce((a, c) => a + c.known, 0)

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
