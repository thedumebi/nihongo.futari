import type { AchievementList, ProgressSummary, Readiness } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export type { ProgressSummary }

export async function getSummary(languageCode = 'ja'): Promise<ProgressSummary> {
  const { data } = await client.get<ProgressSummary>(API_ENDPOINTS.PROGRESS.SUMMARY, { params: { languageCode } })
  return data
}

export async function getReadiness(levelCode: string, languageCode = 'ja'): Promise<Readiness> {
  const { data } = await client.get<Readiness>(API_ENDPOINTS.PROGRESS.READINESS(levelCode), {
    params: { languageCode }
  })
  return data
}

export async function listAchievements(languageCode = 'ja'): Promise<AchievementList> {
  const { data } = await client.get<AchievementList>(API_ENDPOINTS.PROGRESS.ACHIEVEMENTS, { params: { languageCode } })
  return data
}

/** Record that these unlocks were shown, so each is celebrated once. */
export async function markAchievementsSeen(codes: string[]): Promise<void> {
  await client.post(API_ENDPOINTS.PROGRESS.ACHIEVEMENTS_SEEN, { codes })
}
