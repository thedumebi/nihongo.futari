import type { FuriganaSegment } from '../furigana/index.js'

import { alignFurigana, toHiragana } from '../furigana/index.js'
import { hasKanji } from '../script/index.js'

/**
 * Each word of a line, with its own reading.
 *
 * A line arrives with ONE reading for the whole of it, and is shown word by
 * word: ruby over each word, each word's kanji spelled out in kana mode, each
 * word romanised in romaji mode. Cutting that one reading at the word breaks
 * is where lines went wrong — 時間英語 printed `じかんえいご英語`, 今起きた
 * gave 今 the お of 起きた, 一日に三回 found the に of いちにち and read 一日
 * as いちに.
 *
 * So the cut is no longer a single left-to-right guess:
 *
 *  - Where the line already carries aligned furigana (imported sentences),
 *    that alignment is used as it stands. Nothing is re-guessed.
 *  - Where it carries an authored reading, EVERY way the reading can line up
 *    with the text is found, and the one that agrees best with the dictionary
 *    and with the author's own word spaces wins.
 *  - A reading that spans two words (a run of kanji the tokeniser split) is
 *    divided only where the author's spaces or the dictionary say exactly
 *    where; otherwise the two words are kept together as one, so no word is
 *    ever shown with a piece of its neighbour's reading.
 *
 * Kana are never rewritten: a kana word is shown as written, katakana stays
 * katakana, and は stays は. Only the readings of kanji (and numerals) are
 * supplied — which is why romaji is not the go-between: it cannot tell おう
 * from おお, ず from づ, or a loanword from a native word, and rebuilding kana
 * from it would get all three wrong.
 */

/** A stretch of the line read as one. */
export interface ReadingUnit {
  /** Its surface characters. */
  t: string
  /**
   * What it reads as. A kana carries the READING's character, which is the
   * spoken one (は as わ), because romaji is built from it. A run of kanji may
   * keep the author's inner spaces.
   */
  r: string
  /** The author's spaces before it: a word break. */
  space: string
  /** Kanji, numerals or latin: something whose reading is not its spelling. */
  read: boolean
}

/** A word with its reading, as shown. */
export interface ReadToken {
  t: string
  /** Its reading, spoken and spaced as authored. */
  r: string
  /** The same, aligned: ruby over each kanji run, kana as written. */
  f: FuriganaSegment[]
}

/** Several of the tokeniser's words shown as one, because their reading cannot be cut between them. */
export interface ReadGroup extends ReadToken {
  /** Index of the first token in it, and one past the last. */
  from: number
  to: number
}

/** A word's dictionary form and reading. */
export type DictionaryReading = (surface: string) => { form: string, reading: string } | undefined

// ============ Characters ============

/** Kana that read as themselves. ヶ and ヵ do not — 一ヶ月 is いっかげつ. */
const KANA = {
  test: (char: string) => {
    const code = char.codePointAt(0)!
    return (code >= 0x3041 && code <= 0x3096) || code === 0x309D || code === 0x309E
      || (code >= 0x30A1 && code <= 0x30F4) || (code >= 0x30F7 && code <= 0x30FA)
      || (code >= 0x30FC && code <= 0x30FE)
  }
}
/** Punctuation, symbols and spaces: never read, may or may not be in the reading. */
const PUNCT = /[\p{P}\p{S}\s]/u

type CharClass = 'kana' | 'punct' | 'read'

function classOf(char: string): CharClass {
  if (KANA.test(char))
    return 'kana'
  if (PUNCT.test(char) && !hasKanji(char))
    return 'punct'
  return 'read'
}

/** は, を and へ are written one way and spoken another when they are particles. */
function sameKana(surface: string, reading: string): boolean {
  const s = toHiragana(surface)
  const r = toHiragana(reading)
  return s === r || (s === 'は' && r === 'わ') || (s === 'を' && r === 'お') || (s === 'へ' && r === 'え')
}

