import type { WordDetail, WordPitch, WordPitchesResponse } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function getWord(id: string, languageCode = 'ja'): Promise<WordDetail> {
  const { data } = await client.get<WordDetail>(API_ENDPOINTS.WORDS.GET_BY_ID(id), {
    params: { languageCode }
  })
  return data
}

/** Pitch accent for several words at once, by id — words with none are absent. */
export async function getWordPitches(ids: string[]): Promise<Record<string, WordPitch>> {
  if (ids.length === 0)
    return {}
  const { data } = await client.get<WordPitchesResponse>(API_ENDPOINTS.WORDS.PITCH, { params: { ids: ids.join(',') } })
  return data.pitches
}
