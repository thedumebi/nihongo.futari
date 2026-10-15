<script setup lang="ts">
import type { PhoneticSeriesView } from '@nihongo/shared/types'

import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getSeries } from '@/api/phonetics'
import AppShell from '@/components/layout/app-shell.vue'
import SeriesCard from '@/components/study/series-card.vue'
import { useFurigana } from '@/composables/use-furigana'
import { ROUTES } from '@/constants'

const route = useRoute()
const series = ref<PhoneticSeriesView | null>(null)
const loading = ref(true)
const notFound = ref(false)

const { mode, loadSettings } = useFurigana()

async function load() {
  loading.value = true
  notFound.value = false
  try {
    series.value = await getSeries(String(route.params.component))
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadSettings()
  void load()
})
watch(() => route.params.component, load)
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-6 py-12">
      <router-link :to="ROUTES.SOUND_SERIES" class="text-sm text-[var(--color-muted)] underline underline-offset-4">
        ← All sound series
      </router-link>

      <p v-if="loading" class="mt-8 text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="notFound" class="mt-8 text-[var(--color-muted)]">
        No sound series for that component.
      </p>

      <div v-else-if="series" class="mt-6">
        <!-- Taught the way the review card teaches it, every kanji included. -->
        <SeriesCard :series="series" mode="teach" :script="mode" all />
      </div>
    </div>
  </AppShell>
</template>
