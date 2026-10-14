<script setup lang="ts">
import type { FuriganaMode } from '@nihongo/shared/constants'
import type { ReadingView, WordGloss } from '@nihongo/shared/types'

import { FURIGANA_MODES } from '@nihongo/shared/constants'
import { useLocalStorage } from '@vueuse/core'
import { Languages, Pause, Play, RotateCcw, Volume2 } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { recordActivity } from '@/api/activities'
import { getReading, listReadings } from '@/api/readings'
import WordMeaning from '@/components/ja/word-meaning.vue'
import AppShell from '@/components/layout/app-shell.vue'
import Teleprompter from '@/components/reader/teleprompter.vue'
import Button from '@/components/ui/button.vue'
import Segmented from '@/components/ui/segmented.vue'
import Slider from '@/components/ui/slider.vue'
import { playAudioQueue, stopAudio } from '@/composables/use-audio'
import { FURIGANA_MODE_LABELS, useFurigana } from '@/composables/use-furigana'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * One speech, scrolling, to read out loud.
 *
 * The reading aid starts as the reader's own setting and can be changed here
 * for this speech only. It is a separate ref on purpose: writing to the shared
 * `mode` would PATCH the account setting, and switching to romaji for one hard
 * speech must not quietly switch it everywhere.
 */

// ============ Stores ============
const route = useRoute()
const lang = useLanguageStore()

// ============ Composables ============
const { mode, knownKanji, loadKnownKanji, loadSettings } = useFurigana()

// ============ Reactive State ============
const reading = ref<ReadingView | null>(null)
const loading = ref(true)
const notFound = ref(false)
const playing = ref(false)
/** Read to the end: show where to go next instead of a still teleprompter. */
const ended = ref(false)
const nextReading = ref<{ code: string, title: string, titleEn: string } | null>(null)

// Playing again from the top puts the end card away.
watch(playing, (on) => {
  if (on)
    ended.value = false
})

/** The teleprompter reached the last line. */
async function onEnd() {
  ended.value = true
  const r = reading.value
  if (!r)
    return
  // A draft previewed from the review queue is not something the learner read.
  if (r.published !== false)
    void recordActivity({ kind: 'reading', refId: r.code }, lang.code)
  try {
    const { readings } = await listReadings(lang.code, r.level)
    const at = readings.findIndex(x => x.code === r.code)
    const next = at >= 0 ? readings[at + 1] : undefined
    nextReading.value = next ? { code: next.code, title: next.title, titleEn: next.titleEn } : null
  } catch {
    nextReading.value = null
  }
}
/** This speech's reading aid; null until the reader picks one, so it follows the setting. */
const aid = ref<FuriganaMode | null>(null)
/** 1–10, ten pixels a second per step. A per-device convenience, so localStorage. */
const speedStep = useLocalStorage('go-reader-speed', 4)
const showTranslation = ref(false)
const word = ref<WordGloss | null>(null)
const prompter = ref<InstanceType<typeof Teleprompter> | null>(null)
const showListen = ref(false)
/** The line being spoken, as "stanza:line", or null when silent. */
const speaking = ref<string | null>(null)
let listenRun = 0

// ============ Computed Properties ============
const shownMode = computed<FuriganaMode>(() => aid.value ?? mode.value)
const aidModel = computed<FuriganaMode>({
  get: () => shownMode.value,
  set: (next) => { aid.value = next }
})
const aidOptions = FURIGANA_MODES.map(value => ({
  value,
  label: FURIGANA_MODE_LABELS[value].label,
  title: FURIGANA_MODE_LABELS[value].description
}))
const speedText = computed(() => speedStep.value <= 2 ? 'Slow' : speedStep.value >= 8 ? 'Fast' : `${speedStep.value}`)

// ============ Watchers ============
watch(() => route.params.code, load)

// ============ Lifecycle Hooks ============
onMounted(() => {
  void loadSettings()
  void loadKnownKanji(lang.code)
  void load()
})

onBeforeUnmount(stopListening)

// ============ Methods ============
async function load() {
  loading.value = true
  notFound.value = false
  playing.value = false
  word.value = null
  try {
    reading.value = await getReading(String(route.params.code), lang.code)
  } catch {
    notFound.value = true
    reading.value = null
  } finally {
    loading.value = false
  }
}

function restart() {
  prompter.value?.restart()
  playing.value = true
}

/** Pause after each line, and a longer one between stanzas, when listening through. */
const LINE_GAP_MS = 500
const STANZA_GAP_MS = 1100

/**
 * Hear the speech before reading it — every line from `from` on, in order. The
 * same recording a tapped line plays, so listening through and dipping in agree.
 */
async function listenFrom(stanza: number, line: number, once = false) {
  const r = reading.value
  if (!r)
    return
  const mine = ++listenRun
  stopAudio()
  for (let s = stanza; s < r.stanzas.length; s++) {
    const lines = r.stanzas[s]!
    for (let l = s === stanza ? line : 0; l < lines.length; l++) {
      speaking.value = `${s}:${l}`
      await playAudioQueue([lines[l]!.audio, { pauseMs: l === lines.length - 1 ? STANZA_GAP_MS : LINE_GAP_MS }], { silentPauses: true })
      if (mine !== listenRun)
        return
      if (once) {
        speaking.value = null
        return
      }
    }
  }
  speaking.value = null
}

