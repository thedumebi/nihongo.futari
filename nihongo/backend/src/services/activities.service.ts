import type { DeferredRecompute, RecordActivityInput, RecordActivityResult } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { languages, learningActivities, xpEvents } from '@nihongo/shared/db/schema'
import { studyDateFor } from '@nihongo/shared/lib'
import { XP_FOR_ACTIVITY } from '@nihongo/shared/types'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

import { loadUserContext, recomputeHabit } from './progress.service.js'
import { deferHabit } from './recompute.service.js'

/** Later than this past the server clock is a wrong device clock, not the future. */
const CLOCK_SLACK_MS = 5 * 60 * 1000

/**
 * Record something the learner did: a lesson, a Speak session, a crossword…
 *
 * Idempotent twice over — by the client's id, so a retried offline flush is
 * free, and by (kind, what, study day), so the same lesson finished twice in a
 * day counts once. XP is keyed the same way, `kind:refId:localDate`, so it is
 * awarded once however often this runs. Then the habit (XP total, streak) is
 * recomputed wholesale.
 */
export async function recordActivity(
  userId: string,
  languageId: string,
  input: RecordActivityInput,
  { now = new Date(), deferred }: { now?: Date, deferred?: DeferredRecompute } = {}
): Promise<RecordActivityResult> {
  const { timezone, dayBoundaryHour } = await loadUserContext(userId)
  const claimed = input.occurredAt ? new Date(input.occurredAt) : now
  const occurredAt = claimed.getTime() > now.getTime() + CLOCK_SLACK_MS ? now : claimed
  const localDate = studyDateFor(occurredAt, timezone, dayBoundaryHour)

  const inserted = await db
    .insert(learningActivities)
    .values({
      id: input.id ?? randomUUID(),
      userId,
      languageId,
      kind: input.kind,
      refId: input.refId,
      occurredAt,
      localDate,
      timezone,
      ...(input.score !== undefined ? { score: input.score } : {}),
      ...(input.total !== undefined ? { total: input.total } : {}),
      ...(input.durationMs !== undefined ? { durationMs: input.durationMs } : {})
    })
    .onConflictDoNothing()
    .returning({ id: learningActivities.id })

  // Already recorded. A batch resending it may be retrying a flush whose
  // rebuild never finished, so it still asks for one; online, nothing to do.
  if (inserted.length === 0) {
    if (deferred)
      deferHabit(deferred, languageId)
    return { recorded: false, xp: 0 }
  }

  const amount = XP_FOR_ACTIVITY[input.kind]
  await db
    .insert(xpEvents)
    .values({ userId, languageId, source: 'activity', refId: `${input.kind}:${input.refId}:${localDate}`, amount })
    .onConflictDoNothing()

  if (deferred)
    deferHabit(deferred, languageId)
  else
    await recomputeHabit(userId, languageId)
  return { recorded: true, xp: amount }
}

/** The same, for a caller that knows the language by its code. */
export async function recordActivityFor(userId: string, languageCode: string, input: RecordActivityInput, deferred?: DeferredRecompute): Promise<RecordActivityResult | null> {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, languageCode)).limit(1)
  return language ? recordActivity(userId, language.id, input, { deferred }) : null
}
