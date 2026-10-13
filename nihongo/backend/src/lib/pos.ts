/**
 * JMdict part-of-speech codes as words a beginner can read — "godan verb",
 * "particle". Shared by the word sheet and the crossword's clues, so the two
 * always name a word's kind the same way.
 */

/** JMdict part-of-speech codes, in words a beginner can use. */
const POS_LABELS: Record<string, string> = {
  'n': 'noun',
  'n-adv': 'noun',
  'n-t': 'noun',
  'pn': 'pronoun',
  'adj': 'adjective',
  'adj-i': 'i-adjective',
  'adj-na': 'na-adjective',
  'adj-no': 'adjective',
  'adj-pn': 'adjective',
  'adv': 'adverb',
  'adv-to': 'adverb',
  'conj': 'conjunction',
  'int': 'interjection',
  'prt': 'particle',
  'prefix': 'prefix',
  'suf': 'suffix',
  'pref': 'prefix',
  'ctr': 'counter',
  'exp': 'expression',
  'aux': 'auxiliary',
  'aux-v': 'auxiliary verb',
  'aux-adj': 'auxiliary adjective',
  'vs': 'suru verb',
  'vs-i': 'suru verb',
  'vs-s': 'suru verb',
  'vk': 'kuru verb',
  'v1': 'ichidan verb',
  'v1-s': 'ichidan verb',
  'vz': 'ichidan verb'
}

/**
 * The godan verbs, which JMdict spells as one code per final consonant —
 * `v5k`, `v5r-i`, `v5u-s` and a dozen more. Matching the family by prefix
 * beats listing every variant and then missing one.
 */
export function posLabel(codes: string[]): string | null {
  for (const code of codes) {
    const known = POS_LABELS[code]
    if (known)
      return known
    if (code.startsWith('v5'))
      return 'godan verb'
    if (code.startsWith('v'))
      return 'verb'
  }
  return null
}
