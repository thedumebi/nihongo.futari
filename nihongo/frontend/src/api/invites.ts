import type {
  CreateInviteInput,
  InviteListResponse,
  InviteResponse,
  ReserveInviteResponse,
  SignupModeResponse
} from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function getSignupMode(): Promise<SignupModeResponse> {
  const { data } = await client.get<SignupModeResponse>(API_ENDPOINTS.INVITES.SIGNUP_MODE)
  return data
}

export async function reserveInvite(code: string, email: string): Promise<ReserveInviteResponse> {
  const { data } = await client.post<ReserveInviteResponse>(
    API_ENDPOINTS.INVITES.RESERVE,
    { code, email },
    // A rejected code is an expected outcome, not an exception — let the caller
    // render the reason rather than throwing.
    { validateStatus: status => status === 200 || status === 400 }
  )
  return data
}

export async function listInvites(): Promise<InviteListResponse> {
  const { data } = await client.get<InviteListResponse>(API_ENDPOINTS.INVITES.LIST)
  return data
}

export async function createInvite(input: CreateInviteInput): Promise<InviteResponse> {
  const { data } = await client.post<InviteResponse>(API_ENDPOINTS.INVITES.CREATE, input)
  return data
}

export async function revokeInvite(id: string): Promise<void> {
  await client.post(API_ENDPOINTS.INVITES.REVOKE(id))
}
