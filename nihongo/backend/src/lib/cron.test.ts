import { describe, expect, it } from 'vitest'

import { isCronAuthorized } from './cron.js'

describe('isCronAuthorized', () => {
  it('accepts the configured secret', () => {
    expect(isCronAuthorized('s3cret-value', 's3cret-value')).toBe(true)
  })

  it('refuses a wrong secret of the same length', () => {
    expect(isCronAuthorized('s3cret-value', 's3cret-valuX')).toBe(false)
  })

  it('refuses a secret of a different length', () => {
    expect(isCronAuthorized('s3cret-value', 's3cret')).toBe(false)
  })

  it('refuses a request with no secret', () => {
    expect(isCronAuthorized('s3cret-value', undefined)).toBe(false)
    expect(isCronAuthorized('s3cret-value', '')).toBe(false)
  })

  it('refuses everything when no secret is configured', () => {
    expect(isCronAuthorized(undefined, 'anything')).toBe(false)
    expect(isCronAuthorized('', '')).toBe(false)
  })
})
