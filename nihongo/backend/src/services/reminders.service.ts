import type { ReminderRunResult } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import {
  notificationLog,
  pushSubscriptions,
  srsDailyStats,
  users,
  userSettings,
  userStreaks
} from '@nihongo/shared/db/schema'
import SendMail from '@nihongo/shared/emails'
import env from '@nihongo/shared/env'
import { studyDateFor } from '@nihongo/shared/lib'
import { and, desc, eq, gte, sql } from 'drizzle-orm'
import { DateTime } from 'luxon'

import { pushConfigured, sendPush } from '@/lib/push.js'

import { countDue } from './srs.service.js'

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
const SUMMARY_KIND = 'weekly-summary'

interface Candidate {
  userId: string
  email: string
  name: string | null
  timezone: string
  dayBoundaryHour: number
  reminderHour: number
  reminderMinute: number
  emailEnabled: boolean
  pushEnabled: boolean
  languageId: string | null
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
      reminderMinute: userSettings.reminderMinute,
      emailEnabled: userSettings.reminderEmailEnabled,
      pushEnabled: userSettings.reminderPushEnabled,
      // Which language to count, resolved in SQL because none of the obvious
      // answers is reliable on its own.
      //
      // Reading `users.active_language_id` alone looked right and was a silent
      // disaster: NOTHING writes that column — `store/language.ts` says as much
      // and defers it — so it is NULL for every account, and a reminder scoped
      // to it counts zero forever. That is worse than the over-counting it
      // replaced: an inflated number is wrong, a permanent "all clear" stops
      // the reminder doing its job at all.
      //
      // So: the chosen language if one is ever set, else the primary language
      // this reader is studying, else the only language the app has. Ordered by
      // id at the end purely so the fallback is deterministic.
      languageId: sql<string | null>`coalesce(
        ${users.activeLanguageId},
        (select ul.language_id from user_languages ul
          where ul.user_id = ${users.id}
          order by ul.is_primary desc, ul.language_id limit 1),
        (select l.id from languages l order by l.id limit 1)
      )`,
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
    reminderMinute: r.reminderMinute ?? 0
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

  // The chosen hour wins. Quiet hours are NOT consulted here, deliberately.
  //
  // They used to be, and the result was a reminder that could never fire: the
  // window defaults to 22:00-07:00, no screen in the app exposes it, and it is
  // not in the preferences the settings page saves — so nobody had chosen it
  // and nobody could change it. Anyone picking a late evening reminder, which
  // is the obvious time to study, was silenced by a rule they never set and
  // could not see.
  //
  // It is also not the phone's Do Not Disturb; the server knows nothing about
  // that. The device already holds a notification quietly when the reader has
  // asked it to, which is the layer that actually knows whether they are
  // asleep. Overriding an explicit choice here only duplicated that badly.
  //
  // The columns are gone entirely (migration 0009); the weekly summary does not
  // consult them either, for the same reason.
  if (local.hour !== candidate.reminderHour)
    return false

  // Match the QUARTER, not the exact minute. The cron fires every fifteen
  // minutes and drifts by seconds; an exact comparison would miss silently,
  // which is the failure mode this whole area keeps producing.
  return Math.floor(local.minute / 15) * 15 === candidate.reminderMinute
}

