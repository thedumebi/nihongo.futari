/**
 * The authoring format for Speak sessions.
 *
 * A session is a run of steps, read in order:
 *   { x }       the teacher explains, in English — one small piece at a time
 *   { q, t, r } a prompt: q is the English to put into Japanese, t the answer as
 *               written, r the answer in kana with particles as SPOKEN (は→わ,
 *               を→お, へ→え) and a space at every word break
 *   n           optional, on a prompt: one line of "why", shown after the answer
 *
 * `patterns` names the grammar this session teaches, and `check:speak` refuses
 * a prompt that uses a pattern no session so far has taught. Each prompt should
 * add one piece to what came before — the checker warns when one adds more than
 * two new words.
 *
 * There is no status: a session ships in a seed (`pnpm seed:speak`)
 * unpublished, with a pending row in the admin review queue.
 */

export type SpeakLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

export interface ExplainStep {
  x: string
}

export interface PromptStep {
  q: string
  t: string
  r: string
  n?: string
}

export type AuthoredStep = ExplainStep | PromptStep

export interface AuthoredSpeakSession {
  code: string
  level: SpeakLevel
  /** Its place in the course, from 1. */
  number: number
  title: string
  titleEn: string
  /** Grammar patterns this session introduces, as they appear in the answers — 'です', 'ません'. */
  patterns: string[]
  steps: AuthoredStep[]
}
