import { z } from '@hono/zod-openapi'
import { DICTIONARY_ROUTES, HttpStatusCodes } from '@nihongo/shared/constants'
import { createPublicRoute, jsonContent } from '@nihongo/shared/openapi'
import { searchResponseSchema } from '@nihongo/shared/types'

const tags = ['Dictionary']

export const searchRoute = createPublicRoute({
  tags,
  path: DICTIONARY_ROUTES.SEARCH,
  method: 'get',
  summary: 'Search words, kanji and grammar',
  description: 'One box across all three. Exact matches rank first, then trigram similarity.',
  request: {
    query: z.object({
      q: z.string().min(1),
      languageCode: z.string().min(2).default('ja'),
      limit: z.coerce.number().int().min(1).max(100).default(30)
    })
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(searchResponseSchema, 'Results')
  }
})
export type SearchRoute = typeof searchRoute
