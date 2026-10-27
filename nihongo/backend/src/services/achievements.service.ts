import type { AchievementKind } from '@nihongo/shared/constants'
import type { Achievement, AchievementList, ReviewEvent, StudyHistory } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import {
  achievements,
  handwritingAttempts,
  languages,
  learningActivities,
  srsCards,
  srsDailyStats,
  srsReviewLogs,
  studyItemFacets,
  studyItems,
  userAchievements,
  userStreaks
} from '@nihongo/shared/db/schema'
import { dayLongestReached, evaluateAchievements, replay, studyDayRange } from '@nihongo/shared/lib'
import { and, asc, eq, gte, inArray, isNotNull, isNull, lt, or, sql } from 'drizzle-orm'

import { loadPolicy } from './srs.service.js'

/**
 * Achievements: counted from what the learner has done, set outright.
 *
 * Fourteen were seeded at the start and nothing ever evaluated them. This
 * gathers every count an achievement can ask about, evaluates them all
 * (`evaluateAchievements`, pure), and writes progress wholesale. An unlock is
 * never taken back, and its date is kept from the first time.
 *
 * An unlock is dated by the moment the learner crossed the line, worked out
 * from what they did, not by when the rebuild noticed: a week studied offline
 * and synced on Sunday earns each achievement on the day it was earned.
 */

/** The window "accuracy" achievements look at, and the reviews it needs to mean anything. */
const ACCURACY_DAYS = 30
const ACCURACY_MIN_REVIEWS = 100
/** A handwriting attempt scoring this or better counts as written correctly. */
const HANDWRITING_PASS = 0.8

/** The activities each activity achievement counts, each distinct one once. */
const ACTIVITY_KINDS: Partial<Record<AchievementKind, string[]>> = {
  'lessons': ['lesson', 'kana-lesson'],
  'speak-sessions': ['speak', 'story'],
  'crosswords': ['crossword'],
  'conversations': ['conversation'],
  'readings': ['reading'],
  'recall': ['recall']
}

async function gatherStats(userId: string, languageId: string): Promise<Partial<Record<AchievementKind, number>>> {
  const since = new Date(Date.now() - ACCURACY_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const [reviews, streak, learned, accuracy, handwriting, activities] = await Promise.all([
    db.select({ n: sql<number>`count(*)`.mapWith(Number) }).from(srsReviewLogs).where(and(eq(srsReviewLogs.userId, userId), eq(srsReviewLogs.languageId, languageId), eq(srsReviewLogs.superseded, false))),
    db.select({ longest: userStreaks.longestStreak }).from(userStreaks).where(and(eq(userStreaks.userId, userId), eq(userStreaks.languageId, languageId))),
    // Items and kanji past learning, in one pass over the learner's cards
    // (count distinct skips the null kanji of items that are not kanji).
    db.select({
      items: sql<number>`count(distinct ${studyItems.id})`.mapWith(Number),
      kanji: sql<number>`count(distinct ${studyItems.kanjiId})`.mapWith(Number)
    }).from(srsCards).innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId)).innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId)).where(and(eq(srsCards.userId, userId), eq(srsCards.languageId, languageId), gte(srsCards.state, 2))),
    db.select({
      reviews: sql<number>`coalesce(sum(${srsDailyStats.reviewCount}), 0)`.mapWith(Number),
      correct: sql<number>`coalesce(sum(${srsDailyStats.correctCount}), 0)`.mapWith(Number)
    }).from(srsDailyStats).where(and(eq(srsDailyStats.userId, userId), eq(srsDailyStats.languageId, languageId), gte(srsDailyStats.localDate, since))),
    db.select({ n: sql<number>`count(distinct ${handwritingAttempts.kanjiId})`.mapWith(Number) }).from(handwritingAttempts).where(and(eq(handwritingAttempts.userId, userId), gte(handwritingAttempts.score, String(HANDWRITING_PASS)))),
    db.select({ kind: learningActivities.kind, n: sql<number>`count(distinct ${learningActivities.refId})`.mapWith(Number) })
      .from(learningActivities)
      .where(and(eq(learningActivities.userId, userId), eq(learningActivities.languageId, languageId)))
      .groupBy(learningActivities.kind)
  ])

  const distinct = (kinds: string[] = []) => activities.filter(a => kinds.includes(a.kind)).reduce((n, a) => n + a.n, 0)
  const acc = accuracy[0]
  return {
    'reviews': reviews[0]?.n ?? 0,
    'streak': streak[0]?.longest ?? 0,
    'items-learned': learned[0]?.items ?? 0,
    // Too few reviews say nothing about accuracy.
    'accuracy': acc && acc.reviews >= ACCURACY_MIN_REVIEWS ? Math.floor((acc.correct / acc.reviews) * 100) : 0,
    'kanji-known': learned[0]?.kanji ?? 0,
    'handwriting': handwriting[0]?.n ?? 0,
    ...Object.fromEntries(Object.entries(ACTIVITY_KINDS).map(([kind, kinds]) => [kind, distinct(kinds)]))
  }
}

