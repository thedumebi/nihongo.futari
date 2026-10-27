import type { StudySettings, StudySettingsPatch } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

let inflight: Promise<StudySettings> | null = null

/**
 * The learner's study settings, fresh from the server. Callers asking at the
 * same moment (the level picker, furigana, the page itself) share one
 * request; a call after it has answered asks again.
 */
export async function getStudySettings(): Promise<StudySettings> {
  inflight ??= client.get<StudySettings>(API_ENDPOINTS.USERS.SETTINGS)
    .then(({ data }) => data)
    .finally(() => {
      inflight = null
    })
  return inflight
}

/** Send only the setting that changed — a full object would reset the others. */
export async function updateStudySettings(patch: StudySettingsPatch): Promise<StudySettings> {
  const { data } = await client.patch<StudySettings>(API_ENDPOINTS.USERS.UPDATE_SETTINGS, patch)
  return data
}
