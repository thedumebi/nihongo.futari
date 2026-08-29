import type Mail from 'nodemailer/lib/mailer/index.js'
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js'

import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo'
import ejs from 'ejs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createTestAccount, createTransport, getTestMessageUrl } from 'nodemailer'

import env from '@/env.js'
import pino from '@/lib/pino.js'

// In dev against Ethereal, always provision a fresh throwaway test account
// (mirrors ofuma). Static Ethereal credentials expire, which makes sends fail
// and the preview URL disappear — a freshly-created account is always valid
// and getTestMessageUrl() can resolve the per-message preview link.
const isDevWithEthereal = env.NODE_ENV !== 'production' && env.EMAIL_HOST === 'smtp.ethereal.email'

if (isDevWithEthereal) {
  const testAccount = await createTestAccount()
  env.EMAIL_USER = testAccount.user
  env.EMAIL_PASSWORD = testAccount.pass
  pino.info({ user: testAccount.user }, '[MAIL] using auto-created Ethereal test account')
}

export const transporter = createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  auth: env.EMAIL_USER && env.EMAIL_PASSWORD
    ? { user: env.EMAIL_USER, pass: env.EMAIL_PASSWORD }
    : undefined,
  logger: env.EMAIL_LOGGER || env.NODE_ENV === 'development',
  ...(env.EMAIL_SECURE ? { secure: env.EMAIL_SECURE } : {})
})

export async function sendSMTPMail(message: Mail.Options) {
  const info = await transporter.sendMail(message)

  if (isDevWithEthereal) {
    pino.info('Message sent: %s', info.messageId)
    // Preview only available when sending through an Ethereal account
    pino.info('Preview URL: %s', getTestMessageUrl(info))
  }

  return info
}

// Production sends go through Brevo's transactional API; dev uses SMTP/Ethereal
// so nothing leaves the machine (mirrors ofuma).
export async function sendMail(message: Mail.Options) {
  if (env.NODE_ENV === 'production')
    return sendTransactionalEmail(message)
  return sendSMTPMail(message)
}

export async function renderTemplate(templateName: string, data: ejs.Data, language?: string): Promise<string> {
  data = Object.assign({
    currentYear: new Date().getFullYear(),
    siteName: env.EMAIL_FROM_NAME || '語 go',
    siteUrl: env.BETTER_AUTH_URL
  }, data)

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const templatesDir = path.join(__dirname, '..', 'views')
  const templatePath = `${templatesDir}/${templateName}${language ? `_${language}` : '_en-us'}.ejs`

  return ejs.renderFile(templatePath, data)
}

// ───────────────────────── Brevo (production) ─────────────────────────
export const emailAPI = new TransactionalEmailsApi()
if (env.BREVO_API_KEY)
  emailAPI.setApiKey(TransactionalEmailsApiApiKeys.apiKey, env.BREVO_API_KEY)

// Convert Nodemailer address formats to Brevo's { email, name } shape.
function parseEmailAddress(
  address: string | Mail.Address | Array<string | Mail.Address> | undefined
): Array<{ email: string, name?: string }> {
  if (!address)
    return []
  const addresses = Array.isArray(address) ? address : [address]
  return addresses.map((addr) => {
    if (typeof addr === 'string')
      return { email: addr.trim() }
    return { email: addr.address, ...(addr.name ? { name: addr.name } : {}) }
  })
}

// Send via Brevo, accepting the same Mail.Options shape as Nodemailer so call
// sites don't change. Returns a Nodemailer-compatible response.
export async function sendTransactionalEmail(message: Mail.Options): Promise<SMTPTransport.SentMessageInfo> {
  try {
    if (!env.BREVO_API_KEY)
      throw new Error('BREVO_API_KEY is required for sending emails in production')
    if (!env.EMAIL_FROM)
      throw new Error('EMAIL_FROM is required for sending emails')

    const sender = parseEmailAddress(message.from)[0] ?? {
      email: env.EMAIL_FROM,
      name: env.EMAIL_FROM_NAME || '語 go'
    }

    const to = parseEmailAddress(message.to)
    if (to.length === 0)
      throw new Error('At least one recipient email is required')

    const htmlContent = typeof message.html === 'string'
      ? message.html
      : message.html?.toString() || ''

    const result = await emailAPI.sendTransacEmail({
      sender,
      to,
      subject: message.subject || '',
      htmlContent,
      ...(message.bcc ? { bcc: parseEmailAddress(message.bcc) } : {}),
      ...(message.cc ? { cc: parseEmailAddress(message.cc) } : {}),
      ...(message.replyTo ? { replyTo: parseEmailAddress(message.replyTo)[0] } : {})
    })

    pino.info('Email sent via Brevo! Message ID: %s', result.body.messageId)

    return {
      accepted: to.map(r => r.email),
      rejected: [],
      pending: [],
      response: '200 OK',
      envelope: { from: sender.email, to: to.map(r => r.email) },
      messageId: result.body.messageId || ''
    } as SMTPTransport.SentMessageInfo
  } catch (error) {
    pino.error({ err: error }, 'Failed to send email via Brevo')
    throw error
  }
}
