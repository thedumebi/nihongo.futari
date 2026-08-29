import { HttpStatusCodes, SYNC_ROUTES } from '@nihongo/shared/constants'
import { createSecuredRoute, jsonContent, jsonContentRequired } from '@nihongo/shared/openapi'
import { syncMutationsSchema, syncResultSchema } from '@nihongo/shared/types'

import authMiddleware from '@/middlewares/auth.js'

const tags = ['Sync']

export const mutations = createSecuredRoute({
  tags,
  path: SYNC_ROUTES.MUTATIONS,
  method: 'post',
  summary: 'Flush queued offline reviews',
  description:
    'Idempotent on each mutation\'s client-minted UUIDv7, so a retried or duplicated flush costs nothing. '
    + 'A review that lands before a card\'s last review triggers a full replay of that card. '
    + 'Progress aggregates are recomputed once for the batch, not per mutation.',
  middleware: [authMiddleware],
  request: { body: jsonContentRequired(syncMutationsSchema, 'Queued mutations, oldest first') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(syncResultSchema, 'Per-mutation outcome and refreshed card state')
  }
})
export type MutationsRoute = typeof mutations
