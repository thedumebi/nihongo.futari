import type ejs from 'ejs'
import type Mail from 'nodemailer/lib/mailer/index.js'

import type { EmailRecipient, EmailRecipientSchema } from '@/types/emails.js'

import * as HttpStatusCodes from '@/constants/http-status-codes.js'
import env from '@/env.js'
import { ApiError } from '@/lib/api-errors.js'

export default class Message {
  constructor(public data: ejs.Data, public recipient: EmailRecipient | EmailRecipient[], public language?: string) {}

  protected getFromEmail() {
    return env.EMAIL_FROM
  }

  protected getFromName() {
    return env.EMAIL_FROM_NAME
  }

  protected getSubject(): string {
    throw new ApiError('getSubject method not implemented', HttpStatusCodes.INTERNAL_SERVER_ERROR, 'abstract_method')
  }

  protected getRecipients(): EmailRecipientSchema {
    if (Array.isArray(this.recipient)) {
      return { to: this.recipient.map(r => ({ address: r.email, name: r.name })) }
    }
    return { to: { address: this.recipient.email, name: this.recipient.name } }
  }

  protected async getTemplate(): Promise<string> {
    throw new ApiError('getTemplate method not implemented', HttpStatusCodes.INTERNAL_SERVER_ERROR, 'abstract_method')
  }

  async buildMessage(): Promise<Mail.Options> {
    const template = await this.getTemplate()
    const recipients = this.getRecipients()

    return {
      from: { name: this.getFromName(), address: this.getFromEmail() },
      html: template,
      subject: this.getSubject(),
      ...recipients
    }
  }
}
