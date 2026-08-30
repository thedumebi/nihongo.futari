import type {
  AnswerResult,
  CardState,
  CourseLevel,
  CourseResponse,
  DueListQuery,
  DueListResponse,
  GhostPolicy,
  ReviewEvent,
  SrsCard,
  StageProgress,
  StudyDecksResponse,
  StudyQueueItem,
  StudyQueueQuery,
  StudyQueueResponse,
  SubmitAnswerInput
} from '@nihongo/shared/types'
import type { SQL } from 'drizzle-orm'

import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'
import db from '@nihongo/shared/db'
import {
  curriculumUnitItems,
  curriculumUnits,
  exercisePrompts,
  exerciseTemplates,
  grammarPoints,
  kana,
  kanji,
  languageLevels,
  languages,
  phoneticSeries,
  sentences,
  srsCards,
  srsGhostEvents,
  srsReviewLogs,
  studyItemFacets,
  studyItems,
  userSettings,
  words
} from '@nihongo/shared/db/schema'
import {
  applyReview,
  canFastForward,
  clampReviewedAt,
  emptyCardState,
  evaluateGhost,
  replay
} from '@nihongo/shared/lib'
import { ghostPolicySchema } from '@nihongo/shared/types'
import { and, asc, eq, inArray, isNull, lte, sql } from 'drizzle-orm'

import { assetUrl, withAssetUrls, withDialogueAudio } from '@/lib/assets.js'

import { glossary, withDialogueTokens, withPromptTokens } from './glossary.service.js'
import { recomputeProgress } from './progress.service.js'

/**
 * SRS persistence.
 *
 * The invariant this file exists to protect: `srs_review_logs` is the source of
 * truth and `srs_cards` is a cache of the fold over it. Every write here either
 * appends to the log and re-derives the card, or it is a bug.
 */

function toCardState(row: SrsCard): CardState {
  return {
    due: row.due,
    stability: row.stability,
    difficulty: row.difficulty,
    elapsedDays: row.elapsedDays,
    scheduledDays: row.scheduledDays,
    learningSteps: row.learningSteps,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state,
    lastReview: row.lastReview
  }
}

function cardStateColumns(state: CardState) {
  return {
    due: state.due,
    stability: state.stability,
    difficulty: state.difficulty,
    elapsedDays: state.elapsedDays,
    scheduledDays: state.scheduledDays,
    learningSteps: state.learningSteps,
    reps: state.reps,
    lapses: state.lapses,
    state: state.state,
    lastReview: state.lastReview
  }
}

async function loadPolicy(userId: string): Promise<{ policy: GhostPolicy, fsrsParams: Record<string, unknown> }> {
  const [settings] = await db
    .select({
      threshold: userSettings.ghostThreshold,
      factor: userSettings.ghostIntervalFactor,
      fsrsParams: userSettings.fsrsParams
    })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1)

  const policy = ghostPolicySchema.parse({
    ...(settings?.threshold !== undefined ? { threshold: settings.threshold } : {}),
    ...(settings?.factor !== undefined ? { intervalFactor: Number(settings.factor) } : {})
  })

  return { policy, fsrsParams: settings?.fsrsParams ?? {} }
}

/**
 * Record one answer.
 *
 * 1. Append the log, keyed by the client-minted id, `ON CONFLICT DO NOTHING`.
 *    A retried flush is therefore free and never double-counts.
 * 2. If every new event is later than the card's last review, fast-path it.
 * 3. Otherwise re-fold the card's whole history — a late-arriving offline
 *    review changes every value after it, and FSRS has no commutative merge.
 *
 * The whole thing runs in one transaction with the card row locked, so two
 * concurrent syncs for the same card serialise instead of racing.
 */
