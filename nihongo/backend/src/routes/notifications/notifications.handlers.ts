import type { ReminderRunResult } from '@nihongo/shared/types'

import { HttpStatusCodes } from '@nihongo/shared/constants'
import env from '@nihongo/shared/env'

import type { AppRouteHandler } from '@/lib/types.js'

import { publicKey } from '@/lib/push.js'
import { getPrefs, subscribe as saveSubscription, setTimezone as saveTimezone, setPrefs } from '@/services/notifications.service.js'
import { runReminders as run, runNudges, runWeeklySummaries } from '@/services/reminders.service.js'

import type {
  PreferencesRoute,
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
  await saveSubscription(user.id, c.req.valid('json'))
  return c.json({ message: 'Subscribed to reminders' }, HttpStatusCodes.OK)
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
  const secret = env.CRON_SECRET
  const provided = c.req.header('x-cron-secret')
  // Refuse outright when no secret is configured — an unauthenticated endpoint
  // that sends email is worse than one that does nothing.
  if (!secret || provided !== secret) {
    return c.json({ message: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED)
  }
  // Both run off the same cron tick. Each decides internally whether it is the
  // right local hour, so the scheduler needs to know nothing about timezones,
  // and one endpoint means one secret to keep.
  const runs = [await run(), await runWeeklySummaries(), await runNudges()]
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
