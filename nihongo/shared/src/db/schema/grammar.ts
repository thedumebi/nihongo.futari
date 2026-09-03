import { relations } from 'drizzle-orm'
import { boolean, index, integer, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

import { users } from './auth.js'
import { primaryId, timestamps } from './columns.js'
import { languageLevels, languages } from './languages.js'
import { sentences } from './sentences.js'

/**
 * Grammar points are the part of this app no open dataset provides. Only the
 * LIST of JLPT points is sourced (a list of patterns is factual); every word of
 * `meaningLong`, `nuance` and the mistake explanations is authored here and
 * human-reviewed.
 *
 * Deliberately, NO importer ever writes to this table's prose columns. There is
 * no `provenance` spread and no `sourceRef` — which is also why nothing
 * third-party can be plagiarised into it even accidentally.
 */
export const grammarPoints = pgTable('grammar_points', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  title: text('title').notNull(), // 〜てしまう
  pattern: text('pattern').notNull(),
  levelId: text('level_id').references(() => languageLevels.id, { onDelete: 'set null' }),
  category: text('category'), // particle | auxiliary | conjunction | construction | expression | honorific
  register: text('register'), // formal | casual | written | literary | humble | honorific
  meaningShort: text('meaning_short').notNull(),
  meaningLong: text('meaning_long'),
  nuance: text('nuance'),
  frequencyRank: integer('frequency_rank'),
  status: text('status').notNull().default('draft'),
  published: boolean('published').notNull().default(false),
  reviewedBy: text('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
}, t => ({
  slugUnique: uniqueIndex('grammar_points_slug_unique').on(t.languageId, t.slug),
  levelIdx: index('grammar_points_level_idx').on(t.languageId, t.levelId, t.sortIndex)
}))

/**
 * How the pattern attaches. One row per part-of-speech it can follow, which is
 * what makes the conjugation drill generatable rather than hand-written.
 */
export const grammarFormations = pgTable('grammar_formations', {
  id: primaryId(),
  grammarPointId: text('grammar_point_id').notNull().references(() => grammarPoints.id, { onDelete: 'cascade' }),
  attachesTo: text('attaches_to').notNull(), // verb-plain | verb-te | verb-masu-stem | i-adj-stem | na-adj | noun
  ruleTemplate: text('rule_template').notNull(), // Vて + しまう
  example: text('example'),
  notes: text('notes'),
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
}, t => ({
  pointIdx: index('grammar_formations_point_idx').on(t.grammarPointId, t.sortIndex)
}))

/** Contracted and colloquial variants: ちゃう for てしまう. */
export const grammarVariants = pgTable('grammar_variants', {
  id: primaryId(),
  grammarPointId: text('grammar_point_id').notNull().references(() => grammarPoints.id, { onDelete: 'cascade' }),
  form: text('form').notNull(),
  register: text('register'),
  notes: text('notes'),
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
})

/**
 * The mistakes learners actually make. Bunpo's reviews complain about exercises
 * with too little context; this is the antidote — wrong form, right form, and
 * why, always as a full sentence pair.
 */
export const grammarMistakes = pgTable('grammar_mistakes', {
  id: primaryId(),
  grammarPointId: text('grammar_point_id').notNull().references(() => grammarPoints.id, { onDelete: 'cascade' }),
  wrong: text('wrong').notNull(),
  right: text('right').notNull(),
  whyWrong: text('why_wrong').notNull(),
  explanation: text('explanation'),
  reviewedBy: text('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
}, t => ({
  pointIdx: index('grammar_mistakes_point_idx').on(t.grammarPointId, t.sortIndex)
}))

/**
 * `contrast` is the one that earns its keep: it powers "don't confuse this
 * with…", which is the single most requested thing in grammar-app reviews.
 */
export const grammarPointRelationships = pgTable('grammar_relations', {
  fromId: text('from_id').notNull().references(() => grammarPoints.id, { onDelete: 'cascade' }),
  toId: text('to_id').notNull().references(() => grammarPoints.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(), // contrast | similar | prerequisite | more-formal-than | component-of
  note: text('note'),
  ...timestamps
}, t => ({
  pk: primaryKey({ columns: [t.fromId, t.toId, t.kind] }),
  toIdx: index('grammar_relations_to_idx').on(t.toId)
}))

/**
 * The example sentences a lesson is built from — Bunpo's 1,700, which is the
 * half of a grammar lesson this app never had.
 *
 * A join rather than a `grammar_examples` table, because `sentences` already
 * carries everything an example needs and everything a QUESTION needs: tokens
 * with per-token furigana and `wordId` (which is what makes tap-a-word
 * possible), `charStart`/`charEnd` (which is what lets the cloze engine blank
 * the right span), a translation row, and audio at `/audio/sentences/{id}.m4a`.
 * Authoring one example therefore yields the lesson card, the cloze and the
 * word-order drill at once.
 *
 * Examples are `source = 'authored'`, never Tatoeba: an example has to
 * demonstrate the point using vocabulary already introduced, which is not
 * something a found sentence can be relied on to do.
 */
export const grammarPointSentences = pgTable('grammar_point_sentences', {
  grammarPointId: text('grammar_point_id').notNull().references(() => grammarPoints.id, { onDelete: 'cascade' }),
  sentenceId: text('sentence_id').notNull().references(() => sentences.id, { onDelete: 'cascade' }),
  /** `example` teaches the point. `contrast` shows the neighbouring pattern it is confused with. */
  role: text('role').notNull().default('example'),
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
}, t => ({
  pk: primaryKey({ columns: [t.grammarPointId, t.sentenceId, t.role] }),
  pointIdx: index('grammar_point_sentences_point_idx').on(t.grammarPointId, t.sortIndex),
  sentenceIdx: index('grammar_point_sentences_sentence_idx').on(t.sentenceId)
}))

export const grammarPointsRelations = relations(grammarPoints, ({ one, many }) => ({
  language: one(languages, { fields: [grammarPoints.languageId], references: [languages.id] }),
  level: one(languageLevels, { fields: [grammarPoints.levelId], references: [languageLevels.id] }),
  formations: many(grammarFormations),
  variants: many(grammarVariants),
  mistakes: many(grammarMistakes),
  examples: many(grammarPointSentences)
}))

export const grammarPointSentencesRelations = relations(grammarPointSentences, ({ one }) => ({
  grammarPoint: one(grammarPoints, {
    fields: [grammarPointSentences.grammarPointId],
    references: [grammarPoints.id]
  }),
  sentence: one(sentences, { fields: [grammarPointSentences.sentenceId], references: [sentences.id] })
}))
