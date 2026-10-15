import { describe, expect, it } from 'vitest'

import { unsubscribeToken, verifyUnsubscribeToken } from './unsubscribe-token.js'

const SECRET = 'a-test-secret-that-is-long-enough-123456'

describe('unsubscribe tokens', () => {
  it('accepts the token made for that user', () => {
    expect(verifyUnsubscribeToken('user-1', unsubscribeToken('user-1', SECRET), SECRET)).toBe(true)
  })

  it('rejects another user\'s token, a forged one, and one made with another secret', () => {
    expect(verifyUnsubscribeToken('user-2', unsubscribeToken('user-1', SECRET), SECRET)).toBe(false)
    expect(verifyUnsubscribeToken('user-1', 'forged', SECRET)).toBe(false)
    expect(verifyUnsubscribeToken('user-1', unsubscribeToken('user-1', 'another-secret-entirely-xxxxxxxxxx'), SECRET)).toBe(false)
  })
})
