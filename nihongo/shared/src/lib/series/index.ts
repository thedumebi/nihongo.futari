import type { FuriganaMode } from '@/constants/endpoints.js'

import { parseIds } from '../games/kanji-shapes.js'
import { toHiragana } from '../ja/furigana/index.js'
import { kanaToRomaji } from '../ja/romaji/index.js'

/**
 * Sound series, made teachable.
 *
 * A series card used to show a part (共) beside two or three kanji in grey and
 * ask which on-reading it "predicts" — never saying the kanji contain it, what
 * they read or mean, or that some break the pattern. These shape the evidence
 * a learner needs to see the pattern for themselves: each kanji split into its
 * parts, a real word that uses the reading, and the familiar ones first.
 */

/** A kanji's parts, in reading order, from its IDS description: 供 → 亻, 共. */
export function kanjiParts(ids: string | null | undefined): string[] {
  return parseIds(ids)?.parts ?? []
}

export interface WordCandidate {
  form: string
  reading: string
  meaning: string | null
  /** Lower is more common; null when unranked. */
  frequencyRank: number | null
}

/**
 * A common word that shows a kanji's reading in use.
 *
 * A word whose reading contains the given reading (提供 ていきょう for 供
 * キョウ) — the pattern at work. For a kanji that follows the series nothing
 * else will do: 狙い (ねらい) under "read ソ" would argue against the very
 * point being made, so with `mustUse` there is no fallback. For an exception,
 * its commonest word is fine. Commonest first; null when nothing suits.
 */
export function exampleWord(
  candidates: readonly WordCandidate[],
  character: string,
  reading: string,
  mustUse = false
): WordCandidate | null {
  const sound = toHiragana(reading)
  const usable = candidates
    .filter(c => c.form.includes(character) && c.form !== character)
    .sort((a, b) => (a.frequencyRank ?? Number.MAX_SAFE_INTEGER) - (b.frequencyRank ?? Number.MAX_SAFE_INTEGER))
  const using = usable.find(c => toHiragana(c.reading).includes(sound))
  return using ?? (mustUse ? null : usable[0] ?? null)
}

/**
 * Members in teaching order: those that follow the pattern before the
 * exceptions, and within each, kanji the learner already knows first.
 * Stable otherwise, so the source's own order (easiest first) is kept.
 */
export function orderMembers<T extends { character: string, followsSeries: boolean }>(
  members: readonly T[],
  known: ReadonlySet<string>
): T[] {
  const rank = (m: T) => (m.followsSeries ? 0 : 2) + (known.has(m.character) ? 0 : 1)
  return members.map((m, i) => ({ m, i })).sort((a, b) => rank(a.m) - rank(b.m) || a.i - b.i).map(x => x.m)
}

/**
 * An on-reading, written the way this reader reads.
 *
 * Dictionaries write on-readings in katakana (キョウ), and a beginner in
 * hiragana or romaji mode cannot read that yet — the series card's answers
 * looked like four strange words. So the reading follows the furigana
 * setting: hiragana mode shows きょう, romaji mode kyou, and the other modes
 * keep the katakana with the hiragana beside it.
 */
export function seriesReading(katakana: string, mode: FuriganaMode): { main: string, sub: string } {
  const hiragana = toHiragana(katakana)
  if (mode === 'romaji')
    return { main: kanaToRomaji(hiragana), sub: '' }
  if (mode === 'kana')
    return { main: hiragana, sub: '' }
  return { main: katakana, sub: hiragana === katakana ? '' : hiragana }
}
