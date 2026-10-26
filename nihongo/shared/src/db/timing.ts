import { AsyncLocalStorage } from 'node:async_hooks'
import { performance } from 'node:perf_hooks'

import type { QueryTiming } from '@/types/timing.js'

/** The tally, plus what it needs to count overlapping queries once. */
interface Tally extends QueryTiming {
  running: number
  busySince: number
}

/**
 * The database time of the request in progress, so a slow route's log line
 * says whether the time went to Postgres, to waiting for a connection, or to
 * the app. Outside a request (seeds, cron, tests) there is no store and
 * nothing is counted.
 */
const current = new AsyncLocalStorage<Tally>()

/** Run `fn` with a fresh tally of its queries, and hand both back. */
export async function withQueryTiming<T>(fn: () => Promise<T>): Promise<{ result: T, timing: QueryTiming }> {
  const tally: Tally = { queries: 0, ms: 0, waitMs: 0, running: 0, busySince: 0 }
  const result = await current.run(tally, fn)
  return { result, timing: { queries: tally.queries, ms: tally.ms, waitMs: tally.waitMs } }
}

/**
 * Mark a query as started against the request it was made for; call what this
 * returns when it ends. The clock runs only while at least one is running.
 */
export function startQuery(): () => void {
  const tally = current.getStore()
  if (!tally)
    return () => {}
  if (tally.running++ === 0)
    tally.busySince = performance.now()
  let ended = false
  return () => {
    if (ended)
      return
    ended = true
    tally.queries++
    if (--tally.running === 0)
      tally.ms += performance.now() - tally.busySince
  }
}

/** Mark a wait for a connection as started; call what this returns when it has one. */
export function startWait(): () => void {
  const tally = current.getStore()
  if (!tally)
    return () => {}
  const start = performance.now()
  return () => {
    tally.waitMs += performance.now() - start
  }
}
