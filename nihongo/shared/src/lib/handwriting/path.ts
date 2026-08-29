import type { Point, Stroke } from '../../types/handwriting.js'

/**
 * A minimal SVG path sampler for KanjiVG.
 *
 * KanjiVG uses exactly six commands across all 11,000 characters — M, m, C, c,
 * S, s — i.e. movetos and cubic beziers, nothing else. That closed set is why
 * this is ~80 lines rather than a general path parser.
 *
 * Deliberately NOT `SVGGeometryElement.getPointAtLength`: keeping the sampler
 * here means the grader runs identically in Node and the browser, so the unit
 * tests exercise the same code the phone runs offline.
 */

// One literal tokeniser rather than a composed one: a case-insensitive flag
// would make M/m, C/c and S/s duplicates, and their case is what distinguishes
// absolute from relative coordinates.
const TOKENS = /[MCS]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi
const IS_COMMAND = /^[MCS]$/i

function cubicAt(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y
  }
}

/** Chord-length estimate, good enough to choose a segment's sample count. */
function roughLength(p0: Point, p1: Point, p2: Point, p3: Point): number {
  const seg = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y)
  return (seg(p0, p1) + seg(p1, p2) + seg(p2, p3) + seg(p0, p3)) / 2
}

/**
 * Flatten one SVG path into a polyline.
 *
 * `samplesPerUnit` is relative to the path's own units (109x109 for KanjiVG),
 * so curvier strokes get proportionally more points.
 */
export function samplePath(d: string, samplesPerUnit = 0.5): Stroke {
  const tokens = d.match(TOKENS) ?? []

  const points: Point[] = []
  let current: Point = { x: 0, y: 0 }
  let start: Point = { x: 0, y: 0 }
  // Reflection of the previous cubic's second control point, for S/s.
  let lastControl: Point | null = null
  let command = ''
  let i = 0

  const next = () => Number.parseFloat(tokens[i++] ?? '0')

  while (i < tokens.length) {
    const token = tokens[i]!
    if (IS_COMMAND.test(token)) {
      command = token
      i++
      // A repeated coordinate set after M/m is an implicit lineto, but KanjiVG
      // never emits one, so treat repeats as more of the same command.
    }

    const relative = command === command.toLowerCase()
    const origin = relative ? current : { x: 0, y: 0 }

    switch (command.toUpperCase()) {
      case 'M': {
        const p = { x: origin.x + next(), y: origin.y + next() }
        current = p
        start = p
        lastControl = null
        points.push(p)
        break
      }
      case 'C':
      case 'S': {
        let c1: Point
        if (command.toUpperCase() === 'S') {
          // Smooth: first control point mirrors the previous one about current.
          c1 = lastControl
            ? { x: 2 * current.x - lastControl.x, y: 2 * current.y - lastControl.y }
            : current
        } else {
          c1 = { x: origin.x + next(), y: origin.y + next() }
        }
        const c2 = { x: origin.x + next(), y: origin.y + next() }
        const end = { x: origin.x + next(), y: origin.y + next() }

        const steps = Math.max(4, Math.ceil(roughLength(current, c1, c2, end) * samplesPerUnit))
        for (let s = 1; s <= steps; s++) points.push(cubicAt(current, c1, c2, end, s / steps))

        current = end
        lastControl = c2
        break
      }
      default:
        // Unreachable for KanjiVG. Skip the token rather than spin forever.
        i++
    }
  }

  // `start` is only meaningful for closed paths, which KanjiVG has none of;
  // referencing it keeps the moveto bookkeeping honest if that ever changes.
  void start
  return points
}
