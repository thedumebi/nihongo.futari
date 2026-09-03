import { MAIL_TYPES } from '@/constants/mail-types.js'
import { renderTemplate } from '@/helpers/emails.js'

import Message from './index.js'

/**
 * The code that sets or changes a password.
 *
 * Distinct from `VerifyOtpMessage`, which every non-sign-in code used to fall
 * through to. Asking to set a password and being told to "verify your email and
 * activate your account" is the wrong sentence twice over: the account is
 * already active, and nothing about the email is being verified.
 *
 * Distinct from `ResetPasswordMessage` too — that one carries a link, and this
 * flow is a six-digit code typed back into the settings page.
 */
export default class PasswordOtpMessage extends Message {
  protected getSubject(): string {
    return `Your ${this.getFromName()} password code`
  }

  protected async getTemplate(): Promise<string> {
    return renderTemplate(MAIL_TYPES.PASSWORD_OTP, this.data, this.language)
  }
}
