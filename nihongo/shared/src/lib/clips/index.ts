/**
 * Sentence and word clips in a stored prompt, swapped for the recording that
 * says what the sentence or word says NOW.
 *
 * Prompts store a clip by the sentence's id or the word's dictionary number
 * (`/audio/sentences/{id}.m4a`, `/audio/words/{entSeq}.m4a`). Those files were
 * recorded once and never again, so a reworded sentence went on playing its
 * old words, and a dictation marked the learner wrong for typing what was on
 * screen. Each reference is now looked up: the current recording's path if it
 * says the current text, or nothing at all, never the old words.
 */

const SENTENCE_CLIP = /^\/audio\/sentences\/(.+)\.m4a$/
const WORD_CLIP = /^\/audio\/words\/(\d+)\.m4a$/

/** The sentence ids and word numbers a set of prompts' assets refer to. */
export function clipRefs(assetsList: ReadonlyArray<Record<string, unknown>>): { sentenceIds: string[], entSeqs: number[] } {
  const sentenceIds = new Set<string>()
  const entSeqs = new Set<number>()
  for (const assets of assetsList) {
    if (typeof assets.sentenceId === 'string')
      sentenceIds.add(assets.sentenceId)
    for (const value of Object.values(assets)) {
      if (typeof value !== 'string')
        continue
      const s = SENTENCE_CLIP.exec(value)
      if (s)
        sentenceIds.add(s[1]!)
      const w = WORD_CLIP.exec(value)
      if (w)
        entSeqs.add(Number(w[1]))
    }
  }
  return { sentenceIds: [...sentenceIds], entSeqs: [...entSeqs] }
}

/**
 * One prompt's assets with each clip swapped for its current recording, or
 * removed when there is none. `missing` says a clip was removed, so a question
 * that IS its audio (dictation, listening) can be left out until recorded.
 */
export function withCurrentClips(
  assets: Record<string, unknown>,
  clips: { sentences: ReadonlyMap<string, string | null>, words: ReadonlyMap<number, string | null> }
): { assets: Record<string, unknown>, missing: boolean } {
  let missing = false
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(assets)) {
    if (typeof value === 'string') {
      const s = SENTENCE_CLIP.exec(value)
      const w = s ? null : WORD_CLIP.exec(value)
      const current = s ? clips.sentences.get(s[1]!) : w ? clips.words.get(Number(w[1])) : undefined
      if (s || w) {
        if (current)
          out[key] = current
        else
          missing = true
        continue
      }
    }
    out[key] = value
  }
  return { assets: out, missing }
}
