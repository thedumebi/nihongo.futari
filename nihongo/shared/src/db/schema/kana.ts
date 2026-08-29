import { relations } from 'drizzle-orm'
import { integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'

import { primaryId, timestamps } from './columns.js'
import { languages } from './languages.js'

/**
 * Hiragana and katakana. Small, fully enumerable, and hand-seeded rather than
 * imported — there is no upstream dataset worth the pipeline for ~200 rows.
 *
 * `row`/`column` are the gojūon coordinates (k/a for か), which is what lets
 * the UI render the traditional grid and lets drills target "the k-row".
 */
export const kana = pgTable('kana', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  script: text('script').notNull(), // hiragana | katakana
  character: text('character').notNull(),
  romaji: text('romaji').notNull(),
  row: text('row').notNull(), // k, s, t, n, ... ('' for the bare vowel row)
  column: text('column').notNull(), // a, i, u, e, o
  variant: text('variant').notNull().default('base'), // base | dakuten | handakuten | youon | sokuon
  orderIndex: integer('order_index').notNull().default(0),
  ...timestamps
}, t => ({
  charUnique: uniqueIndex('kana_character_unique').on(t.languageId, t.script, t.character)
}))

export const kanaRelations = relations(kana, ({ one }) => ({
  language: one(languages, { fields: [kana.languageId], references: [languages.id] })
}))
