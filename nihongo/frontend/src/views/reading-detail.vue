<script setup lang="ts">
import type { FuriganaMode } from '@nihongo/shared/constants'
import type { ReadingView, WordGloss } from '@nihongo/shared/types'

import { FURIGANA_MODES } from '@nihongo/shared/constants'
import { useLocalStorage } from '@vueuse/core'
import { isAxiosError } from 'axios'
import { Languages, Pause, Play, RotateCcw } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getReading } from '@/api/readings'
import { saveWord } from '@/api/study'
import WordMeaning from '@/components/ja/word-meaning.vue'
import AppShell from '@/components/layout/app-shell.vue'
import Teleprompter from '@/components/reader/teleprompter.vue'
import Button from '@/components/ui/button.vue'
import Segmented from '@/components/ui/segmented.vue'
import Slider from '@/components/ui/slider.vue'
import { FURIGANA_MODE_LABELS, useFurigana } from '@/composables/use-furigana'
import { useToast } from '@/composables/use-toast'
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
const toast = useToast()

// ============ Reactive State ============
const reading = ref<ReadingView | null>(null)
const loading = ref(true)
const notFound = ref(false)
const playing = ref(false)
/** This speech's reading aid; null until the reader picks one, so it follows the setting. */
const aid = ref<FuriganaMode | null>(null)
/** 1–10, ten pixels a second per step. A per-device convenience, so localStorage. */
const speedStep = useLocalStorage('go-reader-speed', 4)
const showTranslation = ref(false)
const word = ref<WordGloss | null>(null)
const saving = ref(false)
/** Words added (or found already there) this visit, so the button can say so. */
const inReviews = ref(new Set<string>())
const prompter = ref<InstanceType<typeof Teleprompter> | null>(null)

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

function closeWord() {
  word.value = null
  prompter.value?.clearPick()
}

async function addToReviews(target: WordGloss) {
  if (!target.wordId)
    return
  saving.value = true
  try {
    const { added } = await saveWord(target.wordId)
    inReviews.value = new Set(inReviews.value).add(target.wordId)
    toast.success(added ? `${target.form} added to your reviews` : `${target.form} is already in your reviews`)
  } catch (e) {
    toast.error(isAxiosError(e) && e.response?.status === 404
      ? `${target.form} cannot be reviewed yet`
      : 'Could not add that word — try again')
  } finally {
    saving.value = false
  }
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

        <WordMeaning v-if="word" :word="word" @close="closeWord">
          <Button
            v-if="word.wordId"
            variant="ghost"
            :loading="saving"
            :disabled="inReviews.has(word.wordId)"
            @click="addToReviews(word)"
          >
            {{ inReviews.has(word.wordId) ? 'In your reviews' : 'Add to reviews' }}
          </Button>
        </WordMeaning>
        <p class="mt-3 text-center text-sm text-[var(--color-muted)]">
          Tap a word for its meaning. Press and hold a line for its English.
        </p>

        <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Slider v-model="speedStep" label="Speed" :min="1" :max="10" :value-text="speedText" />
          <Segmented v-model="aidModel" label="Reading aid — this speech only" :options="aidOptions" />
        </div>

        <div class="mt-8 border-t border-[var(--color-border)] pt-6">
          <Button variant="ghost" @click="showTranslation = !showTranslation">
            <Languages class="h-4 w-4" />
            {{ showTranslation ? 'Hide translation' : 'Show translation' }}
          </Button>

          <div v-if="showTranslation" class="mt-4 space-y-4 leading-relaxed">
            <p v-for="(stanza, s) in reading.stanzas" :key="s">
              {{ stanza.map(line => line.translation).join(' ') }}
            </p>
          </div>
        </div>
      </template>
    </div>
  </AppShell>
</template>
