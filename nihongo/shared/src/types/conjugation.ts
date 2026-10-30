import type { Conjugated } from '@/lib/ja/conjugation/index.js'

import type { WordDetail } from './words.js'

/** What a conjugation table is for. */
export type ConjugationTableKind = 'verb' | 'i-adjective' | 'na-adjective'

/** One conjugated form, as written and as read. */
export type ConjugationText = Pick<Conjugated, 'surface' | 'reading'>

/** A row of the polite/plain grid: one tense, both registers. */
export interface ConjugationGridRow {
  tense: string
  polite: ConjugationText | null
  plain: ConjugationText | null
}

/** A form outside the grid, named and explained. */
export interface ConjugationOther extends ConjugationText {
  label: string
  what: string
}

/** Everything the dictionary shows about how one word changes. */
export interface ConjugationTable {
  kind: ConjugationTableKind
  /** Anything the forms alone do not say, such as a noun that becomes a verb with する. */
  note: string | null
  grid: ConjugationGridRow[]
  others: ConjugationOther[]
}

/** What a table is built from: the word, and every sense's part-of-speech codes. */
export type ConjugationWord = Pick<WordDetail, 'form' | 'reading'> & {
  pos: ReadonlyArray<readonly string[]>
}
