import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { approve as approveItem, bulkDecide, listPending, reject as rejectItem } from '@/services/review-queue.service.js'

import type { ApproveRoute, BulkApproveRoute, BulkRejectRoute, ListRoute, RejectRoute } from './review-queue.routes.js'

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { limit, offset, kind } = c.req.valid('query')
  return c.json(await listPending(limit, offset, kind), HttpStatusCodes.OK)
}

export const approve: AppRouteHandler<ApproveRoute> = async (c) => {
  const user = c.get('user')!
  const { id } = c.req.valid('param')
  const { note } = c.req.valid('json')
  const ok = await approveItem(id, user.id, note)
  if (!ok)
    return c.json({ message: 'Item not found or already reviewed' }, HttpStatusCodes.NOT_FOUND)
  return c.json({ message: 'Approved and published' }, HttpStatusCodes.OK)
}

export const reject: AppRouteHandler<RejectRoute> = async (c) => {
  const user = c.get('user')!
  const { id } = c.req.valid('param')
  const { note } = c.req.valid('json')
  const ok = await rejectItem(id, user.id, note)
  if (!ok)
    return c.json({ message: 'Item not found or already reviewed' }, HttpStatusCodes.NOT_FOUND)
  return c.json({ message: 'Rejected' }, HttpStatusCodes.OK)
}

export const bulkApprove: AppRouteHandler<BulkApproveRoute> = async (c) => {
  const user = c.get('user')!
  const { ids, note } = c.req.valid('json')
  return c.json(await bulkDecide(ids, user.id, 'approve', note), HttpStatusCodes.OK)
}

export const bulkReject: AppRouteHandler<BulkRejectRoute> = async (c) => {
  const user = c.get('user')!
  const { ids, note } = c.req.valid('json')
  return c.json(await bulkDecide(ids, user.id, 'reject', note), HttpStatusCodes.OK)
}
