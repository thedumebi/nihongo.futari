import { sql } from 'drizzle-orm'
import { boolean, check, index, integer, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

import { users } from './auth.js'
import { timestamps } from './columns.js'

/**
 * Friends are opt-in. A learner who never turns them on in Settings has no
 * row here, cannot be found, and shares nothing.
 *
 * There is no search — you connect by a code (or a link carrying it) that the
 * other person chose to give you. Every share defaults OFF and is a separate
 * switch. What can ever be shared is deliberately small: whether you studied
 * today, your time on the daily crossword, and how many days you studied this
 * week. Words, accuracy and ghosts are never shared. Turning friends off
 * deletes the profile and, by cascade, every friendship.
 */
export const friendProfiles = pgTable('friend_profiles', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  /** What friends see you as. Not the account name, so nothing leaks by default. */
  displayName: text('display_name').notNull(),
  /** The code a friend types or follows. Rotating it stops old links working. */
  code: text('code').notNull(),
  shareStudiedToday: boolean('share_studied_today').notNull().default(false),
  shareCrossword: boolean('share_crossword').notNull().default(false),
  shareWeekly: boolean('share_weekly').notNull().default(false),
  /** Counts of what was studied — reviews, lessons, conversations… Never which words, never accuracy. */
  shareActivity: boolean('share_activity').notNull().default(false),
  /** A push when a friend passes you on the weekly board, or is close behind. On by default. */
  notifyBoard: boolean('notify_board').notNull().default(true),
  ...timestamps
}, t => ({
  codeUnique: uniqueIndex('friend_profiles_code_unique').on(t.code)
}))

/**
 * One row per pair, whoever asked. `status` is pending until the other side
 * accepts; declining deletes the row. The CHECK and the pair index keep a pair
 * from being stored twice in either order.
 */
export const friendships = pgTable('friendships', {
  id: text('id').primaryKey(),
  requesterId: text('requester_id').notNull().references(() => friendProfiles.userId, { onDelete: 'cascade' }),
  addresseeId: text('addressee_id').notNull().references(() => friendProfiles.userId, { onDelete: 'cascade' }),
  /** pending | accepted */
  status: text('status').notNull().default('pending'),
  acceptedAt: timestamp('accepted_at'),
  ...timestamps
}, t => ({
  notSelf: check('friendships_not_self', sql`${t.requesterId} <> ${t.addresseeId}`),
  pairUnique: uniqueIndex('friendships_pair_unique').on(sql`least(${t.requesterId}, ${t.addresseeId})`, sql`greatest(${t.requesterId}, ${t.addresseeId})`),
  addresseeIdx: index('friendships_addressee_idx').on(t.addresseeId, t.status)
}))

/**
 * The weekly board as it last stood between you and one friend: their score
 * and yours (days studied in the last seven, then XP). The board cron compares
 * against it to notice a friend passing you, and only when THEIR score went up,
 * so a day of yours dropping out of the seven never reads as being passed.
 * A notification cache, nothing more: deleting it costs one missed nudge.
 */
export const friendBoardSnapshots = pgTable('friend_board_snapshots', {
  userId: text('user_id').notNull().references(() => friendProfiles.userId, { onDelete: 'cascade' }),
  friendId: text('friend_id').notNull().references(() => friendProfiles.userId, { onDelete: 'cascade' }),
  myDays: integer('my_days').notNull(),
  myXp: integer('my_xp').notNull(),
  friendDays: integer('friend_days').notNull(),
  friendXp: integer('friend_xp').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, t => ({
  pk: primaryKey({ columns: [t.userId, t.friendId] })
}))
