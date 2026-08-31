import type { NotificationPrefs, PushSubscribeInput } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { notificationLog, pushSubscriptions, users, userSettings } from '@nihongo/shared/db/schema'
import { studyDateFor } from '@nihongo/shared/lib'
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

  const [before] = await db
    .select({
      reminderHour: userSettings.reminderHour,
      reminderMinute: userSettings.reminderMinute
    })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1)

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

  // Moving the reminder releases today's claim.
  //
  // The scheduler dedupes on `<user>:daily-reminder:<study date>`, one slot per
  // day, claimed before sending so a second cron tick cannot double-send. That
  // is right for a fixed time and wrong the moment the time moves: a reminder
  // that already fired this morning had taken the day, so changing the setting
  // to 7:30pm produced silence — the run recognised the new time and then
  // refused it as a duplicate. Nothing was broken and nothing arrived.
  //
  // Deleting the claim lets the new time fire today rather than tomorrow. Worst
  // case someone gets two nudges on the day they change the setting, which is
  // plainly better than the alternative of getting none and assuming it failed.
  const moved = before !== undefined
    && (before.reminderHour !== settings.reminderHour || before.reminderMinute !== settings.reminderMinute)

  if (moved) {
    const [row] = await db.select({ timezone: users.timezone }).from(users).where(eq(users.id, userId)).limit(1)
    const zone = timezone && isValidTimezone(timezone) ? timezone : (row?.timezone ?? 'UTC')
    const today = studyDateFor(new Date(), zone)
    await db
      .delete(notificationLog)
      .where(eq(notificationLog.dedupeKey, `${userId}:daily-reminder:${today}`))
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
