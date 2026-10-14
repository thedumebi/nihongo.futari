import type { FuriganaMode } from '@nihongo/shared/constants'
import type { KnownKanji, StudySettings } from '@nihongo/shared/types'

import { API_ENDPOINTS, DEFAULT_FURIGANA_MODE } from '@nihongo/shared/constants'
import { useLocalStorage } from '@vueuse/core'
import { nextTick, ref, watch } from 'vue'

import client from '@/api/client'

/**
 * Furigana preference and the known-kanji set behind "unknown only".
 *
 * The DATABASE is the source of truth, so the setting follows the reader from
 * phone to desk. `localStorage` is a cache, not a second home: it makes the
 * first paint instant and keeps the app usable offline, and the server value
 * overwrites it as soon as one arrives.
 *
 * The vocabulary itself lives in `FURIGANA_MODES` in shared constants — the
 * column, the API and this file all use those exact strings.
 */

/** UI wording for each mode. The values come from shared; only the prose is here. */
export const FURIGANA_MODE_LABELS: Record<FuriganaMode, { label: string, description: string }> = {
  'always': { label: 'Always', description: 'Readings over every kanji.' },
  'unknown-only': { label: 'Unknown', description: 'Readings only over kanji you have not learned yet.' },
  'off': { label: 'Never', description: 'No readings. What reading practice actually needs.' },
  'kana': { label: 'Hiragana', description: 'Kanji written out in kana, so every line is hiragana reading practice.' },
  'romaji': { label: 'Romaji', description: 'Readings in latin letters, over every kanji and every kana.' }
}

const knownKanji = ref<Set<string>>(new Set())
let knownLoaded: Promise<void> | null = null
let settingsLoaded: Promise<void> | null = null
/** True while a server value is being applied, so it is not written back. */
let applying = false
let writing = false

/** One shared preference; every caller reads and writes the same ref. */
const mode = useLocalStorage<FuriganaMode>('go-furigana', DEFAULT_FURIGANA_MODE)

/**
 * Read the stored preference from the server, every time it is called.
 *
 * An installed app on a phone stays open for days, so reading it once at
 * start-up meant a change made on the laptop never reached the phone: it kept
 * its own cached copy. The app calls this again whenever it comes back to the
 * foreground.
 */
export async function refreshFuriganaSetting(): Promise<void> {
  try {
    const { data } = await client.get<StudySettings>(API_ENDPOINTS.USERS.SETTINGS)
    applying = true
    mode.value = data.furiganaMode
  } catch {
    // Logged out or offline — the cached preference is enough to render.
  } finally {
    // After the watcher below has seen the assignment, not before.
    await nextTick()
    applying = false
  }
  if (!writing) {
    writing = true
    // Only start writing AFTER the server value has landed, so the initial
    // assignment cannot echo back as a spurious write.
    watch(mode, (next) => {
      if (applying)
        return
      void client.patch(API_ENDPOINTS.USERS.UPDATE_SETTINGS, { furiganaMode: next }).catch(() => {
        // Offline: the cached value still drives rendering, and the next
        // change while online writes through.
      })
    })
  }
}

export function useFurigana() {
  /** Once per page load; the foreground refresh keeps it current after that. */
  async function loadSettings() {
    settingsLoaded ??= refreshFuriganaSetting()
    return settingsLoaded
  }

  async function loadKnownKanji(languageCode = 'ja') {
    knownLoaded ??= client
      .get<KnownKanji>(API_ENDPOINTS.PROGRESS.KNOWN_KANJI, { params: { languageCode } })
      .then(({ data }) => {
        knownKanji.value = new Set(data.characters)
      })
      .catch(() => {
        // An empty set means ruby stays visible, which is the safe direction to
        // fail: hiding a reading you needed is worse than showing one you did not.
        knownKanji.value = new Set()
      })
    return knownLoaded
  }

  return { mode, knownKanji, loadKnownKanji, loadSettings }
}
