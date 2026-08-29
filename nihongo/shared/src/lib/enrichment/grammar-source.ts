/**
 * Choosing the right Wiktionary entry for a grammar point.
 *
 * Wiktionary has several entries per kana, and the wrong one is not merely
 * unhelpful — it is confidently wrong. Ask it about は and the `syllable` entry
 * answers "derived in the Heian period from writing the man'yōgana kanji 波 in
 * the cursive sōsho style". That is the history of the LETTER, not the topic
 * particle. Ground an explanation in it and the model will faithfully,
 * verifiably, quote its way to nonsense.
 *
 * So the part of speech is a filter, not a preference.
 */

/** Entries that can describe a grammatical function. */
const GRAMMATICAL_POS = new Set([
  'particle',
  'suffix',
  'prefix',
  'verb',
  'auxiliary',
  'auxiliary verb',
  'adverb',
  'conjunction',
  'interjection',
  'adjective',
  'adnominal',
  'phrase',
  'counter',
  'copula'
])

/**
 * Entries that describe the WRITING SYSTEM rather than the word.
 * Rejected outright: no grammar point is explained by the shape of its kana.
 */
const SCRIPT_POS = new Set(['syllable', 'character', 'letter', 'symbol', 'romanization'])

export function isGrammaticalPos(pos: string): boolean {
  const normalised = pos.trim().toLowerCase()
  if (SCRIPT_POS.has(normalised))
    return false
  return GRAMMATICAL_POS.has(normalised)
}

/**
 * The lookup key for a grammar point's title.
 *
 * Titles are written for a reader — '〜ます', 'は (topic)', '〜て form' — and
 * none of those strings appear in a dictionary. Strip the decoration down to
 * the morpheme itself.
 */
export function grammarLookupKey(title: string): string {
  return title
    .replace(/[〜～]/gu, '')
    .replace(/\([^)]*\)/gu, '')
    .replace(/\s*\bform\b/giu, '')
    .replace(/\s+/gu, '')
    .trim()
}

/** Pick the best-grounded entry, or null when only script entries exist. */
export function pickGrammarEntry<T extends { pos: string, text: string }>(entries: T[]): T | null {
  const usable = entries.filter(e => isGrammaticalPos(e.pos))
  if (usable.length === 0)
    return null
  // Longest prose wins: a one-line stub explains less than a full etymology,
  // and the model can only work with what the passage actually contains.
  return usable.reduce((best, e) => (e.text.length > best.text.length ? e : best))
}

/**
 * Entries that describe a Han CHARACTER rather than a word.
 *
 * The exact inverse of `isGrammaticalPos`. For a grammar point, a `character`
 * entry is the wrong question — it explains the glyph, not the function. For a
 * kanji's glyph origin it is the ONLY right answer, and a `noun` entry (the
 * word written with that kanji) would be the wrong question instead.
 *
 * Same trap, opposite direction: the filter has to match what is being asked.
 */
const GLYPH_POS = new Set(['character', 'han character', 'symbol'])

export function isGlyphPos(pos: string): boolean {
  return GLYPH_POS.has(pos.trim().toLowerCase())
}

/** Pick the fullest glyph-origin entry, or null if none describes the glyph. */
export function pickGlyphEntry<T extends { pos: string, text: string }>(entries: T[]): T | null {
  const usable = entries.filter(e => isGlyphPos(e.pos))
  if (usable.length === 0)
    return null
  return usable.reduce((best, e) => (e.text.length > best.text.length ? e : best))
}
