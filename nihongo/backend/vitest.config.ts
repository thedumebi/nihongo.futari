import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Need a database: `pnpm test:db` (vitest.db.config.ts).
    exclude: ['src/**/*.db.test.ts', 'node_modules/**']
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  }
})
