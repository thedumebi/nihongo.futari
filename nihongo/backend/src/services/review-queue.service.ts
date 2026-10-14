import type { CorrectionTable, ReviewKind } from '@nihongo/shared/constants'
import type { FuriganaSegment } from '@nihongo/shared/lib'
import type { BulkReviewResult, CorrectionProposal, ReviewItem, ReviewListResponse } from '@nihongo/shared/types'

import { CORRECTION_TABLES, REVIEW_KIND_TABLES } from '@nihongo/shared/constants'
import db from '@nihongo/shared/db'
import {
  contentReviewQueue,
  dialogueReplies,
  dialogueTurns,
  etymologyEntries,
  etymologySources,
  exercisePrompts,
  grammarPoints,
  kanji,
  languageLevels,
  readingLines,
  readings,
  sentences,
  sentenceTokens,
  sources,
  speakSessions,
  speakSteps,
  studyItems,
  words
} from '@nihongo/shared/db/schema'
import { clozeFurigana, correctedAnswers, withLineReading } from '@nihongo/shared/lib'
import { correctionProposalSchema } from '@nihongo/shared/types'
import { aliasedTable, and, asc, eq, inArray, like, sql } from 'drizzle-orm'

/** Second alias: a queue row can point straight at a grammar point. */
const directPoint = aliasedTable(grammarPoints, 'direct_point')
/** A Speak session's level, joined beside a speech's. */
const speakLevel = aliasedTable(languageLevels, 'speak_level')

/**
 * The content review queue.
 *
 * This is the throughput bottleneck for the whole "why" layer — thousands of
 * human decisions gate it — so the API hands back everything needed to decide
 * in one payload: the claim, the prose, and the verbatim source quotes.
 */

function isCorrection(table: string): table is CorrectionTable {
  return (CORRECTION_TABLES as readonly string[]).includes(table)
}

/** The review kind a queue row is, from the table it points at. */
function kindOf(targetTable: string): ReviewKind {
  if (isCorrection(targetTable))
    return 'correction'
  const entry = Object.entries(REVIEW_KIND_TABLES).find(([, table]) => table === targetTable)
  return (entry?.[0] ?? 'etymology') as ReviewKind
}

