import type { Context, MiddlewareHandler } from 'hono'

import { pinoLogger as honoPino } from 'hono-pino'

import type { QueryTiming } from '@/types/timing.js'

import { withQueryTiming } from '@/db/timing.js'
import pino from '@/lib/pino.js'

const timings = new WeakMap<Request, QueryTiming>()

/** Milliseconds to the tenth, which is all a log line needs. */
function rounded(ms: number): number {
  return Math.round(ms * 10) / 10
}

/**
 * Every request's log line, with what it spent in the database. Kept to the
 * log, not sent as `Server-Timing`: a query count differs by which branch the
 * server took, and on a sign-in that says whether the address has an account.
 */
export function pinoLogger(): MiddlewareHandler {
  const log = honoPino({
    pino,
    http: {
      onResBindings: (c: Context) => {
        const timing = timings.get(c.req.raw)
        return {
          res: { status: c.res.status },
          ...(timing ? { db: { queries: timing.queries, ms: rounded(timing.ms), waitMs: rounded(timing.waitMs), queued: timing.queued, ...(timing.slowest ? { slowest: { ms: rounded(timing.slowest.ms), sql: timing.slowest.sql } } : {}) } } : {})
        }
      }
    }
  })
  return (c, next) => log(c, async () => {
    const { timing } = await withQueryTiming(next)
    timings.set(c.req.raw, timing)
  })
}
