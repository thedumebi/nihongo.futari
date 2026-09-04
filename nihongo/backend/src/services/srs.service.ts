import type {
  AnswerResult,
  CardState,
  CourseLevel,
  CourseResponse,
  DueListQuery,
  DueListResponse,
  GhostPolicy,
  LessonSeenResult,
  ReviewEvent,
  SrsCard,
  StageCelebration,
  StageProgress,
  StudyDecksResponse,
  StudyQueueItem,
  StudyQueueQuery,
  StudyQueueResponse,
  SubmitAnswerInput
} from '@nihongo/shared/types'
import type { SQL, SQLWrapper } from 'drizzle-orm'

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
  lessonMisses,
  lessonViews,
  phoneticSeries,
  sentences,
  srsCards,
  srsGhostEvents,
  srsReviewLogs,
  stageCelebrations,
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
import { and, asc, eq, inArray, isNull, lt, lte, sql } from 'drizzle-orm'

import { assetUrl, withAssetUrls, withDialogueAudio } from '@/lib/assets.js'

import { glossary, withDialogueTokens, withPromptTokens } from './glossary.service.js'
import { hintFromLesson, loadLessons } from './grammar.service.js'
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
/**
 * What "due" means. One definition, used by every surface that prints a number.
 *
 * There were four, and they disagreed. Read off one account at one instant:
 * the reminder email said 26, Progress said "5 due · 21 in learning", the due
 * list said 26, and the Study header said 5 — for 21 actual words. The email
 * counted every state in every language including unpublished items and was
 * computed before a slow send loop; Progress counted `state = 2` only, which is
 * why it read 0 right after a session when everything sits in a learning step;
 * the due list counted every state; the queue header counted `state = 2` again.
 *
 * The rules, and why:
 *
 * - **States 1, 2 and 3 all count.** A learning-step card whose step has
 *   elapsed is, to a person, due. Splitting it into a second number called
 *   "in learning" is a scheduler-internal distinction leaking onto the screen,
 *   and it is what made Progress say 0 while the list it linked to had items.
 * - **State 0 never counts.** A card that has never been answered is "new",
 *   which is a different number.
 * - **published / active / enabled are part of it.** Without them the email
 *   counted cards on content that no longer exists, which no in-app surface
 *   could ever match.
 *
 * Note what is NOT here: nothing defers a scheduled review. Sibling burying —
 * answering one card of a word and hiding its others until tomorrow, which is
 * what Anki does — was built and then removed, because it delays reviews that
 * are owed. The owner's rule: "I would rather a review comes when it is due.
 * The new one can come later. I dont want it deferred." A word is still only
 * asked about once per queue (see the dedupe in `getQueue`); it is simply not
 * silenced for the rest of the day.
 */
function dueCardsWhere(userId: string, languageId: string, at: Date): SQL {
  return and(
    eq(srsCards.userId, userId),
    eq(srsCards.languageId, languageId),
    eq(srsCards.suspended, false),
    lte(srsCards.due, at),
    inArray(srsCards.state, [1, 2, 3]),
    eq(studyItemFacets.enabled, true),
    eq(studyItems.published, true),
    eq(studyItems.active, true)
  )!
}

/**
 * How much is due, in both units.
 *
 * `items` is the headline everywhere. A word is three or four cards — 7,646 of
 * them carry three, 594 carry four — so counting cards told the reader "26 due"
 * when 21 words were waiting, and the owner has said more than once that the
 * numbers are confusing. Cards stay available for the places that genuinely
 * mean cards.
 *
 * Since one card per item is served per session (see `getQueue`), the item
 * count is also the number of questions the reader will actually be asked,
 * which is the property that makes it honest rather than merely smaller.
 */
export async function countDue(
  userId: string,
  languageId: string,
  at: Date = new Date()
): Promise<{ items: number, cards: number }> {
  const [row] = await db
    .select({
      items: sql<number>`count(distinct ${studyItems.id})`.mapWith(Number),
      cards: sql<number>`count(*)`.mapWith(Number)
    })
    .from(srsCards)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .where(dueCardsWhere(userId, languageId, at))

  return { items: row?.items ?? 0, cards: row?.cards ?? 0 }
}

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

    // A question missed in its lesson, now answered correctly, stops being
    // owed and returns to the normal rotation.
    if (wasCorrect && input.promptId) {
      await tx
        .update(lessonMisses)
        .set({ clearedAt: receivedAt, updatedAt: receivedAt })
        .where(and(
          eq(lessonMisses.userId, userId),
          eq(lessonMisses.promptId, input.promptId),
          isNull(lessonMisses.clearedAt)
        ))
    }

    // Answering something IS meeting it.
    //
    // The introduction is suppressed by a `lesson_views` row, and the only
    // other thing that writes one is a fire-and-forget call from the browser as
    // the intro is dismissed. Lose that request — offline, a closed tab, a
    // skipped card — and the item introduces itself again next time. An answer
    // is unambiguous proof the reader met the item, so record it here too,
    // inside the transaction, where it cannot be dropped.
    await tx
      .insert(lessonViews)
      .values({ userId, studyItemId: facet.studyItemId })
      .onConflictDoNothing()

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
/**
 * Record that an item has been introduced.
 *
 * Idempotent on `(user, item)`: meeting something twice, or pressing "Got it"
 * after having opened the same lesson from the Course, must not move
 * `first_seen_at` — the interesting fact is when it was FIRST met, and a queue
 * flush replaying an old action should not rewrite it.
 */
