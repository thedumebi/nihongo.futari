import type { RecallSession } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

/** A hands-free Recall session over the words this learner is shaky on. */
export async function getRecall(languageCode = 'ja', size = 12): Promise<RecallSession> {
  const { data } = await client.get<RecallSession>(API_ENDPOINTS.RECALL.GET, { params: { languageCode, size } })
  return data
}
