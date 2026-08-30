import type { StudySettings } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'
import { useLocalStorage } from '@vueuse/core'
import { watch } from 'vue'

import client from '@/api/client'

/**
 * The JLPT level the reader is working at, shared across the whole app.
 *
 * It used to be per-page: Study persisted its choice, Grammar kept a plain
 * `ref('')` that reset on every visit, and Progress was hardcoded to N5. So
 * picking N5 to drill told the rest of the app nothing, and Progress would
 * happily report on a level you were not studying.
 *
 * The DATABASE is the source of truth. `localStorage` is a cache, not a second
 * home: it makes the first paint instant and keeps the app usable offline, and
 * the server value overwrites it as soon as one arrives.
 *
 * It has to be the database, because `localStorage` alone demonstrably lost the
 * choice. A home-screen web app on iOS keeps its own storage container,
 * separate from the browser's, so a level picked in Safari was invisible to the
 * installed app — and iOS evicts script-writable storage after a stretch of
 * disuse, so even inside one container the choice quietly expired. To the
 * reader both look the same: the app forgot.
 *
 * Empty string means "every level", which is what the Study and Grammar
 * pickers already meant by their "All" option. Anywhere that cannot show
 * everything at once — Progress reports on one level at a time — should fall
 * back to a default of its own rather than sending an empty filter.
 */
const STORAGE_KEY = 'go-level'

/** Shared across every caller, so the fetch and the watcher happen once. */
let settingsLoaded: Promise<void> | null = null

export function useLevel() {
  const level = useLocalStorage(STORAGE_KEY, '')

  /** Pull the stored level once, then keep writing changes back. */
  async function loadLevel() {
    settingsLoaded ??= client
      .get<StudySettings>(API_ENDPOINTS.USERS.SETTINGS)
      .then(({ data }) => {
        level.value = data.studyLevel
        // Only start syncing AFTER the server value has landed, so the
        // assignment above cannot echo back as a spurious write.
        watch(level, (next) => {
          void client.patch(API_ENDPOINTS.USERS.UPDATE_SETTINGS, { studyLevel: next }).catch(() => {
            // Offline: the cached value still drives the UI, and the next
            // change made online writes through.
          })
        })
      })
      .catch(() => {
        // Logged out or offline — the cached choice is enough to render.
      })
    return settingsLoaded
  }

  /** For pages that must name exactly one level. */
  const levelOrDefault = (fallback = 'N5') => level.value || fallback

  return { level, levelOrDefault, loadLevel }
}
