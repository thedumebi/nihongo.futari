<script setup lang="ts">
import type { AttributionSource } from '@nihongo/shared/types'

import { onMounted, ref } from 'vue'

import { listAttribution } from '@/api/attribution'
import AppShell from '@/components/layout/app-shell.vue'

/**
 * Data sources and licences.
 *
 * A licence term, not a courtesy: JMdict, KANJIDIC2, KanjiVG and Wiktionary are
 * CC BY-SA and Tatoeba is CC BY, all of which require attribution wherever the
 * data is used. Built from the same `import_sources` rows the pipeline reads,
 * so it cannot quietly drift from what actually shipped.
 */

const sources = ref<AttributionSource[]>([])
const loading = ref(true)
const errorMsg = ref('')

onMounted(async () => {
  try {
    sources.value = (await listAttribution()).sources
  } catch {
    errorMsg.value = 'Could not load the source list.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-4 py-10">
      <h1 class="text-2xl font-semibold text-[var(--color-heading)]">
        Data sources &amp; licences
      </h1>
      <p class="mt-2 text-[var(--color-muted)]">
        This app is built on open datasets maintained by other people. Several are
        licensed CC BY-SA or CC BY, which require attribution wherever the data is
        used &mdash; so this page is part of the licence, not a footnote.
      </p>

      <p v-if="loading" class="py-12 text-center text-[var(--color-muted)]">
        Loading&hellip;
      </p>
      <p v-else-if="errorMsg" class="py-12 text-center text-[var(--color-danger)]">
        {{ errorMsg }}
      </p>

      <ul v-else class="mt-8 space-y-6">
        <li
          v-for="source in sources"
          :key="source.code"
          class="border-t border-[var(--color-border)] pt-5"
        >
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h2 class="font-medium text-[var(--color-heading)]">
              <a
                v-if="source.homepage"
                :href="source.homepage"
                target="_blank"
                rel="noopener noreferrer"
                class="underline underline-offset-4"
              >{{ source.name }}</a>
              <span v-else>{{ source.name }}</span>
            </h2>
            <span class="text-sm text-[var(--color-muted)]">{{ source.license }}</span>
          </div>
          <p class="mt-1.5 text-sm text-[var(--color-muted)]">
            {{ source.attributionText }}
          </p>
        </li>
      </ul>

      <p class="mt-10 border-t border-[var(--color-border)] pt-5 text-sm text-[var(--color-muted)]">
        Content derived from CC BY-SA sources is itself shared under the same terms.
        Where an explanation cites a source, the citation and the supporting quote
        are shown with it.
      </p>
    </div>
  </AppShell>
</template>
