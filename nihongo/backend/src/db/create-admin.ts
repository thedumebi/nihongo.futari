/* eslint-disable no-console */
import { Buffer } from 'node:buffer'
import { createInterface } from 'node:readline/promises'

/**
 * Create (or promote) an admin user.
 *
 * This is how the FIRST admin is made. After that, mint invite codes from the
 * admin dashboard rather than running this again — `admin` is just a role on an
 * ordinary account, and an invite can carry it (`role: 'admin'`).
 *
 * Needed even when SIGNUP_MODE=open, because nothing self-promotes to admin.
 *
 * LOCAL:
 *   pnpm --filter backend admin:create -- --email me@x.com
 *
 * PRODUCTION — run it INSIDE the running container, the same way migrations run
 * (see the `run-migrations` init container / the compose `command`). The database
 * is intentionally not reachable from a laptop: compose binds Postgres to the
 * server's loopback, and under k8s it's a cluster-internal Service. There is no
 * route from your machine to the host named `postgres`.
 *
 *   # docker compose (on the server) — `dc` is the alias from DEPLOY.md Step 6
 *   dc run --rm backend node dist/db/create-admin.js --email me@x.com
 *
 *   # kubernetes
 *   kubectl exec -it deploy/backend -c backend -- \
 *     node dist/db/create-admin.js --email me@x.com
 *
 * FROM A LAPTOP, over an SSH tunnel — useful when this script isn't deployed yet.
 * Needs nihongo/backend/.env.keys locally to decrypt .env.production. PG_HOST/PG_PORT
 * set in the shell win, because dotenvx never overwrites an existing variable:
 *
 *   ssh -N -L 15432:127.0.0.1:5432 deploy@your-server   # leave running
 *   PG_HOST=127.0.0.1 PG_PORT=15432 \
 *     pnpm --filter backend admin:create -- --email me@x.com --env prod
 *
 * Config comes from `@nihongo/shared/env`, which picks its file from NODE_ENV and
 * decrypts it with dotenvx — so in the container everything is already wired, and
 * this script does no env loading of its own (exactly like migrate.ts). `--env`
 * only selects WHICH env file is read; it cannot make an unreachable host
 * reachable, which is why the prod path above is an exec rather than a flag.
 *
 * Args:
 *   --email     required
 *   --password  optional. Omit it and you'll be prompted without echo, which
 *               keeps the password out of shell history and `ps`. Leave the
 *               prompt BLANK (or pass --passwordless) for an OTP-only account.
 *               Omitting it for an EXISTING user leaves their password alone.
 *   --passwordless  skip the password prompt entirely; sign in by emailed code.
 *   --timezone  IANA zone (defaults to this machine's). Streaks are keyed by it.
 *   --name      display name (defaults to the local part of the email)
 *   --env       local | production | staging — sets NODE_ENV before config loads.
 *               Leave unset inside the container; it's already correct there.
 *   --yes       skip the confirmation prompt (needed for non-interactive runs)
 */

const NODE_ENV_BY_NAME: Record<string, string> = {
  local: 'development',
  development: 'development',
  staging: 'staging',
  stg: 'staging',
  production: 'production',
  prod: 'production'
}

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {}
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]!
    if (!token.startsWith('--'))
      continue
    const key = token.slice(2)
    const next = argv[i + 1]
    // `--yes` is a flag; everything else takes the following value.
    if (!next || next.startsWith('--')) {
      args[key] = true
    } else {
      args[key] = next
      i++
    }
  }
  return args
}

function fail(message: string): never {
  console.error(`✗ ${message}`)
  process.exit(1)
}

async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  try {
    return (await rl.question(question)).trim()
  } finally {
    rl.close()
  }
}

