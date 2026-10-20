import { relations, sql } from 'drizzle-orm'
import { boolean, check, index, integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'

import { primaryId, timestamps } from './columns.js'
import { grammarPoints } from './grammar.js'
import { languages } from './languages.js'
import { provenance } from './ops.js'
import { sentences } from './sentences.js'

/**
 * The Particles game: a published sentence with one particle taken out, and
 * four to choose from.
 *
 * Authored, not cut from the tokens. The tokeniser leaves が and を untagged
 * and files には as one word, and a gap often takes more than one particle
 * (は or が, に or へ), so every question names its answer, the others that
 * would also be right, and three that are wrong in that sentence.
 *
 * A set is one particle lesson's questions, reviewed together: the seed brings
 * it in unpublished with one review-queue row, and approving that row is the
 * only thing that publishes it.
 */
export const particleSets = pgTable('particle_sets', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  grammarPointId: text('grammar_point_id').notNull().references(() => grammarPoints.id, { onDelete: 'cascade' }),
  published: boolean('published').notNull().default(false),
  ...provenance,
  ...timestamps
}, t => ({
  pointUnique: uniqueIndex('particle_sets_point_unique').on(t.grammarPointId)
}))

export const particleQuestions = pgTable('particle_questions', {
  id: primaryId(),
  setId: text('set_id').notNull().references(() => particleSets.id, { onDelete: 'cascade' }),
  sentenceId: text('sentence_id').notNull().references(() => sentences.id, { onDelete: 'cascade' }),
  /** The gap, as code-point offsets into the sentence's text: には can lose just its に. */
  blankStart: integer('blank_start').notNull(),
  blankEnd: integer('blank_end').notNull(),
  /** What the sentence says in the gap. */
  answer: text('answer').notNull(),
  /** Others that would be just as right here. Never offered as options. */
  alsoRight: text('also_right').array().notNull().default([]),
  /** Three particles that are wrong in this sentence. */
  wrong: text('wrong').array().notNull(),
  /** Why the answer, in one line, shown after answering. */
  note: text('note').notNull(),
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
}, t => ({
  gapUnique: uniqueIndex('particle_questions_gap_unique').on(t.setId, t.sentenceId, t.blankStart),
  setIdx: index('particle_questions_set_idx').on(t.setId, t.sortIndex),
  gapValid: check('particle_questions_gap_valid', sql`${t.blankEnd} > ${t.blankStart} and ${t.blankStart} >= 0`),
  threeWrong: check('particle_questions_three_wrong', sql`cardinality(${t.wrong}) = 3`)
}))

export const particleSetsRelations = relations(particleSets, ({ one, many }) => ({
  language: one(languages, { fields: [particleSets.languageId], references: [languages.id] }),
  grammarPoint: one(grammarPoints, { fields: [particleSets.grammarPointId], references: [grammarPoints.id] }),
  questions: many(particleQuestions)
}))

export const particleQuestionsRelations = relations(particleQuestions, ({ one }) => ({
  set: one(particleSets, { fields: [particleQuestions.setId], references: [particleSets.id] }),
  sentence: one(sentences, { fields: [particleQuestions.sentenceId], references: [sentences.id] })
}))
