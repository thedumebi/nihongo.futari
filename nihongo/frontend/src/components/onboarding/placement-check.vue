<script setup lang="ts">
import type { JlptLevel } from '@nihongo/shared/constants'
import type { PlacementQuestion } from '@nihongo/shared/types'

import { JLPT_LEVELS } from '@nihongo/shared/constants'
import { placedLevel, PLACEMENT_PASS } from '@nihongo/shared/lib'
import { computed, ref } from 'vue'

/**
 * A short placement check: what does this word mean?
 *
 * A level at a time from N5 up, stopping at the first one not passed, so a
 * true beginner who said they had studied before answers four questions and
 * not twenty. "I don't know" is an answer — guessing would place someone above
 * where they can actually read.
 */
interface Props {
  questions: PlacementQuestion[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** The level to start at. */
  done: [level: JlptLevel]
}>()

// ============ Reactive State ============
const levelIndex = ref(0)
const questionIndex = ref(0)
const right = ref<Partial<Record<JlptLevel, number>>>({})
const picked = ref<string | null>(null)

// ============ Computed Properties ============
const levels = computed(() => JLPT_LEVELS.filter(l => props.questions.some(q => q.level === l)))
const level = computed(() => levels.value[levelIndex.value])
const ofLevel = computed(() => props.questions.filter(q => q.level === level.value))
const question = computed(() => ofLevel.value[questionIndex.value])

// ============ Methods ============
function answer(choice: string | null) {
  if (picked.value !== null || !question.value || !level.value)
    return
  picked.value = choice ?? ''
  if (choice === question.value.answer)
    right.value = { ...right.value, [level.value]: (right.value[level.value] ?? 0) + 1 }
  // A beat to see whether it was right, then on.
  setTimeout(next, 700)
}

function next() {
  picked.value = null
  if (questionIndex.value + 1 < ofLevel.value.length) {
    questionIndex.value++
    return
  }
  const passed = (right.value[level.value!] ?? 0) >= Math.min(PLACEMENT_PASS, ofLevel.value.length)
  if (passed && levelIndex.value + 1 < levels.value.length) {
    levelIndex.value++
    questionIndex.value = 0
    return
  }
  emit('done', placedLevel(right.value))
}
</script>

<template>
  <div v-if="question">
    <p class="text-sm text-[var(--color-muted)]">
      {{ level }} · question {{ questionIndex + 1 }} of {{ ofLevel.length }}
    </p>
    <p class="mt-6 text-center text-5xl" style="font-family: var(--font-jp)">
      {{ question.word }}
    </p>
    <p class="mt-2 text-center text-[var(--color-muted)]" style="font-family: var(--font-jp)">
      {{ question.reading }}
    </p>
    <p class="mt-6 font-medium">
      What does it mean?
    </p>
    <ul class="mt-3 space-y-2">
      <li v-for="c in question.choices" :key="c">
        <button
          type="button"
          class="w-full rounded-xl border px-4 py-3 text-left transition"
          :class="picked === null
            ? 'border-[var(--color-border)] hover:border-[var(--color-text)]'
            : c === question.answer
              ? 'border-[var(--color-success)] text-[var(--color-success)]'
              : c === picked ? 'border-[var(--color-danger)] text-[var(--color-danger)]' : 'border-[var(--color-border)] opacity-50'"
          :disabled="picked !== null"
          @click="answer(c)"
        >
          {{ c }}
        </button>
      </li>
    </ul>
    <button
      type="button"
      class="mt-4 text-sm text-[var(--color-muted)] underline underline-offset-4"
      :disabled="picked !== null"
      @click="answer(null)"
    >
      I don't know
    </button>
  </div>
</template>
