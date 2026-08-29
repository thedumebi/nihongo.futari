import { pushMutations } from '@/api/sync'

import {
  clearAccepted,
  deadCount,
  deviceId,
  moveToDead,
  pendingAnswers,
  pendingCount
} from './db'

/**
 * Flushing the offline queue.
 *
 * Deliberately NOT using the Background Sync API. Safari does not implement it
 * at all, so relying on it would mean iPhone users — the ones most likely to
 * study on a train — silently never syncing. A plain foreground flush triggered
 * by coming online or returning to the tab works everywhere.
 */

const BATCH = 200

let syncing = false
let retryTimer: number | undefined

export interface SyncState {
  pending: number
  dead: number
  online: boolean
  syncing: boolean
  lastSyncedAt: number | null
}

type Listener = (state: SyncState) => void
const listeners = new Set<Listener>()
let lastSyncedAt: number | null = null

export function onSyncChange(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

async function emit() {
  const state: SyncState = {
    pending: await pendingCount(),
    dead: await deadCount(),
    online: navigator.onLine,
    syncing,
    lastSyncedAt
  }
  for (const fn of listeners) fn(state)
}

/**
 * Push everything queued.
 *
 * Guarded against concurrent runs: two flushes racing would send the same
 * answers twice. Harmless server-side (the ids make it idempotent) but it
 * wastes a round trip and confuses the pending count.
 */
/**
 * Cross-tab coordination.
 *
 * `syncing` is per-tab, so three open tabs previously flushed the same queue
 * three times. Idempotent log ids kept that CORRECT — the server discards the
 * duplicates — but it is three times the requests and three times the battery
 * on a phone that is already on a train.
 *
 * `navigator.locks` makes exactly one tab the flusher; the others wait rather
 * than duplicating. Where it is unavailable the old behaviour returns, which is
 * wasteful but never wrong.
 */
const CHANNEL = 'go-sync'
const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL)

// A tab that did not do the flush still needs to redraw its pending count.
channel?.addEventListener('message', (event: MessageEvent) => {
  if ((event.data as { type?: string })?.type === 'flushed')
    void emit()
})

export async function flush(): Promise<void> {
  if (!navigator.locks)
    return flushInner()
  // ifAvailable: a tab that loses the race returns immediately instead of
  // queueing a flush that the winner has already performed.
  return navigator.locks.request(CHANNEL, { ifAvailable: true }, async (lock) => {
    if (!lock)
      return
    await flushInner()
    channel?.postMessage({ type: 'flushed' })
  })
}

async function flushInner(): Promise<void> {
  if (syncing || !navigator.onLine)
    return
  const batch = await pendingAnswers(BATCH)
  if (batch.length === 0)
    return

  syncing = true
  await emit()
  try {
    const result = await pushMutations(deviceId(), batch.map(({ clientSeq: _s, attempts: _a, lastError: _e, ...m }) => m))

    // Duplicates are a success: the server already had them.
    await clearAccepted([...result.accepted, ...result.duplicates])

    if (result.rejected.length > 0) {
      // A rejection is the server refusing the content, not a transient
      // failure — retrying forever would block the queue behind it.
      await moveToDead(result.rejected)
    }

    lastSyncedAt = Date.now()
    scheduleRetryIfNeeded()
  } catch {
    // Network or 5xx: keep everything queued and back off.
    scheduleRetry()
  } finally {
    syncing = false
    await emit()
  }
}

let backoffMs = 5000

function scheduleRetry() {
  window.clearTimeout(retryTimer)
  // Exponential with a five-minute ceiling, so a long outage doesn't spin.
  backoffMs = Math.min(backoffMs * 2, 5 * 60 * 1000)
  retryTimer = window.setTimeout(() => void flush(), backoffMs)
}

async function scheduleRetryIfNeeded() {
  backoffMs = 5000
  window.clearTimeout(retryTimer)
  // More than one batch was waiting; keep going immediately.
  if (await pendingCount() > 0)
    retryTimer = window.setTimeout(() => void flush(), 250)
}

/**
 * Wire up the flush triggers.
 *
 * `visibilitychange` is the important one on iOS: with no Background Sync, the
 * moment the user returns to the tab is the only reliable opportunity.
 */
export function startSync(): () => void {
  const onOnline = () => {
    backoffMs = 5000
    void flush()
  }
  const onVisible = () => {
    if (document.visibilityState === 'visible')
      void flush()
  }

  window.addEventListener('online', onOnline)
  window.addEventListener('offline', () => void emit())
  document.addEventListener('visibilitychange', onVisible)

  void flush()
  void emit()

  return () => {
    window.removeEventListener('online', onOnline)
    document.removeEventListener('visibilitychange', onVisible)
    window.clearTimeout(retryTimer)
  }
}
