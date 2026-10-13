import { hasHiragana, hasKatakana } from '../ja/script/index.js'

/**
 * A teacher's line in English with Japanese words inside it.
 *
 * The Speak teacher explains in English but has to SAY the Japanese — "'is' is
 * です". An English voice reading Japanese text mangles it, so the author marks
 * each Japanese run in braces, '"Is" is {です}.', and the line is spoken as
 * segments, each in its own voice, played back to back. On screen the braced
 * runs are set in Japanese type.
 *
 * Shared because three places must cut a line identically: the generator that
 * records each segment, the API that names their clips, and the page that
 * renders them.
 */

export type SegmentLang = 'en' | 'ja'

export interface SpeakSegment {
  lang: SegmentLang
  text: string
}

/** Split a line into English and {Japanese} runs, dropping empty ones. */
export function speakSegments(line: string): SpeakSegment[] {
  const out: SpeakSegment[] = []
  for (const part of line.split(/(\{[^{}]*\})/)) {
    const ja = part.startsWith('{') && part.endsWith('}')
    const text = (ja ? part.slice(1, -1) : part).trim()
    if (text)
      out.push({ lang: ja ? 'ja' : 'en', text })
  }
  return out
}

/**
 * Whether a segment has anything to say.
 *
 * The full stop after a Japanese run — 'Today is {きょう}.' — is a segment of
 * its own, and handed to the English voice alone it reads it out: "period".
 * It stays in the line for the eye; it just gets no clip.
 */
export function speakSpoken(segment: SpeakSegment): boolean {
  return /[\p{L}\p{N}]/u.test(segment.text)
}

/** The line as plain text, braces removed — for search, checks and display fallbacks. */
export function speakPlainText(line: string): string {
  return speakSegments(line).map(s => s.text).join(' ')
}

/** Whether every brace in the line is closed and none is nested. */
export function speakBracesBalanced(line: string): boolean {
  let depth = 0
  for (const char of line) {
    if (char === '{')
      depth++
    else if (char === '}')
      depth--
    if (depth < 0 || depth > 1)
      return false
  }
  return depth === 0
}

/** Small kana that share a beat with the kana before them. */
const SMALL = new Set([...'ゃゅょぁぃぅぇぉャュョァィゥェォ'])

/** Roughly how many beats (morae) a kana reading takes to say. */
export function moraCount(reading: string): number {
  let count = 0
  for (const char of reading) {
    if ((hasHiragana(char) || hasKatakana(char)) && !SMALL.has(char))
      count++
  }
  return count
}

/**
 * How long to leave for the learner to say the answer.
 *
 * A base for working it out plus time to say it, scaled by the learner's own
 * setting — short, normal or long. Michel Thomas paused the tape and let you
 * take as long as you needed; a fixed gap either rushes a beginner or bores
 * everyone else, so it grows with the answer.
 */
export function thinkingTimeMs(reading: string, scale = 1): number {
  return Math.round((2500 + 300 * moraCount(reading)) * scale)
}
