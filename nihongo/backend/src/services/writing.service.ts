import type { WritingCharacter, WritingQueue } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { characterStrokes, kana, kanji, kanjiReadings, languages } from '@nihongo/shared/db/schema'
import { and, asc, eq, inArray, isNotNull, sql } from 'drizzle-orm'

/**
 * Handwriting reference data.
 *
 * Serves the stroke paths the canvas grades against. Kana and kanji are both
 * here because `character_strokes` covers both arms of its exclusive arc, and
 * because hiragana is where handwriting practice actually starts.
 *
 * Nothing user-scoped lives in this file — reference strokes are the same for
 * everyone, so there is no ownership filter to get wrong.
 */

/** KanjiVG draws every glyph in a 109x109 box. */
const VIEW_BOX = 109

/**
 * What the character means, in a few words rather than one.
 *
 * A single gloss was all the practice card showed, and for a kanji that is
 * often the least useful one — 生 as "life" says nothing about 生きる, 生まれる
 * or 先生. Three is enough to place it without becoming a dictionary entry.
 */
function meaningOf(meanings: Array<{ gloss: string, lang: string }> | null): string | null {
  const english = meanings?.filter(m => m.lang === 'en') ?? []
  const chosen = (english.length > 0 ? english : meanings ?? []).slice(0, 3)
  return chosen.length > 0 ? chosen.map(m => m.gloss).join(', ') : null
}

async function languageId(languageCode: string): Promise<string | null> {
  const [row] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, languageCode)).limit(1)
  return row?.id ?? null
}

async function strokesFor(
  owner: 'kanjiId' | 'kanaId',
  ids: string[]
): Promise<Map<string, WritingCharacter['strokes']>> {
  if (ids.length === 0)
    return new Map()

  const rows = await db
    .select({
      ownerId: characterStrokes[owner],
      index: characterStrokes.strokeIndex,
      path: characterStrokes.path,
      kvgType: characterStrokes.kvgType
    })
    .from(characterStrokes)
    .where(inArray(characterStrokes[owner], ids))
    .orderBy(asc(characterStrokes[owner]), asc(characterStrokes.strokeIndex))

  const byOwner = new Map<string, WritingCharacter['strokes']>()
  for (const row of rows) {
    if (!row.ownerId)
      continue
    const list = byOwner.get(row.ownerId) ?? []
    list.push({ index: row.index, path: row.path, kvgType: row.kvgType })
    byOwner.set(row.ownerId, list)
  }
  return byOwner
}

/** One character's reference strokes, looked up by the character itself. */
export async function getCharacter(languageCode: string, character: string): Promise<WritingCharacter | null> {
  const langId = await languageId(languageCode)
  if (!langId)
    return null

  const [kanjiRow] = await db
    .select({ id: kanji.id, character: kanji.character, meanings: kanji.meanings, strokeCount: kanji.strokeCount })
    .from(kanji)
    .where(and(eq(kanji.languageId, langId), eq(kanji.character, character)))
    .limit(1)

  if (kanjiRow) {
    const strokes = (await strokesFor('kanjiId', [kanjiRow.id])).get(kanjiRow.id) ?? []
    // Deliberately NOT filtered on `isCommon`: KANJIDIC has no notion of a
    // common reading and the importer leaves the flag false on every row, so
    // filtering by it returned an empty list for every kanji. Take the readings
    // in KANJIDIC's own order, on-readings first.
    const readings = await db
      .select({ reading: kanjiReadings.reading })
      .from(kanjiReadings)
      .where(and(eq(kanjiReadings.kanjiId, kanjiRow.id), inArray(kanjiReadings.type, ['on', 'kun'])))
      .orderBy(asc(kanjiReadings.type), asc(kanjiReadings.sortIndex))
      .limit(6)

    return {
      character: kanjiRow.character,
      kind: 'kanji',
      viewBox: VIEW_BOX,
      label: meaningOf(kanjiRow.meanings),
      readings: readings.map(r => r.reading),
      // KanjiVG is authoritative for drawing: it is what the grader compares
      // against, so a KANJIDIC count that disagrees would be a wrong target.
      strokeCount: strokes.length || (kanjiRow.strokeCount ?? 0),
      strokes,
      // Kanji belong to no syllabary line.
      row: null,
      variant: null
    }
  }

  const [kanaRow] = await db
    .select({
      id: kana.id,
      character: kana.character,
      romaji: kana.romaji,
      script: kana.script,
      row: kana.row,
      variant: kana.variant
    })
    .from(kana)
    .where(and(eq(kana.languageId, langId), eq(kana.character, character)))
    .limit(1)

  if (!kanaRow)
    return null

  const strokes = (await strokesFor('kanaId', [kanaRow.id])).get(kanaRow.id) ?? []
  return {
    character: kanaRow.character,
    kind: 'kana',
    viewBox: VIEW_BOX,
    label: kanaRow.romaji,
    readings: [kanaRow.romaji],
    strokeCount: strokes.length,
    strokes,
    row: kanaRow.row,
    variant: kanaRow.variant
  }
}

