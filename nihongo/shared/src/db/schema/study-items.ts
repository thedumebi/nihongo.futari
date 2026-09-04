import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core'

import { users } from './auth.js'
import { primaryId, timestamps } from './columns.js'
import { dialogues } from './dialogues.js'
import { grammarPoints } from './grammar.js'
import { kana } from './kana.js'
import { kanji, phoneticSeries } from './kanji.js'
import { languageLevels, languages } from './languages.js'
import { sentences } from './sentences.js'
import { words } from './words.js'

/**
 * The single SRS anchor. Everything schedulable hangs off this table.
 *
 * Polymorphism is an EXCLUSIVE ARC — N nullable FKs plus a check that exactly
 * one is set — rather than a `(type, id)` string pair. That keeps real foreign
 * keys, real cascades and trivial joins, none of which a string pair gives you.
 *
 * If a new content kind appears, add a table and an arm. Do NOT add
 * `payload jsonb`; that is the generic-blob failure mode arriving by the back
 * door, and it is the abstraction leak this design exists to prevent.
 */
export const studyItems = pgTable('study_items', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(), // kana | kanji | word | grammar | sentence | phonetic-series | dialogue

  kanaId: text('kana_id').references(() => kana.id, { onDelete: 'cascade' }),
  kanjiId: text('kanji_id').references(() => kanji.id, { onDelete: 'cascade' }),
  wordId: text('word_id').references(() => words.id, { onDelete: 'cascade' }),
  grammarPointId: text('grammar_point_id').references(() => grammarPoints.id, { onDelete: 'cascade' }),
  sentenceId: text('sentence_id').references(() => sentences.id, { onDelete: 'cascade' }),
  phoneticSeriesId: text('phonetic_series_id').references(() => phoneticSeries.id, { onDelete: 'cascade' }),
  dialogueId: text('dialogue_id').references(() => dialogues.id, { onDelete: 'cascade' }),

  levelId: text('level_id').references(() => languageLevels.id, { onDelete: 'set null' }),
  frequencyRank: integer('frequency_rank'),
  difficultyHint: doublePrecision('difficulty_hint'),
  published: boolean('published').notNull().default(false),
  active: boolean('active').notNull().default(true),
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
}, t => ({
  exactlyOneTarget: check(
    'study_items_exactly_one_target',
    sql`num_nonnulls(${t.kanaId}, ${t.kanjiId}, ${t.wordId}, ${t.grammarPointId}, ${t.sentenceId}, ${t.phoneticSeriesId}, ${t.dialogueId}) = 1`
  ),
  queueIdx: index('study_items_queue_idx')
    .on(t.languageId, t.levelId, t.sortIndex)
    .where(sql`${t.published} and ${t.active}`),
  kanaUnique: uniqueIndex('study_items_kana_unique').on(t.kanaId).where(sql`${t.kanaId} is not null`),
  kanjiUnique: uniqueIndex('study_items_kanji_unique').on(t.kanjiId).where(sql`${t.kanjiId} is not null`),
  wordUnique: uniqueIndex('study_items_word_unique').on(t.wordId).where(sql`${t.wordId} is not null`),
  grammarUnique: uniqueIndex('study_items_grammar_unique').on(t.grammarPointId).where(sql`${t.grammarPointId} is not null`),
  sentenceUnique: uniqueIndex('study_items_sentence_unique').on(t.sentenceId).where(sql`${t.sentenceId} is not null`),
  seriesUnique: uniqueIndex('study_items_series_unique').on(t.phoneticSeriesId).where(sql`${t.phoneticSeriesId} is not null`),
  dialogueUnique: uniqueIndex('study_items_dialogue_unique').on(t.dialogueId).where(sql`${t.dialogueId} is not null`)
}))

/**
 * The actual SRS unit. A word is not one card — recognising 食べる, producing
 * it, reading it aloud and hearing it are four independent skills that decay at
 * different rates, so each gets its own schedule.
 *
 * The scheduler only ever touches this table's id. That is the whole
 * polymorphism contract: it never needs to know what kind of thing it is
 * scheduling.
 */