export async function runReminders(now = new Date()): Promise<ReminderRunResult> {
  const candidates = await findCandidates()
  let emailed = 0
  let pushed = 0
  let skippedNotDue = 0
  let skippedAlreadySent = 0
  let failed = 0
  let pushFailed = 0
  let pushNoSubscription = 0
  let pushNotConfigured = 0

  for (const c of candidates) {
    // Only the CLOCK decides whether to send.
    //
    // This used to also require `dueCount > 0`, which meant the reminder went
    // quiet on exactly the days it was most useful: clear your reviews and the
    // app stopped asking you to come back, so a finished day looked identical
    // to an abandoned one. Study serves material you have never seen, so there
    // is always something to open — the message adapts instead.
    if (!isDue(c, now)) {
      skippedNotDue++
      continue
    }

    // Counted HERE, not in `findCandidates`.
    //
    // It used to be one subquery run for everybody before an unbounded serial
    // loop of SMTP and web-push calls, so by the time a message was composed —
    // let alone read — the number was already old. It also counted every
    // language, every state, and cards on unpublished items, which is why the
    // email could say 26 while no screen in the app agreed.
    //
    // `countDue` is the same definition Study, Progress and the due list use,
    // measured in items, milliseconds before the message goes out.
    const due = c.languageId
      ? await countDue(c.userId, c.languageId, now)
      : { items: 0, cards: 0 }

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
      skippedAlreadySent++
      continue
    }

    const name = c.name || c.email
    let error: string | null = null

    if (c.emailEnabled) {
      try {
        await SendMail.sendStudyReminder({
          email: c.email,
          name,
          dueCount: due.items,
          streak: c.streak,
          url: `${env.FRONTEND_URL.replace(/\/$/, '')}/study`
        })
        emailed++
      } catch (err) {
        error = err instanceof Error ? err.message : 'Email failed'
      }
    }

    if (c.pushEnabled && !pushConfigured())
      pushNotConfigured++

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

      if (subs.length === 0)
        pushNoSubscription++

      for (const sub of subs) {
        const outcome = await sendPush(sub, {
          title: c.streak > 1 ? `${c.streak}-day streak` : 'Time to study',
          // A cleared queue still gets a nudge, so this cannot assume there is
          // anything due — "0 cards are waiting" is worse than staying silent.
          body: due.items > 0
            ? `${due.items} ${due.items === 1 ? 'item is' : 'items are'} waiting.`
            : 'Reviews all clear — time to learn something new.',
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
          pushFailed++
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id))
        } else {
          pushFailed++
          await db
            .update(pushSubscriptions)
            .set({ failureCount: sql`${pushSubscriptions.failureCount} + 1` })
            .where(eq(pushSubscriptions.id, sub.id))
        }
      }
    }

    if (error) {
      failed++
      await db
        .update(notificationLog)
        .set({ status: 'failed', error })
        .where(eq(notificationLog.dedupeKey, dedupeKey))
    }
  }

  return {
    considered: candidates.length,
    emailed,
    pushed,
    // Kept as the total so existing readers of the log still make sense.
    skipped: skippedNotDue + skippedAlreadySent,
    skippedNotDue,
    skippedAlreadySent,
    failed,
    pushFailed,
    pushNoSubscription,
    pushNotConfigured
  }
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
      enabled: userSettings.weeklySummaryEnabled
    })
    .from(users)
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    .where(eq(userSettings.weeklySummaryEnabled, true))

  let considered = 0
  let emailed = 0
  let skippedNotDue = 0
  let skippedAlreadySent = 0
  let failed = 0

  for (const c of candidates) {
    considered++
    const local = DateTime.fromJSDate(now, { zone: c.timezone ?? 'UTC' })
    // Sunday evening in THEIR week, not the server's.
    const isSendTime = local.isValid && local.weekday === 7 && local.hour === 18
    // No quiet-hours gate here either, for the same reason as the daily
    // reminder: nothing in the app sets that window, so every account carries
    // a 22:00-07:00 default nobody chose and nobody can change. Leaving it on
    // the weekly summary would have kept exactly the bug that was just removed
    // from the reminder — silence, from a rule the reader never saw.
    if (!isSendTime) {
      skippedNotDue++
      continue
    }

    // Claim the week BEFORE sending.
    //
    // The comment above this function has always said idempotency came from
    // "the same dedupe key scheme the daily reminder uses". It did not: there
    // was no claim here at all. The send window is a whole hour and the cron
    // ticks every fifteen minutes, so every Sunday sent the summary FOUR times.
    // Keyed on the local ISO week, so a reader who crosses a timezone still
    // gets one.
    const dedupeKey = `${c.userId}:${SUMMARY_KIND}:${local.weekYear}-W${local.weekNumber}`
    const [claimed] = await db
      .insert(notificationLog)
      .values({ userId: c.userId, channel: 'email', kind: SUMMARY_KIND, dedupeKey })
      .onConflictDoNothing({ target: notificationLog.dedupeKey })
      .returning({ id: notificationLog.id })

    if (!claimed) {
      skippedAlreadySent++
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
      // A send that was attempted and rejected is a FAILURE, not a skip. Filing
      // it under `skipped` is how a broken mail provider read in the log as a
      // quiet week.
      failed++
    }
  }

  return {
    considered,
    emailed,
    pushed: 0,
    skipped: skippedNotDue + skippedAlreadySent,
    skippedNotDue,
    skippedAlreadySent,
    failed,
    pushFailed: 0,
    pushNoSubscription: 0,
    pushNotConfigured: 0
  }
}
