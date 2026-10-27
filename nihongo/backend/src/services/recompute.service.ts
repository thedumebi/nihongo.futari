import type { DeferredRecompute } from '@nihongo/shared/types'

import { pino } from '@nihongo/shared'
import { studyDateFor } from '@nihongo/shared/lib'

import { loadUserContext, recomputeHabit, recomputeProgress } from './progress.service.js'

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
  return { progress: new Map(), habit: new Map(), answeredAt: new Map() }
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

/** Notes that a language's XP and streak need rebuilding, and the study day the activity fell on. */
export function deferHabit(deferred: DeferredRecompute, languageId: string, localDate?: string): void {
  const days = deferred.habit.get(languageId) ?? new Set<string>()
  if (localDate)
    days.add(localDate)
  deferred.habit.set(languageId, days)
}

/** Notes when an answer in a language was given, so its study day has its quests scored. */
export function deferAnswer(deferred: DeferredRecompute, languageId: string, answeredAt: Date): void {
  deferred.answeredAt.set(languageId, [...(deferred.answeredAt.get(languageId) ?? []), answeredAt])
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
  // Answers' study days, worked out once for the batch.
  if (deferred.answeredAt.size > 0) {
    const { timezone, dayBoundaryHour } = await loadUserContext(userId)
    for (const [languageId, moments] of deferred.answeredAt) {
      for (const at of moments)
        deferHabit(deferred, languageId, studyDateFor(at, timezone, dayBoundaryHour))
    }
  }
  const owed: Array<[string, () => Promise<unknown>]> = [
    ...[...deferred.progress].map(([languageId, since]): [string, () => Promise<unknown>] =>
      [languageId, () => recomputeProgress(userId, languageId, since ?? undefined, deferred.habit.get(languageId))]),
    ...[...deferred.habit]
      .filter(([languageId]) => !deferred.progress.has(languageId))
      .map(([languageId, days]): [string, () => Promise<unknown>] => [languageId, () => recomputeHabit(userId, languageId, days)])
  ]
  for (const [languageId, rebuild] of owed) {
    try {
      await rebuild()
    } catch (err) {
      pino.error({ err, userId, languageId }, '[sync] deferred recompute failed')
    }
  }
}
