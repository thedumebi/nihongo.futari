import { z } from '@hono/zod-openapi'

/**
 * Handwriting grading.
 *
 * Grading is geometric, not learned: resample -> normalise -> compare. No model,
 * no training data, and it runs identically in Node and the browser, so a review
 * can be graded offline on the phone exactly as the tests grade it here.
 */

/** A point in any coordinate space; grading normalises before comparing. */
export interface Point {
  x: number
  y: number
}

/** One pen-down-to-pen-up stroke, in the order the points were produced. */
export type Stroke = Point[]

/** What went wrong, as codes rather than prose so the UI owns the wording. */
export const HANDWRITING_ISSUES = [
  'too-few-strokes',
  'too-many-strokes',
  'stroke-order',
  'stroke-direction',
  'stroke-shape'
] as const

export type HandwritingIssue = (typeof HANDWRITING_ISSUES)[number]

export interface StrokeGrade {
  /** Index into the reference (i.e. the correct stroke number, 0-based). */
  referenceIndex: number
  /** Which drawn stroke matched it, or null if the user never drew it. */
  attemptIndex: number | null
  /** 0-100 for this stroke alone. */
  score: number
  /** Mean point distance as a fraction of the character's size. */
  meanDistance: number
  /** Drawn end-to-start (correct shape, wrong direction). */
  reversed: boolean
  /** Drawn at a different position in the sequence. */
  outOfOrder: boolean
}

export interface HandwritingGrade {
  /** 0-100 overall. */
  score: number
  /**
   * Whether this counts as correct. Requires the score threshold AND the exact
   * stroke count: stroke count is definitional for a kanji, not a stylistic
   * preference, so a missing stroke is never a pass however neat the rest is.
   */
  passed: boolean
  strokeCountExpected: number
  strokeCountDrawn: number
  /** One entry per reference stroke, in reference order. */
  strokes: StrokeGrade[]
  /** Indices of drawn strokes that matched nothing. */
  extraStrokes: number[]
  issues: HandwritingIssue[]
}

export interface HandwritingGradeOptions {
  /** Points each stroke is resampled to before comparison. */
  resampleCount?: number
  /** Distance at or below which a stroke is perfect. */
  perfectDistance?: number
  /** Distance at or above which a stroke scores zero. */
  failDistance?: number
  /** Points deducted when EVERY stroke is out of order; scaled by the fraction that are. */
  orderPenalty?: number
  /** Points deducted when EVERY stroke is backwards; scaled by the fraction that are. */
  directionPenalty?: number
  /** Points deducted per extra stroke. */
  extraStrokePenalty?: number
  /** Score needed to pass. */
  passScore?: number
}

/**
 * Reference strokes as served to the client.
 *
 * `viewBox` is KanjiVG's 109x109 box. The client scales it to whatever canvas
 * it has; grading normalises anyway, so the exact size never matters.
 */
export const referenceStrokeSchema = z.object({
  index: z.number().int().nonnegative(),
  /** SVG path `d`, in the 109x109 box. */
  path: z.string(),
  /** CJK stroke type, e.g. ㇐. Null where KanjiVG does not classify it. */
  kvgType: z.string().nullable()
}).openapi('ReferenceStroke')

export const writingCharacterSchema = z.object({
  character: z.string(),
  kind: z.enum(['kanji', 'kana']),
  viewBox: z.number().int().positive(),
  /** Kanji meanings, or the romaji for a kana — whatever names the character. */
  label: z.string().nullable(),
  readings: z.array(z.string()),
  strokeCount: z.number().int().nonnegative(),
  strokes: z.array(referenceStrokeSchema)
}).openapi('WritingCharacter')

export const writingQueueSchema = z.object({
  items: z.array(writingCharacterSchema),
  total: z.number().int().nonnegative()
}).openapi('WritingQueue')

export type ReferenceStroke = z.infer<typeof referenceStrokeSchema>
export type WritingCharacter = z.infer<typeof writingCharacterSchema>
export type WritingQueue = z.infer<typeof writingQueueSchema>
