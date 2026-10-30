import { describe, expect, it } from 'vitest'

import { strokeCorners } from './corners.js'
import { KANJIVG_FIXTURES } from './fixtures.test-data.js'
import { samplePath } from './path.js'

function cornersOf(character: string, stroke: number) {
  return strokeCorners(samplePath(KANJIVG_FIXTURES[character]![stroke]!))
}

/** Which way a heading points, to the nearest quarter: right, down, left or up. */
function way(heading: number): string {
  const quarter = Math.round(heading / (Math.PI / 2))
  return ({ 0: 'right', 1: 'down', 2: 'left', [-2]: 'left', [-1]: 'up' } as Record<number, string>)[quarter]!
}

describe('strokeCorners', () => {
  it('finds the one turn in 口\'s second stroke, right then down', () => {
    const corners = cornersOf('口', 1)
    expect(corners).toHaveLength(1)
    expect(way(corners[0]!.heading)).toBe('down')
    expect(corners[0]!.at.x).toBeGreaterThan(80)
  })

  it('finds the same turn in 日\'s second stroke', () => {
    const corners = cornersOf('日', 1)
    expect(corners).toHaveLength(1)
    expect(way(corners[0]!.heading)).toBe('down')
  })

  it('finds 山\'s second stroke turning from down to right', () => {
    const corners = cornersOf('山', 1)
    expect(corners).toHaveLength(1)
    expect(way(corners[0]!.heading)).toBe('right')
  })

  it('finds the turn in フ, a kana with no stroke type to go on', () => {
    expect(cornersOf('フ', 0)).toHaveLength(1)
  })

  it('finds both turns in 乙 and the turn up at its end', () => {
    const corners = cornersOf('乙', 0)
    expect(corners.length).toBeGreaterThanOrEqual(2)
    expect(way(corners[corners.length - 1]!.heading)).toBe('up')
  })

  it('finds no turn in a straight stroke or a gentle curve', () => {
    expect(cornersOf('一', 0)).toEqual([])
    expect(cornersOf('十', 1)).toEqual([])
    expect(cornersOf('人', 0)).toEqual([])
    expect(cornersOf('口', 2)).toEqual([])
  })

  it('finds nothing in a dot', () => {
    expect(strokeCorners([{ x: 10, y: 10 }, { x: 11, y: 11 }])).toEqual([])
  })
})
