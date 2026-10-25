<script setup lang="ts">
import { computed, ref } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import { useRouter } from 'vue-router'

import Button from '@/components/ui/button.vue'
import { useStreakCelebration } from '@/composables/use-answer-streak'
import { ROUTES } from '@/constants'
import { celebrationFor } from '@/lib/streak-celebrations'

/**
 * Answers right in a row: every 5th opens this, full screen on a phone and a
 * card from `sm` up. It marks a moment and asks nothing, so any of Keep going,
 * Esc or a tap outside the card closes it. Mounted once, in `app.vue`.
 *
 * The fine print says how to turn these off: a learner who would rather not
 * see them should not have to go looking.
 */

// ============ Composables ============
const router = useRouter()
const { celebrating, close } = useStreakCelebration()

// ============ Reactive State ============
const keepGoing = ref<{ $el: HTMLElement } | null>(null)

// ============ Computed Properties ============
const open = computed(() => celebrating.value !== null)
const shown = computed(() => celebrating.value === null ? null : celebrationFor(celebrating.value))

// ============ Methods ============
/** The modal focuses itself; the button should have it, so Enter means Keep going. */
function focusKeepGoing() {
  keepGoing.value?.$el.focus()
}

function toSettings() {
  close()
  void router.push(ROUTES.SETTINGS)
}
</script>

<template>
  <VueFinalModal
    :model-value="open"
    class="flex items-center justify-center"
    content-class="flex h-[100dvh] w-screen items-stretch justify-center sm:h-auto sm:w-auto sm:items-center"
    overlay-class="bg-black/60"
    :click-to-close="true"
    :esc-to-close="true"
    @update:model-value="close"
    @opened="focusKeepGoing"
  >
    <!-- On a phone the picture fills the width, square, inside a small margin,
         with the words and the button straight under it. From sm up, a card. -->
    <div
      v-if="shown"
      class="flex w-full flex-col bg-[var(--color-card)] pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center sm:mx-4 sm:max-w-md sm:overflow-hidden sm:rounded-3xl sm:border sm:border-[var(--color-border)] sm:pb-6"
      role="alertdialog"
      aria-labelledby="streak-celebration-title"
      aria-describedby="streak-celebration-line"
    >
      <!-- On a phone, a margin all round so the picture never touches the screen's edges. -->
      <div class="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:p-0">
        <img
          :key="shown.title"
          :src="shown.art"
          :alt="shown.alt"
          class="streak-pop aspect-square w-full rounded-2xl object-contain sm:rounded-none"
          width="200"
          height="200"
        >
      </div>
      <div class="flex flex-col items-center px-6 pt-6">
        <p id="streak-celebration-title" class="text-3xl font-semibold">
          {{ shown.title }}
        </p>
        <p id="streak-celebration-line" class="mt-3 max-w-xs text-base leading-relaxed text-[var(--color-muted)]">
          {{ shown.line }}
        </p>
        <Button ref="keepGoing" class="mt-6 w-full max-w-xs" variant="primary" @click="close">
          Keep going
        </Button>
      </div>
      <p class="mt-auto px-6 pt-4 text-xs text-[var(--color-muted)]">
        Don't want these? Turn them off in
        <button type="button" class="underline underline-offset-4" @click="toSettings">
          Settings
        </button>.
      </p>
    </div>
  </VueFinalModal>
</template>

<style scoped>
/* The picture arrives with a small bounce, so the moment pops. */
.streak-pop {
  animation: streak-pop 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes streak-pop {
  from {
    opacity: 0;
    transform: scale(0.82);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .streak-pop {
    animation: none;
  }
}
</style>