const plain = (text: string) => toHiragana(text.replace(/\s+/g, ''))

// ============ Units ============

/** Units from furigana that was aligned at import: taken as they are. */
export function unitsFromSegments(segments: readonly FuriganaSegment[]): ReadingUnit[] {
  const units: ReadingUnit[] = []
  for (const seg of segments) {
    const chars = [...seg.t]
    if (seg.r || chars.some(c => classOf(c) === 'read')) {
      units.push({ t: seg.t, r: seg.r ?? '', space: '', read: true })
      continue
    }
    for (const c of chars)
      units.push({ t: c, r: /\s/.test(c) ? '' : c, space: '', read: false })
  }
  return units
}

interface Item { t: string, cls: CharClass | 'symbol', pos: number }

/** Symbols that stand in for a word and may be read aloud: 〇〇線, △△駅. */
const SYMBOL = /[\p{So}\p{Sm}]/u

/** The surface as runs that need a reading, runs of symbols, and single kana and punctuation. */
function itemsOf(surface: string): Item[] {
  const items: Item[] = []
  let pos = 0
  for (const c of surface) {
    const base = classOf(c)
    const cls = base === 'punct' && SYMBOL.test(c) ? 'symbol' : base
    const last = items.at(-1)
    if ((cls === 'read' || cls === 'symbol') && last?.cls === cls)
      last.t += c
    else
      items.push({ t: c, cls, pos })
    pos++
  }
  return items
}

// ============ Words ============

/** The dictionary's reading for one stretch of a word's kanji, if it has one. */
function dictionaryPiece(token: string, piece: string, dict: DictionaryReading): string | undefined {
  const entry = dict(token)
  if (!entry)
    return undefined
  if (entry.form === piece)
    return entry.reading
  return alignFurigana(entry.form, entry.reading).segments.find(s => s.t === piece && s.r)?.r
}

/**
 * Split a unit that spans several words, if something says exactly where.
 *
 * The author's spaces first — `じかん えいご` over 時間英語 — but only where the
 * dictionary does not contradict them: `じゅうに にち` over 十|二日 has two
 * spaced words for two tokens, and following it would read 二日 as にち. Then
 * the dictionary alone: every piece but at most one must read as the
 * dictionary has it, and the one left takes what remains.
 */
function splitUnit(unit: ReadingUnit, pieces: Array<{ t: string, token: string }>, dict: DictionaryReading): ReadingUnit[] | null {
  const known = pieces.map(p => dictionaryPiece(p.token, p.t, dict))
  const spaced = unit.r.split(/(\s+)/)
  const words = spaced.filter((_, i) => i % 2 === 0)
  if (words.length === pieces.length && words.every(Boolean)
    && words.every((w, i) => known[i] === undefined || plain(known[i]!) === plain(w))) {
    return pieces.map((p, i) => ({
      t: p.t,
      r: words[i]!,
      space: i === 0 ? unit.space : spaced[i * 2 - 1]!,
      read: true
    }))
  }

  const whole = unit.r.replace(/\s+/g, '')
  if (known.filter(k => k === undefined).length > 1)
    return null
  const gap = known.findIndex(k => k === undefined)
  const head = known.slice(0, gap === -1 ? known.length : gap).join('')
  const tail = gap === -1 ? '' : known.slice(gap + 1).join('')
  const h = toHiragana(whole)
  if (!h.startsWith(toHiragana(head)) || !h.endsWith(toHiragana(tail)))
    return null
  if (gap === -1 && head.length !== whole.length)
    return null
  if (gap !== -1 && head.length + tail.length >= whole.length)
    return null
  // Slices of the reading as written, so its script is kept.
  const lengths = known.map(k => k?.length ?? whole.length - head.length - tail.length)
  let at = 0
  return pieces.map((p, i) => {
    const r = whole.slice(at, at + lengths[i]!)
    at += lengths[i]!
    return { t: p.t, r, space: i === 0 ? unit.space : '', read: true }
  })
}

