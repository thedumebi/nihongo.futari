/* eslint-disable no-console */
/**
 * Precompute the grammar pages' furigana and ship it as a seed.
 *
 *   pnpm -C nihongo/backend seed:grammar-furigana
 *
 * Run it after any change to grammar prose (a title, pattern, explanation,
 * formation, mistake, or a grammar etymology entry). The DB test
 * `grammar-furigana.db.test.ts` fails CI until you do, naming what is missing.
 *
 * The readings come from the shared annotator over the dictionary, as they
 * used to on every request. They now sit in the diff of the seed this writes,
 * where a wrong one can be seen, and corrected by a later seed that sets the
 * row's `source` to 'corrected'. A re-run never overwrites a correction.
 *
 * Writes only what is new or would change. A NEW numbered file every time,
 * never an edit to the last one: `seed_history` records seeds by filename, so
 * an applied seed never runs again however much it is edited.
 */

import type { FuriganaSegment } from '@nihongo/shared/lib'

import db, { connection } from '@nihongo/shared/db'
import { grammarFurigana } from '@nihongo/shared/db/schema'
import { annotate } from '@nihongo/shared/lib'
import { readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { grammarProseTexts, proseKey } from '../services/grammar-furigana.service.js'
import { getLexicon } from '../services/lexicon.service.js'

const SEEDS = path.resolve(process.cwd(), 'src/db/seeds')

const q = (s: string) => `'${s.replace(/'/g, '\'\'')}'`

/** Compared by value: jsonb hands objects back with their keys reordered. */
function sameSegments(a: FuriganaSegment[], b: FuriganaSegment[]): boolean {
  return a.length === b.length && a.every((s, i) => s.t === b[i]!.t && (s.r ?? null) === (b[i]!.r ?? null))
}

async function main() {
  const texts = await grammarProseTexts()
  const stored = new Map((await db
    .select({ textHash: grammarFurigana.textHash, segments: grammarFurigana.segments, source: grammarFurigana.source })
    .from(grammarFurigana)).map(r => [r.textHash, r]))

  const rows: Array<{ key: string, text: string, segments: FuriganaSegment[] }> = []
  for (const { languageCode, text } of texts) {
    const key = proseKey(text)
    const before = stored.get(key)
    if (before?.source === 'corrected')
      continue
    const segments = annotate(text, await getLexicon(languageCode))
    if (before && sameSegments(before.segments, segments))
      continue
    rows.push({ key, text, segments })
  }

  if (rows.length === 0) {
    console.log(`Grammar furigana is up to date (${texts.length} texts).`)
    return
  }

  const existing = (await readdir(SEEDS)).filter(f => f.endsWith('.sql')).sort()
  const next = String(Number.parseInt(existing.at(-1)?.slice(0, 3) ?? '0', 10) + 1).padStart(3, '0')
  const name = `${next}-grammar-furigana.sql`

  const values = rows.map(r => `  (${q(r.key)}, ${q(r.text)}, ${q(JSON.stringify(r.segments))}::jsonb)`)
  const sql = `-- Grammar prose furigana, precomputed by seed:grammar-furigana
-- (pipeline/make-grammar-furigana-seed.ts). ${rows.length} texts, new or changed.
-- Keyed by sha256 of the text. A row a person corrected (source 'corrected')
-- is never overwritten.
INSERT INTO content.grammar_furigana (text_hash, text, segments)
VALUES
${values.join(',\n')}
ON CONFLICT (text_hash) DO UPDATE
SET segments = excluded.segments, updated_at = now()
WHERE content.grammar_furigana.source = 'annotator';
`
  await writeFile(path.join(SEEDS, name), sql)
  console.log(`Wrote ${name}: ${rows.length} of ${texts.length} texts new or changed.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => connection.end())
