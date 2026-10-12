import type { FuriganaSegment, GlossedToken } from '@nihongo/shared/types'

import { alignFurigana, hasKanji, toHiragana } from '@nihongo/shared/lib'

import type { AuthoredReading } from '@/pipeline/data/readings/types.js'

import { isPhrase } from './author-segments.js'

/**
 * The mechanical gate every read-aloud speech passes before a model or a person
 * reviews it.
 *
 * Pure, so the rules are tested without a database. `check-readings.ts` feeds
 * them the kanji levels and the glossary; the importer runs the same checks and
 * refuses to write anything that fails.
 */

const KANJI = { test: hasKanji }

/** N5 = 1 … N1 = 5, the same order as `language_levels.rank`. */
export const LEVEL_RANK: Record<AuthoredReading['level'], number> = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 }

/**
 * Lines a speech may share with another one.
 *
 * Greetings and sign-offs are how a speech opens and closes at every level;
 * refusing them would force the writing to be stilted. Anything longer than a
 * stock phrase must be new.
 */
export const SHARED_LINE_ALLOWLIST = new Set([
  'みなさん、こんにちは。',
  'みなさん、こんばんは。',
  'はじめまして。',
  'よろしくおねがいします。',
  'どうぞよろしくおねがいします。',
  'ありがとうございました。',
  'ご清聴ありがとうございました。',
  'きいてくれて、ありがとうございました。',
  '聞いてくれて、ありがとうございました。'
])

/** Above this share of lines in common, two speeches count as the same text. */
export const MAX_SHARED_RATIO = 0.2

/**
 * Kanji in `text` that a reader at this level is not expected to know.
 *
 * `kanjiRank` maps a character to its level rank, or null for a kanji outside
 * the JLPT lists. Those are refused at every level below N1 and allowed at N1,
 * which is where uncommon characters belong.
 */
export function kanjiAboveLevel(text: string, level: AuthoredReading['level'], kanjiRank: Map<string, number | null>): string[] {
  const ceiling = LEVEL_RANK[level]
  const out = new Set<string>()
  for (const char of text) {
    if (!KANJI.test(char) || char === '々')
      continue
    const rank = kanjiRank.get(char)
    if (rank === undefined || rank === null) {
      if (ceiling < LEVEL_RANK.N1)
        out.add(char)
      continue
    }
    if (rank > ceiling)
      out.add(char)
  }
  return [...out]
}

/** Whitespace and full-width spaces never make two lines different. */
function normalise(line: string): string {
  return line.replace(/\s/gu, '')
}

interface RecycledLine {
  text: string
  codes: string[]
}

interface OverlappingPair {
  a: string
  b: string
  ratio: number
}

/**
 * Lines that appear in more than one speech, and pairs of speeches that share
 * too much.
 *
 * The first catches a sentence pasted from one level into another. The second
 * catches the same speech re-levelled — every line edited a little so no single
 * line repeats exactly is still the thing being refused, but that needs a human
 * eye; this only reports when the copying is literal.
 */
export function recycledText(all: AuthoredReading[]): { lines: RecycledLine[], pairs: OverlappingPair[] } {
  const owners = new Map<string, Set<string>>()
  const sets = new Map<string, Set<string>>()

  for (const reading of all) {
    const own = new Set<string>()
    for (const line of reading.stanzas.flat()) {
      const key = normalise(line.t)
      if (SHARED_LINE_ALLOWLIST.has(key))
        continue
      own.add(key)
      if (!owners.has(key))
        owners.set(key, new Set())
      owners.get(key)!.add(reading.code)
    }
    sets.set(reading.code, own)
  }

  const lines = [...owners.entries()]
    .filter(([, codes]) => codes.size > 1)
    .map(([text, codes]) => ({ text, codes: [...codes].sort() }))

  const pairs: OverlappingPair[] = []
  const codes = [...sets.keys()]
  for (let i = 0; i < codes.length; i++) {
    for (let j = i + 1; j < codes.length; j++) {
      const a = sets.get(codes[i]!)!
      const b = sets.get(codes[j]!)!
      const smaller = Math.min(a.size, b.size)
      if (smaller === 0)
        continue
      const shared = [...a].filter(x => b.has(x)).length
      const ratio = shared / smaller
      if (ratio > MAX_SHARED_RATIO)
        pairs.push({ a: codes[i]!, b: codes[j]!, ratio })
    }
  }

  return { lines, pairs }
}

/** Shape problems that need nothing but the data itself. */
export function wellFormed(all: AuthoredReading[]): string[] {
  const problems: string[] = []
  const seen = new Set<string>()

  for (const reading of all) {
    if (seen.has(reading.code))
      problems.push(`${reading.code}: duplicate code`)
    seen.add(reading.code)

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(reading.code))
      problems.push(`${reading.code}: code must be kebab-case`)
    if (!reading.title.trim() || !reading.titleEn.trim())
      problems.push(`${reading.code}: missing title`)
    if (reading.stanzas.length === 0)
      problems.push(`${reading.code}: no lines`)

    for (const [s, stanza] of reading.stanzas.entries()) {
      if (stanza.length === 0)
        problems.push(`${reading.code} stanza ${s}: empty`)
      for (const [i, line] of stanza.entries()) {
        const where = `${reading.code} ${s}.${i}`
        if (!line.t.trim())
          problems.push(`${where}: empty text`)
        if (!line.r.trim())
          problems.push(`${where}: empty reading`)
        if (!line.e.trim())
          problems.push(`${where}: empty English`)
        if (KANJI.test(line.r))
          problems.push(`${where}: reading contains kanji — "${line.r}"`)
      }
    }
  }

  return problems
}

