import type {
  etymologyEntries,
  etymologySources,
  mnemonics,
  sources
} from '@/db/schema/etymology.js'

/**
 * The "why" layer. Note `EtymologyEntry` and `Mnemonic` are deliberately
 * distinct shapes — sourced history is not an invented memory aid.
 *
 * Derived from the Drizzle tables — the schema is the single source of truth.
 * Never hand-write a shape that duplicates one of these.
 */
export type Source = typeof sources.$inferSelect
export type NewSource = typeof sources.$inferInsert
export type EtymologyEntry = typeof etymologyEntries.$inferSelect
export type NewEtymologyEntry = typeof etymologyEntries.$inferInsert
export type EtymologySource = typeof etymologySources.$inferSelect
export type Mnemonic = typeof mnemonics.$inferSelect
export type NewMnemonic = typeof mnemonics.$inferInsert
