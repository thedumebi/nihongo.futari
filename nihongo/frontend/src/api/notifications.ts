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
