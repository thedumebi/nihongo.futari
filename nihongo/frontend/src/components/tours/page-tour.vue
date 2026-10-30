<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { TourPage } from '@/components/tours/tours'

import { TOURS } from '@/components/tours/tours'
import BottomSheet from '@/components/ui/bottom-sheet.vue'
import { usePageTour } from '@/composables/use-page-tour'

/**
 * A page's help button and the tour it opens: a few short steps in the bottom
 * sheet, Back and Next between them. Opens by itself on the first visit; Done
 * or closing it puts it away, and the button brings it back any time.
 */

interface Props {
  page: TourPage
}

const props = defineProps<Props>()

// ============ Composables ============
const tour = usePageTour(props.page)

// ============ Reactive State ============
const step = ref(0)

// ============ Computed Properties ============
const content = computed(() => TOURS[props.page])
const current = computed(() => content.value.steps[step.value]!)
const last = computed(() => step.value === content.value.steps.length - 1)

// ============ Watchers ============
// Each opening starts from the first step.
watch(tour.open, (open) => {
  if (open)
    step.value = 0
})
</script>

<template>
  <!-- Words, not an icon: a "?" is easy to miss and does not say what it opens. -->
  <button
    type="button"
    class="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm text-[var(--color-text)] transition hover:border-[var(--color-text)]"
    @click="tour.show"
  >
    How it works
  </button>

  <BottomSheet :open="tour.open.value" :label="content.title" @close="tour.dismiss">
    <template #header>
      <p class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
        {{ content.title }} &middot; {{ step + 1 }} of {{ content.steps.length }}
      </p>
    </template>

    <div class="flex min-h-full flex-col">
      <h2 class="text-xl font-semibold text-[var(--color-heading)]">
        {{ current.title }}
      </h2>
      <p class="mt-2 leading-relaxed">
        {{ current.body }}
      </p>

      <div class="mt-auto flex items-center justify-between gap-3 pt-6">
        <button
          type="button"
          class="rounded-lg px-3 py-2 text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] disabled:opacity-40"
          :disabled="step === 0"
          @click="step -= 1"
        >
          Back
        </button>
        <span class="flex gap-1.5" aria-hidden="true">
          <span
            v-for="(_, i) in content.steps"
            :key="i"
            class="h-1.5 w-1.5 rounded-full"
            :class="i === step ? 'bg-[var(--color-text)]' : 'bg-[var(--color-border)]'"
          />
        </span>
        <button
          v-if="!last"
          type="button"
          class="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm transition hover:border-[var(--color-text)]"
          @click="step += 1"
        >
          Next
        </button>
        <button
          v-else
          type="button"
          class="rounded-lg border border-[var(--color-text)] px-4 py-2 text-sm font-medium"
          @click="tour.dismiss"
        >
          Done
        </button>
      </div>
    </div>
  </BottomSheet>
</template>
