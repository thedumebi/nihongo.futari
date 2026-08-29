/**
 * Quiet hours.
 *
 * A reminder that lands at 3am does not get you to study; it gets the app
 * muted. The window is expressed in the user's OWN local hours, and it has to
 * handle wrapping past midnight — 22:00 to 07:00 is the normal case, not the
 * edge case.
 */
export interface QuietWindow {
  /** Local hour the quiet period starts, 0-23. */
  startHour: number
  /** Local hour it ends, 0-23. Equal to start means no quiet period. */
  endHour: number
}

export function isQuietHour(hour: number, window: QuietWindow | null | undefined): boolean {
  if (!window)
    return false
  const { startHour, endHour } = window
  if (startHour === endHour)
    return false
  // Wrapping window (22 -> 7): quiet if at or after the start, OR before the end.
  if (startHour > endHour)
    return hour >= startHour || hour < endHour
  return hour >= startHour && hour < endHour
}

/**
 * Move a send time out of the quiet window.
 *
 * Delays to the end of the window rather than dropping. A skipped reminder is
 * indistinguishable from a broken one, and the streak it was protecting is
 * still worth protecting an hour later.
 */
export function nextAllowedHour(hour: number, window: QuietWindow | null | undefined): number {
  return isQuietHour(hour, window) ? window!.endHour : hour
}
