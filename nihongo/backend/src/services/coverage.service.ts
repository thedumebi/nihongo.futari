import db from '@nihongo/shared/db'
import { dialogues, dialogueTurns, readingLines, readings, studyItems } from '@nihongo/shared/db/schema'
import { and, asc, eq, inArray, isNotNull } from 'drizzle-orm'

import { glossary, glossLine } from './glossary.service.js'
import { learnerState } from './learner-state.service.js'

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

/**
 * A text's reviewable word ids, worked out once per process: published texts
 * do not change. Held as promises, so concurrent first requests share one
 * read and one glossing pass.
 */
const contentCache = new Map<string, Promise<Set<string>>>()

async function reviewableWordIds(): Promise<Set<string>> {
  const rows = await db.selectDistinct({ id: studyItems.wordId }).from(studyItems).where(and(isNotNull(studyItems.wordId), eq(studyItems.published, true)))
  return new Set(rows.map(r => r.id!))
}
let reviewable: Promise<Set<string>> | null = null

/** Kept once read; a failed read is dropped so the next request tries again. */
function reviewableWords(): Promise<Set<string>> {
  if (!reviewable) {
    const read = reviewableWordIds()
    reviewable = read
    read.catch(() => {
      if (reviewable === read)
        reviewable = null
    })
  }
  return reviewable
}

/** One line of a speech or a conversation, and the text it belongs to. */
interface TextLine { owner: string, text: string, reading: string | null }

async function wordsOf(lines: Array<Omit<TextLine, 'owner'>>, languageCode: string): Promise<Set<string>> {
  const [g, ok] = await Promise.all([glossary(languageCode), reviewableWords()])
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

/**
 * The word sets of several texts, keyed by id. Those not yet worked out are
 * read in one query between them, not one each: a list of 55 speeches made 55
 * round trips the first time it was opened.
 */
async function textWords(prefix: string, ids: string[], languageCode: string, readLines: (ids: string[]) => Promise<TextLine[]>): Promise<Map<string, Set<string>>> {
  const missing = [...new Set(ids)].filter(id => !contentCache.has(`${prefix}:${id}`))
  if (missing.length > 0) {
    const lines = readLines(missing).then((rows) => {
      const byOwner = new Map<string, TextLine[]>(missing.map(id => [id, []]))
      for (const row of rows)
        byOwner.get(row.owner)?.push(row)
      return byOwner
    })
    for (const id of missing) {
      const words = lines.then(byOwner => wordsOf(byOwner.get(id) ?? [], languageCode))
      contentCache.set(`${prefix}:${id}`, words)
      // A failed read is not kept: the next request tries again.
      words.catch(() => contentCache.delete(`${prefix}:${id}`))
    }
  }
  return new Map(await Promise.all(ids.map(async id => [id, await contentCache.get(`${prefix}:${id}`)!] as const)))
}

export async function readingWords(languageCode: string, readingIds: string[]): Promise<Map<string, Set<string>>> {
  return textWords('reading', readingIds, languageCode, ids => db
    .select({ owner: readingLines.readingId, text: readingLines.text, reading: readingLines.readingKana })
    .from(readingLines)
    .where(inArray(readingLines.readingId, ids))
    .orderBy(asc(readingLines.readingId), asc(readingLines.index)))
}

export async function dialogueWords(languageCode: string, dialogueIds: string[]): Promise<Map<string, Set<string>>> {
  return textWords('dialogue', dialogueIds, languageCode, ids => db
    .select({ owner: dialogueTurns.dialogueId, text: dialogueTurns.text, reading: dialogueTurns.readingKana })
    .from(dialogueTurns)
    .where(inArray(dialogueTurns.dialogueId, ids))
    .orderBy(asc(dialogueTurns.dialogueId), asc(dialogueTurns.index)))
}

/**
 * Words this learner knows in a language: any card on the word past its
 * learning steps, not suspended. Read off the request's read of the cards.
 */
export async function knownWordIds(userId: string, languageId: string): Promise<Set<string>> {
  return (await learnerState(userId, languageId)).knownWords
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
