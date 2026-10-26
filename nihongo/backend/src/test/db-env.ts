/* eslint-disable node/no-process-env */

/**
 * The env the DB-backed tests run under.
 *
 * Read from the process with local-Postgres defaults, rather than from a
 * `.env.test`, so CI only has to start a Postgres service and a laptop needs
 * nothing at all. Anything already set (CI's PG_*) wins.
 */
export const TEST_DATABASE = 'nihongo_test'

/** Built once from migrations and seeds, then cloned for every run. */
export const TEMPLATE_DATABASE = 'nihongo_test_template'

export const testDbEnv: Record<string, string> = {
  NODE_ENV: 'test',
  LOG_LEVEL: 'silent',
  PG_HOST: process.env.PG_HOST ?? 'localhost',
  PG_PORT: process.env.PG_PORT ?? '5432',
  PG_USERNAME: process.env.PG_USERNAME ?? 'postgres',
  PG_PASSWORD: process.env.PG_PASSWORD ?? 'postgres',
  PG_DATABASE: TEST_DATABASE,
  BETTER_AUTH_SECRET: 'test-secret-test-secret-test-secret-00',
  BETTER_AUTH_URL: 'http://localhost:3008',
  FRONTEND_URL: 'http://localhost:5173'
}
