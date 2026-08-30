import { MAIL_TYPES } from '@/constants/mail-types.js'
import { renderTemplate } from '@/helpers/emails.js'

import Message from './index.js'

export default class StudyReminderMessage extends Message {
  protected getSubject(): string {
    const due = Number((this.data as { dueCount?: number }).dueCount ?? 0)
    // "0 cards ready" is worse than no subject at all. A reminder still goes
    // out when nothing is due — Study serves new material — so the line has to
    // work for a cleared queue as well as a full one.
    return due > 0
      ? `${due} ${due === 1 ? 'card' : 'cards'} ready on ${this.getFromName()}`
      : `Time to study on ${this.getFromName()}`
  }

  protected async getTemplate(): Promise<string> {
    return renderTemplate(MAIL_TYPES.STUDY_REMINDER, this.data, this.language)
  }
}
