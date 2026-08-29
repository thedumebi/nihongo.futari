import { drizzle } from 'drizzle-orm/node-postgres'
import pg, { Pool } from 'pg'

import env from '@/env.js'

import * as schema from './schema/index.js'

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
  max: (env.DB_MIGRATING || env.DB_SEEDING) ? 1 : env.DB_POOL_MAX,
  idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: env.DB_POOL_CONNECTION_TIMEOUT_MS,
  ...(ssl ? { ssl } : {})
})

const db = drizzle(connection, {
  schema,
  logger: env.NODE_ENV !== 'production'
})

// eslint-disable-next-line ts/no-redeclare
export type db = typeof db
export type DbOrTx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0]

export default db
