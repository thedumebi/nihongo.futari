import { z } from '@hono/zod-openapi'
import { FRIENDS_ROUTES, HttpStatusCodes } from '@nihongo/shared/constants'
import { createSecuredRoute, ErrorSchema, jsonContent, jsonContentRequired } from '@nihongo/shared/openapi'
import { addFriendSchema, friendSettingsSchema, friendshipParamSchema, friendsResponseSchema, updateFriendSettingsSchema } from '@nihongo/shared/types'

import authMiddleware from '@/middlewares/auth.js'
import { writeLimiter } from '@/middlewares/rate-limit.js'

const tags = ['Friends']

export const list = createSecuredRoute({
  tags,
  path: FRIENDS_ROUTES.LIST,
  method: 'get',
  summary: 'Your friends, requests and the weekly board',
  description: 'Each friend carries only what they chose to share; the rest is null.',
  middleware: [authMiddleware],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(friendsResponseSchema, 'Friends')
  }
})
export type ListRoute = typeof list

export const updateSettings = createSecuredRoute({
  tags,
  path: FRIENDS_ROUTES.SETTINGS,
  method: 'patch',
  summary: 'Turn friends on or off, rename, or change what is shared',
  description: 'Turning friends off deletes your profile and every friendship.',
  middleware: [authMiddleware, writeLimiter],
  request: { body: jsonContentRequired(updateFriendSettingsSchema, 'Changes') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(friendSettingsSchema, 'Your settings')
  }
})
export type UpdateSettingsRoute = typeof updateSettings

export const rotateCode = createSecuredRoute({
  tags,
  path: FRIENDS_ROUTES.ROTATE_CODE,
  method: 'post',
  summary: 'A new friend code; the old one stops working',
  middleware: [authMiddleware, writeLimiter],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(friendSettingsSchema, 'Your settings'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'Friends are off')
  }
})
export type RotateCodeRoute = typeof rotateCode

export const add = createSecuredRoute({
  tags,
  path: FRIENDS_ROUTES.REQUESTS,
  method: 'post',
  summary: 'Ask to be friends by code',
  description: 'Accepts at once if they had already asked you. Asking twice is a no-op.',
  middleware: [authMiddleware, writeLimiter],
  request: { body: jsonContentRequired(addFriendSchema, 'Their code') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ displayName: z.string(), status: z.enum(['pending', 'accepted']) }), 'Sent, or already friends'),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(ErrorSchema, 'Friends are off, or that is your own code'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such code')
  }
})
export type AddRoute = typeof add

export const accept = createSecuredRoute({
  tags,
  path: FRIENDS_ROUTES.ACCEPT,
  method: 'post',
  summary: 'Accept a friend request sent to you',
  middleware: [authMiddleware, writeLimiter],
  request: { params: friendshipParamSchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ ok: z.literal(true) }), 'Accepted'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such request')
  }
})
export type AcceptRoute = typeof accept

export const remove = createSecuredRoute({
  tags,
  path: FRIENDS_ROUTES.REMOVE,
  method: 'delete',
  summary: 'Decline, cancel, or unfriend',
  middleware: [authMiddleware, writeLimiter],
  request: { params: friendshipParamSchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ ok: z.literal(true) }), 'Gone'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such friendship')
  }
})
export type RemoveRoute = typeof remove
