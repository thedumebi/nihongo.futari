import type { BulkReviewResult, ReviewListResponse } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import {
  contentReviewQueue,
  etymologyEntries,
  etymologySources,
  grammarPoints,
  kanji,
  sources,
  words
} from '@nihongo/shared/db/schema'
import { aliasedTable, and, asc, eq, inArray, sql } from 'drizzle-orm'

/** Second alias: a queue row can point straight at a grammar point. */
const directPoint = aliasedTable(grammarPoints, 'direct_point')

/**
 * The content review queue.
 *
 * This is the throughput bottleneck for the whole "why" layer — thousands of
 * human decisions gate it — so the API hands back everything needed to decide
 * in one payload: the claim, the prose, and the verbatim source quotes.
 */

export async function listPending(
  limit = 25,
  offset = 0,
  kind?: 'grammar' | 'etymology'
): Promise<ReviewListResponse> {
  // `kind` filters the LIST, not just the selection. 265 of 315 pending items
  // are etymology, so without this a reviewer who wants to clear the 50 grammar
  // points cannot reach them at all — they are all past the first page.
  const kindFilter = kind === 'grammar'
    ? eq(contentReviewQueue.targetTable, 'grammar_points')
    : kind === 'etymology'
      ? eq(contentReviewQueue.targetTable, 'etymology_entries')
      : undefined
  const rows = await db
    .select({
      id: contentReviewQueue.id,
      targetTable: contentReviewQueue.targetTable,
      targetId: contentReviewQueue.targetId,
      origin: contentReviewQueue.origin,
      status: contentReviewQueue.status,
      createdAt: contentReviewQueue.createdAt,
      claim: etymologyEntries.claim,
      body: etymologyEntries.body,
      confidence: etymologyEntries.confidence,
      aspect: etymologyEntries.aspect,
      // A row targets EITHER an etymology entry or a grammar point, so exactly
      // one of these two joins produces a match.
      // A reviewer must be able to see WHAT they are approving. Only
      // grammarPoints was joined, so all 238 kanji- and word-based entries
      // showed a blank subject.
      etySubject: sql<string | null>`coalesce(${grammarPoints.title}, ${kanji.character}, ${words.primaryForm})`,
      gpTitle: directPoint.title,
      gpPattern: directPoint.pattern,
      gpShort: directPoint.meaningShort,
      gpLong: directPoint.meaningLong,
      gpNuance: directPoint.nuance
    })
    .from(contentReviewQueue)
    .leftJoin(etymologyEntries, eq(etymologyEntries.id, contentReviewQueue.targetId))
    .leftJoin(grammarPoints, eq(grammarPoints.id, etymologyEntries.grammarPointId))
    .leftJoin(kanji, eq(kanji.id, etymologyEntries.kanjiId))
    .leftJoin(words, eq(words.id, etymologyEntries.wordId))
    .leftJoin(directPoint, eq(directPoint.id, contentReviewQueue.targetId))
    .where(and(eq(contentReviewQueue.status, 'pending'), kindFilter))
    .orderBy(asc(contentReviewQueue.priority), asc(contentReviewQueue.createdAt))
    .limit(limit)
    .offset(offset)

  const citations = rows.length === 0
    ? []
    : await db
        .select({
          etymologyId: etymologySources.etymologyId,
          source: sources.title,
          abbreviation: sources.abbreviation,
          locator: etymologySources.locator,
          quote: etymologySources.quote,
          reliabilityTier: sources.reliabilityTier
        })
        .from(etymologySources)
        .innerJoin(sources, eq(sources.id, etymologySources.sourceId))
        .where(inArray(etymologySources.etymologyId, rows.map(r => r.targetId)))
        .orderBy(asc(sources.reliabilityTier))

  const [count] = await db
    .select({ total: sql<number>`count(*)`.mapWith(Number) })
    .from(contentReviewQueue)
    .where(and(eq(contentReviewQueue.status, 'pending'), kindFilter))

  return {
    items: rows.map(r => ({
      id: r.id,
      targetTable: r.targetTable,
      targetId: r.targetId,
      origin: r.origin,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      kind: (r.targetTable === 'grammar_points' ? 'grammar' : 'etymology') as 'grammar' | 'etymology',
      subject: r.etySubject ?? r.gpTitle,
      claim: r.claim,
      body: r.body,
      confidence: r.confidence,
      aspect: r.aspect,
      pattern: r.gpPattern,
      meaningShort: r.gpShort,
      meaningLong: r.gpLong,
      nuance: r.gpNuance,
      citations: citations
        .filter(c => c.etymologyId === r.targetId)
        .map(({ etymologyId: _drop, ...rest }) => rest)
    })),
    pending: count?.total ?? 0
  }
}

