<script setup lang="ts">
import type { MnemonicView } from '@nihongo/shared/types'

import { onMounted, ref, watch } from 'vue'

import { mnemonicsForKanji, mnemonicsForWord } from '@/api/mnemonics'
import Tooltip from '@/components/ui/tooltip.vue'

/**
 * Invented memory aids for one kanji or word.
 *
 * Deliberately nothing like the etymology cards beside it: a dashed border,
 * its own heading, and a label on every aid saying it was made up. Etymology
 * is sourced history; this is a trick for remembering, and a learner must
 * never mistake one for the other. Shares no code with the etymology section.
 *
 * Renders nothing at all when there is no published aid, or the request fails:
 * a missing memory aid is not worth an error on the page.
 */
interface Props {
  /** A kanji character, for the kanji page. */
  kanji?: string
  /** A word id, for the word entry. */
  wordId?: string
  languageCode?: string
}

const props = withDefaults(defineProps<Props>(), {
  kanji: undefined,
  wordId: undefined,
  languageCode: 'ja'
})

// ============ Reactive State ============
const aids = ref<MnemonicView[]>([])

// ============ Watchers ============
watch(() => [props.kanji, props.wordId, props.languageCode], load)

// ============ Lifecycle Hooks ============
onMounted(load)

// ============ Methods ============
/** Bumped per load, so a slow answer for the last subject never lands on this one. */
let loadSeq = 0

async function load() {
  const seq = ++loadSeq
  aids.value = []
  try {
    const found = props.kanji
      ? await mnemonicsForKanji(props.kanji, props.languageCode)
      : props.wordId
        ? await mnemonicsForWord(props.wordId)
        : { mnemonics: [] }
    if (seq === loadSeq)
      aids.value = found.mnemonics
  } catch {
    // Nothing to show is the right answer here.
  }
}
</script>

<template>
  <section v-if="aids.length" class="mt-8 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-washi)] p-5">
    <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
      <Tooltip content="A memory aid is made up to help you remember. It is not where the character or word comes from; the history, where we have a source for it, is shown separately." position="bottom">
        <span class="underline decoration-dotted underline-offset-4">Memory aid</span>
      </Tooltip>
    </h2>
    <p class="mt-1 text-xs text-[var(--color-muted)]">
      Invented, not historical.
    </p>
    <ul class="mt-3 space-y-3">
      <li v-for="aid in aids" :key="aid.id" class="text-sm text-[var(--color-text)]">
        <p class="whitespace-pre-line">
          {{ aid.text }}
        </p>
        <p v-if="aid.imagery" class="mt-1 italic text-[var(--color-muted)]">
          {{ aid.imagery }}
        </p>
      </li>
    </ul>
  </section>
</template>
