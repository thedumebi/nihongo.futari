<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { VueFinalModal } from 'vue-final-modal'

/**
 * A sheet that rises over the bottom half of the screen and scrolls on its
 * own, so the page it covers keeps its place. Escape, a tap on the dimmed page
 * or the close button puts it away.
 *
 * A thin dress over vue-final-modal, which already traps focus, locks the page
 * scroll and returns focus on close, as the confirm dialog relies on.
 */

interface Props {
  open: boolean
  /** Read by screen readers as the sheet's name. */
  label: string
}

defineProps<Props>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <VueFinalModal
    :model-value="open"
    class="flex items-end justify-center"
    content-class="flex h-[50dvh] w-full max-w-xl flex-col rounded-t-2xl border border-b-0 border-[var(--color-border)] bg-[var(--color-card)] shadow-xl"
    overlay-class="bg-black/40"
    content-transition="sheet-rise"
    :click-to-close="true"
    :esc-to-close="true"
    :aria-label="label"
    @update:model-value="emit('close')"
  >
    <div class="flex shrink-0 items-center gap-3 px-4 pt-2">
      <span class="mx-auto block h-1 w-10 rounded-full bg-[var(--color-border)]" aria-hidden="true" />
    </div>
    <div class="flex shrink-0 items-center gap-3 px-4 pb-2">
      <div class="min-w-0 flex-1">
        <slot name="header" />
      </div>
      <button
        type="button"
        class="shrink-0 rounded-full p-1 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
        aria-label="Close"
        @click="emit('close')"
      >
        <X class="h-5 w-5" />
      </button>
    </div>
    <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <slot />
    </div>
  </VueFinalModal>
</template>

<style>
.sheet-rise-enter-active,
.sheet-rise-leave-active {
  transition: transform 200ms ease-out;
}

.sheet-rise-enter-from,
.sheet-rise-leave-to {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  .sheet-rise-enter-active,
  .sheet-rise-leave-active {
    transition: none;
  }
}
</style>
