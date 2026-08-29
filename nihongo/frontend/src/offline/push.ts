import { getVapidKey, subscribePush } from '@/api/notifications'

import { deviceId } from './db'

/** VAPID keys are base64url; the Push API wants raw bytes. */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const raw = atob(padded)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export type PushSupport
  = | { supported: true }
    | { supported: false, reason: string }

/**
 * Whether this browser can actually receive push.
 *
 * iOS is the awkward case: Safari only exposes PushManager to a PWA that has
 * been added to the home screen (16.4+), so the API is simply absent in a
 * normal tab. Saying that plainly beats a permission prompt that silently
 * does nothing.
 */
export function pushSupport(): PushSupport {
  if (!('serviceWorker' in navigator))
    return { supported: false, reason: 'This browser has no service worker support.' }
  if (!('PushManager' in window)) {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent)
    return {
      supported: false,
      reason: isIos
        ? 'On iPhone and iPad, add this app to your Home Screen first — Safari only allows notifications for installed apps.'
        : 'This browser does not support push notifications.'
    }
  }
  if (Notification.permission === 'denied') {
    return { supported: false, reason: 'Notifications are blocked for this site in your browser settings.' }
  }
  return { supported: true }
}

export interface EnableResult {
  ok: boolean
  reason?: string
}

/**
 * The active service worker registration, or null.
 *
 * `navigator.serviceWorker.ready` neither resolves nor rejects when no worker
 * is registered — it simply hangs. That is not hypothetical: the dev server
 * registers none at all (`devOptions.enabled` is false), so enabling push in
 * development left the button spinning for ever with nothing in the console.
 * The same would happen in production if the worker failed to activate.
 *
 * Racing it against a timeout turns a hang into an answer.
 */
async function activeRegistration(timeoutMs = 5000): Promise<ServiceWorkerRegistration | null> {
  const existing = await navigator.serviceWorker.getRegistration()
  if (existing?.active)
    return existing

  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), timeoutMs)
      })
    ])
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Turn on push for this device.
 *
 * Never throws: the caller uses the result to decide what to show, and an
 * exception escaping here would leave the UI mid-action with no explanation.
 */
export async function enablePush(): Promise<EnableResult> {
  const support = pushSupport()
  if (!support.supported)
    return { ok: false, reason: support.reason }

  try {
    const { publicKey } = await getVapidKey()
    if (!publicKey)
      return { ok: false, reason: 'Push is not configured on this server.' }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted')
      return { ok: false, reason: 'Permission was not granted.' }

    const registration = await activeRegistration()
    if (!registration) {
      return {
        ok: false,
        reason: import.meta.env.DEV
          ? 'The service worker does not run in development, so push cannot be enabled here. It works in a build.'
          : 'The app is still starting its background worker. Reload the page and try again.'
      }
    }

    const existing = await registration.pushManager.getSubscription()
    const subscription = existing ?? await registration.pushManager.subscribe({
      // Required by every browser; a non-userVisible push would be rejected.
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    })

    await subscribePush(subscription.toJSON() as PushSubscriptionJSON, deviceId())
    return { ok: true }
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'Could not enable notifications.' }
  }
}
