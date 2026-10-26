import type { PromptContext, PromptOption } from '@nihongo/shared/types'

import { createHash } from 'node:crypto'

/**
 * The tie-break between prompts, `md5(prompt id + salt)` with a per-request
 * salt, so the pick varies between requests but holds within one. This was
 * SQL (`md5(p.id || salt)`, text compared); hex digests sort the same in Node
 * as in Postgres under any collation, being fixed-length lowercase hex.
 */
export function promptOrderKey(promptId: string, salt: string): string {
  return createHash('md5').update(promptId + salt).digest('hex')
}

function eligible(option: PromptOption, ctx: PromptContext): boolean {
  return (option.requiresGrammarPointId === null || ctx.knownGrammar.has(option.requiresGrammarPointId))
    && (option.minState === null || ctx.state >= option.minState)
    && (option.maxReps === null || ctx.reps <= option.maxReps)
}

function exposureRank(option: PromptOption, state: number): number {
  if (!option.firstExposureOnly)
    return 1
  return state === 0 ? 0 : 2
}

interface Ranked {
  id: string
  missed: number
  exposure: number
  key: string
}

/** Missed first, then exposure, then the salted key. */
function precedes(a: Ranked, b: Ranked): boolean {
  if (a.missed !== b.missed)
    return a.missed < b.missed
  if (a.exposure !== b.exposure)
    return a.exposure < b.exposure
  return a.key < b.key
}

/**
 * WHICH prompt a facet shows this time, from its published options, or null
 * if none may be shown yet. The rules, all configured in the schema long
 * before anything read them:
 *
 * 1. `requires_grammar_point_id`: withhold a drill until the grammar that
 *    explains it has been learned. This is what stops 仕事's te-form drill
 *    arriving at sort_index 154 when 〜て form is at 165. A HARD filter.
 *
 * 2. `first_exposure_only`: the introduction goes first on first exposure and
 *    last afterwards. Deliberately an ORDERING and not a filter: `mcq` carries
 *    the flag globally, and for a kanji meaning facet it is the only prompt
 *    there is. Filtering would delete the card instead of demoting it.
 *
 * 3. `min_state` / `max_reps`: a template that should not appear until a card
 *    has bedded in, or should stop appearing once it has.
 *
 * And first of all, a question missed in its lesson comes back first: "If I
 * do a lesson I can review the questions later", the specific ones got wrong,
 * not the topic in general. An ORDERING, not a filter: it changes which prompt
 * a facet shows, never whether the card appears.
 *
 * Ties go to `promptOrderKey`.
 */
export function pickPrompt(options: readonly PromptOption[], ctx: PromptContext): string | null {
  let best: Ranked | null = null
  for (const option of options) {
    if (!eligible(option, ctx))
      continue
    const candidate: Ranked = {
      id: option.id,
      missed: ctx.missed.has(option.id) ? 0 : 1,
      exposure: exposureRank(option, ctx.state),
      key: promptOrderKey(option.id, ctx.salt)
    }
    if (!best || precedes(candidate, best))
      best = candidate
  }
  return best?.id ?? null
}
