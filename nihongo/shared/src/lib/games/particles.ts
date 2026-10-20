import type { ParticleQuestion, ParticlesRound } from '@/types/games.js'

/**
 * Particles: a sentence with its particle taken out, and four boxes to pick
 * from. The questions are authored and reviewed; this only deals them out.
 */

/** Every particle a question may ask for or offer. A box never shows anything else. */
export const GAME_PARTICLES = [
  'は',
  'が',
  'を',
  'に',
  'で',
  'へ',
  'と',
  'も',
  'の',
  'か',
  'や',
  'から',
  'まで',
  'より',
  'ね',
  'よ'
] as const

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

/**
 * A game's rounds: sentences the learner knows more of first, at most one
 * question per sentence, in a random order, each with its four boxes shuffled.
 *
 * Familiarity is bucketed by quarters so a game is not the same fifteen
 * sentences every time: within a bucket the pick is random.
 */
export function buildParticleRounds(
  questions: readonly ParticleQuestion[],
  size: number,
  random: () => number = Math.random
): ParticlesRound[] {
  const bucket = (q: ParticleQuestion) => Math.floor(q.familiar * 4)
  const ranked = shuffled(questions, random).sort((a, b) => bucket(b) - bucket(a))
  const seen = new Set<string>()
  const chosen: ParticleQuestion[] = []
  for (const q of ranked) {
    if (chosen.length >= size)
      break
    if (seen.has(q.sentenceId))
      continue
    seen.add(q.sentenceId)
    chosen.push(q)
  }
  return shuffled(chosen, random).map(question => ({
    question,
    options: shuffled([question.answer, ...question.wrong], random)
  }))
}
