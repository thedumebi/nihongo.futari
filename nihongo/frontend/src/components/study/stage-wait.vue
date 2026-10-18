<script setup lang="ts">
import type { StageProgress } from '@nihongo/shared/types'

import { cardsToPassStage } from '@nihongo/shared/lib'
import { computed } from 'vue'

/**
 * Why no new words are coming: the stage you are on has none left to
 * introduce, and the next one opens once most of it is learned.
 *
 * Shown on Today and on Study. Without it the reader got thirty cards of words
 * they had already met, and Today promised "11 new words for today" that the
 * queue could not give.
 */

interface Props {
  stage: StageProgress
  /** One line, for above a card; the full explanation otherwise. */
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), { compact: false })

// ============ Computed Properties ============
const needed = computed(() => cardsToPassStage(props.stage.learned, props.stage.total))
const target = computed(() => props.stage.learned + needed.value)
/** What opens next: the next stage, or the next level after the last one. */
const next = computed(() => props.stage.stage < props.stage.stages
  ? `stage ${props.stage.stage + 1}`
  : `the level after ${props.stage.level}`)
const cards = computed(() => `${needed.value} more ${needed.value === 1 ? 'card' : 'cards'}`)
</script>

<template>
  <p v-if="compact" class="text-sm text-[var(--color-muted)]">
    New words open at {{ next }}. Learn {{ cards }} from stage {{ stage.stage }} to get there.
  </p>
  <div v-else>
    <p class="mt-2 text-xl font-semibold">
      No new words until {{ next }}
    </p>
    <p class="mt-1 text-sm text-[var(--color-muted)]">
      You've met every word in {{ stage.level }} stage {{ stage.stage }}. Learn {{ cards }} from it
      ({{ stage.learned }} of {{ stage.total }} now, {{ target }} needed) and the next words open.
      Until then, Study gives you more practice with the words you've met.
    </p>
  </div>
</template>
