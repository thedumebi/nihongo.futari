import type { OnboardingStatus } from '@nihongo/shared/constants'
import type { GuideCounts } from '@nihongo/shared/lib'
import type { OnboardingAnswers, OnboardingState, PlacementQuestion, PlacementResponse } from '@nihongo/shared/types'

import { JLPT_LEVELS, ONBOARDING_STATUSES } from '@nihongo/shared/constants'
import db from '@nihongo/shared/db'
import { userSettings } from '@nihongo/shared/db/schema'
import { guideDone, guideFor, paceFor, PLACEMENT_PER_LEVEL, studyLevelFor } from '@nihongo/shared/lib'
import { onboardingAnswersSchema } from '@nihongo/shared/types'
import { eq, sql } from 'drizzle-orm'

import { getPrefs, setPrefs } from './notifications.service.js'
import { updateSettings } from './users.service.js'

/**
 * Onboarding.
 *
 * A minute of questions — where you are starting from, what for, how long a
 * day, how much reading help, when to be reminded — applied to the settings
 * that already exist, plus a short first-week guide on Today whose steps tick
 * themselves off from what the learner actually does. The rules are in the
 * shared lib (lib/onboarding); this only reads and writes.
 */

function asStatus(value: string | undefined): OnboardingStatus {
  return (ONBOARDING_STATUSES as readonly string[]).includes(value ?? '') ? value as OnboardingStatus : 'pending'
}

export async function getOnboarding(userId: string): Promise<OnboardingState> {
  const [row] = await db
    .select({ status: userSettings.onboardingStatus, answers: userSettings.onboardingAnswers, dismissed: userSettings.guideDismissedAt })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1)

  const status = asStatus(row?.status)
  const parsed = onboardingAnswersSchema.safeParse(row?.answers)
  const answers = parsed.success ? parsed.data : null
  if (!answers)
    return { status, answers: null, guide: [], guideHidden: true }

  const counts = await guideCounts(userId)
  const guide = guideFor(answers).map(step => ({ ...step, done: guideDone(step.code, counts) }))
  return { status, answers, guide, guideHidden: Boolean(row?.dismissed) || guide.every(s => s.done) }
}

/** Apply the answers to the learner's settings and keep them for the guide. */
export async function submitOnboarding(userId: string, answers: OnboardingAnswers): Promise<OnboardingState> {
  await updateSettings(userId, {
    furiganaMode: answers.furiganaMode,
    studyLevel: studyLevelFor(answers),
    dailyNewLimit: paceFor(answers.minutes).dailyNewLimit
  })
  if (answers.reminder) {
    const prefs = await getPrefs(userId)
    await setPrefs(userId, {
      ...prefs,
      reminderHour: answers.reminder.hour,
      reminderMinute: answers.reminder.minute,
      reminderEmailEnabled: answers.reminder.email,
      reminderPushEnabled: answers.reminder.push
    })
  }
  const now = new Date()
  const state = {
    sessionLength: paceFor(answers.minutes).sessionLength,
    onboardingStatus: 'done',
    onboardingAnswers: answers as unknown as Record<string, unknown>,
    // A re-run brings the guide back, rebuilt for the new answers.
    guideDismissedAt: null,
    updatedAt: now
  }
  await db.insert(userSettings).values({ userId, ...state }).onConflictDoUpdate({ target: userSettings.userId, set: state })
  return getOnboarding(userId)
}

/** Skipped: never sent to the welcome flow again. It stays a tap away in Settings. */
export async function skipOnboarding(userId: string): Promise<OnboardingState> {
  const now = new Date()
  await db.insert(userSettings).values({ userId, onboardingStatus: 'skipped' }).onConflictDoUpdate({ target: userSettings.userId, set: { onboardingStatus: 'skipped', updatedAt: now } })
  return getOnboarding(userId)
}

export async function dismissGuide(userId: string): Promise<OnboardingState> {
  const now = new Date()
  await db.insert(userSettings).values({ userId, guideDismissedAt: now }).onConflictDoUpdate({ target: userSettings.userId, set: { guideDismissedAt: now, updatedAt: now } })
  return getOnboarding(userId)
}

/** Everything the guide's steps are ticked off from. */
async function guideCounts(userId: string): Promise<GuideCounts> {
  const [activities, other] = await Promise.all([
    db.execute<{ kind: string, n: number }>(sql`
      select kind, count(*)::int as n from learning_activities where user_id = ${userId} group by kind`),
    db.execute<{ words: number, review_days: number }>(sql`
      select
        (select count(distinct si.id)::int
           from srs_cards sc
           join study_item_facets f on f.id = sc.facet_id
           join study_items si on si.id = f.study_item_id
          where sc.user_id = ${userId} and si.kind = 'word') as words,
        (select count(distinct local_date)::int from srs_daily_stats
          where user_id = ${userId} and review_count > 0) as review_days`)
  ])
  return {
    activities: Object.fromEntries(activities.rows.map(r => [r.kind, Number(r.n)])),
    words: Number(other.rows[0]?.words ?? 0),
    reviewDays: Number(other.rows[0]?.review_days ?? 0)
  }
}

/**
 * Placement questions: a few common words from each level, each with four
 * meanings to choose from — the others taken from words of the same level, so
 * the wrong answers are plausible rather than absurd. The welcome flow asks a
 * level at a time and stops at the first one failed (placedLevel).
 */
export async function placementQuestions(languageCode: string): Promise<PlacementResponse> {
  const rows = (await db.execute<{ level: string, form: string, reading: string, meaning: string }>(sql`
    select l.code as level, w.primary_form as form, w.primary_reading as reading,
      (select ws.glosses->0->>'text' from word_senses ws where ws.word_id = w.id order by ws.sort_index limit 1) as meaning
    from words w
    join language_levels l on l.id = w.level_id
    join languages lang on lang.id = w.language_id
    where lang.code = ${languageCode} and w.published and w.is_common
      and w.primary_form ~ '[一-龯]'
    order by random()
    limit 400`)).rows.filter(r => r.meaning)

  const questions: PlacementQuestion[] = []
  for (const level of JLPT_LEVELS) {
    const pool = rows.filter(r => r.level === level)
    const asked = pool.slice(0, PLACEMENT_PER_LEVEL)
    for (const word of asked) {
      const others = [...new Set(pool.filter(r => r !== word && r.meaning !== word.meaning).map(r => r.meaning))].slice(0, 3)
      if (others.length < 3)
        continue
      const choices = [word.meaning, ...others].sort(() => Math.random() - 0.5)
      questions.push({ level, word: word.form, reading: word.reading, choices, answer: word.meaning })
    }
  }
  return { questions }
}
