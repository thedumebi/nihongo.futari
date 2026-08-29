import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { getGrammarPoint, listGrammar } from '@/services/grammar.service.js'

import type { GetBySlugRoute, ListRoute } from './grammar.routes.js'

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { languageCode } = c.req.valid('query')
  return c.json(await listGrammar(languageCode), HttpStatusCodes.OK)
}

export const getBySlug: AppRouteHandler<GetBySlugRoute> = async (c) => {
  const { slug } = c.req.valid('param')
  const { languageCode } = c.req.valid('query')
  const point = await getGrammarPoint(languageCode, slug)
  if (!point)
    return c.json({ message: 'Grammar point not found' }, HttpStatusCodes.NOT_FOUND)
  return c.json(point, HttpStatusCodes.OK)
}
