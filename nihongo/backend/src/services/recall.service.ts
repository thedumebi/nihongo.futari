import type { RecallItem, RecallSession } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import {
  languageLevels,
  languages,
  speakSessions,
  speakSteps,
  srsCards,
  srsReviewLogs,
  studyItemFacets,
  studyItems,
  words,
  wordSenses
} from '@nihongo/shared/db/schema'
import { recallGloss, recallSchedule } from '@nihongo/shared/lib'
import { and, desc, eq, gte, inArray, isNotNull, lt, or, sql } from 'drizzle-orm'

import { assetUrl, speakAnswerAudio, speakSay } from '../lib/assets.js'
import { GLOSS_AUDIO_LEVELS, glossAudioPath } from '../lib/audio-key.js'

/**
 * Recall: a hands-free session built from what the learner is shaky on.
 *
 * The words still on their learning steps, the ones that keep slipping
 * (ghosts), and the ones missed in the last week — plus Speak prompts missed in
 * a session. Each is asked in English and answered aloud, Pimsleur style, and
 * comes back within the session at growing gaps (`recallSchedule`).
 *
 * It never writes a review: there is no grading hands-free, and the SRS log
 * must only hold real answers. A finished session is recorded as an activity.
 */

/** Missed within this many days counts as shaky. */
const RECENT_MISS_DAYS = 7
/** At most this many Speak prompts in a session — they are longer to say. */
const MAX_SPEAK = 3

export async function getRecallSession(userId: string, languageCode: string, size: number): Promise<RecallSession | null> {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, languageCode)).limit(1)
  if (!language)
    return null

  const since = new Date(Date.now() - RECENT_MISS_DAYS * 24 * 60 * 60 * 1000)
  const missedRecently = sql`exists (
    select 1 from ${srsReviewLogs} l
    where l.card_id = ${srsCards.id} and l.rating = 1 and l.superseded = false and l.reviewed_at >= ${since}
  )`

  const wordRows = await db
    .select({
      wordId: words.id,
      entSeq: words.entSeq,
      form: words.primaryForm,
      reading: words.primaryReading,
      glosses: wordSenses.glosses,
      ghost: srsCards.ghost,
      due: srsCards.due
    })
    .from(srsCards)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .innerJoin(words, eq(words.id, studyItems.wordId))
    .innerJoin(languageLevels, eq(languageLevels.id, words.levelId))
    .innerJoin(wordSenses, and(eq(wordSenses.wordId, words.id), eq(wordSenses.sortIndex, 0)))
    .where(and(
      eq(srsCards.userId, userId),
      eq(srsCards.languageId, language.id),
      eq(srsCards.suspended, false),
      eq(studyItems.published, true),
      eq(studyItems.active, true),
      isNotNull(words.entSeq),
      // Only levels whose English prompts were recorded.
      inArray(languageLevels.code, [...GLOSS_AUDIO_LEVELS]),
      or(inArray(srsCards.state, [1, 3]), eq(srsCards.ghost, true), missedRecently)
    ))
    // Ghosts first — they cost the most — then whatever is due soonest.
    .orderBy(desc(srsCards.ghost), srsCards.due)

  const items: RecallItem[] = []
  const seen = new Set<string>()
  for (const r of wordRows) {
    const prompt = recallGloss(r.glosses.filter(g => g.lang === 'en').map(g => g.text))
    if (!prompt || seen.has(r.wordId) || items.length >= size)
      continue
    seen.add(r.wordId)
    items.push({
      key: r.wordId,
      kind: 'word',
      prompt,
      promptAudio: [assetUrl(glossAudioPath(prompt))],
      text: r.form,
      reading: r.reading,
      answerAudio: assetUrl(`/audio/words/${r.entSeq}.m4a`)
    })
  }

  // Speak prompts missed in a session and not yet settled.
  const speakRows = await db
    .select({
      stepId: speakSteps.id,
      en: speakSteps.en,
      text: speakSteps.text,
      reading: speakSteps.readingKana,
      number: speakSessions.number
    })
    .from(srsCards)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .innerJoin(speakSteps, eq(speakSteps.id, studyItems.speakStepId))
    .innerJoin(speakSessions, eq(speakSessions.id, speakSteps.sessionId))
    .where(and(
      eq(srsCards.userId, userId),
      eq(srsCards.languageId, language.id),
      eq(srsCards.suspended, false),
      eq(studyItems.published, true),
      eq(studyItems.active, true),
      or(lt(srsCards.state, 2), eq(srsCards.ghost, true), gte(srsCards.lapses, 1))
    ))
    .limit(MAX_SPEAK)

  for (const r of speakRows) {
    if (!r.text || !r.reading)
      continue
    const say = speakSay(r.en, r.number)
    items.push({
      key: r.stepId,
      kind: 'speak',
      prompt: say.map(s => s.text).join(' '),
      promptAudio: say.flatMap(s => s.audio ? [s.audio] : []),
      text: r.text,
      reading: r.reading,
      answerAudio: speakAnswerAudio(r.text)
    })
  }

  return { items, order: recallSchedule(items.length) }
}
