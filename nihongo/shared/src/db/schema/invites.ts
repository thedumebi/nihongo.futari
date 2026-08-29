import { relations, sql } from 'drizzle-orm'
import { index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

import { users } from './auth.js'
import { primaryId, timestamps } from './columns.js'

/**
 * Signup invitations.
 *
 * This app starts as a personal tool but is built to open up later, so signup
 * is a POLICY rather than a boolean: `closed` (admin creates accounts),
 * `invite` (a valid code required — the default), or `open`. The invite table
 * is what makes the middle mode usable without a code change.
 *
 * A code may be bound to a specific email (a personal invitation) or left open
 * with a use limit (a small cohort sharing one link).
 */
export const invites = pgTable('invites', {
  id: primaryId(),
  code: text('code').notNull(),
  /** When set, only this address may redeem the code. */
  email: text('email'),
  note: text('note'),
  /** Role granted on redemption. Lets you mint an admin invite. */
  role: text('role').notNull().default('user'),
  maxUses: integer('max_uses').notNull().default(1),
  useCount: integer('use_count').notNull().default(0),
  expiresAt: timestamp('expires_at'),
  revokedAt: timestamp('revoked_at'),
  createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
  ...timestamps
}, t => ({
  codeUnique: uniqueIndex('invites_code_unique').on(t.code),
  // Only live codes need looking up.
  liveIdx: index('invites_live_idx')
    .on(t.code)
    .where(sql`${t.revokedAt} is null and ${t.useCount} < ${t.maxUses}`),
  emailIdx: index('invites_email_idx').on(t.email)
}))

/**
 * A code claimed against an email, pending account creation.
 *
 * Signup is two steps — validate the code, then create the account (via OTP or
 * password) — and better-auth owns the second step. Binding the code to the
 * email here means the account-creation hook only has to look up by email,
 * rather than depending on an extra field surviving better-auth's request
 * body. It also makes the gate identical for both signup paths.
 */
export const inviteReservations = pgTable('invite_reservations', {
  id: primaryId(),
  inviteId: text('invite_id').notNull().references(() => invites.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').notNull().default('user'),
  expiresAt: timestamp('expires_at').notNull(),
  consumedAt: timestamp('consumed_at'),
  ...timestamps
}, t => ({
  // One live reservation per address; re-reserving replaces it.
  liveEmailUnique: uniqueIndex('invite_reservations_live_email')
    .on(t.email)
    .where(sql`${t.consumedAt} is null`),
  inviteIdx: index('invite_reservations_invite_idx').on(t.inviteId)
}))

/** Audit trail: which code created which account. */
export const inviteRedemptions = pgTable('invite_redemptions', {
  id: primaryId(),
  inviteId: text('invite_id').notNull().references(() => invites.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  redeemedAt: timestamp('redeemed_at').notNull().defaultNow(),
  ...timestamps
}, t => ({
  inviteIdx: index('invite_redemptions_invite_idx').on(t.inviteId),
  userUnique: uniqueIndex('invite_redemptions_user_unique').on(t.userId)
}))

export const invitesRelations = relations(invites, ({ one, many }) => ({
  creator: one(users, { fields: [invites.createdBy], references: [users.id] }),
  redemptions: many(inviteRedemptions)
}))
