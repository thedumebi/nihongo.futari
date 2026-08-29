import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { getSeries, listSeries } from '@/services/phonetics.service.js'

import type { GetByComponentRoute, ListRoute } from './phonetics.routes.js'

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { languageCode, minMembers } = c.req.valid('query')
  return c.json(await listSeries(languageCode, minMembers), HttpStatusCodes.OK)
}

export const getByComponent: AppRouteHandler<GetByComponentRoute> = async (c) => {
  const { component } = c.req.valid('param')
  const { languageCode } = c.req.valid('query')
  const series = await getSeries(languageCode, component)
  if (!series)
    return c.json({ message: 'No such sound series' }, HttpStatusCodes.NOT_FOUND)
  return c.json(series, HttpStatusCodes.OK)
}
