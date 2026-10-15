<script setup lang="ts">
import type { SpeakSessionView } from '@nihongo/shared/types'

import { useLocalStorage } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { recordActivity } from '@/api/activities'
import { completeSpeakSession, getSpeakSession, listSpeak, missSpeakStep } from '@/api/speak'
import AppShell from '@/components/layout/app-shell.vue'
import HandsFreeRun from '@/components/speak/hands-free-run.vue'
import OnScreenRun from '@/components/speak/on-screen-run.vue'
import Button from '@/components/ui/button.vue'
import Segmented from '@/components/ui/segmented.vue'
import Slider from '@/components/ui/slider.vue'
import { useFurigana } from '@/composables/use-furigana'
import { useToast } from '@/composables/use-toast'
import { ROUTES } from '@/constants'
import { isNetworkError, queueAction } from '@/offline/queue'
import { useLanguageStore } from '@/store/language'

/**
 * One Speak session, on screen or hands-free.
 *
 * On screen is the full method: hear the prompt, say it, check yourself, and a
 * finished run is recorded. Hands-free plays the same session as continuous
 * audio for when your hands and eyes are busy.
 */

// ============ Stores ============
const route = useRoute()
const lang = useLanguageStore()

// ============ Composables ============
const { mode, knownKanji, loadKnownKanji, loadSettings } = useFurigana()
const toast = useToast()

// ============ Constants ============
/**
 * The pace of a session, slowest first: a slider reads as speed, so slower —
 * more time to answer — sits on the left. Each step scales the thinking pause.
 * Words, not multipliers: "3×" beside a speed slider reads as the fastest.
 */
const PACES = [
  { scale: 3, label: 'Slowest' },
  { scale: 2.5, label: 'Very slow' },
  { scale: 2, label: 'Slower' },
  { scale: 1.5, label: 'Slow' },
  { scale: 1.25, label: 'A little slow' },
  { scale: 1, label: 'Normal' },
  { scale: 0.75, label: 'Fast' },
  { scale: 0.5, label: 'Fastest' }
] as const
const NORMAL_STEP = PACES.findIndex(p => p.scale === 1)

// ============ Reactive State ============
const session = ref<SpeakSessionView | null>(null)
const loading = ref(true)
const notFound = ref(false)
const view = ref<'screen' | 'hands-free'>('screen')
/** The pace, as a step on PACES. A per-device convenience, so localStorage. */
const paceStep = useLocalStorage('go-speak-pace', NORMAL_STEP)
const result = ref<{ gotIt: number, total: number } | null>(null)
/** Bumped to remount the on-screen run, which is how "go again" restarts it. */
const attempt = ref(0)

const VIEWS = [
  { value: 'screen' as const, label: 'On screen' },
  { value: 'hands-free' as const, label: 'Hands-free' }
]

// ============ Computed Properties ============
const pace = computed(() => PACES[paceStep.value] ?? PACES[NORMAL_STEP]!)
const thinkScale = computed(() => pace.value.scale)

// ============ Watchers ============
watch(() => route.params.code, load)

// ============ Lifecycle Hooks ============
onMounted(() => {
  void loadSettings()
  void loadKnownKanji(lang.code)
  void load()
})

// ============ Methods ============
async function load() {
  loading.value = true
  notFound.value = false
  result.value = null
  try {
    session.value = await getSpeakSession(String(route.params.code), lang.code)
  } catch {
    notFound.value = true
    session.value = null
  } finally {
    loading.value = false
  }
}

async function onFinished(run: { gotIt: number, total: number }) {
  result.value = run
  const s = session.value
  // A draft is being previewed from the review queue; there is nothing to record.
  if (!s?.published || run.total === 0)
    return
  try {
    await completeSpeakSession(s.code, run, lang.code)
  } catch (e) {
    if (isNetworkError(e))
      await queueAction({ type: 'speakComplete', languageCode: lang.code, code: s.code, gotIt: run.gotIt, total: run.total })
    else
      toast.error('Could not save this run. It still counts, try again later.')
  }
  await findNext(s.code)
}

