import type { FSRSParameters } from 'ts-fsrs'

import { generatorParameters } from 'ts-fsrs'

import type { FsrsParams } from '@/types/srs.js'

/**
 * Build ts-fsrs parameters from a user's stored tuning.
 *
 * Fuzz is left ON by default. That is safe for replay: ts-fsrs contains no
 * `Math.random` at all — its default seed strategy derives from
 * `review_time`, `reps` and `difficulty * stability`, so the same inputs always
 * produce the same interval. Fuzz still does its real job of spreading review
 * load across days, without costing determinism.
 */
export function buildParameters(params: FsrsParams = {}): FSRSParameters {
  return generatorParameters({
    ...(params.w ? { w: params.w } : {}),
    ...(params.requestRetention !== undefined ? { request_retention: params.requestRetention } : {}),
    ...(params.maximumInterval !== undefined ? { maximum_interval: params.maximumInterval } : {}),
    enable_fuzz: params.enableFuzz ?? true
  })
}
