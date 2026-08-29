import type { NotificationPrefs, PushSubscribeInput } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { pushSubscriptions, userSettings } from '@nihongo/shared/db/schema'
import { and, eq } from 'drizzle-orm'

/** Store or refresh a browser's push subscription. */
export async function subscribe(userId: string, input: PushSubscribeInput): Promise<void> {
  await db
    .insert(pushSubscriptions)
    .values({
      userId,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      ...(input.deviceId ? { deviceId: input.deviceId } : {}),
      enabled: true
    })
    // The endpoint is the identity. A browser re-subscribing produces the same
    // endpoint with fresh keys, so this refreshes rather than duplicating.
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        userId,
        p256dh: input.keys.p256dh,
        auth: input.keys.auth,
        enabled: true,
        failureCount: 0,
        updatedAt: new Date()
      }
    })
}

export async function unsubscribe(userId: string, endpoint: string): Promise<void> {
  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)))
}

export async function getPrefs(userId: string): Promise<NotificationPrefs> {
  const [row] = await db
    .select({
      reminderEmailEnabled: userSettings.reminderEmailEnabled,
      reminderPushEnabled: userSettings.reminderPushEnabled,
      reminderHour: userSettings.reminderHour,
      weeklySummaryEnabled: userSettings.weeklySummaryEnabled
    })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1)

  // A user with no settings row yet gets the defaults rather than an error.
  return row ?? {
    reminderEmailEnabled: true,
    reminderPushEnabled: false,
    reminderHour: 19,
    weeklySummaryEnabled: true
  }
}

export async function setPrefs(userId: string, prefs: NotificationPrefs): Promise<NotificationPrefs> {
  await db
    .insert(userSettings)
    .values({ userId, ...prefs })
    .onConflictDoUpdate({ target: userSettings.userId, set: { ...prefs, updatedAt: new Date() } })
  return prefs
}
