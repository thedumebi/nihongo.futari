import type { MiddlewareHandler } from 'hono'

import { pinoLogger as honoPino } from 'hono-pino'

import pino from '@/lib/pino.js'

export function pinoLogger(): MiddlewareHandler {
  return honoPino({ pino })
}
