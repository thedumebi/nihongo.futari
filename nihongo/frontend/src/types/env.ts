import { z } from 'zod'

import { FRONTEND_ENV_DEFAULTS } from '../constants/env-defaults'

export const FrontendEnvSchema = z.object({
  VITE_API_URL: z.url().default(FRONTEND_ENV_DEFAULTS.VITE_API_URL),
  /**
   * Where the dev proxy forwards /api. Production has nginx doing this instead.
   *
   * Declared here because the schema STRIPS anything it does not know, and
   * `vite.config.ts` reads the parsed object — so without this line the value
   * was always undefined and the proxy silently used its hard-coded fallback.
   */
  VITE_BACKEND_PORT: z.string().default(FRONTEND_ENV_DEFAULTS.VITE_BACKEND_PORT),
  VITE_APP_TITLE: z.string().default(FRONTEND_ENV_DEFAULTS.VITE_APP_TITLE),
  VITE_PORT: z.coerce.number().default(FRONTEND_ENV_DEFAULTS.VITE_PORT)
})

export type FrontendEnv = z.infer<typeof FrontendEnvSchema>
