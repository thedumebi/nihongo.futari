import type { FuriganaSegment } from '../furigana/index.js'

import { alignFurigana } from '../furigana/index.js'

/**
 * Furigana for arbitrary prose, using the dictionary we already have.
 *
 * The grammar pages render explanatory prose full of kanji with no readings on
 * any of it, which makes the pages that explain the language the least readable
 * thing in the app. There is no tokenizer to reach for — the sentence corpus
 * arrived pre-tokenised, so nothing in the stack can segment new text.
 *
 * What there IS: 8,240 dictionary words with readings, and the furigana
 * aligner. Longest-match over the dictionary handles whole words; the aligner
 * turns each dictionary entry into per-kanji readings, which covers the
 * inflected forms that the dictionary itself does not list — the prose says
 * 食べて and 行った where the dictionary holds 食べる and 行く.
 *
 * This is a heuristic and will occasionally be wrong on a homograph. It is
 * offered as a reading aid, never as a source of truth, and a kanji with no
 * evidence behind it is left bare rather than guessed at.
 */

const KANJI = /[\u3400-\u4DBF\u4E00-\u9FFF\u3005]/
const JAPANESE = /[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\u3005]/

export interface Lexicon {
  /** Surface form to reading, e.g. 食べる → たべる. */
  words: Map<string, string>
  /** One kanji to the reading it most often takes, derived from `words`. */
  kanji: Map<string, string>
}

/**
 * Derive per-kanji readings from a word list.
 *
 * Each entry is split by the furigana aligner into kanji runs with their
 * readings; a run of exactly one kanji is evidence about that character. The
 * most frequently attested reading wins, so 行 takes い (from 行く, 行き, 行って)
 * rather than a rarer ぎょう.
 */
export function buildLexicon(entries: Iterable<[string, string]>): Lexicon {
  const words = new Map<string, string>()
  const tally = new Map<string, Map<string, number>>()

  for (const [surface, reading] of entries) {
    if (!surface || !reading)
      continue
    if (!words.has(surface))
      words.set(surface, reading)
    if (!KANJI.test(surface))
      continue

    const aligned = alignFurigana(surface, reading)
    // A low-confidence alignment is a guess about a guess.
    if (aligned.confidence < 1)
      continue
    for (const segment of aligned.segments) {
      if (!segment.r || [...segment.t].length !== 1)
        continue
      const counts = tally.get(segment.t) ?? new Map<string, number>()
      counts.set(segment.r, (counts.get(segment.r) ?? 0) + 1)
      tally.set(segment.t, counts)
    }
  }

  const kanji = new Map<string, string>()
  for (const [char, counts] of tally) {
    let best = ''
    let bestCount = 0
    for (const [reading, count] of counts) {
      // Ties break toward the shorter reading, which is the stem rather than
      // a compound's longer on-reading.
      if (count > bestCount || (count === bestCount && reading.length < best.length)) {
        best = reading
        bestCount = count
      }
    }
    if (best)
      kanji.set(char, best)
  }

  return { words, kanji }
}

/**
 * Split prose into segments, attaching a reading wherever one is known.
 *
 * Non-Japanese text passes through untouched, so a sentence mixing English and
 * Japanese — which is what every explanation here is — comes out intact.
 */
export function annotate(text: string, lexicon: Lexicon): FuriganaSegment[] {
  if (!text)
    return []

  // Longest first: 連用形 must beat 連, and 食べる must beat 食.
  const byLength = [...lexicon.words.keys()].sort((a, b) => b.length - a.length)
  const buckets = new Map<string, string[]>()
  for (const key of byLength) {
    const head = key[0]!
    const list = buckets.get(head) ?? []
    list.push(key)
    buckets.set(head, list)
  }

  const out: FuriganaSegment[] = []
  // Which script the last un-ruby'd segment holds, so runs merge only with
  // their own kind.
  let lastKind: 'ja' | 'other' | null = null

  /**
   * Append text, merging adjacent runs of the SAME script.
   *
   * Merging across scripts is what makes the output wrong rather than merely
   * verbose: a segment holding "…required base for ている" romanises as one
   * string, and the ruby then sits over the English as well. Kana keep their
   * own segments — they need no furigana, but they do need romaji.
   */
  const push = (t: string, r?: string, kind: 'ja' | 'other' = 'ja') => {
    const last = out[out.length - 1]
    if (!r && last && !last.r && lastKind === kind) {
      last.t += t
      return
    }
    out.push(r ? { t, r } : { t })
    lastKind = r ? null : kind
  }

  let i = 0
  while (i < text.length) {
    const char = text[i]!

    if (!JAPANESE.test(char)) {
      push(char, undefined, 'other')
      i += 1
      continue
    }

    const candidates = buckets.get(char) ?? []
    const word = candidates.find(k => text.startsWith(k, i))
    if (word && KANJI.test(word)) {
      const reading = lexicon.words.get(word)!
      const aligned = alignFurigana(word, reading)
      // Keep the aligner's own split so okurigana stays outside the ruby.
      for (const segment of aligned.segments)
        push(segment.t, segment.r)
      i += word.length
      continue
    }

    if (KANJI.test(char)) {
      // Not a listed word — most often an inflected form. Prefer the reading
      // this kanji takes in the dictionary word that shares the most text with
      // what is actually written here: 食べて shares 食べ with 食べる, so 食
      // reads た, and not the く it takes in the commoner 食う. Only when no
      // word shares more than the kanji itself does the global tally decide.
      push(char, readingFromNeighbours(text, i, candidates, lexicon) ?? lexicon.kanji.get(char))
      i += 1
      continue
    }

    push(char)
    i += 1
  }

  return out
}

/**
 * The leading kanji's reading, taken from the best-matching dictionary word.
 *
 * "Best" is the longest shared prefix. A word that agrees with the text for
 * three characters is far better evidence about the first one than a word that
 * agrees only on that character — which is the whole difference between
 * 食べて reading たべて and reading くべて.
 */
function readingFromNeighbours(
  text: string,
  at: number,
  candidates: string[],
  lexicon: Lexicon
): string | undefined {
  let best: string | undefined
  let bestShared = 1

  for (const word of candidates) {
    let shared = 0
    while (shared < word.length && text[at + shared] === word[shared])
      shared += 1
    if (shared <= bestShared)
      continue

    const reading = lexicon.words.get(word)
    if (!reading)
      continue
    const aligned = alignFurigana(word, reading)
    const head = aligned.segments[0]
    // Only usable if the alignment put a reading on the leading kanji alone.
    if (!head?.r || head.t !== text[at])
      continue

    best = head.r
    bestShared = shared
  }

  return best
}
