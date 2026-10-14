import type { Today } from '@nihongo/shared/types'

import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getToday } from '@/api/today'
import { onSyncChange } from '@/offline/sync'

/**
 * Today's numbers, shared by the Today screen and the nav — the due badge on
 * Review and the streak chip read the same answer instead of three requests
 * asking it three ways.
 *
 * Kept fresh the moment something changes rather than on a slow poll:
 *   - every answer or action that reaches the server refreshes it at once,
 *     so finishing a review moves the badge straight away;
 *   - a timer fires when the next card comes due, so the badge appears the
 *     minute there is something to review;
 *   - returning to the app refreshes it.
 * Navigation also refreshes it, at most every few seconds, so flicking between
 * tabs does not hammer the server.
 */
const FRESH_MS = 5000
/** Longest a due timer is set for; a sleeping phone's timers drift, so re-arm often. */
const MAX_TIMER_MS = 60 * 60 * 1000

export const useTodayStore = defineStore('today', () => {
  const today = ref<Today | null>(null)
  let fetchedAt = 0
  let inflight: Promise<void> | null = null
  let languageCode = 'ja'
  let dueTimer: ReturnType<typeof setTimeout> | undefined
  let lastSynced: number | null = null

  async function refresh(code = languageCode, force = false) {
    languageCode = code
    if (!force && Date.now() - fetchedAt < FRESH_MS)
      return
    inflight ??= getToday(code)
      .then((next) => {
        today.value = next
        fetchedAt = Date.now()
        armDueTimer(next.nextDueAt)
      })
      .catch(() => {
        // Offline or signed out: keep what we had. The nav simply shows no badge.
      })
      .finally(() => {
        inflight = null
      })
    await inflight
  }

  /** Refresh a second after the next card comes due. */
  function armDueTimer(nextDueAt: string | null) {
    clearTimeout(dueTimer)
    if (!nextDueAt)
      return
    const wait = Math.min(MAX_TIMER_MS, Math.max(0, new Date(nextDueAt).getTime() - Date.now()) + 1000)
    dueTimer = setTimeout(() => void refresh(languageCode, true), wait)
  }

  // An answer or action reached the server: the counts have moved.
  onSyncChange((state) => {
    if (state.lastSyncedAt !== null && state.lastSyncedAt !== lastSynced) {
      lastSynced = state.lastSyncedAt
      if (today.value)
        void refresh(languageCode, true)
    }
  })

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && today.value)
        void refresh(languageCode)
    })
  }

  /** Signed out: forget the numbers and stop the timer. */
  function reset() {
    clearTimeout(dueTimer)
    today.value = null
    fetchedAt = 0
  }

  return { today, refresh, reset }
})
