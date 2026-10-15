import { z } from '@hono/zod-openapi'
import { ACTIVITY_ROUTES, HttpStatusCodes } from '@nihongo/shared/constants'
import { createSecuredRoute, ErrorSchema, jsonContent, jsonContentRequired } from '@nihongo/shared/openapi'
import { recordActivityResultSchema, recordActivitySchema } from '@nihongo/shared/types'

import authMiddleware from '@/middlewares/auth.js'
import { writeLimiter } from '@/middlewares/rate-limit.js'

const tags = ['Activities']

export const record = createSecuredRoute({
  tags,
  path: ACTIVITY_ROUTES.RECORD,
  method: 'post',
  summary: 'Record a finished activity: a conversation, a speech, a game',
  description: 'Counts toward the streak and earns XP once per thing per study day. Retrying changes nothing.',
  middleware: [authMiddleware, writeLimiter],
  request: {
    query: z.object({ languageCode: z.string().min(2).default('ja') }),
    body: jsonContentRequired(recordActivitySchema, 'What was done')
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(recordActivityResultSchema, 'Recorded, or already counted today'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such language')
  }
})
export type RecordRoute = typeof record
