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
/** A celebration earned but held until the learner moves on (rates the card, presses Next). */
let held: number | null = null
/** Who is waiting for the open celebration to close before going on. */
let onClosed: Array<() => void> = []

function closeCelebration(): void {
  celebrating.value = null
  const waiting = onClosed
  onClosed = []
  for (const go of waiting)
    go()
}

function cancelPending(): void {
  if (timer)
    clearTimeout(timer)
  timer = null
  held = null
}

/**
 * Count one graded answer. A right one may open a celebration; a wrong one
 * ends the run.
 *
 * `hold`: the learner has not moved on yet (Study still wants Hard, Good or
 * Easy; a game still shows its verdict and Next), so the celebration waits for
 * `releaseCelebration()` instead of covering the verdict. Every answering
 * screen holds; nothing should open over the answer itself.
 */
export function recordAnswer(correct: boolean, options: { hold?: boolean } = {}): void {
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
  if (options.hold) {
    held = reached
    return
  }
  timer = setTimeout(() => {
    timer = null
    celebrating.value = reached
  }, OPEN_DELAY_MS)
}

/**
 * The learner is moving on: open the celebration the last answer earned, if
 * any, before the next question. Resolves once it is closed (at once when
 * there is none), so a screen that starts a timer or plays audio on its next
 * question can wait for it.
 */
export function releaseCelebration(): Promise<void> {
  if (held === null)
    return Promise.resolve()
  celebrating.value = held
  held = null
  return new Promise(resolve => onClosed.push(resolve))
}

/** Start a fresh run for this screen, ended when the screen goes. */
export function useAnswerStreak(): { recordAnswer: typeof recordAnswer, releaseCelebration: typeof releaseCelebration } {
  count.value = 0
  onBeforeUnmount(() => {
    count.value = 0
    cancelPending()
  })
  return { recordAnswer, releaseCelebration }
}

/** True while a celebration is open: answering screens ignore their keys meanwhile. */
export const celebrationOpen = computed(() => celebrating.value !== null)

export function useStreakCelebration() {
  return {
    celebrating,
    close: closeCelebration
  }
}

/** The learner's setting, as the server has it or as Settings just saved it. */
export function setStreakCelebrations(on: boolean): void {
  enabled.value = on
  if (!on) {
    cancelPending()
    closeCelebration()
  }
}

export const streakCelebrationsOn = computed(() => enabled.value)
