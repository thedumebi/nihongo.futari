import type { Context } from 'hono'

import { createHash } from 'node:crypto'

import { clientIpFromHeaders } from './ip.js'

/**
 * Anonymous, stable per-browser fallback id when the client sends no first-party
 * visitor id (`vid`). Derived from IP + User-Agent so a no-JS/no-storage visitor
 * still de-duplicates reasonably; the raw IP is never stored, only the hash.
 * Shared by article-view recording and anonymous favorites.
 */
export function fallbackVisitorId(c: Context) {
  // Same client-IP resolution the country lookup uses, so the two never diverge.
  const ip = clientIpFromHeaders(c.req.header('x-forwarded-for'), c.req.header('x-real-ip')) || 'unknown'
  const ua = c.req.header('user-agent') || 'unknown'
  return `anon:${createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 32)}`
}
