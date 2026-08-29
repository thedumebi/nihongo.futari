import { ATTRIBUTION_ROUTES, HttpStatusCodes } from '@nihongo/shared/constants'
import { createPublicRoute, jsonContent } from '@nihongo/shared/openapi'
import { attributionResponseSchema } from '@nihongo/shared/types'

const tags = ['Attribution']

export const list = createPublicRoute({
  tags,
  path: ATTRIBUTION_ROUTES.LIST,
  method: 'get',
  summary: 'Data sources and their licences',
  description: 'Public and unauthenticated — the CC BY-SA attribution notice.',
  responses: {
    [HttpStatusCodes.OK]: jsonContent(attributionResponseSchema, 'Sources')
  }
})
export type ListRoute = typeof list
