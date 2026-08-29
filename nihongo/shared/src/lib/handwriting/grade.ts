import type {
  HandwritingGrade,
  HandwritingGradeOptions,
  HandwritingIssue,
  Stroke,
  StrokeGrade
} from '../../types/handwriting.js'

import { meanDistance, normalise, resample, reverse } from './geometry.js'

/**
 * Defaults tuned against traced KanjiVG references (see grade.test.ts).
 *
 * `perfectDistance` 0.06 means "within 6% of the character's width counts as
 * on the line" — handwriting is not tracing, and grading it as tracing makes
 * the drill miserable without making anyone write better.
 */
const DEFAULTS: Required<HandwritingGradeOptions> = {
  resampleCount: 32,
  perfectDistance: 0.06,
  failDistance: 0.3,
  // Steep enough that a character written in wholesale wrong order fails —
  // 山 drawn right-to-left scored exactly 70 and passed at 45, which defeats
  // the drill — while a single transposition in a twelve-stroke kanji still
  // costs only ~5 points. Both follow from the penalty being proportional.
  orderPenalty: 60,
  directionPenalty: 55,
  extraStrokePenalty: 15,
  passScore: 70
}

function scoreFromDistance(distance: number, perfect: number, fail: number): number {
  if (distance <= perfect)
    return 100
  if (distance >= fail)
    return 0
  return (100 * (fail - distance)) / (fail - perfect)
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/**
 * Grade a handwritten character against reference strokes.
 *
 * Both sets are normalised together with their own bounding boxes, so canvas
 * size, position and the reference's padding all drop out — only the shape,
 * the relative placement, the direction and the order are judged.
 *
 * Matching is greedy nearest-pair rather than positional: matching stroke `i`
 * to reference `i` would make a single early mistake cascade, reporting every
 * later stroke as wrong. Matching by shape first means an out-of-order stroke
 * is reported as exactly that — one ordering error, not eight shape errors.
 */
export function gradeHandwriting(
  attempt: Stroke[],
  reference: Stroke[],
  options: HandwritingGradeOptions = {}
): HandwritingGrade {
  const opts = { ...DEFAULTS, ...options }
  const drawn = attempt.filter(s => s.length > 0)

  if (reference.length === 0) {
    throw new Error('gradeHandwriting: reference has no strokes')
  }

  if (drawn.length === 0) {
    return {
      score: 0,
      passed: false,
      strokeCountExpected: reference.length,
      strokeCountDrawn: 0,
      strokes: reference.map((_, referenceIndex) => ({
        referenceIndex,
        attemptIndex: null,
        score: 0,
        meanDistance: Infinity,
        reversed: false,
        outOfOrder: false
      })),
      extraStrokes: [],
      issues: ['too-few-strokes']
    }
  }

  const normalisedAttempt = normalise(drawn).map(s => resample(s, opts.resampleCount))
  const normalisedReference = normalise(reference).map(s => resample(s, opts.resampleCount))

  // Cost of pairing each drawn stroke with each reference stroke. A backwards
  // stroke should still match the stroke it was aiming at, so the cost is the
  // better of the two directions and the direction is recorded separately.
  interface Pairing { attemptIndex: number, referenceIndex: number, distance: number, reversed: boolean }
  const pairings: Pairing[] = []
  for (let a = 0; a < normalisedAttempt.length; a++) {
    for (let r = 0; r < normalisedReference.length; r++) {
      const forward = meanDistance(normalisedAttempt[a]!, normalisedReference[r]!)
      const backward = meanDistance(reverse(normalisedAttempt[a]!), normalisedReference[r]!)
      pairings.push({
        attemptIndex: a,
        referenceIndex: r,
        distance: Math.min(forward, backward),
        reversed: backward < forward
      })
    }
  }
  pairings.sort((x, y) => x.distance - y.distance)

  const usedAttempt = new Set<number>()
  const usedReference = new Set<number>()
  const matched = new Map<number, Pairing>()
  for (const pairing of pairings) {
    if (usedAttempt.has(pairing.attemptIndex) || usedReference.has(pairing.referenceIndex))
      continue
    usedAttempt.add(pairing.attemptIndex)
    usedReference.add(pairing.referenceIndex)
    matched.set(pairing.referenceIndex, pairing)
  }

  const strokes: StrokeGrade[] = normalisedReference.map((_, referenceIndex) => {
    const pairing = matched.get(referenceIndex)
    if (!pairing) {
      return { referenceIndex, attemptIndex: null, score: 0, meanDistance: Infinity, reversed: false, outOfOrder: false }
    }
    return {
      referenceIndex,
      attemptIndex: pairing.attemptIndex,
      score: scoreFromDistance(pairing.distance, opts.perfectDistance, opts.failDistance),
      meanDistance: pairing.distance,
      reversed: pairing.reversed,
      // Only meaningful when the shape actually matched: a stroke that matched
      // nothing well is a shape problem being reported twice, not an order one.
      outOfOrder: pairing.attemptIndex !== referenceIndex && pairing.distance < opts.failDistance
    }
  })

  const extraStrokes: number[] = []
  for (let a = 0; a < normalisedAttempt.length; a++) {
    if (!usedAttempt.has(a))
      extraStrokes.push(a)
  }

  const shapeScore = strokes.reduce((sum, s) => sum + s.score, 0) / strokes.length
  const outOfOrderCount = strokes.filter(s => s.outOfOrder).length
  const reversedCount = strokes.filter(s => s.reversed).length

  const score = clamp(
    shapeScore
    - (outOfOrderCount / strokes.length) * opts.orderPenalty
    - (reversedCount / strokes.length) * opts.directionPenalty
    - extraStrokes.length * opts.extraStrokePenalty,
    0,
    100
  )

  const issues: HandwritingIssue[] = []
  if (drawn.length < reference.length)
    issues.push('too-few-strokes')
  if (drawn.length > reference.length)
    issues.push('too-many-strokes')
  if (outOfOrderCount > 0)
    issues.push('stroke-order')
  if (reversedCount > 0)
    issues.push('stroke-direction')
  if (strokes.some(s => s.attemptIndex !== null && s.score < opts.passScore))
    issues.push('stroke-shape')

  return {
    score,
    // Stroke count is definitional, so it gates the pass independently of how
    // neat the strokes that WERE drawn happen to be.
    passed: score >= opts.passScore && drawn.length === reference.length,
    strokeCountExpected: reference.length,
    strokeCountDrawn: drawn.length,
    strokes,
    extraStrokes,
    issues
  }
}

/**
 * Turn a handwriting score into an FSRS rating.
 *
 * The canvas is the one exercise with a real continuous score rather than a
 * right/wrong plus a self-rating, so the rating is derived instead of asked
 * for. Self-rating your own handwriting is exactly the judgement people are
 * worst at — the whole reason the grader exists.
 *
 * A failed attempt is always Again: there is no "hard but correct" version of
 * a character with a stroke missing.
 */
export function ratingFromGrade(grade: HandwritingGrade): 1 | 2 | 3 | 4 {
  if (!grade.passed)
    return 1
  if (grade.score >= 95)
    return 4
  if (grade.score >= 85)
    return 3
  return 2
}
