import { hasKanji } from '../script/index.js'
/**
 * Furigana alignment.
 *
 * Splits a surface form against its reading so ruby sits over the characters it
 * actually belongs to: 食べる/たべる becomes 食[た]べる, not 食べる[たべる].
 *
 * This is computed at IMPORT time and stored, never at render time. Aligning in
 * the client looks fine until it meets 大人 = おとな, where no per-character
 * split exists at all — and a guess there puts と over 大 in front of the person
 * trying to learn the word.
 *
 * The method is anchoring, not guessing: kana in the surface must appear
 * literally in the reading, which pins the boundaries. Whatever falls between
 * two anchors belongs to the kanji run between them. When a run holds several
 * kanji, the reading is assigned to the run WHOLE rather than divided, and the
 * confidence says so.
 */

export interface FuriganaSegment {
  /** The surface text of this segment. */
  t: string
  /** Its reading, present only where ruby should render. */
  r?: string
}

export interface FuriganaAlignment {
  segments: FuriganaSegment[]
  /**
   * 1 = every ruby sits over exactly one kanji.
   * 0.6 = at least one reading covers a multi-kanji run (correct, but coarse).
   * 0 = no alignment found; the whole token carries one ruby.
   */
  confidence: number
}

// Explicit codepoints: CJK Ext-A, the main CJK block, and 々 (the iteration
// mark, which behaves as a kanji for ruby purposes).
// Defined once in ../script; this module only asks the question.
const KANJI = { test: (c: string) => hasKanji(c) }
const KATAKANA_START = 0x30A1
const KATAKANA_END = 0x30F6

/** Katakana to hiragana, so a katakana surface can anchor a hiragana reading. */
export function toHiragana(text: string): string {
  let out = ''
  for (const char of text) {
    const code = char.codePointAt(0)!
    out += code >= KATAKANA_START && code <= KATAKANA_END
      ? String.fromCodePoint(code - 0x60)
      : char
  }
  return out
}

interface Run {
  text: string
  isKanji: boolean
}

/** Split a surface into alternating kanji and non-kanji runs. */
function toRuns(surface: string): Run[] {
  const runs: Run[] = []
  for (const char of surface) {
    const isKanji = KANJI.test(char)
    const last = runs[runs.length - 1]
    if (last && last.isKanji === isKanji)
      last.text += char
    else runs.push({ text: char, isKanji })
  }
  return runs
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Align `surface` against `reading`.
 *
 * Returns whole-token ruby with confidence 0 when no anchoring is possible —
 * which is the honest answer for 大人/おとな, not a failure.
 */
export function alignFurigana(surface: string, reading: string): FuriganaAlignment {
  const wholeToken = (): FuriganaAlignment => ({
    segments: [{ t: surface, r: reading }],
    confidence: 0
  })

  if (!surface || !reading)
    return { segments: [{ t: surface }], confidence: 1 }

  const runs = toRuns(surface)
  // Nothing to place ruby over.
  if (!runs.some(r => r.isKanji))
    return { segments: [{ t: surface }], confidence: 1 }

  // A regex where each kanji run is a lazy group and each kana run is literal.
  // Anchored at both ends so the reading must be consumed entirely.
  const pattern = runs
    .map(run => (run.isKanji ? '(.+?)' : escapeRegex(toHiragana(run.text))))
    .join('')
  const match = new RegExp(`^${pattern}$`).exec(toHiragana(reading))
  if (!match)
    return wholeToken()

  const segments: FuriganaSegment[] = []
  let group = 1
  let coarse = false

  for (const run of runs) {
    if (!run.isKanji) {
      segments.push({ t: run.text })
      continue
    }
    const readingPart = match[group++]
    if (!readingPart)
      return wholeToken()
    // A run of several kanji gets ONE reading covering the run. Splitting it
    // per character would be a guess, and 大人 is why guesses are not allowed.
    if ([...run.text].length > 1)
      coarse = true
    segments.push({ t: run.text, r: readingPart })
  }

  return { segments, confidence: coarse ? 0.6 : 1 }
}

/** Strip ruby back to plain text — the "furigana off" rendering. */
export function furiganaToText(segments: FuriganaSegment[]): string {
  return segments.map(s => s.t).join('')
}

/**
 * Align an INFLECTED surface using its dictionary form's reading.
 *
 * Corpus indexes give the reading of the lemma, not of the form in the
 * sentence: 会う(あう) appearing as 会えない. Aligning 会えない against あう
 * fails outright, and the whole-token fallback would print 会えない[あう] —
 * a reading that is simply wrong, over text the learner is trying to read.
 *
 * So align the LEMMA, then carry its segments onto the surface for as long as
 * the two agree character by character. Inflection only ever changes the tail,
 * so once they diverge the remainder is okurigana and needs no ruby:
 *
 *   会う/あう -> [会(あ)][う];  surface 会えない -> [会(あ)][えない]
 */
export function alignInflected(surface: string, lemma: string, lemmaReading: string): FuriganaAlignment {
  if (surface === lemma)
    return alignFurigana(surface, lemmaReading)
  if (!surface)
    return { segments: [], confidence: 1 }

  const surfaceChars = [...surface]
  // No kanji in the surface means no ruby to place, whatever the lemma looks like.
  if (!surfaceChars.some(c => KANJI.test(c)))
    return { segments: [{ t: surface }], confidence: 1 }

  const base = alignFurigana(lemma, lemmaReading)
  if (base.confidence === 0)
    return { segments: [{ t: surface }], confidence: 0 }

  const segments: FuriganaSegment[] = []
  let cursor = 0

  for (const segment of base.segments) {
    const chars = [...segment.t]
    const matches = chars.every((c, i) => surfaceChars[cursor + i] === c)
    if (!matches)
      break
    segments.push(segment.r ? { t: segment.t, r: segment.r } : { t: segment.t })
    cursor += chars.length
  }

  const rest = surfaceChars.slice(cursor).join('')
  // Divergence inside a kanji run means the lemma's segments do not describe
  // this surface at all; ruby there would be a guess.
  if (rest && [...rest].some(c => KANJI.test(c)))
    return { segments: [{ t: surface }], confidence: 0 }
  if (rest)
    segments.push({ t: rest })

  return { segments, confidence: segments.some(s => s.r) ? base.confidence : 1 }
}

/** A token as stored, reduced to what sentence rendering needs. */
export interface FuriganaToken {
  charStart: number
  charEnd: number
  furigana: FuriganaSegment[]
}

/**
 * Build a whole sentence's segments from its raw text and its tokens.
 *
 * Tokens do NOT cover the whole sentence — punctuation carries no reading and
 * so gets no token — which means concatenating token furigana silently drops
 * every 。and 、. The raw text is authoritative; tokens only say where ruby
 * goes. Anything between or outside them is copied through untouched.
 */
export function sentenceFurigana(text: string, tokens: FuriganaToken[]): FuriganaSegment[] {
  const chars = [...text]
  const ordered = [...tokens].sort((a, b) => a.charStart - b.charStart)
  const segments: FuriganaSegment[] = []
  let cursor = 0

  const pushGap = (end: number) => {
    if (end > cursor)
      segments.push({ t: chars.slice(cursor, end).join('') })
  }

  for (const token of ordered) {
    // Overlapping or stale offsets would corrupt the text; skip rather than
    // emit characters twice.
    if (token.charStart < cursor)
      continue
    pushGap(token.charStart)
    for (const segment of token.furigana) segments.push(segment)
    cursor = token.charEnd
  }

  pushGap(chars.length)
  return segments
}
