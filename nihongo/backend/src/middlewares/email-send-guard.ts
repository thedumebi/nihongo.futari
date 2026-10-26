import type { Context, MiddlewareHandler } from 'hono'

import { pino } from '@nihongo/shared'
import { HttpStatusCodes } from '@nihongo/shared/constants'
import env from '@nihongo/shared/env'
import { RateLimiterRes } from 'rate-limiter-flexible'

import type { AppBindings } from '@/lib/types.js'

import { auth } from '@/lib/auth.js'
import { isEmailSendingPath, recipientFromBody } from '@/lib/email-send.js'
import { verifyTurnstile } from '@/lib/turnstile.js'

import { getClientIp, getLimiter } from './rate-limit.js'

/**
 * Codes and links to one address in an hour. Enough for a sign-up, a resend
 * and a mistyped code or two; far too few to flood somebody's inbox.
 */
const PER_ADDRESS = { points: 5, duration: 60 * 60, blockDuration: 0 }

/**
 * Emails one caller (a signed-in account, else an IP) can trigger in an hour,
 * across every address. Stops one script walking a list of strangers.
 */
const PER_CALLER = { points: 10, duration: 60 * 60, blockDuration: 0 }

/** Where a production token must have been issued. */
const TURNSTILE_HOSTNAMES = env.NODE_ENV === 'production' ? [new URL(env.FRONTEND_URL).hostname] : []

// Turnstile switches itself off without a secret, which is right for local
// work and wrong for a live site: say so loudly at boot rather than find out
// from the Brevo bill.
if (env.NODE_ENV === 'production' && !env.TURNSTILE_SECRET_KEY)
  pino.warn('[AUTH] TURNSTILE_SECRET_KEY is not set: email-sending endpoints have no bot check, only the rate caps')

function refuse(c: Context<AppBindings>, status: 400 | 429, code: string, message: string) {
  return c.json({ code, message }, status)
}

/**
 * The guard in front of every better-auth endpoint that sends an email.
 *
 * In order: Turnstile for anyone not signed in (when a secret is configured),
 * then a cap per caller, then a cap per address. Better-auth itself only
 * withholds a code from an address that cannot use it; this is what stops the
 * endpoint being used to mail strangers, burn the Brevo quota and wreck the
 * sending reputation real codes depend on.
 *
 * A signed-in reader skips Turnstile: setting a password from Settings is
 * already behind a session, and the caps still apply.
 */
export const emailSendGuard: MiddlewareHandler<AppBindings> = async (c, next) => {
  if (c.req.method !== 'POST' || !isEmailSendingPath(c.req.path))
    return next()

  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  const ip = getClientIp(c)

  if (!session && env.TURNSTILE_SECRET_KEY) {
    const passed = await verifyTurnstile(c.req.header('x-captcha-response') ?? '', {
      secret: env.TURNSTILE_SECRET_KEY,
      remoteIp: ip,
      hostnames: TURNSTILE_HOSTNAMES
    })
    if (!passed)
      return refuse(c, HttpStatusCodes.BAD_REQUEST, 'CAPTCHA_FAILED', 'Please complete the check above and try again.')
  }

  // Read from a copy: better-auth reads the original body after this.
  const body: unknown = await c.req.raw.clone().json().catch(() => null)
  const recipient = recipientFromBody(body)

  try {
    await getLimiter(PER_CALLER).consume(`email-send:caller:${session?.user.id ?? ip}`)
    if (recipient)
      await getLimiter(PER_ADDRESS).consume(`email-send:to:${recipient}`)
  } catch (res) {
    if (!(res instanceof RateLimiterRes))
      throw res
    const minutes = Math.max(1, Math.ceil(res.msBeforeNext / 60_000))
    c.header('Retry-After', String(Math.ceil(res.msBeforeNext / 1000)))
    return refuse(
      c,
      HttpStatusCodes.TOO_MANY_REQUESTS,
      'TOO_MANY_EMAILS',
      `Too many emails asked for. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`
    )
  }

  return next()
}
