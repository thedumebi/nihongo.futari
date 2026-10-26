import type { DeferredRecompute } from '@nihongo/shared/types'

import { pino } from '@nihongo/shared'

import { recomputeHabit, recomputeProgress } from './progress.service.js'

/**
 * Rebuilds owed by a batch, run once at its end instead of once per item.
 *
 * Offline sync hands a collector to every answer and action it applies; each
 * notes what it would have rebuilt, and `runDeferred` does the work once per
 * language. The rebuilds themselves are unchanged and still wholesale, so
 * replay-safety does not depend on any of this: it only decides how often they
 * run and from which day.
 */

/** An empty collector for a batch's rebuilds. */
export function deferRecompute(): DeferredRecompute {
  return { progress: new Map(), habit: new Set() }
}

/**
 * Notes that a language's progress needs rebuilding from `since` (or wholly,
 * when `since` is undefined). The earliest request wins, and a whole-history
 * request beats any date.
 */
export function deferProgress(deferred: DeferredRecompute, languageId: string, since: Date | undefined): void {
  const owed = deferred.progress.get(languageId)
  if (since === undefined)
    deferred.progress.set(languageId, null)
  else if (owed === undefined || (owed !== null && since < owed))
    deferred.progress.set(languageId, since)
}

/** Notes that a language's XP and streak need rebuilding. */
export function deferHabit(deferred: DeferredRecompute, languageId: string): void {
  deferred.habit.add(languageId)
}

/**
 * Runs what a batch collected: each language's progress once, from the
 * earliest day any item needed. A progress rebuild ends in the habit rebuild,
 * so a language only gets a bare habit rebuild when no review touched it.
 *
 * Every item is already committed by now, so a failed rebuild must not fail
 * the request: the client would resend the batch for nothing. Each language is
 * rebuilt on its own, so one failure does not starve the rest, and the failure
 * is logged. The next answer or action in that language rebuilds it again, and
 * a resent batch does too: duplicates still note what they owe.
 */
export async function runDeferred(userId: string, deferred: DeferredRecompute): Promise<void> {
  const owed: Array<[string, () => Promise<unknown>]> = [
    ...[...deferred.progress].map(([languageId, since]): [string, () => Promise<unknown>] =>
      [languageId, () => recomputeProgress(userId, languageId, since ?? undefined)]),
    ...[...deferred.habit]
      .filter(languageId => !deferred.progress.has(languageId))
      .map((languageId): [string, () => Promise<unknown>] => [languageId, () => recomputeHabit(userId, languageId)])
  ]
  for (const [languageId, rebuild] of owed) {
    try {
      await rebuild()
    } catch (err) {
      pino.error({ err, userId, languageId }, '[sync] deferred recompute failed')
    }
  }
}
