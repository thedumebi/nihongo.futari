import type { ReadingLineView, ReadingListResponse, ReadingView } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { languageLevels, languages, readingLines, readings } from '@nihongo/shared/db/schema'
import { and, asc, count, eq } from 'drizzle-orm'

import { glossary, glossLine } from './glossary.service.js'

/**
 * Speeches to read aloud.
 *
 * Only published rows ever leave here. A speech is published by the importer
 * only once its author has marked it approved, so a draft that a model wrote
 * cannot reach a reader by any path through this file.
 */
export async function listReadings(languageCode: string, levelCode?: string): Promise<ReadingListResponse> {
  const rows = await db
    .select({
      code: readings.code,
      title: readings.title,
      titleEn: readings.titleEn,
      level: languageLevels.code,
      lineCount: count(readingLines.id)
    })
    .from(readings)
    .innerJoin(languages, eq(languages.id, readings.languageId))
    .innerJoin(languageLevels, eq(languageLevels.id, readings.levelId))
    .leftJoin(readingLines, eq(readingLines.readingId, readings.id))
    .where(and(
      eq(languages.code, languageCode),
      eq(readings.published, true),
      levelCode ? eq(languageLevels.code, levelCode) : undefined
    ))
    .groupBy(readings.id, languageLevels.code, languageLevels.rank)
    .orderBy(asc(languageLevels.rank), asc(readings.sortIndex))

  return { readings: rows }
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
    stanzas.at(-1)!.push({ ...line, tokens: glossLine(line.text, g, line.reading, { regroupKana: true }) })
  }

  const { id: _id, ...rest } = row
  return { ...rest, lineCount: lines.length, stanzas }
}
