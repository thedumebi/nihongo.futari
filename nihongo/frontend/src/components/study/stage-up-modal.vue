<script setup lang="ts">
import type { StageCelebration } from '@nihongo/shared/types'

import { computed, watch } from 'vue'
import { VueFinalModal } from 'vue-final-modal'

import { markCelebrationSeen } from '@/api/study'
import Button from '@/components/ui/button.vue'
import { useStageCelebration } from '@/composables/use-stage-celebration'

/**
 * Reaching a new stage. Dismissible and self-closing on click: this marks a
 * moment, it does not ask for a decision.
 *
 * Shared by Study and Today, so a stage passed while reviewing or on another
 * device is announced wherever the learner goes next. The server keeps the pass
 * pending until a screen shows it; showing it here tells the server so.
 */

interface Props {
  celebration: StageCelebration | null
  languageCode: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

// ============ Composables ============
const { isDismissed, dismiss } = useStageCelebration()

// ============ Computed Properties ============
const open = computed(() => props.celebration !== null && !isDismissed(props.celebration))

// ============ Watchers ============
watch(open, (isOpen) => {
  const c = props.celebration
  if (isOpen && c) {
    void markCelebrationSeen(props.languageCode, c.level, c.to).catch(() => {
      // Offline: it stays pending and shows once more later, which beats losing it.
    })
  }
}, { immediate: true })

// ============ Methods ============
function close() {
  if (props.celebration)
    dismiss(props.celebration)
  emit('close')
}
</script>

<template>
  <VueFinalModal
    :model-value="open"
    class="flex items-center justify-center"
    content-class="flex items-center justify-center"
    overlay-class="bg-black/60"
    :click-to-close="true"
    :esc-to-close="true"
    @update:model-value="close"
  >
    <div
      v-if="celebration"
      class="mx-4 max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center"
    >
      <p class="text-3xl">
        🎉
      </p>
      <p class="mt-3 text-xl font-semibold">
        Stage {{ celebration.to - 1 }} complete
      </p>
      <p class="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
        You have retained enough of {{ celebration.level }} stage {{ celebration.to - 1 }},
        so stage {{ celebration.to }} is open. New words now come from there.
      </p>
      <p class="mt-4 text-sm text-[var(--color-muted)]">
        {{ celebration.level }} &middot; stage {{ celebration.to }} of {{ celebration.stages }}
      </p>
      <Button class="mt-6" variant="primary" @click="close">
        Keep going
      </Button>
    </div>
  </VueFinalModal>
</template>
