import type { GrammarListResponse, GrammarPointView } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function listGrammar(languageCode = 'ja'): Promise<GrammarListResponse> {
  const { data } = await client.get<GrammarListResponse>(API_ENDPOINTS.GRAMMAR.LIST, { params: { languageCode } })
  return data
}

export async function getGrammarPoint(slug: string, languageCode = 'ja'): Promise<GrammarPointView> {
  const { data } = await client.get<GrammarPointView>(API_ENDPOINTS.GRAMMAR.GET_BY_SLUG(slug), { params: { languageCode } })
  return data
}
