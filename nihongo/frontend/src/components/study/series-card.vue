<script setup lang="ts">
import type { FuriganaMode } from '@nihongo/shared/constants'
import type { PhoneticSeriesView } from '@nihongo/shared/types'

import { seriesReading } from '@nihongo/shared/lib'
import { useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'

import SeriesExplainer from '@/components/study/series-explainer.vue'

/**
 * A sound series, taught so the pattern can be seen.
 *
 * It used to be a part (共) beside a few grey kanji and the question "which
 * on-reading does 共 predict?" — nothing said the kanji contain 共, what they
 * read or mean, or that some break the pattern, and a learner could not tie it
 * together. Now every kanji is shown split into its parts with the shared one
 * marked, with its meaning, and — once it is time to — its reading and a real
 * word that uses it. The exceptions are shown too: a rule without them is a
 * half-truth.
 *
 *  - `teach`: the first meeting. Everything at once, and the idea explained.
 *  - `ask`:   the question. Readings stay hidden until the answer is in.
 */
interface Props {
  series: PhoneticSeriesView
  mode: 'teach' | 'ask'
  revealed?: boolean
  /** The reader's furigana setting: readings are written in their script. */
  script: FuriganaMode
  /** Every kanji, not the first few — for the series' own page. */
  all?: boolean
}

const props = withDefaults(defineProps<Props>(), { revealed: false, all: false })

// ============ Constants ============
/** Enough kanji to see the pattern without a wall of them. */
const SHOWN = 5
const EXCEPTIONS_SHOWN = 3

// ============ Reactive State ============
/** The idea is explained in full once; after that it is a tap away. A per-device convenience. */
const explained = useLocalStorage('go-series-explained', false)

// ============ Computed Properties ============
const followers = computed(() => props.series.members.filter(m => m.followsSeries))
const exceptions = computed(() => props.series.members.filter(m => !m.followsSeries))
const showReadings = computed(() => props.mode === 'teach' || props.revealed)
const reading = computed(() => seriesReading(props.series.primaryReading, props.script))
const explainerOpen = computed(() => props.mode === 'teach' && !explained.value)

// ============ Methods ============
function read(kana: string) {
  return seriesReading(kana, props.script)
}
</script>

<template>
  <div class="mx-auto max-w-md text-left">
    <!-- The idea, once. A sound series means nothing until this is said. -->
    <SeriesExplainer
      :open="explainerOpen"
      :example="showReadings ? { component: series.component, reading: series.primaryReading, kanji: followers.map(m => ({ character: m.character, reading: m.reading })) } : undefined"
      :avoid="series.component"
      @closed="explained = true"
    />

    <!-- The sound part itself. -->
    <div class="mt-5 flex items-center gap-4">
      <span class="text-5xl" style="font-family: var(--font-jp)">{{ series.component }}</span>
      <div>
        <p class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
          Sound part
        </p>
        <p v-if="series.componentMeaning" class="font-medium">
          {{ series.componentMeaning }}
        </p>
        <p v-if="showReadings" class="text-[var(--color-muted)]" style="font-family: var(--font-jp)">
          {{ reading.main }} <span v-if="reading.sub" class="text-sm">· {{ reading.sub }}</span>
        </p>
      </div>
    </div>

    <p class="mt-5 font-medium">
      <template v-if="showReadings">
        Read {{ reading.main }} ({{ followers.length }} of {{ series.members.length }} kanji with {{ series.component }}):
      </template>
      <template v-else>
        These kanji all contain <span style="font-family: var(--font-jp)">{{ series.component }}</span>. What reading do they usually share?
      </template>
    </p>
    <ul class="mt-2 divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]">
      <li v-for="m in all ? followers : followers.slice(0, SHOWN)" :key="m.character" class="flex items-center gap-3 px-3 py-2">
        <span class="text-3xl" style="font-family: var(--font-jp)">{{ m.character }}</span>
        <div class="min-w-0 flex-1">
          <p class="text-sm" style="font-family: var(--font-jp)">
            <template v-if="m.parts.length">
              <template v-for="(part, i) in m.parts" :key="i">
                <span v-if="i > 0" class="text-[var(--color-muted)]"> + </span>
                <span :class="part === series.component ? 'rounded bg-[var(--color-card)] px-1 font-semibold text-[var(--color-accent)]' : ''">{{ part }}</span>
              </template>
            </template>
            <span v-if="m.meaning" class="ml-2 text-[var(--color-muted)]" style="font-family: var(--font-sans)">{{ m.meaning }}</span>
            <span v-if="m.known" class="ml-2 text-xs text-[var(--color-success)]" style="font-family: var(--font-sans)">you know this</span>
          </p>
          <p v-if="showReadings && m.word" class="text-xs text-[var(--color-muted)]" style="font-family: var(--font-jp)">
            {{ m.word.form }}（{{ m.word.reading }}）<span v-if="m.word.meaning" style="font-family: var(--font-sans)"> {{ m.word.meaning }}</span>
          </p>
        </div>
        <span v-if="showReadings" class="shrink-0 text-sm" style="font-family: var(--font-jp)">{{ read(m.reading).main }}</span>
      </li>
    </ul>

    <template v-if="showReadings && exceptions.length">
      <p class="mt-4 text-sm font-medium">
        Break the pattern
      </p>
      <ul class="mt-1 space-y-1 text-sm">
        <li v-for="m in all ? exceptions : exceptions.slice(0, EXCEPTIONS_SHOWN)" :key="m.character" class="flex items-baseline gap-2">
          <span class="text-xl" style="font-family: var(--font-jp)">{{ m.character }}</span>
          <span style="font-family: var(--font-jp)">{{ read(m.reading).main }}</span>
          <span v-if="m.meaning" class="text-[var(--color-muted)]">{{ m.meaning }}</span>
        </li>
      </ul>
    </template>

    <p v-if="showReadings" class="mt-4 rounded-lg bg-[var(--color-card)] p-3 text-sm">
      Meet a kanji with <span style="font-family: var(--font-jp)">{{ series.component }}</span> in it? Guess
      <span style="font-family: var(--font-jp)">{{ reading.main }}</span> first.
    </p>
  </div>
</template>
