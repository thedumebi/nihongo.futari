import type { ActivityCounts, AddFriendInput, FriendRequestView, FriendSettings, FriendsResponse, FriendView, ReminderRunResult, UpdateFriendSettingsInput } from '@nihongo/shared/types'

import { pino } from '@nihongo/shared'
import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'
import db from '@nihongo/shared/db'
import { crosswordResults, friendBoardSnapshots, friendProfiles, friendships, languageLevels, users, userSettings, xpEvents } from '@nihongo/shared/db/schema'
import { activityCounts, boardNudge, daysBetween, daysThisWeek, DEFAULT_DAY_BOUNDARY_HOUR, friendCodeFrom, normaliseFriendCode, pairStreak, rankBoard, studyDateFor, studyDayRange, uuidv7 } from '@nihongo/shared/lib'
import { and, count, eq, gte, inArray, lt, or, sql, sum } from 'drizzle-orm'
import { DateTime } from 'luxon'
import { randomBytes } from 'node:crypto'

import { emptyRun, pushEvent } from './reminders.service.js'

/**
 * Friends: opt-in, connected by code, sharing only what each person switched
 * on. Every read here is scoped to the caller's own friendships — a profile
 * is never readable just because its code is known, beyond the display name
 * shown when a request is sent.
 */

/** How far back study days are read: enough for any pair streak worth showing. */
const HISTORY_DAYS = 400

export type FriendError = 'not-enabled' | 'no-such-code' | 'self' | 'not-found'

const DISABLED: FriendSettings = {
  enabled: false,
  displayName: null,
  code: null,
  shareStudiedToday: false,
  shareCrossword: false,
  shareWeekly: false,
  shareActivity: false,
  notifyBoard: false
}

function toSettings(p: typeof friendProfiles.$inferSelect | undefined): FriendSettings {
  if (!p)
    return DISABLED
  return {
    enabled: true,
    displayName: p.displayName,
    code: p.code,
    shareStudiedToday: p.shareStudiedToday,
    shareCrossword: p.shareCrossword,
    shareWeekly: p.shareWeekly,
    shareActivity: p.shareActivity,
    notifyBoard: p.notifyBoard
  }
}

async function profileOf(userId: string) {
  const [p] = await db.select().from(friendProfiles).where(eq(friendProfiles.userId, userId)).limit(1)
  return p
}

function newCode(): string {
  return friendCodeFrom(randomBytes(8))
}

export async function getFriendSettings(userId: string): Promise<FriendSettings> {
  return toSettings(await profileOf(userId))
}

/**
 * Turn friends on or off, rename, or change what is shared. Turning off
 * deletes the profile, and every friendship goes with it.
 */
export async function updateFriendSettings(userId: string, input: UpdateFriendSettingsInput): Promise<FriendSettings> {
  if (input.enabled === false) {
    await db.delete(friendProfiles).where(eq(friendProfiles.userId, userId))
    return DISABLED
  }
  const existing = await profileOf(userId)
  if (!existing && !input.enabled)
    return DISABLED

  const changes = {
    ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
    ...(input.shareStudiedToday !== undefined ? { shareStudiedToday: input.shareStudiedToday } : {}),
    ...(input.shareCrossword !== undefined ? { shareCrossword: input.shareCrossword } : {}),
    ...(input.shareWeekly !== undefined ? { shareWeekly: input.shareWeekly } : {}),
    ...(input.shareActivity !== undefined ? { shareActivity: input.shareActivity } : {}),
    ...(input.notifyBoard !== undefined ? { notifyBoard: input.notifyBoard } : {})
  }

  if (existing) {
    if (Object.keys(changes).length === 0)
      return toSettings(existing)
    const [row] = await db.update(friendProfiles).set({ ...changes, updatedAt: new Date() }).where(eq(friendProfiles.userId, userId)).returning()
    return toSettings(row)
  }

  // A new profile: the first name as a starting display name, every share off.
  const [user] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1)
  const firstName = (user?.name ?? '').trim().split(/\s+/)[0] || 'Learner'
  for (let attempt = 0; attempt < 5; attempt++) {
    const [row] = await db.insert(friendProfiles)
      .values({ userId, displayName: firstName, code: newCode(), ...changes })
      .onConflictDoNothing()
      .returning()
    if (row)
      return toSettings(row)
    // Either the profile appeared meanwhile (another tab) or the code collided.
    const now = await profileOf(userId)
    if (now)
      return toSettings(now)
  }
  throw new Error('Could not allocate a friend code')
}

