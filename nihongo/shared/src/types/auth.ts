import { z } from '@hono/zod-openapi'

import type {
  users
} from '@/db/schema/auth.js'

/**
 * Account and session types. better-auth owns these tables; we extend `users`.
 *
 * Derived from the Drizzle tables — the schema is the single source of truth.
 * Never hand-write a shape that duplicates one of these.
 */
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export const unconfirmedCleanupResultSchema = z.object({
  /** Accounts deleted on this run. */
  deleted: z.number().int().nonnegative()
}).openapi('UnconfirmedCleanupResult')

export type UnconfirmedCleanupResult = z.infer<typeof unconfirmedCleanupResultSchema>
