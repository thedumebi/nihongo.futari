/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import { characterStrokes, kana, kanji as kanjiTable, languages } from '@nihongo/shared/db/schema'
import { eq, inArray } from 'drizzle-orm'

import { DATASETS, ensureDataset } from './fetch.js'
import { parseKanjiVg } from './sources/kanjivg.js'

/**
 * Import KanjiVG stroke data for kanji AND kana.
 *
 * Feeds stroke-order animation and handwriting grading. KanjiVG covers the kana
 * syllabaries as well as kanji, which matters more than it sounds: hiragana is
 * the first thing anyone writes, so kana strokes are the ones that get used.
 *
 * Only characters already in the database are imported — this follows
 * import:kanji rather than pulling in all 11,000 characters KanjiVG ships.
 *
 *   pnpm -C nihongo/backend import:strokes
 */

interface Target {
  id: string
  character: string
  strokeCount?: number | null
}

async function importFor(
  label: string,
  targets: Map<string, Target>,
  kvgPath: string,
  owner: 'kanjiId' | 'kanaId'
): Promise<void> {
  const entries = await parseKanjiVg(kvgPath, new Set(targets.keys()))
  console.log(`${label}: ${entries.length} of ${targets.size} have stroke data`)

  const missing = [...targets.keys()].filter(c => !entries.some(e => e.character === c))
  if (missing.length > 0) {
    console.log(`  no KanjiVG glyph for ${missing.length}: ${missing.slice(0, 20).join(' ')}`)
  }

  let mismatched = 0
  const ids = entries.map(e => targets.get(e.character)!.id)

  // Clear in one statement rather than per character — 2,000 round trips for a
  // delete that a single IN handles is the difference between 2s and 40s.
  for (let i = 0; i < ids.length; i += 500) {
    await db.delete(characterStrokes).where(inArray(characterStrokes[owner], ids.slice(i, i + 500)))
  }

  const rows = entries.flatMap((entry) => {
    const target = targets.get(entry.character)!
    // KANJIDIC and KanjiVG occasionally disagree on stroke count. Worth
    // surfacing rather than silently trusting one: the grader counts strokes,
    // so a wrong reference would mark correct writing wrong.
    if (target.strokeCount != null && target.strokeCount !== entry.strokes.length)
      mismatched++

    return entry.strokes.map((stroke, index) => ({
      [owner]: target.id,
      strokeIndex: index,
      path: stroke.path,
      ...(stroke.type ? { kvgType: stroke.type } : {}),
      ...(stroke.element ? { kvgElement: stroke.element } : {})
    }))
  })

  for (let i = 0; i < rows.length; i += 1000) {
    await db.insert(characterStrokes).values(rows.slice(i, i + 1000))
  }

  console.log(`  ${rows.length} strokes written for ${entries.length} characters`)
  if (mismatched > 0) {
    console.log(`  stroke-count mismatch vs KANJIDIC on ${mismatched} (KanjiVG is authoritative for drawing)`)
  }
}

async function main() {
  const kvg = await ensureDataset(DATASETS.kanjivg)

  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing')

  const kanjiRows = await db
    .select({ id: kanjiTable.id, character: kanjiTable.character, strokeCount: kanjiTable.strokeCount })
    .from(kanjiTable)
    .where(eq(kanjiTable.languageId, language.id))
  await importFor('Kanji', new Map(kanjiRows.map(k => [k.character, k])), kvg.filePath, 'kanjiId')

  const kanaRows = await db
    .select({ id: kana.id, character: kana.character })
    .from(kana)
    .where(eq(kana.languageId, language.id))
  await importFor('Kana', new Map(kanaRows.map(k => [k.character, k])), kvg.filePath, 'kanaId')
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
