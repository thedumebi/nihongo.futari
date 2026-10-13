import { sql } from 'drizzle-orm'
import { check, index, integer, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'

import { users } from './auth.js'
import { timestamps } from './columns.js'
import { languageLevels, languages } from './languages.js'

/**
 * A learner's finished crosswords.
 *
 * Puzzles themselves are not stored: one is generated from the word lists and
 * a seed, and sent whole. What is kept is that a learner finished one, keyed
 * by `puzzleKey` — a hash of the grid actually played, because the seed alone
 * does not name a puzzle once the words behind it change (a "words I know"
 * puzzle shifts every time a card graduates).
 *
 * One row per learner and puzzle, replaced on each finish: a marker, not a
 * count, so a retried request cannot inflate anything.
 */
export const crosswordResults = pgTable('crossword_results', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  puzzleKey: text('puzzle_key').notNull(),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  levelId: text('level_id').notNull().references(() => languageLevels.id, { onDelete: 'restrict' }),
  /** CROSSWORD_SOURCES — daily, known, new, mix, loanwords. */
  source: text('source').notNull(),
  /** The words the grid used, so "played recently" can steer the next one. */
  wordIds: text('word_ids').array().notNull().default([]),
  bestSeconds: integer('best_seconds').notNull(),
  lastSeconds: integer('last_seconds').notNull(),
  hintsUsed: integer('hints_used').notNull().default(0),
  completedAt: timestamp('completed_at').notNull().defaultNow(),
  ...timestamps
}, t => ({
  pk: primaryKey({ columns: [t.userId, t.puzzleKey] }),
  recentIdx: index('crossword_results_recent_idx').on(t.userId, t.completedAt),
  sensibleTimes: check('crossword_results_sensible_times', sql`${t.bestSeconds} >= 0 and ${t.lastSeconds} >= 0 and ${t.hintsUsed} >= 0`)
}))
