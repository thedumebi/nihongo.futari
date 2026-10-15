import { z } from '@hono/zod-openapi'

import type { emailCampaigns, emailDeliveries } from '@/db/schema/emails.js'

import { EMAIL_AUDIENCES, EMAIL_CAMPAIGN_STATUSES } from '@/constants/endpoints.js'

/**
 * Admin emails: what an admin writes, what the list and editor show, and the
 * rendered preview.
 */

export type EmailCampaign = typeof emailCampaigns.$inferSelect
export type EmailDelivery = typeof emailDeliveries.$inferSelect

export const emailCampaignInputSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  preheader: z.string().trim().max(200).default(''),
  /** The editor's HTML. Personal fields: {{name}}, {{appUrl}}. */
  bodyHtml: z.string().max(200_000),
  audience: z.enum(EMAIL_AUDIENCES).default('all')
}).openapi('EmailCampaignInput')

export type EmailCampaignInput = z.infer<typeof emailCampaignInputSchema>

export const emailCampaignViewSchema = z.object({
  id: z.string(),
  subject: z.string(),
  preheader: z.string(),
  bodyHtml: z.string(),
  audience: z.enum(EMAIL_AUDIENCES),
  status: z.enum(EMAIL_CAMPAIGN_STATUSES),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  sentAt: z.iso.datetime().nullable(),
  /** Who it would go to now (a draft), or went to (sending or sent). */
  recipients: z.number().int(),
  sent: z.number().int(),
  failed: z.number().int()
}).openapi('EmailCampaign')

export type EmailCampaignView = z.infer<typeof emailCampaignViewSchema>

export const emailCampaignListSchema = z.object({
  campaigns: z.array(emailCampaignViewSchema)
}).openapi('EmailCampaignList')

export type EmailCampaignList = z.infer<typeof emailCampaignListSchema>

export const emailPreviewSchema = z.object({
  subject: z.string(),
  /** The whole email as it arrives, personalised for the admin previewing it. */
  html: z.string(),
  /** The plain-text part sent alongside it. */
  text: z.string(),
  /** How many people the chosen audience reaches right now. */
  recipients: z.number().int()
}).openapi('EmailPreview')

export type EmailPreview = z.infer<typeof emailPreviewSchema>

export const unsubscribeQuerySchema = z.object({
  u: z.string().min(1),
  t: z.string().min(1)
})

export type UnsubscribeQuery = z.infer<typeof unsubscribeQuerySchema>