export async function listPending(
  limit = 25,
  offset = 0,
  kind?: ReviewKind
): Promise<ReviewListResponse> {
  // `kind` filters the LIST, not just the selection. 265 of 315 pending items
  // are etymology, so without this a reviewer who wants to clear the 50 grammar
  // points cannot reach them at all — they are all past the first page.
  const kindFilter = !kind
    ? undefined
    : kind === 'correction'
      ? inArray(contentReviewQueue.targetTable, [...CORRECTION_TABLES])
      : eq(contentReviewQueue.targetTable, REVIEW_KIND_TABLES[kind])
  const rows = await db
    .select({
      id: contentReviewQueue.id,
      targetTable: contentReviewQueue.targetTable,
      targetId: contentReviewQueue.targetId,
      origin: contentReviewQueue.origin,
      status: contentReviewQueue.status,
      createdAt: contentReviewQueue.createdAt,
      proposed: contentReviewQueue.proposed,
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
      gpNuance: directPoint.nuance,
      readingCode: readings.code,
      readingTitle: readings.title,
      readingTitleEn: readings.titleEn,
      readingLevel: languageLevels.code,
      speakCode: speakSessions.code,
      speakNumber: speakSessions.number,
      speakTitle: speakSessions.title,
      speakTitleEn: speakSessions.titleEn,
      speakLevel: speakLevel.code
    })
    .from(contentReviewQueue)
    .leftJoin(etymologyEntries, eq(etymologyEntries.id, contentReviewQueue.targetId))
    .leftJoin(grammarPoints, eq(grammarPoints.id, etymologyEntries.grammarPointId))
    .leftJoin(kanji, eq(kanji.id, etymologyEntries.kanjiId))
    .leftJoin(words, eq(words.id, etymologyEntries.wordId))
    .leftJoin(directPoint, eq(directPoint.id, contentReviewQueue.targetId))
    .leftJoin(readings, and(eq(contentReviewQueue.targetTable, 'readings'), eq(readings.id, contentReviewQueue.targetId)))
    .leftJoin(languageLevels, eq(languageLevels.id, readings.levelId))
    .leftJoin(speakSessions, and(eq(contentReviewQueue.targetTable, 'speak_sessions'), eq(speakSessions.id, contentReviewQueue.targetId)))
    .leftJoin(speakLevel, eq(speakLevel.id, speakSessions.levelId))
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

  // Every line of each speech on the page, so it can be read through in place.
  const readingIds = rows.filter(r => r.targetTable === 'readings').map(r => r.targetId)
  const lines = readingIds.length === 0
    ? []
    : await db
        .select({
          readingId: readingLines.readingId,
          stanza: readingLines.stanza,
          text: readingLines.text,
          reading: readingLines.readingKana,
          translation: readingLines.translation
        })
        .from(readingLines)
        .where(inArray(readingLines.readingId, readingIds))
        .orderBy(asc(readingLines.readingId), asc(readingLines.index))

  function speech(r: typeof rows[number]): ReviewItem['reading'] {
    if (r.targetTable !== 'readings' || !r.readingCode)
      return null
    const stanzas: Array<Array<{ text: string, reading: string, translation: string }>> = []
    let current: number | null = null
    for (const { readingId, stanza, ...line } of lines) {
      if (readingId !== r.targetId)
        continue
      if (stanza !== current) {
        stanzas.push([])
        current = stanza
      }
      stanzas.at(-1)!.push(line)
    }
    return { code: r.readingCode, title: r.readingTitle!, titleEn: r.readingTitleEn!, level: r.readingLevel ?? '', stanzas }
  }

  // Every step of each Speak session on the page, to read through in place.
  const speakIds = rows.filter(r => r.targetTable === 'speak_sessions').map(r => r.targetId)
  const steps = speakIds.length === 0
    ? []
    : await db
        .select({
          sessionId: speakSteps.sessionId,
          kind: speakSteps.kind,
          en: speakSteps.en,
          text: speakSteps.text,
          reading: speakSteps.readingKana,
          note: speakSteps.note
        })
        .from(speakSteps)
        .where(inArray(speakSteps.sessionId, speakIds))
        .orderBy(asc(speakSteps.sessionId), asc(speakSteps.index))

  function speakSession(r: typeof rows[number]): ReviewItem['speak'] {
    if (r.targetTable !== 'speak_sessions' || !r.speakCode)
      return null
    return {
      code: r.speakCode,
      number: r.speakNumber!,
      title: r.speakTitle!,
      titleEn: r.speakTitleEn!,
      level: r.speakLevel ?? '',
      steps: steps
        .filter(s => s.sessionId === r.targetId)
        .map(({ sessionId: _drop, kind, ...rest }) => ({ kind: kind === 'prompt' ? 'prompt' as const : 'explain' as const, ...rest }))
    }
  }

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
      kind: kindOf(r.targetTable),
      subject: r.etySubject ?? r.gpTitle ?? r.readingTitle ?? r.speakTitle ?? correctionSubject(r.targetTable, r.proposed),
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
        .map(({ etymologyId: _drop, ...rest }) => rest),
      reading: speech(r),
      speak: speakSession(r),
      correction: isCorrection(r.targetTable) ? proposalOf(r.proposed) : null
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
      .select({ targetId: contentReviewQueue.targetId, targetTable: contentReviewQueue.targetTable, proposed: contentReviewQueue.proposed })
      .from(contentReviewQueue)
      .where(and(eq(contentReviewQueue.id, id), eq(contentReviewQueue.status, 'pending')))
      .limit(1)
    if (!row)
      return false

    const now = new Date()
    if (isCorrection(row.targetTable)) {
      // A correction is applied, not published: the readings change now, and
      // every copy of them with it.
      const proposal = proposalOf(row.proposed)
      if (!proposal)
        return false
      await applyCorrection(tx, row.targetTable, row.targetId, proposal)
    } else if (row.targetTable === 'etymology_entries') {
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
    } else if (row.targetTable === 'readings') {
      // A speech is invisible until now. Approval is the ONLY thing that
      // publishes one — the seed that brings it in writes it unpublished.
      await tx
        .update(readings)
        .set({ published: true, updatedAt: now })
        .where(eq(readings.id, row.targetId))
    } else if (row.targetTable === 'speak_sessions') {
      // Same rule as a speech: the seed brings a session in unpublished, and
      // approval is the only thing that publishes it.
      await tx
        .update(speakSessions)
        .set({ published: true, updatedAt: now })
        .where(eq(speakSessions.id, row.targetId))
      // And its prompts' study items, so a miss in the session can become a
      // review card. They follow the session — never published ahead of it.
      await tx
        .update(studyItems)
        .set({ published: true, updatedAt: now })
        .where(inArray(studyItems.speakStepId, tx
          .select({ id: speakSteps.id })
          .from(speakSteps)
          .where(eq(speakSteps.sessionId, row.targetId))))
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

// ============ Corrections ============

/** The stored proposal, or null if it is not one this code understands. */
function proposalOf(proposed: unknown): CorrectionProposal | null {
  const parsed = correctionProposalSchema.safeParse(proposed)
  return parsed.success ? parsed.data : null
}

function correctionSubject(table: string, proposed: unknown): string | null {
  if (!isCorrection(table))
    return null
  const p = proposalOf(proposed)
  if (!p)
    return null
  return p.type === 'line' ? `Conversation · ${p.dialogue}` : 'Imported sentence'
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

/**
 * Apply an approved correction to the source and to every copy of it.
 *
 * Each change is guarded by the value it replaces, so a line edited since the
 * proposal was made is left alone rather than overwritten.
 */
async function applyCorrection(tx: Tx, table: CorrectionTable, targetId: string, p: CorrectionProposal): Promise<void> {
  const now = new Date()
  if (p.type === 'line') {
    const target = table === 'dialogue_replies' ? dialogueReplies : dialogueTurns
    await tx.update(target)
      .set({ readingKana: p.to, updatedAt: now })
      .where(and(eq(target.id, targetId), eq(target.readingKana, p.from)))
    // The study queue's snapshot of the conversation carries the line too.
    const prompts = await tx.select({ id: exercisePrompts.id, prompt: exercisePrompts.prompt })
      .from(exercisePrompts)
      .where(like(sql`${exercisePrompts.prompt}::text`, `%${p.text}%`))
    for (const prompt of prompts) {
      const next = withLineReading(prompt.prompt, p.text, p.from, p.to)
      if (next)
        await tx.update(exercisePrompts).set({ prompt: next as Record<string, unknown>, updatedAt: now }).where(eq(exercisePrompts.id, prompt.id))
    }
    return
  }

  const tokensOf = async () => (await tx.select({
    index: sentenceTokens.index,
    charStart: sentenceTokens.charStart,
    charEnd: sentenceTokens.charEnd,
    furigana: sentenceTokens.furigana
  }).from(sentenceTokens).where(eq(sentenceTokens.sentenceId, targetId))).map(t => ({ ...t, furigana: t.furigana as FuriganaSegment[] }))

  const before = await tokensOf()
  for (const change of p.tokens) {
    await tx.update(sentenceTokens)
      .set({ furigana: change.to, alignmentConfidence: '1', updatedAt: now })
      .where(and(
        eq(sentenceTokens.sentenceId, targetId),
        eq(sentenceTokens.index, change.index),
        sql`${sentenceTokens.furigana} = ${JSON.stringify(change.from)}::jsonb`
      ))
  }
  for (const gap of p.gaps) {
    if (before.some(t => t.charStart === gap.at))
      continue
    // Indexed past the tokeniser's own; readers order tokens by position.
    await tx.insert(sentenceTokens).values({
      sentenceId: targetId,
      index: 1000 + gap.at,
      surface: gap.t,
      reading: gap.reading,
      charStart: gap.at,
      charEnd: gap.at + [...gap.t].length,
      furigana: [{ t: gap.t, r: gap.reading }],
      alignmentConfidence: '1'
    })
  }
  const after = await tokensOf()

  // Every cloze card cut from this sentence keeps its own copy.
  const [sentence] = await tx.select({ text: sentences.text }).from(sentences).where(eq(sentences.id, targetId)).limit(1)
  if (!sentence)
    return
  const cards = await tx.select({ id: exercisePrompts.id, prompt: exercisePrompts.prompt, answer: exercisePrompts.answer })
    .from(exercisePrompts)
    .where(and(sql`${exercisePrompts.prompt}->>'kind' = 'cloze'`, sql`${exercisePrompts.assets}->>'sentenceId' = ${targetId}`))
  for (const card of cards) {
    const prompt = card.prompt as Record<string, unknown>
    const answer = card.answer as { primary: string, accepted: string[] }
    const was = clozeFurigana(sentence.text, String(prompt.before ?? ''), String(prompt.after ?? ''), before)
    const now2 = clozeFurigana(sentence.text, String(prompt.before ?? ''), String(prompt.after ?? ''), after)
    await tx.update(exercisePrompts).set({
      prompt: { ...prompt, beforeFurigana: now2.beforeFurigana, afterFurigana: now2.afterFurigana },
      answer: { ...answer, accepted: correctedAnswers(answer.accepted, answer.primary, was.blankReading, now2.blankReading) },
      updatedAt: now
    }).where(eq(exercisePrompts.id, card.id))
  }
}