/** The tokeniser's words, and where each begins. */
class Words {
  readonly starts: number[] = []
  constructor(readonly tokens: readonly string[], readonly dict: DictionaryReading) {
    let at = 0
    for (const t of tokens) {
      this.starts.push(at)
      at += [...t].length
    }
  }

  at(pos: number): number {
    let k = 0
    while (k + 1 < this.starts.length && this.starts[k + 1]! <= pos)
      k++
    return k
  }

  end(k: number): number {
    return this.starts[k]! + [...this.tokens[k]!].length
  }
}

/** A unit laid over the words: where it goes, what it costs, and any words it ties together. */
interface Placement {
  placed: Array<{ unit: ReadingUnit, token: number }>
  tie: [number, number] | null
  score: number
}

/**
 * Lay one unit over the words, scoring how well it agrees with them.
 *
 * Higher is better. The score is what picks between alignments of an authored
 * reading, and it is local to the unit — which is what lets the search below
 * find the best alignment of a whole line without trying them all.
 *  - +2 a run reads as the dictionary has that word (−1 if it does not);
 *  - −1 an author's space that falls inside a word;
 *  − 2 a word's own reading with a space in it — the author marked a break there;
 *  − 4 は read わ (を お, へ え) anywhere but the end of a word, where particles go;
 *  +1 a run across words split cleanly; −3 one that can only be shown whole.
 */
function place(unit: ReadingUnit, pos: number, words: Words): Placement {
  const length = [...unit.t].length
  const first = words.at(pos)
  const last = words.at(pos + length - 1)
  let score = unit.space && words.starts[first] !== pos ? -1 : 0

  if (first === last) {
    if (unit.read && unit.r) {
      const expected = dictionaryPiece(words.tokens[first]!, unit.t, words.dict)
      if (expected !== undefined)
        score += plain(expected) === plain(unit.r) ? 2 : -1
      if (/\S\s+\S/.test(unit.r))
        score -= 2
    }
    if (!unit.read && unit.r && toHiragana(unit.t) !== toHiragana(unit.r) && pos + 1 !== words.end(first))
      score -= 4
    return { placed: [{ unit, token: first }], tie: null, score }
  }

  const chars = [...unit.t]
  const pieces = []
  for (let k = first; k <= last; k++) {
    const from = Math.max(words.starts[k]!, pos) - pos
    const to = Math.min(words.end(k), pos + length) - pos
    pieces.push({ t: chars.slice(from, to).join(''), token: words.tokens[k]! })
  }
  const split = unit.r ? splitUnit(unit, pieces, words.dict) : null
  if (split)
    return { placed: split.map((u, i) => ({ unit: u, token: first + i })), tie: null, score: score + 1 }
  return { placed: [{ unit, token: first }], tie: [first, last], score: score - 3 }
}

/** Placements into the words a line is shown as. */
function group(placements: Placement[], words: Words): ReadGroup[] {
  const parent = words.tokens.map((_, i) => i)
  const root = (i: number): number => parent[i] === i ? i : (parent[i] = root(parent[i]!))
  for (const p of placements) {
    if (p.tie) {
      for (let k = p.tie[0] + 1; k <= p.tie[1]; k++)
        parent[root(k)] = root(p.tie[0])
    }
  }
  const placed = placements.flatMap(p => p.placed)
  // Authors do not space after a comma — 「すみません、メニュー お ください」 —
  // but romaji wants one, or the line reads as `sumimasen,menyuu`.
  // Within one word the romaji converter spaces after punctuation itself.
  placed.forEach(({ unit, token }, i) => {
    const prev = placed[i - 1]
    if (prev && prev.token !== token && /[、。！？]$/.test(prev.unit.t) && !unit.space && classOf([...unit.t][0]!) !== 'punct')
      unit.space = ' '
  })

  const groups: ReadGroup[] = []
  for (let k = 0; k < words.tokens.length; k++) {
    const open = groups.at(-1)
    if (open && root(open.from) === root(k))
      open.to = k + 1
    else
      groups.push({ from: k, to: k + 1, t: '', r: '', f: [] })
  }
  for (const g of groups) {
    g.t = words.tokens.slice(g.from, g.to).join('')
    const mine = placed.filter(p => p.token >= g.from && p.token < g.to).map(p => p.unit)
    g.r = mine.map(u => u.space + u.r).join('')
    for (const u of mine) {
      const prev = g.f.at(-1)
      if (u.read)
        g.f.push({ t: u.t, r: u.r.replace(/\s+/g, '') })
      else if (prev && prev.r === undefined)
        prev.t += u.t
      else
        g.f.push({ t: u.t })
    }
  }
  return groups
}