function stopListening() {
  listenRun++
  stopAudio()
  speaking.value = null
}

function closeWord() {
  word.value = null
  prompter.value?.clearPick()
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <router-link :to="ROUTES.READ" class="text-sm underline underline-offset-4">
        &larr; All speeches
      </router-link>

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="notFound" class="mt-10 text-center text-[var(--color-muted)]">
        That speech does not exist.
      </p>

      <template v-else-if="reading">
        <header class="mt-6">
          <p class="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {{ reading.level }} &middot; Read this out loud
            <span
              v-if="!reading.published"
              class="ml-2 rounded border border-[var(--color-border)] px-1.5 py-0.5 normal-case tracking-normal"
            >Draft — awaiting review</span>
          </p>
          <h1 class="mt-1 text-3xl font-semibold" style="font-family: var(--font-jp)">
            {{ reading.title }}
          </h1>
          <p class="mt-1 text-[var(--color-muted)]">
            {{ reading.titleEn }}
          </p>
        </header>

        <!--
          Play and restart sit ON the stage, bottom corner. Below it they were
          under the fold on a phone, so starting the speech meant scrolling
          away from the speech.
        -->
        <div class="relative mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
          <Teleprompter
            ref="prompter"
            v-model:playing="playing"
            :stanzas="reading.stanzas"
            :mode="shownMode"
            :known-kanji="knownKanji"
            :speed="speedStep * 10"
            @pick="word = $event"
            @end="onEnd"
          />
          <div class="absolute bottom-3 right-3 flex items-center gap-2">
            <Button variant="ghost" round aria-label="Start again" @click="restart">
              <RotateCcw class="h-5 w-5" />
            </Button>
            <Button round :aria-label="playing ? 'Pause' : 'Play'" @click="playing = !playing">
              <Pause v-if="playing" class="h-5 w-5" />
              <Play v-else class="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div v-if="ended" class="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 text-center">
          <p class="text-lg font-semibold">
            Well read.
          </p>
          <div class="mt-4 flex flex-wrap justify-center gap-3">
            <Button variant="ghost" @click="ended = false; restart()">
              Read it again
            </Button>
            <Button v-if="nextReading" :to="ROUTES.READING_DETAIL(nextReading.code)">
              Next: <span style="font-family: var(--font-jp)">{{ nextReading.title }}</span>
            </Button>
            <Button v-else :to="ROUTES.READ">
              All speeches
            </Button>
          </div>
        </div>

        <WordMeaning v-if="word" :word="word" @close="closeWord" />
        <p class="mt-3 text-center text-sm text-[var(--color-muted)]">
          Tap a word for its meaning. Press and hold a line for its English.
        </p>

        <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Slider v-model="speedStep" label="Speed" :min="1" :max="10" :value-text="speedText" />
          <Segmented v-model="aidModel" label="Reading aid — this speech only" :options="aidOptions" />
        </div>

        <div class="mt-8 border-t border-[var(--color-border)] pt-6">
          <div class="flex flex-wrap gap-2">
            <Button variant="ghost" @click="showListen = !showListen">
              <Volume2 class="h-4 w-4" />
              {{ showListen ? 'Hide listening' : 'Listen first' }}
            </Button>
            <Button variant="ghost" @click="showTranslation = !showTranslation">
              <Languages class="h-4 w-4" />
              {{ showTranslation ? 'Hide translation' : 'Show translation' }}
            </Button>
          </div>

          <div v-if="showListen" class="mt-4">
            <div class="flex items-center gap-3">
              <Button v-if="speaking === null" @click="listenFrom(0, 0)">
                <Play class="h-4 w-4" /> Play it all
              </Button>
              <Button v-else variant="ghost" @click="stopListening">
                <Pause class="h-4 w-4" /> Stop
              </Button>
              <p class="text-sm text-[var(--color-muted)]">
                Or tap a line to hear just that one.
              </p>
            </div>
            <div class="mt-4 space-y-4">
              <div v-for="(stanza, s) in reading.stanzas" :key="s" class="space-y-1">
                <button
                  v-for="(line, l) in stanza"
                  :key="l"
                  type="button"
                  class="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-[var(--color-card)]"
                  :class="speaking === `${s}:${l}` ? 'bg-[var(--color-card)] ring-1 ring-[var(--color-accent)]' : ''"
                  @click="listenFrom(s, l, true)"
                >
                  <span class="block text-lg" style="font-family: var(--font-jp)">{{ line.text }}</span>
                  <span v-if="showTranslation" class="block text-sm text-[var(--color-muted)]">{{ line.translation }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <!-- With the lines open, each carries its own English instead. -->
          <div v-if="showTranslation && !showListen" class="space-y-4 leading-relaxed">
            <p v-for="(stanza, s) in reading.stanzas" :key="s">
              {{ stanza.map(line => line.translation).join(' ') }}
            </p>
          </div>
        </div>
      </template>
    </div>
  </AppShell>
</template>
