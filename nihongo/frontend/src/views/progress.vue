<script setup lang="ts">
import type { Readiness } from '@nihongo/shared/types'

import { computed, onMounted, ref, watch } from 'vue'

import type { ProgressSummary } from '@/api/progress'

import { getReadiness, getSummary } from '@/api/progress'
import AppShell from '@/components/layout/app-shell.vue'
import Dropdown from '@/components/ui/dropdown.vue'
import Tooltip from '@/components/ui/tooltip.vue'
import { useLevel } from '@/composables/use-level'
import { ROUTES } from '@/constants'

const summary = ref<ProgressSummary | null>(null)
const loading = ref(true)
const errorMsg = ref('')

const stats = computed(() => {
  const s = summary.value
  if (!s)
    return []
  return [
    {
      label: 'Day streak',
      value: s.currentStreak,
      tip: 'Consecutive days you reviewed something. The day rolls over at 4am local, not midnight, so a late-night session still counts for that day.',
      to: null
    },
    {
      label: 'Longest streak',
      value: s.longestStreak,
      tip: 'The best run you have had. Kept as a record even after a streak breaks.',
      to: null
    },
    {
      label: 'Items started',
      value: s.started,
      tip: 'Cards you have met at least once. Starting one is not the same as retaining it, which is why this sits beside the stricter count.',
      to: null
    },
    {
      label: 'Items learned',
      value: s.learned,
      tip: 'Cards that graduated past the short learning steps, so they are genuinely retained rather than seen once. This is the number the JLPT coverage below counts.',
      to: null
    },
    {
      label: 'Due now',
      value: s.due,
      tip: s.due > 0
        ? 'Review cards whose interval has elapsed — the same number Study shows. Click to see exactly which ones.'
        : 'Nothing is due for review right now. New cards are still available whenever you want them.',
      to: ROUTES.DUE
    },
    {
      // Shown apart from "Due now" because it is a different kind of waiting.
      // Merged into one number, this page said "57 due" where Study said "11
      // due · 46 learning" — the same cards, counted once and split once, both
      // called due.
      label: 'In learning',
      value: s.learning,
      tip: 'Cards you have met but which have not graduated yet. They come back within minutes rather than days, so this number moves fast and is not a backlog.',
      to: null
    },
    {
      label: 'Not yet seen',
      value: s.newAvailable,
      tip: 'Cards in the curriculum you have never met. Click to learn new ones only. Introduced a few a day rather than all at once, so reviews stay manageable.',
      to: `${ROUTES.STUDY}?mode=new`
    },
    {
      label: 'XP',
      value: s.totalXp,
      tip: 'Points from reviews. Recomputed from your review history, so it stays correct even when an offline session syncs late.',
      to: null
    }
  ]
})

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']
// Shared, but this page reports on exactly ONE level, so an empty shared
// value (meaning "all") falls back to N5 rather than sending no filter.
const { level: sharedLevel, loadLevel } = useLevel()
const level = computed({
  get: () => sharedLevel.value || 'N5',
  set: (v: string) => { sharedLevel.value = v }
})
const readiness = ref<Readiness | null>(null)

async function loadReadiness() {
  try {
    readiness.value = await getReadiness(level.value)
  } catch {
    readiness.value = null
  }
}

watch(level, loadReadiness)

onMounted(async () => {
  // Cached value renders now; the stored one replaces it when it lands.
  void loadLevel()
  void loadReadiness()
  try {
    summary.value = await getSummary()
  } catch {
    errorMsg.value = 'Could not load your progress.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-6 py-12">
      <h1 class="text-3xl font-semibold">
        Progress
      </h1>

      <p v-if="loading" class="mt-8 text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="errorMsg" class="mt-8 text-[var(--color-danger)]">
        {{ errorMsg }}
      </p>

      <dl v-else class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Tooltip v-for="stat in stats" :key="stat.label" :content="stat.tip" position="top">
          <component
            :is="stat.to ? 'router-link' : 'div'"
            :to="stat.to ?? undefined"
            class="block rounded-xl border border-[var(--color-border)] p-5 transition"
            :class="stat.to ? 'hover:border-[var(--color-text)]' : ''"
          >
            <dt class="flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
              {{ stat.label }}
              <span v-if="stat.to" aria-hidden="true">&rarr;</span>
            </dt>
            <dd class="mt-1 text-3xl font-semibold tabular-nums">
              {{ stat.value }}
            </dd>
          </component>
        </Tooltip>
      </dl>

      <section class="mt-10">
        <div class="flex items-baseline justify-between gap-4">
          <h2 class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            JLPT coverage
          </h2>
          <Dropdown
            v-model="level"
            :options="LEVELS.map(l => ({ value: l, label: l }))"
            header="Level"
            width-class="w-28"
          />
        </div>

        <template v-if="readiness">
          <p class="mt-3 text-4xl font-semibold text-[var(--color-heading)]">
            {{ readiness.percent }}<span class="text-xl text-[var(--color-muted)]">%</span>
          </p>
          <!-- Said plainly: a share of this app's content is not a share of the
                 exam, and dressing it up as a score prediction would be a lie. -->
          <p class="mt-1 text-xs text-[var(--color-muted)]">
            {{ readiness.curriculumNote }}
          </p>

          <ul class="mt-4 space-y-2">
            <li v-for="c in readiness.coverage" :key="c.kind" class="text-sm">
              <div class="flex items-baseline justify-between">
                <span class="capitalize">{{ c.kind }}</span>
                <span class="text-[var(--color-muted)]">{{ c.known }} / {{ c.total }}</span>
              </div>
              <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--color-washi)]">
                <div
                  class="h-full rounded-full bg-[var(--color-accent)]"
                  :style="{ width: `${c.total === 0 ? 0 : (c.known / c.total) * 100}%` }"
                />
              </div>
            </li>
          </ul>

          <p v-if="readiness.weakest" class="mt-4 text-sm text-[var(--color-muted)]">
            Weakest area: <span class="text-[var(--color-text)]">{{ readiness.weakest }}</span>
          </p>
        </template>
        <p v-else class="mt-3 text-sm text-[var(--color-muted)]">
          No coverage data for {{ level }} yet.
        </p>
      </section>
    </div>
  </AppShell>
</template>
