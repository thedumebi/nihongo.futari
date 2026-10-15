<script setup lang="ts">
import type { RecallSession } from '@nihongo/shared/types'

import { thinkingTimeMs } from '@nihongo/shared/lib'
import { useLocalStorage } from '@vueuse/core'
import { Headphones, Pause, Play, SkipForward } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { recordActivity } from '@/api/activities'
import { getRecall } from '@/api/recall'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import Segmented from '@/components/ui/segmented.vue'
import { playAudioQueue, prefetchAudio, stopAudio } from '@/composables/use-audio'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * Recall: hands-free, Pimsleur style, over what you are shaky on.
 *
 * The English, a silence to say the Japanese, then the Japanese. Each word
 * comes back after one, three and seven others, so it has to be pulled from
 * memory a little later each time. Nothing here is graded — there is no
 * self-check with the phone in a pocket — so it never touches the review
 * schedule. Played to the end, it counts as a day's study.
 */

// ============ Stores ============
const lang = useLanguageStore()

// ============ Constants ============
const AFTER_ANSWER_MS = 1500
const PACES = [
  { value: 'slow', label: 'Slow', scale: 1.75 },
  { value: 'normal', label: 'Normal', scale: 1.25 },
  { value: 'fast', label: 'Fast', scale: 0.85 }
] as const
type Pace = typeof PACES[number]['value']

// ============ Reactive State ============
const session = ref<RecallSession | null>(null)
const loading = ref(true)
const failed = ref(false)
/** Position in `session.order`, not in `items`. */
const position = ref(0)
const playing = ref(false)
const answered = ref(false)
const finished = ref(false)
/** Per-device convenience, so localStorage. */
const pace = useLocalStorage<Pace>('go-recall-pace', 'normal')

let run = 0

// ============ Computed Properties ============
const item = computed(() => {
  const s = session.value
  const at = s?.order[position.value]
  return s && at !== undefined ? s.items[at] ?? null : null
})
/** Whether this word was already asked earlier in the session. */
const isRepeat = computed(() => {
  const order = session.value?.order ?? []
  const at = order[position.value]
  return at !== undefined && order.slice(0, position.value).includes(at)
})
const scale = computed(() => PACES.find(p => p.value === pace.value)?.scale ?? 1.25)
const total = computed(() => session.value?.order.length ?? 0)

// ============ Lifecycle Hooks ============
onMounted(async () => {
  try {
    session.value = await getRecall(lang.code)
    void prefetchAudio(session.value.items.flatMap(i => [...i.promptAudio, i.answerAudio]))
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
  const media = typeof navigator !== 'undefined' ? navigator.mediaSession : undefined
  if (!media)
    return
  media.metadata = new MediaMetadata({ title: 'Recall', artist: 'go' })
  media.setActionHandler('play', () => void start())
  media.setActionHandler('pause', pause)
  media.setActionHandler('nexttrack', skip)
})

onBeforeUnmount(() => {
  run++
  stopAudio()
  const media = typeof navigator !== 'undefined' ? navigator.mediaSession : undefined
  if (!media)
    return
  for (const action of ['play', 'pause', 'nexttrack'] as const)
    media.setActionHandler(action, null)
  media.metadata = null
})

// ============ Methods ============
async function start() {
  const s = session.value
  if (!s)
    return
  if (finished.value) {
    finished.value = false
    position.value = 0
  }
  const mine = ++run
  playing.value = true
  setState('playing')

  while (position.value < s.order.length) {
    const i = item.value!
    answered.value = false
    await playAudioQueue(i.promptAudio)
    if (mine !== run)
      return
    await playAudioQueue([{ pauseMs: () => thinkingTimeMs(i.reading, scale.value) }], { silentPauses: true })
    if (mine !== run)
      return
    answered.value = true
    await playAudioQueue([i.answerAudio, { pauseMs: AFTER_ANSWER_MS }], { silentPauses: true })
    if (mine !== run)
      return
    position.value++
  }

  playing.value = false
  finished.value = true
  setState('none')
  void recordActivity({ kind: 'recall', refId: 'recall', total: s.items.length }, lang.code)
}

function pause() {
  run++
  stopAudio()
  playing.value = false
  setState('paused')
}

function skip() {
  const wasPlaying = playing.value
  run++
  stopAudio()
  position.value = Math.min(total.value - 1, position.value + 1)
  answered.value = false
  if (wasPlaying)
    void start()
}

function setState(state: MediaSessionPlaybackState) {
  if (typeof navigator !== 'undefined' && navigator.mediaSession)
    navigator.mediaSession.playbackState = state
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 class="flex items-center gap-2 text-3xl font-semibold">
        <Headphones class="h-7 w-7" /> Recall
      </h1>
      <p class="mt-2 text-[var(--color-muted)]">
        The words you are still learning, the ones that keep slipping, and the ones you missed this
        week. Hear the English, say the Japanese out loud, then hear it. Each comes back a little
        later. Works with the screen off, and never changes your reviews.
      </p>

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="failed" class="mt-10 text-center text-[var(--color-muted)]">
        Could not load a session — check your connection.
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
        <Segmented v-model="pace" class="mt-6" label="Time to answer" :options="PACES.map(p => ({ value: p.value, label: p.label }))" />

        <div class="mt-6 min-h-[12rem] rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
          <p class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {{ finished ? 'Finished' : `${position + 1} of ${total}` }}
            <!-- Words come back on purpose, after 1, 3 and 7 others: say so. -->
            <span v-if="!finished && isRepeat" class="ml-2 rounded-full border border-[var(--color-border)] px-2 py-0.5 normal-case tracking-normal">again</span>
          </p>
          <template v-if="item && !finished">
            <p class="mt-2 text-lg">
              {{ item.prompt }}
              <!-- When the English could be more than one of your words, its first sound. -->
              <span v-if="item.hint" class="ml-1 text-[var(--color-muted)]">— starts with <span style="font-family: var(--font-jp)">{{ item.hint }}</span></span>
            </p>
            <div class="mt-6 text-center transition-opacity" :class="answered ? 'opacity-100' : 'opacity-0'" :aria-hidden="!answered">
              <p class="text-2xl" style="font-family: var(--font-jp)">
                {{ item.text }}
              </p>
              <p v-if="item.reading !== item.text" class="text-sm text-[var(--color-muted)]" style="font-family: var(--font-jp)">
                {{ item.reading }}
              </p>
            </div>
          </template>
          <div v-else-if="finished" class="mt-4">
            <p class="text-lg">
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
          </div>
        </div>

        <div class="mt-6 flex items-center justify-center gap-3">
          <Button round :aria-label="playing ? 'Pause' : 'Play'" @click="playing ? pause() : start()">
            <Pause v-if="playing" class="h-5 w-5" />
            <Play v-else class="h-5 w-5" />
          </Button>
          <Button variant="ghost" round aria-label="Next" @click="skip">
            <SkipForward class="h-5 w-5" />
          </Button>
        </div>
      </template>
    </div>
  </AppShell>
</template>
