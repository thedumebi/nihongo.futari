import type {
  AnswerResult,
  LessonSeenResult,
  SaveWordResult,
  StudyDecksResponse,
  StudyQueueQuery,
  StudyQueueResponse,
  SubmitAnswerInput,
  WordStatus,
  WordStatuses
} from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function getDecks(languageCode = 'ja', level?: string): Promise<StudyDecksResponse> {
  const { data } = await client.get<StudyDecksResponse>(API_ENDPOINTS.STUDY.DECKS, { params: { languageCode, ...(level ? { level } : {}) } })
  return data
}

export async function getQueue(
  params: Partial<StudyQueueQuery> = {}
): Promise<StudyQueueResponse> {
  const { data } = await client.get<StudyQueueResponse>(API_ENDPOINTS.STUDY.QUEUE, { params })
  return data
}

export async function submitAnswer(input: SubmitAnswerInput): Promise<AnswerResult> {
  const { data } = await client.post<AnswerResult>(API_ENDPOINTS.STUDY.ANSWER, input)
  return data
}

/**
 * Record that a lesson has been read.
 *
 * Fire and forget at the call sites: failing to record a read lesson costs the
 * reader one repeated explanation, which is not worth interrupting a study
 * session over.
 */
export async function markLessonSeen(studyItemId: string): Promise<LessonSeenResult> {
  const { data } = await client.post<LessonSeenResult>(API_ENDPOINTS.STUDY.LESSON_SEEN, { studyItemId })
  return data
}

/** Put a word met while reading into review. `added` is false if it already was. */
export async function saveWord(wordId: string): Promise<SaveWordResult> {
  const { data } = await client.post<SaveWordResult>(API_ENDPOINTS.STUDY.SAVE_WORD, { wordId })
  return data
}

/** Where a word stands in this learner's reviews. */
export async function getWordStatuses(wordIds: string[]): Promise<WordStatuses> {
  const { data } = await client.get<WordStatuses>(API_ENDPOINTS.STUDY.WORD_STATUSES, { params: { ids: wordIds.join(',') } })
  return data
}

export async function getWordStatus(wordId: string): Promise<WordStatus> {
  const { data } = await client.get<WordStatus>(API_ENDPOINTS.STUDY.WORD_STATUS(wordId))
  return data
}

/** A stage celebration has been shown, so the server stops offering it. */
export async function markCelebrationSeen(languageCode: string, level: string, to: number): Promise<void> {
  await client.post(API_ENDPOINTS.STUDY.CELEBRATION_SEEN, { languageCode, level, to })
}
