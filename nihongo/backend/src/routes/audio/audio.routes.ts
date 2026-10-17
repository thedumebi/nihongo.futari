import { AUDIO_ROUTES, HttpStatusCodes } from '@nihongo/shared/constants'
import { createAdminRoute, jsonContent } from '@nihongo/shared/openapi'
import { audioStatusSchema } from '@nihongo/shared/types'

import adminMiddleware from '@/middlewares/admin.js'
import authMiddleware from '@/middlewares/auth.js'

const tags = ['Audio']

export const status = createAdminRoute({
  tags,
  path: AUDIO_ROUTES.STATUS,
  method: 'get',
  summary: 'Sentences and words waiting for a recording',
  description: 'Reworded or new since the last audio run: their audio plays nothing until it is recorded and the clip seed is deployed.',
  middleware: [authMiddleware, adminMiddleware],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(audioStatusSchema, 'Counts')
  }
})
export type StatusRoute = typeof status
