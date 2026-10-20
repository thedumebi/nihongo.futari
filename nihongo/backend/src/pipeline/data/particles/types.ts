/**
 * Particles game questions, as authored.
 *
 * One set per particle lesson. Each question is a sentence ALREADY PUBLISHED,
 * written exactly as it is stored, with the gap in square brackets:
 * `学校[で]勉強します。`. The brackets hold the particle that is there; a
 * tokeniser word like には can lose just its に (`学校[に]は`).
 */
export interface AuthoredParticleQuestion {
  /** The published sentence, character for character, with the gap in [brackets]. */
  s: string
  /** Particles that would be just as right in the gap. They are never offered. */
  also?: string[]
  /** Three particles that are wrong in this sentence. */
  wrong: [string, string, string]
  /** Why the answer, in one line, for after answering. */
  why: string
}

export interface AuthoredParticleSet {
  /** The grammar point's slug: the lesson that teaches this use. */
  point: string
  questions: AuthoredParticleQuestion[]
}
