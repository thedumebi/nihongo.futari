import type { ActivityKind } from '@nihongo/shared/constants'
import type { QuestProgress, ReviewGoalCard } from '@nihongo/shared/lib'
import type { AggregateEvent, KnownKanji, LearnerHeadline, LearnerProfile, ProgressSummary, Readiness, ReviewEvent, Streak, StreakCalendar, StreakDay, UserContext, UserStreak } from '@nihongo/shared/types'

import { pino } from '@nihongo/shared'
import { ACTIVITY_KINDS } from '@nihongo/shared/constants'
import db from '@nihongo/shared/db'
import {
  friendships,
  languageLevels,
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
import { aggregateReviews, cardTotals, computeStreak, DEFAULT_DAY_BOUNDARY_HOUR, QUEST_XP, questProgress, QUESTS_FROM, questsFor, replay, reviewGoal, studyDateFor, studyDayRange, xpToLevel } from '@nihongo/shared/lib'
import { and, eq, getTableColumns, gte, inArray, isNull, lt, sql } from 'drizzle-orm'
import { DateTime } from 'luxon'

import { inRequestScope, perRequest } from '@/lib/request-scope.js'

import { recomputeAchievements } from './achievements.service.js'
import { catalogue, charactersOf, itemCharacters, languageByCode } from './catalogue.service.js'
import { ghostBossHasCards } from './games.service.js'
import { learnerState } from './learner-state.service.js'
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

export async function loadUserContext(userId: string): Promise<UserContext> {
  const { timezone, settings } = await learnerProfile(userId)
  return {
    timezone: timezone ?? 'UTC',
    dayBoundaryHour: settings?.dayBoundaryHour ?? DEFAULT_DAY_BOUNDARY_HOUR
  }
}

/** The level the learner chose to study, or null for none; once per request. */
export async function studyLevelOf(userId: string): Promise<string | null> {
  return (await learnerProfile(userId)).settings?.studyLevel ?? null
}

/**
 * The learner's clock and settings in one read, shared by everything in the
 * request: Today used to ask for them four times over.
 */
export async function learnerProfile(userId: string): Promise<LearnerProfile> {
  return perRequest(`profile:${userId}`, () => readLearnerProfile(userId))
}

async function readLearnerProfile(userId: string): Promise<LearnerProfile> {
  // A left-joined nested object comes back null when the row is missing.
  const [row] = await db
    .select({
      timezone: users.timezone,
      settings: getTableColumns(userSettings)
    })
    .from(users)
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1)

  return row ?? { timezone: null, settings: null }
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
export async function recomputeProgress(userId: string, languageId: string, since?: Date, days: Iterable<string> = []): Promise<Streak> {
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
      // Keyed by (userId, source, refId), so a replay never adds twice. The
      // amount is recomputed from the log, so a rebuild corrects one written
      // wrong (every review once paid as a new card) rather than keeping it.
      await tx
        .insert(xpEvents)
        .values(aggregate.xp.map(x => ({
          userId,
          languageId,
          source: x.source,
          refId: x.refId,
          amount: x.amount
        })))
        .onConflictDoUpdate({
          target: [xpEvents.userId, xpEvents.source, xpEvents.refId],
          set: { amount: sql`excluded.amount` },
          setWhere: sql`${xpEvents.amount} is distinct from excluded.amount`
        })
    }
  })

  // Quests are scored for the days the batch's own answers and activities
  // fell on, not every day rebuilt.
  return recomputeHabit(userId, languageId, days)
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
export async function recomputeHabit(userId: string, languageId: string, days: Iterable<string> = []): Promise<Streak> {
  const { timezone, dayBoundaryHour } = await loadUserContext(userId)

  // The quests of today and of every other day this rebuild touched since
  // there were quests: a day studied offline earns its quests when it
  // arrives, not never. A finished quest earns its XP once, keyed by quest
  // and day.
  const today = studyDateFor(new Date(), timezone, dayBoundaryHour)
  const questDays = [...new Set([...days].filter(d => d >= QUESTS_FROM && d < today))].sort().concat(today)
  const ghosts = ghostBossHasCards(userId, languageId)
  const pastDays = questDays.slice(0, -1)
  // Read-only, so the days share one read of the learner's cards and profile.
  const [scored, paid] = await inRequestScope(() => Promise.all([
    Promise.all(questDays.map(d => questsOn(userId, languageId, d, ghosts))),
    paidQuests(userId, languageId, pastDays)
  ]))
  // A past day is drawn again from the cards as they are now, which may draw
  // a different quest than the learner saw: it never pays more quests than
  // one day's draw, counting what it already paid.
  const done = scored.flatMap(({ localDate, quests }) => {
    const finished = quests.filter(q => q.done).map(q => ({ localDate, code: q.code }))
    const already = paid.get(localDate)
    if (!already)
      return finished
    return finished.filter(q => !already.has(q.code)).slice(0, Math.max(0, quests.length - already.size))
  })
  if (done.length > 0) {
    await db
      .insert(xpEvents)
      .values(done.map(q => ({ userId, languageId, source: 'quest', refId: `${q.code}:${q.localDate}`, amount: QUEST_XP })))
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

  const { streak, studyDates, freezesAvailable } = await persistStreak(userId, languageId, timezone, dayBoundaryHour)
  // Past days arriving can move an unlock earlier.
  await recomputeAchievements(userId, languageId, { studyDates, freezesAvailable, timezone, dayBoundaryHour }, { redate: [...days].some(d => d < today) })
  return streak
}

/** The quest codes already paid on each of some study days. */
async function paidQuests(userId: string, languageId: string, days: string[]): Promise<Map<string, Set<string>>> {
  const paid = new Map<string, Set<string>>()
  if (days.length === 0)
    return paid
  // A quest's ref is `code:localDate`.
  const day = sql<string>`split_part(${xpEvents.refId}, ':', 2)`
  const rows = await db
    .select({ code: sql<string>`split_part(${xpEvents.refId}, ':', 1)`, day })
    .from(xpEvents)
    .where(and(eq(xpEvents.userId, userId), eq(xpEvents.languageId, languageId), eq(xpEvents.source, 'quest'), inArray(day, days)))
  for (const row of rows)
    paid.set(row.day, (paid.get(row.day) ?? new Set()).add(row.code))
  return paid
}

/**
 * The cards behind a day's review goal: every card that could have been owed
 * a review that day. Where a card stood when the day began comes from
 * replaying its log, the source of truth (the log's own before-columns are
 * not filled in), for every card answered since: on the day itself that is
 * the state before its first answer, and for an earlier day, a card answered
 * only afterwards was where that later first answer found it. `reviewGoal`
 * decides which were waiting when the day began.
 */
async function reviewGoalCards(userId: string, languageId: string, day: { start: Date, end: Date }): Promise<ReviewGoalCard[]> {
  // The history, up to now, of every card answered since the day began (for
  // today, up to the day's end).
  const until = new Date(Math.max(day.end.getTime(), Date.now()))
  const answeredSince = db.select({ cardId: srsReviewLogs.cardId }).from(srsReviewLogs).where(and(eq(srsReviewLogs.userId, userId), eq(srsReviewLogs.languageId, languageId), gte(srsReviewLogs.reviewedAt, day.start), lt(srsReviewLogs.reviewedAt, until)))
  const [state, logs] = await Promise.all([
    learnerState(userId, languageId),
    db.select({ id: srsReviewLogs.id, cardId: srsReviewLogs.cardId, rating: srsReviewLogs.rating, reviewedAt: srsReviewLogs.reviewedAt, clientId: srsReviewLogs.clientId })
      .from(srsReviewLogs)
      .where(and(eq(srsReviewLogs.userId, userId), eq(srsReviewLogs.languageId, languageId), inArray(srsReviewLogs.cardId, answeredSince), lt(srsReviewLogs.reviewedAt, until)))
  ])

  const byCard = new Map<string, typeof logs>()
  for (const log of logs)
    byCard.set(log.cardId, [...(byCard.get(log.cardId) ?? []), log])

  // The first answer at or after the day's start, and the card before it.
  const firstSince = new Map<string, { at: Date, stateBefore: number, dueBefore: Date }>()
  if (byCard.size > 0) {
    const { fsrsParams } = await loadPolicy(userId)
    for (const [cardId, history] of byCard) {
      const at = new Map(history.map(h => [h.id, h.reviewedAt]))
      const { snapshots } = replay(history.map(h => ({ id: h.id, rating: h.rating as ReviewEvent['rating'], reviewedAt: h.reviewedAt, clientId: h.clientId })), fsrsParams)
      const first = snapshots.find(snap => at.get(snap.logId)! >= day.start)
      if (first)
        firstSince.set(cardId, { at: at.get(first.logId)!, stateBefore: first.stateBefore, dueBefore: first.dueBefore })
    }
  }
  const reviewed = new Set([...byCard.keys()].filter(id => byCard.get(id)!.some(h => h.reviewedAt >= day.start && h.reviewedAt < day.end)))

  return [...state.cards.values()].flatMap((c): ReviewGoalCard[] => {
    // A card answered offline is made on the server when it syncs, but the
    // learner had it from their first answer.
    const createdAt = c.firstSeenAt && c.firstSeenAt < c.createdAt ? c.firstSeenAt : c.createdAt
    if (!c.live || c.suspended || createdAt >= day.start)
      return []
    const first = firstSince.get(c.id)
    if (reviewed.has(c.id))
      return [{ state: c.state, due: c.due, createdAt, firstToday: first && first.at < day.end ? { stateBefore: first.stateBefore, dueBefore: first.dueBefore } : { stateBefore: null, dueBefore: null } }]
    // Not answered that day: as it stood then, which for a card answered
    // since is where that answer found it.
    const then = first ? { state: first.stateBefore, due: first.dueBefore } : { state: c.state, due: c.due }
    return then.state >= 1 && then.state <= 3 && then.due < day.end ? [{ ...then, createdAt, firstToday: null }] : []
  })
}

/** The kinds of activity logged on one study day, once per request. */
function activitiesOn(userId: string, languageId: string, localDate: string): Promise<ActivityKind[]> {
  return perRequest(`activities:${userId}:${languageId}:${localDate}`, async () => {
    const rows = await db.select({ kind: learningActivities.kind }).from(learningActivities).where(and(eq(learningActivities.userId, userId), eq(learningActivities.languageId, languageId), eq(learningActivities.localDate, localDate)))
    return rows.map(r => r.kind as ActivityKind)
  })
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
  return questsOn(userId, languageId, studyDateFor(now, timezone, dayBoundaryHour), ghostBossHasCards(userId, languageId))
}

/**
 * One study day's quests and how far each got, today's or an earlier one's:
 * every input is that day's (its reviews, activities and new words, and the
 * cards as they stood when it began). Only whether the ghost boss has anyone
 * is today's, as nothing records it for a past day.
 */
async function questsOn(userId: string, languageId: string, localDate: string, ghostsHas: Promise<boolean>): Promise<{ localDate: string, quests: QuestProgress[] }> {
  const { timezone, dayBoundaryHour } = await loadUserContext(userId)
  const day = studyDayRange(localDate, timezone, dayBoundaryHour)
  const [activities, cards, newWords, ghosts] = await Promise.all([
    activitiesOn(userId, languageId, localDate),
    reviewGoalCards(userId, languageId, day),
    // Words, as the daily limit counts them: a second card of a word met
    // before is practice, not a new word.
    newWordsToday(userId, languageId, day.start),
    ghostsHas
  ])
  const goal = reviewGoal(cards, day)
  return {
    localDate,
    quests: questProgress(questsFor(userId, localDate, goal.available, { ghosts }), {
      reviews: goal.reviewed,
      newWords,
      activities: activities.map(kind => ({ kind }))
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

/** A streak folded from the study days, with the days and the granted freezes it was folded from. */
interface StreakFold { streak: Streak, studyDates: string[], freezesAvailable: number }

/**
 * The streak as of `today`, folded from every study day: what is stored, and
 * what the calendar draws. Granted freezes are read in; earned ones are the
 * fold's own output.
 */
async function foldStreak(userId: string, languageId: string, today: string): Promise<StreakFold> {
  const [days, [granted]] = await Promise.all([
    studyDays(userId, languageId),
    db
      .select({ available: sql<number>`count(*)`.mapWith(Number) })
      .from(streakFreezes)
      .where(and(eq(streakFreezes.userId, userId), eq(streakFreezes.reason, 'admin'), isNull(streakFreezes.usedOnDate)))
  ])
  const freezesAvailable = granted?.available ?? 0
  return { streak: computeStreak(days, { today, freezesAvailable }), studyDates: days, freezesAvailable }
}

/** Rebuild the streak from the full set of study days. */
async function persistStreak(
  userId: string,
  languageId: string,
  timezone: string,
  dayBoundaryHour: number
): Promise<StreakFold> {
  const today = studyDateFor(new Date(), timezone, dayBoundaryHour)
  const { streak, studyDates: days, freezesAvailable } = await foldStreak(userId, languageId, today)

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
      }))).onConflictDoUpdate({
        // Two rebuilds at once (Today and the summary, both refreshing a
        // stale streak) each delete, then each insert the same fold: the
        // second agrees with the first rather than failing on the unique day.
        target: [streakFreezes.userId, streakFreezes.languageId, streakFreezes.reason, streakFreezes.earnedOn],
        set: { usedOnDate: sql`excluded.used_on_date`, updatedAt: new Date() }
      })
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
      freezeCount: streak.freezesRemaining,
      // Set here, not by the column's now(): the column has no zone, so a
      // database outside UTC would write a time `freshStreaks` misreads.
      updatedAt: new Date()
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

  return { streak, studyDates: days, freezesAvailable }
}

/** How long a rebuild that failed is left alone before a read tries it again. */
const REBUILD_COOLDOWN_MS = 10 * 60 * 1000
/** When each failed rebuild, by learner and language, may be tried again. */
const rebuildFailedUntil = new Map<string, number>()

/**
 * The learner's stored streaks, each brought up to their study day today.
 *
 * `user_streaks` is rebuilt when the learner does something, so a learner who
 * stops kept the streak of their last study day for as long as they stayed
 * away: Today, the reminders and the weekly email all said "29-day streak"
 * days after it had ended. A row last rebuilt on an earlier study day is
 * rebuilt here before it is read, which is the same fold over the same days,
 * only with a later today: at most once a day per language, since the
 * rebuild marks the row as of today.
 */
export async function freshStreaks(userId: string, languageId?: string): Promise<Array<Pick<UserStreak, 'languageId' | 'currentStreak' | 'longestStreak' | 'freezeCount'>>> {
  return perRequest(`streaks:${userId}:${languageId ?? '*'}`, async () => {
    const scope = languageId ? and(eq(userStreaks.userId, userId), eq(userStreaks.languageId, languageId)) : eq(userStreaks.userId, userId)
    const read = () => db
      .select({ languageId: userStreaks.languageId, currentStreak: userStreaks.currentStreak, longestStreak: userStreaks.longestStreak, freezeCount: userStreaks.freezeCount, updatedAt: userStreaks.updatedAt })
      .from(userStreaks)
      .where(scope)
    const rows = await read()
    if (rows.length === 0)
      return []
    const { timezone, dayBoundaryHour } = await loadUserContext(userId)
    const today = studyDateFor(new Date(), timezone, dayBoundaryHour)
    const stale = rows.filter(r => studyDateFor(r.updatedAt, timezone, dayBoundaryHour) !== today)
    if (stale.length === 0)
      return rows.map(({ updatedAt: _, ...r }) => r)
    for (const r of stale) {
      // A rebuild that fails leaves the stored row as it was: Today and the
      // reminders still answer, with yesterday's number, rather than not at all.
      // It is then left alone for a while, not retried on every read.
      const key = `${userId}:${r.languageId}`
      if ((rebuildFailedUntil.get(key) ?? 0) > Date.now())
        continue
      try {
        await persistStreak(userId, r.languageId, timezone, dayBoundaryHour)
        rebuildFailedUntil.delete(key)
      } catch (err) {
        rebuildFailedUntil.set(key, Date.now() + REBUILD_COOLDOWN_MS)
        pino.warn({ err, userId, languageId: r.languageId }, 'Rebuilding a stale streak failed; reading it as stored')
      }
    }
    return (await read()).map(({ updatedAt: _, ...r }) => r)
  })
}

/**
 * The longest live streak across the learner's languages, brought up to today:
 * what a reminder quotes. Never throws: a reminder loop goes on to the next
 * learner, and this one's message goes out without a streak.
 */
export async function currentStreakOf(userId: string): Promise<number> {
  try {
    return Math.max(0, ...(await freshStreaks(userId)).map(s => s.currentStreak))
  } catch (err) {
    pino.warn({ err, userId }, 'Reading the streak failed; quoting none')
    return 0
  }
}

/**
 * One month of the streak calendar: every day in it that has something to
 * show, with what was done, and the streak as it stands today.
 *
 * Reads only the month, plus the stored streak (brought up to today by
 * `freshStreaks`) and its earned freezes, which the same rebuild writes: no
 * fold over the whole history to draw thirty days.
 */
export async function streakCalendar(userId: string, languageCode: string, month?: string): Promise<StreakCalendar | null> {
  const language = await languageByCode(languageCode)
  if (!language)
    return null
  const { timezone, dayBoundaryHour } = await loadUserContext(userId)
  const today = studyDateFor(new Date(), timezone, dayBoundaryHour)
  const shown = month ?? today.slice(0, 7)
  const from = `${shown}-01`
  const until = DateTime.fromISO(from, { zone: 'utc' }).plus({ months: 1 }).toISODate()!
  const mine = (table: typeof srsDailyStats | typeof learningActivities) => and(eq(table.userId, userId), eq(table.languageId, language.id))

  // First: a stale streak's rebuild rewrites the earned freezes read below.
  const [stored] = await freshStreaks(userId, language.id)
  const [freezes, stats, activities, [first]] = await Promise.all([
    db
      .select({ earnedOn: sql<string | null>`${streakFreezes.earnedOn}::text`, usedOn: sql<string | null>`${streakFreezes.usedOnDate}::text` })
      .from(streakFreezes)
      .where(and(eq(streakFreezes.userId, userId), eq(streakFreezes.languageId, language.id), eq(streakFreezes.reason, 'earned'))),
    db
      .select({ localDate: sql<string>`${srsDailyStats.localDate}::text`, reviews: srsDailyStats.reviewCount, newCards: srsDailyStats.newCount, reviewMs: srsDailyStats.timeMs })
      .from(srsDailyStats)
      .where(and(mine(srsDailyStats), gte(srsDailyStats.localDate, from), lt(srsDailyStats.localDate, until))),
    db
      .select({ localDate: sql<string>`${learningActivities.localDate}::text`, kind: learningActivities.kind, count: sql<number>`count(*)`.mapWith(Number) })
      .from(learningActivities)
      .where(and(mine(learningActivities), gte(learningActivities.localDate, from), lt(learningActivities.localDate, until)))
      .groupBy(learningActivities.localDate, learningActivities.kind)
      .orderBy(learningActivities.kind),
    // The first study day, by the rule `studyDays` counts by.
    db.execute<{ first: string | null }>(sql`
      select least(
        (select min(local_date) from ${srsDailyStats} where ${mine(srsDailyStats)} and ${srsDailyStats.reviewCount} > 0),
        (select min(local_date) from ${learningActivities} where ${mine(learningActivities)})
      )::text as first
    `).then(r => r.rows)
  ])

  const inMonth = (d: string | null): d is string => d !== null && d >= from && d < until
  const used = new Set(freezes.map(f => f.usedOn).filter(inMonth))
  const earned = new Set(freezes.map(f => f.earnedOn).filter(inMonth))
  const statsOn = new Map(stats.map(s => [s.localDate, s]))
  const activitiesOn = new Map<string, StreakDay['activities']>()
  for (const a of activities) {
    if (isActivityKind(a.kind))
      activitiesOn.set(a.localDate, [...(activitiesOn.get(a.localDate) ?? []), { kind: a.kind, count: a.count }])
  }
  // Studied, as `studyDays` counts it: a review, or any learning activity.
  const studied = (date: string) => (statsOn.get(date)?.reviews ?? 0) > 0 || activitiesOn.has(date)

  const dates = [...new Set([...used, ...earned, ...statsOn.keys(), ...activitiesOn.keys()])].sort()
  return {
    month: shown,
    today,
    firstDay: first?.first ?? null,
    currentStreak: stored?.currentStreak ?? 0,
    longestStreak: stored?.longestStreak ?? 0,
    freezes: stored?.freezeCount ?? 0,
    days: dates.map((date) => {
      const day = statsOn.get(date)
      return {
        date,
        studied: studied(date),
        reviews: day?.reviews ?? 0,
        newCards: day?.newCards ?? 0,
        reviewMs: day?.reviewMs ?? 0,
        activities: activitiesOn.get(date) ?? [],
        freezeUsed: used.has(date),
        freezeEarned: earned.has(date)
      }
    })
  }
}

function isActivityKind(kind: string): kind is ActivityKind {
  return (ACTIVITY_KINDS as readonly string[]).includes(kind)
}

/**
 * Whether a lesson (kana or grammar) was finished today, in the learner's own
 * study day, and which day that is. The same log the "Finish a lesson" quest reads.
 */
export async function lessonDoneToday(userId: string, languageId: string, now = new Date()): Promise<{ done: boolean, day: string }> {
  const { timezone, dayBoundaryHour } = await loadUserContext(userId)
  const day = studyDateFor(now, timezone, dayBoundaryHour)
  const kinds = await activitiesOn(userId, languageId, day)
  return { done: kinds.some(kind => kind === 'lesson' || kind === 'kana-lesson'), day }
}

/**
 * XP, streak, the study day's reviews and pending friend requests, once per
 * request: four one-row reads that Today used to make one at a time.
 */
export async function learnerHeadline(userId: string, languageId: string, localDate: string): Promise<LearnerHeadline> {
  return perRequest(`headline:${userId}:${languageId}:${localDate}`, async () => {
    // The stored streak is as of the last study day; bring it up to today.
    await freshStreaks(userId, languageId)
    // Left joins from the user's own row, so every part is null, not missing,
    // when it has not been written yet.
    const [row] = await db
      .select({
        xp: { totalXp: userXp.totalXp, level: userXp.level },
        streak: { currentStreak: userStreaks.currentStreak, longestStreak: userStreaks.longestStreak, freezeCount: userStreaks.freezeCount },
        reviewsToday: srsDailyStats.reviewCount,
        friendRequests: sql<number>`(select count(*) from ${friendships} where ${friendships.addresseeId} = ${users.id} and ${friendships.status} = 'pending')`.mapWith(Number)
      })
      .from(users)
      .leftJoin(userXp, and(eq(userXp.userId, users.id), eq(userXp.languageId, languageId)))
      .leftJoin(userStreaks, and(eq(userStreaks.userId, users.id), eq(userStreaks.languageId, languageId)))
      .leftJoin(srsDailyStats, and(eq(srsDailyStats.userId, users.id), eq(srsDailyStats.languageId, languageId), eq(srsDailyStats.localDate, localDate)))
      .where(eq(users.id, userId))
      .limit(1)
    return row ?? { xp: null, streak: null, reviewsToday: null, friendRequests: 0 }
  })
}

/** `learnerHeadline` for the learner's study day at `now`. */
export async function headlineToday(userId: string, languageId: string, now = new Date()): Promise<LearnerHeadline> {
  const { timezone, dayBoundaryHour } = await loadUserContext(userId)
  return learnerHeadline(userId, languageId, studyDateFor(now, timezone, dayBoundaryHour))
}

/** Whether the learner has done anything counted today, in their own study day. */
export async function studiedToday(userId: string, languageId: string, now = new Date()): Promise<boolean> {
  const { timezone, dayBoundaryHour } = await loadUserContext(userId)
  const today = studyDateFor(now, timezone, dayBoundaryHour)
  if (((await learnerHeadline(userId, languageId, today)).reviewsToday ?? 0) > 0)
    return true
  return (await activitiesOn(userId, languageId, today)).length > 0
}

/** Headline numbers for the progress page. All scoped to one user. */
export async function getSummary(userId: string, languageCode = 'ja'): Promise<ProgressSummary> {
  const language = await languageByCode(languageCode)
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

  const [{ xp, streak }, learner, due, studyLevel, cat] = await Promise.all([
    headlineToday(userId, language.id),
    learnerState(userId, language.id),
    // The canonical count, in items, exactly as the due list and Study report it.
    countDue(userId, language.id),
    studyLevelOf(userId),
    catalogue(language.id)
  ])
  const itemStates = learner.itemStates
  const cards = cardTotals(learner, new Date())

  // What New words can still hand out, at the learner's level, in ITEMS. It
  // was every card at every level — 33,691 — including kinds New words never
  // gives (grammar comes through lessons, Speak through its sessions), which
  // said nothing anyone could act on. Items never met: no card on any facet.
  const newLevel = studyLevel ?? ''
  const levelId = cat.levels.find(l => l.code === newLevel)?.id
  const unseen = cat.items.filter(item =>
    item.kind !== 'grammar' && item.kind !== 'speak'
    && (newLevel === '' || (item.levelId !== null && item.levelId === levelId))
    && !itemStates.has(item.id)).length

  return {
    totalXp: xp?.totalXp ?? 0,
    level: xp?.level ?? 1,
    currentStreak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
    started: cards.started,
    learned: cards.learned,
    due: due.items,
    dueCards: due.cards,
    learning: cards.learning,
    newAvailable: unseen,
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
  const language = await languageByCode(languageCode)
  if (!language)
    return { characters: [] }

  // Kanji AND kana. The set is "characters this reader can read", and it used
  // to hold only kanji — which was invisible while it drove furigana, since
  // kana never carry furigana anyway. It stopped being invisible the moment
  // romaji readings arrived: those go over kana too, so a set that cannot say
  // whether あ is known has nothing to filter on for exactly the characters
  // the romaji mode exists to help with.
  const [{ knownKanji, knownKana }, characters] = await Promise.all([learnerState(userId, language.id), itemCharacters(language.id)])
  const ids = [...knownKanji, ...knownKana]
  // An item added since the map loaded is read now, so none is left out.
  const late = await charactersOf(ids.filter(id => !characters.has(id)))
  const known = new Set<string>()
  for (const id of ids) {
    const character = characters.get(id) ?? late.get(id)
    if (character)
      known.add(character)
  }
  // A set to the reader; sorted so the same learner reads the same list.
  return { characters: [...known].sort() }
}

/**
 * Coverage of a JLPT level.
 *
 * "Known" means the card graduated past FSRS's learning steps (state >= 2).
 * Counting anything merely SEEN would inflate the number precisely when it
 * matters — right after a big study session, when nothing has been retained yet.
 */
export async function getReadiness(userId: string, languageCode: string, levelCode: string): Promise<Readiness | null> {
  const language = await languageByCode(languageCode)
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
