import type { WordDetail } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function getWord(id: string, languageCode = 'ja'): Promise<WordDetail> {
  const { data } = await client.get<WordDetail>(API_ENDPOINTS.WORDS.GET_BY_ID(id), {
    params: { languageCode }
  })
  return data
}
