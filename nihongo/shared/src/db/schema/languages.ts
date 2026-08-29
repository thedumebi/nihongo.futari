import { relations } from 'drizzle-orm'
import { boolean, index, integer, jsonb, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'

import { primaryId, timestamps } from './columns.js'

/**
 * Every content table carries `languageId`. Japanese is the only language
 * implemented, but the seams are here from the start so adding French is new
 * content plus new modules rather than a migration across every table.
 *
 * The rule that keeps this honest: no Japanese-specific literal lives outside
 * `shared/src/lib/ja/`.
 */
export const languages = pgTable('languages', {
  id: primaryId(),
  code: text('code').notNull().unique(), // ISO 639-1: ja, fr
  name: text('name').notNull(), // Japanese
  nativeName: text('native_name').notNull(), // 日本語
  scriptDirection: text('script_direction').notNull().default('ltr'),
  active: boolean('active').notNull().default(true),
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
})

/**
 * JLPT N5–N1 for Japanese, CEFR A1–C2 for French. `rank` is the ordering
 * (1 = easiest) so queries never have to know which scheme is in play —
 * N5 and A1 are both rank 1.
 */
export const languageLevels = pgTable('language_levels', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  code: text('code').notNull(), // N5
  name: text('name').notNull(),
  rank: integer('rank').notNull(),
  description: text('description'),
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
}, t => ({
  codeUnique: uniqueIndex('language_levels_code_unique').on(t.languageId, t.code),
  rankIdx: index('language_levels_rank_idx').on(t.languageId, t.rank)
}))

/**
 * Per-language capability switches. Japanese enables kanji, pitch-accent,
 * handwriting, furigana and stroke-order; French would enable gender and
 * accents and none of the above. `config` holds per-feature tuning.
 */
export const languageFeatures = pgTable('language_features', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  key: text('key').notNull(), // kanji | pitch-accent | handwriting | furigana | conjugation | stroke-order | romanisation
  enabled: boolean('enabled').notNull().default(true),
  config: jsonb('config').$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps
}, t => ({
  keyUnique: uniqueIndex('language_features_key_unique').on(t.languageId, t.key)
}))

export const languagesRelations = relations(languages, ({ many }) => ({
  levels: many(languageLevels),
  features: many(languageFeatures)
}))

export const languageLevelsRelations = relations(languageLevels, ({ one }) => ({
  language: one(languages, { fields: [languageLevels.languageId], references: [languages.id] })
}))

export const languageFeaturesRelations = relations(languageFeatures, ({ one }) => ({
  language: one(languages, { fields: [languageFeatures.languageId], references: [languages.id] })
}))
