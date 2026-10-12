import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { completeSpeakSession, getSpeakSession, listSpeak } from '@/services/speak.service.js'
import { isAdmin } from '@/services/users.service.js'

import type { CompleteRoute, GetByCodeRoute, ListRoute } from './speak.routes.js'

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const user = c.get('user')!
  const { languageCode } = c.req.valid('query')
  return c.json(await listSpeak(user.id, languageCode), HttpStatusCodes.OK)
}

export const getByCode: AppRouteHandler<GetByCodeRoute> = async (c) => {
  const user = c.get('user')!
  const { code } = c.req.valid('param')
  const { languageCode } = c.req.valid('query')
  // An admin can open a draft from the review queue to hear it as a learner will.
  const session = await getSpeakSession(languageCode, code, { includeDrafts: await isAdmin(user.id) })
  if (!session)
    return c.json({ message: 'No such session' }, HttpStatusCodes.NOT_FOUND)
  return c.json(session, HttpStatusCodes.OK)
}

export const complete: AppRouteHandler<CompleteRoute> = async (c) => {
  const user = c.get('user')!
  const { code } = c.req.valid('param')
  const { languageCode } = c.req.valid('query')
  const ok = await completeSpeakSession(user.id, languageCode, code, c.req.valid('json'))
  if (!ok)
    return c.json({ message: 'No such session' }, HttpStatusCodes.NOT_FOUND)
  return c.json({ message: 'Recorded' }, HttpStatusCodes.OK)
}
