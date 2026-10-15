import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import {
  createCampaign,
  deleteCampaign,
  getCampaign,
  listCampaigns,
  previewCampaign,
  sendCampaign,
  sendTest,
  updateCampaign
} from '@/services/email-campaigns.service.js'

import type { CreateRoute, GetRoute, ListRoute, PreviewRoute, RemoveRoute, SendRoute, TestRoute, UpdateRoute } from './email-campaigns.routes.js'

const notADraft = { message: 'That email has been sent, or does not exist' }

export const list: AppRouteHandler<ListRoute> = async (c) => {
  return c.json(await listCampaigns(), HttpStatusCodes.OK)
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  return c.json(await createCampaign(c.req.valid('json'), c.get('user')!.id), HttpStatusCodes.CREATED)
}

export const preview: AppRouteHandler<PreviewRoute> = async (c) => {
  return c.json(await previewCampaign(c.req.valid('json'), c.get('user')!.id), HttpStatusCodes.OK)
}

export const get: AppRouteHandler<GetRoute> = async (c) => {
  const campaign = await getCampaign(c.req.valid('param').id)
  if (!campaign)
    return c.json({ message: 'No such email' }, HttpStatusCodes.NOT_FOUND)
  return c.json(campaign, HttpStatusCodes.OK)
}

export const update: AppRouteHandler<UpdateRoute> = async (c) => {
  const campaign = await updateCampaign(c.req.valid('param').id, c.req.valid('json'))
  if (!campaign)
    return c.json(notADraft, HttpStatusCodes.CONFLICT)
  return c.json(campaign, HttpStatusCodes.OK)
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  if (!await deleteCampaign(c.req.valid('param').id))
    return c.json(notADraft, HttpStatusCodes.CONFLICT)
  return c.json({ message: 'Deleted' }, HttpStatusCodes.OK)
}

export const test: AppRouteHandler<TestRoute> = async (c) => {
  if (!await sendTest(c.req.valid('param').id, c.get('user')!.id))
    return c.json({ message: 'No such email' }, HttpStatusCodes.NOT_FOUND)
  return c.json({ message: 'Sent to you' }, HttpStatusCodes.OK)
}

export const send: AppRouteHandler<SendRoute> = async (c) => {
  const campaign = await sendCampaign(c.req.valid('param').id)
  if (!campaign)
    return c.json(notADraft, HttpStatusCodes.CONFLICT)
  return c.json(campaign, HttpStatusCodes.OK)
}