/**
 * The line's ruby, built from its tokens' own readings.
 *
 * The whole-line reading cannot be aligned in one go: it is spaced and has its
 * particles spoken (は→わ), so it does not match the surface. The tokens
 * already carry their slice of it, and a token with kanji has no particle
 * inside it to mis-speak, so aligning token by token is exact.
 *
 * `problems` lists every kanji token that could not be given a reading — the
 * sign that `t` and `r` disagree.
 */
export function lineFurigana(tokens: GlossedToken[]): { segments: FuriganaSegment[], problems: string[] } {
  const segments: FuriganaSegment[] = []
  const problems: string[] = []

  for (const token of tokens) {
    if (!KANJI.test(token.t)) {
      segments.push({ t: token.t })
      continue
    }
    if (token.r === undefined) {
      problems.push(`no reading for "${token.t}"`)
      segments.push({ t: token.t })
      continue
    }
    const reading = toHiragana(token.r.replace(/\s/gu, ''))
    // Empty is legitimate: a kanji run split across tokens carries its whole
    // reading on the first one, and the rest read as nothing.
    if (!reading) {
      segments.push({ t: token.t })
      continue
    }
    const { segments: aligned, confidence } = alignFurigana(token.t, reading)
    if (confidence === 0)
      problems.push(`"${token.t}" does not fit the reading "${token.r}"`)
    segments.push(...aligned)
  }

  return { segments, problems }
}

const KANA_ONLY = /^[\u3041-\u309F\u30A0-\u30FF]+$/

/** Particles and the copula — the house convention spaces each one off in `r`. */
const PARTICLES = new Set(['の', 'は', 'が', 'を', 'に', 'で', 'と', 'も', 'へ', 'か', 'よ', 'ね', 'や', 'から', 'まで', 'です', 'でした'])

/**
 * Words that end in particle kana and are one word all the same.
 *
 * それで and しかも are conjunctions, not それ + で and しか + も; spacing them
 * would romanise as "sore de" and cut the word in the reader.
 */
const PARTICLE_ENDED_WORDS = new Set([
  'それで',
  'それでも',
  'しかも',
  'ところが',
  'ところで',
  'だから',
  'ですから',
  'けれども',
  'かも',
  'それに',
  'でも',
  'のに',
  'ので',
  'なのに',
  'これで',
  'どうか',
  'いつか',
  'なにか',
  'だれか',
  'どこか',
  'それから',
  'それまで',
  'あとで',
  'はじめに'
])

/**
 * Particles the author ran into the word before them in the reading.
 *
 * The reading spaces every particle off — わたし の, ことば お — and that space
 * is what tells the reader where one word ends. Written ホテルの, the particle
 * reads as part of the noun: romaji runs them together, and the reader cannot
 * tell that ホテル is a word of its own. After kanji as well as kana: ほんお for
 * 本を is the same fault. Run on the tokens BEFORE kana is regrouped, since
 * regrouping would quietly glue the two into one plain chip.
 */
export function unspacedParticles(tokens: GlossedToken[]): string[] {
  const problems: string[] = []
  let wordStart = 0
  for (const [i, token] of tokens.entries()) {
    const startsWord = i === 0 || token.r === undefined || /^\s/u.test(token.r) || !KANA_ONLY.test(token.t)
    if (startsWord) {
      wordStart = i
      continue
    }
    const prev = tokens[i - 1]!
    // Only after a whole dictionary word. A particle-shaped kana after a
    // fragment — やっ|と, とん|で — is the middle of a word the dictionary cut,
    // which regrouping deals with; spacing it would break the word.
    if (!prev.w || i - 1 !== wordStart || !PARTICLES.has(token.t) || token.r === '')
      continue
    // And only when a new word follows. 分|から|なくて is the dictionary cutting
    // 分からなくて, not a particle: what comes after carries on the same word.
    const next = tokens[i + 1]
    if (next && next.r !== undefined && /^\p{L}/u.test(next.t) && !/^\s/u.test(next.r))
      continue
    const word = tokens.slice(wordStart, i + 1).map(t => t.t).join('')
    if (PARTICLE_ENDED_WORDS.has(word))
      continue
    problems.push(`"${word}": put a space before 「${token.t}」 in the reading`)
  }
  return problems
}

/**
 * A kana token that still runs across one of the author's word breaks.
 *
 * The cut that produced 学校|はし|ず|か: the は that ends one word and the し
 * that starts しずか glued into はし and glossed as 嘴 "beak". Regrouping
 * repairs such a cut when it knows every word involved; one it could not
 * repair is left here, glossed confidently and wrongly, so it fails the check.
 * The fix is a KANA_SPELLED entry for the word, or writing it differently.
 *
 * Run AFTER regrouping. Long grammar patterns span breaks on purpose — ん です,
 * ありがとう ございました — and are left alone.
 */
export function spansWordBreak(tokens: GlossedToken[]): string[] {
  const problems: string[] = []
  for (const token of tokens) {
    if (!KANA_ONLY.test(token.t) || token.r === undefined)
      continue
    if (!/\s/u.test(token.r.trim()))
      continue
    if (isPhrase(token))
      continue
    problems.push(`"${token.t}" straddles a word break ("${token.r.trim()}")${token.w ? ` and is glossed as "${token.w.meanings[0]}"` : ''}`)
  }
  return problems
}