export async function markLessonSeen(userId: string, studyItemId: string): Promise<LessonSeenResult> {
  const [row] = await db
    .insert(lessonViews)
    .values({ userId, studyItemId })
    .onConflictDoUpdate({
      target: [lessonViews.userId, lessonViews.studyItemId],
      set: { updatedAt: new Date() }
    })
    .returning({ studyItemId: lessonViews.studyItemId, firstSeenAt: lessonViews.firstSeenAt })

  return { studyItemId: row!.studyItemId, firstSeenAt: row!.firstSeenAt.toISOString() }
}

const STAGE_SIZE = 50

/**
 * The share of a stage that must be retained before the next one opens.
 *
 * 1 means every card. Not 80%: a stage sitting at 79/96 was being called done
 * and the next one opened over the top of it, which is not what "complete"
 * means to anyone reading the screen.
 *
 * The cost of 1 is that a single card which never graduates blocks the level
 * indefinitely, where 0.8 left slack for exactly that. If progression ever
 * stalls on one stubborn card, this is the number to look at first.
 */
const STAGE_PASS = 0.85

/**
 * Stage progress, defined ONCE.
 *
 * Three places report this — the gate that decides what may be introduced, the
 * counter in the study header, and the course page — and they had drifted into
 * three copies of nearly the same SQL. The last drift shipped: the gate counted
 * items while the course counted cards, so the two pages disagreed about which
 * stage you were on and the course drew a padlock on a stage the gate had
 * already opened. Anything that reports a stage now reads this fragment, so
 * there is one place to change and no way for them to disagree.
 *
 * A row per (level, stage, kind). Callers roll it up as they need: the gate and
 * the header sum over kind, the course keeps the breakdown so it can say what a
 * stage is made of.
 *
 * `total` and `learned` count CARDS — every facet of every item. An item is not
 * finished because one way of drilling it stuck; recognising 日 does not mean
 * you can write it.
 */