/**
 * The best way an authored reading lines up with the text.
 *
 * Every alignment is considered — no cap, no first-found — by a search over
 * (position in the text, position in the reading) that keeps the best-scoring
 * rest of the line from each point. Ties go to the shorter reading for a run,
 * the rule the old walk used.
 */
function bestPlacements(words: Words, reading: string): Placement[] | null {
  const items = itemsOf(words.tokens.join(''))
  const chars: Array<{ c: string, at: number, space: string }> = []
  let space = ''
  ;[...reading].forEach((c, at) => {
    if (/\s/.test(c)) {
      space += c
      return
    }
    chars.push({ c, at, space })
    space = ''
  })
  const readingChars = [...reading]
  const runReading = (j: number, k: number) => readingChars.slice(chars[j]!.at, chars[k]!.at + 1).join('')

  interface Best { score: number, path: Placement[] }
  const memo = new Map<number, Best | null>()
  const width = chars.length + 1

  const best = (i: number, j: number): Best | null => {
    const key = i * width + j
    if (memo.has(key))
      return memo.get(key)!
    let result: Best | null = null
    const consider = (unit: ReadingUnit | null, ni: number, nj: number) => {
      const rest = best(ni, nj)
      if (!rest)
        return
      const p = unit ? place(unit, items[i]!.pos, words) : null
      const score = rest.score + (p?.score ?? 0)
      if (!result || score > result.score)
        result = { score, path: p ? [p, ...rest.path] : rest.path }
    }

    const next = chars[j]
    if (i === items.length) {
      if (j === chars.length)
        result = { score: 0, path: [] }
      // Punctuation the reading has and the text does not.
      else if (PUNCT.test(next!.c))
        consider(null, i, j + 1)
    } else {
      const item = items[i]!
      if (item.cls === 'kana') {
        if (next && sameKana(item.t, next.c))
          consider({ t: item.t, r: next.c, space: next.space, read: false }, i + 1, j + 1)
      } else if (item.cls === 'punct') {
        // Punctuation reads as itself, so romaji keeps it; a space in the
        // text reads as nothing, since the reading carries its own.
        const own = /\s/.test(item.t) ? '' : item.t
        if (next && next.c === item.t)
          consider({ t: item.t, r: own, space: next.space, read: false }, i + 1, j + 1)
        consider({ t: item.t, r: own, space: '', read: false }, i + 1, j)
      } else {
        // A symbol may be silent; anything else needs a reading.
        if (item.cls === 'symbol')
          consider({ t: item.t, r: '', space: '', read: false }, i + 1, j)
        // A run never takes punctuation.
        for (let k = j; k < chars.length && !PUNCT.test(chars[k]!.c); k++)
          consider({ t: item.t, r: runReading(j, k), space: chars[j]!.space, read: true }, i + 1, k + 1)
      }
      if (next && PUNCT.test(next.c) && item.t !== next.c)
        consider(null, i, j + 1)
    }
    memo.set(key, result)
    return result
  }

  return best(0, 0)?.path ?? null
}

