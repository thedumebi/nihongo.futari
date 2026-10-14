<script setup lang="ts">
import { computed } from 'vue'

/**
 * How much of a text the learner already knows, as a small ring and a number.
 *
 * Shown on the speech and conversation lists so a learner can see which texts
 * have come within reach — around 90% known is where reading stops being
 * decoding — and so every word learned visibly moves something.
 */
interface Props {
  /** 0–1, or null when the text has nothing reviewable to know. */
  coverage: number | null
}

const props = defineProps<Props>()

const percent = computed(() => Math.round((props.coverage ?? 0) * 100))
/** Within reach: known well enough to read rather than decode. */
const ready = computed(() => (props.coverage ?? 0) >= 0.9)
const CIRCUMFERENCE = 2 * Math.PI * 7
</script>

<template>
  <span
    v-if="coverage !== null"
    class="inline-flex shrink-0 items-center gap-1 text-xs tabular-nums"
    :class="ready ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]'"
    :title="`You know ${percent}% of the words in this`"
  >
    <svg viewBox="0 0 18 18" class="h-4 w-4 -rotate-90" aria-hidden="true">
      <circle cx="9" cy="9" r="7" fill="none" stroke="var(--color-border)" stroke-width="2.5" />
      <circle
        cx="9"
        cy="9"
        r="7"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="CIRCUMFERENCE * (1 - (coverage ?? 0))"
      />
    </svg>
    {{ percent }}%
  </span>
</template>
