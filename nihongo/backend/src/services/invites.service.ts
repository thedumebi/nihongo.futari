import type { CreateInviteInput, Invite, InviteResponse } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { inviteRedemptions, inviteReservations, invites } from '@nihongo/shared/db/schema'
import SendMail from '@nihongo/shared/emails'
import env from '@nihongo/shared/env'
import { and, desc, eq, gt, isNull, sql } from 'drizzle-orm'
import { randomBytes } from 'node:crypto'

/**
 * Invite codes.
 *
 * Human-transcribable alphabet: no 0/O or 1/I/L, so a code read off a screen
 * or a message survives being typed back in.
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generateCode(length = 10): string {
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i]! % ALPHABET.length]
  return `${out.slice(0, 5)}-${out.slice(5)}`
}

/**
 * The link handed to an invitee.
 *
 * Carries the email when the invite is bound to one, so the sign-up form can
 * fill it in. The invite already knows the address; making the person type it
 * back is asking them to guess which of their addresses was used, and getting
 * it wrong fails with "you need a valid invite code".
 *
 * The address is a convenience, not a credential — `assertMayCreateAccount`
 * re-checks the reservation against whatever is actually submitted, so editing
 * it in the URL gains nothing.
 */
function signupUrl(code: string, email?: string | null): string {
  const base = `${env.FRONTEND_URL.replace(/\/$/, '')}/signup?code=${encodeURIComponent(code)}`
  return email ? `${base}&email=${encodeURIComponent(email)}` : base
}

function toResponse(row: Invite): InviteResponse {
  return {
    id: row.id,
    code: row.code,
    email: row.email,
    note: row.note,
    role: row.role,
    maxUses: row.maxUses,
    useCount: row.useCount,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    revokedAt: row.revokedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    url: signupUrl(row.code, row.email)
  }
}

export async function createInvite(adminUserId: string, input: CreateInviteInput): Promise<InviteResponse> {
  const expiresAt = new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)

  const [row] = await db
    .insert(invites)
    .values({
      code: generateCode(),
      ...(input.email ? { email: input.email.toLowerCase() } : {}),
      ...(input.note ? { note: input.note } : {}),
      role: input.role,
      maxUses: input.maxUses,
      expiresAt,
      createdBy: adminUserId
    })
    .returning()

  return toResponse(row!)
}

/**
 * Email an invitation to the person it was addressed to.
 *
 * Separate from `createInvite` and never able to fail it. The code is valid the
 * moment the row exists, so a mail outage must not roll back an invitation or
 * return an error for one that was genuinely created — the admin can still copy
 * the link. What it must not do is stay silent: the caller gets told whether
 * delivery happened so the UI can say so.
 *
 * Returns undefined when there is nobody to send to, which is the ordinary case
 * for a shareable code.
 */
