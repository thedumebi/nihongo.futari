import { OpenAPIHono } from '@hono/zod-openapi'
import { notFound, onError, pinoLogger, serveEmojiFavicon } from '@nihongo/shared/middlewares'
import { bodyLimit } from 'hono/body-limit'
import { secureHeaders } from 'hono/secure-headers'

import defaultHook from '@/openapi/default-hook.js'

import type { AppBindings } from './types.js'

export function createRouter() {
  return new OpenAPIHono<AppBindings>({ strict: false, defaultHook })
}

export default function createApp() {
  const app = createRouter()

  app.use(secureHeaders())
  app.use('*', bodyLimit({
    maxSize: 5 * 1024 * 1024,
    onError: c => c.text('Body too large', 413)
  }))
  app.use(serveEmojiFavicon('🧪'))
  app.use(pinoLogger())

  app.notFound(notFound)
  app.onError(onError)

  return app
}
