import { sql } from 'drizzle-orm'
import { check, index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

import { users } from './auth.js'
import { primaryId, timestamps } from './columns.js'

/**
 * Emails an admin writes and sends to learners — product updates and the like.
 *
 * A campaign is written as a draft, previewed, test-sent, then sent once. On
 * send, one delivery row is made per recipient, and those rows are the queue:
 * each is claimed before its email goes out, so a retry, a crash or a second
 * worker can never send anyone the same email twice. A sent campaign is never
 * edited — it is a record of what went out.
 *
 * Only learners who leave "Product updates by email" on receive one, and every
 * email carries a one-click way to turn it off.
 */
export const emailCampaigns = pgTable('email_campaigns', {
  id: primaryId(),
  subject: text('subject').notNull(),
  /** The line inboxes show after the subject. */
  preheader: text('preheader').notNull().default(''),
  /** The body as written in the editor; wrapped in the branded template when sent. */
  bodyHtml: text('body_html').notNull(),
  /** EMAIL_AUDIENCES in constants. */
  audience: text('audience').notNull().default('all'),
  /** EMAIL_CAMPAIGN_STATUSES in constants: draft → sending → sent. */
  status: text('status').notNull().default('draft'),
  createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
  sentAt: timestamp('sent_at'),
  ...timestamps
}, t => ({
  statusCheck: check('email_campaigns_status_check', sql`${t.status} in ('draft', 'sending', 'sent')`),
  audienceCheck: check('email_campaigns_audience_check', sql`${t.audience} in ('all', 'learners', 'admins')`)
}))

export const emailDeliveries = pgTable('email_deliveries', {
  id: primaryId(),
  campaignId: text('campaign_id').notNull().references(() => emailCampaigns.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  /** pending → sending (claimed) → sent | failed. */
  status: text('status').notNull().default('pending'),
  attempts: integer('attempts').notNull().default(0),
  error: text('error'),
  sentAt: timestamp('sent_at'),
  ...timestamps
}, t => ({
  // One email per person per campaign, whatever happens.
  onePerUser: uniqueIndex('email_deliveries_campaign_user_unique').on(t.campaignId, t.userId),
  queue: index('email_deliveries_queue_idx').on(t.status, t.campaignId),
  statusCheck: check('email_deliveries_status_check', sql`${t.status} in ('pending', 'sending', 'sent', 'failed')`)
}))
