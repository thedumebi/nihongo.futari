<script setup lang="ts">
import type { KanjiBuildGame } from '@nihongo/shared/types'

import { computed, onMounted, ref } from 'vue'

import { recordActivity } from '@/api/activities'
import { getKanjiBuildGame } from '@/api/games'
import GameEnd from '@/components/games/game-end.vue'
import AppShell from '@/components/layout/app-shell.vue'
import Button from '@/components/ui/button.vue'
import { useAnswerStreak } from '@/composables/use-answer-streak'
import { ROUTES } from '@/constants'
import { useLanguageStore } from '@/store/language'

/**
 * Build a kanji: two kinds of round, mixed.
 *
 * Assemble — given a meaning and a layout, pick the parts the kanji is built
 * from. The wrong tiles come from look-alikes, so getting it right means
 * seeing what actually distinguishes 待 from 持.
 *
 * Sound — which on-reading does this kanji's sound part suggest? From the
 * published phonetic series only, so the answer is sourced, not guessed.
 */

// ============ Stores ============
const { recordAnswer } = useAnswerStreak()
const lang = useLanguageStore()

// ============ Constants ============
const LAYOUT_TEXT: Record<string, string> = {
  '⿰': 'side by side',
  '⿱': 'one above the other',
  '⿲': 'three across',
  '⿳': 'three stacked',
  '⿴': 'one inside the other',
  '⿵': 'enclosed from above',
  '⿶': 'enclosed from below',
  '⿷': 'enclosed from the left',
  '⿸': 'tucked under the top-left',
  '⿹': 'tucked under the top-right',
  '⿺': 'resting on the bottom-left',
  '⿻': 'overlapping'
}

// ============ Reactive State ============
const game = ref<KanjiBuildGame | null>(null)
const loading = ref(true)
const failed = ref(false)
const index = ref(0)
const score = ref(0)
/** Tiles chosen so far, in order, for an assemble round. */
const chosen = ref<string[]>([])
/** The reading chosen, for a sound round. */
const guess = ref<string | null>(null)
const checked = ref(false)

// ============ Computed Properties ============
const round = computed(() => game.value?.rounds[index.value] ?? null)
const finished = computed(() => Boolean(game.value) && index.value >= (game.value?.rounds.length ?? 0))
const correct = computed(() => {
  const r = round.value
  if (!r)
    return false
  if (r.kind === 'phonetic')
    return guess.value === r.answer
  // Order matters: 部 and 陪 share their parts and differ in where they sit.
  return chosen.value.length === r.parts.length && chosen.value.every((p, i) => p === r.parts[i])
})

// ============ Lifecycle Hooks ============
onMounted(load)

