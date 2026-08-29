<script setup lang="ts">
import type { DialogueListResponse } from '@nihongo/shared/types'

import { looksLikeRomaji, romajiToHiragana } from '@nihongo/shared/lib'
import { Check, Search } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'

import { listDialogues } from '@/api/dialogues'
import AppShell from '@/components/layout/app-shell.vue'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * Conversations, grouped by where they happen.
 *
 * They are scheduled like everything else, but a conversation is not a
 * flashcard: waiting for the review queue to offer one is no way to find it,
 * and it is the part of the app a beginner is most likely to want on purpose.
 */
const lang = useLanguageStore()

const dialogues = ref<DialogueListResponse['dialogues']>([])
const loading = ref(true)
const errorMsg = ref('')

const query = ref('')

/**
 * What to match on, romaji folded to kana.
 *
 * Someone looking for the conversation with itterasshai in it will type it the
 * way they heard it, without a Japanese keyboard — so the romaji form is
 * converted and both are tried, the same courtesy the grammar page extends.
 */
const needles = computed(() => {
  const raw = query.value.trim().toLowerCase()
  if (!raw)
    return []
  const kana = looksLikeRomaji(raw) ? romajiToHiragana(raw) : ''
  return kana && kana !== raw ? [raw, kana] : [raw]
})

function matches(d: DialogueListResponse['dialogues'][number]): boolean {
  if (needles.value.length === 0)
    return true
  const haystack = [d.title, d.situation, d.unitTitle, d.keywords]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return needles.value.some(n => haystack.includes(n))
}

const found = computed(() => dialogues.value.filter(matches))

/** Grouped by scenario, in the order the API returned them. */
const groups = computed(() => {
  const out = new Map<string, { title: string, items: DialogueListResponse['dialogues'] }>()
  for (const d of found.value) {
    const key = d.unit ?? 'other'
    const group = out.get(key) ?? { title: d.unitTitle ?? 'Other', items: [] }
    group.items.push(d)
    out.set(key, group)
  }
  return [...out.values()]
})

async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    dialogues.value = (await listDialogues(lang.code)).dialogues
  } catch {
    errorMsg.value = 'Could not load the conversations.'
    dialogues.value = []
  } finally {
    loading.value = false
  }
}

watch(() => lang.code, load)
onMounted(load)
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-6 py-12">
      <h1 class="text-3xl font-semibold">
        Conversations
      </h1>
      <p class="mt-2 text-[var(--color-muted)]">
        Short exchanges you work through a turn at a time. Pick a reply and find out whether it
        works &mdash; and if not, why not.
      </p>

      <div v-if="!loading && !errorMsg" class="relative mt-6 max-w-sm">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          v-model="query"
          type="search"
          placeholder="Search conversations"
          class="w-full rounded-lg border border-[var(--color-border)] bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[var(--color-text)]"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
        >
      </div>

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="errorMsg" class="mt-10 text-center text-sm text-[var(--color-danger)]">
        {{ errorMsg }}
      </p>
      <p v-else-if="dialogues.length === 0" class="mt-10 text-center text-[var(--color-muted)]">
        No conversations yet.
      </p>
      <p v-else-if="found.length === 0" class="mt-10 text-center text-[var(--color-muted)]">
        Nothing matches &ldquo;{{ query }}&rdquo;.
      </p>

      <section v-for="group in groups" v-else :key="group.title" class="mt-8">
        <h2 class="text-sm uppercase tracking-wide text-[var(--color-muted)]">
          {{ group.title }}
        </h2>
        <ul class="mt-3 divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
          <li v-for="d in group.items" :key="d.code">
            <router-link
              :to="ROUTES.CONVERSATION_DETAIL(d.code)"
              class="flex items-center gap-4 p-4 transition hover:bg-[var(--color-card)]"
            >
              <!--
                This conversation's own drawing, contained rather than cropped:
                these have breathing room designed in, and filling the box would
                cut it off. `aria-hidden` because the row's title and situation
                already say what it is.
              -->
              <img
                v-if="d.image"
                :src="d.image"
                alt=""
                aria-hidden="true"
                class="aspect-[4/3] h-16 w-auto shrink-0 rounded-md border border-[var(--color-border)] object-contain"
                loading="lazy"
              >
              <span class="min-w-0 flex-1">
                <span class="block font-medium">{{ d.title }}</span>
                <span class="block text-sm text-[var(--color-muted)]">{{ d.situation }}</span>
              </span>
              <span class="shrink-0 text-xs text-[var(--color-muted)]">{{ d.turnCount }} turns</span>
              <Check v-if="d.learned" class="h-4 w-4 shrink-0 text-[var(--color-success)]" />
            </router-link>
          </li>
        </ul>
      </section>
    </div>
  </AppShell>
</template>
