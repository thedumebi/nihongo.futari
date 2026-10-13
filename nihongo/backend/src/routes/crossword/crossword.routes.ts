import { z } from '@hono/zod-openapi'
import { CROSSWORD_ROUTES, HttpStatusCodes } from '@nihongo/shared/constants'
import { createSecuredRoute, ErrorSchema, jsonContent, jsonContentRequired } from '@nihongo/shared/openapi'
import { crosswordPuzzleSchema, crosswordQuerySchema, crosswordResultInputSchema, crosswordResultResponseSchema } from '@nihongo/shared/types'

import authMiddleware from '@/middlewares/auth.js'
import { writeLimiter } from '@/middlewares/rate-limit.js'

const tags = ['Crossword']

export const get = createSecuredRoute({
  tags,
  path: CROSSWORD_ROUTES.GET,
  method: 'get',
  summary: 'A kana crossword: the puzzle of the day, or a new one from the words chosen',
  description: 'Sent whole, answers included — the phone checks each kana as it is typed. `source=known` with too few known words answers 422 with how many there are.',
  middleware: [authMiddleware],
  request: { query: crosswordQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(crosswordPuzzleSchema, 'The puzzle'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such level'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      z.object({ message: z.string(), knownCount: z.number().int().optional() }),
      'Not enough words to build a puzzle from'
    )
  }
})
export type GetRoute = typeof get

export const result = createSecuredRoute({
  tags,
  path: CROSSWORD_ROUTES.RESULT,
  method: 'post',
  summary: 'Record a finished crossword',
  description: 'Keeps the best time and replaces the last one; retrying the request changes nothing.',
  middleware: [authMiddleware, writeLimiter],
  request: {
    query: crosswordQuerySchema.pick({ languageCode: true }),
    body: jsonContentRequired(crosswordResultInputSchema, 'How it went')
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(crosswordResultResponseSchema, 'Recorded'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such level')
  }
})
export type ResultRoute = typeof result
