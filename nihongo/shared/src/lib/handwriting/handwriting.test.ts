import { describe, expect, it } from 'vitest'

import type { Stroke } from '../../types/handwriting.js'

import { KANJIVG_FIXTURES } from './fixtures.test-data.js'
import { meanDistance, normalise, resample } from './geometry.js'
import { gradeHandwriting, ratingFromGrade } from './grade.js'
import { samplePath } from './path.js'

/** Reference strokes for a fixture character. */
function reference(character: string): Stroke[] {
  return KANJIVG_FIXTURES[character]!.map(d => samplePath(d))
}

/** Simulate writing on a differently-sized, differently-placed canvas. */
function transform(strokes: Stroke[], scale: number, dx: number, dy: number): Stroke[] {
  return strokes.map(s => s.map(p => ({ x: p.x * scale + dx, y: p.y * scale + dy })))
}

/**
 * Deterministic jitter, standing in for an unsteady hand.
 *
 * Seeded rather than random so a failure is reproducible — a flaky grading test
 * would be worse than no test, because the thresholds are judgement calls and a
 * random failure would train us to re-run rather than look.
 */
function jitter(strokes: Stroke[], amount: number, seed = 1): Stroke[] {
  let state = seed
  const next = () => {
    state = (state * 1103515245 + 12345) % 2147483648
    return state / 2147483648 - 0.5
  }
  return strokes.map(s => s.map(p => ({ x: p.x + next() * amount, y: p.y + next() * amount })))
}

describe('samplePath', () => {
  it('starts at the moveto coordinate', () => {
    const points = samplePath('M11,54.25c3.19,0.62,6.25,0.75,9.73,0.5')
    expect(points[0]).toEqual({ x: 11, y: 54.25 })
  })

  it('resolves relative cubics against the current point', () => {
    const relative = samplePath('M0,0c10,0,20,0,30,0')
    const absolute = samplePath('M0,0C10,0,20,0,30,0')
    expect(meanDistance(resample(relative, 16), resample(absolute, 16))).toBeCloseTo(0, 6)
  })

  it('reflects the previous control point for smooth curves', () => {
    // s is a shorthand: its first control point mirrors the previous second one.
    const shorthand = samplePath('M0,0c5,10,10,10,15,0s10,-10,15,0')
    const explicit = samplePath('M0,0c5,10,10,10,15,0c5,-10,10,-10,15,0')
    expect(meanDistance(resample(shorthand, 24), resample(explicit, 24))).toBeCloseTo(0, 6)
  })

  it('samples every fixture without producing NaN', () => {
    for (const [character, paths] of Object.entries(KANJIVG_FIXTURES)) {
      for (const d of paths) {
        const points = samplePath(d)
        expect(points.length, character).toBeGreaterThan(3)
        expect(points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y)), character).toBe(true)
      }
    }
  })
})

describe('resample', () => {
  it('returns exactly the requested number of points', () => {
    expect(resample(samplePath(KANJIVG_FIXTURES['山']![0]!), 32)).toHaveLength(32)
  })

  it('spaces points equally by arc length', () => {
    const line: Stroke = [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 100, y: 0 }]
    const points = resample(line, 11)
    for (let i = 1; i < points.length; i++) {
      expect(points[i]!.x - points[i - 1]!.x).toBeCloseTo(10, 6)
    }
  })

  it('survives a stroke with no extent', () => {
    const tap: Stroke = [{ x: 5, y: 5 }, { x: 5, y: 5 }]
    expect(resample(tap, 8)).toHaveLength(8)
    expect(resample(tap, 8).every(p => p.x === 5 && p.y === 5)).toBe(true)
  })
})

describe('normalise', () => {
  it('is invariant to scale and position', () => {
    const strokes = reference('日')
    const moved = transform(strokes, 4.5, 320, -80)
    const a = normalise(strokes).map(s => resample(s, 16))
    const b = normalise(moved).map(s => resample(s, 16))
    for (let i = 0; i < a.length; i++) expect(meanDistance(a[i]!, b[i]!)).toBeLessThan(1e-6)
  })

  it('normalises the character as a whole, not per stroke', () => {
    // 二 is two horizontal strokes of DIFFERENT lengths. Per-stroke normalisation
    // would stretch both to fill the box and erase exactly that difference.
    const [top, bottom] = normalise(reference('二'))
    const width = (s: Stroke) => Math.max(...s.map(p => p.x)) - Math.min(...s.map(p => p.x))
    expect(width(top!)).not.toBeCloseTo(width(bottom!), 2)
  })

  it('collapses a single tap to the centre instead of dividing by zero', () => {
    const result = normalise([[{ x: 7, y: 7 }, { x: 7, y: 7 }]])
    expect(result[0]!.every(p => p.x === 0.5 && p.y === 0.5)).toBe(true)
  })
})

