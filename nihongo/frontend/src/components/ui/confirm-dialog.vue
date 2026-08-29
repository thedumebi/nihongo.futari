<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'

import Button from '@/components/ui/button.vue'
import { useConfirm } from '@/composables/use-confirm'

const { isVisible, currentOptions, handleConfirm, handleCancel } = useConfirm()
</script>

<template>
  <VueFinalModal
    v-model="isVisible"
    class="flex items-center justify-center"
    content-class="flex items-center justify-center"
    overlay-class="bg-black/50"
    :click-to-close="false"
    :esc-to-close="true"
    @closed="handleCancel"
  >
    <div class="bg-card text-text rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
      <h3 class="text-lg font-semibold mb-2">
        {{ currentOptions.title || 'Are you sure?' }}
      </h3>
      <p class="text-muted mb-6">
        {{ currentOptions.message }}
      </p>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 text-sm rounded-full text-text hover:text-hover transition"
          @click="handleCancel"
        >
          {{ currentOptions.cancelText || 'Cancel' }}
        </button>
        <!-- Destructive confirms must LOOK destructive. `danger` is part of the
             showConfirm() options and was previously accepted but ignored here,
             so deletes rendered identically to ordinary confirmations. -->
        <Button :variant="currentOptions.danger ? 'danger' : 'primary'" @click="handleConfirm">
          {{ currentOptions.confirmText || 'Confirm' }}
        </Button>
      </div>
    </div>
  </VueFinalModal>
</template>
