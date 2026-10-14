<script setup lang="ts">
import type { ReadingListResponse } from '@nihongo/shared/types'

import { Check, ChevronRight } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'

import { listReadings } from '@/api/readings'
import CoverageBadge from '@/components/ja/coverage-badge.vue'
import AppShell from '@/components/layout/app-shell.vue'
import LevelTabs from '@/components/ui/level-tabs.vue'
import { useLevel } from '@/composables/use-level'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * Speeches to read aloud, one level at a time.
 *
 * Each speech is written for exactly one level, so the level is the first
 * choice and the list under it is everything at that level. It opens on the
 * level the reader is studying.
 */

// ============ Stores ============
const lang = useLanguageStore()

// ============ Composables ============
const { level: studyLevel, loadLevel } = useLevel()

// ============ Reactive State ============
const readings = ref<ReadingListResponse['readings']>([])
const loading = ref(true)
const errorMsg = ref('')
/** The tab the reader picked here; empty until they pick one. */
const picked = ref('')

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

// ============ Computed Properties ============
const counts = computed(() => {
  const out = new Map<string, number>()
  for (const r of readings.value)
    out.set(r.level, (out.get(r.level) ?? 0) + 1)
  return out
})

/** Picked, else the study level, else the easiest level that has anything. */
const active = computed(() => {
  if (picked.value)
    return picked.value
  if (studyLevel.value && counts.value.has(studyLevel.value))
    return studyLevel.value
  return LEVELS.find(l => counts.value.has(l)) ?? 'N5'
})

const shown = computed(() => readings.value.filter(r => r.level === active.value))

// ============ Watchers ============
watch(() => lang.code, load)

// ============ Lifecycle Hooks ============
onMounted(() => {
  void loadLevel()
  void load()
})

// ============ Methods ============
async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    readings.value = (await listReadings(lang.code)).readings
  } catch {
    errorMsg.value = 'Could not load the speeches. Try again in a moment.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 class="text-3xl font-semibold">
        Read aloud
      </h1>
      <p class="mt-2 text-[var(--color-muted)]">
        Short speeches that scroll up the screen at your pace. Read them out loud &mdash; nobody is
        listening but you. Tap any word for its meaning.
      </p>

      <LevelTabs class="mt-8" :model-value="active" :levels="LEVELS" :counts="counts" @update:model-value="picked = $event" />

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="errorMsg" class="mt-10 text-center text-sm text-[var(--color-danger)]">
        {{ errorMsg }}
      </p>
      <p v-else-if="shown.length === 0" class="mt-10 text-center text-[var(--color-muted)]">
        No {{ active }} speeches yet.
      </p>

      <ul v-else class="mt-6 divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
        <li v-for="r in shown" :key="r.code">
          <router-link
            :to="ROUTES.READING_DETAIL(r.code)"
            class="flex items-center gap-4 p-4 transition hover:bg-[var(--color-card)]"
          >
            <div class="min-w-0 flex-1">
              <p class="text-lg" style="font-family: var(--font-jp)">
                {{ r.title }}
              </p>
              <p class="text-sm text-[var(--color-muted)]">
                {{ r.titleEn }} &middot; {{ r.lineCount }} lines
              </p>
            </div>
            <CoverageBadge :coverage="r.coverage" />
            <Check v-if="r.read" class="h-4 w-4 shrink-0 text-[var(--color-success)]" aria-label="Read" />
            <ChevronRight class="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
          </router-link>
        </li>
      </ul>
    </div>
  </AppShell>
</template>
