import type { BulkReviewResult, ReviewListResponse } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export interface ReviewQueueParams {
  limit?: number
  offset?: number
  kind?: 'grammar' | 'etymology'
}

export async function listPending(params: ReviewQueueParams = {}): Promise<ReviewListResponse> {
  const { data } = await client.get<ReviewListResponse>(API_ENDPOINTS.REVIEW_QUEUE.LIST, { params })
  return data
}

export async function approve(id: string, note?: string): Promise<void> {
  await client.post(API_ENDPOINTS.REVIEW_QUEUE.APPROVE(id), note ? { note } : {})
}

export async function reject(id: string, note?: string): Promise<void> {
  await client.post(API_ENDPOINTS.REVIEW_QUEUE.REJECT(id), note ? { note } : {})
}

export async function bulkApprove(ids: string[], note?: string): Promise<BulkReviewResult> {
  const { data } = await client.post<BulkReviewResult>(API_ENDPOINTS.REVIEW_QUEUE.BULK_APPROVE, { ids, ...(note ? { note } : {}) })
  return data
}

export async function bulkReject(ids: string[], note?: string): Promise<BulkReviewResult> {
  const { data } = await client.post<BulkReviewResult>(API_ENDPOINTS.REVIEW_QUEUE.BULK_REJECT, { ids, ...(note ? { note } : {}) })
  return data
}
