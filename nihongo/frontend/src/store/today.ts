import type { Today } from '@nihongo/shared/types'

import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getToday } from '@/api/today'

/**
 * Today's numbers, shared by the Today screen and the nav — the due badge on
 * Review and the streak chip read the same answer instead of three requests
 * asking it three ways.
 *
 * Refreshed on navigation, but no more than once every 30 seconds: finishing
 * a session should move the badge, flicking between tabs should not hammer
 * the server.
 */
const FRESH_MS = 30_000

export const useTodayStore = defineStore('today', () => {
  const today = ref<Today | null>(null)
  let fetchedAt = 0
  let inflight: Promise<void> | null = null

  async function refresh(languageCode = 'ja', force = false) {
    if (!force && Date.now() - fetchedAt < FRESH_MS)
      return
    inflight ??= getToday(languageCode)
      .then((next) => {
        today.value = next
        fetchedAt = Date.now()
      })
      .catch(() => {
        // Offline or signed out: keep what we had. The nav simply shows no badge.
      })
      .finally(() => {
        inflight = null
      })
    await inflight
  }

  return { today, refresh }
})
