import type { Twin } from '@/types/study.js'

import { gradeAnswer } from './index.js'

/**
 * Twins: two words the same English fits. "The missing word means 'car'" is
 * true of 車 and of 自動車, so a fill-in question with only its meaning to go
 * on cannot say which one it wants, and typing the other was marked wrong.
 *
 * The question names the sound its word starts with, as far as it takes to
 * tell it from its twins, and a twin typed anyway counts as right: it is the
 * right word for the meaning, and the learner is shown which one the sentence
 * used.
 */

const SMALL = new Set([...'ゃゅょぁぃぅぇぉャュョァィゥェォ'])

/** A reading cut into morae: きょう is きょ + う, a small kana joins the one before. */
function morae(reading: string): string[] {
  const out: string[] = []
  for (const ch of reading.trim()) {
    if (SMALL.has(ch) && out.length)
      out[out.length - 1] += ch
    else out.push(ch)
  }
  return out
}

/**
 * The shortest start of `reading`, whole morae, that none of `others` begins
 * with: じ for じどうしゃ against くるま, しつ for しつもん against しごと. Null when
 * no start tells them apart (one reading is the start of the other).
 */
export function distinguishingStart(reading: string, others: readonly string[]): string | null {
  const parts = morae(reading)
  for (let n = 1; n <= parts.length; n++) {
    const start = parts.slice(0, n).join('')
    if (!others.some(o => o.startsWith(start)))
      return start
  }
  return null
}

/** The twin a typed answer is, if it is one: written, in kana or in romaji. */
export function typedTwin(graderCode: string, typed: string, twins: readonly Twin[]): Twin | null {
  if (!typed.trim())
    return null
  return twins.find(t => gradeAnswer(graderCode, typed, { primary: t.form, accepted: [t.form, t.reading] }).correct) ?? null
}

/**
 * A fill-in graded with its twins: the card's own word is right, and so is a
 * twin, which comes back as `twin` so the page can say which word the sentence
 * used.
 */
export function gradeWithTwins(
  graderCode: string,
  typed: string,
  answer: Parameters<typeof gradeAnswer>[2],
  twins: readonly Twin[]
): ReturnType<typeof gradeAnswer> & { twin: Twin | null } {
  const graded = gradeAnswer(graderCode, typed, answer)
  const twin = graded.correct ? null : typedTwin(graderCode, typed, twins)
  return { ...graded, correct: graded.correct || twin !== null, twin }
}
