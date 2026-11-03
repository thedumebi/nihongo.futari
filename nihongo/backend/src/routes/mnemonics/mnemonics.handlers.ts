import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { createForReview, listForKanji, listForWord } from '@/services/mnemonics.service.js'

import type { CreateRoute, ForKanjiRoute, ForWordRoute } from './mnemonics.routes.js'

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const user = c.get('user')!
  const created = await createForReview(c.req.valid('json'), user.id)
  if (!created)
    return c.json({ message: 'No such kanji, word or language' }, HttpStatusCodes.NOT_FOUND)
  return c.json(created, HttpStatusCodes.CREATED)
}

export const forKanji: AppRouteHandler<ForKanjiRoute> = async (c) => {
  const { character } = c.req.valid('param')
  const { languageCode } = c.req.valid('query')
  return c.json(await listForKanji(languageCode, character), HttpStatusCodes.OK)
}

export const forWord: AppRouteHandler<ForWordRoute> = async (c) => {
  const { wordId } = c.req.valid('param')
  return c.json(await listForWord(wordId), HttpStatusCodes.OK)
}