export async function submitAnswer(userId: string, input: SubmitAnswerInput): Promise<AnswerResult> {
  const receivedAt = new Date()
  const { policy, fsrsParams } = await loadPolicy(userId)

  const outcome = await db.transaction(async (tx) => {
    const [facet] = await tx
      .select({
        facetId: studyItemFacets.id,
        studyItemId: studyItems.id,
        languageId: studyItems.languageId
      })
      .from(studyItemFacets)
      .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
      .where(eq(studyItemFacets.id, input.facetId))
      .limit(1)

    if (!facet)
      throw new Error(`Unknown facet: ${input.facetId}`)

    // Lock the card row (or create it on first sight of this facet).
    const [existing] = await tx
      .select()
      .from(srsCards)
      .where(and(eq(srsCards.userId, userId), eq(srsCards.facetId, input.facetId)))
      .for('update')
      .limit(1)

    let card = existing
    if (!card) {
      const seed = emptyCardState(receivedAt)
      const [created] = await tx
        .insert(srsCards)
        .values({
          userId,
          facetId: facet.facetId,
          languageId: facet.languageId,
          ...cardStateColumns(seed),
          firstSeenAt: receivedAt
        })
        .onConflictDoNothing()
        .returning()

      card = created ?? (await tx
        .select()
        .from(srsCards)
        .where(and(eq(srsCards.userId, userId), eq(srsCards.facetId, input.facetId)))
        .for('update')
        .limit(1))[0]!
    }

    // Clamp the client's clock BEFORE it enters the log, so the per-card order
    // stays strictly total — replay depends on that.
    const clamped = clampReviewedAt(new Date(input.reviewedAt), receivedAt, card.lastReview)

    const [inserted] = await tx
      .insert(srsReviewLogs)
      .values({
        id: input.id,
        userId,
        cardId: card.id,
        facetId: facet.facetId,
        studyItemId: facet.studyItemId,
        languageId: facet.languageId,
        rating: input.rating,
        reviewedAt: clamped.reviewedAt,
        clientReviewedAt: new Date(input.reviewedAt),
        receivedAt,
        clockAdjusted: clamped.adjusted,
        offline: input.offline,
        ...(input.sessionId ? { sessionId: input.sessionId } : {}),
        ...(input.clientId ? { clientId: input.clientId } : {}),
        ...(input.clientSeq !== undefined ? { clientSeq: input.clientSeq } : {}),
        ...(input.durationMs !== undefined ? { durationMs: input.durationMs } : {}),
        ...(input.templateId ? { exerciseTemplateId: input.templateId } : {}),
        ...(input.promptId ? { exercisePromptId: input.promptId } : {}),
        ...(input.answerGiven ? { answerGiven: input.answerGiven } : {}),
        ...(input.isCorrect !== undefined ? { isCorrect: input.isCorrect } : {}),
        hintsUsed: input.hintsUsed
      })
      .onConflictDoNothing({ target: srsReviewLogs.id })
      .returning({ id: srsReviewLogs.id })

    // Already recorded — return current state without touching anything.
    if (!inserted) {
      return {
        languageId: facet.languageId,
        result: {
          applied: false,
          cardId: card.id,
          card: toCardState(card),
          ghost: card.ghost,
          replayed: false,
          clockAdjusted: false,
          serverTime: receivedAt.toISOString()
        }
      }
    }

    const event: ReviewEvent = {
      id: input.id,
      rating: input.rating,
      reviewedAt: clamped.reviewedAt,
      ...(input.clientId ? { clientId: input.clientId } : {})
    }

    const cached = toCardState(card)
    const fast = canFastForward(cached, [event])
    let next: CardState
    let replayed = false

    if (fast) {
      next = applyReview(cached, event, fsrsParams).state
    } else {
      // Stale cache: re-fold the entire history for this card.
      const history = await tx
        .select({
          id: srsReviewLogs.id,
          rating: srsReviewLogs.rating,
          reviewedAt: srsReviewLogs.reviewedAt,
          clientId: srsReviewLogs.clientId
        })
        .from(srsReviewLogs)
        .where(and(eq(srsReviewLogs.userId, userId), eq(srsReviewLogs.cardId, card.id)))
        .orderBy(asc(srsReviewLogs.reviewedAt), asc(srsReviewLogs.id))

      const folded = replay(
        history.map(h => ({
          id: h.id,
          rating: h.rating as ReviewEvent['rating'],
          reviewedAt: h.reviewedAt,
          clientId: h.clientId
        })),
        fsrsParams
      )
      next = folded.state
      replayed = true

      if (folded.supersededIds.length > 0) {
        await tx
          .update(srsReviewLogs)
          .set({ superseded: true })
          .where(sql`${srsReviewLogs.id} in ${folded.supersededIds}`)
      }
    }

    const wasCorrect = input.rating !== 1
    const consecutiveCorrect = wasCorrect ? card.consecutiveCorrect + 1 : 0

    const recent = await tx
      .select({ rating: srsReviewLogs.rating })
      .from(srsReviewLogs)
      .where(and(eq(srsReviewLogs.userId, userId), eq(srsReviewLogs.cardId, card.id)))
      .orderBy(asc(srsReviewLogs.reviewedAt))
      .limit(policy.recentWindow)

    const decision = evaluateGhost({
      ghost: card.ghost,
      lapses: next.lapses,
      consecutiveCorrect,
      scheduledDays: next.scheduledDays,
      recentRatings: recent.map(r => r.rating as 1 | 2 | 3 | 4)
    }, policy)

    await tx
      .update(srsCards)
      .set({
        ...cardStateColumns(next),
        ghost: decision.ghost,
        ...(decision.event === 'flagged' ? { ghostSince: receivedAt } : {}),
        ...(decision.reason ? { ghostReason: decision.reason } : {}),
        consecutiveCorrect,
        totalCorrect: card.totalCorrect + (wasCorrect ? 1 : 0),
        totalReviews: card.totalReviews + 1,
        ...(wasCorrect ? { lastCorrectAt: receivedAt } : {}),
        lastAppliedLogId: input.id,
        historyVersion: card.historyVersion + 1,
        ...(replayed ? { replayGeneration: card.replayGeneration + 1 } : {}),
        updatedAt: receivedAt
      })
      .where(eq(srsCards.id, card.id))

    if (decision.event) {
      await tx.insert(srsGhostEvents).values({
        cardId: card.id,
        userId,
        event: decision.event,
        lapsesAtEvent: next.lapses,
        ...(decision.reason ? { reason: decision.reason } : {})
      })
    }

    return {
      languageId: facet.languageId,
      result: {
        applied: true,
        cardId: card.id,
        card: next,
        ghost: decision.ghost,
        replayed,
        clockAdjusted: clamped.adjusted,
        serverTime: receivedAt.toISOString()
      }
    }
  })

  // Aggregates are recomputed OUTSIDE the card transaction so a slow rebuild
  // never holds the card lock. After a replay the whole history is redone: a
  // review inserted mid-history can change any later day, and there is no
  // cheaper correct answer.
  if (outcome.result.applied) {
    const since = outcome.result.replayed
      ? undefined
      : new Date(new Date(input.reviewedAt).getTime() - 2 * 24 * 60 * 60 * 1000)
    await recomputeProgress(userId, outcome.languageId, since)
  }

  return outcome.result
}

/**
 * Build a review queue.
 *
 * Due cards first (oldest due first), then new items up to the daily limit.
 * `horizonDays > 0` pulls forward the next N days so the client can cache an
 * offline bundle.
 *
 * Every clause is scoped by `userId` — a queue that leaks another learner's
 * cards is a data-leak bug, not a ranking bug.
 */
/**
 * How many items make one stage.
 *
 * A stage is the unit of progression: new material is introduced a stage at a
 * time, and the next one opens when this one is mostly learned. Fifty puts N5
 * at 57 stages — small enough that finishing one is a real event, large enough
 * that the whole level is not a thousand tick-boxes.
 */
const STAGE_SIZE = 50

/** The share of a stage that must be retained before the next one opens. */
const STAGE_PASS = 0.8

