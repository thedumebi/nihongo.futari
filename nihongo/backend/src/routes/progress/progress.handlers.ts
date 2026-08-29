import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { getKnownKanji, getReadiness, getSummary } from '@/services/progress.service.js'

import type { KnownKanjiRoute, ReadinessRoute, SummaryRoute } from './progress.routes.js'

export const summary: AppRouteHandler<SummaryRoute> = async (c) => {
  const user = c.get('user')!
  return c.json(await getSummary(user.id), HttpStatusCodes.OK)
}

export const knownKanji: AppRouteHandler<KnownKanjiRoute> = async (c) => {
  const user = c.get('user')!
  const { languageCode } = c.req.valid('query')
  return c.json(await getKnownKanji(user.id, languageCode), HttpStatusCodes.OK)
}

export const readiness: AppRouteHandler<ReadinessRoute> = async (c) => {
  const user = c.get('user')!
  const { levelCode } = c.req.valid('param')
  const { languageCode } = c.req.valid('query')
  const result = await getReadiness(user.id, languageCode, levelCode)
  if (!result)
    return c.json({ message: 'No such level' }, HttpStatusCodes.NOT_FOUND)
  return c.json(result, HttpStatusCodes.OK)
}
