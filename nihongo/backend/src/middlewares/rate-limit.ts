import type { Context, MiddlewareHandler } from 'hono'

import { getConnInfo } from '@hono/node-server/conninfo'
import { HttpStatusCodes } from '@nihongo/shared/constants'
import env from '@nihongo/shared/env'
import { RateLimiterMemory, RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible'

import type { AppBindings } from '@/lib/types.js'

import redis from '@/lib/redis.js'

interface RateLimitOptions {
  /** Max requests allowed in the window */
  points: number
  /** Window duration in seconds */
  duration: number
  /** Seconds to block after limit exceeded (0 = no block, just reject) */
  blockDuration?: number
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  points: 100,
  duration: 60,
  blockDuration: 60
}

// Cache limiter instances per config so we don't re-create one per request.
const limiterCache = new Map<string, RateLimiterRedis | RateLimiterMemory>()

function getLimiter(opts: RateLimitOptions): RateLimiterRedis | RateLimiterMemory {
  const key = `${opts.points}:${opts.duration}:${opts.blockDuration ?? 60}`

  const cached = limiterCache.get(key)
  if (cached)
    return cached

  // In-memory insurance limiter keeps limiting working if Redis is unreachable.
  const memoryFallback = new RateLimiterMemory({
    points: opts.points,
    duration: opts.duration,
    blockDuration: opts.blockDuration ?? 60
  })

  const limiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'nihongo-rl',
    points: opts.points,
    duration: opts.duration,
    blockDuration: opts.blockDuration ?? 0,
    insuranceLimiter: memoryFallback
  })

  limiterCache.set(key, limiter)
  return limiter
}

// ---------------------------------------------------------------------------
// IP / CIDR utilities
// ---------------------------------------------------------------------------

/** Parses an IPv4 string into a 32-bit unsigned int, or null if invalid. */
function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.')
  if (parts.length !== 4)
    return null

  let result = 0
  for (const part of parts) {
    if (!/^\d+$/.test(part))
      return null
    const n = Number(part)
    if (n < 0 || n > 255)
      return null
    // Multiplication avoids the sign issues of `<< 24` under JS 32-bit bitwise ops.
    result = result * 256 + n
  }
  return result >>> 0
}

/** Parses an IPv6 string into an 8-element Uint16 array (supports `::`). */
function ipv6ToParts(ip: string): Uint16Array | null {
  const cleanIp = ip.split('%')[0] ?? ip
  if (cleanIp.includes('.'))
    return null

  const doubleColonCount = (cleanIp.match(/::/g) ?? []).length
  if (doubleColonCount > 1)
    return null

  let head: string[] = []
  let tail: string[] = []
  if (doubleColonCount === 1) {
    const [h, t] = cleanIp.split('::')
    head = h ? h.split(':') : []
    tail = t ? t.split(':') : []
  } else {
    head = cleanIp.split(':')
  }

  const totalGroups = head.length + tail.length
  if (totalGroups > 8)
    return null
  if (doubleColonCount === 0 && totalGroups !== 8)
    return null

  const groups = [
    ...head,
    ...Array.from({ length: 8 - totalGroups }, () => '0'),
    ...tail
  ]

  const parts = new Uint16Array(8)
  for (let i = 0; i < 8; i++) {
    const g = groups[i]!
    if (!/^[0-9a-f]{1,4}$/i.test(g))
      return null
    parts[i] = Number.parseInt(g, 16)
  }
  return parts
}

/** True if `ip` falls inside the CIDR range `cidr` (IPv4 or IPv6). */
export function ipInCidr(ip: string, cidr: string): boolean {
  const slashIdx = cidr.indexOf('/')
  if (slashIdx === -1)
    return false

  const range = cidr.slice(0, slashIdx)
  const prefixStr = cidr.slice(slashIdx + 1)
  if (!/^\d+$/.test(prefixStr))
    return false
  const prefix = Number(prefixStr)

  // IPv4
  const ipInt = ipv4ToInt(ip)
  const rangeInt = ipv4ToInt(range)
  if (ipInt !== null && rangeInt !== null) {
    if (prefix < 0 || prefix > 32)
      return false
    if (prefix === 0)
      return true
    const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0
    return (ipInt & mask) === (rangeInt & mask)
  }

  // IPv6
  const ipParts = ipv6ToParts(ip)
  const rangeParts = ipv6ToParts(range)
  if (ipParts && rangeParts) {
    if (prefix < 0 || prefix > 128)
      return false
    let bitsLeft = prefix
    for (let i = 0; i < 8; i++) {
      if (bitsLeft <= 0)
        return true
      if (bitsLeft >= 16) {
        if (ipParts[i] !== rangeParts[i])
          return false
        bitsLeft -= 16
      } else {
        const mask = (0xFFFF << (16 - bitsLeft)) & 0xFFFF
        return (ipParts[i]! & mask) === (rangeParts[i]! & mask)
      }
    }
    return true
  }

  return false
}

