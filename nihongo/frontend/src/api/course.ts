import type { CourseResponse } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export type { CourseResponse }

export async function getCourse(languageCode = 'ja'): Promise<CourseResponse> {
  const { data } = await client.get<CourseResponse>(API_ENDPOINTS.STUDY.COURSE, { params: { languageCode } })
  return data
}
