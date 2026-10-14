import db from '@nihongo/shared/db'
import { dialogues, dialogueTurns, readingLines, readings, srsCards, studyItemFacets, studyItems } from '@nihongo/shared/db/schema'
import { and, asc, eq, gte, isNotNull } from 'drizzle-orm'

import { glossary, glossLine } from './glossary.service.js'

/**
 * "You can read this now": how much of a speech or conversation the learner
 * already knows.
 *
 * The share of its reviewable words — words with a study item, the only ones a
 * learner can come to know — that have a card past learning. Particles and
 * names have no study item, so they neither count against a text nor for it.
 * Around 90% is where reading stops being decoding and starts being reading,
 * so the list can say which texts have just come within reach.
 */

/** A text's reviewable word ids, worked out once per process — published texts do not change. */
const contentCache = new Map<string, Set<string>>()

async function reviewableWordIds(): Promise<Set<string>> {
  const rows = await db.selectDistinct({ id: studyItems.wordId }).from(studyItems).where(and(isNotNull(studyItems.wordId), eq(studyItems.published, true)))
  return new Set(rows.map(r => r.id!))
}
let reviewable: Promise<Set<string>> | null = null

async function wordsOf(lines: Array<{ text: string, reading: string | null }>, languageCode: string): Promise<Set<string>> {
  const [g, ok] = await Promise.all([glossary(languageCode), (reviewable ??= reviewableWordIds())])
  const out = new Set<string>()
  for (const line of lines) {
    for (const token of glossLine(line.text, g, line.reading ?? undefined, { regroupKana: true })) {
      const id = token.w?.wordId
      if (id && ok.has(id))
        out.add(id)
    }
  }
  return out
}

export async function readingWords(languageCode: string, readingId: string): Promise<Set<string>> {
  const key = `reading:${readingId}`
  const cached = contentCache.get(key)
  if (cached)
    return cached
  const lines = await db.select({ text: readingLines.text, reading: readingLines.readingKana })
    .from(readingLines)
    .where(eq(readingLines.readingId, readingId))
    .orderBy(asc(readingLines.index))
  const words = await wordsOf(lines, languageCode)
  contentCache.set(key, words)
  return words
}

export async function dialogueWords(languageCode: string, dialogueId: string): Promise<Set<string>> {
  const key = `dialogue:${dialogueId}`
  const cached = contentCache.get(key)
  if (cached)
    return cached
  const lines = await db.select({ text: dialogueTurns.text, reading: dialogueTurns.readingKana })
    .from(dialogueTurns)
    .where(eq(dialogueTurns.dialogueId, dialogueId))
    .orderBy(asc(dialogueTurns.index))
  const words = await wordsOf(lines, languageCode)
  contentCache.set(key, words)
  return words
}

/** Words this learner knows: any card on the word past its learning steps. */
export async function knownWordIds(userId: string, languageId?: string): Promise<Set<string>> {
  const rows = await db.selectDistinct({ id: studyItems.wordId }).from(srsCards).innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId)).innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId)).where(and(
    eq(srsCards.userId, userId),
    gte(srsCards.state, 2),
    eq(srsCards.suspended, false),
    isNotNull(studyItems.wordId),
    ...(languageId ? [eq(srsCards.languageId, languageId)] : [])
  ))
  return new Set(rows.map(r => r.id!))
}

/** Known share of a text's words, 0–1; null for a text with nothing reviewable in it. */
export function coverageOf(known: Set<string>, words: Set<string>): number | null {
  if (words.size === 0)
    return null
  let hit = 0
  for (const id of words) {
    if (known.has(id))
      hit++
  }
  return Math.round((hit / words.size) * 100) / 100
}

/** The ids of published texts, for building coverage over a list. */
export async function readingIdsByCode(languageId: string): Promise<Map<string, string>> {
  const rows = await db.select({ id: readings.id, code: readings.code }).from(readings).where(and(eq(readings.languageId, languageId), eq(readings.published, true)))
  return new Map(rows.map(r => [r.code, r.id]))
}

export async function dialogueIdsByCode(languageId: string): Promise<Map<string, string>> {
  const rows = await db.select({ id: dialogues.id, code: dialogues.code }).from(dialogues).where(and(eq(dialogues.languageId, languageId), eq(dialogues.published, true)))
  return new Map(rows.map(r => [r.code, r.id]))
}
