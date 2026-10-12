import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { getReading, listReadings } from '@/services/readings.service.js'
import { isAdmin } from '@/services/users.service.js'

import type { GetByCodeRoute, ListRoute } from './readings.routes.js'

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { languageCode, level } = c.req.valid('query')
  return c.json(await listReadings(languageCode, level), HttpStatusCodes.OK)
}

export const getByCode: AppRouteHandler<GetByCodeRoute> = async (c) => {
  const { code } = c.req.valid('param')
  const { languageCode } = c.req.valid('query')
  const user = c.get('user')!
  // An admin can open a draft from the review queue to read it as a learner will.
  const reading = await getReading(languageCode, code, { includeDrafts: await isAdmin(user.id) })
  if (!reading)
    return c.json({ message: 'No such speech' }, HttpStatusCodes.NOT_FOUND)
  return c.json(reading, HttpStatusCodes.OK)
}
