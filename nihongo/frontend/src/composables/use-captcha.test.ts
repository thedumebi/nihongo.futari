import { describe, expect, it, vi } from 'vitest'

import { CAPTCHA_HEADER, useCaptcha } from './use-captcha'

describe('useCaptcha', () => {
  it('is ready at once when the server does not check', () => {
    const captcha = useCaptcha()
    expect(captcha.ready.value).toBe(true)
    expect(captcha.fetchOptions()).toEqual({})
  })

  it('waits for a token when a site key is set', () => {
    const captcha = useCaptcha()
    captcha.siteKey.value = 'site-key'
    expect(captcha.ready.value).toBe(false)

    captcha.token.value = 'tok'
    expect(captcha.ready.value).toBe(true)
  })

  it('carries the token in the header the server reads', () => {
    const captcha = useCaptcha()
    captcha.siteKey.value = 'site-key'
    captcha.token.value = 'tok'
    expect(captcha.fetchOptions()).toEqual({ headers: { [CAPTCHA_HEADER]: 'tok' } })
    expect(CAPTCHA_HEADER).toBe('x-captcha-response')
  })

  it('drops a spent token and asks the widget for another', () => {
    const captcha = useCaptcha()
    const reset = vi.fn()
    captcha.widget.value = { reset }
    captcha.siteKey.value = 'site-key'
    captcha.token.value = 'tok'

    captcha.spent()

    expect(captcha.token.value).toBeNull()
    expect(captcha.ready.value).toBe(false)
    expect(reset).toHaveBeenCalledOnce()
  })
})
