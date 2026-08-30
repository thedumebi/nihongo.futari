import { MAIL_TYPES } from '@/constants/mail-types.js'
import { renderTemplate } from '@/helpers/emails.js'

import Message from './index.js'

export default class InviteMessage extends Message {
  protected getSubject(): string {
    const from = String((this.data as { invitedBy?: string }).invitedBy ?? '').trim()
    // Named when we know who sent it: an invitation from a person is opened,
    // and one from a product is filed with the newsletters.
    return from
      ? `${from} invited you to ${this.getFromName()}`
      : `You're invited to ${this.getFromName()}`
  }

  protected async getTemplate(): Promise<string> {
    return renderTemplate(MAIL_TYPES.INVITE, this.data, this.language)
  }
}
