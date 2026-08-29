import { MAIL_TYPES } from '@/constants/mail-types.js'
import { renderTemplate } from '@/helpers/emails.js'

import Message from './index.js'

export default class SignInOtpMessage extends Message {
  protected getSubject(): string {
    return `Your ${this.getFromName()} sign-in code`
  }

  protected async getTemplate(): Promise<string> {
    return renderTemplate(MAIL_TYPES.SIGNIN_OTP, this.data, this.language)
  }
}