/** A fresh code; links and codes given out before stop working. */
export async function rotateFriendCode(userId: string): Promise<FriendSettings | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const [row] = await db.update(friendProfiles).set({ code: newCode(), updatedAt: new Date() }).where(eq(friendProfiles.userId, userId)).returning()
      return row ? toSettings(row) : null
    } catch {
      // Code collision: try another.
    }
  }
  throw new Error('Could not allocate a friend code')
}

/**
 * Ask to be friends by code. If they had already asked you, this accepts.
 * Asking twice is a no-op.
 */
export async function addFriend(userId: string, input: AddFriendInput): Promise<{ ok: true, displayName: string, status: 'pending' | 'accepted' } | { ok: false, error: FriendError }> {
  const me = await profileOf(userId)
  if (!me)
    return { ok: false, error: 'not-enabled' }
  const [them] = await db.select().from(friendProfiles).where(eq(friendProfiles.code, normaliseFriendCode(input.code))).limit(1)
  if (!them)
    return { ok: false, error: 'no-such-code' }
  if (them.userId === userId)
    return { ok: false, error: 'self' }

  const [existing] = await db.select().from(friendships).where(or(
    and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, them.userId)),
    and(eq(friendships.requesterId, them.userId), eq(friendships.addresseeId, userId))
  )).limit(1)

  if (existing) {
    if (existing.status === 'pending' && existing.addresseeId === userId) {
      await db.update(friendships).set({ status: 'accepted', acceptedAt: new Date(), updatedAt: new Date() }).where(eq(friendships.id, existing.id))
      void notifyAccepted(existing.id, them.userId, me.displayName)
      return { ok: true, displayName: them.displayName, status: 'accepted' }
    }
    return { ok: true, displayName: them.displayName, status: existing.status as 'pending' | 'accepted' }
  }

  const [created] = await db.insert(friendships).values({ id: uuidv7(), requesterId: userId, addresseeId: them.userId }).onConflictDoNothing().returning({ id: friendships.id })
  if (created) {
    void pushEvent(them.userId, 'friend-request', `friend-request:${created.id}`, {
      title: `${me.displayName} wants to be friends`,
      body: 'Open Friends to accept.',
      url: ROUTE_BASE_PATHS.FRIENDS
    })
  }
  return { ok: true, displayName: them.displayName, status: 'pending' }
}

/** Tell whoever asked that their request was accepted. */
function notifyAccepted(friendshipId: string, requesterId: string, accepterName: string) {
  return pushEvent(requesterId, 'friend-accepted', `friend-accepted:${friendshipId}`, {
    title: `${accepterName} accepted your friend request`,
    body: 'See how you are both doing in Friends.',
    url: ROUTE_BASE_PATHS.FRIENDS
  })
}

/** Requests waiting for this person to accept — the count the menu shows. */
export async function pendingRequestCount(userId: string): Promise<number> {
  const [row] = await db.select({ n: count() }).from(friendships).where(and(eq(friendships.addresseeId, userId), eq(friendships.status, 'pending')))
  return row?.n ?? 0
}

/** Accept a request sent to you. */
export async function acceptFriend(userId: string, id: string): Promise<boolean> {
  const rows = await db.update(friendships)
    .set({ status: 'accepted', acceptedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(friendships.id, id), eq(friendships.addresseeId, userId), eq(friendships.status, 'pending')))
    .returning({ id: friendships.id, requesterId: friendships.requesterId })
  const [accepted] = rows
  if (accepted) {
    const me = await profileOf(userId)
    void notifyAccepted(accepted.id, accepted.requesterId, me?.displayName ?? 'A friend')
  }
  return rows.length > 0
}

/** Decline a request, cancel your own, or unfriend — whichever side you are on. */
export async function removeFriend(userId: string, id: string): Promise<boolean> {
  const rows = await db.delete(friendships)
    .where(and(eq(friendships.id, id), or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId))))
    .returning({ id: friendships.id })
  return rows.length > 0
}

/** Every study day (any language) for each user, as local dates. */
async function studyDaysFor(userIds: string[]): Promise<Map<string, string[]>> {
  const out = new Map<string, string[]>(userIds.map(id => [id, []]))
  if (userIds.length === 0)
    return out
  const rows = await db.execute<{ user_id: string, local_date: string }>(sql`
    select user_id, local_date::text as local_date from srs_daily_stats
    where user_id in ${userIds} and review_count > 0 and local_date >= current_date - ${HISTORY_DAYS}::int
    union
    select user_id, local_date::text from learning_activities
    where user_id in ${userIds} and local_date >= current_date - ${HISTORY_DAYS}::int
  `)
  for (const r of rows.rows)
    out.get(r.user_id)?.push(r.local_date)
  return out
}

