import { MAIL_TYPES } from '@/constants/mail-types.js'
import { renderTemplate } from '@/helpers/emails.js'

import Message from './index.js'

/**
 * A short nudge beside the daily reminder — the streak at risk, cards that
 * keep slipping. One template for both: a heading, a line, one button.
 */
export default class NudgeMessage extends Message {
  protected getSubject(): string {
    return String((this.data as { title?: string }).title ?? this.getFromName())
  }

  protected async getTemplate(): Promise<string> {
    return renderTemplate(MAIL_TYPES.NUDGE, this.data, this.language)
  }
}
