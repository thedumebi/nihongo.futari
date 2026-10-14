import type { GlossedToken } from '@nihongo/shared/types'

import { hasKanji, speakBracesBalanced } from '@nihongo/shared/lib'

import type { AuthoredSpeakSession } from '@/pipeline/data/speak/types.js'

import { LEVEL_RANK } from './reading-checks.js'

/**
 * The rules a Speak session must keep before anyone reads it.
 *
 * Pure, so they are tested without a database; `check-speak.ts` feeds them the
 * glossary, and the seed generator refuses to write anything that fails.
 */

/** A prompt adding more than this many words at once is not building up — it is a new sentence. */
export const MAX_NEW_WORDS = 2

/** Shape problems that need nothing but the data. */
export function speakWellFormed(all: AuthoredSpeakSession[]): string[] {
  const problems: string[] = []
  const codes = new Set<string>()

  for (const session of all) {
    const at = session.code
    if (codes.has(at))
      problems.push(`${at}: duplicate code`)
    codes.add(at)
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(at))
      problems.push(`${at}: code must be kebab-case`)
    if (!session.title.trim() || !session.titleEn.trim())
      problems.push(`${at}: missing title`)
    if (!session.steps.some(s => 'q' in s))
      problems.push(`${at}: no prompts — nothing to say`)
    if (!('x' in (session.steps[0] ?? {})))
      problems.push(`${at}: must open with the teacher explaining, not a prompt`)
    for (const pattern of session.patterns) {
      if ([...pattern].length < 2)
        problems.push(`${at}: pattern "${pattern}" is too short to look for safely`)
    }

    for (const [i, step] of session.steps.entries()) {
      const where = `${at} step ${i}`
      const line = 'x' in step ? step.x : step.q
      if (!line.trim())
        problems.push(`${where}: nothing for the teacher to say`)
      if (!speakBracesBalanced(line))
        problems.push(`${where}: unbalanced {braces} in "${line}"`)
      if ('q' in step) {
        if (!step.t.trim() || !step.r.trim())
          problems.push(`${where}: a prompt needs its answer and reading`)
        if (hasKanji(step.r))
          problems.push(`${where}: reading contains kanji — "${step.r}"`)
        // A note is shown, not spoken, and not cut into runs.
        if (step.n && /[{}]/.test(step.n))
          problems.push(`${where}: a note is shown as written — no {braces}`)
      }
    }
  }

  // Sessions are a course: numbered from 1 within a level, without gaps.
  for (const level of new Set(all.map(s => s.level))) {
    const numbers = all.filter(s => s.level === level).map(s => s.number).sort((a, b) => a - b)
    numbers.forEach((n, i) => {
      if (n !== i + 1)
        problems.push(`${level}: session numbers must run 1, 2, 3 … without gaps (found ${numbers.join(', ')})`)
    })
  }

  return [...new Set(problems)]
}

/**
 * Prompts that use a pattern before the course has taught it.
 *
 * Every session declares what it introduces. A prompt in session 3 that says
 * ませんでした when session 4 is where that is taught is asking the learner to
 * produce something they have never been shown — the one thing the method
 * never does.
 */
export function patternsBeforeTaught(all: AuthoredSpeakSession[]): string[] {
  const problems: string[] = []
  // By level RANK — N5 first. Sorting the codes as text put "N4" before "N5",
  // so every N4 session seemed to use N5 grammar before it was taught.
  const ordered = [...all].sort((a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level] || a.number - b.number)
  const everything = new Set(all.flatMap(s => s.patterns))
  const taught = new Set<string>()

  for (const session of ordered) {
    for (const pattern of session.patterns) taught.add(pattern)
    const notYet = [...everything].filter(p => !taught.has(p))
    for (const [i, step] of session.steps.entries()) {
      if (!('t' in step))
        continue
      for (const pattern of notYet) {
        if (step.t.includes(pattern))
          problems.push(`${session.code} step ${i} 「${step.t}」 uses 「${pattern}」 before the session that teaches it`)
      }
    }
  }
  return problems
}

/** A token that carries meaning — not punctuation, not a particle on its own. */
function contentWord(token: GlossedToken): string | null {
  if (!/\p{L}/u.test(token.t))
    return null
  // A lone kana the dictionary has nothing for is a particle or an ending.
  if (!token.w && [...token.t].length === 1)
    return null
  if (token.w?.pos === 'particle')
    return null
  return token.w?.form ?? token.t
}

/**
 * Prompts that add too much at once.
 *
 * The method's promise is that each answer is the last one plus a piece. Words
 * are counted against everything said earlier in the same session — the
 * explanations included, since a word the teacher has just said aloud is not
 * new to the learner.
 */
export function tooManyNewWords(
  steps: Array<{ index: number, tokens: GlossedToken[], said?: GlossedToken[] }>,
  /** Words from earlier sessions — the course is cumulative. Updated in place. */
  seen = new Set<string>()
): Array<{ index: number, added: string[] }> {
  const out: Array<{ index: number, added: string[] }> = []
  for (const step of steps) {
    for (const token of step.said ?? []) {
      const word = contentWord(token)
      if (word)
        seen.add(word)
    }
    const added = [...new Set(step.tokens.map(contentWord).filter((w): w is string => w !== null && !seen.has(w)))]
    if (step.tokens.length > 0 && added.length > MAX_NEW_WORDS && seen.size > 0)
      out.push({ index: step.index, added })
    for (const word of added) seen.add(word)
  }
  return out
}
