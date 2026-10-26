import { HttpStatusCodes, USER_ROUTES } from '@nihongo/shared/constants'
import { createPublicRoute, createSecuredRoute, ErrorSchema, jsonContent, jsonContentRequired } from '@nihongo/shared/openapi'
import { studySettingsPatchSchema, studySettingsSchema, unconfirmedCleanupResultSchema } from '@nihongo/shared/types'

import authMiddleware from '@/middlewares/auth.js'
import { strictLimiter } from '@/middlewares/rate-limit.js'

const tags = ['Users']

export const settings = createSecuredRoute({
  tags,
  path: USER_ROUTES.SETTINGS,
  method: 'get',
  summary: 'Study preferences',
  middleware: [authMiddleware],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(studySettingsSchema, 'Settings')
  }
})
export type SettingsRoute = typeof settings

export const updateSettings = createSecuredRoute({
  tags,
  path: USER_ROUTES.UPDATE_SETTINGS,
  method: 'patch',
  summary: 'Update study preferences',
  middleware: [authMiddleware],
  request: { body: jsonContentRequired(studySettingsPatchSchema, 'Settings') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(studySettingsSchema, 'Updated settings')
  }
})
export type UpdateSettingsRoute = typeof updateSettings

/**
 * Fired by host cron, not by a user: deletes password sign-ups whose email was
 * never confirmed within a day.
 *
 * Such an account can never sign in, and while it exists the real owner of
 * the address is locked out of Google sign-in, which will not join an
 * unconfirmed account. Same shared secret and limiter as the reminders cron.
 */
export const cleanupUnconfirmed = createPublicRoute({
  tags,
  path: USER_ROUTES.CLEANUP_UNCONFIRMED,
  method: 'post',
  summary: 'Delete unconfirmed sign-ups (cron)',
  middleware: [strictLimiter],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(unconfirmedCleanupResultSchema, 'How many were deleted'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(ErrorSchema, 'Bad or missing cron secret')
  }
})
export type CleanupUnconfirmedRoute = typeof cleanupUnconfirmed
