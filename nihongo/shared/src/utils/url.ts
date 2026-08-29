/**
 * Guard against open redirects: only accept a same-origin path that begins with
 * a single "/" (rejects "//evil.com" and absolute "https://…" URLs). Returns the
 * path when it is safe, otherwise null.
 *
 * Shared by the backend (building newsletter confirmation links) and the
 * frontend (deciding where to send the reader after they confirm), so the rule
 * lives in exactly one place.
 */
export function safeInternalPath(value: unknown): string | null {
  if (typeof value !== 'string')
    return null
  if (value.startsWith('/') && !value.startsWith('//'))
    return value
  return null
}
