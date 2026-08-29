import type { Context, Next } from 'hono'

/**
 * Minimal per-request hooks middleware. Currently a no-op placeholder that
 * keeps the API surface parallel to ofuma — a future need (e.g. attaching a
 * request-scoped logger or tracing span) can wire it up here without
 * touching call sites.
 */
export function hooks(_c: Context, next: Next) {
  return next()
}
