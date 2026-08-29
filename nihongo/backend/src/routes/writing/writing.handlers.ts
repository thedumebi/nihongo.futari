import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { getCharacter, getQueue } from '@/services/writing.service.js'

import type { GetByCharacterRoute, QueueRoute } from './writing.routes.js'

export const queue: AppRouteHandler<QueueRoute> = async (c) => {
  const filters = c.req.valid('query')
  return c.json(await getQueue(filters), HttpStatusCodes.OK)
}

export const getByCharacter: AppRouteHandler<GetByCharacterRoute> = async (c) => {
  const { character } = c.req.valid('param')
  const { languageCode } = c.req.valid('query')
  const found = await getCharacter(languageCode, character)
  if (!found)
    return c.json({ message: 'No stroke data for that character' }, HttpStatusCodes.NOT_FOUND)
  return c.json(found, HttpStatusCodes.OK)
}
