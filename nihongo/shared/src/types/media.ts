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
