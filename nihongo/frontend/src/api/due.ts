import type { DueListResponse } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export type { DueListResponse }

export async function getDue(
  params: { languageCode?: string, limit?: number, offset?: number, kind?: string } = {}
): Promise<DueListResponse> {
  const { data } = await client.get<DueListResponse>(API_ENDPOINTS.STUDY.DUE, { params })
  return data
}