describe('gradeHandwriting', () => {
  it('scores a perfect trace 100', () => {
    const strokes = reference('山')
    expect(gradeHandwriting(strokes, strokes).score).toBe(100)
  })

  it('ignores canvas size and position', () => {
    // The phone canvas is not the 109x109 KanjiVG box, and nobody writes in the
    // exact centre of it.
    const strokes = reference('川')
    const grade = gradeHandwriting(transform(strokes, 6, 400, 250), strokes)
    expect(grade.score).toBe(100)
    expect(grade.passed).toBe(true)
  })

  it('passes an unsteady but recognisable hand', () => {
    const strokes = reference('日')
    const grade = gradeHandwriting(jitter(transform(strokes, 4, 100, 100), 90), strokes)
    expect(grade.passed).toBe(true)
    expect(grade.score).toBeGreaterThan(70)
    expect(grade.score).toBeLessThan(100)
  })

  it('fails a single stroke drawn backwards', () => {
    const strokes = reference('一')
    const grade = gradeHandwriting([[...strokes[0]!].reverse()], strokes)
    expect(grade.strokes[0]!.reversed).toBe(true)
    expect(grade.issues).toContain('stroke-direction')
    expect(grade.passed).toBe(false)
  })

  it('treats one backwards stroke in a complex character as a minor note', () => {
    const strokes = reference('日')
    const attempt = strokes.map((s, i) => (i === 3 ? [...s].reverse() : s))
    const grade = gradeHandwriting(attempt, strokes)
    expect(grade.issues).toContain('stroke-direction')
    expect(grade.passed).toBe(true)
    expect(grade.score).toBeLessThan(100)
  })

  it('reports wrong order as an ordering error, not three shape errors', () => {
    // 三: correct shapes, drawn bottom-to-top. Positional matching would call
    // every stroke wrong; shape-first matching calls it what it is.
    const strokes = reference('三')
    const grade = gradeHandwriting([...strokes].reverse(), strokes)
    expect(grade.issues).toContain('stroke-order')
    expect(grade.issues).not.toContain('stroke-shape')
    expect(grade.strokes.filter(s => s.outOfOrder).length).toBeGreaterThan(0)
  })

  it('fails a character written in wholesale wrong order', () => {
    // Correct shapes in fully reversed order. Stroke order is most of what this
    // drill teaches, so a character written backwards must not pass — it scored
    // exactly 70 and passed before the order penalty was raised.
    const strokes = reference('三')
    const grade = gradeHandwriting([...strokes].reverse(), strokes)
    expect(grade.issues).toContain('stroke-order')
    expect(grade.passed).toBe(false)
  })

  it('fails a character written wholly backwards', () => {
    const strokes = reference('三')
    const grade = gradeHandwriting(strokes.map(s => [...s].reverse()), strokes)
    expect(grade.issues).toContain('stroke-direction')
    expect(grade.passed).toBe(false)
  })

  it('never passes a missing stroke, however neat the rest', () => {
    const strokes = reference('三')
    const grade = gradeHandwriting(strokes.slice(0, 2), strokes)
    expect(grade.issues).toContain('too-few-strokes')
    expect(grade.strokeCountDrawn).toBe(2)
    expect(grade.strokes.filter(s => s.attemptIndex === null)).toHaveLength(1)
    expect(grade.passed).toBe(false)
  })

  it('never passes an extra stroke', () => {
    const strokes = reference('二')
    const grade = gradeHandwriting([...strokes, [{ x: 20, y: 20 }, { x: 80, y: 80 }]], strokes)
    expect(grade.issues).toContain('too-many-strokes')
    expect(grade.extraStrokes).toHaveLength(1)
    expect(grade.passed).toBe(false)
  })

  it('fails a different character with the same stroke count', () => {
    // 人 and 十 are both two strokes, so only the shapes distinguish them.
    const grade = gradeHandwriting(reference('人'), reference('十'))
    expect(grade.passed).toBe(false)
    expect(grade.score).toBeLessThan(50)
  })

  it('fails an empty attempt', () => {
    const strokes = reference('山')
    const grade = gradeHandwriting([], strokes)
    expect(grade.score).toBe(0)
    expect(grade.passed).toBe(false)
    expect(grade.strokes).toHaveLength(3)
  })

  it('ignores strokes with no points rather than counting them', () => {
    // A stray tap registers as a pointerdown/up with nothing between.
    const strokes = reference('二')
    expect(gradeHandwriting([strokes[0]!, [], strokes[1]!], strokes).passed).toBe(true)
  })

  it('rejects an empty reference loudly', () => {
    expect(() => gradeHandwriting(reference('一'), [])).toThrow(/no strokes/)
  })

  it('grades every fixture against itself as perfect', () => {
    for (const character of Object.keys(KANJIVG_FIXTURES)) {
      const strokes = reference(character)
      expect(gradeHandwriting(strokes, strokes).score, character).toBe(100)
    }
  })
})

describe('ratingFromGrade', () => {
  const strokes = reference('山')

  it('rates a perfect character Easy', () => {
    expect(ratingFromGrade(gradeHandwriting(strokes, strokes))).toBe(4)
  })

  it('rates any failure Again, never Hard', () => {
    // A missing stroke is not a "hard but correct" character.
    expect(ratingFromGrade(gradeHandwriting(strokes.slice(0, 2), strokes))).toBe(1)
    expect(ratingFromGrade(gradeHandwriting([...strokes].reverse(), strokes))).toBe(1)
  })

  it('rates a scraped pass Hard', () => {
    const grade = { ...gradeHandwriting(strokes, strokes), score: 72, passed: true }
    expect(ratingFromGrade(grade)).toBe(2)
  })

  it('rates a solid pass Good', () => {
    const grade = { ...gradeHandwriting(strokes, strokes), score: 88, passed: true }
    expect(ratingFromGrade(grade)).toBe(3)
  })
})
