import { MAIL_TYPES } from '@/constants/mail-types.js'
import { renderTemplate } from '@/helpers/emails.js'

import Message from './index.js'

export default class ResetPasswordMessage extends Message {
  protected getSubject(): string {
    return `Reset your ${this.getFromName()} password`
  }

  protected async getTemplate(): Promise<string> {
    return renderTemplate(MAIL_TYPES.RESET_PASSWORD, this.data, this.language)
  }
}
