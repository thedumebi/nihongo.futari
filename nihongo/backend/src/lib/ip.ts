// Pure IP helpers, free of request/db/geo imports so they can be unit-tested and
// shared between the visitor-hash fallback and the country lookup. Getting the
// client IP identical in both places is the point: they must agree on which
// address represents the visitor.

// The visitor's IP from the proxy headers, or null if none present.
//
// Caddy -> nginx -> backend, each appending to X-Forwarded-For, so the FIRST
// entry is the original client. X-Real-IP is the single-value fallback some
// setups send instead. Note: X-Forwarded-For is spoofable unless the edge is
// configured to trust only known proxies — fine for coarse analytics, not for
// anything security-sensitive.
export function clientIpFromHeaders(
  xForwardedFor?: string | null,
  xRealIp?: string | null
): string | null {
  const forwarded = xForwardedFor?.split(',')[0]?.trim()
  if (forwarded)
    return forwarded
  const real = xRealIp?.trim()
  return real || null
}

// Strip an IPv4-mapped IPv6 prefix (::ffff:1.2.3.4 -> 1.2.3.4) so the v4 checks
// below see the real address. Leaves everything else untouched.
function unmapV4(ip: string): string {
  const m = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip)
  return m ? m[1]! : ip
}

// Whether an address is worth a geo lookup: a syntactically-plausible, globally
// routable IP. Private, loopback, link-local, CGNAT and unique-local ranges are
// rejected — the geo DB has no country for them anyway, so this just skips the
// lookup (and keeps local dev's 127.0.0.1 out of it). Not RFC-exhaustive; it
// covers the ranges a real deployment actually sees.
export function isPublicIp(rawIp: string | null | undefined): boolean {
  if (!rawIp)
    return false
  const ip = unmapV4(rawIp.trim())

  if (ip.includes('.'))
    return isPublicV4(ip)
  if (ip.includes(':'))
    return isPublicV6(ip)
  return false
}

function isPublicV4(ip: string): boolean {
  const parts = ip.split('.')
  if (parts.length !== 4)
    return false
  const o = parts.map(Number)
  if (o.some(n => !Number.isInteger(n) || n < 0 || n > 255))
    return false
  const [a, b] = o as [number, number, number, number]

  if (a === 10)
    return false // 10.0.0.0/8 private
  if (a === 127)
    return false // 127.0.0.0/8 loopback
  if (a === 0)
    return false // 0.0.0.0/8
  if (a === 169 && b === 254)
    return false // 169.254.0.0/16 link-local
  if (a === 172 && b >= 16 && b <= 31)
    return false // 172.16.0.0/12 private
  if (a === 192 && b === 168)
    return false // 192.168.0.0/16 private
  if (a === 100 && b >= 64 && b <= 127)
    return false // 100.64.0.0/10 CGNAT
  if (a >= 224)
    return false // 224.0.0.0/4 multicast + 240.0.0.0/4 reserved
  return true
}

function isPublicV6(ip: string): boolean {
  const lower = ip.toLowerCase()
  if (lower === '::1' || lower === '::')
    return false // loopback / unspecified
  if (lower.startsWith('fe80'))
    return false // link-local
  if (lower.startsWith('fc') || lower.startsWith('fd'))
    return false // fc00::/7 unique-local
  return lower.includes(':')
}
