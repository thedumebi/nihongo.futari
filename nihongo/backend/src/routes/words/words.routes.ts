import { z } from '@hono/zod-openapi'
import { HttpStatusCodes, WORD_ROUTES } from '@nihongo/shared/constants'
import { createPublicRoute, ErrorSchema, jsonContent } from '@nihongo/shared/openapi'
import { wordDetailSchema } from '@nihongo/shared/types'

const tags = ['Words']

export const getById = createPublicRoute({
  tags,
  path: WORD_ROUTES.GET_BY_ID,
  method: 'get',
  summary: 'Everything known about one word',
  description: 'Senses, pitch accent, the kanji it uses, sourced etymology, and example sentences.',
  request: {
    params: z.object({ id: z.string().min(1) }),
    query: z.object({ languageCode: z.string().min(2).default('ja') })
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(wordDetailSchema, 'The word'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such word')
  }
})
export type GetByIdRoute = typeof getById
