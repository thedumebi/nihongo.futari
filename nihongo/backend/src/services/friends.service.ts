import type { AddFriendInput, FriendRequestView, FriendSettings, FriendsResponse, FriendView, UpdateFriendSettingsInput } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { crosswordResults, friendProfiles, friendships, languageLevels, users, userSettings } from '@nihongo/shared/db/schema'
import { daysThisWeek, DEFAULT_DAY_BOUNDARY_HOUR, friendCodeFrom, normaliseFriendCode, pairStreak, studyDateFor, studyDayRange, uuidv7 } from '@nihongo/shared/lib'
import { and, eq, gte, inArray, lt, or, sql } from 'drizzle-orm'
import { randomBytes } from 'node:crypto'

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
  shareWeekly: false
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
    shareWeekly: p.shareWeekly
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
    ...(input.shareWeekly !== undefined ? { shareWeekly: input.shareWeekly } : {})
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
      return { ok: true, displayName: them.displayName, status: 'accepted' }
    }
    return { ok: true, displayName: them.displayName, status: existing.status as 'pending' | 'accepted' }
  }

  await db.insert(friendships).values({ id: uuidv7(), requesterId: userId, addresseeId: them.userId }).onConflictDoNothing()
  return { ok: true, displayName: them.displayName, status: 'pending' }
}

/** Accept a request sent to you. */
export async function acceptFriend(userId: string, id: string): Promise<boolean> {
  const rows = await db.update(friendships)
    .set({ status: 'accepted', acceptedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(friendships.id, id), eq(friendships.addresseeId, userId), eq(friendships.status, 'pending')))
    .returning({ id: friendships.id })
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
      weekDays: p.shareWeekly ? daysThisWeek(theirDays, theirToday) : null
    })
  }

  // The weekly board ranks by days studied, never XP: showing up is the point.
  const board = [
    { displayName: me.displayName, days: daysThisWeek(myDays, myToday), isMe: true },
    ...friends.flatMap(f => f.weekDays === null ? [] : [{ displayName: f.displayName, days: f.weekDays, isMe: false }])
  ].sort((a, b) => b.days - a.days || Number(b.isMe) - Number(a.isMe))

  return { settings: toSettings(me), friends: friends.sort((a, b) => a.displayName.localeCompare(b.displayName)), requests, board }
}
