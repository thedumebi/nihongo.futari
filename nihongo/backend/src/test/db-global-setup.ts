/* eslint-disable no-console */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

import { TEMPLATE_DATABASE, TEST_DATABASE, testDbEnv } from './db-env.js'

/**
 * Gives the DB-backed tests a database built the way production's was: every
 * migration, then every seed.
 *
 * Seeding takes a minute or more, so it is done once into a template, keyed by
 * a hash of the migrations and seeds, and each run clones that in seconds. A
 * new migration or seed changes the hash and the template is rebuilt.
 *
 * The clone then gets a controllable clock (see `installClock`).
 */
const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const migrationsDir = path.resolve(backendDir, '../shared/src/db/migrations')
const seedsDir = path.resolve(backendDir, 'src/db/seeds')

function listFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => path.join(entry.parentPath, entry.name))
    .sort()
}

/**
 * Text sorts byte by byte, as it does in production: Postgres there runs on
 * Alpine, whose musl libc has no locale collation, so `en_US.utf8` compares
 * like C. A laptop's or a Debian CI image's en_US would order some strings
 * differently and fail a golden for a reason production never sees.
 */
const CREATE_OPTIONS = `template template0 encoding 'UTF8' lc_collate 'C' lc_ctype 'C'`

function contentHash(): string {
  const hash = createHash('sha256')
  hash.update(CREATE_OPTIONS)
  const files = [
    ...listFiles(migrationsDir),
    ...listFiles(seedsDir),
    path.join(backendDir, 'src/db/seed.ts'),
    path.join(backendDir, 'src/db/migrate.ts')
  ]
  for (const file of files) {
    hash.update(path.relative(backendDir, file))
    hash.update(readFileSync(file))
  }
  return hash.digest('hex')
}

async function connectTo(database: string): Promise<pg.Client> {
  const client = new pg.Client({
    host: testDbEnv.PG_HOST,
    port: Number(testDbEnv.PG_PORT),
    user: testDbEnv.PG_USERNAME,
    password: testDbEnv.PG_PASSWORD,
    database
  })
  // A connection dropped while idle (the admin one sits through the whole
  // seed) would otherwise surface as an unhandled 'error' event.
  client.on('error', err => console.error(`[db-tests] connection to ${database} lost:`, err.message))
  try {
    await client.connect()
  } catch (err) {
    throw new Error(
      `[db-tests] cannot reach Postgres at ${testDbEnv.PG_HOST}:${testDbEnv.PG_PORT} as ${testDbEnv.PG_USERNAME} `
      + `(start one, or set PG_HOST / PG_PORT / PG_USERNAME / PG_PASSWORD): ${(err as Error).message}`
    )
  }
  return client
}

function runScript(script: string, database: string, flag: string): void {
  execFileSync('pnpm', ['exec', 'tsx', script], {
    cwd: backendDir,
    // The child needs PATH and the rest of the shell, with the test env on top.
    // eslint-disable-next-line node/no-process-env
    env: { ...process.env, ...testDbEnv, PG_DATABASE: database, [flag]: 'true' },
    stdio: ['ignore', 'ignore', 'inherit']
  })
}

async function ensureTemplate(admin: pg.Client): Promise<void> {
  const hash = contentHash()
  const { rows } = await admin.query<{ comment: string | null }>(
    `select shobj_description(oid, 'pg_database') as comment from pg_database where datname = $1`,
    [TEMPLATE_DATABASE]
  )
  if (rows[0]?.comment === hash)
    return

  console.log(`[db-tests] building ${TEMPLATE_DATABASE} from migrations and seeds…`)
  const started = Date.now()
  await admin.query(`drop database if exists ${TEMPLATE_DATABASE}`)
  await admin.query(`create database ${TEMPLATE_DATABASE} ${CREATE_OPTIONS}`)
  runScript('src/db/migrate.ts', TEMPLATE_DATABASE, 'DB_MIGRATING')
  runScript('src/db/seed.ts', TEMPLATE_DATABASE, 'DB_SEEDING')
  // Recorded last, so a build that dies halfway is rebuilt next time. DDL
  // takes no bind parameters; the hash is hex and the name a constant.
  await admin.query(`comment on database ${TEMPLATE_DATABASE} is '${hash}'`)
  console.log(`[db-tests] template built in ${Math.round((Date.now() - started) / 1000)}s`)
}

/**
 * Lets a test set the time Postgres sees, not only the time JavaScript sees.
 *
 * Faking `Date` alone leaves every `now()` in SQL on the real clock: column
 * defaults (`created_at`, `viewed_at`) and the queries that compare against
 * `now()`. A fixture placed on a fixed day would then disagree with itself, and
 * a golden written today would fail tomorrow.
 *
 * So the clone gets a `public.now()` that reads `test_clock`, and the database's
 * search_path puts `public` before `pg_catalog`, which makes an unqualified
 * `now()` resolve to it. Column defaults were bound to `pg_catalog.now()` when
 * created, so each is pointed at the new one. An empty clock falls back to the
 * real time. Test-only: nothing here touches the migrations.
 */
async function installClock(): Promise<void> {
  const client = await connectTo(TEST_DATABASE)
  try {
    await client.query(`
      create table public.test_clock (at timestamptz);
      insert into public.test_clock values (null);
      create function public.now() returns timestamptz language sql stable as
        $$ select coalesce((select at from public.test_clock), pg_catalog.now()) $$;
    `)
    const { rows } = await client.query<{ schema: string, table: string, column: string, def: string }>(`
      select table_schema as schema, table_name as table, column_name as column, column_default as def
      from information_schema.columns
      where table_schema = 'public' and column_default ~ '\\mnow\\(\\)'
    `)
    for (const row of rows) {
      const def = row.def.replace(/\bnow\(\)/g, 'public.now()')
      await client.query(`alter table "${row.schema}"."${row.table}" alter column "${row.column}" set default ${def}`)
    }
    await client.query(`alter database ${TEST_DATABASE} set search_path = public, pg_catalog`)
  } finally {
    await client.end()
  }
}

/**
 * Two runs at once (a second worktree, a manual run beside the pre-commit
 * hook) would drop each other's database mid-test. The first run holds this
 * lock until its tests finish, so a second one waits for it.
 */
const RUN_LOCK = 4_242_001

export default async function setup(): Promise<() => Promise<void>> {
  const admin = await connectTo('postgres')
  try {
    await admin.query('select pg_advisory_lock($1)', [RUN_LOCK])
    await ensureTemplate(admin)
    await admin.query(`drop database if exists ${TEST_DATABASE} with (force)`)
    await admin.query(`create database ${TEST_DATABASE} template ${TEMPLATE_DATABASE}`)
    await installClock()
  } catch (err) {
    await admin.end()
    throw err
  }
  // Closing the connection releases the lock.
  return () => admin.end()
}
