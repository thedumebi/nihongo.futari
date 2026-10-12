import { z } from '@hono/zod-openapi'

import type { readingLines, readings } from '@/db/schema/readings.js'

import { glossedTokenSchema } from './study.js'

/**
 * Read-aloud speeches.
 *
 * The rows come from the Drizzle tables; the API contract is Zod, and the
 * response types are inferred from it.
 */
export type Reading = typeof readings.$inferSelect
export type NewReading = typeof readings.$inferInsert
export type ReadingLine = typeof readingLines.$inferSelect
export type NewReadingLine = typeof readingLines.$inferInsert

/** One phrase line, cut into tappable words. */
export const readingLineViewSchema = z.object({
  index: z.number().int(),
  text: z.string(),
  /** Kana with particles as spoken (は→わ), which romaji is built from. */
  reading: z.string(),
  translation: z.string(),
  /** The line cut into tappable words. Joining every `t` rebuilds `text`. */
  tokens: z.array(glossedTokenSchema)
}).openapi('ReadingLine')

export type ReadingLineView = z.infer<typeof readingLineViewSchema>

export const readingSummarySchema = z.object({
  code: z.string(),
  title: z.string(),
  titleEn: z.string(),
  /** `language_levels.code` — N5 … N1. */
  level: z.string(),
  lineCount: z.number().int()
}).openapi('ReadingSummary')

export type ReadingSummary = z.infer<typeof readingSummarySchema>

export const readingViewSchema = readingSummarySchema.extend({
  /**
   * False only for an admin previewing a draft from the review queue. Anyone
   * else is only ever served published speeches.
   */
  published: z.boolean(),
  /** Groups of lines, shown with a gap between each group. */
  stanzas: z.array(z.array(readingLineViewSchema))
}).openapi('Reading')

export type ReadingView = z.infer<typeof readingViewSchema>

export const readingListQuerySchema = z.object({
  languageCode: z.string().min(2).default('ja'),
  /** `language_levels.code`. Absent = every level. */
  level: z.string().optional().openapi({ example: 'N5' })
})

export type ReadingListQuery = z.infer<typeof readingListQuerySchema>

export const readingListResponseSchema = z.object({
  readings: z.array(readingSummarySchema)
}).openapi('ReadingList')

export type ReadingListResponse = z.infer<typeof readingListResponseSchema>
