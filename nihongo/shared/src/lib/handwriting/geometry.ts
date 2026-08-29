import type { Point, Stroke } from '../../types/handwriting.js'

/** Cumulative arc length along a polyline. */
function arcLengths(points: Stroke): number[] {
  const lengths = [0]
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1]! + Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.y - points[i - 1]!.y))
  }
  return lengths
}

/**
 * Resample a stroke to `count` points spaced equally by arc length.
 *
 * This is what makes drawing speed irrelevant: a pointer event stream is dense
 * where the hand slowed down and sparse where it moved fast, and comparing raw
 * samples would grade hesitation.
 */
export function resample(points: Stroke, count: number): Stroke {
  if (points.length === 0)
    return []
  if (count < 2)
    return [points[0]!]
  if (points.length === 1)
    return Array.from({ length: count }, () => ({ ...points[0]! }))

  const lengths = arcLengths(points)
  const total = lengths[lengths.length - 1]!
  // A stroke with no extent (a tap) has no direction to resample along.
  if (total === 0)
    return Array.from({ length: count }, () => ({ ...points[0]! }))

  const step = total / (count - 1)
  const out: Stroke = [{ ...points[0]! }]
  let cursor = 1

  for (let k = 1; k < count - 1; k++) {
    const target = step * k
    while (cursor < lengths.length - 1 && lengths[cursor]! < target) cursor++
    const prev = lengths[cursor - 1]!
    const span = lengths[cursor]! - prev
    const t = span === 0 ? 0 : (target - prev) / span
    const a = points[cursor - 1]!
    const b = points[cursor]!
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
  }

  out.push({ ...points[points.length - 1]! })
  return out
}

/**
 * Scale a whole character into a unit box.
 *
 * Normalising the character as a WHOLE — never per stroke — is the point. Per
 * stroke, every stroke would fill the box and 一 would match 丨; together, each
 * stroke keeps its relative size and position, which is most of what makes a
 * kanji that kanji. The scale is uniform for the same reason: a squashed
 * character should not score as a good one.
 */
export function normalise(strokes: Stroke[]): Stroke[] {
  const all = strokes.flat()
  if (all.length === 0)
    return strokes.map(() => [])

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of all) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }

  const extent = Math.max(maxX - minX, maxY - minY)
  // Everything collapsed to a point (a single tap): centre it and keep the
  // scale finite rather than dividing by zero.
  if (extent < 1e-9)
    return strokes.map(s => s.map(() => ({ x: 0.5, y: 0.5 })))

  const scale = 1 / extent
  const offsetX = 0.5 - ((minX + maxX) / 2) * scale
  const offsetY = 0.5 - ((minY + maxY) / 2) * scale
  return strokes.map(s => s.map(p => ({ x: p.x * scale + offsetX, y: p.y * scale + offsetY })))
}

/** Mean distance between two equal-length resampled strokes. */
export function meanDistance(a: Stroke, b: Stroke): number {
  const n = Math.min(a.length, b.length)
  if (n === 0)
    return Infinity
  let sum = 0
  for (let i = 0; i < n; i++) sum += Math.hypot(a[i]!.x - b[i]!.x, a[i]!.y - b[i]!.y)
  return sum / n
}

/** A stroke drawn end-to-start, for the direction check. */
export function reverse(stroke: Stroke): Stroke {
  return [...stroke].reverse()
}

export type { Point, Stroke }
