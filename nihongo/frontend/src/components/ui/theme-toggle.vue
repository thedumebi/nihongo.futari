<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'
import { computed } from 'vue'

import { useUiStore } from '@/store/ui'

/**
 * Light or dark. A switch with a sun at one end and a moon at the other; the
 * knob covers the mode in use and carries its icon, so both states are in
 * view and it plainly reads as a switch rather than a one-off button.
 */

// ============ Stores ============
const ui = useUiStore()

// ============ Computed Properties ============
const dark = computed(() => ui.theme === 'dark')
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="dark"
    aria-label="Dark mode"
    :title="dark ? 'Dark mode is on' : 'Dark mode is off'"
    class="relative flex h-8 w-16 shrink-0 items-center justify-between rounded-full border border-[var(--color-border)] bg-[var(--color-washi)] px-2 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
    @click="ui.toggleTheme"
  >
    <Sun class="h-4 w-4" aria-hidden="true" />
    <Moon class="h-4 w-4" aria-hidden="true" />
    <span
      class="absolute left-[3px] top-[3px] grid h-6 w-6 place-items-center rounded-full bg-[var(--color-accent)] text-[var(--color-bg)] transition-transform duration-200 motion-reduce:transition-none"
      :class="dark ? 'translate-x-8' : 'translate-x-0'"
      aria-hidden="true"
    >
      <component :is="dark ? Moon : Sun" class="h-3.5 w-3.5" />
    </span>
  </button>
</template>
