import type Mail from 'nodemailer/lib/mailer/index.js'

import { z } from 'zod'

export const emailRecipientSchema = z.object({
  name: z.string(),
  email: z.email()
})
export type EmailRecipient = z.infer<typeof emailRecipientSchema>

export interface EmailRecipientSchema {
  to: string | Mail.Address | Array<string | Mail.Address>
  cc?: string | Mail.Address | Array<string | Mail.Address>
  bcc?: string | Mail.Address | Array<string | Mail.Address>
  replyTo?: string | Mail.Address | Array<string | Mail.Address>
}

export const verifyOtpSchema = emailRecipientSchema.extend({
  otp: z.string()
})
export type VerifyOtpType = z.infer<typeof verifyOtpSchema>

export const signInOtpSchema = emailRecipientSchema.extend({
  otp: z.string()
})
export type SignInOtpType = z.infer<typeof signInOtpSchema>

export const resetPasswordEmailSchema = emailRecipientSchema.extend({
  url: z.string()
})
export type ResetPasswordEmailType = z.infer<typeof resetPasswordEmailSchema>

export const verifyEmailSchema = emailRecipientSchema.extend({
  url: z.string()
})
export type VerifyEmailType = z.infer<typeof verifyEmailSchema>

/**
 * An invitation to create an account.
 *
 * `url` carries the code, so the recipient never has to copy one; `code` is
 * sent as well because mail clients mangle links often enough that a code you
 * can read and type is the difference between an invitation and a dead end.
 */
export const inviteEmailSchema = emailRecipientSchema.extend({
  code: z.string(),
  url: z.string(),
  /** Who sent it, so the mail is not from a stranger. */
  invitedBy: z.string(),
  expiresAt: z.string()
})
export type InviteEmailType = z.infer<typeof inviteEmailSchema>

export const studyReminderSchema = emailRecipientSchema.extend({
  dueCount: z.number().int(),
  streak: z.number().int(),
  url: z.string()
})
export type StudyReminderType = z.infer<typeof studyReminderSchema>

/**
 * The weekly summary.
 *
 * Reports the week that happened rather than nagging about the one that did
 * not. `newItems` and `accuracy` are the two numbers that show whether the
 * time spent actually moved anything.
 */
export const weeklySummarySchema = emailRecipientSchema.extend({
  reviews: z.number().int(),
  minutes: z.number().int(),
  newItems: z.number().int(),
  accuracy: z.number().int(),
  streak: z.number().int(),
  /** Best single day, so the mail has something concrete in it. */
  bestDay: z.string().nullable(),
  url: z.string()
})
export type WeeklySummaryType = z.infer<typeof weeklySummarySchema>
