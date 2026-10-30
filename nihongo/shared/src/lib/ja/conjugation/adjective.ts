/**
 * Adjective conjugation: い-adjectives (高い), いい/良い, whose stem is よ, and
 * な-adjectives (静か), which conjugate by the copula after them.
 *
 * Kept apart from `conjugate`, which is verbs only and feeds the glossary's
 * inflection index. These are read by the dictionary's conjugation table.
 */

export const ADJECTIVE_KINDS = ['i', 'ix', 'na'] as const
export type AdjectiveKind = typeof ADJECTIVE_KINDS[number]

export const ADJECTIVE_FORMS = [
  'present',
  'negative',
  'past',
  'past-negative',
  'polite-present',
  'polite-negative',
  'polite-past',
  'polite-past-negative',
  'te',
  'adverb',
  'conditional-ba',
  'conditional-tara',
  'attributive'
] as const
export type AdjectiveForm = typeof ADJECTIVE_FORMS[number]

export interface AdjectiveInput {
  surface: string
  reading: string
  kind: AdjectiveKind
}

/** From JMdict codes. `adj-ix` first: いい is an い-adjective with its own stem. */
export function adjectiveKind(pos: readonly string[]): AdjectiveKind | null {
  if (pos.includes('adj-ix'))
    return 'ix'
  if (pos.includes('adj-i'))
    return 'i'
  if (pos.includes('adj-na'))
    return 'na'
  return null
}

/** What follows the stem of an い-adjective, per form. */
const I_ENDINGS: Record<AdjectiveForm, string | null> = {
  'present': null,
  'negative': 'くない',
  'past': 'かった',
  'past-negative': 'くなかった',
  'polite-present': null,
  'polite-negative': 'くないです',
  'polite-past': 'かったです',
  'polite-past-negative': 'くなかったです',
  'te': 'くて',
  'adverb': 'く',
  'conditional-ba': 'ければ',
  'conditional-tara': 'かったら',
  'attributive': null
}

/** What follows a な-adjective, per form: the copula, conjugated. */
const NA_ENDINGS: Record<AdjectiveForm, string> = {
  'present': 'だ',
  'negative': 'じゃない',
  'past': 'だった',
  'past-negative': 'じゃなかった',
  'polite-present': 'です',
  'polite-negative': 'じゃありません',
  'polite-past': 'でした',
  'polite-past-negative': 'じゃありませんでした',
  'te': 'で',
  'adverb': 'に',
  'conditional-ba': 'なら',
  'conditional-tara': 'だったら',
  'attributive': 'な'
}

/**
 * The stem an ending attaches to. 高い → 高. いい and 良い → よ, keeping the
 * kanji where there is one: 良い → 良くない, いい → よくない, never いくない.
 */
function iStem(text: string, kind: AdjectiveKind): string {
  if (kind === 'ix' && text.endsWith('いい'))
    return `${text.slice(0, -2)}よ`
  return text.slice(0, -1)
}

export function conjugateAdjective(input: AdjectiveInput, form: AdjectiveForm): { surface: string, reading: string } | null {
  const { surface, reading, kind } = input
  if (!surface || !reading)
    return null

  if (kind === 'na') {
    const ending = NA_ENDINGS[form]
    return { surface: surface + ending, reading: reading + ending }
  }

  if (!surface.endsWith('い') || !reading.endsWith('い'))
    return null
  // The dictionary form stands as it is, before a noun too; politely it takes です.
  if (form === 'present' || form === 'attributive')
    return { surface, reading }
  if (form === 'polite-present')
    return { surface: `${surface}です`, reading: `${reading}です` }
  const ending = I_ENDINGS[form]
  if (ending === null)
    return null
  return { surface: iStem(surface, kind) + ending, reading: iStem(reading, kind) + ending }
}
