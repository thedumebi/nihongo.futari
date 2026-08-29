/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import {
  characterStrokes,
  exercisePrompts,
  exerciseTemplates,
  kana,
  kanjiReadings,
  kanji as kanjiTable,
  languages,
  studyItemFacets,
  studyItems
} from '@nihongo/shared/db/schema'
import { and, asc, eq, inArray } from 'drizzle-orm'

/**
 * Wire handwriting into the SRS.
 *
 * The `writing` facet and the `handwriting` template both existed already — the
 * scheduler simply had no writing facets to schedule, so the drill lived
 * outside spaced repetition. This creates them.
 *
 * Reference strokes are written into the prompt's `assets`, which the study
 * queue already ships and caches, so a scheduled writing review works offline
 * with no extra plumbing.
 *
 *   pnpm -C nihongo/backend import:writing
 */

const CHUNK = 500

interface Candidate {
  studyItemId: string
  character: string
  label: string | null
  readings: string[]
  strokes: Array<{ index: number, path: string, kvgType: string | null }>
}

async function strokesByOwner(owner: 'kanjiId' | 'kanaId', ids: string[]) {
  const out = new Map<string, Candidate['strokes']>()
  for (let i = 0; i < ids.length; i += CHUNK) {
    const rows = await db
      .select({
        ownerId: characterStrokes[owner],
        index: characterStrokes.strokeIndex,
        path: characterStrokes.path,
        kvgType: characterStrokes.kvgType
      })
      .from(characterStrokes)
      .where(inArray(characterStrokes[owner], ids.slice(i, i + CHUNK)))
      .orderBy(asc(characterStrokes[owner]), asc(characterStrokes.strokeIndex))

    for (const row of rows) {
      if (!row.ownerId)
        continue
      const list = out.get(row.ownerId) ?? []
      list.push({ index: row.index, path: row.path, kvgType: row.kvgType })
      out.set(row.ownerId, list)
    }
  }
  return out
}