function stageRollup(userId: string, languageId: string) {
  return sql`
    select
      si.level_id,
      ceil(si.sort_index::float / ${STAGE_SIZE}) as stage,
      si.kind,
      -- Suspended cards are excluded from BOTH halves of the ratio.
      --
      -- A leech you have given up on should not hold a stage shut: with the
      -- pass mark at 100% one suspended card made a stage unpassable forever,
      -- and counting it as unlearned-but-required is the opposite of what
      -- suspending it meant.
      count(*) filter (where sc.id is null or not sc.suspended) as total,
      count(*) filter (where sc.state >= 2 and not sc.suspended) as learned,
      -- Both units, because a stage needs both to describe itself honestly:
      -- "50 kana" is what the stage IS, "14/96" is how far through its cards
      -- you are. Printing the card count as the content count is what made a
      -- 50-kana stage announce itself as "96 kana".
      count(distinct si.id) as items
    from study_items si
    join study_item_facets f on f.study_item_id = si.id and f.enabled
    left join srs_cards sc on sc.facet_id = f.id and sc.user_id = ${userId}
    where si.published and si.active
      and si.level_id is not null
      and si.language_id = ${languageId}
      -- Grammar topics are not part of the stage system.
      --
      -- A topic is admitted to review by reading its lesson, and Lessons is a
      -- surface of its own that a reader moves through in their own order. Two
      -- gates on the same content meant a topic could be unlocked by the
      -- curriculum and barred by the lesson, or the reverse; and it made the
      -- stage a reader is on depend on how much grammar they happened to have
      -- read, which is not what a stage is for.
      and si.kind <> 'grammar'
    group by 1, 2, 3
  `
}

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
    with rollup as (${stageRollup(userId, languageId)}),
    stages as (
      select level_id, stage, sum(total) as total, sum(learned) as learned
      from rollup group by 1, 2
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
    with rollup as (${stageRollup(userId, languageId)}),
    stages as (
      select level_id, stage, sum(total) as total, sum(learned) as learned
      from rollup group by 1, 2
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

/**
 * WHICH prompt a facet shows this time.
 *
 * Three rules, all configured in the schema long before anything read them:
 *
 * 1. `requires_grammar_point_id` — withhold a drill until the grammar that
 *    explains it has been learned. This is what stops 仕事's te-form drill
 *    arriving at sort_index 154 when 〜て form is at 165. A HARD filter.
 *
 * 2. `first_exposure_only` — the introduction goes first on first exposure and
 *    last afterwards. Deliberately an ORDERING and not a filter: `mcq` carries
 *    the flag globally, and for a kanji meaning facet it is the only prompt
 *    there is. Filtering would delete the card instead of demoting it.
 *
 * 3. `min_state` / `max_reps` — a template that should not appear until a card
 *    has bedded in, or should stop appearing once it has.
 */
function promptPick(
  languageId: string,
  userId: string,
  salt: string,
  state: SQLWrapper,
  reps: SQLWrapper
): SQL {
  return sql`(
    select p.id
    from exercise_prompts p
    join exercise_templates t on t.id = p.template_id
    left join kind_facet_templates kft
      on kft.language_id = ${languageId}
     and kft.kind = ${studyItems.kind}
     and kft.facet = ${studyItemFacets.facet}
     and kft.template_id = p.template_id
    where p.facet_id = ${studyItemFacets.id}
      and p.status = 'published'
      and (
        p.requires_grammar_point_id is null
        or exists (
          select 1
          from srs_cards rc
          join study_item_facets rf on rf.id = rc.facet_id
          join study_items rsi on rsi.id = rf.study_item_id
          where rc.user_id = ${userId}
            and rsi.grammar_point_id = p.requires_grammar_point_id
            and rc.state >= 2
        )
      )
      and (kft.min_state is null or ${state} >= kft.min_state)
      and (kft.max_reps is null or ${reps} <= kft.max_reps)
    order by
      -- A question missed in its lesson comes back first.
      --
      -- "If I do a lesson I can review the questions later" — the specific ones
      -- got wrong, not the topic in general. An ORDERING, not a filter: it
      -- changes which prompt a facet shows, never whether the card appears, so
      -- no count moves and no schedule changes.
      case when exists (
        select 1 from lesson_misses lm
        where lm.user_id = ${userId} and lm.prompt_id = p.id and lm.cleared_at is null
      ) then 0 else 1 end,
      case
        when coalesce(kft.first_exposure_only, t.first_exposure_only)
        then case when ${state} = 0 then 0 else 2 end
        else 1
      end,
      md5(p.id || ${salt})
    limit 1
  )`
}

/**
 * The ONE facet of an item that may enter the new pool next.
 *
 * A word is several cards — 仕事 is `meaning`, `reading`, `production` and
 * `listening` — and the pool selected all four the moment the word came up.
 * Shuffled apart, each carrying `isNew`, that is four introductions of the same
 * word scattered through a session.
 *
 * So an item offers its LOWEST `intro_order` uncarded facet and nothing else.
 * That column has been written by ten importers since the beginning — meaning
 * 0, reading 1, production 2, writing 5, listening 6 — and read by nothing.
 * Reading it now means a word is met by its meaning first, and the rest follow
 * one at a time as each previous facet earns a card.
 */
/**
 * A topic is only offered once its lesson has been opened.
 *
 * Reading the lesson is what admits a grammar point to review — that is the
 * whole shape of the app now: you learn a topic, then it comes back. Without
 * this the queue would go on introducing topics cold, which is the thing being
 * fixed: "everything is a quiz. Nothing teaches me stuff before quizzing me".
 *
 * Only grammar. Words, kanji and kana have no lesson and are unaffected.
 */
function lessonOpened(userId: string): SQL {
  return sql`(
    ${studyItems.kind} <> 'grammar'
    or exists (
      select 1 from lesson_views lv
      where lv.user_id = ${userId} and lv.study_item_id = ${studyItems.id}
    )
  )`
}

function firstUncardedFacet(userId: string): SQL {
  return sql`not exists (
    select 1
    from study_item_facets f2
    left join srs_cards c2 on c2.facet_id = f2.id and c2.user_id = ${userId}
    where f2.study_item_id = ${studyItems.id}
      and f2.enabled
      and c2.id is null
      and (
        f2.intro_order < ${studyItemFacets.introOrder}
        or (f2.intro_order = ${studyItemFacets.introOrder} and f2.id < ${studyItemFacets.id})
      )
  )`
}

/**
 * Whether a stage was genuinely passed, and the record that it was announced.
 *
 * Decided on the server so the answer is a fact about the ACCOUNT. The old
 * version kept it in `localStorage`, so a second device had no history and
 * replayed a celebration for a stage passed weeks ago on the first — "I am on
 * stage 4 on one phone and I open the site on another and it shows me congrats
 * that I have passed stage 1".
 *
 * Compared against the HIGHEST stage ever reached, never the current one.
 * `stageProgress` reports `min(stage) where learned < total` — the lowest
 * UNFINISHED stage — which falls whenever a seed adds material to an earlier
 * stage. Storing that and celebrating a rise would congratulate the reader
 * every time they cleaned up after a content release.
 */
async function claimStageCelebration(
  userId: string,
  progress: StageProgress[]
): Promise<StageCelebration | null> {
  if (progress.length === 0)
    return null

  const levels = await db
    .select({ id: languageLevels.id, code: languageLevels.code })
    .from(languageLevels)
    .where(inArray(languageLevels.code, progress.map(p => p.level)))

  const idByCode = new Map(levels.map(l => [l.code, l.id]))
  const seen = new Map(
    (await db
      .select({ levelId: stageCelebrations.levelId, highest: stageCelebrations.highestStageSeen })
      .from(stageCelebrations)
      .where(and(
        eq(stageCelebrations.userId, userId),
        inArray(stageCelebrations.levelId, [...idByCode.values()])
      ))).map(r => [r.levelId, r.highest])
  )

  let announced: StageCelebration | null = null

  for (const p of progress) {
    const levelId = idByCode.get(p.level)
    if (!levelId)
      continue
    const highest = seen.get(levelId)

    // First sight of a level: record where it is and say nothing.
    if (highest === undefined) {
      await db
        .insert(stageCelebrations)
        .values({ userId, levelId, highestStageSeen: p.stage })
        .onConflictDoNothing()
      continue
    }

    if (p.stage <= highest)
      continue

    // Claim the announcement with the WRITE, not with the read above.
    //
    // Two queue requests in flight at once — two devices, or a retry — both
    // read the old value and would both decide to celebrate. Worse, an
    // unconditional update let the slower one write a LOWER number back and
    // re-arm the whole thing.
    //
    // `where` makes the update fire only when it raises the mark, and
    // `returning` reports whether this request was the one that raised it.
    const claimed = await db
      .insert(stageCelebrations)
      .values({ userId, levelId, highestStageSeen: p.stage })
      .onConflictDoUpdate({
        target: [stageCelebrations.userId, stageCelebrations.levelId],
        set: { highestStageSeen: p.stage, updatedAt: new Date() },
        where: lt(stageCelebrations.highestStageSeen, p.stage)
      })
      .returning({ highest: stageCelebrations.highestStageSeen })

    if (claimed.length > 0 && announced === null)
      announced = { level: p.level, from: highest, to: p.stage, stages: p.stages }
  }

  return announced
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
    return { items: [], counts: { due: 0, dueCards: 0, learning: 0, newAvailable: 0, ghost: 0 }, gate: null, progress: [], serverTime: now.toISOString() }
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
    /**
     * WHICH prompt this card is showing.
     *
     * Without it the answer comes back naming only the facet, so nothing can
     * tell which of a facet's prompts was actually asked — which made the
     * lesson-miss clearing dead code: a missed question stayed owed forever,
     * pinning that one prompt on its facet.
     */
    promptId: exercisePrompts.id,
    // Not a prompt column, but needed on every queue row for the same reason
    // they are: it is what the lesson and the hint are looked up by, and all
    // three selects join `study_items` already.
    grammarPointId: studyItems.grammarPointId,
    /** Which facet introduces an item, when several arrive together. */
    introOrder: studyItemFacets.introOrder,
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
  //
  // In `new` mode this stays empty on the first pass, and is refilled below
  // with the CURRENT STAGE's unfinished cards when there is nothing new left.
  // Without that fallback the deck dead-ends: a stage whose cards have all been
  // introduced but not yet learned offers nothing here, while the cards needed
  // to finish it sit in the review queue mixed with every other stage — so
  // there was no screen that answered "what is left in stage 4".
  let dueRows = query.mode === 'new'
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
          eq(exercisePrompts.id, promptPick(language.id, userId, promptSalt, srsCards.state, srsCards.reps))
        ))
        .innerJoin(exerciseTemplates, eq(exerciseTemplates.id, exercisePrompts.templateId))
        .where(and(
          eq(srsCards.userId, userId),
          eq(srsCards.languageId, language.id),
          eq(srsCards.suspended, false),
          lte(srsCards.due, horizon),
          eq(studyItems.published, true),
          eq(studyItems.active, true),
          // Match what the counts count. Without this a card on a facet that
          // has since been disabled is SERVED in a session while being absent
          // from the due number, the due list and the reminder — the exact
          // class of disagreement this phase exists to end.
          eq(studyItemFacets.enabled, true),
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
          // No srs_cards row exists yet, so state and reps are zero by definition.
          eq(exercisePrompts.id, promptPick(language.id, userId, promptSalt, sql`0`, sql`0`))
        ))
        .innerJoin(exerciseTemplates, eq(exerciseTemplates.id, exercisePrompts.templateId))
        .leftJoin(srsCards, and(eq(srsCards.facetId, studyItemFacets.id), eq(srsCards.userId, userId)))
        .where(and(
          eq(studyItems.languageId, language.id),
          eq(studyItems.published, true),
          eq(studyItems.active, true),
          eq(studyItemFacets.enabled, true),
          isNull(srsCards.id),
          firstUncardedFacet(userId),
          lessonOpened(userId),
          ...withinCurriculum,
          ...kindFilter,
          ...unitFilter,
          ...levelFilter
        ))
        .orderBy(asc(studyItems.sortIndex))
        .limit(Math.max(0, Math.min(newLimit, query.limit - dueRows.length)))

  // --- Finish the stage -----------------------------------------------------
  //
  // Study means "the stage you are on", not "cards you have never seen". Those
  // are the same thing until the stage runs out of new material, and then they
  // diverge badly: with every card introduced but not yet learned, this deck
  // went empty and told the reader material was locked ahead, while the cards
  // that would actually finish the stage sat in the review queue among every
  // other stage's. There was no screen that answered "what is left here".
  //
  // So when `new` has nothing more to introduce, fall through to the unfinished
  // cards of the CURRENT stage — not the whole curriculum, because a review of
  // something learned two stages ago is not what finishing this one means.
  if (query.mode === 'new' && newRows.length === 0 && ceilings.size > 0) {
    dueRows = await db
      // Same shape as the primary due select — these rows join the same list.
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
      .innerJoin(exercisePrompts, and(
        eq(exercisePrompts.facetId, studyItemFacets.id),
        eq(exercisePrompts.id, promptPick(language.id, userId, promptSalt, srsCards.state, srsCards.reps))
      ))
      .innerJoin(exerciseTemplates, eq(exerciseTemplates.id, exercisePrompts.templateId))
      .where(and(
        eq(srsCards.userId, userId),
        eq(srsCards.languageId, language.id),
        eq(srsCards.suspended, false),
        eq(studyItemFacets.enabled, true),
        // Not yet learned. A graduated card in this stage is finished; its
        // review belongs in the review queue, not in "finish the stage".
        lt(srsCards.state, 2),
        lte(srsCards.due, horizon),
        eq(studyItems.published, true),
        eq(studyItems.active, true),
        sql.raw(currentStagePredicate(ceilings, STAGE_SIZE)),
        ...kindFilter,
        ...unitFilter,
        ...levelFilter
      ))
      .orderBy(asc(srsCards.due))
      .limit(query.limit)
  }

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

  let items: StudyQueueItem[] = [
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
      promptId: r.promptId,
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
      promptId: r.promptId,
      templateCode: r.templateCode as StudyQueueItem['templateCode'],
      inputMode: r.inputMode,
      graderCode: r.graderCode,
      prompt: withPromptTokens(withDialogueTokens(withDialogueAudio(r.prompt), gloss), gloss),
      answer: r.answer,
      distractors: r.distractors,
      assets: withAssetUrls(r.assets)
    }))
  ]

  // Which facet introduces an item, when several arrive together.
  const introOrderByFacet = new Map<string, number>()
  for (const r of [...dueRows, ...newRows])
    introOrderByFacet.set(r.facetId, r.introOrder ?? 0)

  // One card per item per queue.
  //
  // `firstUncardedFacet` bounds the NEW pool, but the due pool legitimately
  // holds every facet of an item at once — 仕事's meaning, reading, production
  // and listening all come due together — so a twenty-card session showed the
  // same word four times: "I see card that introduces shigoto, then study card
  // asks me for audio which is shigoto then I see introduction card again".
  //
  // This is the whole of the fix. An earlier version also buried the item's
  // other cards for a day after one was answered, which suppressed the repeat
  // across queue REFETCHES too — but burying delays reviews that are owed, and
  // the owner's rule is that it must not: "I would rather a review comes when
  // it is due. The new one can come later. I dont want it deferred." So a word
  // can still come round again later in the day if you refetch; it just never
  // arrives twice in the same handful of cards, and nothing is postponed.
  //
  // Done BEFORE the shuffle, so the survivor is chosen by the order the pools
  // were built in — due cards earliest-first, new cards in curriculum order —
  // rather than by chance.
  //
  // A DUE card always outranks a new one, so a review is never displaced by
  // something never seen. Between two due cards the earliest wins; between two
  // new facets the lowest `intro_order` wins, so a word is met by its meaning
  // rather than by a drill on it.
  const isDueCard = (i: StudyQueueItem): boolean => i.cardId !== null
  const beats = (challenger: StudyQueueItem, held: StudyQueueItem): boolean => {
    if (isDueCard(challenger) !== isDueCard(held))
      return isDueCard(challenger)
    if (isDueCard(held))
      return challenger.due < held.due
    return (introOrderByFacet.get(challenger.facetId) ?? 0) < (introOrderByFacet.get(held.facetId) ?? 0)
  }

  const oneEach = new Map<string, StudyQueueItem>()
  for (const item of items) {
    const held = oneEach.get(item.studyItemId)
    if (!held || beats(item, held))
      oneEach.set(item.studyItemId, item)
  }
  items = [...oneEach.values()]

  shuffle(items)

  // Introduce an item ONCE, ever.
  //
  // `isNew` is a fact about a CARD — state 0 — but "have I met 仕事?" is a fact
  // about the ITEM, and a word is three or four cards. So the introduction
  // fired for every facet: meaning, reading, production, listening, each
  // shuffled to a different point in the session, all announcing the same word.
  //
  // `lesson_views` is the record. It was written only for grammar lessons and
  // read only to decide whether to attach a lesson payload; it now governs the
  // introduction for every kind, which is what its own doc comment always said
  // it was for.
  const seen = new Set(
    items.length === 0
      ? []
      : (await db
          .select({ studyItemId: lessonViews.studyItemId })
          .from(lessonViews)
          .where(and(
            eq(lessonViews.userId, userId),
            inArray(lessonViews.studyItemId, [...new Set(items.map(i => i.studyItemId))])
          ))).map(r => r.studyItemId)
  )

  const introducer = new Map<string, string>()
  for (const item of items) {
    if (!item.isNew || seen.has(item.studyItemId))
      continue
    const current = introducer.get(item.studyItemId)
    if (current === undefined
      || (introOrderByFacet.get(item.facetId) ?? 0) < (introOrderByFacet.get(current) ?? 0)) {
      introducer.set(item.studyItemId, item.facetId)
    }
  }

  for (const item of items)
    item.isNew = introducer.get(item.studyItemId) === item.facetId

  // Teach before asking.
  //
  // A grammar card at first exposure carries the whole lesson; every other
  // grammar card carries only the hint. Examples are loaded for the new ones
  // alone — a hint is the pattern and how it attaches, and pulling four
  // sentences per review to render two lines would be waste.
  //
  // Kept beside the items rather than on them — the point id is how the lesson
  // is looked up, not something the client has any use for.
  const pointByFacet = new Map<string, string>()
  for (const r of [...dueRows, ...newRows]) {
    if (r.grammarPointId)
      pointByFacet.set(r.facetId, r.grammarPointId)
  }

  if (pointByFacet.size > 0) {
    const grammarItems = items.filter(i => pointByFacet.has(i.facetId))
    const teachIds = [...new Set(
      grammarItems.filter(i => i.isNew).map(i => pointByFacet.get(i.facetId)!)
    )]
    const hintIds = [...new Set(
      grammarItems.map(i => pointByFacet.get(i.facetId)!).filter(id => !teachIds.includes(id))
    )]

    const [taught, hinted] = await Promise.all([
      loadLessons(query.languageCode, teachIds, true),
      loadLessons(query.languageCode, hintIds, false)
    ])

    for (const item of grammarItems) {
      const pointId = pointByFacet.get(item.facetId)!
      const lesson = taught.get(pointId)
      const forHint = lesson ?? hinted.get(pointId)
      item.lesson = lesson ?? null
      item.hint = forHint ? hintFromLesson(forHint) : null
    }
  }

  // Scoped by the SAME filters as the queue and the new-card count.
  //
  // These used to be language-wide while `newAvailable` respected the level and
  // deck pickers, so the three numbers printed side by side — "11 due · 46
  // learning · 73 new" — were measured over different sets and could not be
  // read together. The pickers sit directly above that row; the numbers now
  // mean what those pickers say.
  // The canonical predicate (§`dueCardsWhere`), narrowed by the deck on screen.
  //
  // This used to be its own definition — `state = 2` only — which is why the
  // header said 5 while the list it linked to showed 26, and why Progress could
  // read 0 the moment after a session when every card sits in a learning step.
  const [counts] = await db
    .select({
      due: sql<number>`count(distinct ${studyItems.id})`.mapWith(Number),
      dueCards: sql<number>`count(*)`.mapWith(Number),
      learning: sql<number>`count(*) filter (where ${srsCards.state} in (1, 3))`.mapWith(Number)
    })
    .from(srsCards)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .where(and(
      dueCardsWhere(userId, language.id, now),
      ...kindFilter,
      ...unitFilter,
      ...levelFilter
    ))

  // Ghosts are not a due measure — a ghost is a card the scheduler has flagged
  // as not sticking, due or not — so it keeps its own query and its own rules.
  const [ghosts] = await db
    .select({ total: sql<number>`count(distinct ${studyItems.id})`.mapWith(Number) })
    .from(srsCards)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .where(and(
      eq(srsCards.userId, userId),
      eq(srsCards.languageId, language.id),
      eq(srsCards.suspended, false),
      eq(srsCards.ghost, true),
      ...kindFilter,
      ...unitFilter,
      ...levelFilter
    ))

  // Counted in ITEMS, not facets.
  //
  // The pool now offers one facet per item (`firstUncardedFacet`), so counting
  // facets promised four cards where one was coming. It also matches the unit
  // every other number on screen is moving to: a word, not a word's cards.
  const [newAvailable] = await db
    .select({ total: sql<number>`count(distinct ${studyItems.id})`.mapWith(Number) })
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
  // Only when the deck genuinely has nothing to give. `newAvailable` being zero
  // is no longer sufficient: the stage fallback above may have filled the queue
  // with the current stage's unfinished cards, and explaining that material is
  // locked ahead while handing the reader twenty cards is simply false.
  const gate = items.length > 0 || newAvailable?.total || withinCurriculum.length === 0
    ? null
    : await deckGate(userId, language.id, [...kindFilter, ...unitFilter, ...levelFilter])

  const progress = await stageProgress(userId, language.id)

  return {
    items,
    gate,
    progress,
    celebrate: await claimStageCelebration(userId, progress),
    counts: {
      due: counts?.due ?? 0,
      dueCards: counts?.dueCards ?? 0,
      learning: counts?.learning ?? 0,
      newAvailable: newAvailable?.total ?? 0,
      ghost: ghosts?.total ?? 0
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
      // The same definition every other surface uses, in ITEMS: states 1-3,
      // unsuspended, counted per distinct item. These sit in the deck picker
      // directly above the Study header, and while this counted state-2 cards
      // the two disagreed on the same screen — 18 here against 12 there.
      due: sql<number>`count(distinct ${studyItems.id}) filter (where ${srsCards.due} <= ${now} and ${srsCards.state} in (1, 2, 3) and not ${srsCards.suspended})`.mapWith(Number),
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
      // The same definition every other surface uses, in ITEMS: states 1-3,
      // unsuspended, counted per distinct item. These sit in the deck picker
      // directly above the Study header, and while this counted state-2 cards
      // the two disagreed on the same screen — 18 here against 12 there.
      due: sql<number>`count(distinct ${studyItems.id}) filter (where ${srsCards.due} <= ${now} and ${srsCards.state} in (1, 2, 3) and not ${srsCards.suspended})`.mapWith(Number),
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
      // The sibling query on `kind` filters this and this one did not, so a
      // unit holding a deactivated item counted it in every one of its numbers
      // while no other surface did. Nothing is inactive today, which is exactly
      // how a drift like this survives until it matters.
      eq(studyItems.active, true),
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
    return { items: [], total: 0, totalCards: 0, byKind: [], serverTime: now.toISOString() }

  const kindFilter = query.kind ? [eq(studyItems.kind, query.kind)] : []

  // The canonical predicate, so this page and every number that points at it
  // describe the same set. It previously had no state filter and no check on
  // `study_item_facets.enabled`, which is how a page headed "26 cards" sat
  // behind a tile reading 5.
  const isDue = dueCardsWhere(userId, language.id, now)

  // Page over ITEMS, not cards.
  //
  // Paging over cards meant a page of 50 could be a dozen words, and the header
  // counted something else again. An item's position is its earliest due card,
  // so the thing waiting longest is still at the top.
  const page = await db
    .select({
      studyItemId: studyItems.id,
      due: sql<Date>`min(${srsCards.due})`
    })
    .from(srsCards)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .where(and(isDue, ...kindFilter))
    .groupBy(studyItems.id)
    .orderBy(asc(sql`min(${srsCards.due})`))
    .limit(query.limit)
    .offset(query.offset)

  const pageIds = page.map(r => r.studyItemId)

  const rows = pageIds.length === 0
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
        .where(and(isDue, inArray(studyItems.id, pageIds)))
        .orderBy(asc(srsCards.due))

  const [totals] = await db
    .select({
      total: sql<number>`count(distinct ${studyItems.id})`.mapWith(Number),
      totalCards: sql<number>`count(*)`.mapWith(Number)
    })
    .from(srsCards)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .where(and(isDue, ...kindFilter))

  // The chip counts ignore the kind filter — otherwise selecting one kind
  // would zero every other chip and there would be no way back.
  const byKind = await db
    .select({ kind: studyItems.kind, count: sql<number>`count(distinct ${studyItems.id})`.mapWith(Number) })
    .from(srsCards)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .where(isDue)
    .groupBy(studyItems.kind)
    .orderBy(asc(studyItems.kind))

  // Group the cards under their item, keeping the page's ordering.
  const byItem = new Map<string, typeof rows>()
  for (const r of rows)
    byItem.set(r.studyItemId, [...(byItem.get(r.studyItemId) ?? []), r])

  const items = pageIds.flatMap((id) => {
    const cards = byItem.get(id)
    if (!cards || cards.length === 0)
      return []
    const r = cards[0]!

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

    return [{
      studyItemId: id,
      kind: r.kind,
      subject,
      detail,
      due: r.due.toISOString(),
      ghost: cards.some(c => c.ghost),
      facets: cards.map(c => ({
        cardId: c.cardId,
        facetId: c.facetId,
        facet: c.facet,
        due: c.due.toISOString(),
        ghost: c.ghost,
        lapses: c.lapses
      })),
      href
    }]
  })

  return {
    items,
    total: totals?.total ?? 0,
    totalCards: totals?.totalCards ?? 0,
    byKind,
    serverTime: now.toISOString()
  }
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
/**
 * Just the stage the reader is ON, not everything up to it.
 *
 * `curriculumPredicate` bounds new material at the top of the current stage,
 * which is right for introducing things. Finishing a stage needs the narrower
 * window: cards from earlier stages are already learned and their reviews are
 * not what "finish stage 4" means.
 */
function currentStagePredicate(ceilings: Map<string, number>, stageSize: number): string {
  const quote = (value: string) => `'${value.replace(/'/gu, "''")}'`
  const ids = [...ceilings.keys()].map(quote).join(', ')
  const lo = [...ceilings]
    .map(([levelId, ceiling]) => `when ${quote(levelId)} then ${Math.floor(ceiling) - stageSize}`)
    .join(' ')
  const hi = [...ceilings]
    .map(([levelId, ceiling]) => `when ${quote(levelId)} then ${Math.floor(ceiling)}`)
    .join(' ')
  return `(
    study_items.level_id in (${ids})
    and study_items.sort_index > (case study_items.level_id ${lo} end)
    and study_items.sort_index <= (case study_items.level_id ${hi} end)
  )`
}

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
    with stages as (${stageRollup(userId, language.id)})
    select l.code as level, l.sort_index as level_order, s.stage, s.kind, s.total, s.learned, s.items
    from stages s
    join language_levels l on l.id = s.level_id
    order by l.sort_index, s.stage, s.kind
  `)

  interface Row { level: string, level_order: number, stage: number, kind: string, total: number, learned: number, items: number }
  const rows = ((rollup.rows ?? []) as unknown as Row[]).map(r => ({
    ...r,
    stage: Number(r.stage),
    total: Number(r.total),
    learned: Number(r.learned),
    items: Number(r.items)
  }))

  // Group into levels, then stages.
  const byLevel = new Map<string, Map<number, { total: number, learned: number, kinds: Map<string, number> }>>()
  for (const row of rows) {
    const level = byLevel.get(row.level) ?? new Map()
    const stage = level.get(row.stage) ?? { total: 0, learned: 0, kinds: new Map<string, number>() }
    stage.total += row.total
    stage.learned += row.learned
    // Keyed on ITEMS: this is the "what is in this stage" line, not progress.
    stage.kinds.set(row.kind, (stage.kinds.get(row.kind) ?? 0) + row.items)
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
        -- Same reason as the rollup: grammar is not in a stage any more, so it
        -- cannot be what a stage is about.
        and si.kind <> 'grammar'
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
