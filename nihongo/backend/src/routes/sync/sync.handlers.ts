import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { applyMutations } from '@/services/sync.service.js'

import type { MutationsRoute } from './sync.routes.js'

export const mutations: AppRouteHandler<MutationsRoute> = async (c) => {
  const user = c.get('user')!
  return c.json(await applyMutations(user.id, c.req.valid('json')), HttpStatusCodes.OK)
}
