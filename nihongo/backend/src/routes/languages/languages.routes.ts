import { HttpStatusCodes, LANGUAGE_ROUTES } from '@nihongo/shared/constants'
import { createPublicRoute, jsonContent } from '@nihongo/shared/openapi'
import { languageListResponseSchema } from '@nihongo/shared/types'

const tags = ['Languages']

export const list = createPublicRoute({
  tags,
  path: LANGUAGE_ROUTES.LIST,
  method: 'get',
  summary: 'List studiable languages',
  responses: {
    [HttpStatusCodes.OK]: jsonContent(languageListResponseSchema, 'Active languages with their levels')
  }
})
export type ListRoute = typeof list
