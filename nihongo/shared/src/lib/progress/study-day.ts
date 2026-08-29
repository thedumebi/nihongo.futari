import { DateTime } from 'luxon'

/**
 * Which study day an instant belongs to.
 *
 * The boundary is 4am local by default, not midnight. Someone reviewing at
 * 1am has not started a new day in any sense that matters to them, and a
 * midnight boundary breaks their streak mid-session — the single most
 * demoralising bug a habit app can ship.
 *
 * The timezone is the USER's stored IANA zone and the date is computed at
 * write time, then persisted. Deriving "today" from the server clock breaks
 * for anyone who travels, and re-deriving it later would silently rewrite
 * history when they move.
 */
export function studyDateFor(instant: Date, timezone: string, dayBoundaryHour = 4): string {
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
 * A study date D with a 4am boundary runs from 04:00 local on D to 04:00 local
 * on D+1. Callers need this to load "every log belonging to these days" without
 * slicing a day in half — a timestamp cutoff mid-day would under-count that
 * day's stats while still marking it for wholesale replacement, which silently
 * destroys data.
 */
export function studyDayRange(
  localDate: string,
  timezone: string,
  dayBoundaryHour = 4
): { start: Date, end: Date } {
  const day = DateTime.fromFormat(localDate, 'yyyy-MM-dd', { zone: timezone })
  if (!day.isValid) {
    throw new Error(`Invalid study date or timezone: ${localDate} / ${timezone}`)
  }
  const start = day.startOf('day').plus({ hours: dayBoundaryHour })
  return { start: start.toJSDate(), end: start.plus({ days: 1 }).toJSDate() }
}