/**
 * The words of a line with their readings, or null when the reading does not
 * fit the text at all.
 *
 * `tokens` are the tokeniser's words, in order, spelling the line. A returned
 * group covering more than one of them means those words share a reading that
 * nothing could divide, and are to be shown as one.
 */
export function readLine(
  tokens: readonly string[],
  source: { reading: string } | { segments: readonly FuriganaSegment[] },
  dict: DictionaryReading
): ReadGroup[] | null {
  const words = new Words(tokens, dict)
  if ('reading' in source) {
    const placements = bestPlacements(words, source.reading)
    return placements ? group(placements, words) : null
  }

  const units = unitsFromSegments(source.segments)
  if (units.map(u => u.t).join('') !== tokens.join(''))
    return null
  let pos = 0
  const placements = units.map((unit) => {
    const p = place(unit, pos, words)
    pos += [...unit.t].length
    return p
  })
  return group(placements, words)
}

/**
 * What is wrong with a word's reading, if anything: the invariant every shown
 * word must meet. Used by tests and by the content checker.
 */
export function readTokenProblems(token: { t: string, r?: string, f?: readonly FuriganaSegment[] }): string[] {
  // Kanji (and ヶ, 〆) must carry a reading. A numeral or a latin letter reads
  // as itself on the page, so one without a reading is not wrong.
  const needsOne = (text: string) => hasKanji(text) || /[\u30F5\u30F6\u3006]/.test(text)
  if (!needsOne(token.t))
    return []
  if (!token.f)
    return [`${token.t}: no reading`]
  const problems: string[] = []
  if (token.f.map(s => s.t).join('') !== token.t)
    problems.push(`${token.t}: furigana spells ${token.f.map(s => s.t).join('')}`)
  for (const s of token.f) {
    if (needsOne(s.t) && !s.r)
      problems.push(`${token.t}: ${s.t} has no reading`)
  }
  return problems
}

/** A word as shown: surface, reading, aligned furigana. */
interface ShownToken { t: string, r?: string, f?: FuriganaSegment[] }

/**
 * Cut a line of read words around a blank.
 *
 * A grammar cloze is a whole sentence with one stretch removed — 言って with
 * its て blanked. The sentence is read whole, where its reading is known, and
 * then cut: words before the blank, words after it, and any word the blank
 * cuts through split along its furigana (言っ before, nothing after). A kanji
 * run is never split; it stays with the side its first character is on.
 */
export function splitAround<T extends ShownToken>(tokens: readonly T[], from: number, to: number): { before: T[], after: T[] } {
  const before: T[] = []
  const after: T[] = []
  let pos = 0
  for (const token of tokens) {
    const start = pos
    const end = pos + [...token.t].length
    pos = end
    if (end <= from) {
      before.push(token)
      continue
    }
    if (start >= to) {
      after.push(token)
      continue
    }
    // The blank cuts this word: keep the pieces either side of it.
    const head: FuriganaSegment[] = []
    const tail: FuriganaSegment[] = []
    let at = start
    for (const seg of token.f ?? [{ t: token.t }]) {
      const chars = [...seg.t]
      const segStart = at
      at += chars.length
      if (seg.r) {
        if (segStart < from)
          head.push(seg)
        else if (segStart >= to)
          tail.push(seg)
        continue
      }
      const pre = chars.slice(0, Math.max(0, from - segStart)).join('')
      const post = chars.slice(Math.max(0, to - segStart)).join('')
      if (pre)
        head.push({ t: pre })
      if (post)
        tail.push({ t: post })
    }
    // The word's leading space — the author's word break — stays with its front.
    const lead = /^\s*/.exec(token.r ?? '')![0]
    const piece = (f: FuriganaSegment[], space: string) => ({ ...token, t: f.map(s => s.t).join(''), r: space + f.map(s => s.r ?? s.t).join(''), f, w: undefined })
    if (head.length)
      before.push(piece(head, lead))
    if (tail.length)
      after.push(piece(tail, head.length ? '' : lead))
  }
  return { before, after }
}
