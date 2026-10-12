/**
 * The authoring format for read-aloud speeches.
 *
 * One speech belongs to ONE level and is its own text. A topic may come back
 * at a later level, but as a new speech with new sentences — `check:readings`
 * refuses lines copied from one speech into another.
 *
 * Field names are short because they repeat thousands of times:
 *   t  the line as written. Only kanji at or below the speech's level; anything
 *      above is written in kana.
 *   r  the same line in kana, with particles as SPOKEN (は→わ, を→お, へ→え) and
 *      a space at every word break. Authored because a particle は cannot be
 *      told from the は inside はい without part-of-speech.
 *   e  the English for this line alone.
 *
 * There is no status here. A speech ships in a seed (`pnpm seed:readings`)
 * unpublished, with a pending row in the admin review queue, and approving it
 * there is the only thing that publishes it.
 */

export type ReadingLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

export interface Line {
  t: string
  r: string
  e: string
}

export interface AuthoredReading {
  code: string
  level: ReadingLevel
  /** As written at this level, kanji and all. */
  title: string
  titleEn: string
  /** Groups of short phrase lines; each group is shown with a gap after it. */
  stanzas: Line[][]
}
