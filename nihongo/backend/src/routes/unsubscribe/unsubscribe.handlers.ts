import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { unsubscribeProductUpdates } from '@/services/email-campaigns.service.js'

import type { ProductUpdatesRoute } from './unsubscribe.routes.js'

export const productUpdates: AppRouteHandler<ProductUpdatesRoute> = async (c) => {
  const { u, t } = c.req.valid('query')
  if (!await unsubscribeProductUpdates(u, t))
    return c.json({ message: 'That unsubscribe link is not valid' }, HttpStatusCodes.BAD_REQUEST)
  return c.json({ message: 'You will not get product updates by email any more' }, HttpStatusCodes.OK)
}
