import type { AddFriendInput, FriendSettings, FriendsResponse, UpdateFriendSettingsInput } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function getFriends(): Promise<FriendsResponse> {
  const { data } = await client.get<FriendsResponse>(API_ENDPOINTS.FRIENDS.LIST)
  return data
}

export async function updateFriendSettings(input: UpdateFriendSettingsInput): Promise<FriendSettings> {
  const { data } = await client.patch<FriendSettings>(API_ENDPOINTS.FRIENDS.SETTINGS, input)
  return data
}

export async function rotateFriendCode(): Promise<FriendSettings> {
  const { data } = await client.post<FriendSettings>(API_ENDPOINTS.FRIENDS.ROTATE_CODE)
  return data
}

export async function addFriend(input: AddFriendInput): Promise<{ displayName: string, status: 'pending' | 'accepted' }> {
  const { data } = await client.post<{ displayName: string, status: 'pending' | 'accepted' }>(API_ENDPOINTS.FRIENDS.REQUESTS, input)
  return data
}

export async function acceptFriend(id: string): Promise<void> {
  await client.post(API_ENDPOINTS.FRIENDS.ACCEPT(id))
}

export async function removeFriend(id: string): Promise<void> {
  await client.delete(API_ENDPOINTS.FRIENDS.REMOVE(id))
}
