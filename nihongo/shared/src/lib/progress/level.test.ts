import { describe, expect, it } from 'vitest'

import { levelProgress, xpForLevel, xpToLevel } from './level.js'

describe('xpToLevel', () => {
  it('starts each level 100 XP later than the last', () => {
    expect([0, 99, 100, 299, 300, 599, 600, 1000].map(xpToLevel)).toEqual([1, 1, 2, 2, 3, 3, 4, 5])
  })

  it('agrees with xpForLevel at every boundary', () => {
    for (let level = 1; level <= 60; level++) {
      expect(xpToLevel(xpForLevel(level))).toBe(level)
      if (level > 1)
        expect(xpToLevel(xpForLevel(level) - 1)).toBe(level - 1)
    }
  })
})

describe('levelProgress', () => {
  it('says how far into the level and how far to the next', () => {
    expect(levelProgress(140)).toEqual({ level: 2, into: 40, span: 200, toNext: 160 })
    expect(levelProgress(0)).toEqual({ level: 1, into: 0, span: 100, toNext: 100 })
  })
})
