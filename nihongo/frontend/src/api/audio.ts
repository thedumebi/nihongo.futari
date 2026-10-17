import type { AudioStatus } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

/** Admin: sentences and words waiting for a recording. */
export async function getAudioStatus(): Promise<AudioStatus> {
  const { data } = await client.get<AudioStatus>(API_ENDPOINTS.AUDIO.STATUS)
  return data
}
