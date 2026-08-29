import type { NotificationPrefs, VapidKeyResponse } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function getVapidKey(): Promise<VapidKeyResponse> {
  const { data } = await client.get<VapidKeyResponse>(API_ENDPOINTS.NOTIFICATIONS.VAPID_KEY)
  return data
}

export async function subscribePush(sub: PushSubscriptionJSON, deviceId?: string): Promise<void> {
  await client.post(API_ENDPOINTS.NOTIFICATIONS.SUBSCRIBE, {
    endpoint: sub.endpoint,
    keys: sub.keys,
    ...(deviceId ? { deviceId } : {})
  })
}

export async function getPrefs(): Promise<NotificationPrefs> {
  const { data } = await client.get<NotificationPrefs>(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES)
  return data
}

export async function savePrefs(prefs: NotificationPrefs): Promise<NotificationPrefs> {
  const { data } = await client.put<NotificationPrefs>(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, prefs)
  return data
}

/**
 * Tell the server which timezone the reader is in.
 *
 * `users.timezone` defaulted to `UTC` and nothing ever wrote to it — no field
 * in any form, and the auth client could not set it. So a reminder set for
 * 22:00 was compared against the hour in UTC, and for anyone not living there
 * it fired at the wrong time of day or never at all.
 *
 * Detected rather than asked for: the browser already knows, and a timezone
 * picker is a question nobody should have to answer. Sent unconditionally on
 * every session load — it is one small request, it is idempotent, and deciding
 * whether to send it cost more code than sending it.
 */
export async function syncTimezone(): Promise<void> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (!timezone)
    return
  try {
    await client.patch(API_ENDPOINTS.NOTIFICATIONS.TIMEZONE, { timezone })
  } catch {
    // Never block the app on this. The reminder stays where it was until the
    // next load, which is where it already was.
  }
}
