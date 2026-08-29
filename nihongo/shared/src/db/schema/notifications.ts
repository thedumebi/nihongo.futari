import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

import { users } from './auth.js'
import { primaryId, timestamps } from './columns.js'

/**
 * Web Push endpoints. On iOS these only exist once the user has added the app
 * to their home screen (16.4+), and not at all for EU PWAs since Apple's DMA
 * change — so push is always an enhancement, never the only reminder channel.
 */
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: primaryId(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull().unique(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  userAgent: text('user_agent'),
  deviceId: text('device_id'),
  enabled: boolean('enabled').notNull().default(true),
  lastSuccessAt: timestamp('last_success_at'),
  failureCount: integer('failure_count').notNull().default(0),
  ...timestamps
}, t => ({
  userIdx: index('push_subscriptions_user_idx').on(t.userId)
}))

/**
 * `dedupeKey` = `${userId}:${kind}:${localDate}`, uniquely indexed, so the host
 * cron can fire twice (or be retried) without anyone getting two emails.
 */
export const notificationLog = pgTable('notification_log', {
  id: primaryId(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  channel: text('channel').notNull(), // email | push
  kind: text('kind').notNull(), // daily-reminder | streak-risk | ghost-alert | weekly-summary
  dedupeKey: text('dedupe_key').notNull(),
  status: text('status').notNull().default('sent'),
  error: text('error'),
  sentAt: timestamp('sent_at').notNull().defaultNow(),
  ...timestamps
}, t => ({
  dedupe: uniqueIndex('notification_log_dedupe').on(t.dedupeKey),
  userIdx: index('notification_log_user_idx').on(t.userId, t.sentAt)
}))
