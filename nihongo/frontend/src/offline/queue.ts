import type { SyncAction } from '@nihongo/shared/types'

import { uuidv7 } from '@nihongo/shared/lib'
import { isAxiosError } from 'axios'

import { enqueueAction } from './db'
import { flush } from './sync'

/** Distributes over the union, so each action keeps its own fields. */
type Unqueued<T> = T extends unknown ? Omit<T, 'id' | 'occurredAt'> : never

/**
 * Queue a write to be sent when the phone is back online — a lesson or Speak
 * session finished, a word saved — stamped with when it happened here.
 */
export async function queueAction(action: Unqueued<SyncAction>): Promise<void> {
  await enqueueAction({ ...action, id: uuidv7(), occurredAt: new Date().toISOString() } as SyncAction)
  void flush()
}

/**
 * No answer at all — offline, or the server unreachable. Only then is a write
 * queued; a real refusal (4xx) would be refused again later, so it is reported.
 */
export function isNetworkError(e: unknown): boolean {
  return isAxiosError(e) && !e.response
}
