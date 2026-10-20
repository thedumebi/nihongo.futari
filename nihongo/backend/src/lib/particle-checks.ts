import { GAME_PARTICLES } from '@nihongo/shared/lib'

import type { AuthoredParticleQuestion, AuthoredParticleSet } from '@/pipeline/data/particles/types.js'

/**
 * Checks on authored Particles questions that need no database: the gap is
 * well formed, the options are particles, and no wrong option is also right.
 * `check:particles` adds the ones against the database.
 */

const PARTICLES: ReadonlySet<string> = new Set(GAME_PARTICLES)

export interface ParticleGap {
  /** The sentence as stored, brackets removed. */
  text: string
  /** Code-point offsets of the gap. */
  start: number
  end: number
  answer: string
}

/** The sentence and its gap, or null when there is not exactly one [gap]. */
export function parseGap(s: string): ParticleGap | null {
  const match = /^([^[\]]*)\[([^[\]]+)\]([^[\]]*)$/.exec(s)
  if (!match)
    return null
  const [, before, answer, after] = match as unknown as [string, string, string, string]
  const start = [...before].length
  return { text: before + answer + after, start, end: start + [...answer].length, answer }
}

/** Problems with one question, each a line for the report. */
export function particleQuestionProblems(q: AuthoredParticleQuestion): string[] {
  const problems: string[] = []
  const gap = parseGap(q.s)
  if (!gap)
    return ['needs exactly one [gap]']
  if (!PARTICLES.has(gap.answer))
    problems.push(`the gap holds "${gap.answer}", which is not a game particle`)
  const also = q.also ?? []
  for (const p of [...also, ...q.wrong]) {
    if (!PARTICLES.has(p))
      problems.push(`"${p}" is not a game particle`)
  }
  if (q.wrong.length !== 3 || new Set(q.wrong).size !== 3)
    problems.push('needs three different wrong particles')
  if (q.wrong.includes(gap.answer))
    problems.push(`the answer ${gap.answer} is listed as wrong`)
  for (const p of q.wrong.filter(w => also.includes(w)))
    problems.push(`${p} is listed as both wrong and also right`)
  if (also.includes(gap.answer))
    problems.push('the answer is listed as also right')
  if (!q.why.trim())
    problems.push('has no why')
  if (/[—–]/.test(q.why) || /[—–]/.test(q.s))
    problems.push('uses a dash; write it with a comma, colon or full stop')
  return problems
}

/** The same gap authored twice, in one set or across sets. */
export function duplicateGaps(sets: readonly AuthoredParticleSet[]): string[] {
  const seen = new Map<string, string>()
  const problems: string[] = []
  for (const set of sets) {
    for (const q of set.questions) {
      const gap = parseGap(q.s)
      if (!gap)
        continue
      const key = `${gap.text}@${gap.start}`
      const first = seen.get(key)
      if (first)
        problems.push(`${set.point}: ${q.s} is already a question in ${first}`)
      else seen.set(key, set.point)
    }
  }
  return problems
}

/**
 * The gap against the sentence's words: it must start where a word starts, and
 * anything left of that word after the gap must itself be particles. には may
 * lose its に; the は of はい, the に of 静かに, may not.
 */
export function gapFitsTokens(gap: ParticleGap, tokens: ReadonlyArray<{ surface: string, charStart: number }>): boolean {
  const token = tokens.find(t => t.charStart === gap.start)
  if (!token)
    return false
  const rest = [...token.surface].slice(gap.end - gap.start).join('')
  if (![...token.surface].join('').startsWith(gap.answer))
    return false
  return rest === '' || splitsIntoParticles(rest)
}

function splitsIntoParticles(text: string): boolean {
  if (text === '')
    return true
  return GAME_PARTICLES.some(p => text.startsWith(p) && splitsIntoParticles(text.slice(p.length)))
}