/** The `n`th earliest of some moments, or null if there are fewer than `n`. */
function nth(moments: Date[], n: number): Date | null {
  return n >= 1 ? [...moments].sort((a, b) => a.getTime() - b.getTime())[n - 1] ?? null : null
}

/** The first review or activity in a span: the moment a study day began. */
async function firstStudyIn(userId: string, languageId: string, start: Date, end: Date): Promise<Date | null> {
  const [[review], [activity]] = await Promise.all([
    db
      .select({ at: sql<Date | null>`min(${srsReviewLogs.reviewedAt})`.mapWith(srsReviewLogs.reviewedAt) })
      .from(srsReviewLogs)
      .where(and(eq(srsReviewLogs.userId, userId), eq(srsReviewLogs.languageId, languageId), eq(srsReviewLogs.superseded, false), gte(srsReviewLogs.reviewedAt, start), lt(srsReviewLogs.reviewedAt, end))),
    db
      .select({ at: sql<Date | null>`min(${learningActivities.occurredAt})`.mapWith(learningActivities.occurredAt) })
      .from(learningActivities)
      .where(and(eq(learningActivities.userId, userId), eq(learningActivities.languageId, languageId), gte(learningActivities.occurredAt, start), lt(learningActivities.occurredAt, end)))
  ])
  const moments = [review?.at, activity?.at].filter((at): at is Date => at instanceof Date)
  return nth(moments, 1)
}

/**
 * The moment an achievement's count first reached its threshold, from the
 * events behind the count: the Nth review, the Nth distinct lesson, the Nth
 * item past learning, the first study on the day the streak got there. Null
 * when it cannot be said (accuracy, which a window decides, or a streak with
 * no history passed in); the caller then dates it now.
 *
 * `learned` is shared by every achievement of one rebuild, so the cards are
 * replayed once however many item and kanji thresholds are crossed.
 */
async function crossedAt(
  userId: string,
  languageId: string,
  def: Pick<Achievement, 'thresholdKind' | 'threshold'>,
  learned: () => Promise<LearnedMoments>,
  history?: StudyHistory
): Promise<Date | null> {
  const n = def.threshold
  const kind = def.thresholdKind as AchievementKind

  switch (kind) {
    case 'reviews': {
      const [row] = await db
        .select({ at: srsReviewLogs.reviewedAt })
        .from(srsReviewLogs)
        .where(and(eq(srsReviewLogs.userId, userId), eq(srsReviewLogs.languageId, languageId), eq(srsReviewLogs.superseded, false)))
        .orderBy(asc(srsReviewLogs.reviewedAt), asc(srsReviewLogs.id))
        .offset(n - 1)
        .limit(1)
      return row?.at ?? null
    }
    case 'handwriting': {
      const rows = await db
        .select({ at: sql<Date>`min(${handwritingAttempts.createdAt})`.mapWith(handwritingAttempts.createdAt) })
        .from(handwritingAttempts)
        .where(and(eq(handwritingAttempts.userId, userId), gte(handwritingAttempts.score, String(HANDWRITING_PASS))))
        .groupBy(handwritingAttempts.kanjiId)
      return nth(rows.map(r => r.at), n)
    }
    case 'items-learned':
      return nth((await learned()).items, n)
    case 'kanji-known':
      return nth((await learned()).kanji, n)
    case 'streak': {
      // A study day is a day with a review or with an activity, as the
      // streak counts them.
      const day = history && dayLongestReached(history.studyDates, n, { freezesAvailable: history.freezesAvailable })
      if (!history || !day)
        return null
      const { start, end } = studyDayRange(day, history.timezone, history.dayBoundaryHour)
      return firstStudyIn(userId, languageId, start, end)
    }
    default: {
      const kinds = ACTIVITY_KINDS[kind]
      if (!kinds)
        return null
      const rows = await db
        .select({ at: sql<Date>`min(${learningActivities.occurredAt})`.mapWith(learningActivities.occurredAt) })
        .from(learningActivities)
        .where(and(eq(learningActivities.userId, userId), eq(learningActivities.languageId, languageId), inArray(learningActivities.kind, kinds)))
        .groupBy(learningActivities.kind, learningActivities.refId)
      return nth(rows.map(r => r.at), n)
    }
  }
}

