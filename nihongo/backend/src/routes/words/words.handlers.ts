import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { getPitches, getWordDetail } from '@/services/words.service.js'

import type { GetByIdRoute, PitchesRoute } from './words.routes.js'

export const getById: AppRouteHandler<GetByIdRoute> = async (c) => {
  const { id } = c.req.valid('param')
  const { languageCode } = c.req.valid('query')
  const detail = await getWordDetail(languageCode, id)
  if (!detail)
    return c.json({ message: 'No such word' }, HttpStatusCodes.NOT_FOUND)
  return c.json(detail, HttpStatusCodes.OK)
}

export const pitches: AppRouteHandler<PitchesRoute> = async (c) => {
  const ids = [...new Set(c.req.valid('query').ids.split(',').map(id => id.trim()).filter(Boolean))].slice(0, 40)
  return c.json({ pitches: await getPitches(ids) }, HttpStatusCodes.OK)
}
