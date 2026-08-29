import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { getWordDetail } from '@/services/words.service.js'

import type { GetByIdRoute } from './words.routes.js'

export const getById: AppRouteHandler<GetByIdRoute> = async (c) => {
  const { id } = c.req.valid('param')
  const { languageCode } = c.req.valid('query')
  const detail = await getWordDetail(languageCode, id)
  if (!detail)
    return c.json({ message: 'No such word' }, HttpStatusCodes.NOT_FOUND)
  return c.json(detail, HttpStatusCodes.OK)
}
