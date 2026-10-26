import { defineConfig } from 'vitest/config'

import { testDbEnv } from './src/test/db-env'

/**
 * Tests against a real Postgres, built from migrations and seeds
 * (`src/test/db-global-setup.ts`). Run with `pnpm test:db`; kept apart from
 * `pnpm test` so the pre-commit hook stays fast and needs no database.
 *
 * One file at a time, in one process: every file shares the one database and
 * the one test clock.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.db.test.ts'],
    globalSetup: ['src/test/db-global-setup.ts'],
    env: testDbEnv,
    fileParallelism: false,
    pool: 'forks',
    testTimeout: 120_000,
    hookTimeout: 600_000,
    // Drizzle logs every query outside production.
    onConsoleLog: log => !log.startsWith('Query:')
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  }
})
