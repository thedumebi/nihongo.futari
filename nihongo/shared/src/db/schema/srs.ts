import { relations, sql } from 'drizzle-orm'
import {
  bigint,
  boolean,
  date,
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
import { languages } from './languages.js'
import { studyItemFacets, studyItems } from './study-items.js'

/**
 * A scheduled card: one per (user, facet).
 *
 * IMPORTANT: this table is a DERIVED CACHE, not the source of truth.
 * `srs_review_logs` is. Card state is a deterministic fold over that log, which
 * is what makes offline sync correct — see sync.service.ts.
 *
 * FSRS floats are `doublePrecision` (not `real`) so a replay reproduces
 * bit-identical values.
 */
export const srsCards = pgTable('srs_cards', {
  id: primaryId(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  facetId: text('facet_id').notNull().references(() => studyItemFacets.id, { onDelete: 'cascade' }),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),

  // FSRS state
  due: timestamp('due', { withTimezone: true }).notNull().defaultNow(),
  stability: doublePrecision('stability').notNull().default(0),
  difficulty: doublePrecision('difficulty').notNull().default(0),
  elapsedDays: integer('elapsed_days').notNull().default(0),
  scheduledDays: integer('scheduled_days').notNull().default(0),
  learningSteps: integer('learning_steps').notNull().default(0),
  reps: integer('reps').notNull().default(0),
  lapses: integer('lapses').notNull().default(0),
  state: smallint('state').notNull().default(0), // 0 New | 1 Learning | 2 Review | 3 Relearning
  lastReview: timestamp('last_review', { withTimezone: true }),

  suspended: boolean('suspended').notNull().default(false),
  buriedUntil: timestamp('buried_until', { withTimezone: true }),

  // Ghost state — items that keep getting forgotten get a harder schedule and
  // a visible marker, rather than quietly cycling forever.
  ghost: boolean('ghost').notNull().default(false),
  ghostSince: timestamp('ghost_since'),
  ghostReason: text('ghost_reason'),
  ghostLapseStreak: integer('ghost_lapse_streak').notNull().default(0),

  consecutiveCorrect: integer('consecutive_correct').notNull().default(0),
  totalCorrect: integer('total_correct').notNull().default(0),
  totalReviews: integer('total_reviews').notNull().default(0),
  firstSeenAt: timestamp('first_seen_at'),
  lastCorrectAt: timestamp('last_correct_at'),

  /** Head of applied history; lets the fast path skip a full replay. */
  lastAppliedLogId: text('last_applied_log_id'),
  /** Bumped on every recompute so clients know to drop cached state. */
  historyVersion: integer('history_version').notNull().default(0),
  replayGeneration: integer('replay_generation').notNull().default(0),
  replayTruncated: boolean('replay_truncated').notNull().default(false),
  ...timestamps
}, t => ({
  cardUnique: uniqueIndex('srs_cards_unique').on(t.userId, t.facetId),
  // The core queue query.
  dueIdx: index('srs_cards_due_idx').on(t.userId, t.due).where(sql`not ${t.suspended}`),
  stateIdx: index('srs_cards_state_idx').on(t.userId, t.languageId, t.state),
  ghostIdx: index('srs_cards_ghost_idx').on(t.userId).where(sql`${t.ghost}`)
}))

/**
 * Append-only. THE SOURCE OF TRUTH.
 *
 * `id` is minted BY THE CLIENT as a UUIDv7 — it sorts by time, it can be
 * generated offline, and it makes the insert idempotent (`ON CONFLICT DO
 * NOTHING`), so a retried or duplicated flush costs nothing.
 *
 * Formally the log set is a G-Set: grow-only, merge = union, keyed by that
 * client-minted id. Card state is a deterministic fold over it, so two devices
 * that both went offline converge on identical state regardless of which syncs
 * first. No review is ever discarded and there is no last-write-wins anywhere.
 *
 * The `*Before`/`*After` snapshot columns are rewritten during a replay, which
 * is why `replayGeneration` is recorded alongside them.
 */
export const srsReviewLogs = pgTable('srs_review_logs', {
  id: text('id').primaryKey(), // client-minted UUIDv7
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cardId: text('card_id').notNull().references(() => srsCards.id, { onDelete: 'cascade' }),
  facetId: text('facet_id').notNull().references(() => studyItemFacets.id, { onDelete: 'cascade' }),
  studyItemId: text('study_item_id').references(() => studyItems.id, { onDelete: 'set null' }),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  sessionId: text('session_id'),

  rating: smallint('rating').notNull(), // 1 Again | 2 Hard | 3 Good | 4 Easy

  /** Logical review time, clock-corrected and clamped server-side. */
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }).notNull(),
  clientReviewedAt: timestamp('client_reviewed_at', { withTimezone: true }),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),

  clientId: text('client_id'),
  clientSeq: bigint('client_seq', { mode: 'number' }),
  offline: boolean('offline').notNull().default(false),
  clockAdjusted: boolean('clock_adjusted').notNull().default(false),

  durationMs: integer('duration_ms'),
  exerciseTemplateId: text('exercise_template_id'),
  exercisePromptId: text('exercise_prompt_id'),
  answerGiven: text('answer_given'),
  isCorrect: boolean('is_correct'),
  hintsUsed: integer('hints_used').notNull().default(0),

  // Scheduler snapshot — rewritten on replay.
  stateBefore: smallint('state_before'),
  stabilityBefore: doublePrecision('stability_before'),
  difficultyBefore: doublePrecision('difficulty_before'),
  dueBefore: timestamp('due_before', { withTimezone: true }),
  elapsedDays: integer('elapsed_days'),
  lastElapsedDays: integer('last_elapsed_days'),
  scheduledDays: integer('scheduled_days'),
  stateAfter: smallint('state_after'),
  stabilityAfter: doublePrecision('stability_after'),
  difficultyAfter: doublePrecision('difficulty_after'),
  dueAfter: timestamp('due_after', { withTimezone: true }),

  applied: boolean('applied').notNull().default(true),
  /** Set when two devices logged the same card within seconds; kept for audit. */
  superseded: boolean('superseded').notNull().default(false),
  replayGeneration: integer('replay_generation').notNull().default(0),
  ...timestamps
}, t => ({
  // Second idempotency key, for clients that resend without preserving ids.
  clientSeqUnique: uniqueIndex('srs_review_logs_client_seq_unique')
    .on(t.userId, t.clientId, t.clientSeq)
    .where(sql`${t.clientId} is not null`),
  // THE replay query.
  replayIdx: index('srs_review_logs_replay_idx').on(t.userId, t.cardId, t.reviewedAt, t.id),
  userTimeIdx: index('srs_review_logs_user_time_idx').on(t.userId, t.reviewedAt)
}))