/**
 * A hands-free run played to the end. It cannot be scored — there is no
 * self-check — so it does not mark the session done, but listening through a
 * session is still a day's study.
 */
function onListened() {
  const s = session.value
  if (s?.published)
    void recordActivity({ kind: 'speak-listen', refId: s.code }, lang.code)
}

/** The session after this one in the course, so "done" leads on. */
const nextSession = ref<{ code: string, number: number, titleEn: string } | null>(null)

async function findNext(code: string) {
  try {
    const { sessions } = await listSpeak(lang.code)
    const at = sessions.findIndex(x => x.code === code)
    nextSession.value = at >= 0 ? sessions[at + 1] ?? null : null
  } catch {
    nextSession.value = null
  }
}

/**
 * A miss goes into reviews, so the prompts you could not say come back later.
 * Said once per run rather than on every miss — the point is to know it
 * happens, not to be interrupted each time.
 */
let toldAboutReviews = false
async function onMissed(index: number) {
  const s = session.value
  // A draft previewed from the review queue leaves nothing behind.
  if (!s?.published)
    return
  try {
    const { added } = await missSpeakStep(s.code, index, lang.code)
    if (added && !toldAboutReviews) {
      toldAboutReviews = true
      toast.success('Added to your reviews. Prompts you miss will come back.')
    }
  } catch (e) {
    // Offline, the miss is queued so the prompt still reaches reviews.
    if (isNetworkError(e))
      await queueAction({ type: 'speakMiss', languageCode: lang.code, code: s.code, index })
  }
}

function again() {
  result.value = null
  attempt.value++
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <router-link :to="ROUTES.SPEAK" class="text-sm underline underline-offset-4">
        &larr; All sessions
      </router-link>

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="notFound" class="mt-10 text-center text-[var(--color-muted)]">
        That session does not exist.
      </p>

      <template v-else-if="session">
        <header class="mt-6">
          <p class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {{ session.level }} &middot; {{ session.kind === 'story' ? 'Story' : 'Session' }} {{ session.number }}
            <span
              v-if="!session.published"
              class="ml-2 rounded border border-[var(--color-border)] px-1.5 py-0.5 normal-case tracking-normal"
            >Draft: awaiting review</span>
          </p>
          <h1 class="mt-1 text-3xl font-semibold">
            {{ session.titleEn }}
          </h1>
          <p class="mt-1 text-[var(--color-muted)]" style="font-family: var(--font-jp)">
            {{ session.title }}
          </p>
        </header>

        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Segmented v-model="view" label="How" :options="VIEWS" />
          <Slider
            v-model="paceStep"
            label="Pace (slower gives more time to answer)"
            :min="0"
            :max="PACES.length - 1"
            :value-text="pace.label"
          />
        </div>

        <div class="mt-6">
          <template v-if="view === 'screen'">
            <div v-if="result" class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center">
              <p class="text-xl font-semibold">
                Session done.
              </p>
              <p class="mt-2 text-[var(--color-muted)]">
                {{ result.gotIt }} of {{ result.total }} the first time.
                <template v-if="result.gotIt < result.total">
                  The ones you missed came round again. That is how it sticks.
                </template>
              </p>
              <div class="mt-5 flex justify-center gap-3">
                <Button variant="ghost" @click="again">
                  Go again
                </Button>
                <Button v-if="nextSession" :to="ROUTES.SPEAK_SESSION(nextSession.code)">
                  Next: {{ nextSession.titleEn }}
                </Button>
                <Button v-else :to="ROUTES.SPEAK">
                  Back to the course
                </Button>
              </div>
            </div>
            <OnScreenRun
              v-else
              :key="attempt"
              :steps="session.steps"
              :mode="mode"
              :known-kanji="knownKanji"
              :think-scale="thinkScale"
              @finished="onFinished"
              @missed="onMissed"
            />
          </template>
          <HandsFreeRun
            v-else
            :steps="session.steps"
            :title="session.titleEn"
            :number="session.number"
            :think-scale="thinkScale"
            @finished="onListened"
          />
        </div>
      </template>
    </div>
  </AppShell>
</template>
