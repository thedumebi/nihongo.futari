import { z } from 'zod'

export const FrontendEnvSchema = z.object({
  VITE_API_URL: z.url().default('http://localhost:3000'),
  VITE_APP_TITLE: z.string().default('nihongo'),
  VITE_PORT: z.coerce.number().default(5173)
})

export type FrontendEnv = z.infer<typeof FrontendEnvSchema>
