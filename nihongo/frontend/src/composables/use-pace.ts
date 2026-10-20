import { useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'

/**
 * The pace of a spoken session, shared by Speak and Recall: how long the
 * silence is for saying the answer.
 *
 * Slowest first: a slider reads as speed, so slower (more time to answer)
 * sits on the left. Each step scales the thinking pause. Words, not
 * multipliers: "3×" beside a speed slider reads as the fastest.
 *
 * One setting for both, kept per device (localStorage). Recall used to have
 * its own three paces, whose Normal waited a quarter longer than Speak's.
 */
export const PACES = [
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

export function usePace() {
  /** The pace, as a step on PACES. */
  const paceStep = useLocalStorage('go-speak-pace', NORMAL_STEP)
  const pace = computed(() => PACES[paceStep.value] ?? PACES[NORMAL_STEP]!)
  const thinkScale = computed(() => pace.value.scale)
  return { paceStep, pace, thinkScale, maxStep: PACES.length - 1 }
}
