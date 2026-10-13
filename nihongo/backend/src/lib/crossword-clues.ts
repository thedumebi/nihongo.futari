import { hasHiragana, hasKanji, hasKatakana, kanaToRomaji } from '@nihongo/shared/lib'

import { posLabel } from './pos.js'

/**
 * A crossword clue from a dictionary entry, or null when the word should not
 * be in a crossword at all.
 *
 * Clues are JMdict's own meanings — grounded data, nothing written, so no
 * review queue. Most entries make a fair clue; some cannot:
 *
 * - kinds of word whose meaning IS the answer, or is grammar rather than a
 *   meaning — numerals ("one; 1"), counters, particles ("indicates sentence
 *   topic"), auxiliaries, conjunctions, interjections, prefixes, suffixes,
 *   set expressions;
 * - senses a learner will not meet — archaic, rare, dated, obsolete, poetic,
 *   historical, slang;
 * - meanings that give the answer away: the romaji itself (ペン "pen", ゼロ
 *   "zero", 漢字 "kanji"), or Japanese inside the gloss.
 *
 * Filtering is on JMdict's tags, not on the gloss text: a rule on the word
 * "one" would also throw out これ "this one".
 */

const NOT_CLUEABLE_POS = new Set([
  'num',
  'ctr',
  'prt',
  'aux',
  'aux-v',
  'aux-adj',
  'cop',
  'conj',
  'int',
  'pref',
  'n-pref',
  'suf',
  'n-suf',
  'exp'
])

const NOT_CLUEABLE_MISC = new Set(['arch', 'rare', 'dated', 'obs', 'poet', 'hist', 'sl', 'chn', 'leg'])

/** An aside longer than this is the sense's small print, not the meaning. */
const LONGEST_ASIDE = 25

interface ClueSource {
  reading: string
  /** The written form — kanji where there is one. */
  form: string
  /** The first sense's glosses, in order. */
  glosses: string[]
  pos: string[]
  misc: string[]
}

/** Lowercase letters only, for comparing a gloss with a romanised reading. */
const letters = (text: string) => text.toLowerCase().replace(/[^a-z]/g, '')

/** "noun", "verb", "adjective" — the broad kind, which is all a clue needs. */
function kind(pos: string[]): string | null {
  const label = posLabel(pos)
  if (!label)
    return null
  for (const broad of ['verb', 'adjective', 'adverb', 'pronoun', 'noun']) {
    if (label.includes(broad))
      return broad
  }
  return label
}

export function crosswordClue(source: ClueSource): string | null {
  if (source.pos.some(p => NOT_CLUEABLE_POS.has(p)) || source.misc.some(m => NOT_CLUEABLE_MISC.has(m)))
    return null

  const romaji = letters(kanaToRomaji(source.reading))
  const meanings = source.glosses
    .slice(0, 2)
    .map(g => g.replace(/\s*\(([^)]*)\)/g, (aside, inner: string) => inner.length > LONGEST_ASIDE ? '' : aside).trim())
    .filter(Boolean)
  if (meanings.length === 0)
    return null

  for (const meaning of meanings) {
    // Japanese in the meaning — 半 "half (e.g. にじはん)" — reads the answer out.
    if (hasHiragana(meaning) || hasKatakana(meaning) || hasKanji(meaning) || meaning.includes(source.form))
      return null
    // The romaji as a word of the meaning: ペン "pen", 漢字 "kanji".
    if (romaji.length >= 2 && meaning.toLowerCase().split(/[^a-z]+/).includes(romaji))
      return null
    if (romaji.length >= 5 && letters(meaning).includes(romaji))
      return null
  }

  const broad = kind(source.pos)
  return broad ? `${meanings.join('; ')} (${broad})` : meanings.join('; ')
}
