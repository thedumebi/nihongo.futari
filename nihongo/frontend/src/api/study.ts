import type { AnswerResult, StudyDecksResponse, StudyQueueResponse, SubmitAnswerInput } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function getDecks(languageCode = 'ja', level?: string): Promise<StudyDecksResponse> {
  const { data } = await client.get<StudyDecksResponse>(API_ENDPOINTS.STUDY.DECKS, { params: { languageCode, ...(level ? { level } : {}) } })
  return data
}

export async function getQueue(
  params: { languageCode?: string, limit?: number, kind?: string, unit?: string, mode?: 'due' | 'new' | 'ghost' | 'mixed', level?: string } = {}
): Promise<StudyQueueResponse> {
  const { data } = await client.get<StudyQueueResponse>(API_ENDPOINTS.STUDY.QUEUE, { params })
  return data
}

export async function submitAnswer(input: SubmitAnswerInput): Promise<AnswerResult> {
  const { data } = await client.post<AnswerResult>(API_ENDPOINTS.STUDY.ANSWER, input)
  return data
}
