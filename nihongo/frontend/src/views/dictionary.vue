<script setup lang="ts">
import type { SearchHit, WordStatuses } from '@nihongo/shared/types'

import { useDebounceFn } from '@vueuse/core'
import { Check, Plus } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { search } from '@/api/dictionary'
import { getWordStatuses, saveWord } from '@/api/study'
import AppShell from '@/components/layout/app-shell.vue'
import { useToast } from '@/composables/use-toast'
import { ROUTES } from '@/constants'
import { isNetworkError, queueAction } from '@/offline/queue'

/**
 * One search box across words, kanji and grammar.
 *
 * Deliberately not three tabs: that would make the reader decide what KIND of
 * thing they half-remember before they can look it up, which is exactly the
 * thing they cannot do.
 */

const route = useRoute()
const router = useRouter()
const toast = useToast()

const query = ref(String(route.query.q ?? ''))
const hits = ref<SearchHit[]>([])
const statuses = ref<WordStatuses['statuses']>({})
/** The word being added, so its button can wait. */
const adding = ref('')
const loading = ref(false)
const searched = ref(false)

/** Words looked up before, newest first — what the page shows before you type. */
const recent = ref<Array<{ id: string, form: string, reading: string, meaning: string }>>([])
try {
  recent.value = JSON.parse(localStorage.getItem('go-recent-lookups') ?? '[]')
} catch {
  recent.value = []
}

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
    void loadStatuses()
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

/** Which result words can be reviewed, and which already are — one request for the page. */
async function loadStatuses() {
  const ids = hits.value.filter(h => h.kind === 'word').map(h => h.key)
  if (ids.length === 0)
    return
  try {
    statuses.value = (await getWordStatuses(ids)).statuses
  } catch {
    // Offline or signed out: the results still work, without the add buttons.
  }
}

/** Add a word straight from the results, without opening its page. */
async function add(hit: SearchHit) {
  adding.value = hit.key
  try {
    await saveWord(hit.key)
    statuses.value = { ...statuses.value, [hit.key]: { reviewable: true, inReview: true } }
    toast.success(`${hit.headword} added to your reviews`)
  } catch (e) {
    if (isNetworkError(e)) {
      await queueAction({ type: 'saveWord', wordId: hit.key })
      toast.success(`${hit.headword} will be added to your reviews when you are back online`)
      return
    }
    toast.error('Could not add that word. Try again')
  } finally {
    adding.value = ''
  }
}

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

      <section v-else-if="!query.trim() && recent.length" class="mt-6">
        <p class="text-sm text-[var(--color-muted)]">
          Looked up recently
        </p>
        <ul class="mt-2 divide-y divide-[var(--color-border)]">
          <li v-for="r in recent" :key="r.id">
            <router-link :to="ROUTES.WORD_DETAIL(r.id)" class="flex items-baseline gap-3 py-3">
              <span class="text-2xl" style="font-family: var(--font-jp)">{{ r.form }}</span>
              <span class="text-sm text-[var(--color-muted)]" style="font-family: var(--font-jp)">{{ r.reading }}</span>
              <span class="flex-1 truncate text-sm">{{ r.meaning }}</span>
            </router-link>
          </li>
        </ul>
      </section>

      <ul v-else class="mt-4 divide-y divide-[var(--color-border)]">
        <li v-for="hit in hits" :key="`${hit.kind}-${hit.key}`" class="flex items-center gap-2">
          <router-link
            :to="linkFor(hit)"
            class="flex min-w-0 flex-1 items-baseline gap-3 py-3"
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
          <!-- Straight into reviews from the search, for a word that can be reviewed. -->
          <span v-if="hit.kind === 'word' && statuses[hit.key]?.inReview" class="flex shrink-0 items-center gap-1 text-xs text-[var(--color-muted)]" title="In your reviews">
            <Check class="h-4 w-4" /><span class="hidden sm:inline">In reviews</span>
          </span>
          <button
            v-else-if="hit.kind === 'word' && statuses[hit.key]?.reviewable"
            type="button"
            class="flex shrink-0 items-center gap-1 rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs transition hover:border-[var(--color-text)] disabled:opacity-50"
            :disabled="adding === hit.key"
            :aria-label="`Add ${hit.headword} to your reviews`"
            @click="add(hit)"
          >
            <Plus class="h-4 w-4" /> Add
          </button>
        </li>
      </ul>
    </div>
  </AppShell>
</template>
