import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js'

import type {
  ResetPasswordEmailType,
  SignInOtpType,
  StudyReminderType,
  VerifyEmailType,
  VerifyOtpType,
  WeeklySummaryType
} from '@/types/emails.js'

import { sendMail } from '@/helpers/emails.js'

import ResetPasswordMessage from './messages/reset-password.js'
import SignInOtpMessage from './messages/signin-otp.js'
import StudyReminderMessage from './messages/study-reminder.js'
import VerifyEmailMessage from './messages/verify-email.js'
import VerifyOtpMessage from './messages/verify-otp.js'
import WeeklySummaryMessage from './messages/weekly-summary.js'

export { renderTemplate } from '@/helpers/emails.js'

export type {
  ResetPasswordEmailType,
  SignInOtpType,
  StudyReminderType,
  VerifyEmailType,
  VerifyOtpType,
  WeeklySummaryType
} from '@/types/emails.js'

export default class SendMail {
  static async sendVerifyOtp(data: VerifyOtpType, language?: string): Promise<SMTPTransport.SentMessageInfo> {
    const inst = new VerifyOtpMessage(data, { email: data.email, name: data.name }, language)
    return sendMail(await inst.buildMessage())
  }

  static async sendSignInOtp(data: SignInOtpType, language?: string): Promise<SMTPTransport.SentMessageInfo> {
    const inst = new SignInOtpMessage(data, { email: data.email, name: data.name }, language)
    return sendMail(await inst.buildMessage())
  }

  static async sendResetPassword(data: ResetPasswordEmailType, language?: string): Promise<SMTPTransport.SentMessageInfo> {
    const inst = new ResetPasswordMessage(data, { email: data.email, name: data.name }, language)
    return sendMail(await inst.buildMessage())
  }

  static async sendVerifyEmail(data: VerifyEmailType, language?: string): Promise<SMTPTransport.SentMessageInfo> {
    const inst = new VerifyEmailMessage(data, { email: data.email, name: data.name }, language)
    return sendMail(await inst.buildMessage())
  }

  static async sendStudyReminder(data: StudyReminderType, language?: string): Promise<SMTPTransport.SentMessageInfo> {
    const inst = new StudyReminderMessage(data, { email: data.email, name: data.name }, language)
    return sendMail(await inst.buildMessage())
  }

  static async sendWeeklySummary(data: WeeklySummaryType, language?: string): Promise<SMTPTransport.SentMessageInfo> {
    const inst = new WeeklySummaryMessage(data, { email: data.email, name: data.name }, language)
    return sendMail(await inst.buildMessage())
  }
}
