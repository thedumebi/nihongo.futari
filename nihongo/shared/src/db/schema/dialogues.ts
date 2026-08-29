import { relations, sql } from 'drizzle-orm'
import { boolean, check, index, integer, jsonb, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'

import { primaryId, timestamps } from './columns.js'
import { languageLevels, languages } from './languages.js'
import { curriculumUnits } from './study-items.js'

/**
 * Scripted conversations.
 *
 * A target user's feedback was "I want to have conversations, but I do want to
 * know it is correct". Those pull against each other: the more open-ended the
 * exchange, the less a verdict means. A fixed script resolves it — the reply
 * options are known, so "correct" is a fact rather than a judgement, and a
 * wrong choice can say WHY rather than just no.
 *
 * That last part is the why-layer applied to conversation, and it is the
 * reason this is worth building rather than bolting a chatbot on: a model can
 * hold a conversation, but it cannot reliably tell you which particle you got
 * wrong and why.
 */
export const dialogues = pgTable('dialogues', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  levelId: text('level_id').references(() => languageLevels.id, { onDelete: 'set null' }),
  /**
   * The scenario this belongs to — at a restaurant, at the ward office.
   * Optional: a dialogue can teach a pattern rather than a place.
   */
  unitId: text('unit_id').references(() => curriculumUnits.id, { onDelete: 'set null' }),
  code: text('code').notNull(),
  title: text('title').notNull(),
  /** One line of setup, so the reader knows who they are and what they want. */
  situation: text('situation').notNull(),
  /**
   * This conversation's own illustration.
   *
   * Per conversation, not per unit. Unit art was tried first and was wrong:
   * the four restaurant conversations all showed the same restaurant, so the
   * picture told you nothing the group heading had not already said. Ordering,
   * paying, mentioning an allergy and splitting the bill are four different
   * moments and get four different drawings.
   *
   * Nullable, and only populated for a drawing that EXISTS on disk — a card
   * with no image beats a card pointing at a 404.
   */
  imageUrl: text('image_url'),
  published: boolean('published').notNull().default(false),
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
}, t => ({
  codeUnique: uniqueIndex('dialogues_code_unique').on(t.languageId, t.code),
  levelIdx: index('dialogues_level_idx').on(t.languageId, t.levelId, t.sortIndex)
}))

/**
 * One line of the script, in order.
 *
 * `readingKana` is stored rather than derived. Deriving it would mean running
 * the furigana aligner at render time and then `kanaToRomaji` over the result,
 * and that pipeline gets particles wrong: は is わ, へ is え, を is お when they
 * are particles, and nothing in the data says which は is which — the tokeniser
 * left `pos` empty on every row. An author knows. The heuristic does not.
 *
 * `sentences.reading_kana` is the same slot one table over, and it is NULL on
 * every row because nothing ever filled it in. Do not repeat that here.
 */
export const dialogueTurns = pgTable('dialogue_turns', {
  id: primaryId(),
  dialogueId: text('dialogue_id').notNull().references(() => dialogues.id, { onDelete: 'cascade' }),
  index: integer('index').notNull(),
  /** Who says it: the other party, or the learner. */
  speaker: text('speaker').notNull(), // other | learner
  /** Japanese as written, kanji and all. */
  text: text('text').notNull(),
  /** The same line in kana, with particles as they are SPOKEN. */
  readingKana: text('reading_kana').notNull(),
  /** Pre-aligned ruby, same shape as sentence_tokens.furigana. */
  furigana: jsonb('furigana').$type<Array<{ t: string, r?: string }>>(),
  translation: text('translation').notNull(),
  ...timestamps
}, t => ({
  orderUnique: uniqueIndex('dialogue_turns_order_unique').on(t.dialogueId, t.index),
  dialogueIdx: index('dialogue_turns_dialogue_idx').on(t.dialogueId)
}))

/**
 * The options offered on a learner's turn.
 *
 * Exactly one is correct, enforced at import rather than by constraint — a
 * check would have to count siblings, which Postgres cannot do in a row-level
 * CHECK. The importer asserts it instead.
 *
 * `whyWrong` is the load-bearing column. Without it this is a quiz; with it,
 * choosing "menyuu ga kudasai" teaches that kudasai takes を because you are
 * asking FOR the menu, not saying the menu acts. `grammar_mistakes.whyWrong`
 * is the same idea, already rendered on the grammar detail page.
 */
export const dialogueReplies = pgTable('dialogue_replies', {
  id: primaryId(),
  turnId: text('turn_id').notNull().references(() => dialogueTurns.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  readingKana: text('reading_kana').notNull(),
  furigana: jsonb('furigana').$type<Array<{ t: string, r?: string }>>(),
  translation: text('translation'),
  isCorrect: boolean('is_correct').notNull().default(false),
  /** Why this one is wrong. Required on every wrong option; null on the right one. */
  whyWrong: text('why_wrong'),
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
}, t => ({
  turnIdx: index('dialogue_replies_turn_idx').on(t.turnId, t.sortIndex),
  // A wrong option with no explanation is the failure this table exists to
  // prevent, so the database refuses it rather than trusting the author.
  wrongNeedsReason: check(
    'dialogue_replies_wrong_needs_reason',
    sql`${t.isCorrect} or ${t.whyWrong} is not null`
  )
}))

export const dialoguesRelations = relations(dialogues, ({ one, many }) => ({
  language: one(languages, { fields: [dialogues.languageId], references: [languages.id] }),
  level: one(languageLevels, { fields: [dialogues.levelId], references: [languageLevels.id] }),
  unit: one(curriculumUnits, { fields: [dialogues.unitId], references: [curriculumUnits.id] }),
  turns: many(dialogueTurns)
}))

export const dialogueTurnsRelations = relations(dialogueTurns, ({ one, many }) => ({
  dialogue: one(dialogues, { fields: [dialogueTurns.dialogueId], references: [dialogues.id] }),
  replies: many(dialogueReplies)
}))

export const dialogueRepliesRelations = relations(dialogueReplies, ({ one }) => ({
  turn: one(dialogueTurns, { fields: [dialogueReplies.turnId], references: [dialogueTurns.id] })
}))