/**
 * The furthest point in each level this user may be introduced to.
 *
 * Reviews are never gated — anything already started keeps coming back. This
 * bounds only what is NEW, so the corpus is met in the order
 * `build-curriculum` put it in rather than all at once.
 *
 * Returns a sort_index ceiling per level. A level with every stage complete is
 * absent from the map, which means no ceiling at all.
 */
export async function stageCeilings(userId: string, languageId: string): Promise<Map<string, number>> {
  const result = await db.execute(sql`
    -- Progress is measured per ITEM, not per facet, and that distinction is
    -- load-bearing rather than stylistic.
    --
    -- Counting facets made the denominator grow whenever a new KIND of drill
    -- was added to existing content. Introducing a listening card for every
    -- word took stage 4 of N5 from 135 facets to 178 — so a reader sitting at
    -- exactly the 80% pass mark (108/135) silently became 108/178, or 61%.
    -- Because the ceiling is the FIRST failing stage, that does not merely stop
    -- progress: it drags the ceiling BACKWARDS and re-locks material that had
    -- already been unlocked, for content the reader had not got wrong.
    --
    -- An item counts as met once any of its facets reaches review state. The
    -- gate exists to pace movement through the curriculum, not to demand every
    -- drill type on a word before the next word is allowed to appear.
    with items as (
      select
        si.id,
        si.level_id,
        ceil(si.sort_index::float / ${STAGE_SIZE}) as stage,
        -- bool_or ignores nulls and returns null when every row is null, which
        -- is precisely the never-studied case, so it needs a floor.
        coalesce(bool_or(sc.state >= 2), false) as learned
      from study_items si
      join study_item_facets f on f.study_item_id = si.id and f.enabled
      left join srs_cards sc on sc.facet_id = f.id and sc.user_id = ${userId}
      where si.published and si.active
        and si.level_id is not null
        and si.language_id = ${languageId}
      group by si.id, si.level_id, stage
    ),
    stages as (
      select
        level_id,
        stage,
        count(*) as total,
        count(*) filter (where learned) as learned
      from items
      group by 1, 2
    )
    select level_id, min(stage) as first_open
    from stages
    -- The first stage not yet retained well enough. Everything before it is
    -- done; it is the one you are on; nothing after it is offered yet.
    where learned::float / greatest(total, 1) < ${STAGE_PASS}
    group by 1
  `)

  const ceilings = new Map<string, number>()
  for (const row of (result.rows ?? []) as Array<Record<string, unknown>>) {
    const levelId = String(row.level_id)
    const firstOpen = Number(row.first_open)
    // Inclusive: the stage you are on is fully available.
    ceilings.set(levelId, firstOpen * STAGE_SIZE)
  }
  return ceilings
}

/**
 * The reader's position in each level, for showing the progression.
 *
 * Same shape as `stageCeilings` but carrying the numbers a person can read:
 * which stage, out of how many, and how far through it they are.
 */
export async function stageProgress(userId: string, languageId: string): Promise<StageProgress[]> {
  const result = await db.execute(sql`
    -- Counted per ITEM, exactly as \`stageCeilings\` counts. These two must
    -- agree: this is the number on screen and that is the rule that actually
    -- unlocks the next stage, so measuring them differently means the bar can
    -- sit at 100% while the stage is still shut, or open a stage the bar says
    -- is half done. Same query shape, deliberately.
    with items as (
      select
        si.id,
        si.level_id,
        ceil(si.sort_index::float / ${STAGE_SIZE}) as stage,
        coalesce(bool_or(sc.state >= 2), false) as learned
      from study_items si
      join study_item_facets f on f.study_item_id = si.id and f.enabled
      left join srs_cards sc on sc.facet_id = f.id and sc.user_id = ${userId}
      where si.published and si.active
        and si.level_id is not null
        and si.language_id = ${languageId}
      group by si.id, si.level_id, stage
    ),
    stages as (
      select
        level_id,
        stage,
        count(*) as total,
        count(*) filter (where learned) as learned
      from items
      group by 1, 2
    ),
    current as (
      select level_id, min(stage) as stage
      from stages
      where learned::float / greatest(total, 1) < ${STAGE_PASS}
      group by 1
    )
    select
      l.code as level,
      c.stage,
      (select count(*) from stages s where s.level_id = c.level_id) as stages,
      s.learned,
      s.total
    from current c
    join stages s on s.level_id = c.level_id and s.stage = c.stage
    join language_levels l on l.id = c.level_id
    order by l.sort_index
  `)

  return ((result.rows ?? []) as Array<Record<string, unknown>>).map(row => ({
    level: String(row.level),
    stage: Number(row.stage),
    stages: Number(row.stages),
    learned: Number(row.learned),
    total: Number(row.total)
  }))
}

