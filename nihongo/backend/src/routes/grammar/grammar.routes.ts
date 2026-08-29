import { z } from '@hono/zod-openapi'
import { GRAMMAR_ROUTES, HttpStatusCodes } from '@nihongo/shared/constants'
import { createPublicRoute, ErrorSchema, jsonContent } from '@nihongo/shared/openapi'
import { grammarListResponseSchema, grammarPointViewSchema, SlugParamSchema } from '@nihongo/shared/types'

const tags = ['Grammar']
const langQuery = z.object({ languageCode: z.string().min(2).default('ja') })

export const list = createPublicRoute({
  tags,
  path: GRAMMAR_ROUTES.LIST,
  method: 'get',
  summary: 'List grammar points',
  request: { query: langQuery },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(grammarListResponseSchema, 'Published grammar points')
  }
})
export type ListRoute = typeof list

export const getBySlug = createPublicRoute({
  tags,
  path: GRAMMAR_ROUTES.GET_BY_SLUG,
  method: 'get',
  summary: 'A grammar point, with formation, mistakes and sourced etymology',
  description: 'Only PUBLISHED etymology is returned; entries awaiting review are invisible.',
  request: { params: SlugParamSchema, query: langQuery },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(grammarPointViewSchema, 'The grammar point'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'Not found')
  }
})
export type GetBySlugRoute = typeof getBySlug