export interface WritingQueueFilters {
  languageCode: string
  kind: 'kana' | 'kanji'
  /** hiragana | katakana, kana only. */
  script?: string
  /** base | dakuten | handakuten, kana only. */
  variant?: string
  /** The consonant line — k, s, g, z — or '' for the vowel line. Kana only. */
  row?: string
  /** Kanji only: a JLPT level code, or several comma-separated — 'N5,N4'. */
  levelCode?: string
  limit: number
}

/**
 * Characters to practise, in teaching order.
 *
 * Filtered to characters that HAVE stroke data — offering a character the
 * grader has no reference for would fail every attempt through no fault of the
 * writer.
 */
export async function getQueue(filters: WritingQueueFilters): Promise<WritingQueue> {
  const langId = await languageId(filters.languageCode)
  if (!langId)
    return { items: [], total: 0 }

  if (filters.kind === 'kana') {
    const rows = await db
      .select({
        id: kana.id,
        character: kana.character,
        romaji: kana.romaji,
        row: kana.row,
        variant: kana.variant
      })
      .from(kana)
      .where(and(
        eq(kana.languageId, langId),
        filters.script ? eq(kana.script, filters.script) : undefined,
        // Dakuten rows used to be excluded here, on the grounds that だ adds no
        // strokes to た. It adds two, and asking to practise the が line is a
        // reasonable thing to want — every one of the 142 kana has stroke data,
        // so there was nothing to protect against.
        filters.variant ? eq(kana.variant, filters.variant) : undefined,
        filters.row === undefined ? undefined : eq(kana.row, filters.row),
        sql`exists (select 1 from character_strokes cs where cs.kana_id = ${kana.id})`
      ))
      .orderBy(asc(kana.orderIndex))
      .limit(filters.limit)

    const strokes = await strokesFor('kanaId', rows.map(r => r.id))
    return {
      items: rows.map(row => ({
        character: row.character,
        kind: 'kana' as const,
        viewBox: VIEW_BOX,
        label: row.romaji,
        readings: [row.romaji],
        strokeCount: strokes.get(row.id)?.length ?? 0,
        strokes: strokes.get(row.id) ?? [],
        row: row.row,
        variant: row.variant
      })),
      total: rows.length
    }
  }

  const levelCodes = (filters.levelCode ?? '')
    .split(',')
    .map(c => c.trim())
    .filter(Boolean)

  const rows = await db
    .select({
      id: kanji.id,
      character: kanji.character,
      meanings: kanji.meanings,
      strokeCount: kanji.strokeCount
    })
    .from(kanji)
    .where(and(
      eq(kanji.languageId, langId),
      // Published only: the other ~1,700 jōyō are reference data imported for
      // the dictionary and sound series, not a practice list.
      eq(kanji.published, true),
      isNotNull(kanji.strokeCount),
      // The level picker the page never offered. 430 kanji at N5 down to 307 at
      // N1, and practising all 2,004 in stroke-count order was the only option.
      levelCodes.length > 0
        ? sql`exists (
            select 1 from language_levels l
            where l.id = ${kanji.levelId}
              and l.code in (${sql.join(levelCodes.map(c => sql`${c}`), sql`, `)})
          )`
        : undefined,
      sql`exists (select 1 from character_strokes cs where cs.kanji_id = ${kanji.id})`
    ))
    .orderBy(asc(kanji.strokeCount), asc(kanji.frequencyRank))
    .limit(filters.limit)

  const strokes = await strokesFor('kanjiId', rows.map(r => r.id))
  return {
    items: rows.map(row => ({
      character: row.character,
      kind: 'kanji' as const,
      viewBox: VIEW_BOX,
      label: meaningOf(row.meanings),
      readings: [],
      strokeCount: strokes.get(row.id)?.length ?? row.strokeCount ?? 0,
      strokes: strokes.get(row.id) ?? [],
      row: null,
      variant: null
    })),
    total: rows.length
  }
}
