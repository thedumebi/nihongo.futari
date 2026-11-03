<script setup lang="ts">
import { CloudOff, TriangleAlert } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import type { SyncState } from '@/offline/sync'

import Tooltip from '@/components/ui/tooltip.vue'
import { onSyncChange } from '@/offline/sync'

/**
 * Says something only when there is something to know: you are offline (what
 * you do is kept on this device and sent when you are back), or answers could
 * not be saved even after retrying.
 *
 * A normal sync says nothing. Every answer passes through the queue, and a
 * "waiting to sync" label flashed up after each card; on a phone it made the
 * header wider than the screen, so iOS shrank the page until it went away. It
 * gave the learner nothing to act on, so it is gone.
 */

const state = ref<SyncState | null>(null)
let stop: (() => void) | undefined

/** What the pill means, on tap or hover: the pill itself is only an icon on a phone. */
const explanation = computed(() => state.value && state.value.dead > 0
  ? 'Some answers were refused by the server and could not be saved.'
  : 'You are offline. Everything you do is kept on this device and sent when you are back.')

onMounted(() => {
  stop = onSyncChange((next) => {
    state.value = next
  })
})

onBeforeUnmount(() => stop?.())
</script>

<template>
  <Tooltip
    v-if="state && (!state.online || state.dead > 0)"
    :content="explanation"
    position="bottom"
  >
    <span
      tabindex="0"
      :aria-label="explanation"
      class="inline-flex cursor-help items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs"
      :class="state.dead > 0 ? 'border-[var(--color-danger)] text-[var(--color-danger)]' : 'border-[var(--color-border)] text-[var(--color-muted)]'"
    >
      <template v-if="state.dead > 0">
        <TriangleAlert class="h-3.5 w-3.5" /> {{ state.dead }}<span class="hidden sm:inline"> couldn't sync</span>
      </template>
      <template v-else>
        <CloudOff class="h-3.5 w-3.5" /><span class="hidden sm:inline"> Offline</span>
      </template>
    </span>
  </Tooltip>
</template>
