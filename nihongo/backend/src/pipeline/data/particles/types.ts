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

/**
 * A sentence written for a Particles lesson the published sentences could not
 * fill (に per, か or, や and so on). It arrives unpublished, with its tokens
 * and its recording, and is published by approving its lesson's set.
 */
export interface AuthoredParticleSentence {
  /** Stable, never reused: `sent-ptc-<lesson>-<n>`. */
  id: string
  /** As written: N5 kanji only, the rest in kana. */
  t: string
  /** The whole sentence in kana, word by word, particles as said: わ for は, お for を, え for へ. */
  r: string
  en: string
}
