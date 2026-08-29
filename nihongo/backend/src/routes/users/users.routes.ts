import { HttpStatusCodes, USER_ROUTES } from '@nihongo/shared/constants'
import { createSecuredRoute, jsonContent, jsonContentRequired } from '@nihongo/shared/openapi'
import { studySettingsSchema } from '@nihongo/shared/types'

import authMiddleware from '@/middlewares/auth.js'

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
  request: { body: jsonContentRequired(studySettingsSchema, 'Settings') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(studySettingsSchema, 'Updated settings')
  }
})
export type UpdateSettingsRoute = typeof updateSettings
