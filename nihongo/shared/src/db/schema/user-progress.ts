import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core'

import { users } from './auth.js'
import { primaryId, timestamps } from './columns.js'
import { kanji } from './kanji.js'
import { languageLevels, languages } from './languages.js'

export const userSettings = pgTable('user_settings', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  dailyNewLimit: integer('daily_new_limit').notNull().default(10),
  dailyReviewLimit: integer('daily_review_limit').notNull().default(200),
  sessionLength: integer('session_length').notNull().default(20),
  /** See FURIGANA_MODES in constants — the single vocabulary for this value. */
  // 'kana' is DEFAULT_FURIGANA_MODE in constants: kanji spelled out in hiragana.
  furiganaMode: text('furigana_mode').notNull().default('kana'),
  /**
   * The JLPT level the reader is working at, as a level CODE ('N5'), with the
   * empty string meaning every level.
   *
   * Server-side because `localStorage` alone could not hold it. A home-screen
   * web app on iOS keeps its own storage container, separate from the browser's,
   * so a level picked in Safari was invisible to the installed app; and iOS
   * evicts script-writable storage after a stretch of disuse, so even within one
   * container the choice quietly expired. Both look identical to the reader:
   * the app forgot.
   */
  studyLevel: text('study_level').notNull().default(''),
  romajiEnabled: boolean('romaji_enabled').notNull().default(false),
  autoplayAudio: boolean('autoplay_audio').notNull().default(true),
  audioSpeed: numeric('audio_speed', { precision: 3, scale: 2 }).notNull().default('1.00'),
  theme: text('theme').notNull().default('system'),
  /**
   * Local hour a "day" rolls over: midnight unless the learner picks a later
   * hour in Settings (a session past midnight then counts for the evening it
   * began in). Same value as DEFAULT_DAY_BOUNDARY_HOUR in the shared lib.
   */
  dayBoundaryHour: integer('day_boundary_hour').notNull().default(0),
  reminderEmailEnabled: boolean('reminder_email_enabled').notNull().default(true),
  reminderPushEnabled: boolean('reminder_push_enabled').notNull().default(false),
  reminderHour: integer('reminder_hour').notNull().default(19),
  /**
   * Minutes past the hour, in quarters: 0, 15, 30 or 45.
   *
   * The cron fires every fifteen minutes, so a quarter is the finest grain the
   * scheduler can actually honour — offering minutes would promise a precision
   * that does not exist.
   */
  reminderMinute: integer('reminder_minute').notNull().default(0),
  weeklySummaryEnabled: boolean('weekly_summary_enabled').notNull().default(true),
  /** An evening nudge when a streak of 3+ days has nothing in it yet today. */
  streakRiskEnabled: boolean('streak_risk_enabled').notNull().default(true),
  /** A weekly note when several cards keep getting forgotten. */
  ghostAlertEnabled: boolean('ghost_alert_enabled').notNull().default(true),
  /** Per-user FSRS weights, optimised nightly once there's enough history. */
  fsrsParams: jsonb('fsrs_params').$type<{
    w?: number[]
    requestRetention?: number
    maximumInterval?: number
    enableFuzz?: boolean
  }>().notNull().default({}),
  ghostThreshold: integer('ghost_threshold').notNull().default(4),
  ghostIntervalFactor: numeric('ghost_interval_factor', { precision: 3, scale: 2 }).notNull().default('0.50'),
  handwritingTolerance: numeric('handwriting_tolerance', { precision: 3, scale: 2 }).notNull().default('0.50'),
  /**
   * Where the learner is with onboarding — ONBOARDING_STATUSES in constants.
   * A new account starts `pending` and is sent to the welcome flow; accounts
   * from before onboarding existed were set to `offer` (seed 175).
   */
  onboardingStatus: text('onboarding_status').notNull().default('pending'),
  /** What they answered, as onboardingAnswersSchema; null until they have. */
  onboardingAnswers: jsonb('onboarding_answers').$type<Record<string, unknown>>(),
  /** When they put the first-week guide away; null while it is on Today. */
  guideDismissedAt: timestamp('guide_dismissed_at'),
  ...timestamps
})

