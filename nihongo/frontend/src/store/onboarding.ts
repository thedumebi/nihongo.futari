import type { OnboardingAnswers, OnboardingState } from '@nihongo/shared/types'

import { defineStore } from 'pinia'
import { ref } from 'vue'

import { dismissGuide, getOnboarding, skipOnboarding, submitOnboarding } from '@/api/onboarding'

/**
 * Learners this device knows are past the welcome flow. A status only ever
 * leaves `pending`, never returns to it, so once seen it need not be asked
 * again before every first screen.
 */
const PASSED = 'go-onboarded:'

export function passedOnboarding(userId: string): boolean {
  try {
    return localStorage.getItem(`${PASSED}${userId}`) === '1'
  } catch {
    return false
  }
}

function rememberPassed(userId: string): void {
  try {
    localStorage.setItem(`${PASSED}${userId}`, '1')
  } catch {
    // The router simply asks again next time.
  }
}

function forgetPassed(): void {
  try {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith(PASSED))
        localStorage.removeItem(k)
    }
  } catch {
    // Nothing was stored.
  }
}

/**
 * Where the learner is with onboarding, shared by the router (a new account is
 * sent to the welcome flow), Today (the offer and the first-week guide) and
 * Settings (run it again). Asked once per page load; every change returns the
 * new state, so nothing has to ask twice.
 */
export const useOnboardingStore = defineStore('onboarding', () => {
  const state = ref<OnboardingState | null>(null)
  let inflight: Promise<OnboardingState | null> | null = null

  async function load(force = false): Promise<OnboardingState | null> {
    if (state.value && !force)
      return state.value
    inflight ??= getOnboarding()
      .then(s => (state.value = s))
      .catch(() => null)
      .finally(() => {
        inflight = null
      })
    return inflight
  }

  async function submit(answers: OnboardingAnswers) {
    state.value = await submitOnboarding(answers)
  }

  async function skip() {
    state.value = await skipOnboarding()
  }

  async function hideGuide() {
    state.value = await dismissGuide()
  }

  function reset() {
    state.value = null
    forgetPassed()
  }

  /** Sends a pending learner to the welcome flow; remembers one who is past it. */
  async function isPending(userId: string): Promise<boolean> {
    if (passedOnboarding(userId))
      return false
    const loaded = await load()
    if (loaded && loaded.status !== 'pending')
      rememberPassed(userId)
    return loaded?.status === 'pending'
  }

  return { state, load, submit, skip, hideGuide, reset, isPending }
})
