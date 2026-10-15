<script setup lang="ts">
import { computed } from 'vue'

/**
 * How much of a text the learner already knows, in words.
 *
 * Shown on the speech and conversation lists so a learner can see which texts
 * have come within reach — around 90% known is where reading stops being
 * decoding — and so every word learned visibly moves something.
 *
 * Spelled out as "words known", never a bare ring and number: on a list of
 * things to do, a bare percentage reads as how far through it you are, and a
 * text you have never opened would look half done.
 */
interface Props {
  /** 0–1, or null when the text has nothing reviewable to know. */
  coverage: number | null
}

const props = defineProps<Props>()

const percent = computed(() => Math.round((props.coverage ?? 0) * 100))
/** Within reach: known well enough to read rather than decode. */
const ready = computed(() => (props.coverage ?? 0) >= 0.9)
</script>

<template>
  <span
    v-if="coverage !== null"
    class="inline-flex shrink-0 items-center text-xs tabular-nums"
    :class="ready ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]'"
    :title="`You know ${percent}% of the words in this`"
  >
    {{ ready ? 'Ready to read · ' : '' }}{{ percent }}% of words known
  </span>
</template>
