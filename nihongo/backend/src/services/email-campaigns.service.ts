import type { EmailAudience, EmailCampaignStatus } from '@nihongo/shared/constants'
import type { EmailCampaign, EmailCampaignInput, EmailCampaignList, EmailCampaignView, EmailPreview } from '@nihongo/shared/types'

import { pino } from '@nihongo/shared'
import { API_ENDPOINTS } from '@nihongo/shared/constants'
import db from '@nihongo/shared/db'
import { emailCampaigns, emailDeliveries, users, userSettings } from '@nihongo/shared/db/schema'
import SendMail, { renderTemplate } from '@nihongo/shared/emails'
import env from '@nihongo/shared/env'
import { htmlToText, inlineEmailStyles, personalise, sanitizeEmailHtml } from '@nihongo/shared/lib'
import { and, desc, eq, sql } from 'drizzle-orm'

import { unsubscribeToken, verifyUnsubscribeToken } from '../lib/unsubscribe-token.js'

/**
 * Admin emails: write, preview, test, send once.
 *
 * Sending makes one delivery row per recipient, and those rows are the queue.
 * Each is claimed (pending → sending) before its email goes out and settled
 * after, so a retry, a restart mid-send or a second worker can never send
 * anyone the same email twice. A send left half-done by a restart is picked up
 * again by the reminders cron.
 */

const site = () => env.FRONTEND_URL.replace(/\/$/, '')

/** Who an audience reaches right now: verified, product updates on. */
function audienceWhere(audience: EmailAudience) {
  return and(
    eq(users.emailVerified, true),
    sql`coalesce(${userSettings.productUpdatesEmail}, true)`,
    audience === 'admins' ? eq(users.role, 'admin') : audience === 'learners' ? sql`${users.role} <> 'admin'` : undefined
  )
}

async function audienceCount(audience: EmailAudience): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)`.mapWith(Number) })
    .from(users)
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    .where(audienceWhere(audience))
  return row?.n ?? 0
}

async function toView(row: EmailCampaign): Promise<EmailCampaignView> {
  const [counts] = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
      sent: sql<number>`count(*) filter (where ${emailDeliveries.status} = 'sent')`.mapWith(Number),
      failed: sql<number>`count(*) filter (where ${emailDeliveries.status} = 'failed')`.mapWith(Number)
    })
    .from(emailDeliveries)
    .where(eq(emailDeliveries.campaignId, row.id))
  return {
    id: row.id,
    subject: row.subject,
    preheader: row.preheader,
    bodyHtml: row.bodyHtml,
    audience: row.audience as EmailAudience,
    status: row.status as EmailCampaignStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    sentAt: row.sentAt?.toISOString() ?? null,
    // A draft's reach is who it WOULD go to now; once sent, who it went to.
    recipients: row.status === 'draft' ? await audienceCount(row.audience as EmailAudience) : counts?.total ?? 0,
    sent: counts?.sent ?? 0,
    failed: counts?.failed ?? 0
  }
}

export async function listCampaigns(): Promise<EmailCampaignList> {
  const rows = await db.select().from(emailCampaigns).orderBy(desc(emailCampaigns.createdAt))
  return { campaigns: await Promise.all(rows.map(toView)) }
}

export async function getCampaign(id: string): Promise<EmailCampaignView | null> {
  const [row] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, id)).limit(1)
  return row ? toView(row) : null
}

export async function createCampaign(input: EmailCampaignInput, adminId: string): Promise<EmailCampaignView> {
  const [row] = await db.insert(emailCampaigns).values({ ...input, createdBy: adminId }).returning()
  return toView(row!)
}

/** Only a draft can change: a sent email is a record of what went out. Null if it is not a draft. */
export async function updateCampaign(id: string, input: EmailCampaignInput): Promise<EmailCampaignView | null> {
  const [row] = await db.update(emailCampaigns)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(emailCampaigns.id, id), eq(emailCampaigns.status, 'draft')))
    .returning()
  return row ? toView(row) : null
}

export async function deleteCampaign(id: string): Promise<boolean> {
  const rows = await db.delete(emailCampaigns)
    .where(and(eq(emailCampaigns.id, id), eq(emailCampaigns.status, 'draft')))
    .returning({ id: emailCampaigns.id })
  return rows.length > 0
}

interface Recipient { id: string, name: string, email: string }
type Content = Pick<EmailCampaignInput, 'subject' | 'preheader' | 'bodyHtml'>

/** One email, exactly as one recipient gets it. */
async function render(campaign: Content, to: Recipient) {
  const token = unsubscribeToken(to.id, env.BETTER_AUTH_SECRET)
  const query = `?u=${encodeURIComponent(to.id)}&t=${token}`
  // The page a person lands on from the link, and the address mail providers
  // call for one-click unsubscribe (the API sits under /api on the same site).
  const unsubscribeUrl = `${site()}/unsubscribe${query}`
  const oneClickUrl = `${site()}/api${API_ENDPOINTS.UNSUBSCRIBE.PRODUCT_UPDATES}${query}`
  const fields = { name: to.name || 'there', appUrl: site() }
  const body = inlineEmailStyles(personalise(sanitizeEmailHtml(campaign.bodyHtml), fields))
  const html = await renderTemplate('announcement', { body, preheader: campaign.preheader, unsubscribeUrl })
  const text = `${htmlToText(body)}\n\n—\nStop product updates: ${unsubscribeUrl}`
  return { html, text, oneClickUrl }
}

async function deliver(campaign: Content, to: Recipient, subject = campaign.subject) {
  const { html, text, oneClickUrl } = await render(campaign, to)
  await SendMail.sendCampaign({
    from: { name: env.EMAIL_FROM_NAME || '語 go', address: env.EMAIL_FROM ?? '' },
    to: to.email,
    subject,
    html,
    text,
    // What mail providers look for on bulk mail: an unsubscribe that works in
    // one click from the inbox, without opening the email.
    headers: {
      'List-Unsubscribe': `<${oneClickUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
    }
  })
}

