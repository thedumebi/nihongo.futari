import { MAIL_TYPES } from '@/constants/mail-types.js'
import { renderTemplate } from '@/helpers/emails.js'

import Message from './index.js'

export default class StudyReminderMessage extends Message {
  protected getSubject(): string {
    const due = Number((this.data as { dueCount?: number }).dueCount ?? 0)
    return `${due} ${due === 1 ? 'card' : 'cards'} ready on ${this.getFromName()}`
  }

  protected async getTemplate(): Promise<string> {
    return renderTemplate(MAIL_TYPES.STUDY_REMINDER, this.data, this.language)
  }
}
