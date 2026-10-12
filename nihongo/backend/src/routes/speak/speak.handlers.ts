import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { completeSpeakSession, getSpeakSession, listSpeak, missSpeakStep } from '@/services/speak.service.js'
import { isAdmin } from '@/services/users.service.js'

import type { CompleteRoute, GetByCodeRoute, ListRoute, MissRoute } from './speak.routes.js'

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

export const miss: AppRouteHandler<MissRoute> = async (c) => {
  const user = c.get('user')!
  const { code, index } = c.req.valid('param')
  const { languageCode } = c.req.valid('query')
  const result = await missSpeakStep(user.id, languageCode, code, index)
  if (!result)
    return c.json({ message: 'No such prompt in a published session' }, HttpStatusCodes.NOT_FOUND)
  return c.json(result, HttpStatusCodes.OK)
}
