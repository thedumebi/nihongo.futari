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
 *
 * Enhanced variants, and a male voice for the learner. The pairing was Kyoko
 * against Reed, which was two problems at once: Reed ships compact and sounded
 * robotic beside a full-quality voice, and both being female meant you had to
 * track who was speaking rather than hearing it. Otoya is male and enhanced, so
 * whose turn it is is audible before the words are.
 *
 * These names must exist in `say -v '?'` on the machine that generates audio.
 * The enhanced variants are downloaded, not built in — System Settings →
 * Accessibility → Spoken Content → Manage Voices — and a missing one fails the
 * clip rather than silently substituting, which is the behaviour you want.
 */
export const VOICE_OTHER = 'Kyoko (Enhanced)'
export const VOICE_LEARNER = 'Otoya (Enhanced)'

/**
 * The Speak teachers: explanations and the English prompts.
 *
 * Two, a woman and a man, so the course does not sound like one recording on
 * repeat. Both are the downloaded high-quality variants — Samantha, the
 * built-in voice used at first, sounded flat beside Kyoko. A teacher is a
 * session's, never a line's: switching voice mid-explanation would sound like
 * an interruption, so sessions alternate instead.
 *
 * The voice is part of every key, so changing these and running `audio:speak`
 * moves the URLs to the new clips by themselves.
 */
export const VOICES_ENGLISH = ['Zoe (Premium)', 'Nathan (Enhanced)'] as const

/** The teacher for a session: odd sessions Zoe, even sessions Nathan. */
export function englishVoiceFor(sessionNumber: number): string {
  return VOICES_ENGLISH[(Math.max(1, sessionNumber) - 1) % VOICES_ENGLISH.length]!
}

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

/** A Speak clip: the teacher's English, or a Japanese answer. Content-named, as above. */
export function speakAudioPath(text: string, voice: string): string {
  return `/audio/speak/${audioKeyFor(text, voice)}.m4a`
}

/** A speech's line, read in the main Japanese voice. Content-named, as above. */
export function readingAudioPath(text: string): string {
  return `/audio/readings/${audioKeyFor(text, VOICE_OTHER)}.m4a`
}

/** The English prompt for a word in a Recall session — one teacher voice for all. */
export const VOICE_RECALL = VOICES_ENGLISH[0]

export function glossAudioPath(text: string): string {
  return `/audio/glosses/${audioKeyFor(text, VOICE_RECALL)}.m4a`
}

/** Levels whose words have Recall prompts recorded; raising it means one more audio run. */
export const GLOSS_AUDIO_LEVELS = ['N5', 'N4'] as const

/**
 * Which Japanese voice reads a sentence or word: half in each, so a learner
 * hears a woman and a man, and always the same one for the same item (picked
 * from its id, so it never changes between runs).
 */
export const VOICES_JAPANESE = [VOICE_OTHER, VOICE_LEARNER] as const
export function voiceForClip(id: string | number): string {
  const digest = createHash('sha256').update(String(id), 'utf8').digest()
  return VOICES_JAPANESE[digest[0]! % VOICES_JAPANESE.length]!
}

/**
 * A sentence's or word's clip, named for what it SAYS. They used to be filed
 * by id, so rewording a sentence kept its old recording: the clip went on
 * saying the old words. Named for the text, a reworded sentence asks for a
 * file that does not exist yet, and nothing is played until it is recorded.
 */
export function sentenceAudioPath(text: string, voice: string): string {
  return `/audio/sentences/${audioKeyFor(text, voice)}.m4a`
}

export function wordAudioPath(reading: string, voice: string): string {
  return `/audio/words/${audioKeyFor(reading, voice)}.m4a`
}
