import type { AnswerScript } from '@nihongo/shared/constants'
import type { Ref } from 'vue'

import { ref, watch } from 'vue'

/**
 * Whether this card wants a different answer type from the last one, so the
 * answer cue can pulse once. False on the first card, where there is nothing
 * to have changed from. Shared by Study and the lesson quiz.
 */
export function useScriptChange(card: Ref<unknown>, script: Ref<AnswerScript | null>) {
  const changed = ref(false)
  let last: AnswerScript | null = null
  // Keyed on the card, not the script: two romaji cards in a row must clear
  // the flag the first one set.
  watch(card, () => {
    const now = script.value
    changed.value = last !== null && now !== null && now !== last
    if (now)
      last = now
  })
  return { changed }
}
