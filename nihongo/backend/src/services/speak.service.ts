import type { DeferredRecompute, SaveWordResult, SpeakCompleteInput, SpeakListResponse, SpeakSessionView, SpeakStepView } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { languageLevels, languages, speakProgress, speakSessions, speakSteps } from '@nihongo/shared/db/schema'
import { and, asc, count, eq, sql } from 'drizzle-orm'

import { speakAnswerAudio, speakSay } from '../lib/assets.js'
import { recordActivity } from './activities.service.js'
import { glossary, glossLine } from './glossary.service.js'
import { saveSpeakStep } from './srs.service.js'

/**
 * Speak: the build-up course.
 *
 * Only published sessions leave here, except to an admin previewing a draft
 * from the review queue. A session is published only by approving it there.
 */

export async function listSpeak(userId: string, languageCode: string): Promise<SpeakListResponse> {
  const rows = await db
    .select({
      code: speakSessions.code,
      kind: speakSessions.kind,
      number: speakSessions.number,
      title: speakSessions.title,
      titleEn: speakSessions.titleEn,
      level: languageLevels.code,
      promptCount: count(speakSteps.id),
      completedAt: speakProgress.completedAt,
      gotIt: speakProgress.gotIt,
      total: speakProgress.total
    })
    .from(speakSessions)
    .innerJoin(languages, eq(languages.id, speakSessions.languageId))
    .innerJoin(languageLevels, eq(languageLevels.id, speakSessions.levelId))
    .leftJoin(speakSteps, and(eq(speakSteps.sessionId, speakSessions.id), eq(speakSteps.kind, 'prompt')))
    .leftJoin(speakProgress, and(eq(speakProgress.sessionId, speakSessions.id), eq(speakProgress.userId, userId)))
    .where(and(eq(languages.code, languageCode), eq(speakSessions.published, true)))
    .groupBy(speakSessions.id, languageLevels.code, languageLevels.rank, speakProgress.completedAt, speakProgress.gotIt, speakProgress.total)
    .orderBy(asc(languageLevels.rank), asc(speakSessions.kind), asc(speakSessions.number))

  const sessions = rows.map(({ completedAt, gotIt, total, kind, ...rest }) => ({
    ...rest,
    kind: kind === 'story' ? 'story' as const : 'course' as const,
    progress: completedAt ? { completedAt: completedAt.toISOString(), gotIt: gotIt!, total: total! } : null
  }))
  // "Next" walks the course; stories sit beside it, picked when wanted.
  return { sessions, next: sessions.find(s => s.kind === 'course' && !s.progress)?.code ?? null }
}

export async function getSpeakSession(
  languageCode: string,
  code: string,
  { includeDrafts = false } = {}
): Promise<SpeakSessionView | null> {
  const [row] = await db
    .select({
      id: speakSessions.id,
      code: speakSessions.code,
      kind: speakSessions.kind,
      number: speakSessions.number,
      title: speakSessions.title,
      titleEn: speakSessions.titleEn,
      level: languageLevels.code,
      published: speakSessions.published
    })
    .from(speakSessions)
    .innerJoin(languages, eq(languages.id, speakSessions.languageId))
    .innerJoin(languageLevels, eq(languageLevels.id, speakSessions.levelId))
    .where(and(
      eq(languages.code, languageCode),
      eq(speakSessions.code, code),
      includeDrafts ? undefined : eq(speakSessions.published, true)
    ))
    .limit(1)

  if (!row)
    return null

  const stepRows = await db
    .select({
      index: speakSteps.index,
      kind: speakSteps.kind,
      en: speakSteps.en,
      text: speakSteps.text,
      reading: speakSteps.readingKana,
      note: speakSteps.note
    })
    .from(speakSteps)
    .where(eq(speakSteps.sessionId, row.id))
    .orderBy(asc(speakSteps.index))

  const g = await glossary(languageCode)
  const steps: SpeakStepView[] = stepRows.map(s => ({
    index: s.index,
    kind: s.kind === 'prompt' ? 'prompt' : s.kind === 'narrate' ? 'narrate' : 'explain',
    // Each run in its own voice, exactly as `audio:speak` recorded it. A
    // narration's English is shown, not spoken: the passage is the point.
    say: s.kind === 'narrate' ? [] : speakSay(s.en, row.number),
    text: s.text,
    reading: s.reading,
    note: s.kind === 'narrate' ? s.en : s.note,
    tokens: s.text && s.reading ? glossLine(s.text, g, s.reading, { regroupKana: true }) : [],
    answerAudio: s.text ? speakAnswerAudio(s.text) : null
  }))

  const { id: _id, kind, ...rest } = row
  return { ...rest, kind: kind === 'story' ? 'story' : 'course', promptCount: steps.filter(s => s.kind === 'prompt').length, steps }
}

/**
 * Record a finished run. Returns false for a session that is not published.
 *
 * One row per learner and session, replaced each time — a marker of the latest
 * run rather than a tally, so a retried request cannot double anything.
 */
export async function completeSpeakSession(userId: string, languageCode: string, code: string, input: SpeakCompleteInput, deferred?: DeferredRecompute): Promise<boolean> {
  const [session] = await db
    .select({ id: speakSessions.id, languageId: speakSessions.languageId, kind: speakSessions.kind })
    .from(speakSessions)
    .innerJoin(languages, eq(languages.id, speakSessions.languageId))
    .where(and(eq(languages.code, languageCode), eq(speakSessions.code, code), eq(speakSessions.published, true)))
    .limit(1)
  if (!session)
    return false

  const now = new Date()
  await db
    .insert(speakProgress)
    .values({ userId, sessionId: session.id, completedAt: now, gotIt: input.gotIt, total: input.total })
    .onConflictDoUpdate({
      target: [speakProgress.userId, speakProgress.sessionId],
      set: { completedAt: now, gotIt: input.gotIt, total: input.total, updatedAt: sql`now()` }
    })
  // A story is its own activity, so the story quest can tell it from the course.
  await recordActivity(userId, session.languageId, { kind: session.kind === 'story' ? 'story' : 'speak', refId: code, score: input.gotIt, total: input.total }, { now, deferred })
  return true
}

/**
 * A prompt answered "Not quite": put it in the learner's reviews.
 *
 * Only from a published session, and only a prompt — a draft previewed from
 * the review queue must not leave cards behind. Null when there is no such
 * prompt to save; `added: false` when it is already in review.
 */
export async function missSpeakStep(userId: string, languageCode: string, code: string, index: number): Promise<SaveWordResult | null> {
  const [step] = await db
    .select({ id: speakSteps.id })
    .from(speakSteps)
    .innerJoin(speakSessions, eq(speakSessions.id, speakSteps.sessionId))
    .innerJoin(languages, eq(languages.id, speakSessions.languageId))
    .where(and(
      eq(languages.code, languageCode),
      eq(speakSessions.code, code),
      eq(speakSessions.published, true),
      eq(speakSteps.index, index),
      eq(speakSteps.kind, 'prompt')
    ))
    .limit(1)
  if (!step)
    return null
  return saveSpeakStep(userId, step.id)
}
