<script setup lang="ts">
import type { GrammarListResponse } from '@nihongo/shared/types'

import { looksLikeRomaji, romajiToHiragana } from '@nihongo/shared/lib'
import { Layers, Search, Sparkles } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import type { DropdownOption } from '@/components/ui/dropdown.vue'

import { listGrammar } from '@/api/grammar'
import FuriganaText from '@/components/ja/furigana-text.vue'
import AppShell from '@/components/layout/app-shell.vue'
import Dropdown from '@/components/ui/dropdown.vue'
import Tooltip from '@/components/ui/tooltip.vue'
import { useFurigana } from '@/composables/use-furigana'
import { useLevel } from '@/composables/use-level'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

const lang = useLanguageStore()
const { mode, knownKanji, loadKnownKanji, loadSettings } = useFurigana()

const points = ref<GrammarListResponse['points']>([])
const loading = ref(true)
// Shared: picking N5 in Study should filter Grammar to N5 too.
const { level, loadLevel } = useLevel()
const levelIcon = Layers

/** JLPT order, easiest first. Anything unrecognised sorts last. */
const LEVEL_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1']

/**
 * Levels that actually have content, with their counts.
 *
 * Built from the data rather than hardcoded: the page used to state "N5
 * patterns" in prose, which was true only for as long as N5 was the only level
 * and gave no hint that the filter was missing rather than the content.
 */
const levels = computed(() => {
  const counts = new Map<string, number>()
  for (const p of points.value) {
    if (!p.level)
      continue
    counts.set(p.level, (counts.get(p.level) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => {
      const ai = LEVEL_ORDER.indexOf(a[0])
      const bi = LEVEL_ORDER.indexOf(b[0])
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
    .map(([code, count]) => ({ code, count }))
})

const levelOptions = computed<DropdownOption[]>(() => [
  { value: '', label: 'All levels', hint: String(points.value.length) },
  ...levels.value.map(l => ({ value: l.code, label: l.code, hint: String(l.count) }))
])

const query = ref('')

/**
 * Search across everything a point is findable BY.
 *
 * Three ways in, because a reader looking for the past tense might know it as
 * 「た」, as "past", or as the shape 〜た: the Japanese title, the pattern, and
 * the English meaning are all searched together.
 *
 * Romaji is converted to kana first, so "ta" finds 〜た without a Japanese
 * keyboard — the same courtesy the dictionary already extends.
 */
const needles = computed(() => {
  const raw = query.value.trim().toLowerCase()
  if (!raw)
    return []
  const kana = looksLikeRomaji(raw) ? romajiToHiragana(raw) : ''
  return kana && kana !== raw ? [raw, kana] : [raw]
})

function matches(point: GrammarListResponse['points'][number]): boolean {
  if (needles.value.length === 0)
    return true
  const haystack = [point.title, point.pattern, point.meaningShort, point.slug]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return needles.value.some(n => haystack.includes(n))
}

/** Whether to show only the points carrying a sourced note. */
const whyOnly = ref('')

const whyOptions = computed<DropdownOption[]>(() => [
  { value: '', label: 'All patterns', hint: String(points.value.length) },
  {
    value: 'why',
    label: 'With a why note',
    hint: String(points.value.filter(p => p.hasEtymology).length),
    tooltip: 'Points with a sourced note on where the pattern came from.',
    tooltipPosition: 'bottom' as const
  }
])

const whyIcon = Sparkles

const visible = computed(() => points.value
  .filter(p => !level.value || p.level === level.value)
  .filter(p => !whyOnly.value || p.hasEtymology)
  .filter(matches))

/** How many of the shown points carry a sourced note, for the blurb. */
const withWhy = computed(() => visible.value.filter(p => p.hasEtymology).length)

onMounted(async () => {
  // Cached value renders now; the stored one replaces it when it lands.
  void loadLevel()
  void loadKnownKanji(lang.code)
  void loadSettings()
  try {
    points.value = (await listGrammar()).points
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-3xl px-6 py-12">
      <h1 class="text-3xl font-semibold">
        Grammar
      </h1>
      <p class="mt-2 text-[var(--color-muted)]">
        Where the history genuinely explains the modern form, there's a sourced note attached.
      </p>

      <div v-if="!loading" class="mt-6 flex flex-wrap items-center gap-3">
        <div class="relative">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            v-model="query"
            type="search"
            placeholder="Search patterns"
            class="w-56 rounded-lg border border-[var(--color-border)] bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[var(--color-text)]"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
          >
        </div>
        <Dropdown
          v-model="level"
          :options="levelOptions"
          :icon="levelIcon"
          header="Level"
          placeholder="All levels"
          width-class="w-44"
        />
        <Dropdown
          v-model="whyOnly"
          :options="whyOptions"
          :icon="whyIcon"
          header="Why notes"
          placeholder="All patterns"
          width-class="w-52"
        />
        <span class="text-sm text-[var(--color-muted)]">
          {{ visible.length }} {{ visible.length === 1 ? 'pattern' : 'patterns' }}
          <template v-if="withWhy > 0">
            &middot;
            <Tooltip content="A sourced note on where the pattern came from. Only where a source actually supports one — the rest are described, not explained." position="bottom">
              <span class="underline decoration-dotted underline-offset-4">{{ withWhy }} with a why note</span>
            </Tooltip>
          </template>
        </span>
      </div>

      <p v-if="loading" class="mt-8 text-[var(--color-muted)]">
        Loading…
      </p>

      <p v-else-if="visible.length === 0" class="mt-10 text-center text-[var(--color-muted)]">
        Nothing matches &ldquo;{{ query }}&rdquo;<template v-if="level">
          at {{ level }}
        </template>.
      </p>

      <ul v-else class="mt-6 divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
        <li v-for="p in visible" :key="p.slug">
          <router-link :to="ROUTES.GRAMMAR_DETAIL(p.slug)" class="flex flex-wrap items-baseline gap-3 p-4 transition hover:bg-[var(--color-card)]">
            <span class="text-lg" style="font-family: var(--font-jp)">
              <FuriganaText :text="p.title" :segments="p.titleFurigana" :mode="mode" :known-kanji="knownKanji" />
            </span>
            <span class="text-sm text-[var(--color-muted)]">{{ p.meaningShort }}</span>
            <span class="ml-auto flex items-center gap-3">
              <!-- The badge said "why" and explained nothing. It marks the
                   points that carry a SOURCED historical note; the rest are
                   described but not explained, because no source was found
                   that would support one. -->
              <Tooltip content="This pattern has a sourced note on where it came from. Open it to read." position="left">
                <span v-if="p.hasEtymology" class="text-xs uppercase tracking-wide text-[var(--color-accent)]">
                  why
                </span>
              </Tooltip>
              <!-- Shown only when every level is listed; inside one level it
                   would repeat the same badge down the whole page. -->
              <span v-if="!level && p.level" class="text-xs text-[var(--color-muted)]">
                {{ p.level }}
              </span>
            </span>
          </router-link>
        </li>
      </ul>
    </div>
  </AppShell>
</template>
