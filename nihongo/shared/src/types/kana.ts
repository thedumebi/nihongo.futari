import type {
  kana
} from '@/db/schema/kana.js'

/**
 * Kana.
 *
 * Derived from the Drizzle tables — the schema is the single source of truth.
 * Never hand-write a shape that duplicates one of these.
 */
export type Kana = typeof kana.$inferSelect
export type NewKana = typeof kana.$inferInsert
