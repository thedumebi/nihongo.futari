/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import { kanjiReadings, kanji as kanjiTable, languages } from '@nihongo/shared/db/schema'
import { eq } from 'drizzle-orm'

import { DATASETS, ensureDataset } from './fetch.js'
import { parseKanjidic2 } from './sources/kanjidic2.js'

/**
 * Import the full jōyō set as reference data.
 *
 * The N5 vocabulary import only brings in kanji that its words happen to use —
 * 451 of them. That is fine for study but starves anything that reasons ACROSS
 * kanji: the 青 phonetic series is 晴・清・請・精・静, and four of those never
 * appear in N5 words, so the series looked almost empty.
 *
 * These rows are `published: false`. They are reference material for the
 * dictionary and the series browser, not things the scheduler should start
 * teaching — study items are created deliberately, per level.
 *
 *   pnpm -C nihongo/backend import:kanji
 */

async function main() {
  const kd = await ensureDataset(DATASETS.kanjidic2)

  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing')

  const existing = new Set(
    (await db.select({ character: kanjiTable.character }).from(kanjiTable).where(eq(kanjiTable.languageId, language.id)))
      .map(k => k.character)
  )

  const entries: Array<Parameters<Parameters<typeof parseKanjidic2>[1]>[0]> = []
  const total = await parseKanjidic2(kd.filePath, (k) => {
    // grade 1-6 are taught in primary school, 8 is the rest of jōyō.
    // 9/10 are name-only characters, which nobody studies as vocabulary.
    if (k.grade !== undefined && k.grade <= 8)
      entries.push(k)
  })
  console.log(`KANJIDIC2: ${total} scanned, ${entries.length} jōyō`)

  let added = 0
  let updated = 0

  for (const k of entries) {
    const isNew = !existing.has(k.character)
    const [row] = await db
      .insert(kanjiTable)
      .values({
        languageId: language.id,
        character: k.character,
        ...(k.codepoint !== undefined ? { codepoint: k.codepoint } : {}),
        ...(k.strokeCount !== undefined ? { strokeCount: k.strokeCount } : {}),
        ...(k.grade !== undefined ? { grade: k.grade } : {}),
        jouyou: true,
        ...(k.frequency !== undefined ? { frequencyRank: k.frequency } : {}),
        meanings: k.meanings.map(gloss => ({ gloss, lang: 'en' })),
        // Reference only. Study items are created per level, deliberately.
        published: false,
        sourceRef: k.character,
        sourceHash: `${k.strokeCount}:${k.meanings.length}`
      })
      .onConflictDoUpdate({
        target: [kanjiTable.languageId, kanjiTable.character],
        set: {
          jouyou: true,
          ...(k.strokeCount !== undefined ? { strokeCount: k.strokeCount } : {}),
          meanings: k.meanings.map(gloss => ({ gloss, lang: 'en' })),
          updatedAt: new Date()
        }
      })
      .returning({ id: kanjiTable.id })

    if (!row)
      continue
    if (isNew)
      added++
    else updated++

    await db.delete(kanjiReadings).where(eq(kanjiReadings.kanjiId, row.id))
    const readings = [
      ...k.onReadings.map((reading, i) => ({ kanjiId: row.id, type: 'on', reading, sortIndex: i })),
      ...k.kunReadings.map((reading, i) => ({ kanjiId: row.id, type: 'kun', reading, sortIndex: 100 + i }))
    ]
    if (readings.length > 0)
      await db.insert(kanjiReadings).values(readings)
  }

  console.log(`Kanji: ${added} added, ${updated} refreshed`)
  console.log('\nNext: pnpm -C nihongo/backend import:phonetics')
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