// ============ Methods ============
async function load() {
  loading.value = true
  failed.value = false
  index.value = 0
  score.value = 0
  reset()
  try {
    game.value = await getKanjiBuildGame(lang.code)
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

function reset() {
  chosen.value = []
  guess.value = null
  checked.value = false
}

function tap(tile: string) {
  const r = round.value
  if (checked.value || r?.kind !== 'assemble')
    return
  const at = chosen.value.indexOf(tile)
  if (at >= 0)
    chosen.value.splice(at, 1)
  else if (chosen.value.length < r.parts.length)
    chosen.value.push(tile)
  if (chosen.value.length === r.parts.length)
    check()
}

function choose(reading: string) {
  if (checked.value)
    return
  guess.value = reading
  check()
}

function check() {
  checked.value = true
  recordAnswer(correct.value)
  if (correct.value)
    score.value++
}

function next() {
  index.value++
  reset()
  if (finished.value)
    void recordActivity({ kind: 'kanji-build', refId: 'kanji-build', score: score.value, total: game.value!.rounds.length }, lang.code)
}
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <router-link :to="ROUTES.GAMES" class="text-sm underline underline-offset-4">
        &larr; Games
      </router-link>
      <h1 class="mt-4 text-3xl font-semibold">
        Build a kanji
      </h1>

      <p v-if="loading" class="mt-10 text-center text-[var(--color-muted)]">
        Loading…
      </p>
      <p v-else-if="failed" class="mt-10 text-center text-[var(--color-muted)]">
        Could not load a game. Check your connection.
      </p>

      <GameEnd v-else-if="finished && game" :score="score" :total="game.rounds.length" @again="load" />

      <template v-else-if="round && game">
        <p class="mt-2 text-sm text-[var(--color-muted)]">
          {{ index + 1 }} of {{ game.rounds.length }}
        </p>

        <!-- Assemble: meaning + layout, pick the parts in order. -->
        <template v-if="round.kind === 'assemble'">
          <p class="mt-6 text-lg">
            Build the kanji for <span class="font-semibold">“{{ round.meaning }}”</span>
          </p>
          <p class="text-sm text-[var(--color-muted)]">
            {{ round.parts.length }} parts, {{ LAYOUT_TEXT[round.layout] ?? 'combined' }}. Pick them in order ({{ round.layout === '⿱' || round.layout === '⿳' ? 'top first' : round.layout === '⿰' || round.layout === '⿲' ? 'left first' : 'outer first' }}).
          </p>

          <div class="mt-6 flex items-center justify-center gap-3" style="font-family: var(--font-jp)">
            <span
              v-for="i in round.parts.length"
              :key="i"
              class="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed text-4xl"
              :class="checked ? (correct ? 'border-[var(--color-success)]' : 'border-[var(--color-danger)]') : 'border-[var(--color-border)]'"
            >{{ chosen[i - 1] ?? '' }}</span>
            <template v-if="checked">
              <span class="text-2xl text-[var(--color-muted)]">=</span>
              <span class="text-6xl">{{ round.character }}</span>
            </template>
          </div>

          <div class="mt-8 grid grid-cols-3 gap-3" style="font-family: var(--font-jp)">
            <button
              v-for="tile in round.tiles"
              :key="tile"
              type="button"
              class="rounded-xl border py-4 text-4xl transition"
              :class="chosen.includes(tile) ? 'border-[var(--color-accent)] bg-[var(--color-card)]' : 'border-[var(--color-border)] hover:border-[var(--color-text)]'"
              :disabled="checked"
              @click="tap(tile)"
            >
              {{ tile }}
            </button>
          </div>
          <p v-if="checked && !correct" class="mt-4 text-center text-sm">
            It is <span style="font-family: var(--font-jp)">{{ round.parts.join(' + ') }}</span>.
          </p>
        </template>

        <!-- Sound: which reading does the sound part suggest? -->
        <template v-else>
          <p class="mt-6 text-lg">
            Which reading does the part <span class="text-2xl" style="font-family: var(--font-jp)">{{ round.component }}</span> suggest?
          </p>
          <p class="mt-6 text-center text-7xl" style="font-family: var(--font-jp)">
            {{ round.character }}
          </p>
          <p class="text-center text-sm text-[var(--color-muted)]">
            “{{ round.meaning }}”
          </p>
          <div class="mt-6 grid grid-cols-2 gap-3" style="font-family: var(--font-jp)">
            <button
              v-for="o in round.options"
              :key="o"
              type="button"
              class="rounded-xl border py-4 text-2xl transition"
              :class="!checked
                ? 'border-[var(--color-border)] hover:border-[var(--color-text)]'
                : o === round.answer ? 'border-[var(--color-success)] bg-[var(--color-card)]'
                  : o === guess ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)] opacity-60'"
              :disabled="checked"
              @click="choose(o)"
            >
              {{ o }}
            </button>
          </div>
          <p v-if="checked && round.family.length" class="mt-4 text-center text-sm text-[var(--color-muted)]">
            Same family, same sound: <span class="text-base text-[var(--color-text)]" style="font-family: var(--font-jp)">{{ round.family.join(' ') }}</span>
          </p>
        </template>

        <div v-if="checked" class="mt-6 text-center">
          <p class="font-semibold" :class="correct ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
            {{ correct ? 'Right.' : 'Not quite.' }}
          </p>
          <Button class="mt-4" @click="next">
            Next
          </Button>
        </div>
      </template>
    </div>
  </AppShell>
</template>
