import { HttpStatusCodes, NOTIFICATION_ROUTES } from '@nihongo/shared/constants'
import { createPublicRoute, createSecuredRoute, ErrorSchema, jsonContent, jsonContentRequired } from '@nihongo/shared/openapi'
import {
  MessageResponseSchema,
  notificationPrefsSchema,
  pushSubscribeSchema,
  reminderRunResultSchema,
  timezoneSchema,
  vapidKeyResponseSchema
} from '@nihongo/shared/types'

import authMiddleware from '@/middlewares/auth.js'
import { strictLimiter } from '@/middlewares/rate-limit.js'

const tags = ['Notifications']

export const vapidKey = createPublicRoute({
  tags,
  path: NOTIFICATION_ROUTES.VAPID_KEY,
  method: 'get',
  summary: 'The public VAPID key',
  description: 'Null when push is not configured — the client should hide the option rather than fail.',
  responses: {
    [HttpStatusCodes.OK]: jsonContent(vapidKeyResponseSchema, 'Public key or null')
  }
})
export type VapidKeyRoute = typeof vapidKey

export const subscribe = createSecuredRoute({
  tags,
  path: NOTIFICATION_ROUTES.SUBSCRIBE,
  method: 'post',
  summary: 'Register this browser for push',
  middleware: [authMiddleware],
  request: { body: jsonContentRequired(pushSubscribeSchema, 'Browser subscription') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(MessageResponseSchema, 'Subscribed')
  }
})
export type SubscribeRoute = typeof subscribe

export const preferences = createSecuredRoute({
  tags,
  path: NOTIFICATION_ROUTES.PREFERENCES,
  method: 'get',
  summary: 'Reminder preferences',
  middleware: [authMiddleware],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(notificationPrefsSchema, 'Current preferences')
  }
})
export type PreferencesRoute = typeof preferences

export const updatePreferences = createSecuredRoute({
  tags,
  path: NOTIFICATION_ROUTES.PREFERENCES,
  method: 'put',
  summary: 'Update reminder preferences',
  middleware: [authMiddleware],
  request: { body: jsonContentRequired(notificationPrefsSchema, 'New preferences') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(notificationPrefsSchema, 'Saved')
  }
})
export type UpdatePreferencesRoute = typeof updatePreferences

/**
 * The reader's timezone, sent by the browser on every session load.
 *
 * Its own endpoint rather than a field on the preferences PUT: the client knows
 * this without asking anyone, and making it read the whole preferences object
 * back just to change one field would be a round trip and a race for no reason.
 */
export const setTimezone = createSecuredRoute({
  tags,
  path: NOTIFICATION_ROUTES.TIMEZONE,
  method: 'patch',
  summary: 'Set the reader timezone',
  middleware: [authMiddleware],
  request: { body: jsonContentRequired(timezoneSchema, 'IANA timezone') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(timezoneSchema, 'Saved')
  }
})
export type SetTimezoneRoute = typeof setTimezone

/**
 * Fired by host cron, not by a user.
 *
 * Authenticated with a shared secret rather than a session, because there is no
 * user behind it. Rate-limited too: it is a public path, and without a limiter
 * a wrong guess could be brute-forced.
 */
export const runReminders = createPublicRoute({
  tags,
  path: NOTIFICATION_ROUTES.RUN_REMINDERS,
  method: 'post',
  summary: 'Send due reminders (cron)',
  description:
    'Idempotent per user per local day via a unique dedupe key, so overlapping or retried '
    + 'cron runs cannot double-send.',
  middleware: [strictLimiter],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(reminderRunResultSchema, 'What was sent'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(ErrorSchema, 'Bad or missing cron secret')
  }
})
export type RunRemindersRoute = typeof runReminders
