import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

/**
 * better-auth managed tables. The schema is documented at
 * https://www.better-auth.com/docs/concepts/database. We extend `users`
 * without removing any of the better-auth managed columns.
 *
 * Unlike the sibling sites, this app has PUBLIC signup with email
 * verification, so `active` defaults true and `role` gates the admin surface.
 *
 * `timezone` is load-bearing, not cosmetic: every streak and daily-stat row is
 * keyed by the user's LOCAL date, computed at write time. Deriving "today"
 * from the server clock breaks for anyone who travels or studies near
 * midnight.
 */
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  // Extensions
  username: text('username').unique(),
  role: text('role').notNull().default('user'),
  active: boolean('active').notNull().default(true),
  /** IANA zone, e.g. Europe/London. Drives the 4am-local day boundary. */
  timezone: text('timezone').notNull().default('UTC'),
  locale: text('locale').notNull().default('en'),
  activeLanguageId: text('active_language_id')
})

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' })
})

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})
