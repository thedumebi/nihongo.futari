import type { SubmitAnswerInput, SyncResult } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function pushMutations(deviceId: string, mutations: SubmitAnswerInput[]): Promise<SyncResult> {
  const { data } = await client.post<SyncResult>(API_ENDPOINTS.SYNC.MUTATIONS, { deviceId, mutations })
  return data
}
