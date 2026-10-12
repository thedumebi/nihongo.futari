import { z } from '@hono/zod-openapi'
import { HttpStatusCodes, SPEAK_ROUTES } from '@nihongo/shared/constants'
import { createSecuredRoute, ErrorSchema, jsonContent, jsonContentRequired } from '@nihongo/shared/openapi'
import { MessageResponseSchema, speakCompleteSchema, speakListResponseSchema, speakQuerySchema, speakSessionViewSchema } from '@nihongo/shared/types'

import authMiddleware from '@/middlewares/auth.js'
import { writeLimiter } from '@/middlewares/rate-limit.js'

const tags = ['Speak']

export const list = createSecuredRoute({
  tags,
  path: SPEAK_ROUTES.LIST,
  method: 'get',
  summary: 'The Speak course, with this learner\'s progress',
  middleware: [authMiddleware],
  request: { query: speakQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(speakListResponseSchema, 'Sessions in course order')
  }
})
export type ListRoute = typeof list

export const complete = createSecuredRoute({
  tags,
  path: SPEAK_ROUTES.COMPLETE,
  method: 'post',
  summary: 'Record a finished run of a session',
  description: 'Replaces this learner\'s previous run of the session; retrying the request changes nothing.',
  middleware: [authMiddleware, writeLimiter],
  request: {
    params: z.object({ code: z.string() }),
    query: speakQuerySchema,
    body: jsonContentRequired(speakCompleteSchema, 'How the run went')
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(MessageResponseSchema, 'Recorded'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such session')
  }
})
export type CompleteRoute = typeof complete

export const getByCode = createSecuredRoute({
  tags,
  path: SPEAK_ROUTES.GET_BY_CODE,
  method: 'get',
  summary: 'One session: every step, its audio and the answers cut into tappable words',
  middleware: [authMiddleware],
  request: {
    params: z.object({ code: z.string() }),
    query: speakQuerySchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(speakSessionViewSchema, 'The session'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such session')
  }
})
export type GetByCodeRoute = typeof getByCode
