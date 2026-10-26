import type { Today } from '@nihongo/shared/types'

import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getToday } from '@/api/today'
import { forgetLastToday, readLastToday, saveLastToday } from '@/lib/last-today'
import { readMoreNew } from '@/lib/more-new'
import { onSyncChange } from '@/offline/sync'

import { useAuthStore } from './auth'

/**
 * Today's numbers, shared by the Today screen and the nav — the due badge on
 * Review and the streak chip read the same answer instead of three requests
 * asking it three ways.
 *
 * Kept fresh the moment something changes rather than on a slow poll:
 *   - an answer or action that reaches the server refreshes it, at most
 *     every SYNC_FRESH_MS: a review session syncs after every card, and each
 *     refresh is the heaviest request the app makes. The last one always
 *     lands, so the badge is right once the session ends;
 *   - a timer fires when the next card comes due, so the badge appears the
 *     minute there is something to review;
 *   - returning to the app refreshes it.
 * Navigation also refreshes it, at most every few seconds, so flicking between
 * tabs does not hammer the server.
 *
 * Opening the app shows the last Today this device saw (`lib/last-today`) while
 * the fresh one loads, instead of a blank page.
 */
const FRESH_MS = 5000
/** Closest together two sync-triggered refreshes may run. */
const SYNC_FRESH_MS = 30 * 1000
/** Longest a due timer is set for; a sleeping phone's timers drift, so re-arm often. */
const MAX_TIMER_MS = 60 * 60 * 1000

export const useTodayStore = defineStore('today', () => {
  const today = ref<Today | null>(null)
  let fetchedAt = 0
  let inflight: Promise<void> | null = null
  let languageCode = 'ja'
  let dueTimer: ReturnType<typeof setTimeout> | undefined
  let syncTimer: ReturnType<typeof setTimeout> | undefined
  let lastSynced: number | null = null

  async function refresh(code = languageCode, force = false) {
    const userId = useAuthStore().user?.id
    // A first look, or another language: show what this device last saw for
    // it while the fresh answer loads.
    if (userId && (today.value === null || code !== languageCode))
      today.value = readLastToday(userId, code) ?? today.value
    languageCode = code
    if (!force && Date.now() - fetchedAt < FRESH_MS)
      return
    clearTimeout(syncTimer)
    syncTimer = undefined
    inflight ??= getToday(code, readMoreNew(code))
      .then((next) => {
        today.value = next
        fetchedAt = Date.now()
        armDueTimer(next.nextDueAt)
        // Only if the same learner is still signed in: a sign-out while this
        // was in flight has already wiped the device, and must stay wiped.
        if (userId && useAuthStore().user?.id === userId)
          saveLastToday(userId, code, next)
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

  // An answer or action reached the server: the counts have moved. Refresh
  // now if the last one is old enough, otherwise once the gap is up.
  onSyncChange((state) => {
    if (state.lastSyncedAt === null || state.lastSyncedAt === lastSynced)
      return
    lastSynced = state.lastSyncedAt
    if (!today.value || syncTimer)
      return
    const wait = Math.max(0, fetchedAt + SYNC_FRESH_MS - Date.now())
    syncTimer = setTimeout(() => {
      syncTimer = undefined
      void refresh(languageCode, true)
    }, wait)
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
    clearTimeout(syncTimer)
    syncTimer = undefined
    today.value = null
    fetchedAt = 0
    forgetLastToday()
  }

  return { today, refresh, reset }
})
