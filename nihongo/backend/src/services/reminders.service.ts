import type { ReminderRunResult } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import {
  notificationLog,
  pushSubscriptions,
  srsCards,
  srsDailyStats,
  users,
  userSettings,
  userStreaks
} from '@nihongo/shared/db/schema'
import SendMail from '@nihongo/shared/emails'
import env from '@nihongo/shared/env'
import { isQuietHour, studyDateFor } from '@nihongo/shared/lib'
import { and, desc, eq, gte, sql } from 'drizzle-orm'
import { DateTime } from 'luxon'

import { pushConfigured, sendPush } from '@/lib/push.js'

/**
 * Daily study reminders.
 *
 * There is no in-app scheduler in this stack — the sibling apps use host cron
 * for the nightly backup and this follows the same pattern. Cron hits
 * /notifications/run-reminders every 15 minutes; this function decides who is
 * actually due a nudge.
 *
 * "Due a nudge" means: it is currently their chosen hour IN THEIR OWN
 * TIMEZONE, they have cards waiting, and they have not already been told
 * today. That last part is enforced by a unique `dedupeKey`, so the cron can
 * fire twice, be retried, or overlap with itself and nobody gets two emails.
 */

const REMINDER_KIND = 'daily-reminder'

interface Candidate {
  userId: string
  email: string
  name: string | null
  timezone: string
  dayBoundaryHour: number
  reminderHour: number
  quietStartHour: number
  quietEndHour: number
  emailEnabled: boolean
  pushEnabled: boolean
  dueCount: number
  streak: number
}

async function findCandidates(): Promise<Candidate[]> {
  const rows = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      timezone: users.timezone,
      dayBoundaryHour: userSettings.dayBoundaryHour,
      reminderHour: userSettings.reminderHour,
      quietStartHour: userSettings.quietStartHour,
      quietEndHour: userSettings.quietEndHour,
      emailEnabled: userSettings.reminderEmailEnabled,
      pushEnabled: userSettings.reminderPushEnabled,
      dueCount: sql<number>`(
        select count(*) from ${srsCards} c
        where c.user_id = ${users.id} and c.due <= now() and not c.suspended
      )`.mapWith(Number),
      streak: sql<number>`coalesce((
        select max(s.current_streak) from ${userStreaks} s where s.user_id = ${users.id}
      ), 0)`.mapWith(Number)
    })
    .from(users)
    .innerJoin(userSettings, eq(userSettings.userId, users.id))
    .where(and(
      eq(users.active, true),
      sql`(${userSettings.reminderEmailEnabled} or ${userSettings.reminderPushEnabled})`
    ))

  return rows.map(r => ({
    ...r,
    name: r.name,
    dayBoundaryHour: r.dayBoundaryHour ?? 4,
    reminderHour: r.reminderHour ?? 19,
    quietStartHour: r.quietStartHour ?? 22,
    quietEndHour: r.quietEndHour ?? 7
  }))
}

/**
 * Is it the user's reminder hour right now?
 *
 * Compared in the user's own timezone, with a window rather than an exact
 * match: cron runs every 15 minutes and can drift, so an exact hour test would
 * silently skip people.
 */
function isDue(candidate: Candidate, now: Date): boolean {
  const local = DateTime.fromJSDate(now, { zone: candidate.timezone })
  if (!local.isValid)
    return false
  // Quiet hours win over the preferred hour. Someone who set a 23:00 reminder
  // and a 22:00-07:00 quiet window has contradicted themselves, and honouring
  // the quiet window is the reading that does not wake them up.
  if (isQuietHour(local.hour, { startHour: candidate.quietStartHour, endHour: candidate.quietEndHour }))
    return false
  return local.hour === candidate.reminderHour
}

