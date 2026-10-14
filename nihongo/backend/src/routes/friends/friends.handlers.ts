import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { acceptFriend, addFriend, listFriends, removeFriend, rotateFriendCode, updateFriendSettings } from '@/services/friends.service.js'

import type { AcceptRoute, AddRoute, ListRoute, RemoveRoute, RotateCodeRoute, UpdateSettingsRoute } from './friends.routes.js'

export const list: AppRouteHandler<ListRoute> = async (c) => {
  return c.json(await listFriends(c.get('user')!.id), HttpStatusCodes.OK)
}

export const updateSettings: AppRouteHandler<UpdateSettingsRoute> = async (c) => {
  return c.json(await updateFriendSettings(c.get('user')!.id, c.req.valid('json')), HttpStatusCodes.OK)
}

export const rotateCode: AppRouteHandler<RotateCodeRoute> = async (c) => {
  const settings = await rotateFriendCode(c.get('user')!.id)
  if (!settings)
    return c.json({ message: 'Turn friends on first' }, HttpStatusCodes.NOT_FOUND)
  return c.json(settings, HttpStatusCodes.OK)
}

export const add: AppRouteHandler<AddRoute> = async (c) => {
  const result = await addFriend(c.get('user')!.id, c.req.valid('json'))
  if (result.ok)
    return c.json({ displayName: result.displayName, status: result.status }, HttpStatusCodes.OK)
  if (result.error === 'no-such-code')
    return c.json({ message: 'No one has that code' }, HttpStatusCodes.NOT_FOUND)
  return c.json({ message: result.error === 'self' ? 'That is your own code' : 'Turn friends on in Settings first' }, HttpStatusCodes.BAD_REQUEST)
}

export const accept: AppRouteHandler<AcceptRoute> = async (c) => {
  if (!await acceptFriend(c.get('user')!.id, c.req.valid('param').id))
    return c.json({ message: 'No such request' }, HttpStatusCodes.NOT_FOUND)
  return c.json({ ok: true as const }, HttpStatusCodes.OK)
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  if (!await removeFriend(c.get('user')!.id, c.req.valid('param').id))
    return c.json({ message: 'No such friendship' }, HttpStatusCodes.NOT_FOUND)
  return c.json({ ok: true as const }, HttpStatusCodes.OK)
}
