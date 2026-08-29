import { z } from '@hono/zod-openapi'

import type {
  languageFeatures,
  languageLevels,
  languages
} from '@/db/schema/languages.js'

/**
 * Language configuration.
 *
 * Derived from the Drizzle tables — the schema is the single source of truth.
 * Never hand-write a shape that duplicates one of these.
 */
export type Language = typeof languages.$inferSelect
export type NewLanguage = typeof languages.$inferInsert
export type LanguageLevel = typeof languageLevels.$inferSelect
export type NewLanguageLevel = typeof languageLevels.$inferInsert
export type LanguageFeature = typeof languageFeatures.$inferSelect
export type NewLanguageFeature = typeof languageFeatures.$inferInsert

export const languageSummarySchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  nativeName: z.string(),
  levels: z.array(z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    rank: z.number().int()
  })),
  /** Published, studiable items. Zero means the language is listed but empty. */
  itemCount: z.number().int()
}).openapi('LanguageSummary')

export type LanguageSummary = z.infer<typeof languageSummarySchema>

export const languageListResponseSchema = z.object({
  languages: z.array(languageSummarySchema)
}).openapi('LanguageList')

export type LanguageListResponse = z.infer<typeof languageListResponseSchema>
