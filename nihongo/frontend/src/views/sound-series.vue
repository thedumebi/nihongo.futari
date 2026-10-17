<script setup lang="ts">
import type { PhoneticSeriesListResponse } from '@nihongo/shared/types'

import { onMounted, ref } from 'vue'

import { listSeries } from '@/api/phonetics'
import AppShell from '@/components/layout/app-shell.vue'
import SeriesExplainer from '@/components/study/series-explainer.vue'
import { ROUTES } from '@/constants'

const series = ref<PhoneticSeriesListResponse['series']>([])
const loading = ref(true)

/**
 * Where you stand with a series, in a line. A series is taught in New words,
 * not here, once you know two of its kanji; this says how close that is.
 */
function standing(s: PhoneticSeriesListResponse['series'][number]): string {
  switch (s.status) {
    case 'learned': return 'Learned'
    case 'learning': return 'Learning: it comes back in reviews'
    case 'ready': return 'Coming in New words'
    case 'locked': {
      const options = s.suggest.join(', ').replace(/, ([^,]*)$/, ' or $1')
      return s.need === 1 ? `Learn 1 more of its kanji: ${options}` : `Learn ${s.need} of its kanji first: ${options}`
    }
    case 'reference': return 'For reading only: not taught as a card'
    default: return ''
  }
}

onMounted(async () => {
  try {
    // 3+ members: below that a "rule" predicts too little to be worth learning.
    series.value = (await listSeries(3)).series
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-3xl px-6 py-12">
      <h1 class="text-3xl font-semibold">
        Sound series
      </h1>
      <p class="mt-2 max-w-xl text-[var(--color-muted)]">
        Most kanji are 形声文字: a meaning part plus a <em>sound</em> part. Learn that
        青 is セイ, and 晴・清・請・精・静 stop being five separate things to memorise.
      </p>
      <SeriesExplainer class="mt-4 max-w-xl" open />
      <p class="mt-4 max-w-xl text-sm text-[var(--color-muted)]">
        You don't study them here. A series comes to you in New words once you know two of its
        kanji, and counts on Progress once it has stuck. Each one below says how close it is.
      </p>

      <p v-if="loading" class="mt-8 text-[var(--color-muted)]">
        Loading…
      </p>

      <ul v-else class="mt-8 grid gap-3 sm:grid-cols-2">
        <li v-for="s in series" :key="s.component">
          <router-link
            :to="ROUTES.SOUND_SERIES_DETAIL(s.component)"
            class="flex items-center gap-4 rounded-xl border border-[var(--color-border)] p-4 transition hover:border-[var(--color-text)]"
          >
            <span class="text-4xl leading-none" style="font-family: var(--font-jp)">{{ s.component }}</span>
            <span class="min-w-0">
              <span class="block text-lg" style="font-family: var(--font-jp)">{{ s.primaryReading }}</span>
              <span class="block truncate text-sm text-[var(--color-muted)]">
                <template v-if="s.level">{{ s.level }} &middot; </template>{{ s.memberCount }} kanji &middot; {{ Math.round(s.reliability * 100) }}% follow
                <template v-if="s.componentMeaning"> &middot; {{ s.componentMeaning }}</template>
              </span>
              <span
                v-if="s.status"
                class="mt-0.5 block text-sm"
                :class="s.status === 'learned' || s.status === 'ready' ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]'"
              >{{ standing(s) }}</span>
            </span>
          </router-link>
        </li>
      </ul>
    </div>
  </AppShell>
</template>