/** When each item, and each kanji, counted as learned now went past learning. */
interface LearnedMoments { items: Date[], kanji: Date[] }

/**
 * Each card counted now is replayed to its first answer that left it in
 * review (the log's own after-columns are not filled in); an item is learned
 * at the earliest of its cards, and a kanji at the earliest of its items.
 */
async function learnedMoments(userId: string, languageId: string): Promise<LearnedMoments> {
  const cards = await db
    .select({ id: srsCards.id, itemId: studyItems.id, kanjiId: studyItems.kanjiId })
    .from(srsCards)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .where(and(eq(srsCards.userId, userId), eq(srsCards.languageId, languageId), gte(srsCards.state, 2)))
  if (cards.length === 0)
    return { items: [], kanji: [] }

  const [logs, { fsrsParams }] = await Promise.all([
    db
      .select({ id: srsReviewLogs.id, cardId: srsReviewLogs.cardId, rating: srsReviewLogs.rating, reviewedAt: srsReviewLogs.reviewedAt, clientId: srsReviewLogs.clientId })
      .from(srsReviewLogs)
      .where(and(eq(srsReviewLogs.userId, userId), eq(srsReviewLogs.languageId, languageId), inArray(srsReviewLogs.cardId, cards.map(c => c.id)))),
    loadPolicy(userId)
  ])
  const byCard = new Map<string, typeof logs>()
  for (const log of logs)
    byCard.set(log.cardId, [...(byCard.get(log.cardId) ?? []), log])

  const items = new Map<string, Date>()
  const kanji = new Map<string, Date>()
  const keepEarliest = (into: Map<string, Date>, key: string, moment: Date) => {
    const seen = into.get(key)
    if (!seen || moment < seen)
      into.set(key, moment)
  }
  for (const card of cards) {
    const history = byCard.get(card.id) ?? []
    const at = new Map(history.map(h => [h.id, h.reviewedAt]))
    const { snapshots } = replay(history.map(h => ({ id: h.id, rating: h.rating as ReviewEvent['rating'], reviewedAt: h.reviewedAt, clientId: h.clientId })), fsrsParams)
    const learned = snapshots.find(snap => snap.stateAfter >= 2)
    if (!learned)
      continue
    const moment = at.get(learned.logId)!
    keepEarliest(items, card.itemId, moment)
    if (card.kanjiId !== null)
      keepEarliest(kanji, card.kanjiId, moment)
  }
  return { items: [...items.values()], kanji: [...kanji.values()] }
}

/**
 * Re-evaluate every achievement for one learner. Safe to run any number of
 * times.
 *
 * A new unlock is dated by when it was earned. `redate` (a rebuild that
 * brought in past days) dates the ones already unlocked again too, and the
 * earlier date wins: answers synced late from another device can move an
 * unlock back, never forward.
 */
