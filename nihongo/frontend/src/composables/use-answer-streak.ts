import { useLocalStorage } from '@vueuse/core'
import { computed, onBeforeUnmount, ref } from 'vue'

/**
 * Answers right in a row, and the celebration at every 5th.
 *
 * One counter for the whole app, at module level, so every kind of question
 * feeds the same run: Study, lessons, every game, writing, conversations,
 * Speak. A miss ends the run, and so does leaving the screen it was built on:
 * each answering view calls `useAnswerStreak()`, which starts it at zero and
 * clears it again on the way out, so "10 in a row" always means in this sitting.
 *
 * The setting is the learner's (`user_settings.streak_celebrations`), cached
 * here so a celebration never waits on the network; the server value replaces
 * the cache whenever study settings are read (see `refreshFuriganaSetting`).
 */

/** Every this many right in a row opens a celebration. */
export const STREAK_STEP = 5

/** Long enough for the green verdict to register before the celebration covers it. */
const OPEN_DELAY_MS = 600

const enabled = useLocalStorage('go-streak-celebrations', true)
const count = ref(0)
/** The run length being celebrated, or null when nothing is open. */
const celebrating = ref<number | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

function cancelPending(): void {
  if (timer)
    clearTimeout(timer)
  timer = null
}

/** Count one graded answer. A right one may open a celebration; a wrong one ends the run. */
export function recordAnswer(correct: boolean): void {
  if (!correct) {
    count.value = 0
    cancelPending()
    return
  }
  count.value++
  if (count.value % STREAK_STEP !== 0 || !enabled.value)
    return
  const reached = count.value
  cancelPending()
  timer = setTimeout(() => {
    timer = null
    celebrating.value = reached
  }, OPEN_DELAY_MS)
}

/** Start a fresh run for this screen, ended when the screen goes. */
export function useAnswerStreak(): { recordAnswer: typeof recordAnswer } {
  count.value = 0
  onBeforeUnmount(() => {
    count.value = 0
    cancelPending()
  })
  return { recordAnswer }
}

/** True while a celebration is open: answering screens ignore their keys meanwhile. */
export const celebrationOpen = computed(() => celebrating.value !== null)

export function useStreakCelebration() {
  return {
    celebrating,
    close: () => {
      celebrating.value = null
    }
  }
}

/** The learner's setting, as the server has it or as Settings just saved it. */
export function setStreakCelebrations(on: boolean): void {
  enabled.value = on
  if (!on) {
    cancelPending()
    celebrating.value = null
  }
}

export const streakCelebrationsOn = computed(() => enabled.value)
