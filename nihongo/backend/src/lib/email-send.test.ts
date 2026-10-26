import { describe, expect, it } from 'vitest'

import { isEmailSendingPath, recipientFromBody } from './email-send.js'

describe('isEmailSendingPath', () => {
  it('recognises the endpoints that send a code or a link', () => {
    for (const path of [
      '/api/auth/email-otp/send-verification-otp',
      '/api/auth/sign-up/email',
      '/api/auth/forget-password/email-otp',
      '/api/auth/request-password-reset'
    ])
      expect(isEmailSendingPath(path), path).toBe(true)
  })

  it('ignores a trailing slash', () => {
    expect(isEmailSendingPath('/api/auth/sign-up/email/')).toBe(true)
  })

  it('leaves endpoints that send nothing alone', () => {
    for (const path of [
      '/api/auth/sign-in/email',
      '/api/auth/sign-in/email-otp',
      '/api/auth/get-session',
      '/api/auth/email-otp/verify-email'
    ])
      expect(isEmailSendingPath(path), path).toBe(false)
  })

  it('only matches under the better-auth base', () => {
    expect(isEmailSendingPath('/sign-up/email')).toBe(false)
    expect(isEmailSendingPath('/api/authx/sign-up/email')).toBe(false)
  })
})

describe('recipientFromBody', () => {
  it('reads and normalises `email`', () => {
    expect(recipientFromBody({ email: '  Ada@Example.COM ', type: 'sign-in' })).toBe('ada@example.com')
  })

  it('prefers `newEmail`, the address an email change actually mails', () => {
    expect(recipientFromBody({ email: 'old@example.com', newEmail: 'New@example.com' })).toBe('new@example.com')
  })

  it('returns null for a body with no usable address', () => {
    expect(recipientFromBody(null)).toBeNull()
    expect(recipientFromBody('ada@example.com')).toBeNull()
    expect(recipientFromBody({ email: 42 })).toBeNull()
    expect(recipientFromBody({ email: 'not-an-address' })).toBeNull()
  })
})