export async function getQueue(userId: string, query: StudyQueueQuery): Promise<StudyQueueResponse> {
  const now = new Date()
  const horizon = new Date(now.getTime() + query.horizonDays * 24 * 60 * 60 * 1000)

  const [language] = await db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, query.languageCode))
    .limit(1)

  if (!language) {
    return { items: [], counts: { due: 0, learning: 0, newAvailable: 0, ghost: 0 }, gate: null, progress: [], serverTime: now.toISOString() }
  }

  const [settings] = await db
    .select({ dailyNewLimit: userSettings.dailyNewLimit })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1)
  const newLimit = settings?.dailyNewLimit ?? 10

  // Deck filters. `kind` narrows the content type, `unit` narrows to a
  // curriculum unit — a script (hiragana) or a scenario (at a restaurant).
  /**
   * Salt for choosing WHICH prompt a facet shows this time.
   *
   * Deliberately not `order by random()`: that pick lives in a CORRELATED
   * subquery, which Postgres re-evaluates per candidate row — so a fresh random
   * choice each evaluation means the `ep.id = (...)` equality almost never
   * holds. Facets with a single prompt survived that; facets with several (the
   * conjugation drills) silently vanished from the queue.
   *
   * Hashing against a per-request salt is stable WITHIN one query, so the
   * equality holds, while still varying between requests.
   */
  const promptSalt = Math.random().toString(36).slice(2)

  const kindFilter = query.kind ? [eq(studyItems.kind, query.kind)] : []

  // Level, resolved from its code. An unknown code must match NOTHING rather
  // than silently falling back to every level — a filter that quietly does not
  // apply is worse than one that returns an empty queue.
  const levelId = query.level
    ? (await db
        .select({ id: languageLevels.id })
        .from(languageLevels)
        .where(and(eq(languageLevels.languageId, language.id), eq(languageLevels.code, query.level)))
        .limit(1)
      )[0]?.id ?? ''
    : null
  const levelFilter = levelId === null ? [] : [eq(studyItems.levelId, levelId)]

  const unitIds = query.unit
    ? (await db
        .select({ studyItemId: curriculumUnitItems.studyItemId })
        .from(curriculumUnitItems)
        .innerJoin(curriculumUnits, eq(curriculumUnits.id, curriculumUnitItems.unitId))
        .where(and(eq(curriculumUnits.languageId, language.id), eq(curriculumUnits.code, query.unit)))
      ).map(r => r.studyItemId)
    : null
  // An empty unit must match nothing, not everything.
  const unitFilter = unitIds ? [inArray(studyItems.id, unitIds.length > 0 ? unitIds : [''])] : []

  const promptColumns = {
    templateCode: exerciseTemplates.code,
    inputMode: exerciseTemplates.inputMode,
    graderCode: exerciseTemplates.graderCode,
    prompt: exercisePrompts.prompt,
    answer: exercisePrompts.answer,
    distractors: exercisePrompts.distractors,
    assets: exercisePrompts.assets
  }

  // --- Due: cards this user has already started -----------------------------
  //
  // Skipped entirely in `new` mode. The two modes were not symmetrical: `due`
  // excluded new cards from the start, but `new` never excluded due ones, so
  // "Learning new cards" quietly served reviews alongside — the opposite of
  // what the chip on the page promised.
  const dueRows = query.mode === 'new'
    ? []
    : await db
        .select({
          cardId: srsCards.id,
          facetId: studyItemFacets.id,
          studyItemId: studyItems.id,
          kind: studyItems.kind,
          facet: studyItemFacets.facet,
          due: srsCards.due,
          ghost: srsCards.ghost,
          state: srsCards.state,
          stability: srsCards.stability,
          difficulty: srsCards.difficulty,
          elapsedDays: srsCards.elapsedDays,
          scheduledDays: srsCards.scheduledDays,
          learningSteps: srsCards.learningSteps,
          reps: srsCards.reps,
          lapses: srsCards.lapses,
          lastReview: srsCards.lastReview,
          ...promptColumns
        })
        .from(srsCards)
        .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
        .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
      // ONE prompt per facet. A facet is one card; the prompt pool is meant to
      // vary WHICH drill you get, not to hand the same card back several times.
      // Without this, a facet with four conjugation forms would appear four
      // times in a single queue.
        .innerJoin(exercisePrompts, and(
          eq(exercisePrompts.facetId, studyItemFacets.id),
          eq(exercisePrompts.id, sql`(
        select p.id from exercise_prompts p
        where p.facet_id = ${studyItemFacets.id} and p.status = 'published'
        order by md5(p.id || ${promptSalt}) limit 1
      )`)
        ))
        .innerJoin(exerciseTemplates, eq(exerciseTemplates.id, exercisePrompts.templateId))
        .where(and(
          eq(srsCards.userId, userId),
          eq(srsCards.languageId, language.id),
          eq(srsCards.suspended, false),
          lte(srsCards.due, horizon),
          eq(studyItems.published, true),
          eq(studyItems.active, true),
          ...kindFilter,
          ...unitFilter,
          ...levelFilter
        ))
        .orderBy(asc(srsCards.due))
        .limit(query.limit)

  // --- New: published items this user has never seen ------------------------
  //
  // Bounded by the curriculum. Without this the "new" pool was the entire
  // corpus at once, so there was no progression — just 12,000 items in an
  // order nothing had set. Reviews are deliberately NOT bounded: anything
  // already started keeps coming back regardless of where it sits.
  const ceilings = await stageCeilings(userId, language.id)
  const withinCurriculum = ceilings.size === 0 ? [] : [sql.raw(curriculumPredicate(ceilings))]
  // Without this a fresh account gets an empty queue forever, because a card
  // only comes into existence when the first answer is recorded.
  const newRows = query.mode === 'due'
    ? []
    : await db
        .select({
          facetId: studyItemFacets.id,
          studyItemId: studyItems.id,
          kind: studyItems.kind,
          facet: studyItemFacets.facet,
          sortIndex: studyItems.sortIndex,
          ...promptColumns
        })
        .from(studyItemFacets)
        .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
        .innerJoin(exercisePrompts, and(
          eq(exercisePrompts.facetId, studyItemFacets.id),
          eq(exercisePrompts.id, sql`(
            select p.id from exercise_prompts p
            where p.facet_id = ${studyItemFacets.id} and p.status = 'published'
            order by md5(p.id || ${promptSalt}) limit 1
          )`)
        ))
        .innerJoin(exerciseTemplates, eq(exerciseTemplates.id, exercisePrompts.templateId))
        .leftJoin(srsCards, and(eq(srsCards.facetId, studyItemFacets.id), eq(srsCards.userId, userId)))
        .where(and(
          eq(studyItems.languageId, language.id),
          eq(studyItems.published, true),
          eq(studyItems.active, true),
          eq(studyItemFacets.enabled, true),
          isNull(srsCards.id),
          ...withinCurriculum,
          ...kindFilter,
          ...unitFilter,
          ...levelFilter
        ))
        .orderBy(asc(studyItems.sortIndex))
        .limit(Math.max(0, Math.min(newLimit, query.limit - dueRows.length)))

  /**
   * Shuffle before returning.
   *
   * Without this the queue comes back in sort_index order, so every session
   * starts at あ and drills the gojūon in the same sequence. That trains the
   * ORDER as much as the characters — you end up recalling "the one after い"
   * rather than recognising う on sight. Ordering still governs which items are
   * INTRODUCED; it just shouldn't govern how they're presented.
   */
  function shuffle<T>(list: T[]): T[] {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[list[i], list[j]] = [list[j]!, list[i]!]
    }
    return list
  }

  // One dictionary load for the whole queue, not one per dialogue. Cached for
  // the process lifetime, so this is a map lookup after the first request.
  const gloss = await glossary(query.languageCode)

  const items: StudyQueueItem[] = [
    ...dueRows.map(r => ({
      cardId: r.cardId,
      facetId: r.facetId,
      studyItemId: r.studyItemId,
      kind: r.kind as StudyQueueItem['kind'],
      facet: r.facet as StudyQueueItem['facet'],
      due: r.due.toISOString(),
      isNew: r.state === 0,
      ghost: r.ghost,
      card: {
        due: r.due,
        stability: r.stability,
        difficulty: r.difficulty,
        elapsedDays: r.elapsedDays,
        scheduledDays: r.scheduledDays,
        learningSteps: r.learningSteps,
        reps: r.reps,
        lapses: r.lapses,
        state: r.state,
        lastReview: r.lastReview
      },
      templateCode: r.templateCode as StudyQueueItem['templateCode'],
      inputMode: r.inputMode,
      graderCode: r.graderCode,
      prompt: withPromptTokens(withDialogueTokens(withDialogueAudio(r.prompt), gloss), gloss),
      answer: r.answer,
      distractors: r.distractors,
      assets: withAssetUrls(r.assets)
    })),
    ...newRows.map(r => ({
      cardId: null,
      facetId: r.facetId,
      studyItemId: r.studyItemId,
      kind: r.kind as StudyQueueItem['kind'],
      facet: r.facet as StudyQueueItem['facet'],
      due: now.toISOString(),
      isNew: true,
      ghost: false,
      card: null,
      templateCode: r.templateCode as StudyQueueItem['templateCode'],
      inputMode: r.inputMode,
      graderCode: r.graderCode,
      prompt: withPromptTokens(withDialogueTokens(withDialogueAudio(r.prompt), gloss), gloss),
      answer: r.answer,
      distractors: r.distractors,
      assets: withAssetUrls(r.assets)
    }))
  ]

  shuffle(items)

  const [counts] = await db
    .select({
      // Review-state only. Learning-step repeats are counted separately so the
      // headline number means "things you actually need to revisit".
      due: sql<number>`count(*) filter (where ${srsCards.due} <= ${now} and ${srsCards.state} = 2 and not ${srsCards.suspended})`.mapWith(Number),
      learning: sql<number>`count(*) filter (where ${srsCards.due} <= ${now} and ${srsCards.state} in (1, 3) and not ${srsCards.suspended})`.mapWith(Number),
      ghost: sql<number>`count(*) filter (where ${srsCards.ghost} and not ${srsCards.suspended})`.mapWith(Number)
    })
    .from(srsCards)
    .where(and(eq(srsCards.userId, userId), eq(srsCards.languageId, language.id)))

  const [newAvailable] = await db
    .select({ total: sql<number>`count(*)`.mapWith(Number) })
    .from(studyItemFacets)
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .leftJoin(srsCards, and(eq(srsCards.facetId, studyItemFacets.id), eq(srsCards.userId, userId)))
    .where(and(
      eq(studyItems.languageId, language.id),
      eq(studyItems.published, true),
      eq(studyItems.active, true),
      eq(studyItemFacets.enabled, true),
      isNull(srsCards.id),
      ...withinCurriculum,
      ...kindFilter,
      ...unitFilter,
      ...levelFilter
    ))

  // What this deck is holding back, if anything. Only worth asking when the
  // deck came up empty of new material — otherwise there is nothing to explain.
  const gate = newAvailable?.total || withinCurriculum.length === 0
    ? null
    : await deckGate(userId, language.id, [...kindFilter, ...unitFilter, ...levelFilter])

  return {
    items,
    gate,
    progress: await stageProgress(userId, language.id),
    counts: {
      due: counts?.due ?? 0,
      learning: counts?.learning ?? 0,
      newAvailable: newAvailable?.total ?? 0,
      ghost: counts?.ghost ?? 0
    },
    serverTime: now.toISOString()
  }
}

