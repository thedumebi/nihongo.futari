<script setup lang="ts">
import { onMounted, ref } from 'vue'

import ConfirmDialog from '@/components/ui/confirm-dialog.vue'
import ToastNotification from '@/components/ui/toast-notification.vue'
import { setupServiceWorker } from '@/offline/register-sw'
import { useUiStore } from '@/store/ui'

const ui = useUiStore()
const needsRefresh = ref(false)
let applyUpdate: ((reload?: boolean) => Promise<void>) | undefined

onMounted(() => {
  document.documentElement.dataset.theme = ui.theme
  // Offered, never forced: a silent swap mid-session would drop the card the
  // user is answering.
  applyUpdate = setupServiceWorker(() => {
    needsRefresh.value = true
  })
})

function update() {
  void applyUpdate?.(true)
}
</script>

<template>
  <router-view />

  <div
    v-if="needsRefresh"
    class="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-center gap-3 border-t border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-sm"
  >
    <span>A new version is ready.</span>
    <button type="button" class="underline underline-offset-4" @click="update">
      Reload
    </button>
    <button type="button" class="text-[var(--color-muted)] underline underline-offset-4" @click="needsRefresh = false">
      Later
    </button>
  </div>

  <ConfirmDialog />
  <ToastNotification />
</template>
