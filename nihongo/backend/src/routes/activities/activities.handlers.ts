import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { recordActivityFor } from '@/services/activities.service.js'

import type { RecordRoute } from './activities.routes.js'

export const record: AppRouteHandler<RecordRoute> = async (c) => {
  const user = c.get('user')!
  const result = await recordActivityFor(user.id, c.req.valid('query').languageCode, c.req.valid('json'))
  if (!result)
    return c.json({ message: 'No such language' }, HttpStatusCodes.NOT_FOUND)
  return c.json(result, HttpStatusCodes.OK)
}
