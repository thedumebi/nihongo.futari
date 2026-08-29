import type { KanjiDetail, SearchResponse } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function search(q: string, limit = 30, languageCode = 'ja'): Promise<SearchResponse> {
  const { data } = await client.get<SearchResponse>(API_ENDPOINTS.DICTIONARY.SEARCH, {
    params: { q, limit, languageCode }
  })
  return data
}

export async function getKanji(character: string, languageCode = 'ja'): Promise<KanjiDetail> {
  const { data } = await client.get<KanjiDetail>(
    API_ENDPOINTS.KANJI.GET_BY_CHARACTER(character),
    { params: { languageCode } }
  )
  return data
}
