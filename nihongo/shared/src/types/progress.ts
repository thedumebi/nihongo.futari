import { z } from '@hono/zod-openapi'

import { SRS_RATINGS } from './srs.js'

/**
 * Progress aggregates.
 *
 * Everything here is computed by a PURE FOLD over the review log, never by
 * incrementing a counter. Increments double-count under replay, and replay is
 * routine in this app — a phone that was offline for a week flushes reviews
 * that land in the middle of history.
 */

/** One review, reduced to just what the aggregates care about. */
export const aggregateEventSchema = z.object({
  logId: z.string(),
  reviewedAt: z.date(),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  /** FSRS state BEFORE the review. 0 = New, so this review introduced it. */
  stateBefore: z.number().int().min(0).max(3),
  /** Whether the review pushed the card into Relearning (a lapse). */
  lapsed: z.boolean(),
  durationMs: z.number().int().nonnegative().default(0)
}).openapi('AggregateEvent')

export type AggregateEvent = z.infer<typeof aggregateEventSchema>

export const dailyStatSchema = z.object({
  localDate: z.string(), // YYYY-MM-DD
  timezone: z.string(),
  newCount: z.number().int(),
  reviewCount: z.number().int(),
  correctCount: z.number().int(),
  lapseCount: z.number().int(),
  timeMs: z.number().int(),
  xpEarned: z.number().int()
}).openapi('DailyStat')

export type DailyStat = z.infer<typeof dailyStatSchema>

/** One XP award, keyed so a replay can re-emit it without double-counting. */
export const xpAwardSchema = z.object({
  source: z.enum(['review', 'session-complete', 'streak', 'achievement', 'lesson']),
  /** The log id for review XP. Unique per (user, source, refId). */
  refId: z.string(),
  amount: z.number().int(),
  localDate: z.string()
}).openapi('XpAward')

export type XpAward = z.infer<typeof xpAwardSchema>

export const streakSchema = z.object({
  currentStreak: z.number().int(),
  longestStreak: z.number().int(),
  lastActiveDate: z.string().nullable(),
  /** Dates a freeze was consumed to bridge a gap. */
  freezesUsed: z.array(z.string()),
  freezesRemaining: z.number().int()
}).openapi('Streak')

export type Streak = z.infer<typeof streakSchema>

export const aggregateResultSchema = z.object({
  daily: z.array(dailyStatSchema),
  xp: z.array(xpAwardSchema),
  totalXp: z.number().int(),
  /** Local dates touched — exactly the rows a DELETE+INSERT must replace. */
  affectedDates: z.array(z.string())
}).openapi('AggregateResult')

export type AggregateResult = z.infer<typeof aggregateResultSchema>

/**
 * XP per review. Deliberately a pure function of the review itself, never of
 * "when it was submitted" — otherwise a replayed review would be worth a
 * different amount than the original.
 */
export const XP_RULES = {
  /** Introducing a new item. */
  NEW_ITEM: 3,
  /** A correct review. */
  CORRECT: 2,
  /** An incorrect review still earns something — showing up is the habit. */
  INCORRECT: 1,
  /** Bonus for `Easy` on a mature card. */
  EASY_BONUS: 1
} as const

export function xpForReview(event: Pick<AggregateEvent, 'rating' | 'stateBefore'>): number {
  if (event.stateBefore === 0)
    return XP_RULES.NEW_ITEM
  if (event.rating === SRS_RATINGS.AGAIN)
    return XP_RULES.INCORRECT
  const base = XP_RULES.CORRECT
  return event.rating === SRS_RATINGS.EASY ? base + XP_RULES.EASY_BONUS : base
}

export const progressSummarySchema = z.object({
  totalXp: z.number().int(),
  level: z.number().int(),
  currentStreak: z.number().int(),
  longestStreak: z.number().int(),
  /** Cards begun — seen at least once. Not the same as retained. */
  started: z.number().int(),
  /** Cards graduated past the learning steps. The strict sense. */
  learned: z.number().int(),
  /** Review cards whose interval has elapsed. Same meaning as Study's "due". */
  /** ITEMS due — the same number Study and the due list show. */
  due: z.number().int(),
  /** The same set in cards, for the caption. */
  dueCards: z.number().int(),
  /** Cards still on the short learning steps. Counted apart from `due`. */
  learning: z.number().int(),
  newAvailable: z.number().int()
}).openapi('ProgressSummary')

export type ProgressSummary = z.infer<typeof progressSummarySchema>

/**
 * Kanji the reader has learned.
 *
 * Derived live from `srs_cards` rather than read from `user_known_kanji`:
 * nothing maintains that table, and a stale "known" set is worse than none —
 * it hides furigana over a character you have actually forgotten.
 */
export const knownKanjiSchema = z.object({
  /** Characters whose card has graduated past the learning steps. */
  characters: z.array(z.string())
}).openapi('KnownKanji')

export type KnownKanji = z.infer<typeof knownKanjiSchema>

/**
 * JLPT readiness.
 *
 * Deliberately expressed as COVERAGE, not as a predicted exam score. Nobody can
 * infer a pass mark from SRS state — the exam has reading comprehension and
 * listening sections this app does not model at all — and a confident "72%,
 * you'll pass" would be a fabrication dressed as data.
 *
 * What can honestly be said is: of the items this curriculum holds for a level,
 * here is the share you have learned, broken down so the weak area is visible.
 */
export const readinessSchema = z.object({
  level: z.string(),
  /** Per content kind: how much of the level you have, and how much you know. */
  coverage: z.array(z.object({
    kind: z.string(),
    total: z.number().int(),
    /** Cards past FSRS's learning steps — genuinely retained, not just seen. */
    known: z.number().int(),
    /** Seen at least once but not yet graduated. */
    learning: z.number().int()
  })),
  /** Weighted share of the level known, 0-100. */
  percent: z.number(),
  /**
   * How much of the level this app actually covers. Low coverage means the
   * percentage above is measuring a small sample and should be read as such.
   */
  curriculumNote: z.string(),
  /** The weakest area, so the number comes with a next action. */
  weakest: z.string().nullable()
}).openapi('Readiness')

export type Readiness = z.infer<typeof readinessSchema>
