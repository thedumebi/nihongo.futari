import type { FuriganaMode } from '@nihongo/shared/constants'
import type { StudySettings } from '@nihongo/shared/types'

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
    .select({ furiganaMode: userSettings.furiganaMode })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1)

  return { furiganaMode: (row?.furiganaMode ?? 'unknown-only') as FuriganaMode }
}

export async function updateSettings(userId: string, patch: StudySettings): Promise<StudySettings> {
  await db
    .insert(userSettings)
    .values({ userId, furiganaMode: patch.furiganaMode })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: { furiganaMode: patch.furiganaMode, updatedAt: new Date() }
    })

  return getSettings(userId)
}
