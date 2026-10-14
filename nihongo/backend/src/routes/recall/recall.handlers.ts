import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { getRecallSession } from '@/services/recall.service.js'

import type { GetRoute } from './recall.routes.js'

export const get: AppRouteHandler<GetRoute> = async (c) => {
  const user = c.get('user')!
  const { languageCode, size } = c.req.valid('query')
  const session = await getRecallSession(user.id, languageCode, size)
  if (!session)
    return c.json({ message: 'No such language' }, HttpStatusCodes.NOT_FOUND)
  return c.json(session, HttpStatusCodes.OK)
}
