import type { ReminderRunResult } from '@nihongo/shared/types'

import { pino } from '@nihongo/shared'
import { GAMES_ROUTES, ROUTE_BASE_PATHS } from '@nihongo/shared/constants'
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
import { DEFAULT_DAY_BOUNDARY_HOUR, studyDateFor } from '@nihongo/shared/lib'
import { and, desc, eq, gte, or, sql } from 'drizzle-orm'
import { DateTime } from 'luxon'

import { pushConfigured, sendPush } from '@/lib/push.js'

import { studiedToday } from './progress.service.js'
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
    dayBoundaryHour: r.dayBoundaryHour ?? DEFAULT_DAY_BOUNDARY_HOUR,
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

/**
 * Where a reminder opens. With cards waiting, straight into reviewing them —
 * the plain Study page is new material, so the nudge "12 items are waiting"
 * used to land somewhere the twelve were not. With nothing due, Study is
 * the right place: the message says so.
 */
export function reminderPath(dueItems: number): string {
  return dueItems > 0 ? `${ROUTE_BASE_PATHS.STUDY}?mode=due` : ROUTE_BASE_PATHS.STUDY
}

/**
 * Send one push to every device the learner enabled, keeping the subscription
 * table honest: a success clears the failure count, a gone endpoint is
 * deleted (keeping it would retry forever), anything else counts a failure.
 */