function isTrustedProxy(ip: string, trustedCidrs: readonly string[]): boolean {
  for (const cidr of trustedCidrs) {
    if (!cidr)
      continue
    if (ipInCidr(ip, cidr))
      return true
  }
  return false
}

/**
 * Resolves the client IP for rate limiting.
 *
 * 1. Socket peer IP (unforgeable).
 * 2. If the peer is inside TRUSTED_PROXY_CIDRS, trust the first hop of
 *    X-Forwarded-For (the proxy is responsible for sanitising it).
 * 3. Otherwise return the peer IP — never trust XFF from an untrusted source.
 */
export function getClientIp(c: Context<AppBindings>): string {
  const trustedCidrs: readonly string[] = env?.TRUSTED_PROXY_CIDRS ?? []

  let peerIp: string | undefined
  try {
    const info = getConnInfo(c)
    peerIp = info?.remote?.address
  } catch {
    peerIp = undefined
  }

  if (peerIp && trustedCidrs.length > 0 && isTrustedProxy(peerIp, trustedCidrs)) {
    const xff = c.req.header('x-forwarded-for')
    const firstHop = xff?.split(',')[0]?.trim()
    if (firstHop)
      return firstHop
  }

  if (peerIp)
    return peerIp

  return 'peer-unknown'
}

/**
 * Rate limiting middleware factory. Buckets per authenticated user, falling
 * back to client IP. Redis-backed with an in-memory insurance limiter.
 *
 * @example
 * router.use('*', standardLimiter)
 * router.post(PATH, rateLimiter({ points: 10, duration: 60 }), handler)
 */
export function rateLimiter(options?: Partial<RateLimitOptions>): MiddlewareHandler {
  const opts: RateLimitOptions = { ...DEFAULT_OPTIONS, ...options }

  return async (c: Context<AppBindings>, next) => {
    const limiter = getLimiter(opts)

    const userId = c.var?.user?.id
    const identity = userId || getClientIp(c)
    const key = `${identity}:${c.req.path}`

    try {
      const res = await limiter.consume(key)
      c.header('X-RateLimit-Limit', String(opts.points))
      c.header('X-RateLimit-Remaining', String(res.remainingPoints))
      c.header('X-RateLimit-Reset', String(Math.ceil(res.msBeforeNext / 1000)))
      await next()
    } catch (rateLimiterRes: any) {
      if (rateLimiterRes instanceof RateLimiterRes) {
        c.header('Retry-After', String(Math.ceil(rateLimiterRes.msBeforeNext / 1000)))
        c.header('X-RateLimit-Limit', String(opts.points))
        c.header('X-RateLimit-Remaining', String(rateLimiterRes.remainingPoints))
      }
      return c.json({
        message: 'Too many requests',
        error: { status: 429, type: 'rate_limit_error', code: 'rate_limit_exceeded' }
      }, HttpStatusCodes.TOO_MANY_REQUESTS)
    }
  }
}

// ---------------------------------------------------------------------------
// Named presets — import and use directly
// ---------------------------------------------------------------------------

/** Strict: 10 req/min — auth, login, password reset */
export const strictLimiter = rateLimiter({ points: 10, duration: 60 })

/** Write: 30 req/min — create, update, delete operations */
export const writeLimiter = rateLimiter({ points: 30, duration: 60 })

/** Standard: 100 req/min — general authenticated endpoints */
export const standardLimiter = rateLimiter({ points: 100, duration: 60 })

/** Relaxed: 300 req/min — read-heavy endpoints (lists, searches) */
export const relaxedLimiter = rateLimiter({ points: 300, duration: 60 })

/** Contact form: 3 req/min, block 60s — anti-spam */
export const contactLimiter = rateLimiter({ points: 3, duration: 60, blockDuration: 60 })
