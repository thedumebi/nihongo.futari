import type { ErrorHandler } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import * as HttpStatusCodes from '@/constants/http-status-codes.js'
import env from '@/env.js'
import pino from '@/lib/pino.js'

export const onError: ErrorHandler = (err, ctx) => {
  const currentStatus = 'statusCode' in err
    ? (err as any).statusCode
    : 'status' in err
      ? (err as any).status
      : ctx.newResponse(null).status

  const statusCode = currentStatus !== HttpStatusCodes.OK
    ? (currentStatus as ContentfulStatusCode)
    : HttpStatusCodes.INTERNAL_SERVER_ERROR
  const isProd = env.NODE_ENV === 'production'
  const isServerError = statusCode >= 500

  pino.error({ message: err.message, stack: err.stack, statusCode })

  const clientMessage = isProd && isServerError ? 'Internal server error' : err.message

  return ctx.json({
    message: clientMessage,
    stack: isProd ? undefined : err.stack
  }, statusCode)
}
