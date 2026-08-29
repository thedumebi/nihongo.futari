import { HttpStatusCodes } from '@nihongo/shared/constants'
import env from '@nihongo/shared/env'

import type { AppRouteHandler } from '@/lib/types.js'

import { createInvite, listInvites, reserveInvite, revokeInvite } from '@/services/invites.service.js'

import type { CreateRoute, ListRoute, ReserveRoute, RevokeRoute, SignupModeRoute } from './invites.routes.js'

export const signupMode: AppRouteHandler<SignupModeRoute> = (c) => {
  const mode = env.SIGNUP_MODE
  return c.json({
    mode,
    requiresInvite: mode === 'invite',
    signupEnabled: mode !== 'closed'
  }, HttpStatusCodes.OK)
}

export const reserve: AppRouteHandler<ReserveRoute> = async (c) => {
  const { code, email } = c.req.valid('json')
  const result = await reserveInvite(code, email)

  if (!result.ok) {
    return c.json({ ok: false, message: result.reason }, HttpStatusCodes.BAD_REQUEST)
  }
  return c.json({ ok: true }, HttpStatusCodes.OK)
}

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const invites = await listInvites()
  return c.json({ invites, signupMode: env.SIGNUP_MODE }, HttpStatusCodes.OK)
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const user = c.get('user')!
  const invite = await createInvite(user.id, c.req.valid('json'))
  return c.json(invite, HttpStatusCodes.CREATED)
}

export const revoke: AppRouteHandler<RevokeRoute> = async (c) => {
  const { id } = c.req.valid('param')
  const ok = await revokeInvite(id)
  if (!ok)
    return c.json({ message: 'Invite not found or already revoked' }, HttpStatusCodes.NOT_FOUND)
  return c.json({ message: 'Invite revoked' }, HttpStatusCodes.OK)
}
