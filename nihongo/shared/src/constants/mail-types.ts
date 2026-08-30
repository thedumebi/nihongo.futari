// Template base names (resolved by renderTemplate to `<type>_<lang>.ejs`).
export const MAIL_TYPES = {
  VERIFY_OTP: 'verify-otp',
  SIGNIN_OTP: 'signin-otp',
  RESET_PASSWORD: 'reset-password',
  STUDY_REMINDER: 'study-reminder',
  VERIFY_EMAIL: 'verify-email',
  WEEKLY_SUMMARY: 'weekly-summary',
  INVITE: 'invite'
} as const

export type MailType = typeof MAIL_TYPES[keyof typeof MAIL_TYPES]
