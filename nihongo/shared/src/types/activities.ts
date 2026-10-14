import { z } from '@hono/zod-openapi'

import type { learningActivities } from '@/db/schema/user-progress.js'

import { ACTIVITY_KINDS } from '@/constants/endpoints.js'

/**
 * Learning activities: what a learner did besides answering reviews. Each
 * counts toward the streak and earns XP once per thing per day.
 */
export type LearningActivity = typeof learningActivities.$inferSelect

export const recordActivitySchema = z.object({
  /**
   * Minted by the client (UUIDv7) so a record queued offline can be sent
   * twice for free. Omitted when the server records it itself.
   */
  id: z.uuid().optional(),
  kind: z.enum(ACTIVITY_KINDS),
  /** What was done: a lesson slug, a session code, a puzzle key… */
  refId: z.string().min(1).max(120),
  /** When it happened — later than now is clamped; absent means now. */
  occurredAt: z.iso.datetime().optional(),
  score: z.number().int().min(0).max(100_000).optional(),
  total: z.number().int().min(0).max(100_000).optional(),
  durationMs: z.number().int().min(0).max(86_400_000).optional()
}).openapi('RecordActivity')

export type RecordActivityInput = z.infer<typeof recordActivitySchema>

export const recordActivityResultSchema = z.object({
  /** False when this was already recorded today — retried, or done twice. */
  recorded: z.boolean(),
  /** XP it earned now; 0 when it had already counted today. */
  xp: z.number().int()
}).openapi('RecordActivityResult')

export type RecordActivityResult = z.infer<typeof recordActivityResultSchema>
