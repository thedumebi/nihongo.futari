<script setup lang="ts">
import type { FuriganaSegment } from '@nihongo/shared/lib'
import type { CorrectionProposal } from '@nihongo/shared/types'

import FuriganaText from '@/components/ja/furigana-text.vue'

/**
 * A reading correction, as a reviewer needs to see it: the line as it reads
 * now, as it would read, and why each change is made. Readings are shown over
 * every kanji, whatever the reviewer's own furigana setting, because the
 * readings ARE what is being reviewed.
 */
interface Props {
  correction: CorrectionProposal
}

defineProps<Props>()

/** `来[き]た`, the way the change list writes a word. */
function bracketed(segments: readonly FuriganaSegment[]): string {
  return segments.map(s => s.r ? `${s.t}[${s.r}]` : s.t).join('')
}
</script>

<template>
  <div class="mt-3 space-y-3 text-sm">
    <template v-if="correction.type === 'sentence'">
      <div class="grid grid-cols-[4.5rem_1fr] items-baseline gap-x-3 gap-y-2">
        <span class="text-xs uppercase tracking-wide text-[var(--color-muted)]">Now</span>
        <p class="text-lg leading-[2.2]">
          <FuriganaText :text="correction.text" :segments="correction.before" mode="always" />
        </p>
        <span class="text-xs uppercase tracking-wide text-[var(--color-success)]">Proposed</span>
        <p class="text-lg leading-[2.2]">
          <FuriganaText :text="correction.text" :segments="correction.after" mode="always" />
        </p>
      </div>
      <ul class="space-y-1">
        <li v-for="c in correction.tokens" :key="c.index">
          <span style="font-family: var(--font-jp)">{{ bracketed(c.from) }} → <strong>{{ bracketed(c.to) }}</strong></span>
          <span class="text-[var(--color-muted)]"> — {{ c.why }}</span>
        </li>
        <li v-for="g in correction.gaps" :key="g.at">
          <span style="font-family: var(--font-jp)">{{ g.t }} (no reading) → <strong>{{ g.t }}[{{ g.reading }}]</strong></span>
          <span class="text-[var(--color-muted)]"> — {{ g.why }}</span>
        </li>
      </ul>
    </template>

    <template v-else>
      <p class="text-lg" style="font-family: var(--font-jp)">
        {{ correction.text }}
      </p>
      <div class="grid grid-cols-[4.5rem_1fr] items-baseline gap-x-3 gap-y-1" style="font-family: var(--font-jp)">
        <span class="text-xs uppercase tracking-wide text-[var(--color-muted)]" style="font-family: var(--font-sans)">Now</span>
        <p>{{ correction.from }}</p>
        <span class="text-xs uppercase tracking-wide text-[var(--color-success)]" style="font-family: var(--font-sans)">Proposed</span>
        <p>{{ correction.to }}</p>
      </div>
      <p class="text-[var(--color-muted)]">
        {{ correction.why }}
      </p>
    </template>

    <p v-if="correction.translation" class="text-[var(--color-muted)]">
      {{ correction.translation }}
    </p>
  </div>
</template>