export async function sendInviteEmail(
  invite: InviteResponse,
  invitedBy: string
): Promise<{ emailSent: boolean, emailError?: string } | undefined> {
  if (!invite.email)
    return undefined

  try {
    await SendMail.sendInvite({
      email: invite.email,
      // There is no name for someone who does not have an account yet.
      name: invite.email,
      code: invite.code,
      url: invite.url,
      invitedBy,
      expiresAt: invite.expiresAt
        ? new Date(invite.expiresAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        : 'no set date'
    })
    return { emailSent: true }
  } catch (err) {
    return {
      emailSent: false,
      emailError: err instanceof Error ? err.message : 'Email failed'
    }
  }
}

export async function listInvites(): Promise<InviteResponse[]> {
  const rows = await db.select().from(invites).orderBy(desc(invites.createdAt)).limit(100)
  return rows.map(toResponse)
}

export async function revokeInvite(id: string): Promise<boolean> {
  const [row] = await db
    .update(invites)
    .set({ revokedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(invites.id, id), isNull(invites.revokedAt)))
    .returning({ id: invites.id })
  return Boolean(row)
}

export interface InviteCheck {
  ok: boolean
  reason?: string
  inviteId?: string
  role?: string
}

/**
 * Validate a code WITHOUT consuming it.
 *
 * Called before the account exists, so it can only reject — the redemption is
 * recorded afterwards, once there is a user id to point at.
 */
export async function checkInvite(code: string | undefined, email: string): Promise<InviteCheck> {
  if (!code)
    return { ok: false, reason: 'An invite code is required to sign up.' }

  const normalised = code.trim().toUpperCase()
  const [invite] = await db.select().from(invites).where(eq(invites.code, normalised)).limit(1)

  if (!invite)
    return { ok: false, reason: 'That invite code is not valid.' }
  if (invite.revokedAt)
    return { ok: false, reason: 'That invite code has been revoked.' }
  if (invite.expiresAt && invite.expiresAt < new Date())
    return { ok: false, reason: 'That invite code has expired.' }
  if (invite.useCount >= invite.maxUses)
    return { ok: false, reason: 'That invite code has already been used.' }
  if (invite.email && invite.email !== email.toLowerCase()) {
    return { ok: false, reason: 'That invite code was issued for a different email address.' }
  }

  return { ok: true, inviteId: invite.id, role: invite.role }
}

/**
 * Record the redemption once the account exists.
 *
 * The use count is incremented with a guarded UPDATE rather than a read-then-write,
 * so two people racing on the last use of a shared code cannot both get in.
 */
export async function redeemInvite(inviteId: string, userId: string, email: string): Promise<boolean> {
  const [claimed] = await db
    .update(invites)
    .set({ useCount: sql`${invites.useCount} + 1`, updatedAt: new Date() })
    .where(and(
      eq(invites.id, inviteId),
      isNull(invites.revokedAt),
      sql`${invites.useCount} < ${invites.maxUses}`
    ))
    .returning({ id: invites.id })

  if (!claimed)
    return false

  await db.insert(inviteRedemptions).values({ inviteId, userId, email: email.toLowerCase() }).onConflictDoNothing()
  return true
}

/** The extra domain gate, applied in every signup mode. */
export function isDomainAllowed(email: string): boolean {
  const allowed = env.SIGNUP_ALLOWED_DOMAINS
  if (allowed.length === 0)
    return true
  const domain = email.split('@')[1]?.toLowerCase()
  return Boolean(domain && allowed.some(d => d.toLowerCase() === domain))
}

const RESERVATION_TTL_MS = 30 * 60 * 1000

/**
 * Claim a code for an email address, ahead of account creation.
 *
 * Deliberately does NOT increment the use count — the code is only truly spent
 * once an account exists. An abandoned signup therefore returns the invite to
 * circulation when the reservation lapses.
 */
export async function reserveInvite(code: string, email: string): Promise<InviteCheck> {
  const check = await checkInvite(code, email)
  if (!check.ok)
    return check

  const normalisedEmail = email.toLowerCase()
  const expiresAt = new Date(Date.now() + RESERVATION_TTL_MS)

  // Clear any stale reservation for this address, then take a fresh one.
  await db
    .update(inviteReservations)
    .set({ consumedAt: new Date() })
    .where(and(eq(inviteReservations.email, normalisedEmail), isNull(inviteReservations.consumedAt)))

  await db.insert(inviteReservations).values({
    inviteId: check.inviteId!,
    email: normalisedEmail,
    role: check.role ?? 'user',
    expiresAt
  })

  return check
}

export interface LiveReservation {
  id: string
  inviteId: string
  role: string
}

/** The live, unexpired reservation for an address, if any. */
export async function findReservation(email: string): Promise<LiveReservation | null> {
  const [row] = await db
    .select({ id: inviteReservations.id, inviteId: inviteReservations.inviteId, role: inviteReservations.role })
    .from(inviteReservations)
    .where(and(
      eq(inviteReservations.email, email.toLowerCase()),
      isNull(inviteReservations.consumedAt),
      gt(inviteReservations.expiresAt, new Date())
    ))
    .limit(1)

  return row ?? null
}

/** Consume the reservation and spend the invite, now that the account exists. */
export async function consumeReservation(reservation: LiveReservation, userId: string, email: string): Promise<void> {
  await db
    .update(inviteReservations)
    .set({ consumedAt: new Date() })
    .where(eq(inviteReservations.id, reservation.id))

  await redeemInvite(reservation.inviteId, userId, email)
}
