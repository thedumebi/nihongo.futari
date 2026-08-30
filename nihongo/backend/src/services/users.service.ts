import type { FuriganaMode } from '@nihongo/shared/constants'
import type { StudySettings, StudySettingsPatch } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { userSettings } from '@nihongo/shared/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Study preferences.
 *
 * The row is created on demand: a user who has never opened settings still has
 * defaults, and requiring a row to exist first would mean every read could fail
 * on a fresh account.
 */
export async function getSettings(userId: string): Promise<StudySettings> {
  const [row] = await db
    .select({
      furiganaMode: userSettings.furiganaMode,
      studyLevel: userSettings.studyLevel
    })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1)

  return {
    furiganaMode: (row?.furiganaMode ?? 'unknown-only') as FuriganaMode,
    // Empty string is the app's own word for "every level", so a user with no
    // row yet gets the same thing as a user who chose All.
    studyLevel: row?.studyLevel ?? ''
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
    ...(patch.studyLevel !== undefined ? { studyLevel: patch.studyLevel } : {})
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
