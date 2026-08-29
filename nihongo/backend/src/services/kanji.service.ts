import type { KanjiDetail } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import {
  characterStrokes,
  etymologyEntries,
  etymologySources,
  kanji,
  kanjiReadings,
  languageLevels,
  languages,
  phoneticSeries,
  phoneticSeriesMembers,
  sources,
  words
} from '@nihongo/shared/db/schema'
import { and, asc, eq, sql } from 'drizzle-orm'

/**
 * One kanji, everything known about it.
 *
 * Assembled from six tables because the point of the page is the CONNECTION
 * between them — that 晴 reads セイ because 青 does, that you can see the
 * strokes, and that the explanation carries a citation you can check.
 */
export async function getKanjiDetail(languageCode: string, character: string): Promise<KanjiDetail | null> {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, languageCode)).limit(1)
  if (!language)
    return null

  const [row] = await db
    .select({
      id: kanji.id,
      character: kanji.character,
      meanings: kanji.meanings,
      strokeCount: kanji.strokeCount,
      grade: kanji.grade,
      frequencyRank: kanji.frequencyRank,
      level: languageLevels.code
    })
    .from(kanji)
    .leftJoin(languageLevels, eq(languageLevels.id, kanji.levelId))
    .where(and(eq(kanji.languageId, language.id), eq(kanji.character, character)))
    .limit(1)
  if (!row)
    return null

  const readingRows = await db
    .select({ reading: kanjiReadings.reading, type: kanjiReadings.type })
    .from(kanjiReadings)
    .where(eq(kanjiReadings.kanjiId, row.id))
    .orderBy(asc(kanjiReadings.sortIndex))

  const strokeRows = await db
    .select({ index: characterStrokes.strokeIndex, path: characterStrokes.path, kvgType: characterStrokes.kvgType })
    .from(characterStrokes)
    .where(eq(characterStrokes.kanjiId, row.id))
    .orderBy(asc(characterStrokes.strokeIndex))

  const [seriesRow] = await db
    .select({
      component: phoneticSeries.componentCharacter,
      reading: phoneticSeries.primaryReading,
      reliability: phoneticSeries.reliability,
      memberCount: phoneticSeries.memberCount,
      follows: phoneticSeriesMembers.followsSeries,
      exceptionNote: phoneticSeriesMembers.exceptionNote
    })
    .from(phoneticSeriesMembers)
    .innerJoin(phoneticSeries, eq(phoneticSeries.id, phoneticSeriesMembers.seriesId))
    .where(eq(phoneticSeriesMembers.kanjiId, row.id))
    .limit(1)

  const etymologyRows = await db
    .select({
      id: etymologyEntries.id,
      aspect: etymologyEntries.aspect,
      claim: etymologyEntries.claim,
      body: etymologyEntries.body,
      confidence: etymologyEntries.confidence,
      isDisputed: etymologyEntries.isDisputed,
      status: etymologyEntries.status
    })
    .from(etymologyEntries)
    .where(eq(etymologyEntries.kanjiId, row.id))
    .orderBy(asc(etymologyEntries.aspect))

  const citationRows = etymologyRows.length === 0
    ? []
    : await db
        .select({
          etymologyId: etymologySources.etymologyId,
          label: sources.title,
          locator: etymologySources.locator,
          quote: etymologySources.quote
        })
        .from(etymologySources)
        .innerJoin(sources, eq(sources.id, etymologySources.sourceId))
        .where(sql`${etymologySources.etymologyId} in ${etymologyRows.map(e => e.id)}`)
        .orderBy(asc(etymologySources.sortIndex))

  // Words that USE this kanji, commonest first — the payoff for learning it.
  const wordRows = await db
    .select({
      form: words.primaryForm,
      reading: words.primaryReading,
      level: languageLevels.code,
      gloss: sql<string | null>`(
        select g->>'text' from word_senses s, jsonb_array_elements(s.glosses) g
        where s.word_id = ${words.id} order by s.sort_index limit 1
      )`
    })
    .from(words)
    .leftJoin(languageLevels, eq(languageLevels.id, words.levelId))
    .where(and(
      eq(words.languageId, language.id),
      eq(words.published, true),
      sql`position(${character} in ${words.primaryForm}) > 0`
    ))
    .orderBy(sql`${words.isCommon} desc, ${words.frequencyRank} nulls last`)
    .limit(24)

  return {
    character: row.character,
    meanings: (row.meanings ?? []).filter(m => m.lang === 'en').map(m => m.gloss),
    level: row.level ?? null,
    strokeCount: row.strokeCount,
    grade: row.grade,
    frequencyRank: row.frequencyRank,
    readings: {
      on: readingRows.filter(r => r.type === 'on').map(r => r.reading),
      kun: readingRows.filter(r => r.type === 'kun').map(r => r.reading)
    },
    strokes: strokeRows,
    series: seriesRow
      ? {
          component: seriesRow.component,
          reading: seriesRow.reading,
          reliability: seriesRow.reliability === null ? null : Number(seriesRow.reliability),
          memberCount: seriesRow.memberCount,
          follows: seriesRow.follows,
          exceptionNote: seriesRow.exceptionNote
        }
      : null,
    etymology: etymologyRows.map(e => ({
      aspect: e.aspect,
      claim: e.claim,
      body: e.body ?? '',
      confidence: e.confidence ?? 'unknown',
      isDisputed: e.isDisputed,
      // Anything not published is a draft, and the UI must say so.
      published: e.status === 'published',
      citations: citationRows.filter(c => c.etymologyId === e.id).map(c => ({
        label: c.label,
        locator: c.locator,
        quote: c.quote
      }))
    })),
    words: wordRows.map(w => ({ form: w.form, reading: w.reading, gloss: w.gloss, level: w.level ?? null }))
  }
}
