import { describe, expect, it } from 'vitest'

import { clampReviewedAt } from './clock.js'

const NOW = new Date('2026-06-01T12:00:00.000Z')
const MIN = 60 * 1000
const DAY = 24 * 60 * 60 * 1000

describe('clampReviewedAt', () => {
  it('leaves a sane timestamp alone', () => {
    const client = new Date(NOW.getTime() - 30 * MIN)
    const result = clampReviewedAt(client, NOW)
    expect(result.reviewedAt).toEqual(client)
    expect(result.adjusted).toBe(false)
  })

  it('accepts a small amount of clock drift into the future', () => {
    const client = new Date(NOW.getTime() + 2 * MIN)
    expect(clampReviewedAt(client, NOW).adjusted).toBe(false)
  })

  it('pulls a far-future stamp back to the receive time', () => {
    const client = new Date(NOW.getTime() + 3 * DAY)
    const result = clampReviewedAt(client, NOW)
    expect(result.reviewedAt).toEqual(NOW)
    expect(result.adjusted).toBe(true)
    expect(result.reason).toBe('future')
  })

  it('pulls an absurdly old stamp forward to the backlog limit', () => {
    const client = new Date(NOW.getTime() - 400 * DAY)
    const result = clampReviewedAt(client, NOW)
    expect(result.reviewedAt).toEqual(new Date(NOW.getTime() - 30 * DAY))
    expect(result.reason).toBe('stale')
  })

  it('accepts a genuinely old offline review inside the backlog window', () => {
    const client = new Date(NOW.getTime() - 5 * DAY)
    expect(clampReviewedAt(client, NOW).adjusted).toBe(false)
  })

  it('keeps the moment an answer was given, however long it took to arrive', () => {
    // Answered offline yesterday and synced now, after the card was reviewed
    // on another device: replayed into its place, not re-dated to after it.
    const client = new Date(NOW.getTime() - 1 * DAY)
    const result = clampReviewedAt(client, NOW)
    expect(result.reviewedAt).toEqual(client)
    expect(result.adjusted).toBe(false)
  })

  it('honours custom tolerances', () => {
    const client = new Date(NOW.getTime() + 30 * 1000)
    expect(clampReviewedAt(client, NOW, { futureToleranceMs: 1000 }).adjusted).toBe(true)
  })
})
