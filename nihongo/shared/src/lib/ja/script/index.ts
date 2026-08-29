/**
 * Which script a piece of Japanese text is written in.
 *
 * Split out rather than left inside the furigana module because more than one
 * caller needs it: furigana alignment splits a surface into kanji runs, and the
 * study card needs to tell the reader what to type. The character ranges are
 * defined once, here.
 */

/** CJK ideographs, plus 々 (the repeat mark, which behaves as the kanji it repeats). */
const KANJI = /[\u3400-\u4DBF\u4E00-\u9FFF\u3005]/
const HIRAGANA = /[\u3041-\u309F]/
// Full-width katakana only. Half-width katakana is not something a
// learner types, and including it drags in the combining voiced marks.
const KATAKANA = /[\u30A0-\u30FF]/

export type JapaneseScript = 'kanji' | 'hiragana' | 'katakana' | 'mixed' | 'other'

export function hasKanji(text: string): boolean {
  return KANJI.test(text)
}

export function hasHiragana(text: string): boolean {
  return HIRAGANA.test(text)
}

export function hasKatakana(text: string): boolean {
  return KATAKANA.test(text)
}

/**
 * The script of a whole string.
 *
 * `mixed` covers the ordinary case of kanji with okurigana (帰る) as well as
 * genuinely mixed text — anything a reader would have to type using more than
 * one script. `other` is for text with no Japanese in it at all.
 */
export function scriptOf(text: string): JapaneseScript {
  const kanji = hasKanji(text)
  const hira = hasHiragana(text)
  const kata = hasKatakana(text)
  const kinds = Number(kanji) + Number(hira) + Number(kata)
  if (kinds === 0)
    return 'other'
  if (kinds > 1)
    return 'mixed'
  if (kanji)
    return 'kanji'
  return hira ? 'hiragana' : 'katakana'
}

/**
 * How to describe an expected answer to the reader, in words.
 *
 * Takes every accepted form, not just the primary: if the grader will take
 * either 呑む or 飲む there is nothing to warn about, but if it will only take
 * the kanji then saying so is the difference between a drill and a guess.
 *
 * Kept SHORT. This is placeholder text inside a single-line input on a phone,
 * where anything much longer than three words is cut off mid-sentence and the
 * part that got clipped is the part that mattered.
 */
export function describeScript(accepted: readonly string[]): string {
  const scripts = new Set(accepted.filter(Boolean).map(scriptOf))
  scripts.delete('other')
  if (scripts.size === 0)
    return 'Your answer'
  if (scripts.size > 1)
    return 'The missing word'

  switch ([...scripts][0]) {
    case 'hiragana':
      return 'In hiragana'
    case 'katakana':
      return 'In katakana'
    case 'kanji':
      return 'In kanji'
    default:
      // Kanji plus okurigana — the whole word, written as it normally is.
      return 'In kanji + okurigana'
  }
}
