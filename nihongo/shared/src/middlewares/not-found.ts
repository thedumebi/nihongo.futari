import type { NotFoundHandler } from 'hono'

import { HttpStatusCodes, HttpStatusPhrases } from '@/constants/index.js'

export const notFound: NotFoundHandler = (ctx) => {
  return ctx.json({
    message: `${HttpStatusPhrases.NOT_FOUND} - ${ctx.req.path}`
  }, HttpStatusCodes.NOT_FOUND)
}
