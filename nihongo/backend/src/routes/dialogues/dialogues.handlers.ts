import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { getDialogue, listDialogues } from '@/services/dialogues.service.js'

import type { GetByCodeRoute, ListRoute } from './dialogues.routes.js'

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const user = c.get('user')!
  const { languageCode } = c.req.valid('query')
  return c.json(await listDialogues(languageCode, user.id), HttpStatusCodes.OK)
}

export const getByCode: AppRouteHandler<GetByCodeRoute> = async (c) => {
  const { code } = c.req.valid('param')
  const { languageCode } = c.req.valid('query')
  const dialogue = await getDialogue(languageCode, code)
  if (!dialogue)
    return c.json({ message: 'No such conversation' }, HttpStatusCodes.NOT_FOUND)
  return c.json(dialogue, HttpStatusCodes.OK)
}
