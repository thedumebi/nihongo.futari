import { HttpStatusCodes, RECALL_ROUTES } from '@nihongo/shared/constants'
import { createSecuredRoute, ErrorSchema, jsonContent } from '@nihongo/shared/openapi'
import { recallQuerySchema, recallSessionSchema } from '@nihongo/shared/types'

import authMiddleware from '@/middlewares/auth.js'

const tags = ['Recall']

export const get = createSecuredRoute({
  tags,
  path: RECALL_ROUTES.GET,
  method: 'get',
  summary: 'A hands-free Recall session over the words this learner is shaky on',
  description: 'Learning, ghost and recently missed words, plus missed Speak prompts, in the order to ask them. Writes nothing.',
  middleware: [authMiddleware],
  request: { query: recallQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(recallSessionSchema, 'The session'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such language')
  }
})
export type GetRoute = typeof get
