import type { PhoneticSeriesListResponse, PhoneticSeriesView } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function listSeries(minMembers = 3, languageCode = 'ja'): Promise<PhoneticSeriesListResponse> {
  const { data } = await client.get<PhoneticSeriesListResponse>(API_ENDPOINTS.PHONETICS.LIST, {
    params: { languageCode, minMembers }
  })
  return data
}

export async function getSeries(component: string, languageCode = 'ja'): Promise<PhoneticSeriesView> {
  const { data } = await client.get<PhoneticSeriesView>(
    API_ENDPOINTS.PHONETICS.GET_BY_COMPONENT(component),
    { params: { languageCode } }
  )
  return data
}
