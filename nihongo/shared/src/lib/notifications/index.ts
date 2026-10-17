/**
 * When a "reviews ready" push is worth sending. Pure, so it can be tested; the
 * cron gathers the facts and asks. Every reason to stay quiet lives here, on
 * the server: an iPhone revokes a web app's push permission if pushes arrive
 * that do not show a notification, so the app never decides to hide one.
 */

/** Enough waiting to be worth opening the app for. */
export const DUE_ALERT_MIN = 10
/** Daytime only, in the learner's own time. */
export const DUE_ALERT_FROM_HOUR = 8
export const DUE_ALERT_UNTIL_HOUR = 21
/** Not on top of a session, and not on top of the daily reminder. */
export const DUE_ALERT_QUIET_MINUTES = 120
/** Nudges (not the reminder they chose) a learner can get in one day, all kinds together. */
export const NUDGES_PER_DAY = 3

export function shouldSendDueAlert(facts: {
  /** The learner's local time now. */
  hour: number
  minute: number
  /** Their daily reminder's local time, if they get one. */
  reminder: { hour: number, minute: number } | null
  /** Items due now. */
  due: number
  /** Minutes since they last studied; null if never. */
  minutesSinceStudy: number | null
  /** Nudges already sent today. */
  nudgesToday: number
}): boolean {
  if (facts.hour < DUE_ALERT_FROM_HOUR || facts.hour >= DUE_ALERT_UNTIL_HOUR)
    return false
  if (facts.due < DUE_ALERT_MIN)
    return false
  if (facts.minutesSinceStudy !== null && facts.minutesSinceStudy < DUE_ALERT_QUIET_MINUTES)
    return false
  if (facts.nudgesToday >= NUDGES_PER_DAY)
    return false
  if (facts.reminder) {
    const now = facts.hour * 60 + facts.minute
    const at = facts.reminder.hour * 60 + facts.reminder.minute
    if (Math.abs(at - now) < DUE_ALERT_QUIET_MINUTES)
      return false
  }
  return true
}
