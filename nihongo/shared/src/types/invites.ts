import { z } from '@hono/zod-openapi'

import type { inviteRedemptions, invites } from '@/db/schema/invites.js'

/**
 * Signup invitations.
 *
 * Derived from the Drizzle tables — the schema is the single source of truth.
 */
export type Invite = typeof invites.$inferSelect
export type NewInvite = typeof invites.$inferInsert
export type InviteRedemption = typeof inviteRedemptions.$inferSelect

/**
 * How self-signup is gated.
 *
 * `invite` is the default: this starts as a personal tool, and an open
 * registration form on a public URL collects spam accounts long before it
 * collects learners. Flipping to `open` is an env change, not a code change.
 */
export const SIGNUP_MODES = ['closed', 'invite', 'open'] as const
export type SignupMode = typeof SIGNUP_MODES[number]

export const createInviteSchema = z.object({
  /** Bind the code to one address. Omit for a shareable code. */
  email: z.email().optional(),
  note: z.string().max(200).optional(),
  role: z.enum(['user', 'admin']).default('user'),
  maxUses: z.number().int().min(1).max(100).default(1),
  expiresInDays: z.number().int().min(1).max(365).default(30)
}).openapi('CreateInvite')

export type CreateInviteInput = z.infer<typeof createInviteSchema>

export const inviteResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  email: z.string().nullable(),
  note: z.string().nullable(),
  role: z.string(),
  maxUses: z.number().int(),
  useCount: z.number().int(),
  expiresAt: z.iso.datetime().nullable(),
  revokedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  /** Ready-to-send signup link. */
  url: z.string()
}).openapi('Invite')

export type InviteResponse = z.infer<typeof inviteResponseSchema>

export const inviteListResponseSchema = z.object({
  invites: z.array(inviteResponseSchema),
  signupMode: z.enum(SIGNUP_MODES)
}).openapi('InviteList')

export type InviteListResponse = z.infer<typeof inviteListResponseSchema>

export const reserveInviteSchema = z.object({
  code: z.string().min(4).max(40),
  email: z.email()
}).openapi('ReserveInvite')

export type ReserveInviteInput = z.infer<typeof reserveInviteSchema>

export const reserveInviteResponseSchema = z.object({
  ok: z.boolean(),
  message: z.string().optional()
}).openapi('ReserveInviteResult')

export type ReserveInviteResponse = z.infer<typeof reserveInviteResponseSchema>

export const signupModeResponseSchema = z.object({
  mode: z.enum(SIGNUP_MODES),
  /** Whether the signup form must collect an invite code. */
  requiresInvite: z.boolean(),
  /** Whether self-signup is possible at all. */
  signupEnabled: z.boolean()
}).openapi('SignupMode')

export type SignupModeResponse = z.infer<typeof signupModeResponseSchema>