/**
 * The decks a learner can choose between.
 *
 * Both the broad kinds and the topical units are returned as one flat list with
 * a `group`, so the picker is a single menu rather than two competing concepts.
 * Counts are per-user, because "12 due" is the number that decides what you
 * study next.
 */
export async function getDecks(userId: string, languageCode: string, level?: string): Promise<StudyDecksResponse> {
  const now = new Date()
  const [language] = await db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, languageCode))
    .limit(1)
  if (!language)
    return { decks: [] }

  // The deck counts have to agree with what the queue will actually serve, so
  // the same level filter applies here. A picker reading "76 new" that then
  // hands over nothing is worse than no count at all.
  const levelId = level
    ? (await db
        .select({ id: languageLevels.id })
        .from(languageLevels)
        .where(and(eq(languageLevels.languageId, language.id), eq(languageLevels.code, level)))
        .limit(1)
      )[0]?.id ?? ''
    : null
  const levelFilter = levelId === null ? [] : [eq(studyItems.levelId, levelId)]

  // The unseen counts must respect the curriculum too. Without this the picker
  // advertised "Kanji 1351 new" while the queue, correctly gated, served none
  // of them — the same defect the level filter had, in a second place.
  const ceilings = await stageCeilings(userId, language.id)

  const byKind = await db
    .select({
      kind: studyItems.kind,
      total: sql<number>`count(distinct ${studyItemFacets.id})`.mapWith(Number),
      due: sql<number>`count(distinct ${srsCards.id}) filter (where ${srsCards.due} <= ${now} and ${srsCards.state} = 2 and not ${srsCards.suspended})`.mapWith(Number),
      learning: sql<number>`count(distinct ${srsCards.id}) filter (where ${srsCards.due} <= ${now} and ${srsCards.state} in (1, 3) and not ${srsCards.suspended})`.mapWith(Number),
      unseen: sql<number>`count(distinct ${studyItemFacets.id}) filter (where ${srsCards.id} is null${sql.raw(ceilings.size === 0 ? '' : ` and ${curriculumPredicate(ceilings)}`)})`.mapWith(Number),
      locked: sql<number>`count(distinct ${studyItemFacets.id}) filter (where ${srsCards.id} is null${sql.raw(ceilings.size === 0 ? ' and false' : ` and not ${curriculumPredicate(ceilings)}`)})`.mapWith(Number)
    })
    .from(studyItems)
    .innerJoin(studyItemFacets, eq(studyItemFacets.studyItemId, studyItems.id))
    .leftJoin(srsCards, and(eq(srsCards.facetId, studyItemFacets.id), eq(srsCards.userId, userId)))
    .where(and(
      eq(studyItems.languageId, language.id),
      eq(studyItems.published, true),
      eq(studyItems.active, true),
      eq(studyItemFacets.enabled, true),
      ...levelFilter
    ))
    .groupBy(studyItems.kind)

  const byUnit = await db
    .select({
      code: curriculumUnits.code,
      title: curriculumUnits.title,
      description: curriculumUnits.description,
      imageUrl: curriculumUnits.imageUrl,
      sortIndex: curriculumUnits.sortIndex,
      total: sql<number>`count(distinct ${studyItemFacets.id})`.mapWith(Number),
      due: sql<number>`count(distinct ${srsCards.id}) filter (where ${srsCards.due} <= ${now} and ${srsCards.state} = 2 and not ${srsCards.suspended})`.mapWith(Number),
      learning: sql<number>`count(distinct ${srsCards.id}) filter (where ${srsCards.due} <= ${now} and ${srsCards.state} in (1, 3) and not ${srsCards.suspended})`.mapWith(Number),
      unseen: sql<number>`count(distinct ${studyItemFacets.id}) filter (where ${srsCards.id} is null${sql.raw(ceilings.size === 0 ? '' : ` and ${curriculumPredicate(ceilings)}`)})`.mapWith(Number),
      locked: sql<number>`count(distinct ${studyItemFacets.id}) filter (where ${srsCards.id} is null${sql.raw(ceilings.size === 0 ? ' and false' : ` and not ${curriculumPredicate(ceilings)}`)})`.mapWith(Number)
    })
    .from(curriculumUnits)
    .innerJoin(curriculumUnitItems, eq(curriculumUnitItems.unitId, curriculumUnits.id))
    .innerJoin(studyItems, eq(studyItems.id, curriculumUnitItems.studyItemId))
    .innerJoin(studyItemFacets, eq(studyItemFacets.studyItemId, studyItems.id))
    .leftJoin(srsCards, and(eq(srsCards.facetId, studyItemFacets.id), eq(srsCards.userId, userId)))
    .where(and(
      eq(curriculumUnits.languageId, language.id),
      eq(curriculumUnits.published, true),
      eq(studyItems.published, true),
      eq(studyItemFacets.enabled, true),
      ...levelFilter
    ))
    .groupBy(curriculumUnits.code, curriculumUnits.title, curriculumUnits.description, curriculumUnits.imageUrl, curriculumUnits.sortIndex)
    .orderBy(asc(curriculumUnits.sortIndex))

  const KIND_LABELS: Record<string, { label: string, description: string }> = {
    'kana': { label: 'Kana', description: 'Hiragana and katakana' },
    'word': { label: 'Vocabulary', description: 'Words: meaning and reading' },
    'kanji': { label: 'Kanji', description: 'Stroke order and handwriting' },
    'grammar': { label: 'Grammar', description: 'Patterns, and why they work that way' },
    'sentence': { label: 'Sentences', description: 'Word order: rebuild a sentence from its parts' },
    'phonetic-series': { label: 'Sound series', description: 'Learn 青 = セイ, then watch 晴・清・静 fall into place' }
  }

  const decks: StudyDecksResponse['decks'] = [
    {
      id: 'all',
      group: 'kind' as const,
      label: 'Everything',
      // Named for what it CONTAINS, not for what is ready in it. "Everything
      // due" collided with the "Reviewing what's due" session and contradicted
      // its own tooltip, which read "0 due · 6082 not yet seen".
      description: 'Every kind of card together',
      kind: null,
      unit: null,
      imageUrl: null,
      total: byKind.reduce((n, k) => n + k.total, 0),
      due: byKind.reduce((n, k) => n + k.due, 0),
      learning: byKind.reduce((n, k) => n + k.learning, 0),
      unseen: byKind.reduce((n, k) => n + k.unseen, 0),
      locked: byKind.reduce((n, k) => n + k.locked, 0)
    },
    ...byKind.map(k => ({
      id: `kind:${k.kind}`,
      group: 'kind' as const,
      label: KIND_LABELS[k.kind]?.label ?? k.kind,
      description: KIND_LABELS[k.kind]?.description ?? null,
      kind: k.kind,
      unit: null,
      imageUrl: null,
      total: k.total,
      due: k.due,
      learning: k.learning,
      unseen: k.unseen,
      locked: k.locked
    })),
    ...byUnit.map(u => ({
      id: `unit:${u.code}`,
      // A script grouping and a real-world situation are both units, but they
      // read very differently in a menu, so they're grouped apart.
      group: (u.code === 'hiragana' || u.code === 'katakana' ? 'script' : 'scenario') as 'script' | 'scenario',
      label: u.title,
      description: u.description,
      kind: null,
      unit: u.code,
      // Through assetUrl like everything else: the scene SVGs live in the
      // bucket too, and a raw path here 404s once the images tree leaves the
      // image.
      imageUrl: u.imageUrl === null ? null : assetUrl(u.imageUrl),
      total: u.total,
      due: u.due,
      learning: u.learning,
      unseen: u.unseen,
      locked: u.locked
    }))
  ]

  return { decks: decks.filter(d => d.total > 0) }
}

