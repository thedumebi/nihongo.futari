/**
 * Push devices, as a learner reads them in Settings.
 *
 * Web push gives the server no device identity, so a subscription is shown by
 * what its browser said about itself when it subscribed. Good enough to tell
 * "iPhone (Home Screen app)" from "Chrome on Mac" and choose which to keep;
 * never used to decide anything on its own.
 */

/** A short name for the device a push subscription came from. */
export function pushDeviceLabel(userAgent: string | null | undefined): string {
  const ua = userAgent ?? ''
  if (!ua)
    return 'A device'
  if (/iPhone/.test(ua))
    return /Safari\//.test(ua) ? 'iPhone (Safari)' : 'iPhone (Home Screen app)'
  if (/iPad/.test(ua))
    return 'iPad'
  if (/Android/.test(ua))
    return 'Android'
  const browser = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'A browser'
  const os = /Macintosh/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : ''
  return os ? `${browser} on ${os}` : browser
}
