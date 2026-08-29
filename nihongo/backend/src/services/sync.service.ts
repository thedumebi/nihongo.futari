import type { SyncMutationsInput, SyncResult } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { srsCards } from '@nihongo/shared/db/schema'
import { inArray } from 'drizzle-orm'

import { recomputeProgress } from './progress.service.js'
import { submitAnswer } from './srs.service.js'

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
 * not abandon the rest, and progress is recomputed ONCE at the end rather than
 * per mutation — a 200-item flush would otherwise rebuild the same days 200
 * times.
 */
export async function applyMutations(userId: string, input: SyncMutationsInput): Promise<SyncResult> {
  const accepted: string[] = []
  const duplicates: string[] = []
  const rejected: Array<{ id: string, reason: string }> = []
  const touchedCards = new Set<string>()
  const languageIds = new Set<string>()

  // Oldest first. Out-of-order arrivals are handled by replay regardless, but
  // applying them in order means most batches never trigger one.
  const ordered = [...input.mutations].sort(
    (a, b) => new Date(a.reviewedAt).getTime() - new Date(b.reviewedAt).getTime()
  )

  for (const mutation of ordered) {
    try {
      const result = await submitAnswer(userId, { ...mutation, offline: true, clientId: input.deviceId })
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

  // Which languages were touched, so the recompute is scoped rather than global.
  if (touchedCards.size > 0) {
    const rows = await db
      .select({ languageId: srsCards.languageId })
      .from(srsCards)
      .where(inArray(srsCards.id, [...touchedCards]))
    for (const r of rows) languageIds.add(r.languageId)
  }

  for (const languageId of languageIds) {
    // Full rebuild: a batch can contain reviews from any point in history.
    await recomputeProgress(userId, languageId)
  }

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