async function main() {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing')

  const [template] = await db
    .select({ id: exerciseTemplates.id })
    .from(exerciseTemplates)
    .where(eq(exerciseTemplates.code, 'handwriting'))
    .limit(1)
  if (!template)
    throw new Error('handwriting exercise template missing — run the seeds')

  const candidates: Candidate[] = []

  // --- Kana: study items already exist, so only the facet is missing. --------
  const kanaRows = await db
    .select({ studyItemId: studyItems.id, kanaId: kana.id, character: kana.character, romaji: kana.romaji })
    .from(studyItems)
    .innerJoin(kana, eq(kana.id, studyItems.kanaId))
    .where(and(eq(studyItems.languageId, language.id), eq(kana.variant, 'base')))

  const kanaStrokes = await strokesByOwner('kanaId', kanaRows.map(r => r.kanaId))
  for (const row of kanaRows) {
    const strokes = kanaStrokes.get(row.kanaId)
    // No reference strokes means the grader has nothing to compare against, so
    // scheduling it would fail every attempt through no fault of the writer.
    if (!strokes?.length)
      continue
    candidates.push({
      studyItemId: row.studyItemId,
      character: row.character,
      label: row.romaji,
      readings: [row.romaji],
      strokes
    })
  }

  // --- Kanji: no study items exist at all yet, so create them. ---------------
  //
  // These carry a writing facet ONLY. Kanji reading and meaning facets are a
  // separate module that does not exist yet, so a kanji currently appears in
  // the writing drill and nowhere else — deliberately, rather than inventing
  // half a kanji curriculum here.
  const kanjiRows = await db
    .select({
      id: kanjiTable.id,
      character: kanjiTable.character,
      meanings: kanjiTable.meanings,
      levelId: kanjiTable.levelId,
      strokeCount: kanjiTable.strokeCount,
      frequencyRank: kanjiTable.frequencyRank
    })
    .from(kanjiTable)
    .where(and(eq(kanjiTable.languageId, language.id), eq(kanjiTable.published, true)))
    .orderBy(asc(kanjiTable.strokeCount), asc(kanjiTable.frequencyRank))

  const kanjiStrokes = await strokesByOwner('kanjiId', kanjiRows.map(r => r.id))

  const readingRows = await db
    .select({ kanjiId: kanjiReadings.kanjiId, reading: kanjiReadings.reading, type: kanjiReadings.type })
    .from(kanjiReadings)
    .where(inArray(kanjiReadings.type, ['on', 'kun']))
    .orderBy(asc(kanjiReadings.type), asc(kanjiReadings.sortIndex))
  const readingsFor = new Map<string, string[]>()
  for (const row of readingRows) {
    const list = readingsFor.get(row.kanjiId) ?? []
    if (list.length < 4)
      list.push(row.reading)
    readingsFor.set(row.kanjiId, list)
  }

  let createdItems = 0
  for (const [index, row] of kanjiRows.entries()) {
    const strokes = kanjiStrokes.get(row.id)
    if (!strokes?.length)
      continue

    const [created] = await db.insert(studyItems).values({
      languageId: language.id,
      kanjiId: row.id,
      kind: 'kanji',
      levelId: row.levelId,
      // Simplest kanji first — stroke count is the only ordering that makes
      // sense for a drill about strokes.
      sortIndex: index,
      published: true,
      active: true
    }).onConflictDoNothing().returning({ id: studyItems.id })

    const studyItemId = created?.id ?? (await db
      .select({ id: studyItems.id })
      .from(studyItems)
      .where(eq(studyItems.kanjiId, row.id))
      .limit(1))[0]?.id
    if (!studyItemId)
      continue
    if (created)
      createdItems++

    candidates.push({
      studyItemId,
      character: row.character,
      label: row.meanings?.find(m => m.lang === 'en')?.gloss ?? row.meanings?.[0]?.gloss ?? null,
      readings: readingsFor.get(row.id) ?? [],
      strokes
    })
  }

  // --- Facet + prompt per candidate -----------------------------------------
  let facets = 0
  let prompts = 0

  for (const candidate of candidates) {
    const [inserted] = await db.insert(studyItemFacets).values({
      studyItemId: candidate.studyItemId,
      facet: 'writing',
      enabled: true,
      // Writing comes after recognition: you should be able to read a character
      // before being asked to produce it from memory.
      introOrder: 5
    }).onConflictDoNothing().returning({ id: studyItemFacets.id })

    const facetId = inserted?.id ?? (await db
      .select({ id: studyItemFacets.id })
      .from(studyItemFacets)
      .where(and(
        eq(studyItemFacets.studyItemId, candidate.studyItemId),
        eq(studyItemFacets.facet, 'writing')
      ))
      .limit(1))[0]?.id
    if (!facetId)
      continue
    if (inserted)
      facets++

    const [prompt] = await db.insert(exercisePrompts).values({
      facetId,
      templateId: template.id,
      languageId: language.id,
      prompt: {
        kind: 'handwriting',
        character: candidate.character,
        label: candidate.label,
        readings: candidate.readings,
        strokeCount: candidate.strokes.length,
        instruction: 'Write this character'
      },
      // The "answer" is the character itself. Grading is geometric and happens
      // on the client against `assets.strokes`; this is what gets shown in the
      // reveal, and what a non-canvas fallback would compare.
      answer: { primary: candidate.character, accepted: [candidate.character] },
      // Strokes ride along in assets so the offline bundle carries everything a
      // scheduled writing review needs.
      assets: { viewBox: 109, strokes: candidate.strokes }
    }).onConflictDoNothing().returning({ id: exercisePrompts.id })
    if (prompt)
      prompts++
  }

  console.log(`Kanji study items created: ${createdItems}`)
  console.log(`Writing facets created:    ${facets}`)
  console.log(`Handwriting prompts:       ${prompts}`)
  console.log(`Total writing candidates:  ${candidates.length}`)
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
