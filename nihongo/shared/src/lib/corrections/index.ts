import type { FuriganaSegment, FuriganaToken } from '../ja/furigana/index.js'

import { sentenceFurigana } from '../ja/furigana/index.js'

/**
 * Applying an approved reading correction to the copies that hold it.
 *
 * A sentence's readings live on its tokens, but a cloze card keeps its own
 * copy of the sentence's furigana, split at the blank, and the reading of the
 * blank is one of its accepted answers. A conversation line's reading is
 * copied into the study queue's snapshot of the conversation. Correcting the
 * source and not the copies would leave the wrong reading on screen, so these
 * rebuild the copies from the corrected source.
 */

/** A cloze card's furigana, split at its blank, and how the blank reads. */
export function clozeFurigana(
  sentence: string,
  before: string,
  after: string,
  tokens: readonly FuriganaToken[]
): { beforeFurigana: FuriganaSegment[], afterFurigana: FuriganaSegment[], blankReading: string } {
  const chars = [...sentence]
  const blankStart = [...before].length
  const blankEnd = chars.length - [...after].length
  const within = (from: number, to: number) => tokens
    .filter(t => t.charStart >= from && t.charEnd <= to)
    .map(t => ({ ...t, charStart: t.charStart - from, charEnd: t.charEnd - from }))
  return {
    beforeFurigana: sentenceFurigana(before, within(0, blankStart)),
    afterFurigana: sentenceFurigana(after, within(blankEnd, chars.length)),
    blankReading: sentenceFurigana(chars.slice(blankStart, blankEnd).join(''), within(blankStart, blankEnd))
      .map(s => s.r ?? s.t)
      .join('')
  }
}

/**
 * A card's accepted answers once its blank reads differently.
 *
 * The old reading came from the old furigana, so the corrected one replaces
 * it — unless the old "reading" was the written answer itself (a blank that
 * had no reading spells itself), which must stay accepted.
 */
export function correctedAnswers(accepted: readonly string[], primary: string, oldBlank: string, newBlank: string): string[] {
  if (oldBlank === newBlank)
    return [...accepted]
  return [...new Set([...accepted.filter(a => a !== oldBlank || a === primary), newBlank])]
}

/**
 * A conversation snapshot with one line's reading replaced.
 *
 * Only a line whose text matches AND whose reading is the one being corrected
 * changes, so a line that merely shares some wording is left alone. Returns
 * null when nothing matched.
 */
export function withLineReading(snapshot: unknown, text: string, from: string, to: string): unknown {
  let changed = false
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value))
      return value.map(walk)
    if (typeof value !== 'object' || value === null)
      return value
    const row = value as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [key, v] of Object.entries(row))
      out[key] = walk(v)
    if (row.text === text && row.reading === from) {
      out.reading = to
      changed = true
    }
    return out
  }
  const next = walk(snapshot)
  return changed ? next : null
}
