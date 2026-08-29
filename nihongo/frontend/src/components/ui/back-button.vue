<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import { ROUTES } from '@/constants'

// A back button that stays pinned just below the fixed header as the user
// scrolls (no divider line). Goes to the previous page, or home when this is the
// initial location (no history to pop).
const router = useRouter()

function goBack() {
  if (window.history.state?.back)
    router.back()
  else
    router.push(ROUTES.HOME)
}
</script>

<template>
  <div class="sticky top-16 z-40 max-w-6xl mx-auto w-full px-6 pt-6 pb-2 pointer-events-none">
    <button
      type="button"
      class="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-bg/80 px-3 py-1.5 font-sans text-sm text-ink backdrop-blur-sm hover:text-hover transition"
      title="Back"
      @click="goBack"
    >
      <ArrowLeft :size="16" /> back
    </button>
  </div>
</template>
