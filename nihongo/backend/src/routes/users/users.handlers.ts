import { HttpStatusCodes } from '@nihongo/shared/constants'
import env from '@nihongo/shared/env'

import type { AppRouteHandler } from '@/lib/types.js'

import { isCronAuthorized } from '@/lib/cron.js'
import { deleteUnconfirmedAccounts, getSettings, updateSettings as saveSettings } from '@/services/users.service.js'

import type { CleanupUnconfirmedRoute, SettingsRoute, UpdateSettingsRoute } from './users.routes.js'

export const settings: AppRouteHandler<SettingsRoute> = async (c) => {
  const user = c.get('user')!
  return c.json(await getSettings(user.id), HttpStatusCodes.OK)
}

export const updateSettings: AppRouteHandler<UpdateSettingsRoute> = async (c) => {
  const user = c.get('user')!
  return c.json(await saveSettings(user.id, c.req.valid('json')), HttpStatusCodes.OK)
}

export const cleanupUnconfirmed: AppRouteHandler<CleanupUnconfirmedRoute> = async (c) => {
  if (!isCronAuthorized(env.CRON_SECRET, c.req.header('x-cron-secret')))
    return c.json({ message: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED)
  return c.json({ deleted: await deleteUnconfirmedAccounts() }, HttpStatusCodes.OK)
}
