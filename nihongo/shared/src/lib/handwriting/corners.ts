import type { Point, Stroke, StrokeCorner } from '../../types/handwriting.js'

import { pathLength, resample } from './geometry.js'

interface CornerOptions {
  /** How far the stroke must turn to count, in degrees. */
  minTurn?: number
  /** How far either side of a point to look, in KanjiVG units (the box is 109). */
  reach?: number
}

/** Points per unit of length once resampled: dense enough that `reach` spans several. */
const DENSITY = 1

function heading(from: Point, to: Point): number {
  return Math.atan2(to.y - from.y, to.x - from.x)
}

/** The smaller angle between two headings, 0 to π. */
function turnBetween(a: number, b: number): number {
  const d = Math.abs(a - b) % (Math.PI * 2)
  return d > Math.PI ? Math.PI * 2 - d : d
}

/**
 * Where a stroke turns sharply without the pen lifting: 口's second stroke
 * going right and then down, フ, the hook at the foot of 小.
 *
 * Found from the shape, not from KanjiVG's stroke type, because every kana
 * stroke has no type at all. The stroke is resampled evenly first, then each
 * point compares the way the stroke came in with the way it goes out, a few
 * units either side. A gentle curve never turns that far over so short a
 * span; a corner does.
 */

export function strokeCorners(points: Stroke, { minTurn = 55, reach = 8 }: CornerOptions = {}): StrokeCorner[] {
  const length = pathLength(points)
  // Too short to turn within: a dot, or a tick.
  if (length < reach * 3)
    return []

  const even = resample(points, Math.max(8, Math.ceil(length * DENSITY)))
  const step = length / (even.length - 1)
  const span = Math.max(1, Math.round(reach / step))
  const threshold = (minTurn * Math.PI) / 180

  // Each point's turn, where it has room either side to have one.
  const turns = even.map((p, i) => i < span || i >= even.length - span
    ? 0
    : turnBetween(heading(even[i - span]!, p), heading(p, even[i + span]!)))

  // One corner per run of sharp points, at the sharpest.
  const corners: StrokeCorner[] = []
  let best = -1
  for (let i = 0; i <= turns.length; i++) {
    const sharp = i < turns.length && turns[i]! >= threshold
    if (sharp && (best === -1 || turns[i]! > turns[best]!))
      best = i
    if (!sharp && best !== -1) {
      corners.push({ at: even[best]!, heading: heading(even[best]!, even[Math.min(even.length - 1, best + span)]!) })
      best = -1
    }
  }
  return corners
}
