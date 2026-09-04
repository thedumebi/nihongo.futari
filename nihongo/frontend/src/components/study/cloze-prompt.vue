<script setup lang="ts">
import type { FuriganaMode } from '@nihongo/shared/constants'
import type { FuriganaSegment, GlossedToken } from '@nihongo/shared/types'

import FuriganaText from '@/components/ja/furigana-text.vue'
import TokenLine from '@/components/ja/token-line.vue'

/**
 * A sentence with a hole in it.
 *
 * Extracted from `study.vue` so the lesson quiz can ask a fill-the-blank
 * question — the type that comes free with every authored example sentence,
 * and so the one a lesson will ask most.
 *
 * Selection is NOT owned here. The caller holds which word is open and decides
 * where to put the meaning strip: Study renders it below the whole prompt
 * block, and moving it inside this component would have quietly changed that
 * layout. A refactor that shifts the furniture is not a refactor.
 */
defineProps<{
  before: string
  after: string
  /** Glossed tokens make each word tappable; empty falls back to plain ruby. */
  beforeTokens: GlossedToken[]
  afterTokens: GlossedToken[]
  beforeSegments: FuriganaSegment[]
  afterSegments: FuriganaSegment[]
  /** Shown in the blank once the answer is out. */
  answer: string
  revealed: boolean
  mode: FuriganaMode
  knownKanji?: Set<string>
  selectedBefore: number | null
  selectedAfter: number | null
}>()

defineEmits<{
  (e: 'pick', half: 'before' | 'after', index: number | null): void
}>()
</script>

<template>
  <p class="mt-8 text-center text-3xl leading-relaxed" style="font-family: var(--font-jp)">
    <!--
      TokenLine, not FuriganaText: it renders the ruby AND makes each word
      tappable for its meaning. Two components cannot own the same run of text,
      so this one does both. It falls back to the plain line when the backend
      supplied no tokens.
    -->
    <TokenLine
      v-if="beforeTokens.length"
      :tokens="beforeTokens"
      :text="before"
      reading=""
      :mode="mode"
      :known-kanji="knownKanji"
      :selected="selectedBefore"
      @pick="$emit('pick', 'before', $event)"
    />
    <FuriganaText
      v-else
      :text="before"
      :segments="beforeSegments"
      :mode="mode"
      :known-kanji="knownKanji"
    />
    <span
      class="mx-1 inline-block min-w-[3ch] border-b-2 px-2 align-bottom"
      :class="revealed ? 'border-[var(--color-success)] text-[var(--color-success)]' : 'border-[var(--color-muted)]'"
    >{{ revealed ? answer : '' }}</span>
    <TokenLine
      v-if="afterTokens.length"
      :tokens="afterTokens"
      :text="after"
      reading=""
      :mode="mode"
      :known-kanji="knownKanji"
      :selected="selectedAfter"
      @pick="$emit('pick', 'after', $event)"
    />
    <FuriganaText
      v-else
      :text="after"
      :segments="afterSegments"
      :mode="mode"
      :known-kanji="knownKanji"
    />
  </p>
</template>
