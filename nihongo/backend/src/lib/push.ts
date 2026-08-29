import env from '@nihongo/shared/env'
import webpush from 'web-push'

/**
 * Web Push.
 *
 * Configured lazily and tolerant of missing keys: a deployment without VAPID
 * configured should degrade to email reminders, not fail to boot.
 *
 * Worth knowing about the platform: on iOS, push only works for a PWA added to
 * the home screen (16.4+), and not at all for PWAs in the EU since Apple's DMA
 * change. Push is therefore always an enhancement here, never the only channel.
 */

let configured: boolean | null = null

export function pushConfigured(): boolean {
  if (configured !== null)
    return configured
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = env
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    configured = false
    return false
  }
  webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:admin@localhost', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
  configured = true
  return true
}

export function publicKey(): string | null {
  return pushConfigured() ? env.VAPID_PUBLIC_KEY ?? null : null
}

export interface PushTarget {
  endpoint: string
  p256dh: string
  auth: string
}

export interface PushOutcome {
  ok: boolean
  /** 404/410 means the browser dropped the subscription — delete it. */
  gone: boolean
  error?: string
}

export async function sendPush(target: PushTarget, payload: Record<string, unknown>): Promise<PushOutcome> {
  if (!pushConfigured())
    return { ok: false, gone: false, error: 'Push not configured' }

  try {
    await webpush.sendNotification(
      { endpoint: target.endpoint, keys: { p256dh: target.p256dh, auth: target.auth } },
      JSON.stringify(payload)
    )
    return { ok: true, gone: false }
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode
    return {
      ok: false,
      // Anything else may be transient; these two are permanent.
      gone: status === 404 || status === 410,
      error: err instanceof Error ? err.message : 'Push failed'
    }
  }
}