async function recipient(userId: string): Promise<Recipient | null> {
  const [row] = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, userId)).limit(1)
  return row ?? null
}

/** The email as it will arrive, personalised for the admin looking at it. Nothing is saved. */
export async function previewCampaign(input: EmailCampaignInput, adminId: string): Promise<EmailPreview> {
  const me = await recipient(adminId)
  const { html, text } = await render(input, me ?? { id: adminId, name: '', email: '' })
  return { subject: input.subject, html, text, recipients: await audienceCount(input.audience) }
}

/** Send the saved draft to the admin alone, marked as a test. */
export async function sendTest(id: string, adminId: string): Promise<boolean> {
  const [row] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, id)).limit(1)
  const me = await recipient(adminId)
  if (!row || !me)
    return false
  await deliver(row, me, `[Test] ${row.subject}`)
  return true
}

/**
 * Send a draft to its audience. The status moves draft → sending in the same
 * statement that checks it, so a double click sends once. Null if it was not
 * a draft.
 */
export async function sendCampaign(id: string): Promise<EmailCampaignView | null> {
  const started = await db.transaction(async (tx) => {
    const [row] = await tx.update(emailCampaigns)
      .set({ status: 'sending', updatedAt: new Date() })
      .where(and(eq(emailCampaigns.id, id), eq(emailCampaigns.status, 'draft')))
      .returning()
    if (!row)
      return null
    const audience = await tx
      .select({ userId: users.id })
      .from(users)
      .leftJoin(userSettings, eq(userSettings.userId, users.id))
      .where(audienceWhere(row.audience as EmailAudience))
    if (audience.length > 0) {
      await tx.insert(emailDeliveries)
        .values(audience.map(a => ({ campaignId: row.id, userId: a.userId })))
        .onConflictDoNothing()
    }
    return row
  })
  if (!started)
    return null
  void runCampaignQueue()
  return toView(started)
}

/** How many deliveries to claim at a time, and the pause between emails. */
const BATCH = 20
const PAUSE_MS = 250
/** A claim older than this was abandoned by a crash, and is taken again. */
const STALE_CLAIM = '10 minutes'
const MAX_ATTEMPTS = 3

let running = false

/**
 * Work through every pending delivery, a batch at a time. Single-flight within
 * a process; across processes, claims are taken with SKIP LOCKED so two
 * workers never share a row. Safe to call as often as anyone likes — the
 * reminders cron calls it every tick to finish anything a restart cut short.
 */
export async function runCampaignQueue(): Promise<number> {
  if (running)
    return 0
  running = true
  let sent = 0
  try {
    for (;;) {
      const claimed = (await db.execute<{ id: string, campaign_id: string, user_id: string, attempts: number }>(sql`
        update email_deliveries d set status = 'sending', attempts = d.attempts + 1, updated_at = now()
        where d.id in (
          select id from email_deliveries
          where status = 'pending' or (status = 'sending' and updated_at < now() - ${STALE_CLAIM}::interval)
          order by created_at
          limit ${BATCH}
          for update skip locked
        )
        returning d.id, d.campaign_id, d.user_id, d.attempts`)).rows
      if (claimed.length === 0)
        break

      const campaigns = new Map<string, EmailCampaign>()
      for (const d of claimed) {
        let campaign = campaigns.get(d.campaign_id)
        if (!campaign) {
          const [row] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, d.campaign_id)).limit(1)
          if (!row)
            continue
          campaign = row
          campaigns.set(row.id, row)
        }
        const to = await recipient(d.user_id)
        try {
          if (!to)
            throw new Error('Recipient no longer exists')
          await deliver(campaign, to)
          await db.update(emailDeliveries).set({ status: 'sent', sentAt: new Date(), error: null, updatedAt: new Date() }).where(eq(emailDeliveries.id, d.id))
          sent++
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          pino.warn({ err: error, delivery: d.id }, '[campaign] delivery failed')
          await db.update(emailDeliveries)
            .set({ status: d.attempts >= MAX_ATTEMPTS ? 'failed' : 'pending', error: message.slice(0, 500), updatedAt: new Date() })
            .where(eq(emailDeliveries.id, d.id))
        }
        await new Promise(resolve => setTimeout(resolve, PAUSE_MS))
      }
    }
    // Any campaign with nothing left to send is done.
    await db.execute(sql`
      update email_campaigns c set status = 'sent', sent_at = now(), updated_at = now()
      where c.status = 'sending'
        and not exists (select 1 from email_deliveries d where d.campaign_id = c.id and d.status in ('pending', 'sending'))`)
  } finally {
    running = false
  }
  return sent
}

/** The unsubscribe link and the one-click header both land here. */
export async function unsubscribeProductUpdates(userId: string, token: string): Promise<boolean> {
  if (!verifyUnsubscribeToken(userId, token, env.BETTER_AUTH_SECRET))
    return false
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1)
  if (!user)
    return false
  await db.insert(userSettings).values({ userId, productUpdatesEmail: false }).onConflictDoUpdate({ target: userSettings.userId, set: { productUpdatesEmail: false, updatedAt: new Date() } })
  return true
}
