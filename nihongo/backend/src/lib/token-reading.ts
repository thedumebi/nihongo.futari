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
 * Forms whose reading cannot be derived from their lemma.
 *
 * 来る shifts its stem vowel across the paradigm — く / き / こ — so aligning
 * against くる gives 来 = く for every one of them. There is no rule to infer
 * here; the paradigm is the exception.
 */
const IRREGULAR: Record<string, string> = {
  来ます: 'きます',
  来ました: 'きました',
  来ません: 'きません',
  来ませんでした: 'きませんでした',
  来て: 'きて',
  来た: 'きた',
  来ない: 'こない',
  来なかった: 'こなかった',
  来られる: 'こられる',
  来い: 'こい',
  来る: 'くる'
}

/**
 * This token's reading and its ruby, or neither.
 *
 * The LINE's reading is tried first and the dictionary's second.
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
  // A token with no kanji reads as itself, whatever the dictionary says.
  //
  // あります is spelled out in kana already, so there is nothing to annotate —
  // but the dictionary's reading for the word it matches is ある, the LEMMA,
  // and taking that stored あります as reading "ある". Harmless as ruby, since
  // none is drawn, and wrong for everything else that reads the column: romaji,
  // dictation's kana answer, and anything derived from it later.
  if (!/[\u4E00-\u9FFF]/.test(token.t))
    return { reading: token.t, furigana: [{ t: token.t }] }

  const line = clean(token.r)
  // A pattern entry carries its own spelling as its "reading" — 前に reads 前に —
  // which is not a reading at all. Taking it made `alignFurigana` put 前 above
  // 前 as its own ruby on 62 prose runs.
  const dict = token.w && token.w.reading !== token.w.form ? clean(token.w.reading) : ''

  // 来る is irregular in a way `alignInflected` cannot know: the stem changes
  // vowel, so 来ました is きました and not くました. Aligning the lemma gives
  // 来 = く and annotates the commonest verb in the language wrongly.
  const irregular = IRREGULAR[token.t]
  if (irregular) {
    const aligned = alignFurigana(token.t, irregular)
    if (aligned.confidence > 0)
      return { reading: irregular, furigana: aligned.segments }
  }

  // A single kanji is never guessed from the dictionary.
  //
  // Any reading "aligns" with one character, so the dictionary's first entry
  // wins whatever it says: 東京 gave 東 = ひがし, 使い方 gave 方 = ほう, 我が家
  // gave 家 = け, 三年前 gave 年 = とし and 前 = ぜん. Where the line supplies a
  // reading it is trusted, because the line knows which word this is; where
  // there is none — an explanation is prose, not a sentence with a reading —
  // the character goes without ruby rather than with the wrong one.
  if (!line && [...token.t].length === 1 && /[\u4E00-\u9FFF]/.test(token.t))
    return { reading: null, furigana: [{ t: token.t }] }

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
