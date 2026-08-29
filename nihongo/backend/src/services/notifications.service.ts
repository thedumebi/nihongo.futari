import type { NotificationPrefs, PushSubscribeInput } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { pushSubscriptions, users, userSettings } from '@nihongo/shared/db/schema'
import { and, eq, sql } from 'drizzle-orm'

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
      // Stored as a plain integer; the type narrows it to the four quarters.
      reminderMinute: sql<0 | 15 | 30 | 45>`${userSettings.reminderMinute}`,
      timezone: users.timezone,
      weeklySummaryEnabled: userSettings.weeklySummaryEnabled
    })
    .from(userSettings)
    .innerJoin(users, eq(users.id, userSettings.userId))
    .where(eq(userSettings.userId, userId))
    .limit(1)

  // A user with no settings row yet gets the defaults rather than an error.
  return row ?? {
    reminderEmailEnabled: true,
    reminderPushEnabled: false,
    reminderHour: 19,
    reminderMinute: 0,
    weeklySummaryEnabled: true
  }
}

export async function setPrefs(userId: string, prefs: NotificationPrefs): Promise<NotificationPrefs> {
  // The zone belongs to the user, not to their notification settings — but it
  // arrives with them, because it is the thing that gives `reminderHour` a
  // meaning and nothing else in the app ever set it.
  const { timezone, ...settings } = prefs

  await db
    .insert(userSettings)
    .values({ userId, ...settings })
    .onConflictDoUpdate({ target: userSettings.userId, set: { ...settings, updatedAt: new Date() } })

  if (timezone && isValidTimezone(timezone)) {
    await db
      .update(users)
      .set({ timezone, updatedAt: new Date() })
      .where(eq(users.id, userId))
  }

  return prefs
}

/**
 * Whether a string is a zone this runtime knows.
 *
 * Checked because it comes from the browser and is fed straight into a
 * date-time calculation. An unknown zone would make `DateTime.fromJSDate`
 * invalid, and `isDue` returns false for an invalid zone — which is silence,
 * exactly the failure this is meant to end.
 */
function isValidTimezone(zone: string): boolean {
  try {
    return Boolean(new Intl.DateTimeFormat('en', { timeZone: zone }).resolvedOptions().timeZone)
  } catch {
    return false
  }
}

/**
 * Record the reader's timezone.
 *
 * Validated because it comes from the browser and is fed straight into a
 * date-time calculation: an unknown zone makes the DateTime invalid, and the
 * reminder check returns false for an invalid zone — which is silence, exactly
 * the failure this exists to end.
 */
export async function setTimezone(userId: string, timezone: string): Promise<void> {
  if (!isValidTimezone(timezone))
    return
  await db.update(users).set({ timezone, updatedAt: new Date() }).where(eq(users.id, userId))
}
