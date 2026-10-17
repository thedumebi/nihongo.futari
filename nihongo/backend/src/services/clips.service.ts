import type { AudioStatus } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { sentences, sentenceTranslations, words } from '@nihongo/shared/db/schema'
import { clipRefs, withCurrentClips } from '@nihongo/shared/lib'
import { and, eq, inArray, sql } from 'drizzle-orm'

import { sentenceAudioPath, wordAudioPath } from '@/lib/audio-key.js'

/**
 * Sentence and word audio, only while it says what the sentence or word says.
 *
 * A clip is played if the row's `audio_text` (what the recording says, set by
 * the generated clip seed) still matches its text; otherwise nothing is
 * played, rather than the old wording. A question that IS its audio
 * (dictation, listening) is left out until the item is recorded again.
 */

/** Questions that cannot be asked without their audio. */
const NEEDS_AUDIO = new Set(['dictation', 'listening'])

/** The current recording for each sentence and word, or null where it would say something else. */
export async function currentClips(sentenceIds: string[], entSeqs: number[]): Promise<{
  sentences: Map<string, string | null>
  words: Map<number, string | null>
}> {
  const [sentenceRows, wordRows] = await Promise.all([
    sentenceIds.length === 0
      ? []
      : db.select({ id: sentences.id, text: sentences.text, audioText: sentences.audioText, audioVoice: sentences.audioVoice })
          .from(sentences)
          .where(inArray(sentences.id, sentenceIds)),
    entSeqs.length === 0
      ? []
      : db.select({ entSeq: words.entSeq, reading: words.primaryReading, audioText: words.audioText, audioVoice: words.audioVoice })
          .from(words)
          .where(inArray(words.entSeq, entSeqs))
  ])
  return {
    sentences: new Map(sentenceIds.map((id) => {
      const r = sentenceRows.find(s => s.id === id)
      return [id, r && r.audioText === r.text && r.audioVoice ? sentenceAudioPath(r.audioText, r.audioVoice) : null]
    })),
    words: new Map(entSeqs.map((seq) => {
      const r = wordRows.find(w => w.entSeq === seq)
      return [seq, r && r.audioText === r.reading && r.audioVoice ? wordAudioPath(r.audioText, r.audioVoice) : null]
    }))
  }
}

/**
 * Prompts with their clips swapped for the current recordings, and the
 * dictation hint read from the sentence's current translation (a stored copy
 * of it went stale when the sentence was reworded). Questions that need audio
 * they no longer have are left out. Runs on root-relative paths, before
 * `withAssetUrls`.
 */
export async function withCurrentAudio<T extends { templateCode: string, assets: unknown, prompt: unknown }>(rows: T[]): Promise<T[]> {
  if (rows.length === 0)
    return rows
  const assetsOf = (r: T) => (r.assets ?? {}) as Record<string, unknown>
  const refs = clipRefs(rows.map(assetsOf))
  const dictationSentences = [...new Set(rows
    .filter(r => r.templateCode === 'dictation')
    .map(r => assetsOf(r).sentenceId)
    .filter((id): id is string => typeof id === 'string'))]
  const [clips, translations] = await Promise.all([
    currentClips(refs.sentenceIds, refs.entSeqs),
    dictationSentences.length === 0
      ? []
      : db.select({ sentenceId: sentenceTranslations.sentenceId, text: sentenceTranslations.text })
          .from(sentenceTranslations)
          .where(and(inArray(sentenceTranslations.sentenceId, dictationSentences), eq(sentenceTranslations.lang, 'en')))
  ])
  const hintFor = new Map(translations.map(t => [t.sentenceId, t.text]))

  return rows.flatMap((r) => {
    const { assets, missing } = withCurrentClips(assetsOf(r), clips)
    if (missing && NEEDS_AUDIO.has(r.templateCode))
      return []
    const sentenceId = typeof assets.sentenceId === 'string' ? assets.sentenceId : null
    const hint = r.templateCode === 'dictation' && sentenceId ? hintFor.get(sentenceId) : undefined
    const prompt = hint ? { ...(r.prompt as Record<string, unknown>), hint } : r.prompt
    return [{ ...r, assets, prompt: prompt as T['prompt'] }]
  })
}

/** Published sentences and words whose recording does not say what they say now. */
export async function audioStatus(): Promise<AudioStatus> {
  const [[s], [w]] = await Promise.all([
    db.select({ n: sql<number>`count(*)`.mapWith(Number) }).from(sentences).where(and(eq(sentences.published, true), sql`(${sentences.audioText} is distinct from ${sentences.text} or ${sentences.audioVoice} is null)`)),
    db.select({ n: sql<number>`count(*)`.mapWith(Number) }).from(words).where(and(eq(words.published, true), sql`${words.entSeq} is not null`, sql`(${words.audioText} is distinct from ${words.primaryReading} or ${words.audioVoice} is null)`))
  ])
  return { sentencesWaiting: s?.n ?? 0, wordsWaiting: w?.n ?? 0 }
}
