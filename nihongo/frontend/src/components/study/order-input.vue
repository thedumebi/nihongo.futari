<script setup lang="ts">
import type { FuriganaMode } from '@nihongo/shared/constants'
import type { FuriganaSegment } from '@nihongo/shared/types'

import FuriganaText from '@/components/ja/furigana-text.vue'

/**
 * Rebuild a sentence from its parts — Bunpo's "choose the word order".
 *
 * Extracted from `study.vue` so the lesson quiz can ask it too. The tiles carry
 * their own ruby: a word-order question whose chips you cannot read is a
 * jigsaw, not a language exercise.
 *
 * Holds no state of its own. `placed` is indices into `tiles`, owned by the
 * caller, so Study can keep it in the card's reset cycle and a lesson can throw
 * it away between questions.
 */
defineProps<{
  /** The shuffled pieces. */
  tiles: string[]
  /** Ruby per tile, keyed by the tile's own text. */
  tileFurigana: Record<string, FuriganaSegment[] | undefined>
  /** Indices into `tiles`, in the order they were placed. */
  placed: number[]
  revealed: boolean
  mode: FuriganaMode
  knownKanji?: Set<string>
}>()

defineEmits<{
  (e: 'place', tileIndex: number): void
  (e: 'remove', position: number): void
}>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- The line being built. Empty slots make it obvious this is an
         arrangement rather than a text field. -->
    <div
      class="flex min-h-14 flex-wrap items-center gap-1.5 rounded-lg border border-dashed border-[var(--color-border)] p-3 text-xl"
      style="font-family: var(--font-jp)"
    >
      <button
        v-for="(tileIndex, position) in placed"
        :key="`placed-${position}`"
        type="button"
        class="rounded-md bg-[var(--color-washi)] px-2.5 py-1 transition hover:opacity-70"
        :disabled="revealed"
        @click="$emit('remove', position)"
      >
        <FuriganaText
          :text="tiles[tileIndex] ?? ''"
          :segments="tileFurigana[tiles[tileIndex] ?? '']"
          :mode="mode"
          :known-kanji="knownKanji"
        />
      </button>
      <span v-if="placed.length === 0" class="text-base text-[var(--color-muted)]">
        Tap the words below
      </span>
    </div>

    <div class="flex flex-wrap gap-1.5" style="font-family: var(--font-jp)">
      <button
        v-for="(tile, tileIndex) in tiles"
        :key="`tile-${tileIndex}`"
        type="button"
        class="rounded-md border border-[var(--color-border)] px-3 py-2 text-xl transition"
        :class="placed.includes(tileIndex) ? 'invisible' : 'hover:border-[var(--color-text)]'"
        :disabled="revealed || placed.includes(tileIndex)"
        @click="$emit('place', tileIndex)"
      >
        <FuriganaText
          :text="tile"
          :segments="tileFurigana[tile]"
          :mode="mode"
          :known-kanji="knownKanji"
        />
      </button>
    </div>
  </div>
</template>
