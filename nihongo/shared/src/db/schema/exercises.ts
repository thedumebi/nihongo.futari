import { relations, sql } from 'drizzle-orm'
import { boolean, index, integer, jsonb, pgTable, primaryKey, smallint, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

import { users } from './auth.js'
import { primaryId, timestamps } from './columns.js'
import { grammarPoints } from './grammar.js'
import { languages } from './languages.js'
import { studyItemFacets } from './study-items.js'

/**
 * The exercise engine is data-driven, not a switch statement over content type.
 *
 * `graderCode` names a pure function in shared/src/lib/grading; `inputMode`
 * tells the client which component to mount. Adding an exercise type is a row
 * here plus a component in the frontend registry — no backend branching.
 *
 * `typed-cloze` is the default because producing an answer beats recognising
 * one; `mcq` is marked `firstExposureOnly` so it introduces an item and then
 * gets out of the way. (This is exactly where Bunpo gets criticised: it stays
 * multiple-choice forever.)
 */
export const exerciseTemplates = pgTable('exercise_templates', {
  id: primaryId(),
  code: text('code').notNull(),
  /** Null = universal across languages. */
  languageId: text('language_id').references(() => languages.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  appliesToKinds: text('applies_to_kinds').array().notNull().default([]),
  appliesToFacets: text('applies_to_facets').array().notNull().default([]),
  inputMode: text('input_mode').notNull(), // text | choice | ordering | canvas | audio | none
  graderCode: text('grader_code').notNull(), // exact-kana | normalised-jp | choice-id | sequence | stroke-match | fuzzy-romaji
  requires: jsonb('requires').$type<{ audio?: boolean, strokes?: boolean, sentence?: boolean }>().notNull().default({}),
  firstExposureOnly: boolean('first_exposure_only').notNull().default(false),
  config: jsonb('config').$type<Record<string, unknown>>().notNull().default({}),
  weight: integer('weight').notNull().default(1),
  active: boolean('active').notNull().default(true),
  ...timestamps
}, t => ({
  codeUnique: uniqueIndex('exercise_templates_code_unique').on(t.code, t.languageId)
}))

/**
 * The DEFAULT template pool, keyed by (kind, facet). A small config table —
 * a few dozen rows — rather than a row per item.
 */
export const kindFacetTemplates = pgTable('kind_facet_templates', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  facet: text('facet').notNull(),
  templateId: text('template_id').notNull().references(() => exerciseTemplates.id, { onDelete: 'cascade' }),
  weight: integer('weight').notNull().default(1),
  minState: smallint('min_state'),
  maxReps: integer('max_reps'),
  firstExposureOnly: boolean('first_exposure_only').notNull().default(false),
  ...timestamps
}, t => ({
  comboUnique: uniqueIndex('kind_facet_templates_unique').on(t.languageId, t.kind, t.facet, t.templateId)
}))

/** Sparse per-item override. Only written when an item needs to differ. */
export const studyItemFacetTemplates = pgTable('study_item_facet_templates', {
  facetId: text('facet_id').notNull().references(() => studyItemFacets.id, { onDelete: 'cascade' }),
  templateId: text('template_id').notNull().references(() => exerciseTemplates.id, { onDelete: 'cascade' }),
  weight: integer('weight').notNull().default(1),
  enabled: boolean('enabled').notNull().default(true),
  ...timestamps
}, t => ({
  comboUnique: uniqueIndex('study_item_facet_templates_unique').on(t.facetId, t.templateId)
}))

/**
 * Materialised prompts, so an offline bundle can ship something renderable and
 * gradeable without running generation in the browser.
 *
 * Generate LAZILY on first need plus a nightly warmer for the coming horizon —
 * eagerly cross-joining items x templates x versions explodes fast.
 */
export const exercisePrompts = pgTable('exercise_prompts', {
  id: primaryId(),
  facetId: text('facet_id').notNull().references(() => studyItemFacets.id, { onDelete: 'cascade' }),
  templateId: text('template_id').notNull().references(() => exerciseTemplates.id, { onDelete: 'cascade' }),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  /** Discriminated union, validated by Zod in shared/src/types/exercises.ts. */
  prompt: jsonb('prompt').$type<Record<string, unknown>>().notNull(),
  answer: jsonb('answer').$type<{ primary: string, accepted: string[] }>().notNull(),
  distractors: jsonb('distractors').$type<unknown[]>().notNull().default([]),
  assets: jsonb('assets').$type<Record<string, unknown>>().notNull().default({}),
  /**
   * Withhold this prompt until that grammar point has been learned.
   *
   * The gate is on the PROMPT and not on `study_item_prerequisites`, which is
   * keyed per item: 仕事 arrives at sort_index 154 carrying its meaning, its
   * reading AND its four conjugation drills, while 〜た is at 173 and 〜ない at
   * 188. Blocking the item would delay the word to fix the drills. This holds
   * back only the drills.
   */
  requiresGrammarPointId: text('requires_grammar_point_id')
    .references(() => grammarPoints.id, { onDelete: 'set null' }),
  contentHash: text('content_hash'),
  version: integer('version').notNull().default(1),
  generatedBy: text('generated_by').notNull().default('system'),
  status: text('status').notNull().default('published'),
  ...timestamps
}, t => ({
  promptUnique: uniqueIndex('exercise_prompts_unique').on(t.facetId, t.templateId, t.version),
  facetIdx: index('exercise_prompts_facet_idx').on(t.facetId).where(sql`${t.status} = 'published'`)
}))

export const exerciseTemplatesRelations = relations(exerciseTemplates, ({ many }) => ({
  prompts: many(exercisePrompts)
}))

/**
 * Questions missed during a lesson, to be asked again first.
 *
 * The owner's ask: "if I do a lesson I can review the questions later" — not
 * the topic in general, the specific questions he got wrong.
 *
 * A row here does not create a card or change any count. It only reorders
 * which prompt a facet shows next (see `promptPick`), so the reader meets the
 * question they missed rather than a random sibling of it. Cleared when they
 * finally get it right in review, at which point it returns to the rotation.
 */
export const lessonMisses = pgTable('lesson_misses', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  promptId: text('prompt_id').notNull().references(() => exercisePrompts.id, { onDelete: 'cascade' }),
  missedAt: timestamp('missed_at').notNull().defaultNow(),
  /** Null while still owed. Set when answered correctly in review. */
  clearedAt: timestamp('cleared_at'),
  ...timestamps
}, t => ({
  pk: primaryKey({ columns: [t.userId, t.promptId] }),
  /** The lookup `promptPick` makes: what does this reader still owe? */
  outstandingIdx: index('lesson_misses_outstanding_idx').on(t.userId).where(sql`${t.clearedAt} is null`)
}))
