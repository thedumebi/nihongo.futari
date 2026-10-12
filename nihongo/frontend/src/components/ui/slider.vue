<script setup lang="ts">
/**
 * A labelled range input.
 *
 * Native `<input type="range">` underneath, so keyboard, touch and screen
 * readers all work without anything bespoke; only the colour is themed.
 */
interface Props {
  label: string
  min: number
  max: number
  step?: number
  /** What the current value means, read out beside the label — "Slow", "1.5×". */
  valueText?: string
}

withDefaults(defineProps<Props>(), { step: 1, valueText: '' })

const model = defineModel<number>({ required: true })
</script>

<template>
  <label class="flex min-w-0 flex-col gap-1 text-sm">
    <span class="flex items-baseline justify-between gap-2 text-[var(--color-muted)]">
      <span>{{ label }}</span>
      <span v-if="valueText" class="tabular-nums">{{ valueText }}</span>
    </span>
    <input
      v-model.number="model"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :aria-valuetext="valueText || undefined"
      class="w-full accent-[var(--color-primary)]"
    >
  </label>
</template>
