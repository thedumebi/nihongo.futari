/**
 * Defaults for the app's env, read by both `FrontendEnvSchema` (which
 * `vite.config.ts` parses with zod) and `src/env.ts` (which reads the values
 * without zod, to keep it out of the bundle every page loads). One list, so the
 * two cannot drift.
 */
export const FRONTEND_ENV_DEFAULTS = {
  VITE_API_URL: 'http://localhost:3000',
  VITE_BACKEND_PORT: '3008',
  VITE_APP_TITLE: 'nihongo',
  VITE_PORT: 5173
} as const
