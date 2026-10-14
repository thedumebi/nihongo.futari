import type { StudySettings, StudySettingsPatch } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function getStudySettings(): Promise<StudySettings> {
  const { data } = await client.get<StudySettings>(API_ENDPOINTS.USERS.SETTINGS)
  return data
}

/** Send only the setting that changed — a full object would reset the others. */
export async function updateStudySettings(patch: StudySettingsPatch): Promise<StudySettings> {
  const { data } = await client.patch<StudySettings>(API_ENDPOINTS.USERS.UPDATE_SETTINGS, patch)
  return data
}
