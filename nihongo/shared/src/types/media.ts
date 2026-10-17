import { z } from '@hono/zod-openapi'

import type {
  contentAudio,
  handwritingAttempts,
  mediaAssets
} from '@/db/schema/media.js'

/**
 * Audio, stroke assets and handwriting attempts.
 *
 * Derived from the Drizzle tables — the schema is the single source of truth.
 * Never hand-write a shape that duplicates one of these.
 */
export type MediaAsset = typeof mediaAssets.$inferSelect
export type NewMediaAsset = typeof mediaAssets.$inferInsert
export type ContentAudio = typeof contentAudio.$inferSelect
export type HandwritingAttempt = typeof handwritingAttempts.$inferSelect

/**
 * Sentences and words whose audio does not say what they say now: reworded
 * or new since the last recording run, and silent until it is run again
 * (`audio:sentences` / `audio:words`, then `seed:clip-audio`, then deploy).
 */
export const audioStatusSchema = z.object({
  sentencesWaiting: z.number().int(),
  wordsWaiting: z.number().int()
}).openapi('AudioStatus')
export type AudioStatus = z.infer<typeof audioStatusSchema>
