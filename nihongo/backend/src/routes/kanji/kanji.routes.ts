import { z } from '@hono/zod-openapi'
import { HttpStatusCodes, KANJI_ROUTES } from '@nihongo/shared/constants'
import { createPublicRoute, ErrorSchema, jsonContent } from '@nihongo/shared/openapi'
import { kanjiDetailSchema } from '@nihongo/shared/types'

const tags = ['Kanji']

export const getByCharacter = createPublicRoute({
  tags,
  path: KANJI_ROUTES.GET_BY_CHARACTER,
  method: 'get',
  summary: 'Everything known about one kanji',
  description: 'Readings, strokes, sound series, sourced etymology, and words that use it.',
  request: {
    params: z.object({ character: z.string().min(1) }),
    query: z.object({ languageCode: z.string().min(2).default('ja') })
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(kanjiDetailSchema, 'The kanji'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such kanji')
  }
})
export type GetByCharacterRoute = typeof getByCharacter
