import type { FuriganaMode } from '@nihongo/shared/constants'
import type { StudySettings, StudySettingsPatch } from '@nihongo/shared/types'
import type { SQL } from 'drizzle-orm'

import { DEFAULT_FURIGANA_MODE } from '@nihongo/shared/constants'
import db from '@nihongo/shared/db'
import { users, userSettings } from '@nihongo/shared/db/schema'
import { DEFAULT_DAY_BOUNDARY_HOUR } from '@nihongo/shared/lib'
import { and, eq, lt, ne } from 'drizzle-orm'

/**
 * Study preferences.
 *
 * The row is created on demand: a user who has never opened settings still has
 * defaults, and requiring a row to exist first would mean every read could fail
 * on a fresh account.
 */
/**
 * Whether this account is an admin, read from the database every time.
 *
 * Never from the session: promoting or demoting someone has to take effect on
 * their next request, not when their session happens to be re-issued.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const [row] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1)
  return row?.role === 'admin'
}

/**
 * Whether an account exists for this address with its email already confirmed.
 * False for an unknown address as well as an unconfirmed one.
 */
export async function isEmailVerified(email: string): Promise<boolean> {
  const [row] = await db
    .select({ emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)
  return row?.emailVerified === true
}

export async function getSettings(userId: string): Promise<StudySettings> {
  const [row] = await db
    .select({
      furiganaMode: userSettings.furiganaMode,
      studyLevel: userSettings.studyLevel,
      dailyNewLimit: userSettings.dailyNewLimit,
      extraPracticeMultiple: userSettings.extraPracticeMultiple,
      dayBoundaryHour: userSettings.dayBoundaryHour,
      streakCelebrations: userSettings.streakCelebrations
    })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1)

  return {
    furiganaMode: (row?.furiganaMode ?? DEFAULT_FURIGANA_MODE) as FuriganaMode,
    // Empty string is the app's own word for "every level", so a user with no
    // row yet gets the same thing as a user who chose All.
    studyLevel: row?.studyLevel ?? '',
    dailyNewLimit: row?.dailyNewLimit ?? 10,
    extraPracticeMultiple: row?.extraPracticeMultiple ?? 2,
    dayBoundaryHour: row?.dayBoundaryHour ?? DEFAULT_DAY_BOUNDARY_HOUR,
    streakCelebrations: row?.streakCelebrations ?? true
  }
}

/**
 * Apply a partial settings patch.
 *
 * Only the keys actually present are written. Each picker sends the one value
 * it owns, and a patch that named every column would let the furigana control
 * silently reset the level — the classic last-write-wins bug you get from
 * treating a PATCH as a PUT.
 */
export async function updateSettings(userId: string, patch: StudySettingsPatch): Promise<StudySettings> {
  const changes = {
    ...(patch.furiganaMode !== undefined ? { furiganaMode: patch.furiganaMode } : {}),
    ...(patch.studyLevel !== undefined ? { studyLevel: patch.studyLevel } : {}),
    ...(patch.dailyNewLimit !== undefined ? { dailyNewLimit: patch.dailyNewLimit } : {}),
    ...(patch.extraPracticeMultiple !== undefined ? { extraPracticeMultiple: patch.extraPracticeMultiple } : {}),
    ...(patch.dayBoundaryHour !== undefined ? { dayBoundaryHour: patch.dayBoundaryHour } : {}),
    ...(patch.streakCelebrations !== undefined ? { streakCelebrations: patch.streakCelebrations } : {})
  }

  // An empty patch is a read, not a write. Without this the insert below would
  // still create a defaults row, which is harmless but pointless.
  if (Object.keys(changes).length === 0)
    return getSettings(userId)

  await db
    .insert(userSettings)
    .values({ userId, ...changes })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: { ...changes, updatedAt: new Date() }
    })

  return getSettings(userId)
}

/**
 * How long a password sign-up may sit with its email unconfirmed. Long enough
 * to find the code in a spam folder the next morning; short enough that an
 * address typed by somebody else is not held for long.
 */
export const UNCONFIRMED_ACCOUNT_TTL_HOURS = 24

/**
 * Delete accounts whose email was never confirmed and are older than the TTL.
 *
 * Every other way in marks the email confirmed when the account is made: an
 * emailed code, Google, and an admin-created account. So what is left is a
 * password sign-up nobody finished, which can never sign in. Admins are kept
 * whatever their state. Everything that hangs off a user cascades.
 *
 * Returns how many were deleted.
 */
export async function deleteUnconfirmedAccounts(now: Date = new Date()): Promise<number> {
  const deleted = await db
    .delete(users)
    .where(unconfirmedAccountsFilter(now))
    .returning({ id: users.id })
  return deleted.length
}

const HOUR_MS = 60 * 60 * 1000

/** Which accounts `deleteUnconfirmedAccounts` removes, as of `now`. */
export function unconfirmedAccountsFilter(now: Date): SQL | undefined {
  const cutoff = new Date(now.getTime() - UNCONFIRMED_ACCOUNT_TTL_HOURS * HOUR_MS)
  return and(eq(users.emailVerified, false), lt(users.createdAt, cutoff), ne(users.role, 'admin'))
}
