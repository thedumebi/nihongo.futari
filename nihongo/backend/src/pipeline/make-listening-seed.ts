/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import { sql } from 'drizzle-orm'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { listKeys } from './lib/bucket.js'

/**
 * Write the seed that creates listening and dictation cards.
 *
 * The eligibility test is the whole point of this script. A listening card with
 * no clip is not a degraded card, it is an unanswerable one, so the seed must
 * only cover words whose audio REALLY EXISTS.
 *
 * That cannot be derived in SQL, and an earlier attempt to derive it was wrong
 * in a way worth recording: it looked for an existing prompt already pointing at
 * `/audio/words/<ent_seq>.m4a` and treated that as proof. It is not.
 * `import-vocab-study.ts` writes that path onto every vocabulary card
 * unconditionally, before any audio is generated — it even prints "Next: run
 * audio:words" afterwards. The reference is a template string, not evidence.
 *
 * The bucket is the only thing that knows. So the ent_seq list is read from it
 * and written out literally, exactly as the illustration seed does.
 *
 *   pnpm -C nihongo/backend seed:listening
 */

const SEEDS = path.resolve(process.cwd(), 'src/db/seeds')

async function main() {
  const clips = await listKeys('audio/words/')
  const res = await db.execute(
    sql`select ent_seq from words where published and ent_seq is not null order by ent_seq`
  )
  const rows = ((res as { rows?: unknown }).rows ?? res) as Array<{ ent_seq: number }>

  const eligible = rows
    .map(r => r.ent_seq)
    .filter(seq => clips.has(`audio/words/${seq}.m4a`))

  const missing = rows.length - eligible.length
  console.log(`${clips.size} word clips in the bucket`)
  console.log(`${eligible.length} of ${rows.length} published words have one`)
  if (missing > 0)
    console.log(`${missing} word(s) have no clip and are deliberately left without a listening card`)

  if (eligible.length === 0)
    throw new Error('No word audio in the bucket — nothing to seed.')

  const existing = (await readdir(SEEDS)).filter(f => f.endsWith('.sql')).sort()
  const last = existing.at(-1)
  const next = String(Number.parseInt(last?.slice(0, 3) ?? '0', 10) + 1).padStart(3, '0')
  const name = `${next}-listening-cards.sql`

  const ids: string[] = []
  for (let i = 0; i < eligible.length; i += 12)
    ids.push(`    ${eligible.slice(i, i + 12).join(', ')}`)

  const template = await readFile(path.join(SEEDS, '_listening-cards.sql.in'), 'utf8')
  await writeFile(
    path.join(SEEDS, name),
    template.replace('-- {{ENT_SEQS}}', ids.join(',\n')).replace('{{COUNT}}', String(eligible.length))
  )
  console.log(`Wrote ${name}`)
}

main()
  .catch((err) => {
    console.error('Seed generation failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
