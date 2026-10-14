<script setup lang="ts">
/**
 * JLPT level pills with a count on each — Read and Speak pick a level the
 * same way, from the same component, so they cannot drift apart.
 */
interface Props {
  levels: readonly string[]
  /** How many items each level has; a missing level reads 0. */
  counts: Map<string, number>
}

defineProps<Props>()

const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="flex flex-wrap gap-2" role="tablist" aria-label="Level">
    <button
      v-for="l in levels"
      :key="l"
      type="button"
      role="tab"
      :aria-selected="l === model"
      class="rounded-full border px-3 py-1.5 text-sm transition"
      :class="l === model
        ? 'border-[var(--color-text)]'
        : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'"
      @click="model = l"
    >
      {{ l }}
      <span class="ml-1 opacity-70">{{ counts.get(l) ?? 0 }}</span>
    </button>
  </div>
</template>
