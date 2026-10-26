import type { StudyQueueItem, SubmitAnswerInput, SyncAction } from '@nihongo/shared/types'
import type { Table } from 'dexie'

import Dexie from 'dexie'

/**
 * Local store for offline study.
 *
 * Three stores with quite different lifetimes:
 *   queue  — answers not yet accepted by the server. NEVER dropped on a schema
 *            change; losing these loses real work.
 *   dead   — answers the server refused with a 4xx. Kept and surfaced rather
 *            than silently discarded.
 *   bundle — cached review queue. Disposable; re-fetched whenever convenient.
 *   actions — other writes not yet accepted: a finished conversation, a
 *            speech read. Same durability rule as answers.
 */

export interface QueuedAnswer extends SubmitAnswerInput {
  /** Monotonic per device, so a resend without ids is still deduplicable. */
  clientSeq: number
  attempts: number
  lastError?: string
}

/** A queued non-answer write, with retry bookkeeping. */
export type QueuedAction = SyncAction & { attempts: number, lastError?: string }

export interface CachedBundle {
  key: string
  items: StudyQueueItem[]
  counts: { due: number, learning: number, newAvailable: number, ghost: number }
  cachedAt: number
}

class OfflineDb extends Dexie {
  queue!: Table<QueuedAnswer, string>
  dead!: Table<QueuedAnswer, string>
  bundles!: Table<CachedBundle, string>
  actions!: Table<QueuedAction, string>
  deadActions!: Table<QueuedAction, string>

  constructor() {
    super('go-offline')
    this.version(1).stores({
      queue: 'id, clientSeq, reviewedAt',
      dead: 'id',
      bundles: 'key, cachedAt'
    })
    // Adds two stores; the answer queue is untouched, so nothing queued is lost.
    this.version(2).stores({
      queue: 'id, clientSeq, reviewedAt',
      dead: 'id',
      bundles: 'key, cachedAt',
      actions: 'id, occurredAt',
      deadActions: 'id'
    })
  }
}

export const offlineDb = new OfflineDb()

/** Stable per-device id, used as the sync `deviceId` and for the seq counter. */
export function deviceId(): string {
  const KEY = 'go-device-id'
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}

function nextSeq(): number {
  const KEY = 'go-client-seq'
  const next = Number(localStorage.getItem(KEY) ?? '0') + 1
  localStorage.setItem(KEY, String(next))
  return next
}

/** Queue an answer. Always durable first — the network attempt comes after. */
export async function enqueueAnswer(answer: SubmitAnswerInput): Promise<QueuedAnswer> {
  const row: QueuedAnswer = { ...answer, clientSeq: nextSeq(), attempts: 0 }
  await offlineDb.queue.put(row)
  return row
}

/** Queue a non-answer write. Durable first, like answers. */
export async function enqueueAction(action: SyncAction): Promise<void> {
  await offlineDb.actions.put({ ...action, attempts: 0 })
}

export async function pendingActions(limit = 200): Promise<QueuedAction[]> {
  return offlineDb.actions.orderBy('occurredAt').limit(limit).toArray()
}

export async function pendingAnswers(limit = 200): Promise<QueuedAnswer[]> {
  return offlineDb.queue.orderBy('reviewedAt').limit(limit).toArray()
}

export async function pendingCount(): Promise<number> {
  return (await offlineDb.queue.count()) + (await offlineDb.actions.count())
}

export async function deadCount(): Promise<number> {
  return offlineDb.dead.count()
}

export async function clearAccepted(ids: string[]): Promise<void> {
  if (ids.length > 0) {
    await offlineDb.queue.bulkDelete(ids)
    await offlineDb.actions.bulkDelete(ids)
  }
}

/**
 * Move permanently-refused answers aside.
 *
 * A 4xx will never succeed on retry, so keeping it in the queue would block the
 * flush forever. It is preserved rather than deleted so the UI can say "N
 * answers could not sync" instead of losing them quietly.
 */
export async function moveToDead(failures: Array<{ id: string, reason: string }>): Promise<void> {
  for (const f of failures) {
    const row = await offlineDb.queue.get(f.id)
    if (row) {
      await offlineDb.dead.put({ ...row, lastError: f.reason })
      await offlineDb.queue.delete(f.id)
      continue
    }
    const action = await offlineDb.actions.get(f.id)
    if (action) {
      await offlineDb.deadActions.put({ ...action, lastError: f.reason })
      await offlineDb.actions.delete(f.id)
    }
  }
}

export async function cacheBundle(key: string, bundle: Omit<CachedBundle, 'key' | 'cachedAt'>): Promise<void> {
  await offlineDb.bundles.put({ key, ...bundle, cachedAt: Date.now() })
}

export async function readBundle(key: string): Promise<CachedBundle | undefined> {
  return offlineDb.bundles.get(key)
}

/**
 * Ask the browser not to evict this origin's storage.
 *
 * iOS in particular will clear site data under pressure, which would drop
 * queued answers. Best-effort: the prompt may be refused, and the queue has to
 * survive that either way.
 */
export async function requestPersistence(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist)
      return false
    if (await navigator.storage.persisted())
      return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

/**
 * Empty every store: queued answers, actions and cached bundles. For an
 * account that no longer exists, whose queue could never be accepted.
 */
export async function clearLearnerData(): Promise<void> {
  await Promise.all(offlineDb.tables.map(table => table.clear()))
}
