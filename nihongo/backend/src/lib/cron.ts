import { Buffer } from 'node:buffer'
import { timingSafeEqual } from 'node:crypto'

/**
 * Whether a host-cron request carries the shared secret.
 *
 * No secret configured is a refusal, never an open door: these endpoints send
 * email or delete rows, and an unauthenticated one is worse than one that does
 * nothing. Compared in constant time so the secret cannot be guessed a
 * character at a time from response timings.
 */
export function isCronAuthorized(expected: string | undefined, provided: string | undefined): boolean {
  if (!expected || !provided)
    return false
  const a = Buffer.from(expected)
  const b = Buffer.from(provided)
  return a.length === b.length && timingSafeEqual(a, b)
}
