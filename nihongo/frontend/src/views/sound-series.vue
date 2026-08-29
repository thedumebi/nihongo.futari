<script setup lang="ts">
import type { PhoneticSeriesListResponse } from '@nihongo/shared/types'

import { onMounted, ref } from 'vue'

import { listSeries } from '@/api/phonetics'
import AppShell from '@/components/layout/app-shell.vue'
import { ROUTES } from '@/constants'

const series = ref<PhoneticSeriesListResponse['series']>([])
const loading = ref(true)

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
        Most kanji are 形声文字 — a meaning part plus a <em>sound</em> part. Learn that
        青 is セイ, and 晴・清・請・精・静 stop being five separate things to memorise.
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
                {{ s.memberCount }} kanji &middot; {{ Math.round(s.reliability * 100) }}% follow
                <template v-if="s.componentMeaning"> &middot; {{ s.componentMeaning }}</template>
              </span>
            </span>
          </router-link>
        </li>
      </ul>
    </div>
  </AppShell>
</template>
