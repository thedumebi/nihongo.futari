import type { DictionarySpelling } from '@/types/words.js'

import { toHiragana } from '../furigana/index.js'
import { hasKanji } from '../script/index.js'

/**
 * Dictionary tags for spellings nobody writes: irregular, outdated, rare and
 * search-only kanji and kana. A keyboard does not offer them and accepting one
 * would teach it.
 */
export const RARE_SPELLING_TAGS: ReadonlySet<string> = new Set(['oK', 'iK', 'rK', 'ok', 'ik', 'rk', 'sK', 'sk'])

/**
 * Every way to write what was said, given how it was read and the spellings
 * of the word it belongs to.
 *
 * A dictation answer used to accept each word as written in the sentence and
 * in kana, and a helper tried to guess one more spelling. It only knew two per
 * word, so 友達 was refused for a sentence that wrote 友だち, 在ります for
 * あります, 聴いた for 聞いた: correct Japanese, correctly heard, offered first
 * by the keyboard. Each fix added one more hand-listed word.
 *
 * So this works from the reading instead. For each spelling of the word, the
 * part it shares with the dictionary reading (the okurigana: る in 見る / みる,
 * さい in 下さい / ください) is where inflection happens; the part before it
 * must be how this token starts, and the token's own ending carries over:
 * みて with 見る gives 見て, ともだち with 友だち gives 友だち and with 友達
 * gives 友達. A spelling whose stem the token does not start with gives
 * nothing, which is what keeps こない from becoming くない under 来る.
 *
 * The kana reading is always included. Pure-kana spellings add nothing the
 * reading does not already give, since the grader folds katakana.
 */
export function spellingsOf(reading: string, spellings: readonly DictionarySpelling[]): string[] {
  const said = toHiragana(reading)
  const out = new Set<string>([said])
  for (const { form, reading: dictionaryReading } of spellings) {
    if (!hasKanji(form))
      continue
    const R = toHiragana(dictionaryReading)
    // The ending both spellings share.
    let shared = 0
    while (shared < Math.min(form.length, R.length) && form[form.length - 1 - shared] === R[R.length - 1 - shared])
      shared++
    const formStem = form.slice(0, form.length - shared)
    const readingStem = R.slice(0, R.length - shared)
    if (!readingStem || !said.startsWith(readingStem))
      continue
    const rest = said.slice(readingStem.length)
    // Nothing shared: a noun, which must be the whole token (しゃしんか is not
    // 写真か). Otherwise there must be an ending, and it must keep the part of
    // the okurigana that does not inflect: the さ of 下さい, nothing for 見る.
    // A verb never loses its ending entirely: きた under 来る (きたる) is not 来.
    const anchor = R.slice(readingStem.length, readingStem.length + Math.max(0, shared - 1))
    if (shared === 0 ? rest !== '' : rest === '' || !rest.startsWith(anchor))
      continue
    out.add(formStem + rest)
  }
  return [...out]
}

/**
 * Whether a reading can be how this spelling is said: its kana must match
 * where the spelling has kana, with something under each run of kanji.
 *
 * Some tokens carry their dictionary form's reading (います read いる), and
 * spelling from that would offer 居る for います. Readings that do not fit are
 * not used.
 */
export function readingFits(surface: string, reading: string): boolean {
  let pattern = ''
  for (const ch of toHiragana(surface)) {
    if (!hasKanji(ch))
      pattern += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    else if (!pattern.endsWith('.+'))
      pattern += '.+'
  }
  return new RegExp(`^${pattern}$`, 'u').test(toHiragana(reading))
}

const ONLY_KANA = /^[\u3041-\u309F\u30A0-\u30FF]+$/

/**
 * A written word's options, widened with every spelling of the dictionary
 * word it is linked to. The options it already had keep their order and come
 * first.
 *
 * `readings` are the candidates for how it was said (its stored reading and
 * any kana options); only those that fit `surface` are used, since some carry
 * the dictionary form's reading (います read いる).
 *
 * The link itself is checked too: a word written with kanji must be one of the
 * spellings its dictionary word produces. 来た linked to 来 ("next", きた)
 * would otherwise offer 来 for 来た. A wrong link adds nothing.
 */
export function widenOptions(
  surface: string,
  options: readonly string[],
  readings: readonly string[],
  spellings: readonly DictionarySpelling[]
): string[] {
  const said = [...new Set(readings.filter(r => ONLY_KANA.test(r)).map(toHiragana))]
    .filter(r => readingFits(surface, r))
  const offered = said.map(r => spellingsOf(r, spellings))
  if (hasKanji(surface) && !offered.some(list => list.includes(surface)))
    return [...options]

  const out = [...options]
  const seen = new Set(options.map(toHiragana))
  for (const spelling of offered.flat()) {
    // Compared folded, as the grader compares: ジェット機 is already there
    // when じぇっと機 is, and adding it again would grow on every run.
    const key = toHiragana(spelling)
    if (!seen.has(key)) {
      seen.add(key)
      out.push(spelling)
    }
  }
  return out
}
