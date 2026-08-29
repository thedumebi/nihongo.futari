import env from '@nihongo/shared/env'
import { defineConfig } from 'drizzle-kit'

const productionSsl = env.DB_SSL_CA
  ? { rejectUnauthorized: true, ca: env.DB_SSL_CA.replace(/\\n/g, '\n') }
  : { rejectUnauthorized: true }

// Parse DATABASE_URL into individual fields — drizzle-kit silently drops ssl
// when given a URL string, so we go through the per-field code path.
const parsed = new URL(env.DATABASE_URL)

export default defineConfig({
  out: '../shared/src/db/migrations',
  schema: '../shared/src/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: parsed.hostname,
    port: Number(parsed.port),
    user: parsed.username,
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1),
    ...(env.NODE_ENV === 'production' ? { ssl: productionSsl } : {})
  },
  verbose: true
})
