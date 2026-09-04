<script setup lang="ts">
/**
 * A line of English with Japanese in it, rendered the way the reader asked for.
 *
 * Explanations are written as prose — "食べる → 食べます, 食べて, 食べた" — and were
 * printed as plain text, so the furigana and romaji settings never reached
 * them. They only ever applied to the tokenised parts of the page, and an
 * explanation was not one. At N5 that leaves most of the lesson unreadable by
 * the person the lesson is for.
 *
 * The split is done here rather than on the server because the server has no
 * idea what markup surrounds a fragment. It sends readings keyed by the run
 * itself; this walks the text, hands every Japanese stretch to `TokenLine`, and
 * leaves the English alone.
 */
import type { FuriganaMode } from '@nihongo/shared/constants'
import type { GlossedToken } from '@nihongo/shared/types'

import { computed } from 'vue'

import TokenLine from '@/components/ja/token-line.vue'

const props = defineProps<{
  text: string
  /** Keyed by the Japanese run, as `getLesson` returns it. */
  prose: Record<string, { text: string, reading: string, tokens: GlossedToken[] }>
  mode: FuriganaMode
  knownKanji?: Set<string>
}>()

// Kana, kanji, the repeat mark 々 and the long vowel ー. Latin, digits, arrows
// and punctuation are not Japanese for this purpose — they read the same in
// every mode and splitting on them would cut 食べます into pieces.
const JAPANESE_RUN = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3005]+/

const parts = computed(() => {
  const out: Array<{ ja: boolean, text: string }> = []
  let rest = props.text

  while (rest) {
    const hit = JAPANESE_RUN.exec(rest)
    if (!hit) {
      out.push({ ja: false, text: rest })
      break
    }
    if (hit.index > 0)
      out.push({ ja: false, text: rest.slice(0, hit.index) })
    out.push({ ja: true, text: hit[0] })
    rest = rest.slice(hit.index + hit[0].length)
  }
  return out
})

/**
 * A run the server did not gloss falls back to plain text.
 *
 * Better than an empty span: the reader still sees the Japanese, just without
 * ruby — which is exactly what they saw before this component existed.
 */
function glossed(text: string) {
  return props.prose[text]
}
</script>

<template>
  <template v-for="(part, i) in parts" :key="i">
    <TokenLine
      v-if="part.ja && glossed(part.text)"
      :tokens="glossed(part.text)!.tokens"
      :text="part.text"
      :reading="glossed(part.text)!.reading"
      :mode="mode"
      :known-kanji="knownKanji"
      class="inline"
    />
    <template v-else>
      {{ part.text }}
    </template>
  </template>
</template>
