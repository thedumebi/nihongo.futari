import type { DeferredRecompute, SyncAction, SyncMutationsInput, SyncResult } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { srsCards } from '@nihongo/shared/db/schema'
import { inArray } from 'drizzle-orm'

import { recordActivityFor } from './activities.service.js'
import { completeLesson } from './lesson.service.js'
import { deferRecompute, runDeferred } from './recompute.service.js'
import { completeSpeakSession, missSpeakStep } from './speak.service.js'
import { saveWord, submitAnswer } from './srs.service.js'

/**
 * Offline sync.
 *
 * The batch form of `submitAnswer`. Everything that makes this correct already
 * lives in the pieces it calls:
 *
 *   - each answer is keyed by a client-minted UUIDv7 and inserted with
 *     ON CONFLICT DO NOTHING, so a duplicated or retried flush is a no-op;
 *   - a review landing before a card's last review triggers a full replay of
 *     that card's history, because FSRS is path-dependent;
 *   - aggregates are recomputed wholesale rather than incremented.
 *
 * What this layer adds is batching discipline: mutations are applied in
 * `reviewedAt` order so the common case takes the cheap path, one failure does
 * not abandon the rest, and progress is recomputed ONCE per language at the
 * end, from the earliest day any item touched (the whole history if one
 * replayed). Each item hands its rebuild to `deferred` instead of running it,
 * so a 200-item flush does not rebuild the same days 200 times.
 */
export async function applyMutations(userId: string, input: SyncMutationsInput): Promise<SyncResult> {
  const accepted: string[] = []
  const duplicates: string[] = []
  const rejected: Array<{ id: string, reason: string }> = []
  const touchedCards = new Set<string>()
  const deferred = deferRecompute()

  // Oldest first. Out-of-order arrivals are handled by replay regardless, but
  // applying them in order means most batches never trigger one.
  const ordered = [...input.mutations].sort(
    (a, b) => new Date(a.reviewedAt).getTime() - new Date(b.reviewedAt).getTime()
  )

  for (const mutation of ordered) {
    try {
      const result = await submitAnswer(userId, { ...mutation, offline: true, clientId: input.deviceId }, deferred)
      if (result.applied)
        accepted.push(mutation.id)
      else duplicates.push(mutation.id)
      touchedCards.add(result.cardId)
    } catch (err) {
      // One bad mutation must not strand the rest of the batch. The client
      // moves these to its dead-letter store rather than retrying forever.
      rejected.push({
        id: mutation.id,
        reason: err instanceof Error ? err.message : 'Could not be applied'
      })
    }
  }

  // Queued writes besides answers. Each goes through the same service as its
  // online route, so idempotency and the habit recompute come with it.
  for (const action of input.actions ?? []) {
    try {
      const applied = await applyAction(userId, action, deferred)
      if (applied === null)
        rejected.push({ id: action.id, reason: 'Nothing to apply it to' })
      else if (applied)
        accepted.push(action.id)
      else duplicates.push(action.id)
    } catch (err) {
      rejected.push({ id: action.id, reason: err instanceof Error ? err.message : 'Could not be applied' })
    }
  }

  await runDeferred(userId, deferred)

  const cards = touchedCards.size === 0
    ? []
    : await db
        .select({
          cardId: srsCards.id,
          due: srsCards.due,
          stability: srsCards.stability,
          difficulty: srsCards.difficulty,
          elapsedDays: srsCards.elapsedDays,
          scheduledDays: srsCards.scheduledDays,
          learningSteps: srsCards.learningSteps,
          reps: srsCards.reps,
          lapses: srsCards.lapses,
          state: srsCards.state,
          lastReview: srsCards.lastReview,
          ghost: srsCards.ghost
        })
        .from(srsCards)
        .where(inArray(srsCards.id, [...touchedCards]))

  return {
    accepted,
    duplicates,
    rejected,
    // The server always wins on card state: it has the full log, the client
    // may not. The client's optimistic scheduling was only ever a prediction.
    cards: cards.map(c => ({
      cardId: c.cardId,
      ghost: c.ghost,
      card: {
        due: c.due,
        stability: c.stability,
        difficulty: c.difficulty,
        elapsedDays: c.elapsedDays,
        scheduledDays: c.scheduledDays,
        learningSteps: c.learningSteps,
        reps: c.reps,
        lapses: c.lapses,
        state: c.state,
        lastReview: c.lastReview
      }
    })),
    serverTime: new Date().toISOString()
  }
}

/**
 * One queued action, through the same service as its online route. True when
 * it changed something, false when it was already applied, null when it names
 * something that does not exist (refused — retrying cannot help).
 */
async function applyAction(userId: string, action: SyncAction, deferred: DeferredRecompute): Promise<boolean | null> {
  switch (action.type) {
    case 'activity': {
      const { type: _type, languageCode, ...activity } = action
      const result = await recordActivityFor(userId, languageCode, activity, deferred)
      return result ? result.recorded : null
    }
    case 'lessonComplete': {
      const result = await completeLesson(userId, action.languageCode, action.slug, { score: action.score, missedPromptIds: action.missedPromptIds }, deferred)
      return result ? true : null
    }
    case 'speakComplete':
      return (await completeSpeakSession(userId, action.languageCode, action.code, { gotIt: action.gotIt, total: action.total }, deferred)) ? true : null
    case 'speakMiss': {
      const result = await missSpeakStep(userId, action.languageCode, action.code, action.index)
      return result ? result.added : null
    }
    case 'saveWord': {
      const result = await saveWord(userId, action.wordId)
      return result ? result.added : null
    }
  }
}
