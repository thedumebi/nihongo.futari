import { z } from '@hono/zod-openapi'
import { HttpStatusCodes, REVIEW_QUEUE_ROUTES } from '@nihongo/shared/constants'
import { createAdminRoute, ErrorSchema, jsonContent, jsonContentRequired } from '@nihongo/shared/openapi'
import {
  bulkReviewResultSchema,
  bulkReviewSchema,
  IdParamSchema,
  MessageResponseSchema,
  reviewDecisionSchema,
  reviewListResponseSchema
} from '@nihongo/shared/types'

import adminMiddleware from '@/middlewares/admin.js'
import authMiddleware from '@/middlewares/auth.js'

const tags = ['Review queue']
const adminMiddlewares = [authMiddleware, adminMiddleware]

export const list = createAdminRoute({
  tags,
  path: REVIEW_QUEUE_ROUTES.LIST,
  method: 'get',
  summary: 'Content awaiting sign-off',
  description: 'Each item carries its claim, prose and verbatim source quotes, so a decision needs no second lookup.',
  middleware: adminMiddlewares,
  request: {
    query: z.object({
      limit: z.coerce.number().int().min(1).max(100).default(25),
      offset: z.coerce.number().int().min(0).default(0),
      kind: z.enum(['grammar', 'etymology']).optional()
    })
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(reviewListResponseSchema, 'Pending items')
  }
})
export type ListRoute = typeof list

export const approve = createAdminRoute({
  tags,
  path: REVIEW_QUEUE_ROUTES.APPROVE,
  method: 'post',
  summary: 'Approve and publish',
  middleware: adminMiddlewares,
  request: { params: IdParamSchema, body: jsonContentRequired(reviewDecisionSchema, 'Optional note') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(MessageResponseSchema, 'Approved'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'Not pending')
  }
})
export type ApproveRoute = typeof approve

export const reject = createAdminRoute({
  tags,
  path: REVIEW_QUEUE_ROUTES.REJECT,
  method: 'post',
  summary: 'Reject',
  middleware: adminMiddlewares,
  request: { params: IdParamSchema, body: jsonContentRequired(reviewDecisionSchema, 'Optional note') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(MessageResponseSchema, 'Rejected'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'Not pending')
  }
})
export type RejectRoute = typeof reject

export const bulkApprove = createAdminRoute({
  tags,
  path: REVIEW_QUEUE_ROUTES.BULK_APPROVE,
  method: 'post',
  summary: 'Approve several items',
  middleware: adminMiddlewares,
  request: { body: jsonContentRequired(bulkReviewSchema, 'Ids to approve') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(bulkReviewResultSchema, 'Per-id outcome')
  }
})
export type BulkApproveRoute = typeof bulkApprove

export const bulkReject = createAdminRoute({
  tags,
  path: REVIEW_QUEUE_ROUTES.BULK_REJECT,
  method: 'post',
  summary: 'Reject several items',
  middleware: adminMiddlewares,
  request: { body: jsonContentRequired(bulkReviewSchema, 'Ids to reject') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(bulkReviewResultSchema, 'Per-id outcome')
  }
})
export type BulkRejectRoute = typeof bulkReject
