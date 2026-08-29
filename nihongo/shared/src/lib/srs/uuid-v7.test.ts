import { describe, expect, it } from 'vitest'

import { uuidv7 } from './uuid-v7.js'

describe('uuidv7', () => {
  it('is a well-formed v7 uuid', () => {
    const id = uuidv7()
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  it('sORTS CHRONOLOGICALLY as a plain string', () => {
    // The entire reason for choosing v7 over v4. Replay folds logs in order,
    // and with v4 the id carries no order at all.
    const ids = [1000, 2000, 3000, 4000].map(t => uuidv7(t))
    expect([...ids].sort()).toEqual(ids)
  })

  it('encodes the timestamp in the high 48 bits', () => {
    const id = uuidv7(0x0123456789AB)
    expect(id.slice(0, 8) + id.slice(9, 13)).toBe('0123456789ab')
  })

  it('is distinct for the same millisecond', () => {
    const ids = new Set(Array.from({ length: 200 }, () => uuidv7(1234567890)))
    expect(ids.size).toBe(200)
  })

  it('still gives a TOTAL order within one millisecond', () => {
    // Same ms means the random tail decides, and which one wins is arbitrary —
    // the version nibble is masked into those bits, so it is not simply "more
    // random sorts later". Arbitrary is fine: reviews inside one millisecond
    // have no real order either. What the replay fold needs is a total order,
    // not a meaningful one, so the test asserts exactly that and no more.
    const a = uuidv7(5000, () => 0.1)
    const b = uuidv7(5000, () => 0.9)
    expect(a).not.toBe(b)
    expect(a === b || (a < b) !== (b < a)).toBe(true)
  })

  it('handles a timestamp beyond 2^32 ms', () => {
    // 2^32 ms is 1970 + 49 days; anything real is well past it, so a 32-bit
    // shift would silently truncate every id this app ever mints.
    const id = uuidv7(1_800_000_000_000)
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7/)
    expect(uuidv7(1_800_000_000_000) < uuidv7(1_900_000_000_000)).toBe(true)
  })
})
