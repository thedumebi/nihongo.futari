import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { getSettings, updateSettings as saveSettings } from '@/services/users.service.js'

import type { SettingsRoute, UpdateSettingsRoute } from './users.routes.js'

export const settings: AppRouteHandler<SettingsRoute> = async (c) => {
  const user = c.get('user')!
  return c.json(await getSettings(user.id), HttpStatusCodes.OK)
}

export const updateSettings: AppRouteHandler<UpdateSettingsRoute> = async (c) => {
  const user = c.get('user')!
  return c.json(await saveSettings(user.id, c.req.valid('json')), HttpStatusCodes.OK)
}
