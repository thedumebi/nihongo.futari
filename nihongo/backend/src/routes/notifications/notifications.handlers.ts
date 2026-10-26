import type { ReminderRunResult } from '@nihongo/shared/types'

import { HttpStatusCodes } from '@nihongo/shared/constants'
import env from '@nihongo/shared/env'

import type { AppRouteHandler } from '@/lib/types.js'

import { isCronAuthorized } from '@/lib/cron.js'
import { publicKey } from '@/lib/push.js'
import { runCampaignQueue } from '@/services/email-campaigns.service.js'
import { runBoardNudges } from '@/services/friends.service.js'
import { removeDevice as deleteDevice, getPrefs, listDevices, subscribe as saveSubscription, setTimezone as saveTimezone, setPrefs } from '@/services/notifications.service.js'
import { runReminders as run, runNudges, runWeeklySummaries } from '@/services/reminders.service.js'

import type {
  DevicesRoute,
  PreferencesRoute,
  RemoveDeviceRoute,
  RunRemindersRoute,
  SetTimezoneRoute,
  SubscribeRoute,
  UpdatePreferencesRoute,
  VapidKeyRoute
} from './notifications.routes.js'

export const vapidKey: AppRouteHandler<VapidKeyRoute> = (c) => {
  return c.json({ publicKey: publicKey() }, HttpStatusCodes.OK)
}

export const subscribe: AppRouteHandler<SubscribeRoute> = async (c) => {
  const user = c.get('user')!
  await saveSubscription(user.id, c.req.valid('json'), c.req.header('user-agent'))
  return c.json({ message: 'Subscribed to reminders' }, HttpStatusCodes.OK)
}

export const devices: AppRouteHandler<DevicesRoute> = async (c) => {
  const user = c.get('user')!
  return c.json(await listDevices(user.id, c.req.valid('query').deviceId), HttpStatusCodes.OK)
}

export const removeDevice: AppRouteHandler<RemoveDeviceRoute> = async (c) => {
  const user = c.get('user')!
  if (!(await deleteDevice(user.id, c.req.valid('param').id)))
    return c.json({ message: 'Not one of your devices' }, HttpStatusCodes.NOT_FOUND)
  return c.json({ message: 'Removed' }, HttpStatusCodes.OK)
}

export const preferences: AppRouteHandler<PreferencesRoute> = async (c) => {
  const user = c.get('user')!
  return c.json(await getPrefs(user.id), HttpStatusCodes.OK)
}

export const updatePreferences: AppRouteHandler<UpdatePreferencesRoute> = async (c) => {
  const user = c.get('user')!
  return c.json(await setPrefs(user.id, c.req.valid('json')), HttpStatusCodes.OK)
}

export const runReminders: AppRouteHandler<RunRemindersRoute> = async (c) => {
  if (!isCronAuthorized(env.CRON_SECRET, c.req.header('x-cron-secret'))) {
    return c.json({ message: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED)
  }
  // Both run off the same cron tick. Each decides internally whether it is the
  // right local hour, so the scheduler needs to know nothing about timezones,
  // and one endpoint means one secret to keep.
  const runs = [await run(), await runWeeklySummaries(), await runNudges(), await runBoardNudges()]
  // And any admin email a restart left half-sent. Not awaited: a large send
  // outlives the cron request, and the queue guards itself against overlap.
  void runCampaignQueue()
  const sum = (key: keyof ReminderRunResult) => runs.reduce((n, r) => n + r[key], 0)
  return c.json({
    considered: sum('considered'),
    emailed: sum('emailed'),
    pushed: sum('pushed'),
    skipped: sum('skipped'),
    // Broken out so a run that sent nothing says WHY in the cron log. The
    // single `skipped` total could not distinguish "not their hour" from
    // "already sent today" from "the provider rejected it", which is what made
    // a silent evening impossible to diagnose from the log alone.
    skippedNotDue: sum('skippedNotDue'),
    skippedAlreadySent: sum('skippedAlreadySent'),
    failed: sum('failed'),
    // Push has its own outcomes because it used to have none: a run that
    // pushed nothing looked identical to one that pushed successfully.
    pushFailed: sum('pushFailed'),
    pushNoSubscription: sum('pushNoSubscription'),
    pushNotConfigured: sum('pushNotConfigured')
  }, HttpStatusCodes.OK)
}

export const setTimezone: AppRouteHandler<SetTimezoneRoute> = async (c) => {
  const user = c.get('user')!
  const { timezone } = c.req.valid('json')
  await saveTimezone(user.id, timezone)
  return c.json({ timezone }, HttpStatusCodes.OK)
}
