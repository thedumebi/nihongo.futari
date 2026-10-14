/**
 * The authoring format for Speak sessions.
 *
 * A session is a run of steps, read in order:
 *   { x }       the teacher explains, in English — one small piece at a time
 *   { q, t, r } a prompt: q is the English to put into Japanese, t the answer as
 *               written, r the answer in kana with particles as SPOKEN (は→わ,
 *               を→お, へ→え) and a space at every word break
 *   n           optional, on a prompt: one line of "why", shown after the answer
 *   { s, r, e } stories only: the narrator reads s aloud (r its kana reading,
 *               spoken particles and word breaks as above); e is its English,
 *               shown on request, never spoken. Nothing to answer.
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

export interface NarrateStep {
  s: string
  r: string
  e: string
}

export type AuthoredStep = ExplainStep | PromptStep | NarrateStep

/** What the teacher says aloud in English on a step — nothing on a narration. */
export function teacherLine(step: AuthoredStep): string {
  return 'x' in step ? step.x : 'q' in step ? step.q : ''
}

/** The Japanese a step has recorded in the narrator's voice: a prompt's answer, or a narration. */
export function japaneseLine(step: AuthoredStep): string | null {
  return 'q' in step ? step.t : 's' in step ? step.s : null
}

export interface AuthoredSpeakSession {
  code: string
  level: SpeakLevel
  /** A story rather than a course session; numbered separately. */
  kind?: 'course' | 'story'
  /** Its place in the course, from 1 — counted within its kind. */
  number: number
  title: string
  titleEn: string
  /** Grammar patterns this session introduces, as they appear in the answers — 'です', 'ません'. */
  patterns: string[]
  steps: AuthoredStep[]
}
