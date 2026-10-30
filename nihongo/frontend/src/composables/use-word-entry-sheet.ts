import { computed, ref } from 'vue'

/**
 * The full dictionary entry, opened in a half-screen sheet over whatever page
 * the word was tapped on.
 *
 * Module-level, and the sheet is mounted once in `app.vue`, so it outlives the
 * small word sheet that opened it: that one closes on any tap outside itself,
 * and a sheet it owned would vanish with the first tap inside the entry.
 */

const wordId = ref<string | null>(null)

/** For a keyboard handler that must not act behind the sheet. */
export const wordEntryOpen = computed(() => wordId.value !== null)

export function useWordEntrySheet() {
  return {
    wordId,
    isOpen: wordEntryOpen,
    open(id: string) {
      wordId.value = id
    },
    close() {
      wordId.value = null
    }
  }
}
