import type { Today } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

/** What to do now: reviews due, the next lesson and Speak session, the streak. */
export async function getToday(languageCode = 'ja'): Promise<Today> {
  const { data } = await client.get<Today>(API_ENDPOINTS.TODAY.GET, { params: { languageCode } })
  return data
}
