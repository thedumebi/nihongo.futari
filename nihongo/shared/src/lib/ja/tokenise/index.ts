/**
 * Split a Japanese line into tappable words.
 *
 * A conversation you can only read at sentence level is a wall. The reader
 * wants to point at one word and ask what it is, and for that the line has to
 * be cut into pieces that are worth pointing at.
 *
 * There is still no morphological analyser in this stack — the sentence corpus
 * arrived pre-tokenised, so nothing here can segment new text properly. What
 * exists is the same 8,240-word dictionary `annotate` leans on, and the same
 * two tricks:
 *
 *   1. Longest match against every known form. 連用形 must beat 連, and
 *      食べる must beat 食.
 *   2. When nothing matches exactly, the run of kanji-plus-trailing-kana is
 *      matched against the dictionary word sharing the longest prefix. That is
 *      what turns 食べて into 食べる and 行った into 行く — the inflected forms
 *      the dictionary does not list.
 *
 * Like `annotate`, this is a heuristic and will be wrong on a homograph now and
 * then. It is a reading aid: a token with no confident dictionary match is
 * still returned, just without a `key`, so it renders as ordinary text rather
 * than as a wrong answer.
 */

const KANJI = /[\u3400-\u4DBF\u4E00-\u9FFF\u3005]/
const KANA = /[\u3040-\u30FF]/
const JAPANESE = /[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\u3005]/

/** One piece of a line, as the reader sees it. */
export interface Token {
  /** The text exactly as written, so joining every `t` rebuilds the line. */
  t: string
  /**
   * The dictionary form this token is an instance of, when one was found.
   *
   * Not the same string as `t` for anything inflected: 食べて carries the key
   * 食べる. Absent means no confident match — punctuation, a particle the
   * dictionary does not list, or a word outside it.
   */
  key?: string
}

/**
 * Where a dictionary form's last kanji sits, or -1 if it has none.
 *
 * This is the test for whether an inflected form may be claimed, and it is not
 * a length threshold. Counting shared characters fails both ways: 行く shares
 * only 行 with 行った and is right, while 校長 shares only 校 with a bare 校 and
 * is wrong. What separates them is that inflection only ever replaces KANA, so
 * a candidate is eligible exactly when every kanji it contains is inside the
 * matched prefix — 行 is, 長 is not.
 */
function lastKanjiIndex(form: string): number {
  for (let i = form.length - 1; i >= 0; i -= 1) {
    if (KANJI.test(form[i]!))
      return i
  }
  return -1
}

/** Characters that can continue an inflection: kana only, never a new kanji. */
function isInflectionTail(char: string): boolean {
  return KANA.test(char)
}

/**
 * Group the dictionary by first character so a lookup scans candidates rather
 * than all 8,240 entries, and keep each bucket longest-first so the first hit
 * is the longest one.
 */
export function buildTokenIndex(forms: Iterable<string>): Map<string, string[]> {
  const buckets = new Map<string, string[]>()
  for (const form of forms) {
    if (!form)
      continue
    const head = form[0]!
    const list = buckets.get(head) ?? []
    list.push(form)
    buckets.set(head, list)
  }
  for (const list of buckets.values())
    list.sort((a, b) => b.length - a.length)
  return buckets
}

/** How many leading characters two strings share. */
function sharedPrefix(a: string, b: string): number {
  const limit = Math.min(a.length, b.length)
  let n = 0
  while (n < limit && a[n] === b[n])
    n += 1
  return n
}

export function tokenise(text: string, index: Map<string, string[]>): Token[] {
  const out: Token[] = []
  if (!text)
    return out

  // Runs of non-Japanese text — punctuation, latin, digits — accumulate into
  // one token rather than one per character, so a line does not shatter into
  // dozens of untappable fragments.
  const pushPlain = (char: string) => {
    const last = out[out.length - 1]
    if (last && !last.key && !JAPANESE.test(last.t))
      last.t += char
    else out.push({ t: char })
  }

  let i = 0
  while (i < text.length) {
    const char = text[i]!

    if (!JAPANESE.test(char)) {
      pushPlain(char)
      i += 1
      continue
    }

    const candidates = index.get(char) ?? []

    // 1. An exact dictionary form, longest first.
    const exact = candidates.find(form => text.startsWith(form, i))
    if (exact) {
      out.push({ t: exact, key: exact })
      i += exact.length
      continue
    }

    // 2. An inflected form. Take the kanji plus every kana that follows — the
    //    largest thing that could be one conjugated word — and ask which
    //    dictionary entry shares the most of it.
    if (KANJI.test(char)) {
      let end = i + 1
      while (end < text.length && isInflectionTail(text[end]!))
        end += 1
      const run = text.slice(i, end)

      let best = ''
      let bestShared = 0
      for (const form of candidates) {
        const shared = sharedPrefix(run, form)
        // Every kanji in the candidate must be accounted for. Among those that
        // qualify, the longest agreement wins: 食べて admits both 食う and
        // 食べる, and 食べる shares more, which is why this does not repeat
        // annotate's old bug of reading 食べて as くべて.
        if (shared > lastKanjiIndex(form) && shared > bestShared) {
          best = form
          bestShared = shared
        }
      }

      if (best) {
        // The whole run is consumed, tail and all: 食べたい is one tappable
        // thing meaning "want to eat", not 食べ plus a dangling たい. Trailing
        // kana beyond what the dictionary form covers is inflection, which is
        // exactly what the reader is looking at.
        out.push({ t: run, key: best })
        i = end
        continue
      }

      // A kanji with no evidence behind it stays bare rather than being
      // guessed at, the same rule `annotate` follows for readings.
      out.push({ t: char })
      i += 1
      continue
    }

    // 3. Kana that began no dictionary word. One character at a time, so
    //    particles stay individually tappable — they are the tokens a beginner
    //    asks about most, and merging them into a blob would hide them.
    out.push({ t: char })
    i += 1
  }

  return out
}
