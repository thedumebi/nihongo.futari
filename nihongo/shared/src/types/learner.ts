import type { User } from './auth.js'
import type { SrsDailyStat } from './srs.js'
import type { UserSettings, UserStreak, UserXp } from './user-progress.js'

/**
 * Who is asking, read once per request: the learner's clock and every setting
 * a read needs. `settings` is null for an account with no settings row yet,
 * so each reader keeps its own default for that case.
 */
export interface LearnerProfile {
  timezone: User['timezone'] | null
  settings: UserSettings | null
}

/**
 * The one-row numbers Today and the progress summary show, read in one round
 * trip: each is null when its row does not exist yet.
 */
export interface LearnerHeadline {
  xp: Pick<UserXp, 'totalXp' | 'level'> | null
  streak: Pick<UserStreak, 'currentStreak' | 'longestStreak'> | null
  /** Reviews on the study day the headline was read for. */
  reviewsToday: SrsDailyStat['reviewCount'] | null
  friendRequests: number
}
