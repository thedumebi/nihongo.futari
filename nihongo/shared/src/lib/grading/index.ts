import { looksLikeRomaji, romajiToHiragana } from '../ja/romaji/index.js'

/**
 * Answer grading.
 *
 * Pure functions, keyed by `exercise_templates.grader_code`, so they run
 * identically in the browser (needed for offline review) and on the server.
 */

/** Kana and kanji. Input containing any of these is already Japanese. */
const JAPANESE = /[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF]/

/** Strip whitespace and case; keep the characters themselves untouched. */
function basicNormalise(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '')
}

/**
 * Romaji normalisation.
 *
 * Learners type what they hear, and English keyboards make several spellings
 * equally reasonable — si/shi, tu/tsu, hu/fu, zi/ji. Marking those wrong
 * teaches transliteration trivia rather than Japanese, so they are folded
 * together here and the accepted list only has to carry genuinely distinct
 * answers.
 */
export function normaliseRomaji(value: string): string {
  return basicNormalise(value)
    .replace(/[āâ]/g, 'a')
    .replace(/[īî]/g, 'i')
    .replace(/[ūû]/g, 'u')
    .replace(/[ēê]/g, 'e')
    .replace(/[ōô]/g, 'o')
    .replace(/shi/g, 'si')
    .replace(/chi/g, 'ti')
    .replace(/tsu/g, 'tu')
    .replace(/sha/g, 'sya')
    .replace(/shu/g, 'syu')
    .replace(/sho/g, 'syo')
    .replace(/cha/g, 'tya')
    .replace(/chu/g, 'tyu')
    .replace(/cho/g, 'tyo')
    .replace(/ja/g, 'zya')
    .replace(/ju/g, 'zyu')
    .replace(/jo/g, 'zyo')
    .replace(/fu/g, 'hu')
    .replace(/ji/g, 'zi')
    .replace(/j/g, 'z')
    .replace(/nn$/, 'n')
}

/**
 * Japanese text normalisation: trim, drop spaces, fold katakana to hiragana so
 * answering in either script is accepted, and convert romaji to kana.
 *
 * The romaji step matters more than it looks. The app will render a whole
 * sentence in romaji if you ask it to, and it then refused "gohan" for ご飯 —
 * showing someone a script and then not accepting it is the app contradicting
 * itself. It also removes the need for a Japanese keyboard, which is the
 * difference between practising on a phone and not.
 *
 * Only applied when the input has no Japanese in it at all. A learner typing
 * ごはん must not have their answer put through a romaji converter.
 */
export function normaliseJapanese(value: string): string {
  const folded = basicNormalise(value).replace(
    /[\u30A1-\u30F6]/g,
    ch => String.fromCharCode(ch.charCodeAt(0) - 0x60)
  )
  return JAPANESE.test(folded) || !looksLikeRomaji(folded)
    ? folded
    : romajiToHiragana(folded)
}

export interface GradeResult {
  correct: boolean
  /** The canonical answer, for the "the answer was…" line. */
  expected: string
}

export function gradeAnswer(
  graderCode: string,
  given: string,
  answer: { primary: string, accepted: string[] }
): GradeResult {
  const candidates = [answer.primary, ...answer.accepted]
  const expected = answer.primary

  switch (graderCode) {
    case 'fuzzy-romaji': {
      const g = normaliseRomaji(given)
      return { correct: candidates.some(c => normaliseRomaji(c) === g), expected }
    }
    case 'exact-kana':
    case 'normalised-jp': {
      const g = normaliseJapanese(given)
      return { correct: candidates.some(c => normaliseJapanese(c) === g), expected }
    }
    case 'sequence': {
      // Word order: the client sends the arranged tokens joined together, so
      // this is a Japanese string comparison like any other. It gets its own
      // case rather than falling through to the generic default, where romaji
      // rules would be applied to Japanese text.
      const g = normaliseJapanese(given)
      return { correct: candidates.some(c => normaliseJapanese(c) === g), expected }
    }
    case 'choice-id':
      return { correct: candidates.includes(given), expected }
    default: {
      const g = basicNormalise(given)
      return { correct: candidates.some(c => basicNormalise(c) === g), expected }
    }
  }
}
