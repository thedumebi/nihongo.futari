/**
 * A token's reading and its ruby, worked out from the dictionary.
 *
 * Shared by the authored-sentence tokeniser, which writes these into
 * `sentence_tokens`, and by the lesson service, which needs them for the
 * Japanese embedded in an explanation — 食べる → 食べます sitting in a paragraph
 * of English has no line reading to be cut from, so the dictionary is the only
 * source there is.
 */
import type { GlossedToken } from '@nihongo/shared/types'

import { alignFurigana, alignInflected } from '@nihongo/shared/lib'

/**
 * This token's reading and its ruby, or neither.
 *
 * The DICTIONARY reading is tried first and the line's own cut second.
 *
 * `glossLine`'s per-token reading comes from `splitReading`, which exists to
 * space romaji: inside a run of kanji it puts the whole run's reading on the
 * first character, because slicing anywhere in the run still romanises
 * correctly. That is right for its purpose and wrong for ruby — 毎朝早く came
 * back with 毎朝 annotated まいあさ はや, carrying 早's reading into the word
 * before it. The dictionary knows 毎朝 is まいあさ and has no such problem.
 *
 * The line's cut is still needed for anything inflected: the dictionary holds
 * 行く/いく, and only the sentence knows this one says 行きます/いきます.
 *
 * If neither aligns, the token gets no reading at all. A word shown with no
 * furigana is a gap; a word shown with the wrong furigana teaches the wrong
 * thing, and 早く annotated く is worse than 早く annotated nothing.
 */
export function readingFor(token: GlossedToken): { reading: string | null, furigana: Array<{ t: string, r?: string }> } {
  // Whitespace stripped, not trimmed: a token is ONE word, so no space belongs
  // inside its reading. The authoring format spaces words apart — 電話 して —
  // and those spaces ride through onto the token as ' でんわ して'.
  const clean = (r: unknown) => (typeof r === 'string' ? r.replace(/\s+/g, '') : '')

  // The LINE's reading first, then the dictionary's.
  //
  // The line knows which word this is; the dictionary only knows which words
  // share the spelling. 寝る前に reads まえ, but 前 is also ぜん, and a single
  // kanji aligns against ANY reading — so preferring the dictionary annotated
  // 前 as ぜん, 店 as てん, 家 as け and ご飯 as ごめし. Four wrong readings
  // taught with the authority of ruby, and `check:examples` cannot see them
  // because the segmentation is perfectly correct.
  const line = clean(token.r)
  const dict = clean(token.w?.reading)

  const fits = (r: string) => {
    if (!r || r === token.t)
      return null
    const aligned = alignFurigana(token.t, r)
    return aligned.confidence > 0 ? { reading: r, furigana: aligned.segments } : null
  }

  const fromLine = fits(line)
  const fromDict = fits(dict)

  // The line usually wins, because it knows WHICH word this is where the
  // dictionary only knows which words share the spelling: 寝る前に reads まえ,
  // and 前 is also ぜん. A single kanji aligns against any reading at all, so
  // trusting the dictionary annotated 前 as ぜん, 店 as てん, 家 as け.
  //
  // Except when the line's reading has swallowed a neighbour. `splitReading`
  // puts a whole run of kanji's reading on its first character — correct for
  // spacing romaji, wrong for ruby — so 毎朝早く gave 毎朝 the reading
  // まいあさはや.
  //
  // The tell is that the dictionary reading is a PREFIX of the line's: the word
  // is there, with somebody else's reading stuck to the end of it. Merely being
  // shorter is not enough — 家 is いえ in the line and け in the dictionary, and
  // け is shorter but is simply a different word.
  if (fromLine && fromDict)
    return dict && line.startsWith(dict) && dict.length < line.length ? fromDict : fromLine
  if (fromLine)
    return fromLine
  if (fromDict)
    return fromDict

  // The word INFLECTED, which is neither its dictionary reading nor a reading
  // the line could supply.
  //
  // 早く is 早い bent into an adverb: the dictionary says はやい, which does not
  // align with 早く, and the line's own cut gave just く. It ended up with no
  // reading at all — and a chip with no ruby renders as the bare kanji, so the
  // word-order question showed 早く with "早 ku" over it in romaji mode. A
  // beginner cannot read that, which is the whole reason furigana exists.
  //
  // `alignInflected` knows the trick: align the LEMMA, keep the reading of its
  // kanji stem, and let the okurigana differ.
  const w = token.w
  if (w?.form && w.reading) {
    const aligned = alignInflected(token.t, w.form, clean(w.reading))
    if (aligned.confidence > 0) {
      const reading = aligned.segments.map(seg => seg.r ?? seg.t).join('')
      return { reading, furigana: aligned.segments }
    }
  }

  return { reading: null, furigana: [{ t: token.t }] }
}
