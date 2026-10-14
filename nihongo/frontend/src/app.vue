<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ConfirmDialog from '@/components/ui/confirm-dialog.vue'
import ToastNotification from '@/components/ui/toast-notification.vue'
import { setupServiceWorker } from '@/offline/register-sw'
import { startSync } from '@/offline/sync'
import { useUiStore } from '@/store/ui'

const ui = useUiStore()
const route = useRoute()
const router = useRouter()

/**
 * Pages where something is in progress — a card half answered, a session
 * mid-way, a puzzle half filled. A new version waits until you leave them.
 * Everywhere else it is applied at once.
 */
const BUSY_ROUTES = new Set([
  'study',
  'lesson-detail',
  'speak-session',
  'conversation-detail',
  'reading-detail',
  'crossword',
  'recall',
  'listening-game',
  'kanji-build',
  'ghost-boss',
  'writing'
])

let applyUpdate: ((reload?: boolean) => Promise<void>) | undefined
let updateReady = false
/** A new version is waiting on a busy page: say so, and offer to reload now. */
const showUpdateBar = ref(false)

/**
 * A new version is applied by itself, at the first moment it costs nothing:
 * straight away on a calm page, otherwise on the next move to another page or
 * when the app goes to the background. Meanwhile, on a busy page, a bar says
 * it is ready, so it can be had at once with a tap rather than waited for.
 */
function applyIfCalm(justNavigated = false): void {
  if (!updateReady || !applyUpdate)
    return
  // A page just arrived at has nothing in progress yet, whatever page it is.
  const busy = !justNavigated && BUSY_ROUTES.has(String(route.name ?? ''))
  if (!busy || document.visibilityState === 'hidden')
    void applyUpdate(true)
  else
    showUpdateBar.value = true
}

function reloadNow() {
  void applyUpdate?.(true)
}

onMounted(() => {
  document.documentElement.dataset.theme = ui.theme
  // Anything queued offline — answers, lessons, Speak runs — goes up from any page.
  startSync()
  applyUpdate = setupServiceWorker(() => {
    updateReady = true
    applyIfCalm()
  })
  // Moving to another page is a natural break: nothing on the old page is lost.
  router.afterEach(() => applyIfCalm(true))
  document.addEventListener('visibilitychange', () => applyIfCalm())
  // A tapped notification, when the app is already open: the service worker
  // asks the router to go where the notification points. Only app paths.
  navigator.serviceWorker?.addEventListener('message', (event: MessageEvent<{ type?: string, url?: string }>) => {
    const url = event.data?.url
    if (event.data?.type === 'NAVIGATE' && typeof url === 'string' && url.startsWith('/'))
      void router.push(url)
  })
})
</script>

<template>
  <!-- Keyed on the path: going from one lesson, session or speech straight to
       the next is the same route with a new id, and a page that loads on mount
       would otherwise keep showing the old one. Query changes (?mode=) do not
       remount — the pages that use them follow the query themselves. -->
  <router-view :key="$route.path" />

  <div
    v-if="showUpdateBar"
    class="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-center gap-3 border-t border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-sm"
  >
    <span>A new version is ready. It loads by itself when you leave this page.</span>
    <button type="button" class="font-medium underline underline-offset-4" @click="reloadNow">
      Reload now
    </button>
    <button type="button" class="text-[var(--color-muted)] underline underline-offset-4" @click="showUpdateBar = false">
      Later
    </button>
  </div>

  <ConfirmDialog />
  <ToastNotification />
</template>
