import type { WordCandidate } from '@nihongo/shared/lib'
import type { PhoneticSeriesListResponse, PhoneticSeriesView } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { kanji, languages, phoneticSeries, phoneticSeriesMembers } from '@nihongo/shared/db/schema'
import { exampleWord, kanjiParts, orderMembers, seriesStatus } from '@nihongo/shared/lib'
import { and, asc, desc, eq, gte, inArray, sql } from 'drizzle-orm'

import { languageByCode } from './catalogue.service.js'

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

export async function listSeries(languageCode: string, minMembers = 2, userId?: string): Promise<PhoneticSeriesListResponse> {
  const rows = await db
    .select({
      id: phoneticSeries.id,
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

  const standing = await seriesStanding(rows.map(r => r.id), userId)

  return {
    series: rows.map((r) => {
      const s = standing.get(r.id)
      const status = userId && s
        ? seriesStatus({ active: s.active, cardState: s.cardState, knownKanji: s.known, unknownKanji: s.unknown })
        : null
      return {
        component: r.component,
        primaryReading: r.primaryReading,
        memberCount: r.memberCount,
        reliability: Number(r.reliability ?? 0),
        componentMeaning: meaningOf(r.meanings),
        level: s?.active ? s.level : null,
        status: status?.status ?? (s && !s.active ? 'reference' : null),
        need: status?.need ?? 0,
        suggest: status?.suggest ?? []
      }
    })
  }
}

/**
 * Each series' study item (its level and whether it is taught as a card) and,
 * for a signed-in learner, their card on it and which of its kanji they know.
 * One query for the whole list.
 */
async function seriesStanding(seriesIds: string[], userId?: string): Promise<Map<string, {
  level: string | null
  active: boolean
  cardState: number | null
  known: number
  unknown: string[]
}>> {
  if (seriesIds.length === 0)
    return new Map()
  const res = await db.execute<{ series_id: string, level: string | null, active: boolean, card_state: number | null, known: number, unknown: string[] | null }>(sql`
    select si.phonetic_series_id as series_id, ll.code as level, si.active,
      (select max(c.state) from study_item_facets f join srs_cards c on c.facet_id = f.id and c.user_id = ${userId ?? ''}
        where f.study_item_id = si.id) as card_state,
      (select count(distinct m.kanji_id)::int from phonetic_series_members m
        join study_items ki on ki.kanji_id = m.kanji_id
        join study_item_facets kf on kf.study_item_id = ki.id
        join srs_cards kc on kc.facet_id = kf.id and kc.user_id = ${userId ?? ''} and kc.state >= 2
        where m.series_id = si.phonetic_series_id and m.follows_series) as known,
      (select array_agg(k.character order by kl.sort_index, k.character) from phonetic_series_members m
        join kanji k on k.id = m.kanji_id
        join study_items ki on ki.kanji_id = m.kanji_id and ki.kind = 'kanji' and ki.published
        join language_levels kl on kl.id = ki.level_id
        where m.series_id = si.phonetic_series_id and m.follows_series
          and not exists (select 1 from study_item_facets kf join srs_cards kc on kc.facet_id = kf.id
            where kf.study_item_id = ki.id and kc.user_id = ${userId ?? ''} and kc.state >= 2)) as unknown
    from study_items si
    left join language_levels ll on ll.id = si.level_id
    where si.kind = 'phonetic-series' and si.published and si.phonetic_series_id in ${seriesIds}`)
  return new Map(res.rows.map(r => [r.series_id, {
    level: r.level,
    active: r.active,
    cardState: r.card_state === null ? null : Number(r.card_state),
    known: Number(r.known ?? 0),
    unknown: r.unknown ?? []
  }]))
}

export async function getSeries(languageCode: string, component: string): Promise<PhoneticSeriesView | null> {
  const language = await languageByCode(languageCode)
  if (!language)
    return null
  return (await loadSeries(language.id, [component], new Set())).get(component) ?? null
}

/**
 * Series by their component, with everything a learner needs to see the
 * pattern: each kanji's parts, reading and meaning, a common word that uses
 * the reading, and — given what the learner knows — the familiar kanji first.
 *
 * Shared by the Sound series page and the review card, so both teach it the
 * same way.
 */
export async function loadSeries(languageId: string, components: readonly string[], known: ReadonlySet<string>): Promise<Map<string, PhoneticSeriesView>> {
  const out = new Map<string, PhoneticSeriesView>()
  if (components.length === 0)
    return out

  const seriesRows = await db
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
    .leftJoin(kanji, eq(kanji.id, phoneticSeries.componentKanjiId))
    .where(and(
      eq(phoneticSeries.languageId, languageId),
      inArray(phoneticSeries.componentCharacter, [...components]),
      eq(phoneticSeries.published, true)
    ))
  if (seriesRows.length === 0)
    return out

  const members = await db
    .select({
      seriesId: phoneticSeriesMembers.seriesId,
      kanjiId: kanji.id,
      character: kanji.character,
      reading: phoneticSeriesMembers.reading,
      followsSeries: phoneticSeriesMembers.followsSeries,
      exceptionNote: phoneticSeriesMembers.exceptionNote,
      strokeCount: kanji.strokeCount,
      grade: kanji.grade,
      meanings: kanji.meanings,
      // The kanji's own split, e.g. ⿰亻共.
      ids: sql<string | null>`(select kc.ids_expression from kanji_components kc where kc.parent_kanji_id = ${kanji.id} and kc.ids_expression is not null limit 1)`
    })
    .from(phoneticSeriesMembers)
    .innerJoin(kanji, eq(kanji.id, phoneticSeriesMembers.kanjiId))
    .where(inArray(phoneticSeriesMembers.seriesId, seriesRows.map(r => r.id)))
    // Easiest kanji first; orderMembers then puts followers and known ones ahead.
    .orderBy(asc(sql`coalesce(${kanji.grade}, 99)`), asc(phoneticSeriesMembers.sortIndex))

  // A handful of common words per kanji to choose an example from.
  const characters = [...new Set(members.map(m => m.character))]
  const wordRows = characters.length === 0
    ? []
    : (await db.execute<{ character: string, form: string, reading: string, rank: number | null, meaning: string | null }>(sql`
        select c.character, w.form, w.reading, w.rank, w.meaning
        from unnest(string_to_array(${characters.join(',')}, ',')) as c(character)
        cross join lateral (
          select w.primary_form as form, w.primary_reading as reading, w.frequency_rank as rank,
            (select ws.glosses->0->>'text' from word_senses ws where ws.word_id = w.id order by ws.sort_index limit 1) as meaning
          from words w
          where w.language_id = ${languageId} and w.published and w.is_common
            and w.primary_form like '%' || c.character || '%'
            and char_length(w.primary_form) between 2 and 4
          order by w.frequency_rank nulls last
          limit 12
        ) w
      `)).rows
  const wordsFor = new Map<string, WordCandidate[]>()
  for (const w of wordRows) {
    const list = wordsFor.get(w.character) ?? []
    list.push({ form: w.form, reading: w.reading, meaning: w.meaning, frequencyRank: w.rank })
    wordsFor.set(w.character, list)
  }

  for (const series of seriesRows) {
    const mine = members
      .filter(m => m.seriesId === series.id)
      .map((m) => {
        const word = exampleWord(wordsFor.get(m.character) ?? [], m.character, m.followsSeries ? series.primaryReading : m.reading, m.followsSeries)
        return {
          character: m.character,
          reading: m.reading,
          meaning: meaningOf(m.meanings),
          followsSeries: m.followsSeries,
          exceptionNote: m.exceptionNote,
          strokeCount: m.strokeCount,
          grade: m.grade,
          parts: kanjiParts(m.ids),
          word: word ? { form: word.form, reading: word.reading, meaning: word.meaning } : null,
          known: known.has(m.character)
        }
      })
    out.set(series.component, {
      component: series.component,
      primaryReading: series.primaryReading,
      alternateReadings: series.alternateReadings,
      memberCount: series.memberCount,
      reliability: Number(series.reliability ?? 0),
      componentMeaning: meaningOf(series.meanings),
      members: orderMembers(mine, known)
    })
  }
  return out
}
