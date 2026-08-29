import type { AttributionResponse } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function listAttribution(): Promise<AttributionResponse> {
  const { data } = await client.get<AttributionResponse>(API_ENDPOINTS.ATTRIBUTION.LIST)
  return data
}
