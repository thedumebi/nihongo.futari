<script setup lang="ts">
import type { PhoneticSeriesView } from '@nihongo/shared/types'

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getSeries } from '@/api/phonetics'
import AppShell from '@/components/layout/app-shell.vue'
import { ROUTES } from '@/constants'

const route = useRoute()
const series = ref<PhoneticSeriesView | null>(null)
const loading = ref(true)
const notFound = ref(false)

const followers = computed(() => series.value?.members.filter(m => m.followsSeries) ?? [])
const exceptions = computed(() => series.value?.members.filter(m => !m.followsSeries) ?? [])

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

onMounted(load)
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
        <div class="flex items-end gap-5">
          <span class="text-7xl leading-none" style="font-family: var(--font-jp)">{{ series.component }}</span>
          <div>
            <p class="text-3xl" style="font-family: var(--font-jp)">
              {{ series.primaryReading }}
            </p>
            <p class="text-sm text-[var(--color-muted)]">
              {{ series.memberCount }} kanji &middot; {{ Math.round(series.reliability * 100) }}% take this reading
              <template v-if="series.componentMeaning">
                &middot; {{ series.componentMeaning }}
              </template>
            </p>
          </div>
        </div>

        <p class="mt-6 leading-relaxed">
          When <span style="font-family: var(--font-jp)">{{ series.component }}</span> appears as the sound part,
          the kanji is usually read <strong style="font-family: var(--font-jp)">{{ series.primaryReading }}</strong>.
          <template v-if="series.reliability < 1">
            Not always — the exceptions are below, because a rule without them is a half-truth.
          </template>
        </p>

        <section class="mt-8">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Follows the rule ({{ followers.length }})
          </h2>
          <ul class="mt-3 grid gap-2 sm:grid-cols-2">
            <li
              v-for="m in followers"
              :key="m.character"
              class="flex items-center gap-3 rounded-lg border border-[var(--color-border)] p-3"
            >
              <span class="text-3xl leading-none" style="font-family: var(--font-jp)">{{ m.character }}</span>
              <span class="min-w-0">
                <span class="block" style="font-family: var(--font-jp)">{{ m.reading }}</span>
                <span class="block truncate text-sm text-[var(--color-muted)]">{{ m.meaning }}</span>
              </span>
            </li>
          </ul>
        </section>

        <section v-if="exceptions.length > 0" class="mt-8">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Exceptions ({{ exceptions.length }})
          </h2>
          <ul class="mt-3 grid gap-2 sm:grid-cols-2">
            <li
              v-for="m in exceptions"
              :key="m.character"
              class="flex items-center gap-3 rounded-lg border border-dashed border-[var(--color-border)] p-3 opacity-80"
            >
              <span class="text-3xl leading-none" style="font-family: var(--font-jp)">{{ m.character }}</span>
              <span class="min-w-0">
                <span class="block" style="font-family: var(--font-jp)">{{ m.reading }}</span>
                <span class="block truncate text-sm text-[var(--color-muted)]">{{ m.meaning }}</span>
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </AppShell>
</template>
