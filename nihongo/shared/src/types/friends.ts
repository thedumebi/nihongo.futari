import { z } from '@hono/zod-openapi'

import type { friendProfiles, friendships } from '@/db/schema/friends.js'

export type FriendProfile = typeof friendProfiles.$inferSelect
export type Friendship = typeof friendships.$inferSelect

/** Your own friends settings. `enabled` false means no profile exists at all. */
export const friendSettingsSchema = z.object({
  enabled: z.boolean(),
  displayName: z.string().nullable(),
  code: z.string().nullable(),
  shareStudiedToday: z.boolean(),
  shareCrossword: z.boolean(),
  shareWeekly: z.boolean()
}).openapi('FriendSettings')
export type FriendSettings = z.infer<typeof friendSettingsSchema>

export const updateFriendSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  displayName: z.string().trim().min(1).max(40).optional(),
  shareStudiedToday: z.boolean().optional(),
  shareCrossword: z.boolean().optional(),
  shareWeekly: z.boolean().optional()
}).openapi('UpdateFriendSettings')
export type UpdateFriendSettingsInput = z.infer<typeof updateFriendSettingsSchema>

/**
 * A friend, as you see them. Each field is null when they do not share it —
 * the page says "not shared" rather than guessing.
 */
export const friendViewSchema = z.object({
  /** The friendship's id: what removing them deletes. */
  id: z.string(),
  displayName: z.string(),
  studiedToday: z.boolean().nullable(),
  /** Days in a row you both studied. Needs both of you sharing "studied today". */
  pairStreak: z.number().int().nullable(),
  /** Their best time on today's daily crossword, at the level they played. */
  crossword: z.object({ level: z.string(), seconds: z.number().int() }).nullable(),
  weekDays: z.number().int().nullable()
}).openapi('Friend')
export type FriendView = z.infer<typeof friendViewSchema>

export const friendRequestViewSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  direction: z.enum(['incoming', 'outgoing'])
}).openapi('FriendRequest')
export type FriendRequestView = z.infer<typeof friendRequestViewSchema>

export const friendsResponseSchema = z.object({
  settings: friendSettingsSchema,
  friends: z.array(friendViewSchema),
  requests: z.array(friendRequestViewSchema),
  /** Days studied this week: you and every friend who shares it, most first. Never XP. */
  board: z.array(z.object({ displayName: z.string(), days: z.number().int(), isMe: z.boolean() }))
}).openapi('Friends')
export type FriendsResponse = z.infer<typeof friendsResponseSchema>

export const addFriendSchema = z.object({
  code: z.string().trim().min(4).max(20)
}).openapi('AddFriend')
export type AddFriendInput = z.infer<typeof addFriendSchema>

export const friendshipParamSchema = z.object({
  id: z.string().min(1)
})
