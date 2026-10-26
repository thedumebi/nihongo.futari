import { describe, expect, it, vi } from 'vitest'

import { verifyTurnstile } from './turnstile.js'

function answering(payload: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(payload), { status })) as unknown as typeof fetch
}

describe('verifyTurnstile', () => {
  it('accepts a token Cloudflare vouches for', async () => {
    const fetchImpl = answering({ success: true, hostname: 'nihongo.futari.live' })
    await expect(verifyTurnstile('tok', { secret: 's', fetchImpl })).resolves.toBe(true)
  })

  it('sends the secret, the token and the caller IP as a form', async () => {
    const fetchImpl = answering({ success: true })
    await verifyTurnstile('tok', { secret: 's3cret', remoteIp: '203.0.113.7', fetchImpl })

    const [url, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0]!
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify')
    const body = init.body as URLSearchParams
    expect(Object.fromEntries(body)).toEqual({ secret: 's3cret', response: 'tok', remoteip: '203.0.113.7' })
  })

  it('refuses a token Cloudflare rejects', async () => {
    const fetchImpl = answering({ 'success': false, 'error-codes': ['invalid-input-response'] })
    await expect(verifyTurnstile('tok', { secret: 's', fetchImpl })).resolves.toBe(false)
  })

  it('refuses a token issued on a hostname that is not ours', async () => {
    const fetchImpl = answering({ success: true, hostname: 'evil.example' })
    await expect(verifyTurnstile('tok', { secret: 's', hostnames: ['nihongo.futari.live'], fetchImpl })).resolves.toBe(false)
  })

  it('accepts a listed hostname', async () => {
    const fetchImpl = answering({ success: true, hostname: 'nihongo.futari.live' })
    await expect(verifyTurnstile('tok', { secret: 's', hostnames: ['nihongo.futari.live'], fetchImpl })).resolves.toBe(true)
  })

  it('refuses an empty token without asking Cloudflare', async () => {
    const fetchImpl = answering({ success: true })
    await expect(verifyTurnstile('', { secret: 's', fetchImpl })).resolves.toBe(false)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('fails closed when Cloudflare cannot be reached', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('network down')
    }) as unknown as typeof fetch
    await expect(verifyTurnstile('tok', { secret: 's', fetchImpl })).resolves.toBe(false)
  })

  it('fails closed on an error status', async () => {
    const fetchImpl = answering({ success: true }, 500)
    await expect(verifyTurnstile('tok', { secret: 's', fetchImpl })).resolves.toBe(false)
  })
})
