import type { SpeakCompleteInput, SpeakListResponse, SpeakSessionView, SpeakStepView } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { languageLevels, languages, speakProgress, speakSessions, speakSteps } from '@nihongo/shared/db/schema'
import { speakSegments } from '@nihongo/shared/lib'
import { and, asc, count, eq, sql } from 'drizzle-orm'

import { assetUrl } from '../lib/assets.js'
import { speakAudioPath, VOICE_ENGLISH, VOICE_OTHER } from '../lib/audio-key.js'
import { glossary, glossLine } from './glossary.service.js'

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
    .orderBy(asc(languageLevels.rank), asc(speakSessions.number))

  const sessions = rows.map(({ completedAt, gotIt, total, ...rest }) => ({
    ...rest,
    progress: completedAt ? { completedAt: completedAt.toISOString(), gotIt: gotIt!, total: total! } : null
  }))
  return { sessions, next: sessions.find(s => !s.progress)?.code ?? null }
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
    kind: s.kind === 'prompt' ? 'prompt' : 'explain',
    // Each run in its own voice, exactly as `audio:speak` recorded it.
    say: speakSegments(s.en).map(segment => ({
      ...segment,
      audio: assetUrl(speakAudioPath(segment.text, segment.lang === 'ja' ? VOICE_OTHER : VOICE_ENGLISH))
    })),
    text: s.text,
    reading: s.reading,
    note: s.note,
    tokens: s.text && s.reading ? glossLine(s.text, g, s.reading, { regroupKana: true }) : [],
    answerAudio: s.text ? assetUrl(speakAudioPath(s.text, VOICE_OTHER)) : null
  }))

  const { id: _id, ...rest } = row
  return { ...rest, promptCount: steps.filter(s => s.kind === 'prompt').length, steps }
}

/**
 * Record a finished run. Returns false for a session that is not published.
 *
 * One row per learner and session, replaced each time — a marker of the latest
 * run rather than a tally, so a retried request cannot double anything.
 */
export async function completeSpeakSession(userId: string, languageCode: string, code: string, input: SpeakCompleteInput): Promise<boolean> {
  const [session] = await db
    .select({ id: speakSessions.id })
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
  return true
}
