import type { NotificationPrefs, PushDevicesResponse, VapidKeyResponse } from '@nihongo/shared/types'

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
 * picker is a question nobody should have to answer. Sent on every session
 * load AND whenever the app comes back to the foreground with a different
 * zone: a phone resumes an installed app from memory, so after a flight the
 * day would otherwise keep running on the old zone until a full restart.
 *
 * Resolves true when the zone changed, so the caller can refresh "today".
 */
let lastSent: string | null = null

export async function syncTimezone(): Promise<boolean> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (!timezone || timezone === lastSent)
    return false
  try {
    await client.patch(API_ENDPOINTS.NOTIFICATIONS.TIMEZONE, { timezone })
    const changed = lastSent !== null
    lastSent = timezone
    return changed
  } catch {
    // Never block the app on this. The next foregrounding tries again.
    return false
  }
}

/** This account's push devices; `deviceId` marks the asking one. */
export async function listPushDevices(deviceId?: string): Promise<PushDevicesResponse> {
  const { data } = await client.get<PushDevicesResponse>(API_ENDPOINTS.NOTIFICATIONS.DEVICES, { params: deviceId ? { deviceId } : {} })
  return data
}

export async function removePushDevice(id: string): Promise<void> {
  await client.delete(API_ENDPOINTS.NOTIFICATIONS.DEVICE(id))
}
