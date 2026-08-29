import { HttpStatusCodes, INVITE_ROUTES } from '@nihongo/shared/constants'
import { createAdminRoute, createPublicRoute, ErrorSchema, jsonContent, jsonContentRequired } from '@nihongo/shared/openapi'
import {
  createInviteSchema,
  IdParamSchema,
  inviteListResponseSchema,
  inviteResponseSchema,
  MessageResponseSchema,
  reserveInviteResponseSchema,
  reserveInviteSchema,
  signupModeResponseSchema
} from '@nihongo/shared/types'

import adminMiddleware from '@/middlewares/admin.js'
import authMiddleware from '@/middlewares/auth.js'
import { strictLimiter } from '@/middlewares/rate-limit.js'

const tags = ['Invites']
const adminMiddlewares = [authMiddleware, adminMiddleware]

// ==================== Public ====================

export const signupMode = createPublicRoute({
  tags,
  path: INVITE_ROUTES.SIGNUP_MODE,
  method: 'get',
  summary: 'How signup is gated',
  description: 'Lets the signup page decide whether to ask for an invite code, without leaking codes.',
  responses: {
    [HttpStatusCodes.OK]: jsonContent(signupModeResponseSchema, 'Current signup policy')
  }
})
export type SignupModeRoute = typeof signupMode

export const reserve = createPublicRoute({
  tags,
  path: INVITE_ROUTES.RESERVE,
  method: 'post',
  summary: 'Claim an invite code for an email address',
  description:
    'Validates the code and binds it to the address for 30 minutes, so the account-creation hook can '
    + 'authorise either signup path. Does NOT spend the code — an abandoned signup returns it to circulation.',
  middleware: [strictLimiter],
  request: { body: jsonContentRequired(reserveInviteSchema, 'Code and email') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(reserveInviteResponseSchema, 'Code accepted'),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(reserveInviteResponseSchema, 'Code rejected')
  }
})
export type ReserveRoute = typeof reserve

// ==================== Admin ====================

export const list = createAdminRoute({
  tags,
  path: INVITE_ROUTES.LIST,
  method: 'get',
  summary: 'List invite codes',
  middleware: adminMiddlewares,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(inviteListResponseSchema, 'Invites')
  }
})
export type ListRoute = typeof list

export const create = createAdminRoute({
  tags,
  path: INVITE_ROUTES.CREATE,
  method: 'post',
  summary: 'Mint an invite code',
  middleware: adminMiddlewares,
  request: { body: jsonContentRequired(createInviteSchema, 'Invite options') },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(inviteResponseSchema, 'The new invite, with a shareable link')
  }
})
export type CreateRoute = typeof create

export const revoke = createAdminRoute({
  tags,
  path: INVITE_ROUTES.REVOKE,
  method: 'post',
  summary: 'Revoke an invite code',
  middleware: adminMiddlewares,
  request: { params: IdParamSchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(MessageResponseSchema, 'Revoked'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'Not found or already revoked')
  }
})
export type RevokeRoute = typeof revoke
