import type { LanguageListResponse } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function listLanguages(): Promise<LanguageListResponse> {
  const { data } = await client.get<LanguageListResponse>(API_ENDPOINTS.LANGUAGES.LIST)
  return data
}