export const studyItemFacets = pgTable('study_item_facets', {
  id: primaryId(),
  studyItemId: text('study_item_id').notNull().references(() => studyItems.id, { onDelete: 'cascade' }),
  facet: text('facet').notNull(), // meaning | production | reading | listening | writing | usage | pitch
  enabled: boolean('enabled').notNull().default(true),
  weight: integer('weight').notNull().default(1),
  introOrder: integer('intro_order').notNull().default(0),
  ...timestamps
}, t => ({
  facetUnique: uniqueIndex('study_item_facets_unique').on(t.studyItemId, t.facet),
  enabledIdx: index('study_item_facets_enabled_idx').on(t.studyItemId).where(sql`${t.enabled}`)
}))

/** Don't teach 食べます before 食べる. `hard` blocks; `soft` only reorders. */
export const studyItemPrerequisites = pgTable('study_item_prerequisites', {
  itemId: text('item_id').notNull().references(() => studyItems.id, { onDelete: 'cascade' }),
  requiresItemId: text('requires_item_id').notNull().references(() => studyItems.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull().default('soft'), // hard | soft
  ...timestamps
}, t => ({
  pk: primaryKey({ columns: [t.itemId, t.requiresItemId] }),
  requiresIdx: index('study_item_prerequisites_requires_idx').on(t.requiresItemId)
}))

/**
 * Which lessons a user has actually read.
 *
 * `isNew` cannot answer this: it goes false the moment the first card is
 * answered, so it can gate a lesson once and can never say afterwards whether
 * the lesson was read. The Course needs a read mark, and a lesson opened ahead
 * of its stage has to be remembered without pulling its cards into the queue.
 *
 * Keyed on the study item rather than the grammar point so kana and kanji
 * lessons can follow without a second table.
 */
export const lessonViews = pgTable('lesson_views', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  studyItemId: text('study_item_id').notNull().references(() => studyItems.id, { onDelete: 'cascade' }),
  firstSeenAt: timestamp('first_seen_at').notNull().defaultNow(),
  /**
   * When the lesson's QUIZ was finished, as opposed to merely opened.
   *
   * Two different facts. A row existing means the reader has met this item —
   * which is what suppresses the introduction and what admits a grammar topic
   * to review. `completed_at` means they went through the questions as well,
   * which is what the lesson list shows as done.
   */
  completedAt: timestamp('completed_at'),
  /** Percentage right on the last run through, for the list. */
  quizScore: smallint('quiz_score'),
  ...timestamps
}, t => ({
  pk: primaryKey({ columns: [t.userId, t.studyItemId] }),
  userIdx: index('lesson_views_user_idx').on(t.userId)
}))

/** Ordered lesson groupings — "N5 Unit 3". Optional; the SRS works without them. */
export const curriculumUnits = pgTable('curriculum_units', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  levelId: text('level_id').references(() => languageLevels.id, { onDelete: 'set null' }),
  code: text('code').notNull(), // n5-01
  title: text('title').notNull(),
  description: text('description'),
  published: boolean('published').notNull().default(false),
  sortIndex: integer('sort_index').notNull().default(0),
  /** Hand-drawn scene for the deck header. Null where none is drawn yet. */
  imageUrl: text('image_url'),
  ...timestamps
}, t => ({
  codeUnique: uniqueIndex('curriculum_units_code_unique').on(t.languageId, t.code)
}))

export const curriculumUnitItems = pgTable('curriculum_unit_items', {
  unitId: text('unit_id').notNull().references(() => curriculumUnits.id, { onDelete: 'cascade' }),
  studyItemId: text('study_item_id').notNull().references(() => studyItems.id, { onDelete: 'cascade' }),
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
}, t => ({
  pk: primaryKey({ columns: [t.unitId, t.studyItemId] })
}))

export const studyItemsRelations = relations(studyItems, ({ one, many }) => ({
  language: one(languages, { fields: [studyItems.languageId], references: [languages.id] }),
  level: one(languageLevels, { fields: [studyItems.levelId], references: [languageLevels.id] }),
  kanji: one(kanji, { fields: [studyItems.kanjiId], references: [kanji.id] }),
  word: one(words, { fields: [studyItems.wordId], references: [words.id] }),
  grammarPoint: one(grammarPoints, { fields: [studyItems.grammarPointId], references: [grammarPoints.id] }),
  kana: one(kana, { fields: [studyItems.kanaId], references: [kana.id] }),
  facets: many(studyItemFacets)
}))

export const studyItemFacetsRelations = relations(studyItemFacets, ({ one }) => ({
  item: one(studyItems, { fields: [studyItemFacets.studyItemId], references: [studyItems.id] })
}))
