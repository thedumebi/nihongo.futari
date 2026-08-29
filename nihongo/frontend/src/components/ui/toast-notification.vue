<script setup lang="ts">
import { CheckCircle2, X, XCircle } from 'lucide-vue-next'
import { computed, watch } from 'vue'

import { useToast } from '@/composables/use-toast'

const { toast, hideToast } = useToast()

let timeoutId: ReturnType<typeof setTimeout> | null = null

function clearTimer() {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

watch(() => toast.value.show, (show) => {
  clearTimer()
  if (show) {
    timeoutId = setTimeout(hideToast, toast.value.duration)
  }
})

const accentClass = computed(() => {
  if (toast.value.type === 'success')
    return 'text-success'
  if (toast.value.type === 'warning')
    return 'text-hover'
  return 'text-danger'
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-to-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
  >
    <div
      v-if="toast.show"
      class="fixed top-4 right-4 z-100000 max-w-sm w-full rounded-xl border border-card bg-card text-text shadow-xl p-4 flex items-start gap-3"
    >
      <span class="shrink-0 mt-0.5" :class="accentClass">
        <CheckCircle2 v-if="toast.type === 'success'" :size="18" />
        <XCircle v-else :size="18" />
      </span>
      <p class="flex-1 text-sm font-medium leading-snug">
        {{ toast.message }}
      </p>
      <button
        type="button"
        class="shrink-0 text-muted hover:text-hover transition"
        title="Dismiss"
        @click="hideToast"
      >
        <X :size="16" />
      </button>
    </div>
  </Transition>
</template>
