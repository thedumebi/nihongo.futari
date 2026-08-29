/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import { languages, words } from '@nihongo/shared/db/schema'
import { classifyPitch, countMorae } from '@nihongo/shared/lib'
import { eq, sql } from 'drizzle-orm'
import { readFile } from 'node:fs/promises'

import { DATASETS, ensureDataset } from './fetch.js'

/**
 * Import pitch accent from Kanjium.
 *
 * Kanjium was listed as a source from the start but never had an importer, so
 * every word carried an empty `pitch_accent` and the `pitch` facet had nothing
 * to schedule.
 *
 * The file gives a bare downstep position, which is meaningless without the
 * mora count — 2 is a different pattern in a two-mora word than a four-mora
 * one — so the pattern is computed here from both.
 *
 *   pnpm -C nihongo/backend import:pitch
 */

const CHUNK = 400

async function main() {
  const dataset = await ensureDataset(DATASETS.kanjium)

  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing')

  // key: "expression|reading" -> positions
  const accents = new Map<string, number[]>()
  const text = await readFile(dataset.filePath, 'utf8')
  let malformed = 0

  for (const line of text.split('\n')) {
    if (!line)
      continue
    const [expression, readingField, raw] = line.split('\t')
    if (!expression || raw === undefined || raw === '') {
      malformed++
      continue
    }
    // A blank reading field means the expression IS the reading — that is how
    // every kana-only word is written here. Treating those as malformed threw
    // away 16,116 entries, most of them the kana words a beginner meets first.
    const reading = readingField || expression
    const positions = raw
      .split(',')
      .map(part => Number.parseInt(part.trim(), 10))
      .filter(n => Number.isFinite(n) && n >= 0)
    if (positions.length === 0)
      continue
    accents.set(`${expression}|${reading}`, positions)
  }
  console.log(`Kanjium: ${accents.size} accent entries (${malformed} lines skipped)`)

  const rows = await db
    .select({ id: words.id, form: words.primaryForm, reading: words.primaryReading })
    .from(words)
    .where(eq(words.languageId, language.id))

  interface Update { id: string, payload: Array<{ reading: string, positions: number[], pattern: string }> }
  const updates: Update[] = []

  for (const row of rows) {
    // Match on form+reading first; fall back to the reading alone for kana-only
    // words, where Kanjium repeats the reading as the expression.
    const positions = accents.get(`${row.form}|${row.reading}`) ?? accents.get(`${row.reading}|${row.reading}`)
    if (!positions)
      continue

    const morae = countMorae(row.reading)
    if (morae === 0)
      continue

    updates.push({
      id: row.id,
      payload: [{
        reading: row.reading,
        positions,
        // The first listed position is the standard one; the rest are accepted
        // variants, kept so the UI can say "also heard as".
        pattern: classifyPitch(positions[0]!, morae)
      }]
    })
  }

  for (let i = 0; i < updates.length; i += CHUNK) {
    const batch = updates.slice(i, i + CHUNK)
    // One statement per batch rather than one per word: 8,000 round trips is
    // minutes, this is seconds.
    await db.execute(sql`
      update words set pitch_accent = data.payload::jsonb, updated_at = now()
      from (values ${sql.join(
        batch.map(u => sql`(${u.id}, ${JSON.stringify(u.payload)})`),
        sql`, `
      )}) as data(id, payload)
      where words.id = data.id
    `)
  }

  const byPattern = new Map<string, number>()
  for (const u of updates) {
    const p = u.payload[0]!.pattern
    byPattern.set(p, (byPattern.get(p) ?? 0) + 1)
  }

  console.log(`Words with pitch accent: ${updates.length} of ${rows.length}`)
  for (const [pattern, count] of [...byPattern].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${pattern}: ${count}`)
  }
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
