import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { listLanguages } from '@/services/languages.service.js'

import type { ListRoute } from './languages.routes.js'

export const list: AppRouteHandler<ListRoute> = async (c) => {
  return c.json({ languages: await listLanguages() }, HttpStatusCodes.OK)
}
