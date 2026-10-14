import { HttpStatusCodes, TODAY_ROUTES } from '@nihongo/shared/constants'
import { createSecuredRoute, ErrorSchema, jsonContent } from '@nihongo/shared/openapi'
import { todayQuerySchema, todaySchema } from '@nihongo/shared/types'

import authMiddleware from '@/middlewares/auth.js'

const tags = ['Today']

export const get = createSecuredRoute({
  tags,
  path: TODAY_ROUTES.GET,
  method: 'get',
  summary: 'What to do now: reviews due, the next lesson and Speak session, the streak',
  middleware: [authMiddleware],
  request: { query: todayQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(todaySchema, 'Today'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such language')
  }
})
export type GetRoute = typeof get
