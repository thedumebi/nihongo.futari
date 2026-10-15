<script setup lang="ts">
import type { ListeningGame } from '@nihongo/shared/types'

import { Volume2 } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import { recordActivity } from '@/api/activities'
import { getListeningGame } from '@/api/games'
import GameEnd from '@/components/games/game-end.vue'
import PitchAccent from '@/components/ja/pitch-accent.vue'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import { playAudio } from '@/composables/use-audio'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * Listening: hear one word, pick which of two it was.
 *
 * The two differ by a single sound a beginner's ear merges — a long vowel,
 * a small っ, an ん — so this trains exactly the distinction, with real words
 * and their recordings. Written in kana only: the kanji would give it away.
 */

// ============ Stores ============
const lang = useLanguageStore()

// ============ Constants ============
const CONTRAST_HINT = {
  'long-vowel': 'Listen for a vowel held longer.',
  'small-tsu': 'Listen for a tiny pause: a small っ.',
  'n': 'Listen for an ん.',
  'pitch': 'Same sounds. Only the pitch differs. Read the shapes.'
} as const

// ============ Reactive State ============
const game = ref<ListeningGame | null>(null)
const loading = ref(true)
const failed = ref(false)
const index = ref(0)
const picked = ref<number | null>(null)
const score = ref(0)

// ============ Computed Properties ============
const round = computed(() => game.value?.rounds[index.value] ?? null)
const finished = computed(() => Boolean(game.value) && index.value >= (game.value?.rounds.length ?? 0))

// ============ Lifecycle Hooks ============
onMounted(load)

// ============ Methods ============
async function load() {
  loading.value = true
  failed.value = false
  index.value = 0
  score.value = 0
  picked.value = null
  try {
    game.value = await getListeningGame(lang.code)
    play()
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

function play() {
  if (round.value?.audio)
    void playAudio(round.value.audio)
}

function pick(i: number) {
  if (picked.value !== null || !round.value)
    return
  picked.value = i
  if (i === round.value.answer)
    score.value++
}

function next() {
  index.value++
  picked.value = null
  if (finished.value)
    void recordActivity({ kind: 'listening-game', refId: 'listening', score: score.value, total: game.value!.rounds.length }, lang.code)
  else
    play()
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <router-link :to="ROUTES.GAMES" class="text-sm underline underline-offset-4">
        &larr; Games
      </router-link>
      <h1 class="mt-4 text-3xl font-semibold">
        Listening
      </h1>

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="failed" class="mt-10 text-center text-[var(--color-muted)]">
        Could not load a game. Check your connection.
      </p>
      <p v-else-if="game && game.rounds.length === 0" class="mt-10 text-center text-[var(--color-muted)]">
        No pairs to play yet.
      </p>

      <GameEnd v-else-if="finished && game" :score="score" :total="game.rounds.length" @again="load" />

      <template v-else-if="round && game">
        <p class="mt-2 text-sm text-[var(--color-muted)]">
          {{ index + 1 }} of {{ game.rounds.length }} · {{ CONTRAST_HINT[round.contrast] }}
        </p>

        <div v-if="round.audio" class="mt-8 flex justify-center">
          <Button round aria-label="Play the word again" @click="play">
            <Volume2 class="h-6 w-6" />
          </Button>
        </div>
        <!-- A pitch round: no sound to play — the question is the meaning, the
             answer is in the shapes. -->
        <p v-else class="mt-8 text-center text-lg">
          Which one means <span class="font-semibold">“{{ round.options[round.answer]!.meaning }}”</span>?
        </p>

        <div class="mt-8 grid grid-cols-2 gap-3">
          <button
            v-for="(o, i) in round.options"
            :key="o.reading"
            type="button"
            class="rounded-xl border p-5 text-center transition"
            :class="picked === null
              ? 'border-[var(--color-border)] hover:border-[var(--color-text)]'
              : i === round.answer
                ? 'border-[var(--color-success)] bg-[var(--color-card)]'
                : i === picked ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)] opacity-60'"
            :disabled="picked !== null"
            @click="pick(i)"
          >
            <span v-if="!o.pitch" class="block text-3xl" style="font-family: var(--font-jp)">{{ o.reading }}</span>
            <PitchAccent v-else class="mx-auto w-fit" :reading="o.pitch.reading" :shape="o.pitch.shape" :pattern="o.pitch.pattern" />
            <span v-if="picked !== null" class="mt-2 block text-sm text-[var(--color-muted)]">
              <span style="font-family: var(--font-jp)">{{ o.text }}</span> · {{ o.meaning }}
            </span>
          </button>
        </div>

        <div v-if="picked !== null" class="mt-6 text-center">
          <p class="font-semibold" :class="picked === round.answer ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
            {{ picked === round.answer ? 'Right.' : `It was ${round.contrast === 'pitch' ? round.options[round.answer]!.text : round.options[round.answer]!.reading}.` }}
          </p>
          <Button class="mt-4" @click="next">
            Next
          </Button>
        </div>
      </template>
    </div>
  </AppShell>
</template>
