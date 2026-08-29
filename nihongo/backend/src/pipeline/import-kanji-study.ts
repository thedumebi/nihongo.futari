/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import {
  exercisePrompts,
  exerciseTemplates,
  kanji,
  kanjiReadings,
  languages,
  studyItemFacets,
  studyItems
} from '@nihongo/shared/db/schema'
import { and, asc, eq, inArray } from 'drizzle-orm'

/**
 * Teach kanji, not just draw them.
 *
 * Kanji study items existed but carried a WRITING facet only, so a kanji could
 * be practised as a shape while remaining unreadable — you could draw 静
 * perfectly and not know it meant "quiet". This adds the meaning and reading
 * facets that make the kanji deck an actual curriculum.
 *
 *   pnpm -C nihongo/backend import:kanji-study
 */

const CHOICES = 4

function shuffle<T>(items: T[], seed: string): T[] {
  const out = [...items]
  let state = [...seed].reduce((a, c) => (a * 31 + c.codePointAt(0)!) % 2147483647, 13) || 1
  for (let i = out.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) % 2147483648
    const j = state % (i + 1)
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

async function ensureFacet(studyItemId: string, facet: string, introOrder: number): Promise<{ id: string, created: boolean }> {
  const [inserted] = await db.insert(studyItemFacets).values({
    studyItemId,
    facet,
    enabled: true,
    introOrder
  }).onConflictDoNothing().returning({ id: studyItemFacets.id })
  if (inserted)
    return { id: inserted.id, created: true }

  const [existing] = await db
    .select({ id: studyItemFacets.id })
    .from(studyItemFacets)
    .where(and(eq(studyItemFacets.studyItemId, studyItemId), eq(studyItemFacets.facet, facet)))
    .limit(1)
  return { id: existing!.id, created: false }
}

async function main() {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing')

  const templates = await db.select({ id: exerciseTemplates.id, code: exerciseTemplates.code }).from(exerciseTemplates)
  const mcq = templates.find(t => t.code === 'mcq')
  const readingInput = templates.find(t => t.code === 'reading-input')
  if (!mcq || !readingInput)
    throw new Error('mcq / reading-input templates missing — run the seeds')

  // Create the study item here rather than relying on the writing importer.
  // That importer requires KanjiVG stroke data, so 172 published kanji with no
  // glyph had no study item at all — unlearnable even for meaning, purely
  // because nobody had drawn them.
  const published = await db
    .select({
      id: kanji.id,
      character: kanji.character,
      meanings: kanji.meanings,
      strokeCount: kanji.strokeCount,
      levelId: kanji.levelId,
      frequencyRank: kanji.frequencyRank
    })
    .from(kanji)
    .where(and(eq(kanji.languageId, language.id), eq(kanji.published, true)))
    .orderBy(asc(kanji.strokeCount), asc(kanji.frequencyRank))

  let itemsCreated = 0
  const rows: Array<{
    studyItemId: string
    kanjiId: string
    character: string
    meanings: Array<{ gloss: string, lang: string }> | null
    strokeCount: number | null
  }> = []

  for (const [index, k] of published.entries()) {
    const [created] = await db.insert(studyItems).values({
      languageId: language.id,
      kanjiId: k.id,
      kind: 'kanji',
      levelId: k.levelId,
      sortIndex: index,
      published: true,
      active: true
    }).onConflictDoNothing().returning({ id: studyItems.id })

    const studyItemId = created?.id ?? (await db
      .select({ id: studyItems.id })
      .from(studyItems)
      .where(eq(studyItems.kanjiId, k.id))
      .limit(1))[0]?.id
    if (!studyItemId)
      continue
    if (created)
      itemsCreated++

    rows.push({
      studyItemId,
      kanjiId: k.id,
      character: k.character,
      meanings: k.meanings,
      strokeCount: k.strokeCount
    })
  }

  const readings = new Map<string, { on: string[], kun: string[] }>()
  for (const row of await db
    .select({ kanjiId: kanjiReadings.kanjiId, reading: kanjiReadings.reading, type: kanjiReadings.type })
    .from(kanjiReadings)
    .where(inArray(kanjiReadings.type, ['on', 'kun']))
    .orderBy(asc(kanjiReadings.sortIndex))) {
    const entry = readings.get(row.kanjiId) ?? { on: [], kun: [] }
    if (row.type === 'on')
      entry.on.push(row.reading)
    else entry.kun.push(row.reading)
    readings.set(row.kanjiId, entry)
  }

  const glossOf = (m: Array<{ gloss: string, lang: string }> | null) =>
    m?.find(g => g.lang === 'en')?.gloss ?? m?.[0]?.gloss ?? null
  const glossPool = [...new Set(rows.map(r => glossOf(r.meanings)).filter((g): g is string => Boolean(g)))]

  let facets = 0
  let meaningPrompts = 0
  let readingPrompts = 0
  let skippedNoReading = 0

  for (const row of rows) {
    const gloss = glossOf(row.meanings)
    const entry = readings.get(row.kanjiId)

    // ---- meaning ------------------------------------------------------------
    if (gloss) {
      const facet = await ensureFacet(row.studyItemId, 'meaning', 0)
      if (facet.created)
        facets++

      const distractors = shuffle(glossPool.filter(g => g !== gloss), row.kanjiId).slice(0, CHOICES - 1)
      const [prompt] = await db.insert(exercisePrompts).values({
        facetId: facet.id,
        templateId: mcq.id,
        languageId: language.id,
        prompt: {
          kind: 'kanji',
          character: row.character,
          strokeCount: row.strokeCount,
          instruction: 'What does this kanji mean?'
        },
        answer: { primary: gloss, accepted: [gloss] },
        distractors
      }).onConflictDoNothing().returning({ id: exercisePrompts.id })
      if (prompt)
        meaningPrompts++
    }

    // ---- reading ------------------------------------------------------------
    // Kun first: it is the reading the character has on its own, which is what
    // a lone kanji on a card is asking for. On-readings live in compounds.
    const target = entry?.kun[0] ?? entry?.on[0]
    if (!target) {
      skippedNoReading++
      continue
    }
    const accepted = [...new Set([...(entry?.kun ?? []), ...(entry?.on ?? [])])]
      // KANJIDIC marks okurigana with a dot (ta.beru) and prefixes with a
      // hyphen; neither is part of what anyone would type.
      .map(r => r.replace(/[.\-]/g, ''))
      .filter(Boolean)

    const facet = await ensureFacet(row.studyItemId, 'reading', 1)
    if (facet.created)
      facets++

    const [prompt] = await db.insert(exercisePrompts).values({
      facetId: facet.id,
      templateId: readingInput.id,
      languageId: language.id,
      prompt: {
        kind: 'kanji',
        character: row.character,
        hint: gloss,
        instruction: 'Type a reading for this kanji, in kana'
      },
      answer: { primary: target.replace(/[.\-]/g, ''), accepted },
      assets: {}
    }).onConflictDoNothing().returning({ id: exercisePrompts.id })
    if (prompt)
      readingPrompts++
  }

  console.log(`Study items created:     ${itemsCreated}`)
  console.log(`Kanji covered:           ${rows.length}`)
  console.log(`Facets created:          ${facets}`)
  console.log(`Meaning prompts:         ${meaningPrompts}`)
  console.log(`Reading prompts:         ${readingPrompts}`)
  if (skippedNoReading > 0)
    console.log(`No reading in KANJIDIC:  ${skippedNoReading}`)
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