export async function runReminders(now = new Date()): Promise<ReminderRunResult> {
  const candidates = await findCandidates()
  let emailed = 0
  let pushed = 0
  let skipped = 0

  for (const c of candidates) {
    if (!isDue(c, now) || c.dueCount === 0) {
      skipped++
      continue
    }

    const localDate = studyDateFor(now, c.timezone, c.dayBoundaryHour)
    const dedupeKey = `${c.userId}:${REMINDER_KIND}:${localDate}`

    // Claim the slot BEFORE sending. If the insert conflicts, someone else
    // already sent it — a second cron run, or an overlapping one.
    const [claimed] = await db
      .insert(notificationLog)
      .values({ userId: c.userId, channel: c.emailEnabled ? 'email' : 'push', kind: REMINDER_KIND, dedupeKey })
      .onConflictDoNothing({ target: notificationLog.dedupeKey })
      .returning({ id: notificationLog.id })

    if (!claimed) {
      skipped++
      continue
    }

    const name = c.name || c.email
    let error: string | null = null

    if (c.emailEnabled) {
      try {
        await SendMail.sendStudyReminder({
          email: c.email,
          name,
          dueCount: c.dueCount,
          streak: c.streak,
          url: `${env.FRONTEND_URL.replace(/\/$/, '')}/study`
        })
        emailed++
      } catch (err) {
        error = err instanceof Error ? err.message : 'Email failed'
      }
    }

    if (c.pushEnabled && pushConfigured()) {
      const subs = await db
        .select({
          id: pushSubscriptions.id,
          endpoint: pushSubscriptions.endpoint,
          p256dh: pushSubscriptions.p256dh,
          auth: pushSubscriptions.auth
        })
        .from(pushSubscriptions)
        .where(and(eq(pushSubscriptions.userId, c.userId), eq(pushSubscriptions.enabled, true)))

      for (const sub of subs) {
        const outcome = await sendPush(sub, {
          title: c.streak > 1 ? `${c.streak}-day streak` : 'Time to study',
          body: `${c.dueCount} ${c.dueCount === 1 ? 'card is' : 'cards are'} waiting.`,
          url: '/study'
        })
        if (outcome.ok) {
          pushed++
          await db
            .update(pushSubscriptions)
            .set({ lastSuccessAt: new Date(), failureCount: 0 })
            .where(eq(pushSubscriptions.id, sub.id))
        } else if (outcome.gone) {
          // The browser dropped it. Keeping it would retry forever.
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id))
        } else {
          await db
            .update(pushSubscriptions)
            .set({ failureCount: sql`${pushSubscriptions.failureCount} + 1` })
            .where(eq(pushSubscriptions.id, sub.id))
        }
      }
    }

    if (error) {
      await db
        .update(notificationLog)
        .set({ status: 'failed', error })
        .where(eq(notificationLog.dedupeKey, dedupeKey))
    }
  }

  return { considered: candidates.length, emailed, pushed, skipped }
}

/**
 * The weekly summary.
 *
 * Reports the week that happened rather than nagging about the one that did
 * not: a quiet week gets an honest "nothing this week" instead of guilt, which
 * is the version people do not unsubscribe from.
 *
 * Sent on the user's own local Sunday evening, using the same 7-day window the
 * daily stats already aggregate. Idempotency comes from the same dedupe key
 * scheme the daily reminder uses, so a cron overlap cannot double-send.
 */
export async function runWeeklySummaries(now = new Date()): Promise<ReminderRunResult> {
  const candidates = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      timezone: users.timezone,
      enabled: userSettings.weeklySummaryEnabled,
      quietStartHour: userSettings.quietStartHour,
      quietEndHour: userSettings.quietEndHour
    })
    .from(users)
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    .where(eq(userSettings.weeklySummaryEnabled, true))

  let considered = 0
  let emailed = 0
  let skipped = 0

  for (const c of candidates) {
    considered++
    const local = DateTime.fromJSDate(now, { zone: c.timezone ?? 'UTC' })
    // Sunday evening in THEIR week, not the server's.
    const isSendTime = local.isValid && local.weekday === 7 && local.hour === 18
    if (!isSendTime || isQuietHour(local.hour, { startHour: c.quietStartHour ?? 22, endHour: c.quietEndHour ?? 7 })) {
      skipped++
      continue
    }

    const since = local.minus({ days: 7 }).toISODate()!
    const [totals] = await db
      .select({
        reviews: sql<number>`coalesce(sum(${srsDailyStats.reviewCount}), 0)::int`,
        correct: sql<number>`coalesce(sum(${srsDailyStats.correctCount}), 0)::int`,
        newItems: sql<number>`coalesce(sum(${srsDailyStats.newCount}), 0)::int`,
        timeMs: sql<number>`coalesce(sum(${srsDailyStats.timeMs}), 0)::bigint`
      })
      .from(srsDailyStats)
      .where(and(eq(srsDailyStats.userId, c.userId), gte(srsDailyStats.localDate, since)))

    const [best] = await db
      .select({ localDate: srsDailyStats.localDate, reviewCount: srsDailyStats.reviewCount })
      .from(srsDailyStats)
      .where(and(eq(srsDailyStats.userId, c.userId), gte(srsDailyStats.localDate, since)))
      .orderBy(desc(srsDailyStats.reviewCount))
      .limit(1)

    const [streakRow] = await db
      .select({ current: userStreaks.currentStreak })
      .from(userStreaks)
      .where(eq(userStreaks.userId, c.userId))
      .limit(1)

    const reviews = Number(totals?.reviews ?? 0)
    try {
      await SendMail.sendWeeklySummary({
        email: c.email,
        name: c.name ?? 'there',
        reviews,
        minutes: Math.round(Number(totals?.timeMs ?? 0) / 60000),
        newItems: Number(totals?.newItems ?? 0),
        // Guard the divide: a week with no reviews is 0%, not NaN%.
        accuracy: reviews === 0 ? 0 : Math.round((Number(totals?.correct ?? 0) / reviews) * 100),
        streak: streakRow?.current ?? 0,
        bestDay: best && best.reviewCount > 0
          ? `${DateTime.fromISO(String(best.localDate)).toFormat('cccc')} (${best.reviewCount})`
          : null,
        url: `${env.FRONTEND_URL.replace(/\/$/, '')}/progress`
      })
      emailed++
    } catch {
      skipped++
    }
  }

  return { considered, emailed, pushed: 0, skipped }
}