/**
 * What is due, as a list you can read.
 *
 * The progress page could say "3 due" and the only way to find out WHAT was
 * a study session that handed them over one at a time. This answers the
 * question directly: every card the scheduler says is ready, named, with when
 * it fell due and a link to read about it.
 *
 * Ordered oldest-first, because the card that has been waiting longest is the
 * one closest to being forgotten.
 */
export async function getDueList(userId: string, query: DueListQuery): Promise<DueListResponse> {
  const now = new Date()

  const [language] = await db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, query.languageCode))
    .limit(1)
  if (!language)
    return { items: [], total: 0, byKind: [], serverTime: now.toISOString() }

  const kindFilter = query.kind ? [eq(studyItems.kind, query.kind)] : []

  // Learning and relearning cards count as due alongside review cards: all
  // three are things the scheduler wants back now.
  const isDue = and(
    eq(srsCards.userId, userId),
    eq(srsCards.languageId, language.id),
    eq(srsCards.suspended, false),
    lte(srsCards.due, now),
    eq(studyItems.published, true),
    eq(studyItems.active, true)
  )

  const rows = await db
    .select({
      cardId: srsCards.id,
      facetId: studyItemFacets.id,
      studyItemId: studyItems.id,
      kind: studyItems.kind,
      facet: studyItemFacets.facet,
      due: srsCards.due,
      ghost: srsCards.ghost,
      lapses: srsCards.lapses,
      kanaCharacter: kana.character,
      kanaRomaji: kana.romaji,
      kanjiCharacter: kanji.character,
      kanjiMeanings: kanji.meanings,
      wordForm: words.primaryForm,
      wordReading: words.primaryReading,
      grammarTitle: grammarPoints.title,
      grammarPattern: grammarPoints.pattern,
      grammarSlug: grammarPoints.slug,
      sentenceText: sentences.text,
      sentenceReading: sentences.readingKana,
      seriesCharacter: phoneticSeries.componentCharacter,
      seriesReading: phoneticSeries.primaryReading
    })
    .from(srsCards)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .leftJoin(kana, eq(kana.id, studyItems.kanaId))
    .leftJoin(kanji, eq(kanji.id, studyItems.kanjiId))
    .leftJoin(words, eq(words.id, studyItems.wordId))
    .leftJoin(grammarPoints, eq(grammarPoints.id, studyItems.grammarPointId))
    .leftJoin(sentences, eq(sentences.id, studyItems.sentenceId))
    .leftJoin(phoneticSeries, eq(phoneticSeries.id, studyItems.phoneticSeriesId))
    .where(and(isDue, ...kindFilter))
    .orderBy(asc(srsCards.due))
    .limit(query.limit)
    .offset(query.offset)

  const [totals] = await db
    .select({ total: sql<number>`count(*)`.mapWith(Number) })
    .from(srsCards)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .where(and(isDue, ...kindFilter))

  // The chip counts ignore the kind filter — otherwise selecting one kind
  // would zero every other chip and there would be no way back.
  const byKind = await db
    .select({ kind: studyItems.kind, count: sql<number>`count(*)`.mapWith(Number) })
    .from(srsCards)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .where(isDue)
    .groupBy(studyItems.kind)
    .orderBy(asc(studyItems.kind))

  const items = rows.map((r) => {
    // One arm of the exclusive arc is set, so exactly one of these holds.
    const [subject, detail, href] = r.kanaCharacter
      ? [r.kanaCharacter, r.kanaRomaji, null]
      : r.kanjiCharacter
        ? [r.kanjiCharacter, (r.kanjiMeanings ?? []).slice(0, 3).join(', ') || null, `${ROUTE_BASE_PATHS.KANJI}/${encodeURIComponent(r.kanjiCharacter)}`]
        : r.wordForm
          ? [r.wordForm, r.wordReading, null]
          : r.grammarTitle
            ? [r.grammarTitle, r.grammarPattern, r.grammarSlug ? `${ROUTE_BASE_PATHS.GRAMMAR}/${encodeURIComponent(r.grammarSlug)}` : null]
            : r.sentenceText
              ? [r.sentenceText, r.sentenceReading, null]
              : r.seriesCharacter
                ? [r.seriesCharacter, r.seriesReading, null]
                : ['(untitled)', null, null]

    return {
      cardId: r.cardId,
      facetId: r.facetId,
      studyItemId: r.studyItemId,
      kind: r.kind,
      facet: r.facet,
      subject,
      detail,
      due: r.due.toISOString(),
      ghost: r.ghost,
      lapses: r.lapses,
      href
    }
  })

  return { items, total: totals?.total ?? 0, byKind, serverTime: now.toISOString() }
}

