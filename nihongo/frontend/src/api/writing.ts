import type { WritingCharacter, WritingQueue } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export interface WritingQueueParams {
  kind: 'kana' | 'kanji'
  script?: 'hiragana' | 'katakana'
  limit?: number
  languageCode?: string
}

export async function getQueue(params: WritingQueueParams): Promise<WritingQueue> {
  const { data } = await client.get<WritingQueue>(API_ENDPOINTS.WRITING.QUEUE, {
    params: { languageCode: 'ja', limit: 50, ...params }
  })
  return data
}

export async function getCharacter(character: string, languageCode = 'ja'): Promise<WritingCharacter> {
  const { data } = await client.get<WritingCharacter>(
    API_ENDPOINTS.WRITING.GET_BY_CHARACTER(character),
    { params: { languageCode } }
  )
  return data
}
