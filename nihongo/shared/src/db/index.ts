import { drizzle } from 'drizzle-orm/node-postgres'
import { AsyncResource } from 'node:async_hooks'
import pg, { Pool } from 'pg'

import env from '@/env.js'

import * as schema from './schema/index.js'
import { startQuery, startWait } from './timing.js'

export { withQueryTiming } from './timing.js'

pg.types.setTypeParser(pg.types.builtins.NUMERIC, value => value === null ? null : Number.parseFloat(value))

function buildSslConfig() {
  // TLS is opt-in: a self-hosted Postgres on the private docker network neither
  // needs nor supports SSL, so only enable it when explicitly requested (a CA
  // implies SSL too). Managed databases set DB_SSL=true / DB_SSL_CA.
  if (!env.DB_SSL && !env.DB_SSL_CA)
    return undefined

  if (env.DB_SSL_CA) {
    const ca = env.DB_SSL_CA.replace(/\\n/g, '\n')
    return { rejectUnauthorized: true, ca }
  }

  return { rejectUnauthorized: true }
}

const ssl = buildSslConfig()

export const connection = new Pool({
  connectionString: env.DATABASE_URL,
  // No JIT. Postgres compiles a query to machine code once its estimated cost
  // passes `jit_above_cost`, and the catalogue-wide queries here do: in
  // production the lessons list spent 1.45 s of its 1.5 s compiling, on every
  // request, to save a few milliseconds of running. Compiling only pays for
  // long analytical queries, which this app does not run. Set per connection,
  // so the other databases on the shared server keep their own setting.
  options: '-c jit=off',
  max: (env.DB_MIGRATING || env.DB_SEEDING) ? 1 : env.DB_POOL_MAX,
  idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: env.DB_POOL_CONNECTION_TIMEOUT_MS,
  // Idle connections live for minutes: notice one the network dropped.
  keepAlive: true,
  ...(ssl ? { ssl } : {})
})

type Callback = (...args: unknown[]) => void

/**
 * Every query a request makes runs on a client the pool hands out: Drizzle's
 * own (a promise), and the pool's for `pool.query` (a callback). Each is timed
 * once, from the moment it is sent; a cursor (`submit`) passes through.
 */
function timedQuery(query: (...args: unknown[]) => unknown): (...args: unknown[]) => unknown {
  return (...args) => {
    const last = args.at(-1)
    if (typeof (args[0] as { submit?: unknown } | undefined)?.submit === 'function')
      return query(...args)
    const end = startQuery()
    if (typeof last === 'function') {
      return query(...args.slice(0, -1), (...result: unknown[]) => {
        end()
        ;(last as Callback)(...result)
      })
    }
    return (query(...args) as Promise<unknown>).finally(end)
  }
}

// An idle connection the server closes (a restart, an admin kill) is reported
// here and dropped by the pool. Unheard, the event would end the process.
connection.on('error', (err) => {
  console.warn(`[db] idle connection lost: ${err.message}`)
})

connection.on('connect', (client) => {
  client.query = timedQuery(client.query.bind(client)) as typeof client.query
})

// The wait for a free client is counted apart from the queries, and marked
// queued when those already waiting take every idle client and every one the
// pool still has room to open (it hands an idle one out on the next tick, so a
// burst all sees it idle). A callback waiting in the pool's queue is called by
// whichever request frees a client, so it is bound back to the request that
// asked.
const connect = connection.connect.bind(connection) as (callback?: Callback) => Promise<unknown> | undefined
connection.connect = ((callback?: Callback) => {
  const room = Math.max(0, connection.options.max - connection.totalCount)
  const end = startWait(connection.waitingCount >= connection.idleCount + room)
  if (!callback)
    return (connect() as Promise<unknown>).finally(end)
  return connect(AsyncResource.bind((...result: unknown[]) => {
    end()
    callback(...result)
  }))
}) as typeof connection.connect

const db = drizzle(connection, {
  schema,
  logger: env.NODE_ENV !== 'production'
})

// eslint-disable-next-line ts/no-redeclare
export type db = typeof db
export type DbOrTx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0]

export default db