interface Week {
  today: ActivityCounts
  week: ActivityCounts
  xp: number
}

/**
 * Each person's last seven study days, today included, in their own day: what
 * they studied, as counts, and the XP they earned.
 */
async function weeksFor(people: Array<{ userId: string, today: string, timezone: string, boundary: number }>): Promise<Map<string, Week>> {
  const out = new Map<string, Week>()
  if (people.length === 0)
    return out
  const ids = people.map(p => p.userId)
  // Eight calendar days back covers every timezone's seven study days.
  const [stats, acts] = await Promise.all([
    db.execute<{ user_id: string, local_date: string, reviews: number, new_words: number }>(sql`
      select user_id, local_date::text as local_date, sum(review_count)::int as reviews, sum(new_count)::int as new_words
      from srs_daily_stats
      where user_id in ${ids} and local_date >= current_date - 8
      group by 1, 2`),
    db.execute<{ user_id: string, local_date: string, kind: string, n: number }>(sql`
      select user_id, local_date::text as local_date, kind, count(*)::int as n
      from learning_activities
      where user_id in ${ids} and local_date >= current_date - 8
      group by 1, 2, 3`)
  ])
  for (const p of people) {
    const inWeek = (d: string) => {
      const ago = daysBetween(d, p.today)
      return ago >= 0 && ago < 7
    }
    const mineStats = stats.rows.filter(r => r.user_id === p.userId)
    const mineActs = acts.rows.filter(r => r.user_id === p.userId)
    const toStats = (rows: typeof mineStats) => rows.map(r => ({ reviews: r.reviews, newWords: r.new_words }))
    const toActs = (rows: typeof mineActs) => rows.map(r => ({ kind: r.kind, count: r.n }))
    const weekStart = DateTime.fromISO(p.today).minus({ days: 6 }).toISODate() ?? p.today
    const { start } = studyDayRange(weekStart, p.timezone, p.boundary)
    const [xp] = await db.select({ n: sum(xpEvents.amount).mapWith(Number) }).from(xpEvents).where(and(eq(xpEvents.userId, p.userId), gte(xpEvents.createdAt, start)))
    out.set(p.userId, {
      today: activityCounts(toStats(mineStats.filter(r => r.local_date === p.today)), toActs(mineActs.filter(r => r.local_date === p.today))),
      week: activityCounts(toStats(mineStats.filter(r => inWeek(r.local_date))), toActs(mineActs.filter(r => inWeek(r.local_date)))),
      xp: xp?.n ?? 0
    })
  }
  return out
}

