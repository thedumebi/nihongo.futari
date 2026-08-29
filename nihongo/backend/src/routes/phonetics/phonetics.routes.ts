import { z } from '@hono/zod-openapi'
import { HttpStatusCodes, PHONETIC_ROUTES } from '@nihongo/shared/constants'
import { createPublicRoute, ErrorSchema, jsonContent } from '@nihongo/shared/openapi'
import { phoneticSeriesListSchema, phoneticSeriesViewSchema } from '@nihongo/shared/types'

const tags = ['Sound series']
const langQuery = z.object({
  languageCode: z.string().min(2).default('ja'),
  minMembers: z.coerce.number().int().min(2).max(50).default(2)
})

export const list = createPublicRoute({
  tags,
  path: PHONETIC_ROUTES.LIST,
  method: 'get',
  summary: 'Phonetic (sound) series',
  description: 'Components that predict an on-reading, most reliable first.',
  request: { query: langQuery },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(phoneticSeriesListSchema, 'Series')
  }
})
export type ListRoute = typeof list

export const getByComponent = createPublicRoute({
  tags,
  path: PHONETIC_ROUTES.GET_BY_COMPONENT,
  method: 'get',
  summary: 'One series and its members',
  description: 'Exceptions are included and flagged — a rule without them is a half-truth.',
  request: {
    params: z.object({ component: z.string().min(1) }),
    query: langQuery.pick({ languageCode: true })
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(phoneticSeriesViewSchema, 'The series'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such series')
  }
})
export type GetByComponentRoute = typeof getByComponent
