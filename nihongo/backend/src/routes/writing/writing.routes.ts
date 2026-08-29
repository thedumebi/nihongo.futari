import { z } from '@hono/zod-openapi'
import { HttpStatusCodes, WRITING_ROUTES } from '@nihongo/shared/constants'
import { createPublicRoute, ErrorSchema, jsonContent } from '@nihongo/shared/openapi'
import { writingCharacterSchema, writingQueueSchema } from '@nihongo/shared/types'

const tags = ['Writing']

export const queue = createPublicRoute({
  tags,
  path: WRITING_ROUTES.QUEUE,
  method: 'get',
  summary: 'Characters to practise writing',
  description: 'In teaching order, and only characters that have reference strokes.',
  request: {
    query: z.object({
      languageCode: z.string().min(2).default('ja'),
      kind: z.enum(['kana', 'kanji']).default('kana'),
      script: z.enum(['hiragana', 'katakana']).optional(),
      limit: z.coerce.number().int().min(1).max(200).default(50)
    })
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(writingQueueSchema, 'Practice queue')
  }
})
export type QueueRoute = typeof queue

export const getByCharacter = createPublicRoute({
  tags,
  path: WRITING_ROUTES.GET_BY_CHARACTER,
  method: 'get',
  summary: 'Reference strokes for one character',
  description: 'KanjiVG stroke paths in a 109x109 box, in stroke order.',
  request: {
    params: z.object({ character: z.string().min(1) }),
    query: z.object({ languageCode: z.string().min(2).default('ja') })
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(writingCharacterSchema, 'The character'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No stroke data')
  }
})
export type GetByCharacterRoute = typeof getByCharacter
