<script setup lang="ts">
import type { SpeakSessionView } from '@nihongo/shared/types'

import { useLocalStorage } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { completeSpeakSession, getSpeakSession } from '@/api/speak'
import AppShell from '@/components/layout/app-shell.vue'
import HandsFreeRun from '@/components/speak/hands-free-run.vue'
import OnScreenRun from '@/components/speak/on-screen-run.vue'
import Button from '@/components/ui/button.vue'
import Segmented from '@/components/ui/segmented.vue'
import { useFurigana } from '@/composables/use-furigana'
import { useToast } from '@/composables/use-toast'
import { ROUTES } from '@/constants'
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

// ============ Reactive State ============
const session = ref<SpeakSessionView | null>(null)
const loading = ref(true)
const notFound = ref(false)
const view = ref<'screen' | 'hands-free'>('screen')
/** How long to leave for an answer. A per-device convenience, so localStorage. */
const thinking = useLocalStorage<'short' | 'normal' | 'long'>('go-speak-thinking', 'normal')
const result = ref<{ gotIt: number, total: number } | null>(null)
/** Bumped to remount the on-screen run, which is how "go again" restarts it. */
const attempt = ref(0)

const VIEWS = [
  { value: 'screen' as const, label: 'On screen' },
  { value: 'hands-free' as const, label: 'Hands-free' }
]
const THINKING = [
  { value: 'short' as const, label: 'Short', title: 'Less time to answer' },
  { value: 'normal' as const, label: 'Normal' },
  { value: 'long' as const, label: 'Long', title: 'More time to answer' }
]
const SCALE = { short: 0.7, normal: 1, long: 1.5 } as const

// ============ Computed Properties ============
const thinkScale = computed(() => SCALE[thinking.value] ?? 1)

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
  } catch {
    toast.error('Could not save this run — it still counts, try again later.')
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
            {{ session.level }} &middot; Session {{ session.number }}
            <span
              v-if="!session.published"
              class="ml-2 rounded border border-[var(--color-border)] px-1.5 py-0.5 normal-case tracking-normal"
            >Draft — awaiting review</span>
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
          <Segmented v-model="thinking" label="Time to answer" :options="THINKING" />
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
                  The ones you missed came round again — that is how it sticks.
                </template>
              </p>
              <div class="mt-5 flex justify-center gap-3">
                <Button variant="ghost" @click="again">
                  Go again
                </Button>
                <Button :to="ROUTES.SPEAK">
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
            />
          </template>
          <HandsFreeRun
            v-else
            :steps="session.steps"
            :title="session.titleEn"
            :number="session.number"
            :think-scale="thinkScale"
          />
        </div>
      </template>
    </div>
  </AppShell>
</template>
