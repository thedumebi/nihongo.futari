import { z } from '@hono/zod-openapi'

import type {
  reviewSessions,
  srsCards,
  srsDailyStats,
  srsReviewLogs
} from '@/db/schema/srs.js'

/**
 * SRS cards and the append-only review log.
 *
 * Derived from the Drizzle tables — the schema is the single source of truth.
 * Never hand-write a shape that duplicates one of these.
 */
export type SrsCard = typeof srsCards.$inferSelect
export type NewSrsCard = typeof srsCards.$inferInsert
export type SrsReviewLog = typeof srsReviewLogs.$inferSelect
export type NewSrsReviewLog = typeof srsReviewLogs.$inferInsert
export type ReviewSession = typeof reviewSessions.$inferSelect
export type SrsDailyStat = typeof srsDailyStats.$inferSelect

// ---------------------------------------------------------------------------
// Runtime contract for the scheduler.
//
// These cross trust boundaries (offline queue -> sync endpoint), so they are
// Zod schemas first and the types come from z.infer. Nothing below restates a
// shape that already exists above — `CardState` is deliberately the SUBSET of
// `SrsCard` that FSRS actually folds over, so replay has an exact, minimal
// input and the property test has something small to compare.
// ---------------------------------------------------------------------------

/** FSRS lifecycle. Mirrors ts-fsrs `State`. */
export const SRS_STATES = { NEW: 0, LEARNING: 1, REVIEW: 2, RELEARNING: 3 } as const
export type SrsState = typeof SRS_STATES[keyof typeof SRS_STATES]

/** FSRS grades. Mirrors ts-fsrs `Rating` (Manual = 0 is not offered to users). */
export const SRS_RATINGS = { AGAIN: 1, HARD: 2, GOOD: 3, EASY: 4 } as const
export type SrsRating = typeof SRS_RATINGS[keyof typeof SRS_RATINGS]

export const cardStateSchema = z.object({
  due: z.date(),
  stability: z.number(),
  difficulty: z.number(),
  elapsedDays: z.number().int(),
  scheduledDays: z.number().int(),
  learningSteps: z.number().int(),
  reps: z.number().int(),
  lapses: z.number().int(),
  state: z.number().int().min(0).max(3),
  lastReview: z.date().nullable()
}).openapi('CardState')

export type CardState = z.infer<typeof cardStateSchema>

/**
 * One entry in the fold. `id` is the client-minted UUIDv7 — it is both the
 * idempotency key and the deterministic tiebreak when two reviews share a
 * millisecond, which is what makes replay order total rather than merely
 * partial.
 */
export const reviewEventSchema = z.object({
  id: z.string().min(1),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  reviewedAt: z.date(),
  /** Device that produced it. Only used by the double-review guard. */
  clientId: z.string().nullable().optional()
}).openapi('ReviewEvent')

export type ReviewEvent = z.infer<typeof reviewEventSchema>

/** Per-event before/after snapshot, rewritten whenever a replay runs. */
export const reviewSnapshotSchema = z.object({
  logId: z.string(),
  stateBefore: z.number().int(),
  stabilityBefore: z.number(),
  difficultyBefore: z.number(),
  dueBefore: z.date(),
  elapsedDays: z.number().int(),
  scheduledDays: z.number().int(),
  stateAfter: z.number().int(),
  stabilityAfter: z.number(),
  difficultyAfter: z.number(),
  dueAfter: z.date()
}).openapi('ReviewSnapshot')

export type ReviewSnapshot = z.infer<typeof reviewSnapshotSchema>

/** Per-user FSRS tuning, persisted on `user_settings.fsrsParams`. */
export const fsrsParamsSchema = z.object({
  w: z.array(z.number()).optional(),
  requestRetention: z.number().min(0.7).max(0.99).optional(),
  maximumInterval: z.number().int().positive().optional(),
  enableFuzz: z.boolean().optional()
}).openapi('FsrsParams')

export type FsrsParams = z.infer<typeof fsrsParamsSchema>

/** Ghost policy thresholds. Config, never hardcoded constants. */
export const ghostPolicySchema = z.object({
  threshold: z.number().int().positive().default(4),
  intervalFactor: z.number().min(0.1).max(1).default(0.5),
  recentWindow: z.number().int().positive().default(10),
  recentAccuracyFloor: z.number().min(0).max(1).default(0.6),
  clearAfterCorrect: z.number().int().positive().default(3),
  clearMinIntervalDays: z.number().int().positive().default(7),
  maxGhostIntervalDays: z.number().int().positive().default(21)
}).openapi('GhostPolicy')

export type GhostPolicy = z.infer<typeof ghostPolicySchema>

export const GHOST_EVENTS = { FLAGGED: 'flagged', ESCALATED: 'escalated', CLEARED: 'cleared' } as const
export type GhostEvent = typeof GHOST_EVENTS[keyof typeof GHOST_EVENTS]
