import { relations } from 'drizzle-orm'
import { boolean, index, integer, jsonb, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'

import { primaryId, timestamps } from './columns.js'
import { kanji } from './kanji.js'
import { languageLevels, languages } from './languages.js'
import { provenance } from './ops.js'

/**
 * JMdict's shape is entry -> k_ele[] / r_ele[] / sense[], so it maps to four
 * tables rather than one. `entSeq` is JMdict's own stable id and the natural
 * key we re-import against.
 */
export const words = pgTable('words', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  entSeq: integer('ent_seq'),
  primaryForm: text('primary_form').notNull(),
  primaryReading: text('primary_reading').notNull(),
  levelId: text('level_id').references(() => languageLevels.id, { onDelete: 'set null' }),
  frequencyRank: integer('frequency_rank'),
  isCommon: boolean('is_common').notNull().default(false),
  /** kanjium pitch-accent data, per reading. */
  pitchAccent: jsonb('pitch_accent').$type<Array<{
    reading: string
    positions: number[]
    pattern: 'heiban' | 'atamadaka' | 'nakadaka' | 'odaka'
  }>>().notNull().default([]),
  /**
   * Native / Sino-Japanese / loan / hybrid. Derived at import from JMdict tags
   * plus script heuristics, then human-correctable — which is exactly why it
   * is covered by `lockedFields`.
   */
  wordOrigin: text('word_origin'),
  published: boolean('published').notNull().default(false),
  ...provenance,
  ...timestamps
}, t => ({
  entSeqUnique: uniqueIndex('words_ent_seq_unique').on(t.languageId, t.entSeq),
  levelIdx: index('words_level_idx').on(t.languageId, t.levelId, t.frequencyRank),
  formIdx: index('words_primary_form_idx').on(t.primaryForm),
  readingIdx: index('words_primary_reading_idx').on(t.primaryReading)
}))

/** Every written form of a word: kanji spellings and kana spellings alike. */
export const wordForms = pgTable('word_forms', {
  id: primaryId(),
  wordId: text('word_id').notNull().references(() => words.id, { onDelete: 'cascade' }),
  form: text('form').notNull(),
  kind: text('kind').notNull(), // kanji | kana
  isCommon: boolean('is_common').notNull().default(false),
  isIrregular: boolean('is_irregular').notNull().default(false),
  tags: text('tags').array().notNull().default([]), // ateji, iK, oK, uk
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
}, t => ({
  wordIdx: index('word_forms_word_idx').on(t.wordId),
  formIdx: index('word_forms_form_idx').on(t.form)
}))

export const wordSenses = pgTable('word_senses', {
  id: primaryId(),
  wordId: text('word_id').notNull().references(() => words.id, { onDelete: 'cascade' }),
  sortIndex: integer('sort_index').notNull().default(0),
  glosses: jsonb('glosses').$type<Array<{ lang: string, text: string }>>().notNull().default([]),
  pos: text('pos').array().notNull().default([]), // v5k, adj-i, n
  fields: text('fields').array().notNull().default([]),
  misc: text('misc').array().notNull().default([]),
  dialect: text('dialect').array().notNull().default([]),
  info: text('info'),
  restrictedToForms: text('restricted_to_forms').array().notNull().default([]),
  crossRefs: text('cross_refs').array().notNull().default([]),
  antonyms: text('antonyms').array().notNull().default([]),
  ...timestamps
}, t => ({
  wordIdx: index('word_senses_word_idx').on(t.wordId, t.sortIndex)
}))

/**
 * JMdict `lsource` — the factual spine for 外来語 etymology. Kept as structured
 * data rather than prose so the "why" layer can cite it directly: パン is from
 * Portuguese pão, and that is a fact from the dictionary, not a Claude opinion.
 */
export const wordSenseSources = pgTable('word_sense_sources', {
  id: primaryId(),
  senseId: text('sense_id').notNull().references(() => wordSenses.id, { onDelete: 'cascade' }),
  sourceLang: text('source_lang').notNull(), // ISO 639-2: por, eng, deu
  sourceText: text('source_text'), // pão
  isWasei: boolean('is_wasei').notNull().default(false),
  partial: boolean('partial').notNull().default(false),
  ...timestamps
}, t => ({
  senseIdx: index('word_sense_sources_sense_idx').on(t.senseId)
}))

/** Which kanji a word uses. Powers "words using this kanji" and the furigana check. */
export const wordKanji = pgTable('word_kanji', {
  id: primaryId(),
  wordId: text('word_id').notNull().references(() => words.id, { onDelete: 'cascade' }),
  kanjiId: text('kanji_id').notNull().references(() => kanji.id, { onDelete: 'cascade' }),
  position: integer('position').notNull().default(0),
  ...timestamps
}, t => ({
  pairUnique: uniqueIndex('word_kanji_unique').on(t.wordId, t.kanjiId, t.position),
  kanjiIdx: index('word_kanji_kanji_idx').on(t.kanjiId)
}))

export const wordsRelations = relations(words, ({ one, many }) => ({
  language: one(languages, { fields: [words.languageId], references: [languages.id] }),
  level: one(languageLevels, { fields: [words.levelId], references: [languageLevels.id] }),
  forms: many(wordForms),
  senses: many(wordSenses),
  kanji: many(wordKanji)
}))

export const wordSensesRelations = relations(wordSenses, ({ one, many }) => ({
  word: one(words, { fields: [wordSenses.wordId], references: [words.id] }),
  loanSources: many(wordSenseSources)
}))
