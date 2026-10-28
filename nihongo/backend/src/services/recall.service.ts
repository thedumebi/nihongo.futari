import type { RecallItem, RecallSession } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import {
  kana,
  languageLevels,
  speakSessions,
  speakSteps,
  srsCards,
  srsReviewLogs,
  studyItemFacets,
  studyItems,
  words,
  wordSenses
} from '@nihongo/shared/db/schema'
import { ambiguousPrompts, firstMora, recallGloss, recallSchedule } from '@nihongo/shared/lib'
import { and, desc, eq, inArray, isNotNull, or, sql } from 'drizzle-orm'

import { assetUrl, speakAnswerAudio, speakSay } from '../lib/assets.js'
import { GLOSS_AUDIO_LEVELS, glossAudioPath } from '../lib/audio-key.js'
import { languageByCode } from './catalogue.service.js'
import { currentClips } from './clips.service.js'

/**
 * Recall: a hands-free session built from what the learner is shaky on.
 *
 * The words still on their learning steps, the ones that keep slipping
 * (ghosts), and the ones missed in the last week, plus Speak prompts missed in
 * a session, by the same rule. Each is asked in English and answered aloud, Pimsleur style, and
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
  const language = await languageByCode(languageCode)
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

  // English said for more than one word this learner has: "one" is いち and
  // ひとつ. Those prompts get the answer's first sound as a hint, or there is
  // no telling which word is wanted, and the answer names the others too.
  const learnerWords = (await db
    .selectDistinct({ wordId: words.id, form: words.primaryForm, reading: words.primaryReading, glosses: wordSenses.glosses })
    .from(srsCards)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .innerJoin(words, eq(words.id, studyItems.wordId))
    .innerJoin(wordSenses, and(eq(wordSenses.wordId, words.id), eq(wordSenses.sortIndex, 0)))
    .where(and(eq(srsCards.userId, userId), eq(srsCards.languageId, language.id))))
    .map(w => ({ word: w.wordId, form: w.form, reading: w.reading ?? '', prompt: recallGloss(w.glosses.filter(g => g.lang === 'en').map(g => g.text)) }))
  const ambiguous = ambiguousPrompts(learnerWords)
  const saidAs = (prompt: string) => prompt.toLowerCase().replace(/\s+/g, ' ').trim()
  // The clip for a single kana, to say the hint aloud.
  const kanaClips = new Map((await db.select({ character: kana.character, romaji: kana.romaji, script: kana.script }).from(kana))
    .map(k => [k.character, assetUrl(`/audio/kana/${k.script}-${k.romaji}.m4a`)]))

  // Only recordings that say what the word says now (see clips.service): an
  // item without one is left out, since hearing the answer is the point.
  const answerClips = (await currentClips([], wordRows.map(r => Number(r.entSeq)).filter(Boolean))).words

  const items: RecallItem[] = []
  const seen = new Set<string>()
  // One word per English prompt in a session: two words both asked as "one"
  // looked like the same word twice, and could not both be right.
  const asked = new Set<string>()
  for (const r of wordRows) {
    const prompt = recallGloss(r.glosses.filter(g => g.lang === 'en').map(g => g.text))
    const said = saidAs(prompt)
    const answerClip = answerClips.get(Number(r.entSeq))
    if (!prompt || !answerClip || seen.has(r.wordId) || asked.has(said) || items.length >= size)
      continue
    seen.add(r.wordId)
    asked.add(said)
    const hint = ambiguous.has(said) ? firstMora(r.reading) || null : null
    const hintClip = hint ? kanaClips.get(hint) : undefined
    const also = ambiguous.has(said)
      ? [...new Map(learnerWords
          .filter(w => w.word !== r.wordId && w.prompt && saidAs(w.prompt) === said)
          .map(w => [w.word, { text: w.form, reading: w.reading }])).values()]
      : []
    items.push({
      key: r.wordId,
      kind: 'word',
      prompt,
      promptAudio: [assetUrl(glossAudioPath(prompt)), ...(hintClip ? [hintClip] : [])],
      hint,
      also,
      text: r.form,
      reading: r.reading,
      answerAudio: assetUrl(answerClip)
    })
  }

  // Speak prompts missed in a session and not yet settled, by the same rule
  // as words: still learning or relearning, a ghost, or missed in the last
  // week. It was "missed in review ever" (lapses >= 1), so a prompt slipped
  // once stayed in every Recall for good.
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
      or(inArray(srsCards.state, [1, 3]), eq(srsCards.ghost, true), missedRecently)
    ))
    .orderBy(desc(srsCards.ghost), srsCards.due)
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
      hint: null,
      also: [],
      text: r.text,
      reading: r.reading,
      answerAudio: speakAnswerAudio(r.text)
    })
  }

  return { items, order: recallSchedule(items.length) }
}
