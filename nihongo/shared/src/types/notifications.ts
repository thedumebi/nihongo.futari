import { z } from '@hono/zod-openapi'

import type {
  notificationLog,
  pushSubscriptions
} from '@/db/schema/notifications.js'

/**
 * Push subscriptions and the notification dedupe log.
 *
 * Derived from the Drizzle tables — the schema is the single source of truth.
 * Never hand-write a shape that duplicates one of these.
 */
export type PushSubscription = typeof pushSubscriptions.$inferSelect
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert
export type NotificationLogEntry = typeof notificationLog.$inferSelect

export const vapidKeyResponseSchema = z.object({
  /** Null when push isn't configured on this deployment. */
  publicKey: z.string().nullable()
}).openapi('VapidKey')

export type VapidKeyResponse = z.infer<typeof vapidKeyResponseSchema>

export const pushSubscribeSchema = z.object({
  endpoint: z.url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
  deviceId: z.string().optional()
}).openapi('PushSubscribe')

export type PushSubscribeInput = z.infer<typeof pushSubscribeSchema>

export const notificationPrefsSchema = z.object({
  reminderEmailEnabled: z.boolean(),
  reminderPushEnabled: z.boolean(),
  /** Local hour to send. Compared against the user's own timezone. */
  reminderHour: z.number().int().min(0).max(23),
  /**
   * Minutes past the hour: 0, 15, 30 or 45.
   *
   * Constrained to quarters because the cron runs every fifteen minutes, and
   * offering a free minute field would promise a precision the scheduler
   * cannot keep.
   */
  reminderMinute: z.union([z.literal(0), z.literal(15), z.literal(30), z.literal(45)]).default(0),
  weeklySummaryEnabled: z.boolean(),
  /**
   * The reader's IANA timezone, e.g. `Asia/Tokyo`.
   *
   * Optional on the way in and detected by the browser rather than asked for.
   * It lives on `users`, not here, but it travels with the preference it
   * governs: a reminder hour is meaningless without the zone it is measured in,
   * and nothing else was ever setting it — so every account sat on the `UTC`
   * default and reminders fired at the wrong time of day, or never.
   */
  timezone: z.string().optional()
}).openapi('NotificationPrefs')

export type NotificationPrefs = z.infer<typeof notificationPrefsSchema>

export const timezoneSchema = z.object({
  /** IANA zone, e.g. `Asia/Tokyo`. Detected by the browser, never typed. */
  timezone: z.string().min(1).max(64)
}).openapi('Timezone')

export type TimezoneInput = z.infer<typeof timezoneSchema>

/**
 * What one reminder run did, and why it did not do more.
 *
 * `skipped` alone was useless for diagnosis: a run that sent nothing reported
 * `skipped: 2` whether the hour was wrong, the queue was empty, or the mail had
 * already gone out that day. Every silent evening looked the same in the log.
 * The reasons are broken out so a quiet run explains itself.
 */
export const reminderRunResultSchema = z.object({
  considered: z.number().int(),
  emailed: z.number().int(),
  pushed: z.number().int(),
  skipped: z.number().int(),
  /** Right person, wrong time — their reminder is not this quarter hour. */
  skippedNotDue: z.number().int(),
  /** Already reminded today; a second cron run must not send twice. */
  skippedAlreadySent: z.number().int(),
  /** Reminders attempted but rejected by the mail or push provider. */
  failed: z.number().int()
}).openapi('ReminderRunResult')

export type ReminderRunResult = z.infer<typeof reminderRunResultSchema>