export const reviewSessions = pgTable('review_sessions', {
  id: primaryId(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  mode: text('mode').notNull().default('due'), // due | new | ghost | cram | level-test
  plannedCount: integer('planned_count').notNull().default(0),
  completedCount: integer('completed_count').notNull().default(0),
  correctCount: integer('correct_count').notNull().default(0),
  source: text('source').notNull().default('online'), // online | offline-sync
  deviceId: text('device_id'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  ...timestamps
}, t => ({
  userIdx: index('review_sessions_user_idx').on(t.userId, t.startedAt)
}))

export const srsGhostEvents = pgTable('srs_ghost_events', {
  id: primaryId(),
  cardId: text('card_id').notNull().references(() => srsCards.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  event: text('event').notNull(), // flagged | escalated | cleared
  lapsesAtEvent: integer('lapses_at_event'),
  reason: text('reason'),
  ...timestamps
}, t => ({
  cardIdx: index('srs_ghost_events_card_idx').on(t.cardId, t.createdAt)
}))

/**
 * Per-local-date rollup.
 *
 * REBUILT BY DELETE+INSERT for affected dates, never incremented — increments
 * double-count under replay, and this is the single most likely place for the
 * offline sync to quietly corrupt data. `localDate` is computed with the user's
 * IANA timezone at write time and the timezone is stored alongside, so a
 * traveller's history stays correct.
 */
export const srsDailyStats = pgTable('srs_daily_stats', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  localDate: date('local_date').notNull(),
  timezone: text('timezone').notNull(),
  newCount: integer('new_count').notNull().default(0),
  reviewCount: integer('review_count').notNull().default(0),
  correctCount: integer('correct_count').notNull().default(0),
  lapseCount: integer('lapse_count').notNull().default(0),
  timeMs: integer('time_ms').notNull().default(0),
  xpEarned: integer('xp_earned').notNull().default(0),
  ...timestamps
}, t => ({
  pk: primaryKey({ columns: [t.userId, t.languageId, t.localDate] })
}))

export const srsCardsRelations = relations(srsCards, ({ one, many }) => ({
  user: one(users, { fields: [srsCards.userId], references: [users.id] }),
  facet: one(studyItemFacets, { fields: [srsCards.facetId], references: [studyItemFacets.id] }),
  logs: many(srsReviewLogs)
}))

export const srsReviewLogsRelations = relations(srsReviewLogs, ({ one }) => ({
  card: one(srsCards, { fields: [srsReviewLogs.cardId], references: [srsCards.id] })
}))