async function pushToUser(userId: string, payload: { title: string, body: string, url: string }): Promise<{ sent: number, failed: number, noSubscription: boolean }> {
  const subs = await db
    .select({
      id: pushSubscriptions.id,
      endpoint: pushSubscriptions.endpoint,
      p256dh: pushSubscriptions.p256dh,
      auth: pushSubscriptions.auth
    })
    .from(pushSubscriptions)
    .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.enabled, true)))

  let sent = 0
  let failed = 0
  for (const sub of subs) {
    const outcome = await sendPush(sub, payload)
    if (outcome.ok) {
      sent++
      await db.update(pushSubscriptions).set({ lastSuccessAt: new Date(), failureCount: 0 }).where(eq(pushSubscriptions.id, sub.id))
    } else if (outcome.gone) {
      failed++
      await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id))
    } else {
      failed++
      await db.update(pushSubscriptions).set({ failureCount: sql`${pushSubscriptions.failureCount} + 1` }).where(eq(pushSubscriptions.id, sub.id))
    }
  }
  return { sent, failed, noSubscription: subs.length === 0 }
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
          url: `${env.FRONTEND_URL.replace(/\/$/, '')}${reminderPath(due.items)}`
        })
        emailed++
      } catch (err) {
        error = err instanceof Error ? err.message : 'Email failed'
      }
    }

    if (c.pushEnabled && !pushConfigured())
      pushNotConfigured++

    if (c.pushEnabled && pushConfigured()) {
      const outcome = await pushToUser(c.userId, {
        title: c.streak > 1 ? `${c.streak}-day streak` : 'Time to study',
        // A cleared queue still gets a nudge, so this cannot assume there is
        // anything due — "0 cards are waiting" is worse than staying silent.
        body: due.items > 0
          ? `${due.items} ${due.items === 1 ? 'item is' : 'items are'} waiting.`
          : 'Reviews all clear. Time to learn something new.',
        url: reminderPath(due.items)
      })
      pushed += outcome.sent
      pushFailed += outcome.failed
      if (outcome.noSubscription)
        pushNoSubscription++
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

/** The evening nudge goes out in this local hour, first quarter. */
const STREAK_RISK_HOUR = 20
/** A streak shorter than this is not worth an evening nudge. */
const STREAK_RISK_MIN = 3
/** Ghost alerts go out on this local weekday (Luxon: 1 = Monday) and hour. */
const GHOST_ALERT_WEEKDAY = 6
const GHOST_ALERT_HOUR = 10
/** Fewer ghosts than this is ordinary forgetting, not something to flag. */
const GHOST_ALERT_MIN = 5

export function emptyRun(): ReminderRunResult {
  return { considered: 0, emailed: 0, pushed: 0, skipped: 0, skippedNotDue: 0, skippedAlreadySent: 0, failed: 0, pushFailed: 0, pushNoSubscription: 0, pushNotConfigured: 0 }
}

/** Claim a nudge's slot before sending; false if it was already sent. */
async function claim(userId: string, kind: string, dedupeKey: string, channel: 'email' | 'push'): Promise<boolean> {
  const [row] = await db
    .insert(notificationLog)
    .values({ userId, channel, kind, dedupeKey })
    .onConflictDoNothing({ target: notificationLog.dedupeKey })
    .returning({ id: notificationLog.id })
  return row !== undefined
}

/**
 * A one-off push about something that just happened — a friend request, a
 * request accepted — to whoever has push reminders on. Claimed on its key
 * first, so a retried request never pushes twice. Never throws: a push that
 * fails must not fail what caused it.
 */
export async function pushEvent(userId: string, kind: string, dedupeKey: string, message: { title: string, body: string, url: string }): Promise<boolean> {
  try {
    if (!pushConfigured())
      return false
    const [prefs] = await db.select({ push: userSettings.reminderPushEnabled }).from(userSettings).where(eq(userSettings.userId, userId)).limit(1)
    if (!prefs?.push || !(await claim(userId, kind, `${dedupeKey}:push`, 'push')))
      return false
    return (await pushToUser(userId, message)).sent > 0
  } catch (err) {
    pino.warn({ err, kind }, '[push] event failed')
    return false
  }
}

/**
 * The two nudges besides the daily reminder, by push and by email — each to
 * whoever has that channel on for reminders:
 *
 * - **streak at risk** — 20:00 local, a streak of 3+ days, nothing studied
 *   today, and no earned freeze that would cover the day anyway. Once a day.
 * - **ghost alert** — Saturday morning, when 5+ cards keep being forgotten.
 *   Once a week; it opens the Due list, where ghosts are marked.
 *
 * Both were named in the schema from the start and never sent.
 */
export async function runNudges(now = new Date()): Promise<ReminderRunResult> {
  const result = emptyRun()
  const canPush = pushConfigured()

  const rows = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      timezone: users.timezone,
      dayBoundaryHour: userSettings.dayBoundaryHour,
      streakRisk: userSettings.streakRiskEnabled,
      ghostAlert: userSettings.ghostAlertEnabled,
      pushEnabled: userSettings.reminderPushEnabled,
      emailEnabled: userSettings.reminderEmailEnabled
    })
    .from(users)
    .innerJoin(userSettings, eq(userSettings.userId, users.id))
    .where(and(
      eq(users.active, true),
      or(eq(userSettings.reminderPushEnabled, true), eq(userSettings.reminderEmailEnabled, true))
    ))

  const site = env.FRONTEND_URL.replace(/\/$/, '')

  /** Send one nudge on every channel the learner has on. Each channel is claimed on its own key. */
  async function send(r: typeof rows[number], kind: string, key: string, message: { title: string, body: string, cta: string, url: string }) {
    if (r.pushEnabled && canPush) {
      if (await claim(r.userId, kind, `${key}:push`, 'push')) {
        const out = await pushToUser(r.userId, { title: message.title, body: message.body, url: message.url })
        result.pushed += out.sent
        result.pushFailed += out.failed
        if (out.noSubscription)
          result.pushNoSubscription++
      } else {
        result.skippedAlreadySent++
      }
    }
    if (r.emailEnabled) {
      if (await claim(r.userId, kind, `${key}:email`, 'email')) {
        try {
          await SendMail.sendNudge({ email: r.email, name: r.name || r.email, title: message.title, body: message.body, cta: message.cta, url: `${site}${message.url}` })
          result.emailed++
        } catch (err) {
          result.failed++
          await db.update(notificationLog)
            .set({ status: 'failed', error: err instanceof Error ? err.message : 'Email failed' })
            .where(eq(notificationLog.dedupeKey, `${key}:email`))
        }
      } else {
        result.skippedAlreadySent++
      }
    }
  }

  for (const r of rows) {
    const local = DateTime.fromJSDate(now, { zone: r.timezone })
    if (!local.isValid)
      continue
    const firstQuarter = local.minute < 15
    const localDate = studyDateFor(now, r.timezone, r.dayBoundaryHour ?? DEFAULT_DAY_BOUNDARY_HOUR)

    if (r.streakRisk && firstQuarter && local.hour === STREAK_RISK_HOUR) {
      result.considered++
      const [streak] = await db
        .select({ languageId: userStreaks.languageId, current: userStreaks.currentStreak, freezes: userStreaks.freezeCount })
        .from(userStreaks)
        .where(eq(userStreaks.userId, r.userId))
        .orderBy(desc(userStreaks.currentStreak))
        .limit(1)
      if (streak && streak.current >= STREAK_RISK_MIN && streak.freezes === 0 && !(await studiedToday(r.userId, streak.languageId, now))) {
        await send(r, 'streak-risk', `${r.userId}:streak-risk:${localDate}`, {
          title: `Keep your ${streak.current}-day streak`,
          body: 'nothing is studied yet today. A few reviews or one Speak session keeps it going.',
          cta: 'Open today',
          url: ROUTE_BASE_PATHS.TODAY
        })
      }
    }

    if (r.ghostAlert && firstQuarter && local.weekday === GHOST_ALERT_WEEKDAY && local.hour === GHOST_ALERT_HOUR) {
      result.considered++
      const [ghosts] = await db
        .select({ n: sql<number>`count(*)`.mapWith(Number) })
        .from(srsCards)
        .where(and(eq(srsCards.userId, r.userId), eq(srsCards.ghost, true), eq(srsCards.suspended, false)))
      const n = ghosts?.n ?? 0
      if (n >= GHOST_ALERT_MIN) {
        const week = `${local.weekYear}-W${local.weekNumber}`
        // To this week's ghost boss: the cards with where they come from and
        // what they get confused with, then a round telling them apart.
        await send(r, 'ghost-alert', `${r.userId}:ghost-alert:${week}`, {
          title: `${n} cards keep slipping away`,
          body: 'this week\'s ghost boss is ready. A close look at them now saves many reviews later.',
          cta: 'Face the ghost boss',
          url: `${ROUTE_BASE_PATHS.GAMES}${GAMES_ROUTES.GHOST_BOSS}`
        })
      }
    }
  }
  result.skipped = result.skippedAlreadySent
  return result
}
