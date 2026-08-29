import { describe, expect, it } from 'vitest'

import { clampReviewedAt } from './clock.js'

const NOW = new Date('2026-06-01T12:00:00.000Z')
const MIN = 60 * 1000
const DAY = 24 * 60 * 60 * 1000

describe('clampReviewedAt', () => {
  it('leaves a sane timestamp alone', () => {
    const client = new Date(NOW.getTime() - 30 * MIN)
    const result = clampReviewedAt(client, NOW, null)
    expect(result.reviewedAt).toEqual(client)
    expect(result.adjusted).toBe(false)
  })

  it('accepts a small amount of clock drift into the future', () => {
    const client = new Date(NOW.getTime() + 2 * MIN)
    expect(clampReviewedAt(client, NOW, null).adjusted).toBe(false)
  })

  it('pulls a far-future stamp back to the receive time', () => {
    const client = new Date(NOW.getTime() + 3 * DAY)
    const result = clampReviewedAt(client, NOW, null)
    expect(result.reviewedAt).toEqual(NOW)
    expect(result.adjusted).toBe(true)
    expect(result.reason).toBe('future')
  })

  it('pulls an absurdly old stamp forward to the backlog limit', () => {
    const client = new Date(NOW.getTime() - 400 * DAY)
    const result = clampReviewedAt(client, NOW, null)
    expect(result.reviewedAt).toEqual(new Date(NOW.getTime() - 30 * DAY))
    expect(result.reason).toBe('stale')
  })

  it('accepts a genuinely old offline review inside the backlog window', () => {
    const client = new Date(NOW.getTime() - 5 * DAY)
    expect(clampReviewedAt(client, NOW, null).adjusted).toBe(false)
  })

  it('forces strict ordering after the previous review', () => {
    const previous = new Date(NOW.getTime() - 10 * MIN)
    const result = clampReviewedAt(previous, NOW, previous)
    expect(result.reviewedAt.getTime()).toBe(previous.getTime() + 1)
    expect(result.reason).toBe('not-after-previous')
  })

  it('nudges a stamp that lands BEFORE the previous review', () => {
    const previous = new Date(NOW.getTime() - 10 * MIN)
    const client = new Date(NOW.getTime() - 20 * MIN)
    const result = clampReviewedAt(client, NOW, previous)
    // The fold needs a strict total order per card; equal or earlier breaks it.
    expect(result.reviewedAt.getTime()).toBe(previous.getTime() + 1)
    expect(result.adjusted).toBe(true)
  })

  it('applies the future clamp and the ordering clamp together', () => {
    const previous = new Date(NOW.getTime() + 1 * MIN)
    const client = new Date(NOW.getTime() + 10 * DAY)
    const result = clampReviewedAt(client, NOW, previous)
    // future -> NOW, then NOW <= previous -> previous + 1ms
    expect(result.reviewedAt.getTime()).toBe(previous.getTime() + 1)
  })

  it('honours custom tolerances', () => {
    const client = new Date(NOW.getTime() + 30 * 1000)
    expect(clampReviewedAt(client, NOW, null, { futureToleranceMs: 1000 }).adjusted).toBe(true)
  })
})
