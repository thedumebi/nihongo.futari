<script setup lang="ts">
import type { GlossedToken, ParticlesGame, ParticlesRound, WordGloss } from '@nihongo/shared/types'

import { buildParticleRounds } from '@nihongo/shared/lib'
import { Heart, Volume2 } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { recordActivity } from '@/api/activities'
import { getParticlesGame } from '@/api/games'
import ChoiceGrid from '@/components/games/choice-grid.vue'
import GameEnd from '@/components/games/game-end.vue'
import WordMeaning from '@/components/ja/word-meaning.vue'
import AppShell from '@/components/layout/app-shell.vue'
import ClozePrompt from '@/components/study/cloze-prompt.vue'
import AnswerBar from '@/components/ui/answer-bar.vue'
import Button from '@/components/ui/button.vue'
import { useAnswerStreak } from '@/composables/use-answer-streak'
import { playAudio, stopAudio } from '@/composables/use-audio'
import { useFurigana } from '@/composables/use-furigana'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * Particles: a sentence with its particle taken out, four boxes, three hearts.
 *
 * Every particle lesson at the level is in play, mixed: there is nothing to
 * choose. The questions are authored and reviewed, so exactly one box is
 * right; the wrong three never fit the sentence. After answering, the
 * sentence is read aloud and one line says why.
 */

// ============ Stores ============
const { recordAnswer, releaseCelebration } = useAnswerStreak()
const lang = useLanguageStore()

// ============ Composables ============
const { mode, knownKanji, loadKnownKanji, loadSettings } = useFurigana()

// ============ Constants ============
const ROUND_SIZE = 15
const HEARTS = 3

// ============ Reactive State ============
const game = ref<ParticlesGame | null>(null)
const loading = ref(true)
const failed = ref(false)
const rounds = ref<ParticlesRound[]>([])
const index = ref(0)
const picked = ref<string | null>(null)
const score = ref(0)
const hearts = ref(HEARTS)
const combo = ref(0)
const bestCombo = ref(0)
const missed = ref<ParticlesRound[]>([])
const word = ref<{ half: 'before' | 'after', index: number, word: WordGloss } | null>(null)

// ============ Computed Properties ============
const round = computed(() => rounds.value[index.value] ?? null)
const correct = computed(() => picked.value === null || !round.value ? null : picked.value === round.value.question.answer)
/** Out of questions, or out of hearts once the last answer has been read. */
const finished = computed(() => rounds.value.length > 0 && (index.value >= rounds.value.length || (hearts.value === 0 && picked.value === null)))

// ============ Watchers ============
watch(finished, (done) => {
  if (done)
    void recordActivity({ kind: 'particles', refId: 'mixed', score: score.value, total: rounds.value.length }, lang.code)
})

// ============ Lifecycle Hooks ============
onMounted(() => {
  void loadKnownKanji(lang.code)
  void loadSettings()
  void load()
})

onBeforeUnmount(stopAudio)

