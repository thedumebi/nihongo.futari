<script setup lang="ts">
import type { SearchHit } from '@nihongo/shared/types'

import { useDebounceFn } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { search } from '@/api/dictionary'
import AppShell from '@/components/layout/app-shell.vue'
import { ROUTES } from '@/constants'

/**
 * One search box across words, kanji and grammar.
 *
 * Deliberately not three tabs: that would make the reader decide what KIND of
 * thing they half-remember before they can look it up, which is exactly the
 * thing they cannot do.
 */

const route = useRoute()
const router = useRouter()

const query = ref(String(route.query.q ?? ''))
const hits = ref<SearchHit[]>([])
const loading = ref(false)
const searched = ref(false)

async function run() {
  const q = query.value.trim()
  // Keep the URL in step so a search can be shared or reloaded.
  void router.replace({ query: q ? { q } : {} })
  if (!q) {
    hits.value = []
    searched.value = false
    return
  }
  loading.value = true
  try {
    hits.value = (await search(q)).hits
  } catch {
    hits.value = []
  } finally {
    loading.value = false
    searched.value = true
  }
}

// Debounced: typing 山岳 fires four requests otherwise, and the first three
// are already stale by the time they land.
const debounced = useDebounceFn(run, 250)
watch(query, debounced)
onMounted(() => {
  if (query.value)
    void run()
})

function linkFor(hit: SearchHit): string {
  if (hit.kind === 'kanji')
    return ROUTES.KANJI_DETAIL(hit.headword)
  if (hit.kind === 'grammar')
    return ROUTES.GRAMMAR_DETAIL(hit.key)
  return ROUTES.WORD_DETAIL(hit.key)
}

const KIND_LABEL: Record<SearchHit['kind'], string> = {
  word: 'word',
  kanji: 'kanji',
  grammar: 'grammar'
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-4 py-8">
      <h1 class="text-2xl font-semibold text-[var(--color-heading)]">
        Dictionary
      </h1>
      <p class="mt-1 text-sm text-[var(--color-muted)]">
        Words, kanji and grammar. Japanese or English.
      </p>

      <input
        v-model="query"
        type="search"
        class="mt-5 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-4 py-3 text-lg outline-none focus:border-[var(--color-text)]"
        placeholder="山, やま, or mountain"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        style="font-family: var(--font-jp)"
      >

      <p v-if="loading" class="mt-6 text-sm text-[var(--color-muted)]">
        Searching&hellip;
      </p>
      <p v-else-if="searched && hits.length === 0" class="mt-6 text-sm text-[var(--color-muted)]">
        Nothing found for &ldquo;{{ query }}&rdquo;.
      </p>

      <ul v-else class="mt-4 divide-y divide-[var(--color-border)]">
        <li v-for="hit in hits" :key="`${hit.kind}-${hit.key}`">
          <router-link
            :to="linkFor(hit)"
            class="flex items-baseline gap-3 py-3"
          >
            <span class="min-w-0 text-2xl" style="font-family: var(--font-jp)">{{ hit.headword }}</span>
            <span v-if="hit.reading" class="text-sm text-[var(--color-muted)]" style="font-family: var(--font-jp)">
              {{ hit.reading }}
            </span>
            <span class="flex-1 truncate text-sm text-[var(--color-text)]">{{ hit.gloss }}</span>
            <span class="shrink-0 text-xs text-[var(--color-muted)]">
              {{ KIND_LABEL[hit.kind] }}<template v-if="hit.level"> &middot; {{ hit.level }}</template>
            </span>
          </router-link>
        </li>
      </ul>
    </div>
  </AppShell>
</template>