export const userLanguages = pgTable('user_languages', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  currentLevelId: text('current_level_id').references(() => languageLevels.id, { onDelete: 'set null' }),
  targetLevelId: text('target_level_id').references(() => languageLevels.id, { onDelete: 'set null' }),
  isPrimary: boolean('is_primary').notNull().default(false),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  ...timestamps
}, t => ({
  pk: primaryKey({ columns: [t.userId, t.languageId] })
}))

/**
 * The highest stage a reader has been CONGRATULATED on, per level.
 *
 * Three things went wrong with the previous version, which kept this in
 * `localStorage` under `go-seen-stage`:
 *
 * 1. It was per device. "What was I last shown" is a fact about the account,
 *    so a second phone had no history, recorded whatever it saw first, and
 *    then congratulated on the way back up — "I am on stage 4 on one phone and
 *    I open the site on another and it shows me congrats that I have passed
 *    stage 1".
 *
 * 2. It stored the CURRENT stage, which is `min(stage) where learned < total`
 *    — the lowest unfinished stage, not the furthest reached. That number moves
 *    DOWN whenever content is added to an earlier stage, which seeds do
 *    routinely (`038-listening-cards.sql` added a listening facet to N5 words
 *    and demoted everyone). Recording a number that can fall and celebrating
 *    when it rises is celebrating noise.
 *
 * 3. It was written before the level had resolved, so the value recorded often
 *    belonged to a different level entirely.
 *
 * Hence: the HIGHEST stage ever reached, per level, on the server. It only ever
 * increases, so a stage that drops because new material arrived can never
 * re-fire a celebration when it is finished again.
 */
export const stageCelebrations = pgTable('stage_celebrations', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  levelId: text('level_id').notNull().references(() => languageLevels.id, { onDelete: 'cascade' }),
  highestStageSeen: integer('highest_stage_seen').notNull().default(0),
  ...timestamps
}, t => ({
  pk: primaryKey({ columns: [t.userId, t.levelId] })
}))

/**
 * Materialised, not derived on the fly: the furigana renderer needs an O(1)
 * set membership test per token, and the client caches it as a Set in
 * IndexedDB. Written by the SRS service on state transition and rebuilt on
 * replay.
 *
 * Promotion rule: the kanji's `reading` facet reaches Review state with
 * stability >= 21 days.
 */
export const userKnownKanji = pgTable('user_known_kanji', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kanjiId: text('kanji_id').notNull().references(() => kanji.id, { onDelete: 'cascade' }),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  knownAt: timestamp('known_at').notNull().defaultNow(),
  source: text('source').notNull().default('srs'), // srs | manual | placement-test
  strength: numeric('strength', { precision: 6, scale: 3 }),
  ...timestamps
}, t => ({
  pk: primaryKey({ columns: [t.userId, t.kanjiId] })
}))

export const userStreaks = pgTable('user_streaks', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastActiveDate: date('last_active_date'),
  timezoneAtLastActive: text('timezone_at_last_active'),
  freezeCount: integer('freeze_count').notNull().default(0),
  ...timestamps
}, t => ({
  pk: primaryKey({ columns: [t.userId, t.languageId] })
}))

