<script setup lang="ts" generic="T extends string | number">
/**
 * A game's answers as boxes, two to a row with clear space between them.
 *
 * Shared by every game that asks "which one?", so the boxes look and behave
 * the same everywhere: tap one, the answer turns green, a wrong pick turns
 * red, the rest fade, and nothing can be tapped again until the next round.
 * What goes inside a box is the caller's: plain text by default, or the slot.
 */
interface Props {
  options: readonly T[]
  answer: T
  /** The box tapped, or null while the question is open. */
  picked: T | null
  /** Japanese answers are set in the Japanese face. */
  jp?: boolean
}

withDefaults(defineProps<Props>(), {
  jp: false
})

const emit = defineEmits<{
  pick: [option: T]
}>()
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <button
      v-for="(o, i) in options"
      :key="o"
      type="button"
      class="rounded-xl border p-4 text-center transition"
      :style="jp ? 'font-family: var(--font-jp)' : undefined"
      :class="picked === null
        ? 'border-[var(--color-border)] hover:border-[var(--color-text)]'
        : o === answer
          ? 'border-[var(--color-success)] bg-[var(--color-card)]'
          : o === picked ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)] opacity-60'"
      :disabled="picked !== null"
      @click="emit('pick', o)"
    >
      <slot :option="o" :index="i">
        <span class="text-2xl">{{ o }}</span>
      </slot>
    </button>
  </div>
</template>
