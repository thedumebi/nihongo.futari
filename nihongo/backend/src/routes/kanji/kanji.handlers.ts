import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { getKanjiDetail } from '@/services/kanji.service.js'

import type { GetByCharacterRoute } from './kanji.routes.js'

export const getByCharacter: AppRouteHandler<GetByCharacterRoute> = async (c) => {
  const { character } = c.req.valid('param')
  const { languageCode } = c.req.valid('query')
  const detail = await getKanjiDetail(languageCode, character)
  if (!detail)
    return c.json({ message: 'No such kanji' }, HttpStatusCodes.NOT_FOUND)
  return c.json(detail, HttpStatusCodes.OK)
}
