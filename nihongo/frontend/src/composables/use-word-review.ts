import type { WordStatus } from '@nihongo/shared/types'
import type { Ref } from 'vue'

import { isAxiosError } from 'axios'
import { computed, ref, watch } from 'vue'

import { getWordStatus, saveWord } from '@/api/study'
import { useToast } from '@/composables/use-toast'

/**
 * A word's place in the learner's reviews, and a way to add it.
 *
 * One definition for the word sheet (every tapped word, anywhere) and the
 * dictionary's word page, so "In your reviews · due in 3 days" means the same
 * thing in both and adding a word works the same way.
 */
export function useWordReview(wordId: Ref<string | undefined | null>, label: Ref<string>) {
  const toast = useToast()
  const status = ref<WordStatus | null>(null)
  const saving = ref(false)

  async function load() {
    status.value = null
    const id = wordId.value
    if (!id)
      return
    try {
      const next = await getWordStatus(id)
      if (wordId.value === id)
        status.value = next
    } catch {
      // Offline: the meaning still shows; it just cannot offer to keep it.
    }
  }

  async function add() {
    const id = wordId.value
    if (!id)
      return
    saving.value = true
    try {
      await saveWord(id)
      toast.success(`${label.value} added to your reviews`)
      await load()
    } catch (e) {
      toast.error(isAxiosError(e) && e.response?.status === 404 ? `${label.value} cannot be reviewed yet` : 'Could not add that word — try again')
    } finally {
      saving.value = false
    }
  }

  /** "due now", "due in 3 days" — when it comes back. */
  const dueText = computed(() => {
    const due = status.value?.due
    if (!due)
      return ''
    const ms = new Date(due).getTime() - Date.now()
    if (ms <= 0)
      return 'due now'
    const hours = Math.round(ms / 3_600_000)
    if (hours < 24)
      return hours <= 1 ? 'due within the hour' : `due in ${hours} hours`
    const days = Math.round(hours / 24)
    return `due in ${days} ${days === 1 ? 'day' : 'days'}`
  })

  watch(wordId, () => void load(), { immediate: true })

  return { status, saving, add, dueText }
}
