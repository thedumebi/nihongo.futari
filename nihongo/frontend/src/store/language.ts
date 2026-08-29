import type { LanguageSummary } from '@nihongo/shared/types'

import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { listLanguages } from '@/api/languages'

/**
 * Which language the learner is studying.
 *
 * The schema has been multi-language since the first migration; this is the
 * client half of that seam. The choice is persisted locally for now — moving it
 * to `users.activeLanguageId` (so it follows you across devices) needs a
 * /users/me endpoint that doesn't exist yet.
 */
export const useLanguageStore = defineStore('language', () => {
  const languages = ref<LanguageSummary[]>([])
  const code = useLocalStorage('nihongo-language', 'ja')
  const loaded = ref(false)

  const current = computed(() => languages.value.find(l => l.code === code.value) ?? languages.value[0])
  const hasChoice = computed(() => languages.value.length > 1)

  async function load() {
    if (loaded.value)
      return
    try {
      const { languages: list } = await listLanguages()
      languages.value = list
      // Fall back if a stored code refers to a language that's gone.
      if (list.length > 0 && !list.some(l => l.code === code.value))
        code.value = list[0]!.code
    } finally {
      loaded.value = true
    }
  }

  function select(next: string) {
    code.value = next
  }

  return { languages, code, current, hasChoice, loaded, load, select }
})
