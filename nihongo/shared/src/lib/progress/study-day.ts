import { DateTime } from 'luxon'

/**
 * The hour a study day starts, unless the learner picks another: midnight,
 * in their own timezone — a calendar day, as anyone would expect. It used to
 * be 4am, a choice the owner never made; a learner who prefers a late
 * boundary (a session past midnight counting for the evening it began in)
 * can set one in Settings.
 */
export const DEFAULT_DAY_BOUNDARY_HOUR = 0

/**
 * Which study day an instant belongs to.
 *
 * Midnight local by default (see DEFAULT_DAY_BOUNDARY_HOUR); the learner's
 * own boundary hour when they have chosen one.
 *
 * The timezone is the USER's stored IANA zone — kept current from their
 * device — and the date is computed at write time, then persisted. Deriving
 * "today" from the server clock breaks for anyone who travels, and
 * re-deriving it later would silently rewrite history when they move.
 */
export function studyDateFor(instant: Date, timezone: string, dayBoundaryHour = DEFAULT_DAY_BOUNDARY_HOUR): string {
  const local = DateTime.fromJSDate(instant, { zone: timezone })
  if (!local.isValid) {
    throw new Error(`Invalid timezone: ${timezone}`)
  }
  return local.minus({ hours: dayBoundaryHour }).toFormat('yyyy-MM-dd')
}

/** Inclusive count of calendar days between two YYYY-MM-DD study dates. */
export function daysBetween(from: string, to: string): number {
  const a = DateTime.fromFormat(from, 'yyyy-MM-dd', { zone: 'utc' })
  const b = DateTime.fromFormat(to, 'yyyy-MM-dd', { zone: 'utc' })
  return Math.round(b.diff(a, 'days').days)
}

/** The study date immediately after `date`. */
export function nextDate(date: string): string {
  return DateTime.fromFormat(date, 'yyyy-MM-dd', { zone: 'utc' }).plus({ days: 1 }).toFormat('yyyy-MM-dd')
}

/**
 * The instant range a study day covers, in real time.
 *
 * A study date D runs from the boundary hour local on D to the same hour on
 * D+1 — midnight to midnight by default. Callers need this to load "every log belonging to these days" without
 * slicing a day in half — a timestamp cutoff mid-day would under-count that
 * day's stats while still marking it for wholesale replacement, which silently
 * destroys data.
 */
export function studyDayRange(
  localDate: string,
  timezone: string,
  dayBoundaryHour = DEFAULT_DAY_BOUNDARY_HOUR
): { start: Date, end: Date } {
  const day = DateTime.fromFormat(localDate, 'yyyy-MM-dd', { zone: timezone })
  if (!day.isValid) {
    throw new Error(`Invalid study date or timezone: ${localDate} / ${timezone}`)
  }
  const start = day.startOf('day').plus({ hours: dayBoundaryHour })
  return { start: start.toJSDate(), end: start.plus({ days: 1 }).toJSDate() }
}
