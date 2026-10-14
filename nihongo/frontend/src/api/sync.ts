import type { SubmitAnswerInput, SyncAction, SyncResult } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function pushMutations(deviceId: string, mutations: SubmitAnswerInput[], actions: SyncAction[] = []): Promise<SyncResult> {
  const { data } = await client.post<SyncResult>(API_ENDPOINTS.SYNC.MUTATIONS, { deviceId, mutations, ...(actions.length > 0 ? { actions } : {}) })
  return data
}
