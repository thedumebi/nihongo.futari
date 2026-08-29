import { describe, expect, it } from 'vitest'

import { clientIpFromHeaders, isPublicIp } from './ip.js'

describe('clientIpFromHeaders', () => {
  it('takes the first X-Forwarded-For entry (the original client)', () => {
    expect(clientIpFromHeaders('203.0.113.7, 10.0.0.1, 172.16.0.1')).toBe('203.0.113.7')
  })

  it('trims whitespace', () => {
    expect(clientIpFromHeaders('  203.0.113.7  , 10.0.0.1')).toBe('203.0.113.7')
  })

  it('falls back to X-Real-IP when no forwarded header', () => {
    expect(clientIpFromHeaders(undefined, '198.51.100.9')).toBe('198.51.100.9')
    expect(clientIpFromHeaders('', '198.51.100.9')).toBe('198.51.100.9')
  })

  it('returns null when neither header is present', () => {
    expect(clientIpFromHeaders()).toBeNull()
    expect(clientIpFromHeaders('', '')).toBeNull()
  })
})

describe('isPublicIp', () => {
  it('accepts routable public IPv4', () => {
    for (const ip of ['203.0.113.7', '8.8.8.8', '1.1.1.1', '102.89.34.7'])
      expect(isPublicIp(ip), ip).toBe(true)
  })

  it('rejects private, loopback, link-local and CGNAT IPv4', () => {
    for (const ip of [
      '10.0.0.1',
      '10.255.255.255', // 10/8
      '172.16.0.1',
      '172.31.255.255', // 172.16/12
      '192.168.1.1', // 192.168/16
      '127.0.0.1', // loopback
      '169.254.10.1', // link-local
      '100.64.0.1', // CGNAT
      '0.0.0.0', // this-network
      '224.0.0.1',
      '255.255.255.255' // multicast / reserved
    ])
      expect(isPublicIp(ip), ip).toBe(false)
  })

  it('does not reject 172.x outside the private 16-31 band', () => {
    expect(isPublicIp('172.15.0.1')).toBe(true)
    expect(isPublicIp('172.32.0.1')).toBe(true)
  })

  it('accepts public IPv6 and unwraps IPv4-mapped addresses', () => {
    expect(isPublicIp('2001:4860:4860::8888')).toBe(true)
    expect(isPublicIp('::ffff:8.8.8.8')).toBe(true) // maps to public v4
    expect(isPublicIp('::ffff:192.168.1.1')).toBe(false) // maps to private v4
  })

  it('rejects loopback, link-local and unique-local IPv6', () => {
    for (const ip of ['::1', '::', 'fe80::1', 'fc00::1', 'fd12:3456::1'])
      expect(isPublicIp(ip), ip).toBe(false)
  })

  it('rejects empty, malformed and out-of-range input', () => {
    for (const ip of [null, undefined, '', '   ', 'not-an-ip', '999.1.1.1', '1.2.3', '1.2.3.4.5'])
      expect(isPublicIp(ip as string), String(ip)).toBe(false)
  })
})