/**
 * "This item is at or before the point the reader has reached in its level."
 *
 * Written without a sentinel. The first version coalesced the CASE to
 * Number.MAX_SAFE_INTEGER for levels with no ceiling, and `sort_index` is an
 * int4 — Postgres rejected the value outright, the endpoint 500'd, and the
 * client quietly served its offline cache, so the gate looked like it simply
 * had no effect. Saying "a level with no ceiling is unrestricted" directly
 * needs no magic number to be out of range.
 *
 * Inlined rather than parameterised because the map holds one row per level.
 * The ids come from the database, never from user input, and are quoted
 * regardless.
 */
function curriculumPredicate(ceilings: Map<string, number>): string {
  const quote = (value: string) => `'${value.replace(/'/gu, "''")}'`
  const ids = [...ceilings.keys()].map(quote).join(', ')
  const arms = [...ceilings]
    .map(([levelId, ceiling]) => `when ${quote(levelId)} then ${Math.floor(ceiling)}`)
    .join(' ')
  return `(
    study_items.level_id is null
    or study_items.level_id not in (${ids})
    or study_items.sort_index <= (case study_items.level_id ${arms} end)
  )`
}

/**
 * Why a deck has no new material, when the curriculum is the reason.
 *
 * Runs the same filters as the queue MINUS the stage ceiling. If items turn up,
 * they are waiting behind the gate rather than absent, and the first one's
 * position says which stage opens them.
 */
