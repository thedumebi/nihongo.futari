import type { Today } from '@nihongo/shared/types'

/**
 * The last Today this device was given, per learner and language, so opening
 * the app shows it at once while the fresh one is on its way. The request
 * used to stand between the learner and a blank "Loading…" for a second or
 * more on every open.
 *
 * What it keeps is only ever a first draft: the store replaces it with the
 * server's answer moments later. Anything that is shown ONCE (a stage passed,
 * a new achievement) is dropped before saving, or every open would celebrate
 * it again; and the friend-request dot waits for the live count.
 */
const PREFIX = 'go-today:'
/**
 * Bumped whenever the Today response changes shape. A copy saved by an older
 * build is then never read, rather than handed to a screen expecting fields it
 * does not have.
 */
const VERSION = 1

function key(userId: string, languageCode: string) {
  return `${PREFIX}v${VERSION}:${userId}:${languageCode}`
}

export function readLastToday(userId: string, languageCode: string): Today | null {
  try {
    const saved = localStorage.getItem(key(userId, languageCode))
    const parsed: unknown = saved ? JSON.parse(saved) : null
    return parsed !== null && typeof parsed === 'object' && 'streak' in parsed ? parsed as Today : null
  } catch {
    return null
  }
}

export function saveLastToday(userId: string, languageCode: string, today: Today): void {
  const draft: Today = { ...today, celebrate: null, unseenAchievements: [], friendRequests: 0 }
  try {
    localStorage.setItem(key(userId, languageCode), JSON.stringify(draft))
  } catch {
    // Without storage the app simply waits for the network, as it always did.
  }
}

/** Signed out: the next person on this device must not see this learner's day. */
export function forgetLastToday(): void {
  try {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith(PREFIX))
        localStorage.removeItem(k)
    }
  } catch {
    // Nothing was stored.
  }
}
