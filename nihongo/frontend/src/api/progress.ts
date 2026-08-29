import type { ProgressSummary, Readiness } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export type { ProgressSummary }

export async function getSummary(): Promise<ProgressSummary> {
  const { data } = await client.get<ProgressSummary>(API_ENDPOINTS.PROGRESS.SUMMARY)
  return data
}

export async function getReadiness(levelCode: string, languageCode = 'ja'): Promise<Readiness> {
  const { data } = await client.get<Readiness>(API_ENDPOINTS.PROGRESS.READINESS(levelCode), {
    params: { languageCode }
  })
  return data
}
