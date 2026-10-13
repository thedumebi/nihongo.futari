<script setup lang="ts">
import type { CrosswordPuzzle } from '@nihongo/shared/types'

import { computed } from 'vue'

/**
 * The grid: black cells where no word goes, a number where a word starts, a
 * small letter on a bonus cell, and whatever has been typed.
 *
 * The word being answered is shaded and the cursor cell outlined; a wrong kana
 * is red and struck through, so a mistake is seen while the word is still in
 * mind rather than at the end.
 */
interface Props {
  puzzle: CrosswordPuzzle
  typed: string[][]
  selected: { row: number, col: number } | null
  /** Keys "r:c" of the cells in the word being answered. */
  current: Set<string>
  revealed: Set<string>
  pending: string
  isWrong: (row: number, col: number) => boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  pick: [row: number, col: number]
}>()

// ============ Computed Properties ============
/** The number printed in each cell where a word starts. */
const numbers = computed(() => {
  const out = new Map<string, number>()
  for (const e of props.puzzle.entries) out.set(`${e.row}:${e.col}`, e.number)
  return out
})

/** A, B, C… on the cells that spell the bonus word. */
const bonusLabels = computed(() => {
  const out = new Map<string, string>()
  props.puzzle.bonus?.cells.forEach(([r, c], i) => out.set(`${r}:${c}`, String.fromCharCode(65 + i)))
  return out
})

// ============ Methods ============
function isCursor(r: number, c: number) {
  return props.selected?.row === r && props.selected?.col === c
}

function shown(r: number, c: number): string {
  // The romaji still being typed shows in the cursor cell, so "k" is visible
  // until it becomes か.
  if (isCursor(r, c) && props.pending)
    return props.pending
  return props.typed[r]?.[c] ?? ''
}
</script>

<template>
  <div
    class="grid aspect-square w-full gap-px overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-border)]"
    :style="{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }"
    role="grid"
    aria-label="Crossword"
  >
    <template v-for="(row, r) in puzzle.cells" :key="r">
      <template v-for="(answer, c) in row" :key="`${r}:${c}`">
        <div v-if="answer === null" class="bg-[var(--color-text)] opacity-90" aria-hidden="true" />
        <button
          v-else
          type="button"
          role="gridcell"
          class="relative flex items-center justify-center transition-colors"
          :class="[
            isCursor(r, c)
              ? 'z-10 bg-[var(--color-washi)] outline outline-2 -outline-offset-2 outline-[var(--color-primary)]'
              : current.has(`${r}:${c}`) ? 'bg-[var(--color-washi)]' : 'bg-[var(--color-card)]',
          ]"
          :aria-label="`Row ${r + 1}, column ${c + 1}${typed[r]?.[c] ? `, ${typed[r]?.[c]}` : ', empty'}`"
          @click="emit('pick', r, c)"
        >
          <span
            v-if="numbers.has(`${r}:${c}`)"
            class="absolute left-1 top-0.5 text-[0.6rem] leading-none text-[var(--color-muted)] sm:text-xs"
          >{{ numbers.get(`${r}:${c}`) }}</span>
          <span
            v-if="bonusLabels.has(`${r}:${c}`)"
            class="absolute bottom-0.5 right-1 text-[0.6rem] font-semibold leading-none text-[var(--color-accent)] sm:text-xs"
          >{{ bonusLabels.get(`${r}:${c}`) }}</span>
          <span
            class="text-2xl sm:text-3xl"
            :class="[
              isCursor(r, c) && pending ? 'text-base text-[var(--color-muted)] sm:text-lg' : '',
              isWrong(r, c) ? 'text-[var(--color-danger)] line-through decoration-2' : '',
              revealed.has(`${r}:${c}`) ? 'text-[var(--color-accent)]' : '',
            ]"
            style="font-family: var(--font-jp)"
          >{{ shown(r, c) }}</span>
        </button>
      </template>
    </template>
  </div>
</template>
