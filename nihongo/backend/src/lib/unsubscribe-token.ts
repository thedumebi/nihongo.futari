import { Buffer } from 'node:buffer'
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * The token in a product-update email's unsubscribe link.
 *
 * Unsubscribing must work from the email with no sign-in — that is the law in
 * most places and what mail providers check for — but nobody should be able
 * to unsubscribe someone else by guessing a link. So the link carries the
 * user's id and an HMAC of it under the server secret: only the server can
 * make one, and it never expires (an old email's link should still work).
 */
const PURPOSE = 'product-updates'

export function unsubscribeToken(userId: string, secret: string): string {
  return createHmac('sha256', secret).update(`${PURPOSE}:${userId}`).digest('base64url')
}

export function verifyUnsubscribeToken(userId: string, token: string, secret: string): boolean {
  const expected = Buffer.from(unsubscribeToken(userId, secret))
  const given = Buffer.from(token)
  return expected.length === given.length && timingSafeEqual(expected, given)
}
