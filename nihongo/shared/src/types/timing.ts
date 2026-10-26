/**
 * What one request spent in the database: how many queries; for how long at
 * least one was running (wall time, so queries run side by side count once);
 * and how long it waited for a free connection, apart from either.
 */
export interface QueryTiming {
  queries: number
  ms: number
  waitMs: number
}
