import { AUTH_EMAIL_SENDING_PATHS, AUTH_ROUTES } from '@nihongo/shared/constants'

/**
 * Which better-auth request would make the app send an email.
 *
 * `pathname` is the full request path, base included; better-auth's own
 * endpoints are named relative to that base.
 */
export function isEmailSendingPath(pathname: string): boolean {
  if (!pathname.startsWith(`${AUTH_ROUTES.HANDLER}/`))
    return false
  const endpoint = pathname.slice(AUTH_ROUTES.HANDLER.length).replace(/\/+$/, '')
  return (AUTH_EMAIL_SENDING_PATHS as readonly string[]).includes(endpoint)
}

/**
 * The address a request would send mail to, normalised, or null.
 *
 * An email change mails the NEW address, which arrives as `newEmail`; every
 * other endpoint calls it `email`.
 */
export function recipientFromBody(body: unknown): string | null {
  if (!body || typeof body !== 'object')
    return null
  const { email, newEmail } = body as { email?: unknown, newEmail?: unknown }
  const raw = typeof newEmail === 'string' ? newEmail : email
  if (typeof raw !== 'string')
    return null
  const address = raw.trim().toLowerCase()
  return address.includes('@') ? address : null
}
