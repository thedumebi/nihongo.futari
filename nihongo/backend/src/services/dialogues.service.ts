import type { DialogueListResponse, DialogueTurn, DialogueView } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import {
  curriculumUnits,
  dialogueReplies,
  dialogues,
  dialogueTurns,
  languageLevels,
  languages,
  srsCards,
  studyItemFacets,
  studyItems
} from '@nihongo/shared/db/schema'
import { and, asc, eq, inArray } from 'drizzle-orm'

import { assetUrl } from '../lib/assets.js'
import { dialogueAudioPath, VOICE_LEARNER, VOICE_OTHER } from '../lib/audio-key.js'
import { glossary, glossLine } from './glossary.service.js'

/**
 * Conversations, browsable.
 *
 * They are also scheduled like everything else — a dialogue is a study item
 * with a usage facet — but a conversation is not a flashcard, and waiting for
 * the queue to offer one is the wrong way to find it. This is the front door;
 * the queue is still what brings it back.
 */
export async function listDialogues(languageCode: string, userId: string): Promise<DialogueListResponse> {
  const rows = await db
    .select({
      code: dialogues.code,
      title: dialogues.title,
      situation: dialogues.situation,
      level: languageLevels.code,
      unit: curriculumUnits.code,
      unitTitle: curriculumUnits.title,
      image: dialogues.imageUrl,
      unitImage: curriculumUnits.imageUrl,
      cardState: srsCards.state
    })
    .from(dialogues)
    .innerJoin(languages, eq(languages.id, dialogues.languageId))
    .leftJoin(languageLevels, eq(languageLevels.id, dialogues.levelId))
    .leftJoin(curriculumUnits, eq(curriculumUnits.id, dialogues.unitId))
    // Whether this reader has met it, via the study item the seeds created.
    .leftJoin(studyItems, eq(studyItems.dialogueId, dialogues.id))
    .leftJoin(studyItemFacets, eq(studyItemFacets.studyItemId, studyItems.id))
    .leftJoin(srsCards, and(eq(srsCards.facetId, studyItemFacets.id), eq(srsCards.userId, userId)))
    .where(and(eq(languages.code, languageCode), eq(dialogues.published, true)))
    .orderBy(asc(dialogues.sortIndex))

  const digest = await turnDigest()

  return {
    dialogues: rows.map(r => ({
      code: r.code,
      title: r.title,
      situation: r.situation,
      level: r.level,
      unit: r.unit,
      unitTitle: r.unitTitle,
      // The conversation's own drawing wins; the unit's scene is only a
      // fallback for one that has not been drawn yet.
      image: pickImage(r.image, r.unitImage),
      turnCount: digest.get(r.code)?.turns ?? 0,
      keywords: digest.get(r.code)?.keywords ?? '',
      // Graduated past the learning steps, the same bar the rest of the app
      // uses for "learned".
      learned: (r.cardState ?? 0) >= 2
    }))
  }
}

export async function getDialogue(languageCode: string, code: string): Promise<DialogueView | null> {
  const [row] = await db
    .select({
      id: dialogues.id,
      code: dialogues.code,
      title: dialogues.title,
      situation: dialogues.situation,
      level: languageLevels.code,
      unit: curriculumUnits.code,
      unitTitle: curriculumUnits.title,
      image: dialogues.imageUrl,
      unitImage: curriculumUnits.imageUrl
    })
    .from(dialogues)
    .innerJoin(languages, eq(languages.id, dialogues.languageId))
    .leftJoin(languageLevels, eq(languageLevels.id, dialogues.levelId))
    .leftJoin(curriculumUnits, eq(curriculumUnits.id, dialogues.unitId))
    .where(and(eq(languages.code, languageCode), eq(dialogues.code, code), eq(dialogues.published, true)))
    .limit(1)

  if (!row)
    return null

  const turnRows = await db
    .select({
      id: dialogueTurns.id,
      index: dialogueTurns.index,
      speaker: dialogueTurns.speaker,
      text: dialogueTurns.text,
      reading: dialogueTurns.readingKana,
      translation: dialogueTurns.translation
    })
    .from(dialogueTurns)
    .where(eq(dialogueTurns.dialogueId, row.id))
    .orderBy(asc(dialogueTurns.index))

  const replyRows = turnRows.length === 0
    ? []
    : await db
        .select({
          id: dialogueReplies.id,
          turnId: dialogueReplies.turnId,
          text: dialogueReplies.text,
          reading: dialogueReplies.readingKana,
          translation: dialogueReplies.translation,
          isCorrect: dialogueReplies.isCorrect,
          whyWrong: dialogueReplies.whyWrong,
          sortIndex: dialogueReplies.sortIndex
        })
        .from(dialogueReplies)
        .where(inArray(dialogueReplies.turnId, turnRows.map(t => t.id)))
        .orderBy(asc(dialogueReplies.sortIndex))

  const g = await glossary(languageCode)

  const turns: DialogueTurn[] = turnRows.map(t => ({
    index: t.index,
    speaker: t.speaker,
    text: t.text,
    reading: t.reading,
    translation: t.translation,
    // Keyed on the LINE, not its position — see lib/audio-key.ts. A turn that
    // is edited asks for a different file instead of keeping a clip recorded
    // for the sentence that used to sit at this index.
    audio: assetUrl(dialogueAudioPath(t.text, t.speaker === 'learner' ? VOICE_LEARNER : VOICE_OTHER)),
    tokens: glossLine(t.text, g, t.reading),
    replies: replyRows
      .filter(r => r.turnId === t.id)
      .map(({ turnId: _drop, sortIndex: _order, ...rest }) => ({
        ...rest,
        // Replies are always the learner's own lines, so always that voice.
        audio: assetUrl(dialogueAudioPath(rest.text, VOICE_LEARNER)),
        tokens: glossLine(rest.text, g, rest.reading)
      }))
  }))

  const { id: _id, image, unitImage, ...rest } = row
  return { ...rest, image: pickImage(image, unitImage), turns }
}

/**
 * The drawing to show, as a servable URL.
 *
 * Its own before its unit's, and null when neither exists — a card with no
 * image beats a card pointing at a 404.
 */
function pickImage(own: string | null, unit: string | null): string | null {
  const source = own ?? unit
  return source === null ? null : assetUrl(source)
}

/**
 * Turn count and searchable text per dialogue, for the list.
 *
 * One pass over every turn serves both: the count the card shows, and the
 * flattened script the search box matches against. Kept together because they
 * read the same rows and splitting them would mean scanning twice.
 */
async function turnDigest(): Promise<Map<string, { turns: number, keywords: string }>> {
  const rows = await db
    .select({
      code: dialogues.code,
      text: dialogueTurns.text,
      reading: dialogueTurns.readingKana,
      translation: dialogueTurns.translation
    })
    .from(dialogueTurns)
    .innerJoin(dialogues, eq(dialogues.id, dialogueTurns.dialogueId))
    .orderBy(asc(dialogueTurns.index))

  const digest = new Map<string, { turns: number, keywords: string }>()
  for (const row of rows) {
    const entry = digest.get(row.code) ?? { turns: 0, keywords: '' }
    entry.turns += 1
    // Script, kana and English all go in: the reader may know the line in any
    // of the three, and the client lowercases before matching.
    entry.keywords += `${row.text} ${row.reading} ${row.translation ?? ''} `
    digest.set(row.code, entry)
  }
  return digest
}
