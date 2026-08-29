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
  weeklySummaryEnabled: z.boolean()
}).openapi('NotificationPrefs')

export type NotificationPrefs = z.infer<typeof notificationPrefsSchema>

export const reminderRunResultSchema = z.object({
  considered: z.number().int(),
  emailed: z.number().int(),
  pushed: z.number().int(),
  skipped: z.number().int()
}).openapi('ReminderRunResult')

export type ReminderRunResult = z.infer<typeof reminderRunResultSchema>
