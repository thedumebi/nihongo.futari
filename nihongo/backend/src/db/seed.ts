/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import { sql } from 'drizzle-orm'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Sequelize-style seeding. Each `.sql` file in ./seeds is applied in filename
// order (001-, 002-, …). A `seed_history` table records which files have run, so
// each runs exactly once — even though this script runs on every deploy. The
// history table is created on first run, so it needs no migration.
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Resolves to nihongo/backend/src/db/seeds in both dev (src) and the image, since
// the .sql files are shipped there alongside the compiled output.
const seedsDir = path.resolve(__dirname, '../../src/db/seeds')

async function ensureSeedHistory() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS seed_history (
      name text PRIMARY KEY,
      run_at timestamptz NOT NULL DEFAULT now()
    )
  `)
}

async function appliedSeeds(): Promise<Set<string>> {
  const result = await db.execute(sql`SELECT name FROM seed_history`)
  const rows = (result.rows ?? []) as Array<Record<string, unknown>>
  return new Set(rows.map(r => String(r.name)))
}

async function main() {
  await ensureSeedHistory()
  const applied = await appliedSeeds()

  let files: string[]
  try {
    files = (await readdir(seedsDir)).filter(f => f.endsWith('.sql')).sort()
  } catch {
    console.log(`No seeds directory at ${seedsDir} — nothing to do`)
    return
  }

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`↷ seed "${file}" already applied — skipping`)
      continue
    }
    const contents = await readFile(path.join(seedsDir, file), 'utf8')
    console.log(`▶ applying seed "${file}"…`)
    await db.transaction(async (tx) => {
      await tx.execute(sql.raw(contents))
      await tx.execute(sql`INSERT INTO seed_history (name) VALUES (${file}) ON CONFLICT DO NOTHING`)
    })
    console.log(`✅ seed "${file}" applied`)
  }

  console.log('Seeds up to date')
}

main()
  .catch((err) => {
    console.error('Seeding failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
