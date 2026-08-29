/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import {
  kanjiComponents,
  kanjiReadings,
  kanji as kanjiTable,
  languages,
  phoneticSeries,
  phoneticSeriesMembers
} from '@nihongo/shared/db/schema'
import { and, eq } from 'drizzle-orm'

import { DATASETS, ensureDataset } from './fetch.js'
import { parseIds } from './sources/ids.js'

/**
 * Derive phonetic series from decomposition plus readings.
 *
 * Roughly 80% of jōyō kanji are 形声文字 — a semantic part plus a PHONETIC part
 * that predicts the on-reading. Learn 青 = セイ and 晴・清・請・精 stop being four
 * separate memorisations.
 *
 * Derived rather than scraped: a component is phonetic for a kanji when the
 * component is itself a kanji whose own on-reading the kanji shares. That is
 * computable from CHISE decomposition plus KANJIDIC readings, both of which are
 * already imported and properly licensed — no fragile HTML parsing, and
 * `reliability` falls out of the same computation.
 *
 *   pnpm -C nihongo/backend import:phonetics
 */

/** Rendaku and related voicing: セイ/ゼイ, カ/ガ, ハ/バ/パ are the same series. */
function devoice(reading: string): string {
  const VOICED: Record<string, string> = {
    ガ: 'カ',
    ギ: 'キ',
    グ: 'ク',
    ゲ: 'ケ',
    ゴ: 'コ',
    ザ: 'サ',
    ジ: 'シ',
    ズ: 'ス',
    ゼ: 'セ',
    ゾ: 'ソ',
    ダ: 'タ',
    ヂ: 'チ',
    ヅ: 'ツ',
    デ: 'テ',
    ド: 'ト',
    バ: 'ハ',
    ビ: 'ヒ',
    ブ: 'フ',
    ベ: 'ヘ',
    ボ: 'ホ',
    パ: 'ハ',
    ピ: 'ヒ',
    プ: 'フ',
    ペ: 'ヘ',
    ポ: 'ホ'
  }
  const first = reading[0]
  return first && VOICED[first] ? VOICED[first] + reading.slice(1) : reading
}

/** Compare ignoring voicing and long-vowel marks. */
function readingKey(reading: string): string {
  return devoice(reading).replace(/[ー・.\-]/g, '')
}

/** Below this, the component is a semantic radical, not a phonetic one. */
const MIN_RELIABILITY = 0.5