export async function listFriends(userId: string): Promise<FriendsResponse> {
  const me = await profileOf(userId)
  if (!me)
    return { settings: DISABLED, friends: [], requests: [], board: [] }

  const rows = await db
    .select({
      id: friendships.id,
      status: friendships.status,
      requesterId: friendships.requesterId,
      addresseeId: friendships.addresseeId
    })
    .from(friendships)
    .where(or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)))

  const otherIds = rows.map(r => r.requesterId === userId ? r.addresseeId : r.requesterId)
  const profiles = otherIds.length === 0
    ? []
    : await db
        .select({
          userId: friendProfiles.userId,
          displayName: friendProfiles.displayName,
          shareStudiedToday: friendProfiles.shareStudiedToday,
          shareCrossword: friendProfiles.shareCrossword,
          shareWeekly: friendProfiles.shareWeekly,
          shareActivity: friendProfiles.shareActivity,
          timezone: users.timezone,
          dayBoundaryHour: userSettings.dayBoundaryHour
        })
        .from(friendProfiles)
        .innerJoin(users, eq(users.id, friendProfiles.userId))
        .leftJoin(userSettings, eq(userSettings.userId, friendProfiles.userId))
        .where(inArray(friendProfiles.userId, otherIds))
  const profileById = new Map(profiles.map(p => [p.userId, p]))

  const requests: FriendRequestView[] = rows
    .filter(r => r.status === 'pending')
    .flatMap((r) => {
      const other = profileById.get(r.requesterId === userId ? r.addresseeId : r.requesterId)
      return other ? [{ id: r.id, displayName: other.displayName, direction: r.addresseeId === userId ? 'incoming' as const : 'outgoing' as const }] : []
    })

  const accepted = rows.filter(r => r.status === 'accepted')
  const acceptedIds = accepted.map(r => r.requesterId === userId ? r.addresseeId : r.requesterId)

  const [meUser] = await db
    .select({ timezone: users.timezone, dayBoundaryHour: userSettings.dayBoundaryHour })
    .from(users)
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1)
  const now = new Date()
  const myToday = studyDateFor(now, meUser?.timezone ?? 'UTC', meUser?.dayBoundaryHour ?? DEFAULT_DAY_BOUNDARY_HOUR)
  const days = await studyDaysFor([userId, ...acceptedIds])
  const myDays = days.get(userId) ?? []

  // Weekly counts and XP, for you and for each friend who shares either.
  const weeks = await weeksFor([
    { userId, today: myToday, timezone: meUser?.timezone ?? 'UTC', boundary: meUser?.dayBoundaryHour ?? DEFAULT_DAY_BOUNDARY_HOUR },
    ...acceptedIds.flatMap((id) => {
      const p = profileById.get(id)
      if (!p || !(p.shareWeekly || p.shareActivity))
        return []
      const timezone = p.timezone ?? 'UTC'
      const boundary = p.dayBoundaryHour ?? DEFAULT_DAY_BOUNDARY_HOUR
      return [{ userId: id, today: studyDateFor(now, timezone, boundary), timezone, boundary }]
    })
  ])

  const friends: FriendView[] = []
  for (const r of accepted) {
    const otherId = r.requesterId === userId ? r.addresseeId : r.requesterId
    const p = profileById.get(otherId)
    if (!p)
      continue
    const tz = p.timezone ?? 'UTC'
    const boundary = p.dayBoundaryHour ?? DEFAULT_DAY_BOUNDARY_HOUR
    const theirToday = studyDateFor(now, tz, boundary)
    const theirDays = days.get(otherId) ?? []

    let crossword: FriendView['crossword'] = null
    if (p.shareCrossword) {
      const { start, end } = studyDayRange(theirToday, tz, boundary)
      const [best] = await db
        .select({ level: languageLevels.code, seconds: crosswordResults.bestSeconds })
        .from(crosswordResults)
        .innerJoin(languageLevels, eq(languageLevels.id, crosswordResults.levelId))
        .where(and(
          eq(crosswordResults.userId, otherId),
          eq(crosswordResults.source, 'daily'),
          gte(crosswordResults.completedAt, start),
          lt(crosswordResults.completedAt, end)
        ))
        .orderBy(crosswordResults.bestSeconds)
        .limit(1)
      crossword = best ?? null
    }

    friends.push({
      id: r.id,
      displayName: p.displayName,
      studiedToday: p.shareStudiedToday ? theirDays.includes(theirToday) : null,
      pairStreak: p.shareStudiedToday && me.shareStudiedToday ? pairStreak(myDays, theirDays, myToday) : null,
      crossword,
      weekDays: p.shareWeekly ? daysThisWeek(theirDays, theirToday) : null,
      weekXp: p.shareWeekly ? weeks.get(otherId)?.xp ?? 0 : null,
      activity: p.shareActivity ? { today: weeks.get(otherId)!.today, week: weeks.get(otherId)!.week } : null
    })
  }

  // Ranked by days studied — showing up is the point — and ties by XP.
  const board = rankBoard([
    { displayName: me.displayName, days: daysThisWeek(myDays, myToday), xp: weeks.get(userId)?.xp ?? 0, isMe: true },
    ...friends.flatMap(f => f.weekDays === null ? [] : [{ displayName: f.displayName, days: f.weekDays, xp: f.weekXp ?? 0, isMe: false }])
  ])

  return { settings: toSettings(me), friends: friends.sort((a, b) => a.displayName.localeCompare(b.displayName)), requests, board }
}

/** Board nudges wait for daytime: between these local hours, or until the next. */
const BOARD_NUDGE_FROM = 8
const BOARD_NUDGE_UNTIL = 21

/**
 * The weekly board, checked on the reminders cron: a push when a friend has
 * just passed you, or has come up close behind. Compares each pair against
 * the snapshot from the last check, and only counts a friend's OWN progress
 * (see boardNudge). At night nothing is sent and the snapshot is left as it
 * was, so the news arrives in the morning instead of being lost.
 */
