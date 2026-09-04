import { z } from 'zod'

// Postgres connection parts. DATABASE_URL is built from these in env.ts, so
// the create-db / remove-db scripts can connect to the admin `postgres` db
// with the same credentials (mirrors ofuma).
export const postgresEnvSchema = z.object({
  PG_DATABASE: z.string().default('nihongo'),
  PG_HOST: z.string().default('localhost'),
  PG_PASSWORD: z.string(),
  PG_PORT: z.string().default('5432'),
  PG_USERNAME: z.string().default('postgres')
})
export type postgresEnvType = z.infer<typeof postgresEnvSchema>

const stringBoolean = z.coerce.string().transform(val => val === 'true').default(false)

const stringArray = z.coerce.string()
  .transform(val => val.split(',').map(item => item.trim()).filter(Boolean))
  .default([])

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['test', 'development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_NAME: z.string().default('go'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  // Database
  PG_DATABASE: z.string().default('nihongo'),
  PG_HOST: z.string().default('localhost'),
  PG_PASSWORD: z.string(),
  PG_PORT: z.coerce.number().default(5432),
  PG_USERNAME: z.string().default('postgres'),
  DATABASE_URL: z.url(),
  DB_MIGRATING: stringBoolean,
  DB_SEEDING: stringBoolean,
  // Opt-in TLS for the DB connection. Off for a self-hosted Postgres on the
  // private docker network; set true (and optionally DB_SSL_CA) for a managed
  // DB like Neon/RDS that requires SSL.
  DB_SSL: stringBoolean,
  DB_SSL_CA: z.string().optional(),
  DB_POOL_MAX: z.coerce.number().default(10),
  DB_POOL_IDLE_TIMEOUT_MS: z.coerce.number().default(30000),
  DB_POOL_CONNECTION_TIMEOUT_MS: z.coerce.number().default(10000),

  // Auth
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string(),
  COOKIE_DOMAIN: z.string().optional(),
  /**
   * Google sign-in, both optional so every environment boots without them.
   *
   * Absent means the button never renders; the invite gate applies to Google
   * exactly as it does to a code or a password, because better-auth funnels
   * social sign-up through the same `user.create.before` hook.
   */
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  /**
   * How self-signup is gated.
   *   closed — no self-signup; an admin creates accounts
   *   invite — a valid invite code is required (default)
   *   open   — anyone with an email address
   * Defaults to `invite` because an open registration form on a public URL
   * collects spam long before it collects learners.
   */
  SIGNUP_MODE: z.enum(['closed', 'invite', 'open']).default('invite'),
  /** Optional extra gate: only these email domains may register at all. */
  SIGNUP_ALLOWED_DOMAINS: stringArray,

  // Public frontend origin (used to build email links back to the SPA)
  FRONTEND_URL: z.url(),

  // Redis (ofuma-style host/port/password)
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // Email (Nodemailer / SMTP — Mailpit or Ethereal in dev)
  EMAIL_HOST: z.string().default('localhost'),
  EMAIL_PORT: z.coerce.number().default(1025),
  EMAIL_SECURE: stringBoolean,
  EMAIL_USER: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_LOGGER: stringBoolean,
  EMAIL_FROM: z.email().default('hello@nihongo.local'),
  EMAIL_FROM_NAME: z.string().default('go'),
  // Brevo transactional email (used in production; dev uses SMTP/Ethereal)
  BREVO_API_KEY: z.string().optional().default(''),

  // ImageKit
  IMAGEKIT_PUBLIC_KEY: z.string().optional(),
  IMAGEKIT_PRIVATE_KEY: z.string().optional(),
  IMAGEKIT_URL_ENDPOINT: z.string().optional(),

  // Cloudflare R2 — pre-generated TTS audio and stroke assets. Public bucket,
  // zero egress; the app only ever reads, the import pipeline writes.
  R2_PUBLIC_BASE_URL: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_ENDPOINT: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),

  // Anthropic — content enrichment only. Never called on a request path; the
  // pipeline runs offline via the Batch API and everything it produces goes
  // through human review before publication.
  ANTHROPIC_API_KEY: z.string().optional(),

  // Web Push (VAPID). Generate once with `npx web-push generate-vapid-keys`.
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),

  // Shared secret for the host-cron reminder trigger (no in-app scheduler).
  CRON_SECRET: z.string().optional(),

  // CORS
  ALLOWED_ORIGINS: stringArray,
  // Directory holding the GeoLite2 .mmdb for per-view country lookup. Defaults to
  // the package-relative ./geodata, which is where geolite2-redist downloads in
  // dev; in production compose points it at the host directory shared with dmb.
  GEOLITE_DB_DIR: z.string().default('./geodata'),

  TRUSTED_PROXY_CIDRS: stringArray,

  // Admin contact recipients
  ADMIN_NOTIFICATION_EMAILS: stringArray
})

export type envType = z.infer<typeof EnvSchema>
