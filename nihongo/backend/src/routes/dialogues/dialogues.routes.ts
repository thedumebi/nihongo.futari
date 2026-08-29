import { z } from '@hono/zod-openapi'
import { DIALOGUE_ROUTES, HttpStatusCodes } from '@nihongo/shared/constants'
import { createSecuredRoute, ErrorSchema, jsonContent } from '@nihongo/shared/openapi'
import { dialogueListResponseSchema, dialogueViewSchema, studyQueueQuerySchema } from '@nihongo/shared/types'

import authMiddleware from '@/middlewares/auth.js'

const tags = ['Dialogues']

export const list = createSecuredRoute({
  tags,
  path: DIALOGUE_ROUTES.LIST,
  method: 'get',
  summary: 'Conversations available to practise',
  description:
    'Scripted dialogues, grouped by the scenario they belong to. Also scheduled like any '
    + 'other study item, but a conversation is not a flashcard and waiting for the queue to '
    + 'offer one is the wrong way to find it.',
  middleware: [authMiddleware],
  request: { query: studyQueueQuerySchema.pick({ languageCode: true }) },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(dialogueListResponseSchema, 'Available conversations')
  }
})
export type ListRoute = typeof list

export const getByCode = createSecuredRoute({
  tags,
  path: DIALOGUE_ROUTES.GET_BY_CODE,
  method: 'get',
  summary: 'One conversation, with every turn and reply',
  middleware: [authMiddleware],
  request: {
    params: z.object({ code: z.string() }),
    query: studyQueueQuerySchema.pick({ languageCode: true })
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(dialogueViewSchema, 'The conversation'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such conversation')
  }
})
export type GetByCodeRoute = typeof getByCode
