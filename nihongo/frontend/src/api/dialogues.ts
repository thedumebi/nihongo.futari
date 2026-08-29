import type { DialogueListResponse, DialogueView } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export type { DialogueListResponse, DialogueView }

export async function listDialogues(languageCode = 'ja'): Promise<DialogueListResponse> {
  const { data } = await client.get<DialogueListResponse>(API_ENDPOINTS.DIALOGUES.LIST, { params: { languageCode } })
  return data
}

export async function getDialogue(code: string, languageCode = 'ja'): Promise<DialogueView> {
  const { data } = await client.get<DialogueView>(API_ENDPOINTS.DIALOGUES.GET_BY_CODE(code), { params: { languageCode } })
  return data
}
