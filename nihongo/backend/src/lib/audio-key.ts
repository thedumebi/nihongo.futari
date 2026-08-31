import { createHash } from 'node:crypto'

/**
 * Where a spoken line's clip lives, derived from the line itself.
 *
 * Clips used to be named for their POSITION — `dlg-ja-konbini-buy-t3.m4a` was
 * whatever turn three happened to be. That is fine while conversations only
 * ever grow at the end, and wrong the moment one is edited in the middle:
 * inserting a turn shifts every later index onto a clip recorded for different
 * words. It happened, and it was silent — the right filename saying the wrong
 * sentence, because the generator skips keys the bucket already holds and so
 * never noticed the text underneath had moved.
 *
 * Naming a clip after its CONTENT removes the failure rather than guarding
 * against it. Edit a line and it asks for a different file; the old clip is
 * simply no longer referenced. Two turns with identical text and voice share
 * one file, which is correct — they are the same recording.
 *
 * It also makes the cache header true. These are served
 * `max-age=31536000, immutable`, which promises a URL's bytes never change.
 * Under positional names that promise was false, and a replaced clip could sit
 * in a browser for a year. Under content names it holds by construction.
 *
 * The voice is part of the input because the same sentence in the other
 * speaker's voice is a different recording.
 */
/**
 * The two voices, here rather than in the generator, because the key depends on
 * them: whoever builds a URL must name the same voice the clip was made with.
 */
export const VOICE_OTHER = 'Kyoko'
export const VOICE_LEARNER = 'Reed (Japanese (Japan))'

export function audioKeyFor(text: string, voice: string): string {
  const digest = createHash('sha256').update(`${voice} ${text}`, 'utf8').digest('base64url')
  // 16 base64url characters is 96 bits — far past collision risk for a few
  // thousand clips, and short enough to read in a URL when debugging.
  return digest.slice(0, 16)
}

/** The full stored path, so no caller has to remember the prefix. */
export function dialogueAudioPath(text: string, voice: string): string {
  return `/audio/dialogues/${audioKeyFor(text, voice)}.m4a`
}
