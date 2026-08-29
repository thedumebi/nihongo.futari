import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { listAttribution } from '@/services/attribution.service.js'

import type { ListRoute } from './attribution.routes.js'

export const list: AppRouteHandler<ListRoute> = async (c) => {
  return c.json(await listAttribution(), HttpStatusCodes.OK)
}