// ============ Methods ============
async function load() {
  loading.value = true
  failed.value = false
  try {
    game.value = await getParticlesGame(lang.code)
    start()
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

function start(from: ParticlesRound[] | null = null) {
  if (!game.value)
    return
  rounds.value = from
    ? buildParticleRounds(from.map(r => r.question), from.length)
    : buildParticleRounds(game.value.questions, ROUND_SIZE)
  index.value = 0
  score.value = 0
  hearts.value = HEARTS
  combo.value = 0
  bestCombo.value = 0
  missed.value = []
  picked.value = null
  word.value = null
}

function pick(option: string) {
  if (picked.value !== null || !round.value)
    return
  picked.value = option
  word.value = null
  recordAnswer(option === round.value.question.answer, { hold: true })
  if (option === round.value.question.answer) {
    score.value++
    combo.value++
    bestCombo.value = Math.max(bestCombo.value, combo.value)
  } else {
    hearts.value--
    combo.value = 0
    missed.value = [...missed.value, round.value]
  }
  hear()
}

function hear() {
  if (round.value?.question.audio)
    void playAudio(round.value.question.audio)
}

async function next() {
  // Moving on: a celebration the last answer earned opens first, and the next question waits for it.
  await releaseCelebration()
  stopAudio()
  index.value++
  picked.value = null
  word.value = null
}

function onPick(half: 'before' | 'after', i: number | null) {
  const tokens: GlossedToken[] = half === 'before' ? round.value?.question.beforeTokens ?? [] : round.value?.question.afterTokens ?? []
  const w = i === null ? null : tokens[i]?.w
  word.value = w && i !== null ? { half, index: i, word: w } : null
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <router-link :to="ROUTES.GAMES" class="text-sm underline underline-offset-4">
        &larr; Games
      </router-link>
      <h1 class="mt-4 text-3xl font-semibold">
        Particles
      </h1>

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="failed" class="mt-10 text-center text-[var(--color-muted)]">
        Could not load a game. Check your connection.
      </p>
      <p v-else-if="game && rounds.length === 0" class="mt-10 text-center text-[var(--color-muted)]">
        No particle questions yet.
      </p>

      <!-- The end. -->
      <GameEnd v-else-if="finished" :score="score" :total="rounds.length" @again="start()">
        <p v-if="hearts === 0" class="mt-1 text-sm text-[var(--color-muted)]">
          Out of hearts after {{ index }} of {{ rounds.length }}.
        </p>
        <p v-if="bestCombo > 1" class="mt-1 text-sm text-[var(--color-muted)]">
          Best combo: {{ bestCombo }} in a row
        </p>
        <div v-if="missed.length" class="mt-5 space-y-3 text-left">
          <p class="text-sm font-semibold">
            To go over
          </p>
          <div v-for="r in missed" :key="r.question.id" class="rounded-lg border border-[var(--color-border)] p-3 text-sm">
            <p style="font-family: var(--font-jp)">
              {{ r.question.before }}<span class="font-semibold text-[var(--color-success)]">{{ r.question.answer }}</span>{{ r.question.after }}
            </p>
            <p class="mt-1 text-[var(--color-muted)]">
              {{ r.question.note }}
            </p>
            <router-link :to="ROUTES.GRAMMAR_DETAIL(r.question.lesson.slug)" class="mt-1 inline-block text-[var(--color-muted)] underline underline-offset-4" style="font-family: var(--font-jp)">
              {{ r.question.lesson.title }}
            </router-link>
          </div>
          <div class="flex justify-center pt-1">
            <Button variant="ghost" @click="start(missed)">
              Play these again
            </Button>
          </div>
        </div>
      </GameEnd>

      <!-- A question. -->
      <template v-else-if="round">
        <div class="mt-2 flex items-center justify-between text-sm text-[var(--color-muted)]">
          <span>{{ index + 1 }} of {{ rounds.length }}</span>
          <span v-if="combo > 1" class="font-semibold text-[var(--color-accent)]">{{ combo }} in a row</span>
          <span class="flex gap-1" :aria-label="`${hearts} of ${HEARTS} hearts left`">
            <Heart
              v-for="h in HEARTS"
              :key="h"
              class="h-5 w-5"
              :class="h <= hearts ? 'fill-[var(--color-danger)] text-[var(--color-danger)]' : 'text-[var(--color-border)]'"
            />
          </span>
        </div>

        <ClozePrompt
          :before="round.question.before"
          :after="round.question.after"
          :before-tokens="round.question.beforeTokens"
          :after-tokens="round.question.afterTokens"
          :before-segments="round.question.beforeSegments"
          :after-segments="round.question.afterSegments"
          :answer="round.question.answer"
          :revealed="picked !== null"
          :mode="mode"
          :known-kanji="knownKanji"
          :selected-before="word?.half === 'before' ? word.index : null"
          :selected-after="word?.half === 'after' ? word.index : null"
          @pick="onPick"
        />
        <p v-if="round.question.translation" class="mt-4 text-center text-sm text-[var(--color-muted)]">
          {{ round.question.translation }}
        </p>

        <WordMeaning v-if="word" class="mt-4" :word="word.word" @close="word = null" />

        <ChoiceGrid
          class="mt-8"
          :options="round.options"
          :answer="round.question.answer"
          :picked="picked"
          jp
          @pick="pick"
        />

        <div v-if="picked !== null" class="mt-6 text-center">
          <p class="font-semibold" :class="correct ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
            {{ correct ? 'Right.' : `Not quite. It is ${round.question.answer}.` }}
          </p>
          <p class="mx-auto mt-1 max-w-sm text-sm text-[var(--color-muted)]">
            {{ round.question.note }}
          </p>
        </div>
        <AnswerBar v-if="picked !== null" class="mt-4">
          <div class="flex items-center justify-center gap-3">
            <Button v-if="round.question.audio" variant="ghost" round aria-label="Hear the sentence again" @click="hear">
              <Volume2 class="h-5 w-5" />
            </Button>
            <Button @click="next">
              {{ hearts === 0 || index + 1 >= rounds.length ? 'See how you did' : 'Next' }}
            </Button>
          </div>
        </AnswerBar>
      </template>
    </div>
  </AppShell>
</template>
