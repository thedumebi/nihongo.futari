/**
 * The authoring format for conversations.
 *
 * Deliberately terse. The first six dialogues were written as raw SQL and came
 * to ~200 lines for six conversations; at a hundred that is unmaintainable and
 * every edit means rebuilding the embedded prompt by hand. This is the same
 * content as data, expanded by `import-dialogues.ts`.
 *
 * Field names are short because they repeat thousands of times:
 *   s  speaker — 'other' or 'you'
 *   t  the line as written, kanji and all
 *   r  the same line in kana, with particles as SPOKEN (は→わ, を→お) and
 *      spaces at word breaks. Both are authored because neither can be derived:
 *      telling a particle は from the は inside はい needs part-of-speech, and
 *      `sentence_tokens.pos` is empty on every row.
 *   e  the English
 *   wrong  for a learner turn: the options that are not right, each with the
 *      reason. A wrong option without a reason is the failure this whole
 *      feature exists to avoid, so the type requires it.
 */

/** A wrong reply: [written, reading, why it is wrong]. */
export type Wrong = [string, string, string]

export interface Turn {
  s: 'other' | 'you'
  t: string
  r: string
  e: string
  /** Present only on a learner turn. Two or three is the useful range. */
  wrong?: Wrong[]
}

export interface Dialogue {
  code: string
  /** A `curriculum_units.code`. */
  unit: string
  title: string
  situation: string
  turns: Turn[]
}
