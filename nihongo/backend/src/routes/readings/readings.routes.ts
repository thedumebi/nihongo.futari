import { z } from '@hono/zod-openapi'
import { HttpStatusCodes, READING_ROUTES } from '@nihongo/shared/constants'
import { createSecuredRoute, ErrorSchema, jsonContent } from '@nihongo/shared/openapi'
import { readingListQuerySchema, readingListResponseSchema, readingViewSchema } from '@nihongo/shared/types'

import authMiddleware from '@/middlewares/auth.js'

const tags = ['Readings']

export const list = createSecuredRoute({
  tags,
  path: READING_ROUTES.LIST,
  method: 'get',
  summary: 'Speeches to read aloud',
  description: 'Published speeches, easiest level first. Each belongs to exactly one level.',
  middleware: [authMiddleware],
  request: { query: readingListQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(readingListResponseSchema, 'Available speeches')
  }
})
export type ListRoute = typeof list

export const getByCode = createSecuredRoute({
  tags,
  path: READING_ROUTES.GET_BY_CODE,
  method: 'get',
  summary: 'One speech, every line cut into tappable words',
  middleware: [authMiddleware],
  request: {
    params: z.object({ code: z.string() }),
    query: readingListQuerySchema.pick({ languageCode: true })
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(readingViewSchema, 'The speech'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such speech')
  }
})
export type GetByCodeRoute = typeof getByCode
