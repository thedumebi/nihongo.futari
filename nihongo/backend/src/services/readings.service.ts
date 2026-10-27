import type { ReadingLineView, ReadingListResponse, ReadingView } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { languageLevels, languages, learningActivities, readingLines, readings } from '@nihongo/shared/db/schema'
import { and, asc, count, eq } from 'drizzle-orm'

import { assetUrl } from '../lib/assets.js'
import { readingAudioPath } from '../lib/audio-key.js'
import { cachedContent, languageByCode } from './catalogue.service.js'
import { coverageOf, knownWordIds, readingWords } from './coverage.service.js'
import { glossary, glossLine } from './glossary.service.js'

/**
 * Speeches to read aloud.
 *
 * Only published rows ever leave here. A speech is published by the importer
 * only once its author has marked it approved, so a draft that a model wrote
 * cannot reach a reader by any path through this file.
 */
export async function listReadings(languageCode: string, levelCode: string | undefined, userId: string): Promise<ReadingListResponse> {
  const language = await languageByCode(languageCode)
  if (!language)
    return { readings: [] }
  // One cached list per language, narrowed here: a level code from the request
  // must never become a cache key of its own.
  const rows = (await readingList(language.id)).filter(r => !levelCode || r.level === levelCode)

  // What this learner knows, and which speeches they have read to the end.
  const [known, readRows] = await Promise.all([
    knownWordIds(userId, language.id),
    db.selectDistinct({ code: learningActivities.refId }).from(learningActivities).where(and(eq(learningActivities.userId, userId), eq(learningActivities.kind, 'reading')))
  ])
  const read = new Set(readRows.map(r => r.code))
  const words = await readingWords(languageCode, rows.map(r => r.id))
  return { readings: rows.map(({ id, ...r }) => ({ ...r, coverage: coverageOf(known, words.get(id)!), read: read.has(r.code) })) }
}

/** Load the speech list and every speech's words ahead of the first learner who asks. */
export async function warmReadings(languageCode: string): Promise<void> {
  const language = await languageByCode(languageCode)
  if (language)
    await readingWords(languageCode, (await readingList(language.id)).map(r => r.id))
}

/** A language's published speeches with their line counts, easiest first: content, so cached. */
function readingList(languageId: string) {
  return cachedContent(`reading-list:${languageId}`, () => db
    .select({
      id: readings.id,
      code: readings.code,
      title: readings.title,
      titleEn: readings.titleEn,
      level: languageLevels.code,
      lineCount: count(readingLines.id)
    })
    .from(readings)
    .innerJoin(languageLevels, eq(languageLevels.id, readings.levelId))
    .leftJoin(readingLines, eq(readingLines.readingId, readings.id))
    .where(and(eq(readings.languageId, languageId), eq(readings.published, true)))
    .groupBy(readings.id, languageLevels.code, languageLevels.rank)
    .orderBy(asc(languageLevels.rank), asc(readings.sortIndex)))
}

/**
 * One speech. `includeDrafts` lets an admin open a speech from the review
 * queue before it is approved; every other caller only ever sees published.
 */
export async function getReading(languageCode: string, code: string, { includeDrafts = false } = {}): Promise<ReadingView | null> {
  const [row] = await db
    .select({
      id: readings.id,
      code: readings.code,
      title: readings.title,
      titleEn: readings.titleEn,
      level: languageLevels.code,
      published: readings.published
    })
    .from(readings)
    .innerJoin(languages, eq(languages.id, readings.languageId))
    .innerJoin(languageLevels, eq(languageLevels.id, readings.levelId))
    .where(and(
      eq(languages.code, languageCode),
      eq(readings.code, code),
      includeDrafts ? undefined : eq(readings.published, true)
    ))
    .limit(1)

  if (!row)
    return null

  const lines = await db
    .select({
      index: readingLines.index,
      stanza: readingLines.stanza,
      text: readingLines.text,
      reading: readingLines.readingKana,
      translation: readingLines.translation
    })
    .from(readingLines)
    .where(eq(readingLines.readingId, row.id))
    .orderBy(asc(readingLines.index))

  const g = await glossary(languageCode)

  // Lines arrive in order, so a stanza is a run of equal numbers.
  const stanzas: ReadingLineView[][] = []
  let current: number | null = null
  for (const { stanza, ...line } of lines) {
    if (stanza !== current) {
      stanzas.push([])
      current = stanza
    }
    stanzas.at(-1)!.push({ ...line, tokens: glossLine(line.text, g, line.reading, { regroupKana: true }), audio: assetUrl(readingAudioPath(line.text)) })
  }

  const { id: _id, ...rest } = row
  return { ...rest, lineCount: lines.length, stanzas }
}
