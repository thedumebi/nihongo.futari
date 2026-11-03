/**
 * Replacing the readings of one word inside a text's stored furigana.
 *
 * Used by the grammar reading fixes: a reviewed rule says "this word reads
 * this way" (使役 → 使役[しえき]), and every place the word appears in a text
 * gets those segments instead of what the annotator guessed (使[つか]役[えき]).
 * Kept apart from the seed script so it can be tested.
 */

import type { FuriganaSegment } from '@nihongo/shared/lib'
import type { GrammarReadingChange, GrammarReadingRule } from '@nihongo/shared/types'

import { hasHiragana, hasKanji, hasKatakana } from '@nihongo/shared/lib'

const isKana = (ch: string) => hasHiragana(ch) || hasKatakana(ch)

/** `使役[しえき]` or `降[ふ]って` → segments. The brackets follow the kanji they read. */
export function parseBracketed(word: string): FuriganaSegment[] {
  const out: FuriganaSegment[] = []
  for (const match of word.matchAll(/([^[\]]+)(?:\[([^\]]+)\])?/g)) {
    const [, text, reading] = match
    if (!reading) {
      out.push({ t: text! })
      continue
    }
    // The reading covers the kanji run at the end of the text before it;
    // any kana ahead of that run stay plain.
    const chars = [...text!]
    let start = chars.length
    while (start > 0 && !isKana(chars[start - 1]!))
      start--
    const head = chars.slice(0, start).join('')
    if (head)
      out.push({ t: head })
    out.push({ t: chars.slice(start).join('') || text!, r: reading })
  }
  return out
}

/** `来[き]た`, the way a change list writes a word. */
export function bracketed(segments: readonly FuriganaSegment[]): string {
  return segments.map(s => s.r ? `${s.t}[${s.r}]` : s.t).join('')
}

type WordFix = Pick<GrammarReadingRule, 'span' | 'final'>

/** The text's segments after the fix, and each place a word's readings changed. */
interface AppliedFix {
  segments: FuriganaSegment[]
  changes: Array<Omit<GrammarReadingChange, 'why'>>
}

/**
 * Give every occurrence of `fix.span` in the text the readings in `fix.final`.
 *
 * Plain segments may be cut anywhere; a segment with a reading may not, so an
 * occurrence that would cut one (the word is part of a longer compound the
 * annotator read as a whole) is left alone. An occurrence that already reads
 * right is not a change.
 */
export function applyWordFix(segments: readonly FuriganaSegment[], fix: WordFix): AppliedFix {
  const to = parseBracketed(fix.final)
  if (to.map(s => s.t).join('') !== fix.span)
    throw new Error(`${fix.final} does not spell ${fix.span}`)
  // A kanji left bare would lose whatever reading it has now (次第[しだい] → 次第).
  if (to.some(s => !s.r && hasKanji(s.t)))
    throw new Error(`${fix.final} leaves a kanji without a reading`)

  let current = [...segments]
  const changes: AppliedFix['changes'] = []
  const text = current.map(s => s.t).join('')
  let from = 0
  for (;;) {
    const at = text.indexOf(fix.span, from)
    if (at < 0)
      break
    from = at + fix.span.length
    const cut = cutAt(current, at, at + fix.span.length)
    if (!cut)
      continue
    if (bracketed(cut.inside) === bracketed(to))
      continue
    changes.push({ word: fix.span, from: cut.inside, to })
    current = [...cut.before, ...to, ...cut.after]
  }
  return { segments: current, changes }
}

/** The segments before, inside and after [start, end), or null if a reading would be cut. */
function cutAt(segments: readonly FuriganaSegment[], start: number, end: number): { before: FuriganaSegment[], inside: FuriganaSegment[], after: FuriganaSegment[] } | null {
  const before: FuriganaSegment[] = []
  const inside: FuriganaSegment[] = []
  const after: FuriganaSegment[] = []
  let pos = 0
  for (const s of segments) {
    const a = pos
    const b = pos + s.t.length
    pos = b
    if (b <= start) {
      before.push(s)
      continue
    }
    if (a >= end) {
      after.push(s)
      continue
    }
    const crosses = a < start || b > end
    if (crosses && s.r)
      return null
    if (a < start)
      before.push({ t: s.t.slice(0, start - a) })
    inside.push(crosses ? { t: s.t.slice(Math.max(start, a) - a, Math.min(end, b) - a) } : s)
    if (b > end)
      after.push({ t: s.t.slice(end - a) })
  }
  return { before, inside, after }
}
