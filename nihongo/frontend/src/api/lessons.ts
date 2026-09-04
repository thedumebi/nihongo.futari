import type {
  CompleteLessonInput,
  CompleteLessonResult,
  LessonDetail,
  LessonListResponse
} from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function getLessons(languageCode = 'ja'): Promise<LessonListResponse> {
  const { data } = await client.get<LessonListResponse>(API_ENDPOINTS.LESSONS.LIST, { params: { languageCode } })
  return data
}

export async function getLesson(slug: string, languageCode = 'ja'): Promise<LessonDetail> {
  const { data } = await client.get<LessonDetail>(API_ENDPOINTS.LESSONS.GET(slug), { params: { languageCode } })
  return data
}

export async function completeLesson(
  slug: string,
  input: CompleteLessonInput,
  languageCode = 'ja'
): Promise<CompleteLessonResult> {
  const { data } = await client.post<CompleteLessonResult>(
    API_ENDPOINTS.LESSONS.COMPLETE(slug),
    input,
    { params: { languageCode } }
  )
  return data
}
