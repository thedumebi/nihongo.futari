import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { getToday } from '@/services/today.service.js'

import type { GetRoute } from './today.routes.js'

export const get: AppRouteHandler<GetRoute> = async (c) => {
  const user = c.get('user')!
  const { languageCode, moreNew } = c.req.valid('query')
  const today = await getToday(user.id, languageCode, moreNew ?? 0)
  if (!today)
    return c.json({ message: 'No such language' }, HttpStatusCodes.NOT_FOUND)
  return c.json(today, HttpStatusCodes.OK)
}
