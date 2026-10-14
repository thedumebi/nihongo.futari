<script setup lang="ts">
import { CloudOff, RefreshCw, TriangleAlert } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref } from 'vue'

import type { SyncState } from '@/offline/sync'

import { onSyncChange } from '@/offline/sync'

/**
 * What is saved on this device and not yet on the server, said everywhere.
 *
 * It used to be shown on the Study page only, so a lesson or Speak session
 * finished on a train gave no sign it was waiting. Silent when there is
 * nothing to say — which is nearly always.
 */
const state = ref<SyncState | null>(null)
let stop: (() => void) | undefined

onMounted(() => {
  stop = onSyncChange((next) => {
    state.value = next
  })
})

onBeforeUnmount(() => stop?.())
</script>

<template>
  <span
    v-if="state && (!state.online || state.pending > 0 || state.dead > 0)"
    class="inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs"
    :class="state.dead > 0 ? 'border-[var(--color-danger)] text-[var(--color-danger)]' : 'border-[var(--color-border)] text-[var(--color-muted)]'"
    :title="state.dead > 0
      ? 'Some answers were refused by the server and could not be saved.'
      : !state.online
        ? 'You are offline. Everything you do is kept on this device and sent when you are back.'
        : 'Saved on this device, being sent now.'"
  >
    <template v-if="state.dead > 0">
      <TriangleAlert class="h-3.5 w-3.5" /> {{ state.dead }} couldn't sync
    </template>
    <template v-else-if="!state.online">
      <CloudOff class="h-3.5 w-3.5" /> Offline<template v-if="state.pending > 0"> · {{ state.pending }} waiting</template>
    </template>
    <template v-else>
      <RefreshCw class="h-3.5 w-3.5" :class="state.syncing ? 'animate-spin' : ''" /> {{ state.pending }} waiting to sync
    </template>
  </span>
</template>
