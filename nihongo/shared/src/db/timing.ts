import { AsyncLocalStorage } from 'node:async_hooks'
import { performance } from 'node:perf_hooks'

import type { QueryTiming } from '@/types/timing.js'

/** The tally, plus what it needs to count overlapping queries and waits once. */
interface Tally extends QueryTiming {
  running: number
  busySince: number
  waiting: number
  waitingSince: number
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
  const tally: Tally = { queries: 0, ms: 0, waitMs: 0, queued: 0, slowest: null, running: 0, busySince: 0, waiting: 0, waitingSince: 0 }
  const result = await current.run(tally, fn)
  return { result, timing: { queries: tally.queries, ms: tally.ms, waitMs: tally.waitMs, queued: tally.queued, slowest: tally.slowest } }
}

/**
 * Everything a statement could carry a value in, blanked: '...' and E'...'
 * strings, $tag$...$tag$ bodies, and comments. Double-quoted identifiers are
 * names, kept as they are. A scan, not a regex, so a quote inside one of these
 * cannot pair with a quote outside it. Values sent as parameters never reach
 * here at all.
 */
function blankLiterals(text: string): string {
  let out = ''
  let i = 0
  while (i < text.length) {
    const c = text[i]!
    const next = text[i + 1]
    if (c === '-' && next === '-') {
      const end = text.indexOf('\n', i)
      i = end === -1 ? text.length : end
      out += ' '
    } else if (c === '/' && next === '*') {
      const end = text.indexOf('*/', i + 2)
      i = end === -1 ? text.length : end + 2
      out += ' '
    } else if (c === '"') {
      const end = text.indexOf('"', i + 1)
      const stop = end === -1 ? text.length : end + 1
      out += text.slice(i, stop)
      i = stop
    } else if (c === '\'') {
      const escapes = /e/i.test(text[i - 1] ?? '') && !/\w/.test(text[i - 2] ?? '')
      if (escapes)
        out = out.slice(0, -1)
      i++
      while (i < text.length) {
        if (escapes && text[i] === '\\') {
          i += 2
        } else if (text[i] === '\'') {
          if (text[i + 1] === '\'') {
            i += 2
          } else {
            i++
            break
          }
        } else {
          i++
        }
      }
      out += '?'
    } else if (c === '$' && /[a-z_$]/i.test(next ?? '') && !/[\w$]/.test(text[i - 1] ?? '')) {
      const tag = /^\$[a-z_]\w*\$|^\$\$/i.exec(text.slice(i))?.[0]
      if (tag) {
        const end = text.indexOf(tag, i + tag.length)
        i = end === -1 ? text.length : end + tag.length
        out += '?'
      } else {
        out += c
        i++
      }
    } else {
      out += c
      i++
    }
  }
  return out
}

/**
 * A statement short enough for a log line and still recognisable: its first
 * words and the start of its FROM, with every literal blanked
 * (`blankLiterals`), so only its shape is kept.
 */
export function statementLabel(text: string): string {
  const flat = blankLiterals(text).replace(/\s+/g, ' ').trim()
  const from = flat.search(/ from /i)
  return from > 40 ? `${flat.slice(0, 30)} … ${flat.slice(from + 1, from + 91)}` : flat.slice(0, 120)
}

/**
 * Mark a query as started against the request it was made for; call what this
 * returns when it ends. The clock runs only while at least one is running.
 */
export function startQuery(text: string): () => void {
  const tally = current.getStore()
  if (!tally)
    return () => {}
  const start = performance.now()
  if (tally.running++ === 0)
    tally.busySince = start
  let ended = false
  return () => {
    if (ended)
      return
    ended = true
    const now = performance.now()
    tally.queries++
    if (--tally.running === 0)
      tally.ms += now - tally.busySince
    if (now - start > (tally.slowest?.ms ?? -1))
      tally.slowest = { ms: now - start, sql: statementLabel(text) }
  }
}

/**
 * Mark a wait for a connection as started, `queued` when the pool had none
 * free; call what this returns when it has one.
 */
export function startWait(queued: boolean): () => void {
  const tally = current.getStore()
  if (!tally)
    return () => {}
  if (queued)
    tally.queued++
  if (tally.waiting++ === 0)
    tally.waitingSince = performance.now()
  let ended = false
  return () => {
    if (ended)
      return
    ended = true
    if (--tally.waiting === 0)
      tally.waitMs += performance.now() - tally.waitingSince
  }
}
