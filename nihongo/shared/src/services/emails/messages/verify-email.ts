import { MAIL_TYPES } from '@/constants/mail-types.js'
import { renderTemplate } from '@/helpers/emails.js'

import Message from './index.js'

export default class VerifyEmailMessage extends Message {
  protected getSubject(): string {
    return `Confirm your email for ${this.getFromName()}`
  }

  protected async getTemplate(): Promise<string> {
    return renderTemplate(MAIL_TYPES.VERIFY_EMAIL, this.data, this.language)
  }
}
