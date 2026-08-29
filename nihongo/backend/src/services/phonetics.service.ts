import type { PhoneticSeriesListResponse, PhoneticSeriesView } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { kanji, languages, phoneticSeries, phoneticSeriesMembers } from '@nihongo/shared/db/schema'
import { and, asc, desc, eq, gte, sql } from 'drizzle-orm'

/**
 * Phonetic series — "sound series".
 *
 * Roughly 80% of jōyō kanji are 形声文字: a semantic part plus a phonetic part
 * that predicts the on-reading. Learning 青 = セイ makes 晴・清・請・精・静
 * predictable instead of five separate memorisations.
 *
 * Series with a single member are excluded at import; a rule with one instance
 * predicts nothing. Exceptions ARE included and flagged, because a rule
 * presented without its exceptions is the kind of half-truth that costs a
 * learner more than it saves.
 */

function meaningOf(meanings: Array<{ gloss: string, lang: string }> | null): string | null {
  return meanings?.find(m => m.lang === 'en')?.gloss ?? meanings?.[0]?.gloss ?? null
}

export async function listSeries(languageCode: string, minMembers = 2): Promise<PhoneticSeriesListResponse> {
  const rows = await db
    .select({
      component: phoneticSeries.componentCharacter,
      primaryReading: phoneticSeries.primaryReading,
      memberCount: phoneticSeries.memberCount,
      reliability: phoneticSeries.reliability,
      meanings: kanji.meanings
    })
    .from(phoneticSeries)
    .innerJoin(languages, eq(languages.id, phoneticSeries.languageId))
    .leftJoin(kanji, eq(kanji.id, phoneticSeries.componentKanjiId))
    .where(and(
      eq(languages.code, languageCode),
      eq(phoneticSeries.published, true),
      gte(phoneticSeries.memberCount, minMembers)
    ))
    // Most reliable first: those are the ones actually worth learning as rules.
    .orderBy(desc(phoneticSeries.reliability), desc(phoneticSeries.memberCount))

  return {
    series: rows.map(r => ({
      component: r.component,
      primaryReading: r.primaryReading,
      memberCount: r.memberCount,
      reliability: Number(r.reliability ?? 0),
      componentMeaning: meaningOf(r.meanings)
    }))
  }
}

export async function getSeries(languageCode: string, component: string): Promise<PhoneticSeriesView | null> {
  const [series] = await db
    .select({
      id: phoneticSeries.id,
      component: phoneticSeries.componentCharacter,
      primaryReading: phoneticSeries.primaryReading,
      alternateReadings: phoneticSeries.alternateReadings,
      memberCount: phoneticSeries.memberCount,
      reliability: phoneticSeries.reliability,
      meanings: kanji.meanings
    })
    .from(phoneticSeries)
    .innerJoin(languages, eq(languages.id, phoneticSeries.languageId))
    .leftJoin(kanji, eq(kanji.id, phoneticSeries.componentKanjiId))
    .where(and(
      eq(languages.code, languageCode),
      eq(phoneticSeries.componentCharacter, component),
      eq(phoneticSeries.published, true)
    ))
    .limit(1)

  if (!series)
    return null

  const members = await db
    .select({
      character: kanji.character,
      reading: phoneticSeriesMembers.reading,
      followsSeries: phoneticSeriesMembers.followsSeries,
      exceptionNote: phoneticSeriesMembers.exceptionNote,
      strokeCount: kanji.strokeCount,
      grade: kanji.grade,
      meanings: kanji.meanings
    })
    .from(phoneticSeriesMembers)
    .innerJoin(kanji, eq(kanji.id, phoneticSeriesMembers.kanjiId))
    .where(eq(phoneticSeriesMembers.seriesId, series.id))
    // Followers first, then exceptions; within each, easiest kanji first.
    .orderBy(desc(phoneticSeriesMembers.followsSeries), asc(sql`coalesce(${kanji.grade}, 99)`))

  return {
    component: series.component,
    primaryReading: series.primaryReading,
    alternateReadings: series.alternateReadings,
    memberCount: series.memberCount,
    reliability: Number(series.reliability ?? 0),
    componentMeaning: meaningOf(series.meanings),
    members: members.map(m => ({
      character: m.character,
      reading: m.reading,
      meaning: meaningOf(m.meanings),
      followsSeries: m.followsSeries,
      exceptionNote: m.exceptionNote,
      strokeCount: m.strokeCount,
      grade: m.grade
    }))
  }
}
