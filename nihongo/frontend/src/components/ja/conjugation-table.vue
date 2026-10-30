<script setup lang="ts">
import type { FuriganaMode } from '@nihongo/shared/constants'
import type { ConjugationTable } from '@nihongo/shared/types'

import { computed } from 'vue'

import FuriganaText from '@/components/ja/furigana-text.vue'
import CollapsibleCard from '@/components/ui/collapsible-card.vue'
import Tooltip from '@/components/ui/tooltip.vue'

/**
 * How one word changes, on its dictionary entry: polite and plain side by
 * side for each tense, then the other forms, each named. Tap a form's name for
 * what it does. Folded until asked for, so the meaning stays the first thing
 * on the page.
 */

interface Props {
  table: ConjugationTable
  mode?: FuriganaMode
  knownKanji?: Set<string>
}

const props = withDefaults(defineProps<Props>(), { mode: undefined, knownKanji: undefined })

// ============ Computed Properties ============
const title = computed(() => props.table.kind === 'verb' ? 'Verb forms' : 'Adjective forms')
const summary = computed(() => props.table.kind === 'verb'
  ? 'Polite and plain, past, te-form and more'
  : 'Polite and plain, past, negative and more')
</script>

<template>
  <CollapsibleCard :title="title" :summary="summary">
    <p v-if="table.note" class="mb-3 text-sm text-[var(--color-muted)]" style="font-family: var(--font-jp)">
      {{ table.note }}
    </p>

    <table class="w-full table-fixed text-left">
      <thead>
        <tr class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
          <th class="w-1/4 pb-2 font-normal" />
          <th class="pb-2 font-normal">
            <Tooltip content="Said to someone you are not close to: a teacher, a shop, a stranger.">
              <span class="underline decoration-dotted underline-offset-4">Polite</span>
            </Tooltip>
          </th>
          <th class="pb-2 font-normal">
            <Tooltip content="Said to friends and family, and the form most grammar is built on.">
              <span class="underline decoration-dotted underline-offset-4">Plain</span>
            </Tooltip>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in table.grid" :key="row.tense" class="border-t border-[var(--color-border)] align-top">
          <th class="py-2 pr-2 text-xs font-normal text-[var(--color-muted)]">
            {{ row.tense }}
          </th>
          <td class="py-2 pr-2 text-lg" style="font-family: var(--font-jp)">
            <FuriganaText v-if="row.polite" :text="row.polite.surface" :reading="row.polite.reading" :mode="mode" :known-kanji="knownKanji" />
          </td>
          <td class="py-2 text-lg" style="font-family: var(--font-jp)">
            <FuriganaText v-if="row.plain" :text="row.plain.surface" :reading="row.plain.reading" :mode="mode" :known-kanji="knownKanji" />
          </td>
        </tr>
      </tbody>
    </table>

    <h3 v-if="table.others.length" class="mt-5 text-xs uppercase tracking-wide text-[var(--color-muted)]">
      Other forms
    </h3>
    <ul class="mt-2 space-y-2">
      <li
        v-for="other in table.others"
        :key="other.label"
        class="flex items-baseline justify-between gap-3 border-t border-[var(--color-border)] pt-2"
      >
        <Tooltip :content="other.what">
          <span class="text-sm text-[var(--color-muted)] underline decoration-dotted underline-offset-4" style="font-family: var(--font-jp)">{{ other.label }}</span>
        </Tooltip>
        <span class="text-right text-lg" style="font-family: var(--font-jp)">
          <FuriganaText :text="other.surface" :reading="other.reading" :mode="mode" :known-kanji="knownKanji" />
        </span>
      </li>
    </ul>
  </CollapsibleCard>
</template>
