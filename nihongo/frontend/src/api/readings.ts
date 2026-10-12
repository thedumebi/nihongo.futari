import type { ReadingListResponse, ReadingView } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function listReadings(languageCode = 'ja', level?: string): Promise<ReadingListResponse> {
  const { data } = await client.get<ReadingListResponse>(API_ENDPOINTS.READINGS.LIST, {
    params: { languageCode, ...(level ? { level } : {}) }
  })
  return data
}

export async function getReading(code: string, languageCode = 'ja'): Promise<ReadingView> {
  const { data } = await client.get<ReadingView>(API_ENDPOINTS.READINGS.GET_BY_CODE(code), { params: { languageCode } })
  return data
}
