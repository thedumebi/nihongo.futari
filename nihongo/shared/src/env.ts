/* eslint-disable node/no-process-env */
import type { ZodError } from 'zod'

import { config } from '@dotenvx/dotenvx'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { envType, postgresEnvType } from './types/env.js'

import { EnvSchema, postgresEnvSchema } from './types/env.js'

function getEnvFilePath() {
  const nodeEnv = process.env.NODE_ENV
  const filename = nodeEnv === 'test'
    ? '.env.test'
    : nodeEnv === 'production'
      ? '.env.production'
      : nodeEnv === 'staging'
        ? '.env.staging'
        : '.env'

  if (process.env.SCRIPT_SOURCE === 'shared') {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    return path.resolve(
      __dirname,
      process.env.NODE_ENV === 'test' ? '../../backend/.env.test' : '../../backend/.env'
    )
  }

  return path.resolve(process.cwd(), filename)
}

config({ path: getEnvFilePath() })

function buildPostgresURI(options: postgresEnvType) {
  const uri = new URL('postgres://')
  uri.hostname = options.PG_HOST
  uri.port = options.PG_PORT
  uri.username = options.PG_USERNAME
  uri.password = options.PG_PASSWORD
  uri.pathname = options.PG_DATABASE
  return uri.href
}

// Build DATABASE_URL from the PG_* parts so the rest of the app (drizzle,
// the pg Pool) keeps consuming a single connection string.
const postgresEnv = postgresEnvSchema.parse(process.env)
process.env.DATABASE_URL = buildPostgresURI(postgresEnv)

// eslint-disable-next-line import/no-mutable-exports
let env: envType

try {
  if (process.env.DOCKER_BUILD === '1') {
    console.warn('⚠️  DOCKER_BUILD=1 — skipping full env validation. Env will be validated at runtime.')
    env = process.env as any
  } else {
    env = EnvSchema.parse(process.env)
  }
} catch (e) {
  const error = e as ZodError
  const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
  console.error('❌ Environment validation failed:')
  console.error(issues)
  process.exit(1)
}

export default env
