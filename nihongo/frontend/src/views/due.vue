<script setup lang="ts">
import type { DueItem } from '@nihongo/shared/types'

import { computed, onMounted, ref, watch } from 'vue'

import { getDue } from '@/api/due'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * What is due, listed.
 *
 * The progress page could say "3 due" and the only way to find out what those
 * three WERE was to start a session and be handed them one at a time. A count
 * you cannot open is not information. This page names them.
 */
const lang = useLanguageStore()

const items = ref<DueItem[]>([])
const byKind = ref<Array<{ kind: string, count: number }>>([])
const total = ref(0)
const serverTime = ref('')
const kind = ref('')
const offset = ref(0)
const loading = ref(true)
const errorMsg = ref('')

const PAGE = 50

const KIND_LABELS: Record<string, string> = {
  'kana': 'Kana',
  'kanji': 'Kanji',
  'word': 'Vocabulary',
  'grammar': 'Grammar',
  'sentence': 'Sentences',
  'phonetic-series': 'Sound series'
}

const FACET_LABELS: Record<string, string> = {
  meaning: 'meaning',
  production: 'production',
  reading: 'reading',
  listening: 'listening',
  writing: 'writing',
  usage: 'usage',
  pitch: 'pitch'
}

const hasMore = computed(() => offset.value + items.value.length < total.value)

/**
 * How overdue a card is, in words.
 *
 * Relative to the SERVER's clock, not the device's: a phone with a skewed clock
 * would otherwise report everything as due days ago or not yet due at all.
 */
function overdue(due: string): string {
  const base = serverTime.value ? new Date(serverTime.value).getTime() : Date.now()
  const mins = Math.round((base - new Date(due).getTime()) / 60000)
  if (mins < 1)
    return 'just now'
  if (mins < 60)
    return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  const days = Math.round(hours / 24)
  return `${days} ${days === 1 ? 'day' : 'days'} ago`
}

async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await getDue({
      languageCode: lang.code,
      limit: PAGE,
      offset: offset.value,
      ...(kind.value ? { kind: kind.value } : {})
    })
    items.value = data.items
    byKind.value = data.byKind
    total.value = data.total
    serverTime.value = data.serverTime
  } catch {
    errorMsg.value = "Couldn't load what's due."
    items.value = []
  } finally {
    loading.value = false
  }
}

function selectKind(next: string) {
  kind.value = kind.value === next ? '' : next
  offset.value = 0
  void load()
}

function page(delta: number) {
  offset.value = Math.max(0, offset.value + delta * PAGE)
  void load()
}

watch(() => lang.code, () => {
  offset.value = 0
  void load()
})

onMounted(load)
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-3xl px-6 py-12">
      <div class="flex flex-wrap items-baseline gap-3">
        <h1 class="text-3xl font-semibold">
          Due now
        </h1>
        <span class="text-[var(--color-muted)]">{{ total }} {{ total === 1 ? 'card' : 'cards' }}</span>
        <router-link v-if="total > 0" :to="`${ROUTES.STUDY}?mode=due`" class="ml-auto">
          <Button variant="primary">
            Review these
          </Button>
        </router-link>
      </div>

      <p class="mt-2 text-sm text-[var(--color-muted)]">
        Everything the scheduler wants back, oldest first &mdash; the ones waiting longest are
        closest to being forgotten.
      </p>

      <div v-if="byKind.length > 1" class="mt-6 flex flex-wrap gap-2">
        <button
          v-for="k in byKind"
          :key="k.kind"
          type="button"
          class="rounded-full border px-3 py-1.5 text-sm transition"
          :class="kind === k.kind
            ? 'border-[var(--color-text)] text-[var(--color-text)]'
            : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-text)]'"
          @click="selectKind(k.kind)"
        >
          {{ KIND_LABELS[k.kind] ?? k.kind }}
          <span class="text-[var(--color-muted)]">{{ k.count }}</span>
        </button>
      </div>

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="errorMsg" class="mt-10 text-center text-sm text-[var(--color-danger)]">
        {{ errorMsg }}
      </p>

      <div v-else-if="items.length === 0" class="mt-10 rounded-xl border border-[var(--color-border)] p-10 text-center">
        <p class="text-xl font-semibold">
          Nothing is due.
        </p>
        <p class="mt-3 text-sm text-[var(--color-muted)]">
          Everything you've learned is still resting. New cards are available whenever you want them.
        </p>
        <router-link :to="`${ROUTES.STUDY}?mode=new`" class="mt-6 inline-block">
          <Button variant="ghost">
            Learn something new
          </Button>
        </router-link>
      </div>

      <ul v-else class="mt-6 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
        <li v-for="item in items" :key="item.cardId" class="flex items-center gap-4 py-3">
          <component
            :is="item.href ? 'router-link' : 'span'"
            :to="item.href ?? undefined"
            class="min-w-0 flex-1"
            :class="item.href ? 'group' : ''"
          >
            <span
              class="text-lg"
              :class="item.href ? 'group-hover:underline' : ''"
              style="font-family: var(--font-jp)"
            >{{ item.subject }}</span>
            <span v-if="item.detail" class="ml-2 truncate text-sm text-[var(--color-muted)]">{{ item.detail }}</span>
          </component>

          <span class="shrink-0 text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {{ KIND_LABELS[item.kind] ?? item.kind }} &middot; {{ FACET_LABELS[item.facet] ?? item.facet }}
          </span>

          <!-- A ghost is a card that has lapsed enough times to come back on a
               shortened schedule. Worth flagging: these are the ones costing
               you time. -->
          <span
            v-if="item.ghost"
            class="shrink-0 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-muted)]"
            :title="`Lapsed ${item.lapses} times`"
          >
            ghost
          </span>

          <span class="w-24 shrink-0 text-right text-xs text-[var(--color-muted)]">
            {{ overdue(item.due) }}
          </span>
        </li>
      </ul>

      <div v-if="!loading && (offset > 0 || hasMore)" class="mt-6 flex items-center justify-between">
        <Button variant="ghost" :disabled="offset === 0" @click="page(-1)">
          Previous
        </Button>
        <span class="text-sm text-[var(--color-muted)]">
          {{ offset + 1 }}–{{ offset + items.length }} of {{ total }}
        </span>
        <Button variant="ghost" :disabled="!hasMore" @click="page(1)">
          Next
        </Button>
      </div>
    </div>
  </AppShell>
</template>
