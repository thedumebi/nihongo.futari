<script setup lang="ts">
import type { RecallSession } from '@nihongo/shared/types'

import { recallSteps } from '@nihongo/shared/lib'
import { Headphones } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import { recordActivity } from '@/api/activities'
import { getRecall } from '@/api/recall'
import AppShell from '@/components/layout/app-shell.vue'
import HandsFreeRun from '@/components/speak/hands-free-run.vue'
import PageTour from '@/components/tours/page-tour.vue'
import Button from '@/components/ui/button.vue'
import Slider from '@/components/ui/slider.vue'
import { usePace } from '@/composables/use-pace'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * Recall: hands-free, Pimsleur style, over what you are shaky on.
 *
 * The English, a silence to say the Japanese, then the Japanese. Each word
 * comes back after one, three and seven others, so it has to be pulled from
 * memory a little later each time. Nothing here is graded (there is no
 * self-check with the phone in a pocket), so it never touches the review
 * schedule. Played to the end, it counts as a day's study.
 *
 * Played by Speak's hands-free player, with Speak's pace: one set of
 * controls, pauses and speeds for both.
 */

// ============ Stores ============
const lang = useLanguageStore()

// ============ Composables ============
const { paceStep, pace, thinkScale, maxStep } = usePace()

// ============ Reactive State ============
const session = ref<RecallSession | null>(null)
const loading = ref(true)
const failed = ref(false)

// ============ Computed Properties ============
const played = computed(() => session.value ? recallSteps(session.value) : { steps: [], tags: [], also: [] })

// ============ Lifecycle Hooks ============
onMounted(async () => {
  try {
    session.value = await getRecall(lang.code)
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
})

// ============ Methods ============
function onFinished() {
  const s = session.value
  if (s)
    void recordActivity({ kind: 'recall', refId: 'recall', total: s.items.length }, lang.code)
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="flex items-center gap-2 text-3xl font-semibold">
          <Headphones class="h-7 w-7" /> Recall
        </h1>
        <PageTour page="recall" />
      </div>
      <p class="mt-2 text-[var(--color-muted)]">
        The words you are still learning, the ones that keep slipping, and the ones you missed this
        week. Hear the English, say the Japanese out loud, then hear it. Each comes back a little
        later. Works with the screen off, and never changes your reviews.
      </p>

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="failed" class="mt-10 text-center text-[var(--color-muted)]">
        Could not load a session. Check your connection.
      </p>

      <div v-else-if="session && session.items.length === 0" class="mt-8 rounded-xl border border-[var(--color-border)] p-6 text-center">
        <p class="text-lg">
          Nothing shaky right now.
        </p>
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          Recall draws on words you are still learning or have missed. Learn a few new ones first.
        </p>
        <Button class="mt-4" :to="ROUTES.LEARN">
          Learn new words
        </Button>
      </div>

      <template v-else-if="session">
        <Slider
          v-model="paceStep"
          class="mt-6"
          label="Pace (slower gives more time to answer)"
          :min="0"
          :max="maxStep"
          :value-text="pace.label"
        />

        <HandsFreeRun
          class="mt-6"
          :steps="played.steps"
          :tags="played.tags"
          :also="played.also"
          title="Recall"
          album="Recall"
          :think-scale="thinkScale"
          show-reading
          @finished="onFinished"
        >
          <template #intro>
            <p class="text-sm text-[var(--color-muted)]">
              Pause during the silence to take as long as you need. Play again gives the answer.
            </p>
          </template>
          <template #finished>
            <p class="mt-4 text-lg">
              {{ session.items.length }} {{ session.items.length === 1 ? 'item' : 'items' }}, each recalled more than once.
            </p>
            <div class="mt-4 flex flex-wrap gap-3">
              <Button :to="ROUTES.REVIEW">
                Review what's due
              </Button>
              <Button variant="ghost" :to="ROUTES.TODAY">
                Back to today
              </Button>
            </div>
          </template>
        </HandsFreeRun>
      </template>
    </div>
  </AppShell>
</template>
