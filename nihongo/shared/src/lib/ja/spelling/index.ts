import { toHiragana } from '../furigana/index.js'

/**
 * The same word, spelled the other way: ください ↔ 下さい, みて ↔ 見て.
 *
 * Japanese keyboards offer both, and a learner who types 写真を見て下さい has
 * heard and written the sentence correctly — it was marked wrong because the
 * answer only knew ください. Given one spelling and the word's dictionary form
 * and reading (下さい / ください, 見る / みる), this swaps the part they do not
 * share: the kanji for its kana, or back. The endings they share — the
 * okurigana, and whatever inflection follows — carry over unchanged.
 *
 * Returns null when the spelling does not belong to that word, or there is
 * nothing to swap.
 */
export function otherSpelling(surface: string, form: string, reading: string): string | null {
  if (form === reading)
    return null
  // The ending both spellings share: さい in 下さい / ください, る in 見る / みる.
  let shared = 0
  while (shared < Math.min(form.length, reading.length)
    && form[form.length - 1 - shared] === reading[reading.length - 1 - shared]) {
    shared++
  }
  // The last shared kana is where inflection happens (見る → 見て), so only the
  // part before it has to match what was typed.
  const keep = Math.max(0, shared - 1)
  const formStem = form.slice(0, form.length - shared)
  const readingStem = reading.slice(0, reading.length - shared)
  const anchor = form.slice(form.length - shared, form.length - shared + keep)

  const swap = (from: string, to: string): string | null => {
    if (!surface.startsWith(from))
      return null
    const rest = surface.slice(from.length)
    // A noun (nothing shared) must match whole; a verb's ending must still begin
    // with the part of the stem that does not inflect.
    if (shared === 0 ? rest !== '' : !rest.startsWith(anchor))
      return null
    return to + rest
  }
  const kana = toHiragana(surface)
  return swap(formStem, readingStem) ?? (kana === surface ? swap(readingStem, formStem) : null)
}
