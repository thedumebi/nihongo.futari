<script setup lang="ts">
import { computed } from 'vue'

/**
 * Pitch accent, drawn.
 *
 * The database stores a downstep position — a bare number that tells a learner
 * nothing. Japanese pitch is not stress: every mora is simply high or low, and
 * the word is defined by WHERE it drops. That is a shape, so it is drawn as one.
 *
 * The trailing mark is the following particle, and it is the whole reason the
 * diagram earns its space: 花 (heiban) and 鼻 (odaka) sound identical alone and
 * differ only in what happens to the particle after them.
 */
const props = defineProps<{
  reading: string
  /** High/low per mora, plus one trailing entry for the particle. */
  shape: boolean[]
  pattern: string
}>()

/** Split the reading into morae so each mark sits over its own mora. */
const morae = computed(() => {
  const COMBINING = new Set(['ゃ', 'ゅ', 'ょ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ゎ', 'ャ', 'ュ', 'ョ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ヮ'])
  const out: string[] = []
  for (const char of props.reading) {
    if (COMBINING.has(char) && out.length > 0)
      out[out.length - 1] += char
    else out.push(char)
  }
  return out
})

const PATTERN_LABEL: Record<string, string> = {
  heiban: '平板 heiban — stays high, and the particle stays high too',
  atamadaka: '頭高 atamadaka — drops after the first mora',
  nakadaka: '中高 nakadaka — drops in the middle',
  odaka: '尾高 odaka — drops on the following particle'
}
</script>

<template>
  <div>
    <div class="flex items-end gap-0.5" style="font-family: var(--font-jp)">
      <div
        v-for="(mora, i) in morae"
        :key="i"
        class="flex flex-col items-center"
      >
        <!-- The bar sits high or low; the drop is visible as a step down. -->
        <span
          class="block h-1 w-full rounded-full transition-none"
          :class="shape[i] ? 'bg-[var(--color-accent)]' : 'bg-transparent'"
          style="min-width: 1.4em"
        />
        <span
          class="mt-0.5 block h-1 w-full rounded-full"
          :class="!shape[i] ? 'bg-[var(--color-muted)]' : 'bg-transparent'"
          style="min-width: 1.4em"
        />
        <span class="mt-1 text-lg leading-none">{{ mora }}</span>
      </div>

      <!-- The particle slot. Dashed, because no particular particle is meant. -->
      <div class="flex flex-col items-center opacity-60">
        <span
          class="block h-1 w-full rounded-full"
          :class="shape[morae.length] ? 'bg-[var(--color-accent)]' : 'bg-transparent'"
          style="min-width: 1.1em"
        />
        <span
          class="mt-0.5 block h-1 w-full rounded-full"
          :class="!shape[morae.length] ? 'bg-[var(--color-muted)]' : 'bg-transparent'"
          style="min-width: 1.1em"
        />
        <span class="mt-1 text-lg leading-none text-[var(--color-muted)]">◦</span>
      </div>
    </div>
    <p class="mt-2 text-xs text-[var(--color-muted)]">
      {{ PATTERN_LABEL[pattern] ?? pattern }}
    </p>
  </div>
</template>
