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

  for (const r of [clean(token.w?.reading), clean(token.r)]) {
    if (!r || r === token.t)
      continue
    const aligned = alignFurigana(token.t, r)
    if (aligned.confidence > 0)
      return { reading: r, furigana: aligned.segments }
  }

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
