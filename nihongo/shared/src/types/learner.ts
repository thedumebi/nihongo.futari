import type { User } from './auth.js'
import type { UserSettings } from './user-progress.js'

/**
 * Who is asking, read once per request: the learner's clock and every setting
 * a read needs. `settings` is null for an account with no settings row yet,
 * so each reader keeps its own default for that case.
 */
export interface LearnerProfile {
  timezone: User['timezone'] | null
  settings: UserSettings | null
}
