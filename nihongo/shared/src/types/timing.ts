/**
 * What one request spent in the database: how many queries; for how long at
 * least one was running (wall time, so queries run side by side count once);
 * for how long at least one waited to be handed a connection, counted the same
 * way and apart from either; and how many of those waits found every
 * connection in use, so queued behind other queries rather than only behind
 * the event loop.
 */
export interface QueryTiming {
  queries: number
  ms: number
  waitMs: number
  queued: number
}
