import type { OnboardingAnswers, OnboardingState, PlacementResponse } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function getOnboarding(): Promise<OnboardingState> {
  const { data } = await client.get<OnboardingState>(API_ENDPOINTS.ONBOARDING.GET)
  return data
}

export async function submitOnboarding(answers: OnboardingAnswers): Promise<OnboardingState> {
  const { data } = await client.post<OnboardingState>(API_ENDPOINTS.ONBOARDING.SUBMIT, answers)
  return data
}

export async function skipOnboarding(): Promise<OnboardingState> {
  const { data } = await client.post<OnboardingState>(API_ENDPOINTS.ONBOARDING.SKIP)
  return data
}

export async function dismissGuide(): Promise<OnboardingState> {
  const { data } = await client.post<OnboardingState>(API_ENDPOINTS.ONBOARDING.DISMISS_GUIDE)
  return data
}

export async function getPlacement(languageCode: string): Promise<PlacementResponse> {
  const { data } = await client.get<PlacementResponse>(API_ENDPOINTS.ONBOARDING.PLACEMENT, { params: { languageCode } })
  return data
}
