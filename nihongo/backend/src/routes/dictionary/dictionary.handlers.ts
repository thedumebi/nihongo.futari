import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { search } from '@/services/dictionary.service.js'

import type { SearchRoute } from './dictionary.routes.js'

export const searchHandler: AppRouteHandler<SearchRoute> = async (c) => {
  const { q, languageCode, limit } = c.req.valid('query')
  return c.json(await search(q, languageCode, limit), HttpStatusCodes.OK)
}
