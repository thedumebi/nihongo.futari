import { relations, sql } from 'drizzle-orm'
import { boolean, check, index, integer, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

import { users } from './auth.js'
import { primaryId, timestamps } from './columns.js'
import { languageLevels, languages } from './languages.js'
import { provenance } from './ops.js'

/**
 * Speak: a build-up course in the Michel Thomas manner.
 *
 * A teacher explains one small piece in English, then asks "how would you
 * say…?"; the learner says it out loud and hears the answer. Each prompt adds
 * a piece to the last, so the sentence grows rather than being memorised.
 *
 * Linear and self-paced on purpose: the method's whole claim is that the
 * sequence does the remembering, so a session is done when the learner has
 * worked through it, not when a scheduler says so. The one way in to the SRS is
 * a miss — a prompt answered "Not quite" becomes a study item card for that
 * learner (`study_items.speak_step_id`).
 */
export const speakSessions = pgTable('speak_sessions', {
  id: primaryId(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  levelId: text('level_id').notNull().references(() => languageLevels.id, { onDelete: 'restrict' }),
  code: text('code').notNull(),
  /** Its place in the course — session 1, 2, 3 … */
  number: integer('number').notNull(),
  /** As written, kanji and all. */
  title: text('title').notNull(),
  titleEn: text('title_en').notNull(),
  published: boolean('published').notNull().default(false),
  ...provenance,
  ...timestamps
}, t => ({
  codeUnique: uniqueIndex('speak_sessions_code_unique').on(t.languageId, t.code),
  orderIdx: index('speak_sessions_order_idx').on(t.languageId, t.number)
}))

/**
 * One beat of a session, in order: the teacher explaining, or a prompt to answer.
 *
 * `readingKana` is authored for the same reason as everywhere else: a particle
 * は cannot be told from the は inside はい without part-of-speech.
 */
export const speakSteps = pgTable('speak_steps', {
  id: primaryId(),
  sessionId: text('session_id').notNull().references(() => speakSessions.id, { onDelete: 'cascade' }),
  index: integer('index').notNull(),
  /** explain | prompt */
  kind: text('kind').notNull(),
  /** What the teacher says — the explanation, or the English to put into Japanese. */
  en: text('en').notNull(),
  /** The answer, as written. Prompts only. */
  text: text('text'),
  /** The answer in kana, particles as spoken. Prompts only. */
  readingKana: text('reading_kana'),
  /** A one-line "why", shown once the answer is out. */
  note: text('note'),
  ...timestamps
}, t => ({
  orderUnique: uniqueIndex('speak_steps_order_unique').on(t.sessionId, t.index),
  // A prompt without an answer cannot be checked, and an explanation with one
  // would be a prompt in disguise. The database refuses both.
  answerMatchesKind: check(
    'speak_steps_answer_matches_kind',
    sql`(${t.kind} = 'prompt' and ${t.text} is not null and ${t.readingKana} is not null)
      or (${t.kind} = 'explain' and ${t.text} is null and ${t.readingKana} is null)`
  )
}))

/**
 * Where a learner has got to.
 *
 * One row per learner and session, replaced on each run: a marker of the
 * latest attempt, not a count, so replaying a completion cannot inflate it.
 */
export const speakProgress = pgTable('speak_progress', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull().references(() => speakSessions.id, { onDelete: 'cascade' }),
  completedAt: timestamp('completed_at').notNull().defaultNow(),
  /** Prompts answered "Got it" on the first try, out of `total`. */
  gotIt: integer('got_it').notNull(),
  total: integer('total').notNull(),
  ...timestamps
}, t => ({
  pk: primaryKey({ columns: [t.userId, t.sessionId] })
}))

export const speakSessionsRelations = relations(speakSessions, ({ one, many }) => ({
  language: one(languages, { fields: [speakSessions.languageId], references: [languages.id] }),
  level: one(languageLevels, { fields: [speakSessions.levelId], references: [languageLevels.id] }),
  steps: many(speakSteps)
}))

export const speakStepsRelations = relations(speakSteps, ({ one }) => ({
  session: one(speakSessions, { fields: [speakSteps.sessionId], references: [speakSessions.id] })
}))
