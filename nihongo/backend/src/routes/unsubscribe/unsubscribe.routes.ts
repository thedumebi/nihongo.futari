import { HttpStatusCodes, UNSUBSCRIBE_ROUTES } from '@nihongo/shared/constants'
import { createPublicRoute, ErrorSchema, jsonContent } from '@nihongo/shared/openapi'
import { MessageResponseSchema, unsubscribeQuerySchema } from '@nihongo/shared/types'

import { strictLimiter } from '@/middlewares/rate-limit.js'

const tags = ['Unsubscribe']

/**
 * POST, no sign-in: the unsubscribe page posts here, and so do mail providers
 * acting on the List-Unsubscribe-Post header ("one-click" from the inbox).
 * The signed token in the query is the only authority needed.
 */
export const productUpdates = createPublicRoute({
  tags,
  path: UNSUBSCRIBE_ROUTES.PRODUCT_UPDATES,
  method: 'post',
  summary: 'Stop product-update emails, from the link or header in one',
  middleware: [strictLimiter],
  request: { query: unsubscribeQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(MessageResponseSchema, 'Unsubscribed'),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(ErrorSchema, 'Not a valid unsubscribe link')
  }
})
export type ProductUpdatesRoute = typeof productUpdates
