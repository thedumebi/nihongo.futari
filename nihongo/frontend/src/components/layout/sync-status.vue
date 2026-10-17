<script setup lang="ts">
import { CloudOff, RefreshCw, TriangleAlert } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import type { SyncState } from '@/offline/sync'

import { onSyncChange } from '@/offline/sync'

/**
 * What is saved on this device and not yet on the server, said everywhere.
 *
 * It used to be shown on the Study page only, so a lesson or Speak session
 * finished on a train gave no sign it was waiting. Silent when there is
 * nothing to say — which is nearly always.
 *
 * Every answer passes through the queue, so "waiting to sync" flashed up for a
 * moment after each card. On a phone that made the header wider than the
 * screen, iOS shrank the whole page to fit, and the card looked small until
 * the sync finished and the page sprang back. So a normal sync shows nothing:
 * only answers still waiting after a few seconds are worth mentioning, and on
 * a phone it is an icon and a number, never wide enough to overflow.
 */

/** A sync that finishes within this is just the queue working; say nothing. */
const SLOW_MS = 3000

const state = ref<SyncState | null>(null)
/** Answers have been waiting long enough to mention. */
const slow = ref(false)
let slowTimer: ReturnType<typeof setTimeout> | undefined
let stop: (() => void) | undefined

const visible = computed(() => {
  const s = state.value
  return Boolean(s && (!s.online || s.dead > 0 || (s.pending > 0 && slow.value)))
})

onMounted(() => {
  stop = onSyncChange((next) => {
    state.value = next
    if (next.pending > 0 && next.online) {
      slowTimer ??= setTimeout(() => {
        slow.value = true
      }, SLOW_MS)
    } else {
      clearTimeout(slowTimer)
      slowTimer = undefined
      slow.value = false
    }
  })
})

onBeforeUnmount(() => {
  stop?.()
  clearTimeout(slowTimer)
})
</script>

<template>
  <span
    v-if="state && visible"
    class="inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs"
    :class="state.dead > 0 ? 'border-[var(--color-danger)] text-[var(--color-danger)]' : 'border-[var(--color-border)] text-[var(--color-muted)]'"
    :title="state.dead > 0
      ? 'Some answers were refused by the server and could not be saved.'
      : !state.online
        ? 'You are offline. Everything you do is kept on this device and sent when you are back.'
        : 'Saved on this device, being sent now.'"
  >
    <template v-if="state.dead > 0">
      <TriangleAlert class="h-3.5 w-3.5" /> {{ state.dead }}<span class="hidden sm:inline"> couldn't sync</span>
    </template>
    <template v-else-if="!state.online">
      <CloudOff class="h-3.5 w-3.5" /><span class="hidden sm:inline"> Offline</span><template v-if="state.pending > 0">
        <span class="hidden sm:inline"> ·</span> {{ state.pending }}<span class="hidden sm:inline"> waiting</span>
      </template>
    </template>
    <template v-else>
      <RefreshCw class="h-3.5 w-3.5" :class="state.syncing ? 'animate-spin' : ''" /> {{ state.pending }}<span class="hidden sm:inline"> waiting to sync</span>
    </template>
  </span>
</template>