// Prompt without echoing. Keeps the password out of shell history and out of the
// process list, which `--password` on the command line cannot do.
async function askHidden(question: string): Promise<string> {
  if (!process.stdin.isTTY) {
    // Piped input, e.g. `printf '%s' "$PW" | node dist/db/create-admin.js …`
    const chunks: Buffer[] = []
    for await (const chunk of process.stdin)
      chunks.push(chunk as Buffer)
    return Buffer.concat(chunks).toString('utf8').replace(/\r?\n$/, '')
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  const pending = rl.question(question)
  // Swallow the echoed characters; the prompt itself is written once above.
  const internal = rl as unknown as { _writeToOutput?: (s: string) => void }
  internal._writeToOutput = () => {}
  try {
    return (await pending).trim()
  } finally {
    rl.close()
    process.stdout.write('\n')
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  // Must happen BEFORE @nihongo/shared/env is imported — it reads NODE_ENV at import
  // time to decide which env file to decrypt. Hence the dynamic imports below.
  if (typeof args.env === 'string') {
    const nodeEnv = NODE_ENV_BY_NAME[args.env.toLowerCase()]
    if (!nodeEnv)
      fail(`Unknown --env "${args.env}". Expected one of: ${Object.keys(NODE_ENV_BY_NAME).join(', ')}`)
    // eslint-disable-next-line node/no-process-env
    process.env.NODE_ENV = nodeEnv
  }

  const email = typeof args.email === 'string' ? args.email.trim().toLowerCase() : ''
  if (!email || !email.includes('@'))
    fail('--email is required and must look like an email address')

  const { default: appEnv } = await import('@nihongo/shared/env')
  const { default: db, connection } = await import('@nihongo/shared/db')
  const { users, accounts } = await import('@nihongo/shared/db/schema')
  const { eq } = await import('drizzle-orm')
  const { auth } = await import('../lib/auth.js')

  // Host only — echoing the full URL would put credentials on screen.
  const dbHost = (() => {
    try {
      return new URL(appEnv.DATABASE_URL).host
    } catch {
      return '(unparseable DATABASE_URL)'
    }
  })()

  console.log(`db:    ${dbHost}`)
  console.log(`email: ${email}`)

  // A local-looking host is NOT proof of a local database: reaching prod through
  // an SSH tunnel makes it 127.0.0.1 on this side. Treat the environment as the
  // authority and only skip the prompt when both agree it's a dev database.
  // eslint-disable-next-line node/no-process-env
  const nodeEnv = process.env.NODE_ENV ?? 'development'
  const isLocalHost = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::|$)/.test(dbHost)
  const isLocalDb = isLocalHost && nodeEnv !== 'production' && nodeEnv !== 'staging'

  try {
    let existing: { id: string, role: string } | undefined
    try {
      ;[existing] = await db
        .select({ id: users.id, role: users.role })
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
    } catch (error: any) {
      // The single most likely failure: running this from a laptop against a
      // database that only exists inside the cluster. Say so, rather than making
      // someone read a drizzle stack trace.
      if (error?.cause?.code === 'ENOTFOUND' || error?.code === 'ENOTFOUND') {
        fail(
          `Can't reach the database at "${dbHost}" from here.\n`
          + `  That hostname only resolves inside the deployment's network — Postgres is\n`
          + `  deliberately not exposed. Run this on the server instead, the same way\n`
          + `  migrations are run:\n\n`
          + `    # docker compose (\`dc\` alias from DEPLOY.md Step 6)\n`
          + `    dc run --rm backend node dist/db/create-admin.js --email ${email}\n\n`
          + `    # kubernetes\n`
          + `    kubectl exec -it deploy/backend -c backend -- \\\n`
          + `      node dist/db/create-admin.js --email ${email}`
        )
      }
      throw error
    }

    // Ask for the password only once we know whether it's actually needed.
    // Optional even for a NEW account: sign-in here is passwordless by default,
    // so an admin with no credential row simply signs in with an emailed code.
    // Pass --password only if you also want password sign-in.
    let password: string | null = typeof args.password === 'string' ? args.password : null
    if (password === null && !existing && args.passwordless !== true)
      password = await askHidden('password (blank for passwordless / OTP-only): ')
    if (password === '')
      password = null
    // Matches emailAndPassword.minPasswordLength in src/lib/auth.ts.
    if (password !== null && password.length < 8)
      fail('password must be at least 8 characters')

    // Anything that isn't the local database is someone's running system.
    if (!isLocalDb && args.yes !== true) {
      const answer = await ask(`\nGrant admin on ${nodeEnv} (${dbHost})? (y/N) `)
      if (answer.toLowerCase() !== 'y') {
        console.log('Aborted.')
        return
      }
    }

    // better-auth owns the password format; borrow its hasher so the credentials
    // this writes are indistinguishable from ones the app created.
    const ctx = await auth.$context
    const hashed = password === null ? null : await ctx.password.hash(password)

    if (existing) {
      await db.update(users)
        .set({ role: 'admin', active: true, updatedAt: new Date() })
        .where(eq(users.id, existing.id))

      if (hashed) {
        // A credential account may not exist yet if the user was created another
        // way, so upsert rather than assume.
        const [credential] = await db
          .select({ id: accounts.id })
          .from(accounts)
          .where(eq(accounts.userId, existing.id))
          .limit(1)

        if (credential) {
          await db.update(accounts)
            .set({ password: hashed, updatedAt: new Date() })
            .where(eq(accounts.id, credential.id))
        } else {
          await db.insert(accounts).values({
            id: crypto.randomUUID(),
            // better-auth scopes account identity by issuer from 1.7, and
            // builds this one as `local:` + the provider id.
            issuer: 'local:credential',
            accountId: existing.id,
            providerId: 'credential',
            userId: existing.id,
            password: hashed
          })
        }
      }

      console.log(
        existing.role === 'admin'
          ? `✓ ${email} was already an admin${hashed ? ' — password reset' : ' — nothing to change'}`
          : `✓ ${email} promoted to admin${hashed ? ' and password reset' : ''}`
      )
      return
    }

    const name = typeof args.name === 'string' ? args.name : email.split('@')[0]!
    const timezone = typeof args.timezone === 'string'
      ? args.timezone
      : Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    const userId = crypto.randomUUID()

    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        name,
        email,
        // Created out of band by someone with database access, so treat the
        // address as proven — otherwise the account can't sign in without a
        // verification mail it will never receive.
        emailVerified: true,
        role: 'admin',
        active: true,
        // Streaks and daily stats are keyed by the user's LOCAL date, so this
        // is not cosmetic. Defaults to this machine's zone.
        timezone
      })
      if (hashed) {
        await tx.insert(accounts).values({
          id: crypto.randomUUID(),
          issuer: 'local:credential',
          accountId: userId,
          providerId: 'credential',
          userId,
          password: hashed
        })
      }
    })

    console.log(`✓ created admin ${email} (${userId}) — timezone ${timezone}`)
    console.log(hashed
      ? '  Sign in with your password, or request an emailed code.'
      : '  Passwordless: sign in at /login and request an emailed code.')
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
