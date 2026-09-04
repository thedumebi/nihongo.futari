import { z } from '@hono/zod-openapi'
import { HttpStatusCodes, LESSONS_ROUTES } from '@nihongo/shared/constants'
import { createSecuredRoute, ErrorSchema, jsonContent, jsonContentRequired } from '@nihongo/shared/openapi'
import {
  completeLessonResultSchema,
  completeLessonSchema,
  lessonDetailSchema,
  lessonListResponseSchema
} from '@nihongo/shared/types'

import authMiddleware from '@/middlewares/auth.js'
import { writeLimiter } from '@/middlewares/rate-limit.js'

const tags = ['Lessons']

const languageQuery = z.object({ languageCode: z.string().min(2).default('ja') })

export const list = createSecuredRoute({
  tags,
  path: LESSONS_ROUTES.LIST,
  method: 'get',
  summary: 'Every lesson, by level',
  description:
    'One row per topic, grouped by curriculum unit where the level defines them. '
    + '`exampleCount` of zero means a short lesson — the explanation and a single question — '
    + 'which is most of N4-N1 until the sentences are authored.',
  middleware: [authMiddleware],
  request: { query: languageQuery },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(lessonListResponseSchema, 'Lessons by level')
  }
})
export type ListRoute = typeof list

export const get = createSecuredRoute({
  tags,
  path: LESSONS_ROUTES.GET,
  method: 'get',
  summary: 'One lesson: what to teach, and the questions on it',
  description:
    'Answers are included because a lesson grades where it is asked. That is deliberate: '
    + 'a lesson answer must never reach FSRS, since a question answered seconds after reading '
    + 'the explanation is not evidence of memory.',
  middleware: [authMiddleware],
  request: { params: z.object({ slug: z.string() }), query: languageQuery },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(lessonDetailSchema, 'The lesson'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such lesson')
  }
})
export type GetRoute = typeof get

export const complete = createSecuredRoute({
  tags,
  path: LESSONS_ROUTES.COMPLETE,
  method: 'post',
  summary: 'Finish a lesson',
  description:
    'Records the completion and the questions missed. Admits the topic to review — the queue '
    + 'will not offer a grammar item until its lesson has been opened. Writes no review history.',
  middleware: [authMiddleware, writeLimiter],
  request: {
    params: z.object({ slug: z.string() }),
    query: languageQuery,
    body: jsonContentRequired(completeLessonSchema, 'Score and what was missed')
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(completeLessonResultSchema, 'Recorded'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such lesson')
  }
})
export type CompleteRoute = typeof complete