/** Streak freeze: protects the chain on the day you'd otherwise break it and quit. */
export const streakFreezes = pgTable('streak_freezes', {
  id: primaryId(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  /** Per language, like the streak it protects. Null on a grant before this existed. */
  languageId: text('language_id').references(() => languages.id, { onDelete: 'cascade' }),
  grantedAt: timestamp('granted_at').notNull().defaultNow(),
  /** The study day an earned freeze was earned on; null for an admin grant. */
  earnedOn: date('earned_on'),
  usedOnDate: date('used_on_date'),
  reason: text('reason').notNull().default('earned'), // earned | admin
  ...timestamps
}, t => ({
  userIdx: index('streak_freezes_user_idx').on(t.userId).where(sql`${t.usedOnDate} is null`),
  // Earned rows are rebuilt wholesale from the streak fold; this keeps one per day.
  earnedUnique: uniqueIndex('streak_freezes_earned_unique').on(t.userId, t.languageId, t.reason, t.earnedOn)
}))

/**
 * Everything a learner does besides answering a review — finishing a lesson, a
 * Speak session, a crossword, a conversation, a speech.
 *
 * Append-only, like the review log, and for the same reason: the streak and
 * XP are folds over what happened, so what happened must never be overwritten.
 * The tables these activities already write (`lesson_views`,
 * `speak_progress`, `crossword_results`) keep only the LATEST run, so they
 * could not say which days a learner studied — and the streak counted review
 * days alone: a day of Speak and lessons "didn't happen".
 *
 * `id` is minted by the client (UUIDv7) so a queued offline record can be
 * flushed twice for free. `(user, kind, refId, localDate)` is unique too: the
 * same lesson finished twice in a day counts once, from any device.
 * `localDate` is computed at write time in the learner's own zone and day
 * boundary — never re-derived later, which would rewrite history if they move.
 */
export const learningActivities = pgTable('learning_activities', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  /** ACTIVITY_KINDS. */
  kind: text('kind').notNull(),
  /** What was done: a lesson slug, a session code, a puzzle key… */
  refId: text('ref_id').notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  localDate: date('local_date').notNull(),
  timezone: text('timezone').notNull(),
  score: integer('score'),
  total: integer('total'),
  durationMs: integer('duration_ms'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, t => ({
  oncePerDay: uniqueIndex('learning_activities_once_per_day').on(t.userId, t.kind, t.refId, t.localDate),
  dayIdx: index('learning_activities_day_idx').on(t.userId, t.languageId, t.localDate)
}))

/**
 * XP is event-sourced with `unique(userId, source, refId)`.
 *
 * That unique constraint is not decoration — it is what stops a review replay
 * from double-counting XP. Every derived write must either be keyed by log id
 * like this, or recomputed wholesale like srs_daily_stats.
 */
export const xpEvents = pgTable('xp_events', {
  id: primaryId(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  source: text('source').notNull(), // review | session-complete | streak | achievement | lesson
  refId: text('ref_id').notNull(),
  amount: integer('amount').notNull(),
  ...timestamps
}, t => ({
  dedupe: uniqueIndex('xp_events_dedupe').on(t.userId, t.source, t.refId),
  userIdx: index('xp_events_user_idx').on(t.userId, t.createdAt)
}))

export const userXp = pgTable('user_xp', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  totalXp: integer('total_xp').notNull().default(0),
  level: integer('level').notNull().default(1),
  ...timestamps
}, t => ({
  pk: primaryKey({ columns: [t.userId, t.languageId] })
}))

export const achievements = pgTable('achievements', {
  id: primaryId(),
  code: text('code').notNull().unique(),
  languageId: text('language_id').references(() => languages.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon'),
  category: text('category'),
  thresholdKind: text('threshold_kind').notNull(), // reviews | streak | items-learned | accuracy | kanji-known | handwriting
  threshold: integer('threshold').notNull(),
  secret: boolean('secret').notNull().default(false),
  sortIndex: integer('sort_index').notNull().default(0),
  ...timestamps
})

export const userAchievements = pgTable('user_achievements', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: text('achievement_id').notNull().references(() => achievements.id, { onDelete: 'cascade' }),
  unlockedAt: timestamp('unlocked_at'),
  progress: integer('progress').notNull().default(0),
  /** When the learner was shown the unlock — so it is celebrated once. */
  seenAt: timestamp('seen_at'),
  ...timestamps
}, t => ({
  pk: primaryKey({ columns: [t.userId, t.achievementId] })
}))

/**
 * JLPT readiness = weighted coverage x mean FSRS retrievability of the level's
 * items at now(). FSRS already produces exactly the right signal; there is no
 * need to invent a second scoring model on top of it.
 */
export const levelReadinessSnapshots = pgTable('level_readiness_snapshots', {
  id: primaryId(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  levelId: text('level_id').notNull().references(() => languageLevels.id, { onDelete: 'cascade' }),
  computedAt: timestamp('computed_at').notNull().defaultNow(),
  coverage: jsonb('coverage').$type<Record<string, { known: number, total: number }>>().notNull().default({}),
  estimatedScore: numeric('estimated_score', { precision: 5, scale: 2 }),
  confidence: numeric('confidence', { precision: 4, scale: 3 }),
  ready: boolean('ready').notNull().default(false),
  ...timestamps
}, t => ({
  userLevelIdx: index('level_readiness_user_level_idx').on(t.userId, t.levelId, t.computedAt)
}))

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, { fields: [userSettings.userId], references: [users.id] })
}))
