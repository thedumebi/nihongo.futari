import { z } from '@hono/zod-openapi'
import { HttpStatusCodes, STUDY_ROUTES } from '@nihongo/shared/constants'
import { createSecuredRoute, ErrorSchema, jsonContent, jsonContentRequired } from '@nihongo/shared/openapi'
import {
  answerResultSchema,
  courseResponseSchema,
  dueListQuerySchema,
  dueListResponseSchema,
  lessonSeenResultSchema,
  lessonSeenSchema,
  saveWordResultSchema,
  saveWordSchema,
  studyDecksResponseSchema,
  studyQueueQuerySchema,
  studyQueueResponseSchema,
  submitAnswerSchema,
  wordStatusesQuerySchema,
  wordStatusesSchema,
  wordStatusSchema
} from '@nihongo/shared/types'

import authMiddleware from '@/middlewares/auth.js'
import { writeLimiter } from '@/middlewares/rate-limit.js'

const tags = ['Study']

export const decks = createSecuredRoute({
  tags,
  path: STUDY_ROUTES.DECKS,
  method: 'get',
  summary: 'Decks the learner can choose between',
  description:
    'Broad kinds (kana, vocabulary) and topical units (hiragana, at a restaurant) in one list, '
    + 'each with per-user due and unseen counts.',
  middleware: [authMiddleware],
  request: { query: studyQueueQuerySchema.pick({ languageCode: true, level: true }) },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(studyDecksResponseSchema, 'Available decks')
  }
})
export type DecksRoute = typeof decks

export const queue = createSecuredRoute({
  tags,
  path: STUDY_ROUTES.QUEUE,
  method: 'get',
  summary: 'Get the review queue',
  description:
    'Due cards first, oldest due first. Pass horizonDays > 0 to pull the next N days forward for an offline bundle.',
  middleware: [authMiddleware],
  request: { query: studyQueueQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(studyQueueResponseSchema, 'The review queue')
  }
})
export type QueueRoute = typeof queue

export const course = createSecuredRoute({
  tags,
  path: STUDY_ROUTES.COURSE,
  method: 'get',
  summary: 'The course, as an ordered path of stages',
  description:
    'Every level with its stages, what each contains, and how far through them the learner is. '
    + 'The counterpart to the deck picker: that filters a corpus, this shows a route through it.',
  middleware: [authMiddleware],
  request: { query: studyQueueQuerySchema.pick({ languageCode: true }) },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(courseResponseSchema, 'The course')
  }
})
export type CourseRoute = typeof course

export const due = createSecuredRoute({
  tags,
  path: STUDY_ROUTES.DUE,
  method: 'get',
  summary: 'List what is due, without starting a session',
  description:
    'Every card the scheduler says is ready, named and dated, oldest first. '
    + 'A list to read rather than a queue to answer.',
  middleware: [authMiddleware],
  request: { query: dueListQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(dueListResponseSchema, 'Cards due now')
  }
})
export type DueRoute = typeof due

export const answer = createSecuredRoute({
  tags,
  path: STUDY_ROUTES.ANSWER,
  method: 'post',
  summary: 'Submit one answer',
  description:
    'Idempotent on the client-minted UUIDv7 `id`, so a retried or duplicated flush is a no-op. '
    + 'A review that lands before the card\'s last review triggers a full replay of that card\'s history.',
  middleware: [authMiddleware, writeLimiter],
  request: { body: jsonContentRequired(submitAnswerSchema, 'The answer') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(answerResultSchema, 'Updated card state'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'Unknown facet')
  }
})
export type AnswerRoute = typeof answer

export const lessonSeen = createSecuredRoute({
  tags,
  path: STUDY_ROUTES.LESSON_SEEN,
  method: 'post',
  summary: 'Record that a lesson has been read',
  description:
    'Idempotent on (user, item): `firstSeenAt` records when the lesson was FIRST read and is never moved. '
    + 'A lesson read here is not shown again as the introduction to its card.',
  middleware: [authMiddleware, writeLimiter],
  request: { body: jsonContentRequired(lessonSeenSchema, 'The lesson that was read') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(lessonSeenResultSchema, 'When it was first read'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'Unknown study item')
  }
})
export type LessonSeenRoute = typeof lessonSeen

export const saveWord = createSecuredRoute({
  tags,
  path: STUDY_ROUTES.SAVE_WORD,
  method: 'post',
  summary: 'Put a word met while reading into review',
  description:
    'Idempotent: a word that already has a card is left alone and `added` is false. '
    + 'No review is logged — tapping a word is not evidence of knowing it.',
  middleware: [authMiddleware, writeLimiter],
  request: { body: jsonContentRequired(saveWordSchema, 'The word to review') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(saveWordResultSchema, 'Whether a card was created'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No studiable item for this word')
  }
})
export type SaveWordRoute = typeof saveWord

export const wordStatus = createSecuredRoute({
  tags,
  path: STUDY_ROUTES.WORD_STATUS,
  method: 'get',
  summary: 'Where a word stands in this learner\'s reviews',
  middleware: [authMiddleware],
  request: { params: z.object({ wordId: z.string().min(1) }) },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(wordStatusSchema, 'In review or not, when due')
  }
})
export type WordStatusRoute = typeof wordStatus

export const wordStatuses = createSecuredRoute({
  tags,
  path: STUDY_ROUTES.WORD_STATUSES,
  method: 'get',
  summary: 'Several words at once: reviewable, and already in review',
  middleware: [authMiddleware],
  request: { query: wordStatusesQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(wordStatusesSchema, 'By word id')
  }
})
export type WordStatusesRoute = typeof wordStatuses
