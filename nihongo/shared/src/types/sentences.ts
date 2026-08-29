import { z } from '@hono/zod-openapi'

import type {
  sentences,
  sentenceTokens,
  sentenceTranslations
} from '@/db/schema/sentences.js'
import type { FuriganaSegment } from '@/lib/ja/furigana/index.js'

/**
 * Example sentences and their tokenisation.
 *
 * Derived from the Drizzle tables — the schema is the single source of truth.
 * Never hand-write a shape that duplicates one of these.
 */
export type Sentence = typeof sentences.$inferSelect
export type NewSentence = typeof sentences.$inferInsert
export type SentenceTranslation = typeof sentenceTranslations.$inferSelect
export type SentenceToken = typeof sentenceTokens.$inferSelect

/**
 * One furigana segment, as stored in `sentence_tokens.furigana`.
 *
 * Re-exported from the alignment library so the shape is defined exactly once —
 * the aligner produces it and the renderer consumes it.
 */
export type { FuriganaAlignment, FuriganaSegment } from '@/lib/ja/furigana/index.js'

/**
 * The wire shape of a furigana segment.
 *
 * The TS interface above is the source of truth for the shape; this is the
 * same shape expressed for OpenAPI, which cannot read a bare interface. It is
 * asserted against the interface at compile time, so the two cannot drift.
 */
export const furiganaSegmentSchema = z.object({
  t: z.string(),
  r: z.string().optional()
}).openapi('FuriganaSegment')

// Compile-time proof that the schema and the interface agree.
const _segmentShapesAgree: FuriganaSegment = {} as z.infer<typeof furiganaSegmentSchema>
void _segmentShapesAgree