export async function runBoardNudges(now = new Date()): Promise<ReminderRunResult> {
  const result = emptyRun()
  const pairs = await db
    .select({ a: friendships.requesterId, b: friendships.addresseeId })
    .from(friendships)
    .where(eq(friendships.status, 'accepted'))
  if (pairs.length === 0)
    return result

  const ids = [...new Set(pairs.flatMap(p => [p.a, p.b]))]
  const people = await db
    .select({
      userId: friendProfiles.userId,
      displayName: friendProfiles.displayName,
      shareWeekly: friendProfiles.shareWeekly,
      notifyBoard: friendProfiles.notifyBoard,
      timezone: users.timezone,
      dayBoundaryHour: userSettings.dayBoundaryHour
    })
    .from(friendProfiles)
    .innerJoin(users, eq(users.id, friendProfiles.userId))
    .leftJoin(userSettings, eq(userSettings.userId, friendProfiles.userId))
    .where(inArray(friendProfiles.userId, ids))
  const byId = new Map(people.map(p => [p.userId, { ...p, timezone: p.timezone ?? 'UTC', boundary: p.dayBoundaryHour ?? DEFAULT_DAY_BOUNDARY_HOUR }]))
  const todays = new Map(people.map(p => [p.userId, studyDateFor(now, p.timezone ?? 'UTC', p.dayBoundaryHour ?? DEFAULT_DAY_BOUNDARY_HOUR)]))

  const [days, weeks, snapshots] = await Promise.all([
    studyDaysFor(ids),
    weeksFor([...byId.values()].map(p => ({ userId: p.userId, today: todays.get(p.userId)!, timezone: p.timezone, boundary: p.boundary }))),
    db.select().from(friendBoardSnapshots).where(inArray(friendBoardSnapshots.userId, ids))
  ])
  const scoreOf = (id: string) => ({ days: daysThisWeek(days.get(id) ?? [], todays.get(id)!), xp: weeks.get(id)?.xp ?? 0 })
  const before = new Map(snapshots.map(s => [`${s.userId}:${s.friendId}`, { me: { days: s.myDays, xp: s.myXp }, friend: { days: s.friendDays, xp: s.friendXp } }]))

  for (const { a, b } of pairs) {
    for (const [meId, friendId] of [[a, b], [b, a]] as const) {
      const me = byId.get(meId)
      const friend = byId.get(friendId)
      // You only see a friend on the board if they share their week.
      if (!me || !friend || !friend.shareWeekly)
        continue
      result.considered++
      const current = { me: scoreOf(meId), friend: scoreOf(friendId) }
      const nudge = me.notifyBoard ? boardNudge(before.get(`${meId}:${friendId}`) ?? null, current) : null

      if (nudge) {
        pino.info({ userId: meId, friendId, nudge, ...current }, '[board] nudge')
        const hour = DateTime.fromJSDate(now, { zone: me.timezone }).hour
        if (hour < BOARD_NUDGE_FROM || hour >= BOARD_NUDGE_UNTIL) {
          result.skipped++
          continue
        }
        const sent = nudge === 'passed'
          ? await pushEvent(meId, 'board-passed', `board-passed:${meId}:${friendId}:${current.friend.days}:${current.friend.xp}`, {
              title: `${friend.displayName} just passed you`,
              body: `This week: ${friend.displayName} ${current.friend.days}/7 days, ${current.friend.xp} XP. You: ${current.me.days}/7, ${current.me.xp} XP.`,
              url: ROUTE_BASE_PATHS.FRIENDS
            })
          : await pushEvent(meId, 'board-close', `board-close:${meId}:${friendId}:${todays.get(meId)}`, {
              title: `${friend.displayName} is close behind you`,
              body: `${current.me.xp - current.friend.xp} XP behind you on this week's board. A few reviews keeps you ahead.`,
              url: ROUTE_BASE_PATHS.FRIENDS
            })
        if (sent)
          result.pushed++
      }

      await db.insert(friendBoardSnapshots)
        .values({ userId: meId, friendId, myDays: current.me.days, myXp: current.me.xp, friendDays: current.friend.days, friendXp: current.friend.xp })
        .onConflictDoUpdate({
          target: [friendBoardSnapshots.userId, friendBoardSnapshots.friendId],
          set: { myDays: current.me.days, myXp: current.me.xp, friendDays: current.friend.days, friendXp: current.friend.xp, updatedAt: now }
        })
    }
  }
  return result
}