export async function recomputeAchievements(userId: string, languageId: string, history?: StudyHistory, { redate = false } = {}): Promise<void> {
  const defs = await db
    .select({ id: achievements.id, thresholdKind: achievements.thresholdKind, threshold: achievements.threshold })
    .from(achievements)
    .where(or(isNull(achievements.languageId), eq(achievements.languageId, languageId)))
  if (defs.length === 0)
    return

  const [stats, earned] = await Promise.all([
    gatherStats(userId, languageId),
    redate ? Promise.resolve([]) : db.select({ id: userAchievements.achievementId }).from(userAchievements).where(and(eq(userAchievements.userId, userId), isNotNull(userAchievements.unlockedAt)))
  ])
  const states = evaluateAchievements(stats, defs)
  const now = new Date()
  const known = new Set(earned.map(e => e.id))
  const unlocked = new Set(states.filter(s => s.unlocked).map(s => s.achievementId))
  const toDate = defs.filter(d => unlocked.has(d.id) && !known.has(d.id))
  let learned: Promise<LearnedMoments> | undefined
  const learnedOnce = () => (learned ??= learnedMoments(userId, languageId))
  const moments = new Map(await Promise.all(toDate.map(async d => [d.id, await crossedAt(userId, languageId, d, learnedOnce, history) ?? now] as const)))

  await db
    .insert(userAchievements)
    .values(states.map(s => ({
      userId,
      achievementId: s.achievementId,
      progress: s.progress,
      unlockedAt: s.unlocked ? moments.get(s.achievementId) ?? now : null
    })))
    .onConflictDoUpdate({
      target: [userAchievements.userId, userAchievements.achievementId],
      set: {
        progress: sql`excluded.progress`,
        // Never cleared, and the earliest date wins (least skips a null).
        unlockedAt: sql`least(${userAchievements.unlockedAt}, excluded.unlocked_at)`,
        updatedAt: now
      }
    })
}

export async function listAchievements(userId: string, languageCode: string): Promise<AchievementList> {
  const rows = await db
    .select({
      code: achievements.code,
      title: achievements.title,
      description: achievements.description,
      icon: achievements.icon,
      category: achievements.category,
      threshold: achievements.threshold,
      secret: achievements.secret,
      progress: userAchievements.progress,
      unlockedAt: userAchievements.unlockedAt
    })
    .from(achievements)
    .leftJoin(languages, eq(languages.id, achievements.languageId))
    .leftJoin(userAchievements, and(eq(userAchievements.achievementId, achievements.id), eq(userAchievements.userId, userId)))
    .where(or(isNull(achievements.languageId), eq(languages.code, languageCode)))
    .orderBy(asc(achievements.sortIndex))

  return {
    achievements: rows.map(r => ({
      code: r.code,
      title: r.title,
      description: r.description ?? '',
      icon: r.icon ?? 'award',
      category: r.category ?? 'milestone',
      threshold: r.threshold,
      progress: r.progress ?? 0,
      unlockedAt: r.unlockedAt ? r.unlockedAt.toISOString() : null,
      secret: r.secret
    }))
  }
}

/** Unlocked, not yet shown to the learner — for the one-time celebration. */
export async function unseenAchievements(userId: string): Promise<Array<{ code: string, title: string, description: string }>> {
  const rows = await db
    .select({ code: achievements.code, title: achievements.title, description: achievements.description })
    .from(userAchievements)
    .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
    .where(and(eq(userAchievements.userId, userId), isNotNull(userAchievements.unlockedAt), isNull(userAchievements.seenAt)))
    .orderBy(asc(achievements.sortIndex))
  return rows.map(r => ({ code: r.code, title: r.title, description: r.description ?? '' }))
}

export async function markAchievementsSeen(userId: string, codes: string[]): Promise<void> {
  if (codes.length === 0)
    return
  const ids = db.select({ id: achievements.id }).from(achievements).where(inArray(achievements.code, codes))
  await db
    .update(userAchievements)
    .set({ seenAt: new Date(), updatedAt: new Date() })
    .where(and(eq(userAchievements.userId, userId), inArray(userAchievements.achievementId, ids), isNull(userAchievements.seenAt)))
}
