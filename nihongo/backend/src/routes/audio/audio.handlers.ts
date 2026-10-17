import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { audioStatus } from '@/services/clips.service.js'

import type { StatusRoute } from './audio.routes.js'

export const status: AppRouteHandler<StatusRoute> = async (c) => {
  return c.json(await audioStatus(), HttpStatusCodes.OK)
}
