import { pgSchema } from 'drizzle-orm/pg-core'

/**
 * The database's tables, grouped by who writes them. Organisation only: every
 * connection's search_path names all of them (`db/index.ts`), so raw SQL and
 * seeds keep using bare table names.
 */

/** Accounts, sessions and the invites that let someone sign up. */
export const authSchema = pgSchema('auth')

/** What is taught: languages, characters, words, grammar, lessons, prompts. */
export const contentSchema = pgSchema('content')

/** Sources, etymology, mnemonics, imports, enrichment and the review queue. */
export const editorialSchema = pgSchema('editorial')

/** One learner's study: cards, the review log, progress, settings. */
export const learnerSchema = pgSchema('learner')

/** Friends and the boards they share. */
export const socialSchema = pgSchema('social')

/** Email, push and notifications. */
export const opsSchema = pgSchema('ops')

/**
 * Every schema above, in search_path order (`db/index.ts`). A new schema goes
 * here too, and into the next migration's `ALTER DATABASE ... SET search_path`.
 */
export const appSchemas = [authSchema, contentSchema, editorialSchema, learnerSchema, socialSchema, opsSchema]
