import type { FrontendEnv } from './types/env'

import { FRONTEND_ENV_DEFAULTS } from './constants/env-defaults'

/**
 * The app's env, with the defaults `FrontendEnvSchema` uses.
 *
 * Read directly rather than parsed: the schema was the only thing pulling zod
 * into the bundle every page loads, to read four values Vite has already
 * inlined at build time. `vite.config.ts` still validates them with the schema
 * for a local build; the Docker image is built with NIHONGO_* placeholders that
 * `env.sh` swaps for real values when the container starts, which works on
 * these inlined strings the same as before.
 */
const env: FrontendEnv = {
  VITE_API_URL: import.meta.env.VITE_API_URL || FRONTEND_ENV_DEFAULTS.VITE_API_URL,
  VITE_BACKEND_PORT: import.meta.env.VITE_BACKEND_PORT || FRONTEND_ENV_DEFAULTS.VITE_BACKEND_PORT,
  VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE || FRONTEND_ENV_DEFAULTS.VITE_APP_TITLE,
  VITE_PORT: Number(import.meta.env.VITE_PORT) || FRONTEND_ENV_DEFAULTS.VITE_PORT
}

export default env
