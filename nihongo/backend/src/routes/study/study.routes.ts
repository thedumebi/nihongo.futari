import { HttpStatusCodes, STUDY_ROUTES } from '@nihongo/shared/constants'
import { createSecuredRoute, ErrorSchema, jsonContent, jsonContentRequired } from '@nihongo/shared/openapi'
import {
  answerResultSchema,
  courseResponseSchema,
  dueListQuerySchema,
  dueListResponseSchema,
  studyDecksResponseSchema,
  studyQueueQuerySchema,
  studyQueueResponseSchema,
  submitAnswerSchema
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
