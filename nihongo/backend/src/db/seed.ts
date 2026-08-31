/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import { sql } from 'drizzle-orm'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// Sequelize-style seeding. Each `.sql` or `.seed.ts` file in ./seeds is applied
// in filename order (001-, 002-, …). A `seed_history` table records which files
// have run, so each runs exactly once — even though this script runs on every
// deploy. The history table is created on first run, so it needs no migration.
//
// `.seed.ts` exists for content that cannot honestly be written as SQL. A
// conversation expands into dialogues, turns, replies, study items, facets and
// prompts, with reply wiring and reading derivation that `import-dialogues`
// already does and tests; restating that as literal INSERTs would be a second
// implementation to keep in step with the first. Such a seed exports
// `run(): Promise<void>` and is recorded in the history exactly like a .sql one,
// so it still runs once and never again.
//
// The difference that matters: a .sql seed runs INSIDE a transaction with its
// history row, so a failure rolls both back. A .ts seed manages its own writes
// and is recorded only after it returns, so a crash halfway leaves partial work
// and no history row — it will simply run again next deploy. Everything invoked
// this way must therefore be idempotent, which `importDialogues` is: it
// replaces each dialogue's turns wholesale rather than appending.
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
    files = (await readdir(seedsDir))
      .filter(f => f.endsWith('.sql') || f.endsWith('.seed.ts') || f.endsWith('.seed.js'))
      // Numbered prefixes order the whole set, whatever the extension.
      .sort()
  } catch {
    console.log(`No seeds directory at ${seedsDir} — nothing to do`)
    return
  }

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`↷ seed "${file}" already applied — skipping`)
      continue
    }
    console.log(`▶ applying seed "${file}"…`)

    if (file.endsWith('.sql')) {
      const contents = await readFile(path.join(seedsDir, file), 'utf8')
      await db.transaction(async (tx) => {
        await tx.execute(sql.raw(contents))
        await tx.execute(sql`INSERT INTO seed_history (name) VALUES (${file}) ON CONFLICT DO NOTHING`)
      })
    } else {
      // Imported by URL so this works from src under tsx and from dist after a
      // build, without either path being hardcoded.
      const mod = await import(pathToFileURL(path.join(seedsDir, file)).href) as { run?: () => Promise<void> }
      if (typeof mod.run !== 'function')
        throw new TypeError(`${file} must export run(): Promise<void>`)
      await mod.run()
      // Recorded only on success. A crash mid-way leaves no row, so the next
      // deploy retries — which is safe because these are idempotent.
      await db.execute(sql`INSERT INTO seed_history (name) VALUES (${file}) ON CONFLICT DO NOTHING`)
    }

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
