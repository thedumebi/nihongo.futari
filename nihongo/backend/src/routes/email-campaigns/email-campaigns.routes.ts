import { EMAIL_CAMPAIGN_ROUTES, HttpStatusCodes } from '@nihongo/shared/constants'
import { createAdminRoute, ErrorSchema, jsonContent, jsonContentRequired } from '@nihongo/shared/openapi'
import {
  emailCampaignInputSchema,
  emailCampaignListSchema,
  emailCampaignViewSchema,
  emailPreviewSchema,
  IdParamSchema,
  MessageResponseSchema
} from '@nihongo/shared/types'

import adminMiddleware from '@/middlewares/admin.js'
import authMiddleware from '@/middlewares/auth.js'

const tags = ['Email campaigns']
const adminMiddlewares = [authMiddleware, adminMiddleware]

export const list = createAdminRoute({
  tags,
  path: EMAIL_CAMPAIGN_ROUTES.LIST,
  method: 'get',
  summary: 'Every email, newest first, with its reach and progress',
  middleware: adminMiddlewares,
  responses: { [HttpStatusCodes.OK]: jsonContent(emailCampaignListSchema, 'Campaigns') }
})
export type ListRoute = typeof list

export const create = createAdminRoute({
  tags,
  path: EMAIL_CAMPAIGN_ROUTES.CREATE,
  method: 'post',
  summary: 'Start a draft',
  middleware: adminMiddlewares,
  request: { body: jsonContentRequired(emailCampaignInputSchema, 'The email') },
  responses: { [HttpStatusCodes.CREATED]: jsonContent(emailCampaignViewSchema, 'The draft') }
})
export type CreateRoute = typeof create

export const preview = createAdminRoute({
  tags,
  path: EMAIL_CAMPAIGN_ROUTES.PREVIEW,
  method: 'post',
  summary: 'The email as it would arrive, without saving it',
  middleware: adminMiddlewares,
  request: { body: jsonContentRequired(emailCampaignInputSchema, 'The email') },
  responses: { [HttpStatusCodes.OK]: jsonContent(emailPreviewSchema, 'Rendered email') }
})
export type PreviewRoute = typeof preview

export const get = createAdminRoute({
  tags,
  path: EMAIL_CAMPAIGN_ROUTES.GET,
  method: 'get',
  summary: 'One email',
  middleware: adminMiddlewares,
  request: { params: IdParamSchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(emailCampaignViewSchema, 'The campaign'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such email')
  }
})
export type GetRoute = typeof get

export const update = createAdminRoute({
  tags,
  path: EMAIL_CAMPAIGN_ROUTES.UPDATE,
  method: 'put',
  summary: 'Change a draft',
  middleware: adminMiddlewares,
  request: { params: IdParamSchema, body: jsonContentRequired(emailCampaignInputSchema, 'The email') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(emailCampaignViewSchema, 'The draft'),
    [HttpStatusCodes.CONFLICT]: jsonContent(ErrorSchema, 'Already sent, or no such draft')
  }
})
export type UpdateRoute = typeof update

export const remove = createAdminRoute({
  tags,
  path: EMAIL_CAMPAIGN_ROUTES.DELETE,
  method: 'delete',
  summary: 'Delete a draft',
  middleware: adminMiddlewares,
  request: { params: IdParamSchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(MessageResponseSchema, 'Deleted'),
    [HttpStatusCodes.CONFLICT]: jsonContent(ErrorSchema, 'Already sent, or no such draft')
  }
})
export type RemoveRoute = typeof remove

export const test = createAdminRoute({
  tags,
  path: EMAIL_CAMPAIGN_ROUTES.TEST,
  method: 'post',
  summary: 'Send the saved email to yourself, marked as a test',
  middleware: adminMiddlewares,
  request: { params: IdParamSchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(MessageResponseSchema, 'Sent'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such email')
  }
})
export type TestRoute = typeof test

export const send = createAdminRoute({
  tags,
  path: EMAIL_CAMPAIGN_ROUTES.SEND,
  method: 'post',
  summary: 'Send a draft to its audience — once',
  middleware: adminMiddlewares,
  request: { params: IdParamSchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(emailCampaignViewSchema, 'Sending'),
    [HttpStatusCodes.CONFLICT]: jsonContent(ErrorSchema, 'Already sent, or no such draft')
  }
})
export type SendRoute = typeof send