/**
 * Approve, and publish the underlying entry.
 *
 * `reviewedBy` is the real reviewer's id — the CHECK constraint on
 * etymology_entries will reject the publish otherwise, which is exactly the
 * behaviour we want: there is no code path that publishes unreviewed content.
 */
export async function approve(id: string, reviewerId: string, note?: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .select({ targetId: contentReviewQueue.targetId, targetTable: contentReviewQueue.targetTable })
      .from(contentReviewQueue)
      .where(and(eq(contentReviewQueue.id, id), eq(contentReviewQueue.status, 'pending')))
      .limit(1)
    if (!row)
      return false

    const now = new Date()
    if (row.targetTable === 'etymology_entries') {
      await tx
        .update(etymologyEntries)
        .set({ status: 'published', reviewedBy: reviewerId, reviewedAt: now, publishedAt: now, updatedAt: now })
        .where(eq(etymologyEntries.id, row.targetId))
    } else if (row.targetTable === 'grammar_points') {
      // Grammar points are already visible (published) but flagged as drafts.
      // Approving clears the draft badge and records who signed it off.
      await tx
        .update(grammarPoints)
        .set({ status: 'published', reviewedBy: reviewerId, reviewedAt: now, updatedAt: now })
        .where(eq(grammarPoints.id, row.targetId))
    }

    await tx
      .update(contentReviewQueue)
      .set({
        status: 'approved',
        reviewerId,
        reviewedAt: now,
        appliedAt: now,
        ...(note ? { reviewerNotes: note } : {}),
        updatedAt: now
      })
      .where(eq(contentReviewQueue.id, id))

    return true
  })
}

export async function reject(id: string, reviewerId: string, note?: string): Promise<boolean> {
  const now = new Date()
  const [row] = await db
    .update(contentReviewQueue)
    .set({
      status: 'rejected',
      reviewerId,
      reviewedAt: now,
      ...(note ? { reviewerNotes: note } : {}),
      updatedAt: now
    })
    .where(and(eq(contentReviewQueue.id, id), eq(contentReviewQueue.status, 'pending')))
    .returning({ id: contentReviewQueue.id })

  // Leave the entry at 'in-review' rather than deleting it: a rejected draft is
  // evidence for the next attempt.
  return Boolean(row)
}

/**
 * Approve or reject several items at once.
 *
 * Each is applied independently so one failure does not abandon the rest, and
 * the caller is told exactly which ids did not go through rather than getting a
 * single opaque error.
 */
export async function bulkDecide(
  ids: string[],
  reviewerId: string,
  action: 'approve' | 'reject',
  note?: string
): Promise<BulkReviewResult> {
  const succeeded: string[] = []
  const failed: Array<{ id: string, reason: string }> = []

  for (const id of ids) {
    try {
      const ok = action === 'approve'
        ? await approve(id, reviewerId, note)
        : await reject(id, reviewerId, note)
      if (ok)
        succeeded.push(id)
      else failed.push({ id, reason: 'Not pending, or already reviewed' })
    } catch (err) {
      failed.push({ id, reason: err instanceof Error ? err.message : 'Failed' })
    }
  }

  return { succeeded, failed }
}
