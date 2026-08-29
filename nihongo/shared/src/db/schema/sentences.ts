import { relations } from 'drizzle-orm'
import { boolean, index, integer, jsonb, numeric, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'

import { primaryId, timestamps } from './columns.js'
import { languageLevels, languages } from './languages.js'
import { provenance } from './ops.js'
import { words } from './words.js'

export const sentences = pgTable('sentences', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  readingKana: text('reading_kana'),
  levelId: text('level_id').references(() => languageLevels.id, { onDelete: 'set null' }),
  difficulty: numeric('difficulty', { precision: 5, scale: 3 }),
  source: text('source').notNull(), // tatoeba | authored
  sourceRefExternal: text('source_ref_external'), // Tatoeba sentence id
  license: text('license'),
  attribution: text('attribution'),
  published: boolean('published').notNull().default(false),
  ...provenance,
  ...timestamps
}, t => ({
  levelIdx: index('sentences_level_idx').on(t.languageId, t.levelId)
}))

/**
 * Per-translation licensing, because Tatoeba is CC BY 2.0 FR and attribution
 * attaches to the individual sentence, not the corpus.
 */
export const sentenceTranslations = pgTable('sentence_translations', {
  id: primaryId(),
  sentenceId: text('sentence_id').notNull().references(() => sentences.id, { onDelete: 'cascade' }),
  lang: text('lang').notNull(),
  text: text('text').notNull(),
  source: text('source'),
  license: text('license'),
  attribution: text('attribution'),
  ...timestamps
}, t => ({
  sentenceLangIdx: index('sentence_translations_sentence_lang_idx').on(t.sentenceId, t.lang)
}))

/**
 * Kuromoji-segmented tokens with precomputed ruby alignment.
 *
 * `furigana` is computed at import, never at render time: 大人 = おとな does
 * not decompose per-character, and doing this in the browser produces visible
 * garbage. `alignmentConfidence` lets low-confidence rows queue for review and
 * fall back to whole-token ruby.
 *
 * `charStart`/`charEnd` are what let the cloze engine blank the right span
 * automatically instead of storing hand-made cloze strings.
 */
export const sentenceTokens = pgTable('sentence_tokens', {
  id: primaryId(),
  sentenceId: text('sentence_id').notNull().references(() => sentences.id, { onDelete: 'cascade' }),
  index: integer('index').notNull(),
  surface: text('surface').notNull(),
  reading: text('reading'),
  lemma: text('lemma'),
  wordId: text('word_id').references(() => words.id, { onDelete: 'set null' }),
  pos: text('pos'),
  charStart: integer('char_start').notNull(),
  charEnd: integer('char_end').notNull(),
  furigana: jsonb('furigana').$type<Array<{ t: string, r?: string }>>().notNull().default([]),
  alignmentConfidence: numeric('alignment_confidence', { precision: 4, scale: 3 }),
  ...timestamps
}, t => ({
  tokenUnique: uniqueIndex('sentence_tokens_unique').on(t.sentenceId, t.index),
  wordIdx: index('sentence_tokens_word_idx').on(t.wordId)
}))

export const sentencesRelations = relations(sentences, ({ one, many }) => ({
  language: one(languages, { fields: [sentences.languageId], references: [languages.id] }),
  translations: many(sentenceTranslations),
  tokens: many(sentenceTokens)
}))
