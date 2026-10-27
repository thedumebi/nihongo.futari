import type { AchievementKind } from '@nihongo/shared/constants'
import type { AchievementList } from '@nihongo/shared/types'

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
import { evaluateAchievements } from '@nihongo/shared/lib'
import { and, asc, eq, gte, inArray, isNotNull, isNull, or, sql } from 'drizzle-orm'

/**
 * Achievements: counted from what the learner has done, set outright.
 *
 * Fourteen were seeded at the start and nothing ever evaluated them. This
 * gathers every count an achievement can ask about, evaluates them all
 * (`evaluateAchievements`, pure), and writes progress wholesale. An unlock is
 * never taken back, and its date is kept from the first time.
 */

/** The window "accuracy" achievements look at, and the reviews it needs to mean anything. */
const ACCURACY_DAYS = 30
const ACCURACY_MIN_REVIEWS = 100
/** A handwriting attempt scoring this or better counts as written correctly. */
const HANDWRITING_PASS = 0.8

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

  const distinct = (...kinds: string[]) => activities.filter(a => kinds.includes(a.kind)).reduce((n, a) => n + a.n, 0)
  const acc = accuracy[0]
  return {
    'reviews': reviews[0]?.n ?? 0,
    'streak': streak[0]?.longest ?? 0,
    'items-learned': learned[0]?.items ?? 0,
    // Too few reviews say nothing about accuracy.
    'accuracy': acc && acc.reviews >= ACCURACY_MIN_REVIEWS ? Math.floor((acc.correct / acc.reviews) * 100) : 0,
    'kanji-known': learned[0]?.kanji ?? 0,
    'handwriting': handwriting[0]?.n ?? 0,
    'lessons': distinct('lesson', 'kana-lesson'),
    'speak-sessions': distinct('speak', 'story'),
    'crosswords': distinct('crossword'),
    'conversations': distinct('conversation'),
    'readings': distinct('reading'),
    'recall': distinct('recall')
  }
}

/** Re-evaluate every achievement for one learner. Safe to run any number of times. */
export async function recomputeAchievements(userId: string, languageId: string): Promise<void> {
  const defs = await db
    .select({ id: achievements.id, thresholdKind: achievements.thresholdKind, threshold: achievements.threshold })
    .from(achievements)
    .where(or(isNull(achievements.languageId), eq(achievements.languageId, languageId)))
  if (defs.length === 0)
    return

  const states = evaluateAchievements(await gatherStats(userId, languageId), defs)
  const now = new Date()
  await db
    .insert(userAchievements)
    .values(states.map(s => ({
      userId,
      achievementId: s.achievementId,
      progress: s.progress,
      unlockedAt: s.unlocked ? now : null
    })))
    .onConflictDoUpdate({
      target: [userAchievements.userId, userAchievements.achievementId],
      set: {
        progress: sql`excluded.progress`,
        // First unlock wins; never cleared.
        unlockedAt: sql`coalesce(${userAchievements.unlockedAt}, excluded.unlocked_at)`,
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
