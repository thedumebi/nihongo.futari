/**
 * Pitch accent.
 *
 * Japanese pitch is not stress: every mora is either high or low, and a word is
 * described by WHERE the pitch drops. Kanjium gives that drop as a single
 * number, which is meaningless on its own — 2 is a different pattern in a
 * two-mora word than in a four-mora one — so the mora count has to be computed
 * before the number can be classified or drawn.
 */

export type PitchPattern = 'heiban' | 'atamadaka' | 'nakadaka' | 'odaka'

/**
 * Small kana that ride on the preceding mora rather than forming their own.
 *
 * This is the whole subtlety of mora counting: きょ is ONE mora, not two, so
 * counting characters would misclassify every yōon word in the language.
 * っ, ん and ー are NOT here — each is a mora in its own right.
 */
const COMBINING = new Set([
  'ゃ',
  'ゅ',
  'ょ',
  'ぁ',
  'ぃ',
  'ぅ',
  'ぇ',
  'ぉ',
  'ゎ',
  'ャ',
  'ュ',
  'ョ',
  'ァ',
  'ィ',
  'ゥ',
  'ェ',
  'ォ',
  'ヮ'
])

/** Count morae in a kana reading. */
export function countMorae(reading: string): number {
  let count = 0
  for (const char of reading) {
    if (!COMBINING.has(char))
      count++
  }
  return count
}

/**
 * Classify a downstep position against the word's length.
 *
 *  0            平板 heiban    — no drop; stays high to the end
 *  1            頭高 atamadaka — drops immediately after the first mora
 *  = mora count 尾高 odaka     — drops on the following particle
 *  otherwise    中高 nakadaka  — drops somewhere in the middle
 *
 * odaka and heiban sound identical in isolation and differ only once a particle
 * follows, which is exactly why the distinction is worth storing.
 */
export function classifyPitch(position: number, moraCount: number): PitchPattern {
  if (position === 0)
    return 'heiban'
  if (position === 1)
    return 'atamadaka'
  if (position >= moraCount)
    return 'odaka'
  return 'nakadaka'
}

/**
 * The high/low shape, one entry per mora plus a trailing entry for the particle.
 *
 * The trailing value is what makes heiban and odaka distinguishable on screen.
 */
export function pitchShape(position: number, moraCount: number): boolean[] {
  const shape: boolean[] = []
  for (let mora = 1; mora <= moraCount; mora++) {
    if (position === 0)
      shape.push(mora !== 1)
    else if (position === 1)
      shape.push(mora === 1)
    else shape.push(mora !== 1 && mora <= position)
  }
  // The particle that would follow: low unless the word is heiban.
  shape.push(position === 0)
  return shape
}
