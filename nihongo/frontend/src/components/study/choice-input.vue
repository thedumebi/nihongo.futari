<script setup lang="ts">
/**
 * Pick one of several answers.
 *
 * Extracted from `study.vue` so the lesson quiz can ask a multiple-choice
 * question without forking the study loop — bolting a second copy of this into
 * a new view is exactly how the grammar lesson ended up somewhere nobody would
 * find it.
 *
 * Deliberately dumb: it knows the options, which one is right, and what was
 * chosen. It does not know about cards, scheduling or what happens next, so
 * Study and Lessons can each decide that for themselves.
 */
defineProps<{
  options: string[]
  /** The correct option, revealed alongside the choice once answered. */
  correct: string
  /** What the reader picked, or '' before they have. */
  chosen: string
  /** After the answer is shown, every button locks and colours. */
  revealed: boolean
}>()

defineEmits<{ (e: 'choose', option: string): void }>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <button
      v-for="option in options"
      :key="option"
      type="button"
      class="rounded-lg border px-4 py-3 text-left transition"
      :class="[
        !revealed ? 'border-[var(--color-border)] hover:border-[var(--color-text)]' : '',
        revealed && option === correct ? 'border-[var(--color-success)] text-[var(--color-success)]' : '',
        revealed && option === chosen && option !== correct ? 'border-[var(--color-danger)] text-[var(--color-danger)]' : '',
        revealed && option !== correct && option !== chosen ? 'border-[var(--color-border)] opacity-50' : '',
      ]"
      :disabled="revealed"
      @click="$emit('choose', option)"
    >
      {{ option }}
    </button>
  </div>
</template>
