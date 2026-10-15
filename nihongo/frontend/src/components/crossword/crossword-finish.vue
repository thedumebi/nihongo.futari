<script setup lang="ts">
import type { CrosswordBonus, CrosswordEntry } from '@nihongo/shared/types'

import { hasKanji } from '@nihongo/shared/lib'
import { isAxiosError } from 'axios'
import { Check, Plus, Volume2 } from 'lucide-vue-next'
import { ref } from 'vue'

import { saveWord } from '@/api/study'
import Button from '@/components/ui/button.vue'
import { playAudio } from '@/composables/use-audio'
import { useToast } from '@/composables/use-toast'

/**
 * The words of a finished puzzle, to keep.
 *
 * A crossword is only half the point; the other half is remembering the words
 * met in it. Each one is here with its reading, kanji, meaning and sound, and
 * can go into reviews in one tap — the bonus word too, which may well be a
 * word the learner has not met before.
 */
interface Props {
  entries: CrosswordEntry[]
  bonus: CrosswordBonus | null
  seconds: number
  hints: number
  /** Set once the result is saved: whether this run was the best time. */
  best: boolean | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  again: []
}>()

// ============ Composables ============
const toast = useToast()

// ============ Reactive State ============
const added = ref(new Set<string>())
const saving = ref<string | null>(null)

// ============ Methods ============
function time(total: number): string {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

async function add(word: CrosswordEntry | CrosswordBonus) {
  if (!word.wordId)
    return
  saving.value = word.wordId
  try {
    const result = await saveWord(word.wordId)
    added.value = new Set(added.value).add(word.wordId)
    toast.success(result.added ? `${word.form} added to your reviews` : `${word.form} is already in your reviews`)
  } catch (e) {
    toast.error(isAxiosError(e) && e.response?.status === 404
      ? `${word.form} cannot be reviewed yet`
      : 'Could not add that word. Try again')
  } finally {
    saving.value = null
  }
}

const words = () => [...props.entries, ...(props.bonus ? [props.bonus] : [])]
</script>

<template>
  <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
    <p class="text-xl font-semibold">
      Solved in {{ time(seconds) }}
    </p>
    <p class="mt-1 text-sm text-[var(--color-muted)]">
      {{ hints === 0 ? 'No hints.' : `${hints} hint${hints === 1 ? '' : 's'}.` }}
      <template v-if="best">
        Your best time for this puzzle.
      </template>
    </p>

    <ul class="mt-6 divide-y divide-[var(--color-border)]">
      <li v-for="word in words()" :key="word.wordId ?? word.form" class="flex items-center gap-3 py-3">
        <div class="min-w-0 flex-1">
          <p class="text-lg" style="font-family: var(--font-jp)">
            {{ word.reading }}
            <span v-if="hasKanji(word.form)" class="ml-2 text-[var(--color-muted)]">{{ word.form }}</span>
            <span
              v-if="bonus && word === bonus"
              class="ml-2 rounded border border-[var(--color-border)] px-1.5 py-0.5 align-middle text-xs text-[var(--color-muted)]"
            >Bonus</span>
          </p>
          <p class="truncate text-sm text-[var(--color-muted)]">
            {{ word.meanings.join('; ') }}
          </p>
        </div>
        <Button v-if="word.audio" variant="ghost" round :aria-label="`Hear ${word.reading}`" @click="playAudio(word.audio)">
          <Volume2 class="h-4 w-4" />
        </Button>
        <Button
          v-if="word.wordId"
          variant="ghost"
          round
          :disabled="saving === word.wordId || added.has(word.wordId)"
          :aria-label="added.has(word.wordId) ? `${word.form} is in your reviews` : `Add ${word.form} to reviews`"
          @click="add(word)"
        >
          <Check v-if="added.has(word.wordId)" class="h-4 w-4" />
          <Plus v-else class="h-4 w-4" />
        </Button>
      </li>
    </ul>

    <div class="mt-6 flex justify-center">
      <Button variant="primary" @click="emit('again')">
        Another puzzle
      </Button>
    </div>
  </div>
</template>
