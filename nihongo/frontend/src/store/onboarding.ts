import type { OnboardingAnswers, OnboardingState } from '@nihongo/shared/types'

import { defineStore } from 'pinia'
import { ref } from 'vue'

import { dismissGuide, getOnboarding, skipOnboarding, submitOnboarding } from '@/api/onboarding'

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
  }

  return { state, load, submit, skip, hideGuide, reset }
})
