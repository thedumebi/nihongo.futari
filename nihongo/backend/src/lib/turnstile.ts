/**
 * Cloudflare Turnstile, checked on the server.
 *
 * The widget in the browser only produces a token; nothing is proven until the
 * secret key trades that token with Cloudflare. A token is good once, for a
 * few minutes, and for the hostnames the widget was made for.
 */

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/** Cloudflare answers within milliseconds; a hang must not hold a sign-up open. */
const VERIFY_TIMEOUT_MS = 10_000

interface VerifyOptions {
  secret: string
  /** The caller's IP, passed on so Cloudflare can weigh it. */
  remoteIp?: string
  /**
   * Hostnames the token must have been issued on. Empty accepts any, which is
   * what Cloudflare's test keys need: they report `example.com`.
   */
  hostnames?: readonly string[]
  fetchImpl?: typeof fetch
}

/**
 * Whether Cloudflare vouches for this token.
 *
 * Fails closed: a network error, a timeout or an answer we cannot read is a
 * no, because the alternative lets a script through whenever Cloudflare is
 * slow.
 */
export async function verifyTurnstile(token: string, options: VerifyOptions): Promise<boolean> {
  if (!token)
    return false

  const body = new URLSearchParams({ secret: options.secret, response: token })
  if (options.remoteIp)
    body.set('remoteip', options.remoteIp)

  try {
    const res = await (options.fetchImpl ?? fetch)(SITEVERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS)
    })
    if (!res.ok)
      return false

    const result = await res.json() as { success?: unknown, hostname?: unknown }
    if (result.success !== true)
      return false

    const hostnames = options.hostnames ?? []
    return hostnames.length === 0 || (typeof result.hostname === 'string' && hostnames.includes(result.hostname))
  } catch {
    return false
  }
}
