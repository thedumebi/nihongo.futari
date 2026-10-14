import type { RecordActivityInput } from '@nihongo/shared/types'

import { uuidv7 } from '@nihongo/shared/lib'

import { enqueueAction } from '@/offline/db'
import { flush } from '@/offline/sync'

/**
 * Record a finished activity — a conversation, a speech read, a hands-free
 * Speak run. Queued on the device first and flushed in the background, so one
 * finished offline still counts toward the streak once the phone is back.
 */
export async function recordActivity(input: Omit<RecordActivityInput, 'id' | 'occurredAt'>, languageCode = 'ja'): Promise<void> {
  await enqueueAction({ type: 'activity', id: uuidv7(), occurredAt: new Date().toISOString(), languageCode, ...input })
  void flush()
}