async function deckGate(
  userId: string,
  languageId: string,
  filters: SQL[]
): Promise<{ waiting: number, opensAtStage: number } | null> {
  const [row] = await db
    .select({
      waiting: sql<number>`count(*)`.mapWith(Number),
      firstAt: sql<number | null>`min(${studyItems.sortIndex})`
    })
    .from(studyItemFacets)
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .leftJoin(srsCards, and(eq(srsCards.facetId, studyItemFacets.id), eq(srsCards.userId, userId)))
    .where(and(
      eq(studyItems.languageId, languageId),
      eq(studyItems.published, true),
      eq(studyItems.active, true),
      eq(studyItemFacets.enabled, true),
      isNull(srsCards.id),
      ...filters
    ))

  if (!row || row.waiting === 0 || row.firstAt === null)
    return null
  return { waiting: row.waiting, opensAtStage: Math.ceil(row.firstAt / STAGE_SIZE) }
}

/**
 * The course: every level as an ordered path of stages.
 *
 * The study page is a set of filters over a corpus, which is the right tool
 * once you know what you are doing and no use at all when you are starting.
 * This is the other view — where you are, what comes next, and what each stage
 * actually contains.
 *
 * One query for the stage rollup and one for the samples. The samples are
 * limited to the stages worth previewing (the current one and its neighbours),
 * because fetching subjects for 280 stages to show six of them is waste.
 */
export async function getCourse(userId: string, languageCode: string): Promise<CourseResponse> {
  const [language] = await db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, languageCode))
    .limit(1)
  if (!language)
    return { levels: [] }

  const rollup = await db.execute(sql`
    with stages as (
      select
        si.level_id,
        ceil(si.sort_index::float / ${STAGE_SIZE}) as stage,
        si.kind,
        count(*) as total,
        count(*) filter (where sc.state >= 2) as learned
      from study_items si
      join study_item_facets f on f.study_item_id = si.id and f.enabled
      left join srs_cards sc on sc.facet_id = f.id and sc.user_id = ${userId}
      where si.published and si.active
        and si.level_id is not null
        and si.language_id = ${language.id}
      group by 1, 2, 3
    )
    select l.code as level, l.sort_index as level_order, s.stage, s.kind, s.total, s.learned
    from stages s
    join language_levels l on l.id = s.level_id
    order by l.sort_index, s.stage, s.kind
  `)

  interface Row { level: string, level_order: number, stage: number, kind: string, total: number, learned: number }
  const rows = ((rollup.rows ?? []) as unknown as Row[]).map(r => ({
    ...r,
    stage: Number(r.stage),
    total: Number(r.total),
    learned: Number(r.learned)
  }))

  // Group into levels, then stages.
  const byLevel = new Map<string, Map<number, { total: number, learned: number, kinds: Map<string, number> }>>()
  for (const row of rows) {
    const level = byLevel.get(row.level) ?? new Map()
    const stage = level.get(row.stage) ?? { total: 0, learned: 0, kinds: new Map<string, number>() }
    stage.total += row.total
    stage.learned += row.learned
    stage.kinds.set(row.kind, (stage.kinds.get(row.kind) ?? 0) + row.total)
    level.set(row.stage, stage)
    byLevel.set(row.level, level)
  }

  const samples = await stageSamples(language.id)

  const levels: CourseLevel[] = []
  for (const [level, stageMap] of byLevel) {
    const ordered = [...stageMap.entries()].sort((a, b) => a[0] - b[0])
    // The first stage not yet retained well enough — the one you are on.
    const current = ordered.find(([, v]) => v.learned / Math.max(v.total, 1) < STAGE_PASS)?.[0] ?? null

    levels.push({
      level,
      title: level,
      total: ordered.reduce((n, [, v]) => n + v.total, 0),
      learned: ordered.reduce((n, [, v]) => n + v.learned, 0),
      currentStage: current,
      stages: ordered.map(([stage, v]) => ({
        stage,
        total: v.total,
        learned: v.learned,
        kinds: [...v.kinds].map(([kind, count]) => ({ kind, count })).sort((a, b) => b.count - a.count),
        sample: samples.get(`${level}:${stage}`) ?? [],
        // Everything up to and including the current stage is reachable.
        open: current === null || stage <= current
      }))
    })
  }

  return { levels }
}

/** Up to four subjects per stage, so a stage can be described by its content. */
async function stageSamples(languageId: string): Promise<Map<string, string[]>> {
  const result = await db.execute(sql`
    with numbered as (
      select
        l.code as level,
        ceil(si.sort_index::float / ${STAGE_SIZE}) as stage,
        coalesce(ka.character, k.character, w.primary_form, g.title, '') as subject,
        row_number() over (
          partition by si.level_id, ceil(si.sort_index::float / ${STAGE_SIZE})
          order by si.sort_index
        ) as n
      from study_items si
      join language_levels l on l.id = si.level_id
      left join kana ka on ka.id = si.kana_id
      left join kanji k on k.id = si.kanji_id
      left join words w on w.id = si.word_id
      left join grammar_points g on g.id = si.grammar_point_id
      where si.published and si.active and si.language_id = ${languageId}
    )
    select level, stage, subject from numbered
    where n <= 4 and subject <> ''
    order by level, stage, n
  `)

  const map = new Map<string, string[]>()
  for (const row of (result.rows ?? []) as Array<Record<string, unknown>>) {
    const key = `${String(row.level)}:${Number(row.stage)}`
    const list = map.get(key) ?? []
    list.push(String(row.subject))
    map.set(key, list)
  }
  return map
}
