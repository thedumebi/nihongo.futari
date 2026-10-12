import { relations } from 'drizzle-orm'
import { boolean, index, integer, jsonb, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'

import { primaryId, timestamps } from './columns.js'
import { languageLevels, languages } from './languages.js'
import { provenance } from './ops.js'

/**
 * Short speeches to read aloud, scrolling like a teleprompter.
 *
 * Each speech belongs to exactly ONE level and is its own text. Writing one
 * speech five times at five levels was considered and rejected: the reader
 * moving from N5 to N4 would meet the same story again with a few words swapped
 * into kanji, which teaches the swap and not the language. A topic may come back
 * at a later level, but as a new speech; `check:readings` refuses lines copied
 * between speeches.
 */
export const readings = pgTable('readings', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  levelId: text('level_id').notNull().references(() => languageLevels.id, { onDelete: 'restrict' }),
  code: text('code').notNull(),
  /** The title as written at this level, kanji and all. */
  title: text('title').notNull(),
  titleEn: text('title_en').notNull(),
  published: boolean('published').notNull().default(false),
  sortIndex: integer('sort_index').notNull().default(0),
  ...provenance,
  ...timestamps
}, t => ({
  codeUnique: uniqueIndex('readings_code_unique').on(t.languageId, t.code),
  levelIdx: index('readings_level_idx').on(t.languageId, t.levelId, t.sortIndex)
}))

/**
 * One short phrase line of a speech, in order.
 *
 * `readingKana` is authored for the same reason as on `dialogue_turns`: telling
 * the particle は from the は inside はい needs part-of-speech, which nothing in
 * the data carries. An author knows; a heuristic does not.
 */
export const readingLines = pgTable('reading_lines', {
  id: primaryId(),
  readingId: text('reading_id').notNull().references(() => readings.id, { onDelete: 'cascade' }),
  index: integer('index').notNull(),
  /** Which group of lines this belongs to — the blank-line breaks on screen. */
  stanza: integer('stanza').notNull(),
  /** Japanese as written, kanji and all. */
  text: text('text').notNull(),
  /** The same line in kana, with particles as they are SPOKEN. */
  readingKana: text('reading_kana').notNull(),
  /** Pre-aligned ruby, same shape as dialogue_turns.furigana. */
  furigana: jsonb('furigana').$type<Array<{ t: string, r?: string }>>(),
  translation: text('translation').notNull(),
  ...timestamps
}, t => ({
  orderUnique: uniqueIndex('reading_lines_order_unique').on(t.readingId, t.index),
  readingIdx: index('reading_lines_reading_idx').on(t.readingId)
}))

export const readingsRelations = relations(readings, ({ one, many }) => ({
  language: one(languages, { fields: [readings.languageId], references: [languages.id] }),
  level: one(languageLevels, { fields: [readings.levelId], references: [languageLevels.id] }),
  lines: many(readingLines)
}))

export const readingLinesRelations = relations(readingLines, ({ one }) => ({
  reading: one(readings, { fields: [readingLines.readingId], references: [readings.id] })
}))