async function main() {
  const ids = await ensureDataset(DATASETS.chiseIds)

  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing')

  const kanjiRows = await db
    .select({ id: kanjiTable.id, character: kanjiTable.character })
    .from(kanjiTable)
    .where(eq(kanjiTable.languageId, language.id))

  const byChar = new Map(kanjiRows.map(k => [k.character, k.id]))
  console.log(`Kanji in the database: ${byChar.size}`)

  const readings = await db
    .select({ kanjiId: kanjiReadings.kanjiId, reading: kanjiReadings.reading })
    .from(kanjiReadings)
    .where(eq(kanjiReadings.type, 'on'))

  const onReadings = new Map<string, string[]>()
  for (const r of readings) {
    const list = onReadings.get(r.kanjiId) ?? []
    list.push(r.reading)
    onReadings.set(r.kanjiId, list)
  }

  // Only decompose characters we actually hold.
  const decompositions = await parseIds(ids.filePath, new Set(byChar.keys()))
  console.log(`Decomposed: ${decompositions.length}`)

  // component character -> kanji containing it
  const containing = new Map<string, string[]>()
  for (const d of decompositions) {
    for (const component of d.components) {
      const list = containing.get(component) ?? []
      list.push(d.character)
      containing.set(component, list)
    }
  }

  // ---- store the decomposition itself -------------------------------------
  let componentRows = 0
  for (const d of decompositions) {
    const parentId = byChar.get(d.character)
    if (!parentId)
      continue
    await db.delete(kanjiComponents).where(eq(kanjiComponents.parentKanjiId, parentId))
    const rows = d.components
      .map((c, i) => {
        const componentKanjiId = byChar.get(c)
        return componentKanjiId
          ? { parentKanjiId: parentId, componentKanjiId, role: 'graphical', idsExpression: d.sequence, source: 'chise-ids', sortIndex: i }
          : null
      })
      .filter(Boolean) as Array<{ parentKanjiId: string, componentKanjiId: string, role: string, idsExpression: string, source: string, sortIndex: number }>
    if (rows.length > 0) {
      await db.insert(kanjiComponents).values(rows)
      componentRows += rows.length
    }
  }
  console.log(`Component links: ${componentRows}`)

  // ---- derive the series ---------------------------------------------------
  let seriesCount = 0
  let memberCount = 0

  for (const [component, members] of containing) {
    const componentId = byChar.get(component)
    if (!componentId)
      continue

    // The component must have an on-reading of its own — that is what makes it
    // phonetic rather than merely shared shape.
    const componentReadings = onReadings.get(componentId) ?? []
    if (componentReadings.length === 0)
      continue

    // Which of its readings do the members actually share?
    let best: { reading: string, matches: string[] } | null = null
    for (const candidate of componentReadings) {
      const key = readingKey(candidate)
      const matches = members.filter((m) => {
        const id = byChar.get(m)
        return id && (onReadings.get(id) ?? []).some(r => readingKey(r) === key)
      })
      if (!best || matches.length > best.matches.length)
        best = { reading: candidate, matches }
    }

    // A "series" of one predicts nothing. Two or more members sharing the
    // reading is the point at which it becomes a usable rule.
    if (!best || best.matches.length < 2)
      continue

    const reliability = best.matches.length / members.length

    // A component that predicts the reading LESS than half the time is not
    // functioning as a phonetic component at all — it is a semantic radical
    // that happens to appear in many characters. Without this floor, 口 came
    // out as an 84-member "series" that 8 members follow (9.5%), and those ten
    // misclassified radicals contributed 43% of all members. A rule that holds
    // under half the time is worse than no rule, so it is not stored.
    if (reliability < MIN_RELIABILITY)
      continue
    const seriesId = `ps-ja-${component}`

    await db
      .insert(phoneticSeries)
      .values({
        id: seriesId,
        languageId: language.id,
        componentCharacter: component,
        componentKanjiId: componentId,
        primaryReading: best.reading,
        alternateReadings: componentReadings.filter(r => r !== best!.reading),
        memberCount: members.length,
        reliability: reliability.toFixed(3),
        published: true,
        sourceRef: component,
        sourceHash: `${members.length}:${best.matches.length}`
      })
      .onConflictDoUpdate({
        target: [phoneticSeries.languageId, phoneticSeries.componentCharacter],
        set: {
          primaryReading: best.reading,
          memberCount: members.length,
          reliability: reliability.toFixed(3),
          updatedAt: new Date()
        }
      })
    seriesCount++

    await db.delete(phoneticSeriesMembers).where(eq(phoneticSeriesMembers.seriesId, seriesId))
    const rows = members
      .map((m, i) => {
        const id = byChar.get(m)
        if (!id)
          return null
        const memberReadings = onReadings.get(id) ?? []
        // Store the reading that MATCHES the series, not merely the first one.
        // A kanji with several on-readings follows through exactly one of them:
        // 静 is セイ and ジョウ and follows via セイ. Taking [0] made the stored
        // reading depend on unstable row order and produced 59 rows reading
        // "records ジョウ ... follows the series" — self-contradictory, and it
        // generated a confused explanation downstream.
        const matching = memberReadings.find(r => readingKey(r) === readingKey(best!.reading))
        const follows = matching !== undefined
        return {
          seriesId,
          kanjiId: id,
          reading: matching ?? memberReadings[0] ?? '',
          followsSeries: follows,
          // The exceptions are the interesting part: showing them keeps the
          // rule honest instead of overselling it.
          ...(follows ? {} : { exceptionNote: `Reads ${memberReadings.join('/') || '?'}, not ${best!.reading}` }),
          sortIndex: i
        }
      })
      .filter(Boolean) as Array<Record<string, unknown>>

    if (rows.length > 0) {
      await db.insert(phoneticSeriesMembers).values(rows as never)
      memberCount += rows.length
    }

    // Point the matching on-readings at the series, so a kanji page can say
    // "this reading is explained by 青".
    for (const m of best.matches) {
      const id = byChar.get(m)
      if (!id)
        continue
      await db
        .update(kanjiReadings)
        .set({ phoneticSeriesId: seriesId })
        .where(and(eq(kanjiReadings.kanjiId, id), eq(kanjiReadings.type, 'on')))
    }
  }

  console.log(`Phonetic series: ${seriesCount}  members: ${memberCount}`)
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
