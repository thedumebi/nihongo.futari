import type { SpeakCompleteInput, SpeakListResponse, SpeakSessionView } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function listSpeak(languageCode = 'ja'): Promise<SpeakListResponse> {
  const { data } = await client.get<SpeakListResponse>(API_ENDPOINTS.SPEAK.LIST, { params: { languageCode } })
  return data
}

export async function getSpeakSession(code: string, languageCode = 'ja'): Promise<SpeakSessionView> {
  const { data } = await client.get<SpeakSessionView>(API_ENDPOINTS.SPEAK.GET_BY_CODE(code), { params: { languageCode } })
  return data
}

export async function completeSpeakSession(code: string, input: SpeakCompleteInput, languageCode = 'ja'): Promise<void> {
  await client.post(API_ENDPOINTS.SPEAK.COMPLETE(code), input, { params: { languageCode } })
}
