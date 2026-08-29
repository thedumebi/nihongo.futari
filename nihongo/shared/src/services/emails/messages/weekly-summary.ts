import { MAIL_TYPES } from '@/constants/mail-types.js'
import { renderTemplate } from '@/helpers/emails.js'

import Message from './index.js'

export default class WeeklySummaryMessage extends Message {
  protected getSubject(): string {
    const reviews = Number((this.data as { reviews?: number }).reviews ?? 0)
    // The count goes in the subject because a summary with nothing in it is
    // the one people unsubscribe from — better they can see that at a glance.
    return reviews === 0
      ? 'A quiet week'
      : `${reviews} reviews this week`
  }

  protected async getTemplate(): Promise<string> {
    return renderTemplate(MAIL_TYPES.WEEKLY_SUMMARY, this.data, this.language)
  }
}
