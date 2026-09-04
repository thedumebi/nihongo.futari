import { z } from 'zod'

export const FrontendEnvSchema = z.object({
  VITE_API_URL: z.url().default('http://localhost:3000'),
  /**
   * Where the dev proxy forwards /api. Production has nginx doing this instead.
   *
   * Declared here because the schema STRIPS anything it does not know, and
   * `vite.config.ts` reads the parsed object — so without this line the value
   * was always undefined and the proxy silently used its hard-coded fallback.
   */
  VITE_BACKEND_PORT: z.string().default('3008'),
  VITE_APP_TITLE: z.string().default('nihongo'),
  VITE_PORT: z.coerce.number().default(5173)
})

export type FrontendEnv = z.infer<typeof FrontendEnvSchema>
