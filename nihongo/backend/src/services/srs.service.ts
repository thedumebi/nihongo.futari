import type { CardOrigin } from '@nihongo/shared/constants'
import type {
  AnswerResult,
  CardState,
  Catalogue,
  CatalogueItem,
  CourseLevel,
  CourseResponse,
  DeferredRecompute,
  DueListQuery,
  DueListResponse,
  GhostPolicy,
  ItemFilter,
  LearnerPromptContext,
  LearnerState,
  LessonSeenResult,
  NewBudget,
  PromptOption,
  ReviewEvent,
  SaveWordResult,
  SrsCard,
  StageCelebration,
  StageProgress,
  StageRow,
  StudyDecksResponse,
  StudyQueueItem,
  StudyQueueQuery,
  StudyQueueResponse,
  SubmitAnswerInput,
  WordStatus
} from '@nihongo/shared/types'
import type { SQL } from 'drizzle-orm'

import { ROUTE_BASE_PATHS, STAGE_PASS, STAGE_SIZE } from '@nihongo/shared/constants'
import db from '@nihongo/shared/db'
import {
  curriculumUnitItems,
  curriculumUnits,
  exercisePrompts,
  exerciseTemplates,
  grammarPoints,
  kana,
  kanji,
  kindFacetTemplates,
  languageLevels,
  languages,
  lessonMisses,
  lessonViews,
  phoneticSeries,
  sentences,
  speakSessions,
  speakSteps,
  srsCards,
  srsGhostEvents,
  srsReviewLogs,
  stageCelebrations,
  studyItemFacets,
  studyItems,
  userSettings,
  words,
  wordSenses
} from '@nihongo/shared/db/schema'
import {
  applyReview,
  availableNew,
  canFastForward,
  ceilingsFrom,
  clampReviewedAt,
  deckCounts,
  distinguishingStart,
  effectiveCardState,
  emptyCardState,
  evaluateGhost,
  heldBack,
  inFlightCharge,
  matchesFilter,
  newBudget,
  newCandidates,
  nextCelebration,
  progressFrom,
  replay,
  rollupStages,
  streakSpanDays,
  studyDateFor,
  studyDayRange
} from '@nihongo/shared/lib'
import { ghostPolicySchema } from '@nihongo/shared/types'
import { and, asc, desc, eq, gt, gte, inArray, isNotNull, isNull, lt, lte, notInArray, or, sql } from 'drizzle-orm'

import { assetUrl, withAssetUrls, withDialogueAudio, withSpeakAudio } from '@/lib/assets.js'
import { pickPrompt } from '@/lib/prompt-pick.js'

import { cachedContent, catalogue, catalogueUnits } from './catalogue.service.js'
import { withCurrentAudio } from './clips.service.js'
import { glossary, withDialogueTokens, withPromptTokens } from './glossary.service.js'
import { hintFromLesson, loadLessons } from './grammar.service.js'
import { loadLearnerState } from './learner-state.service.js'
import { loadSeries } from './phonetics.service.js'
import { loadUserContext, recomputeProgress } from './progress.service.js'
import { deferProgress } from './recompute.service.js'

/**
 * SRS persistence.
 *
 * The invariant this file exists to protect: `srs_review_logs` is the source of
 * truth and `srs_cards` is a cache of the fold over it. Every write here either
 * appends to the log and re-derives the card, or it is a bug.
 */

/**
 * Rows whose prompts are chosen per round (see `withPrompts`): the first chunk
 * is twice the batch, at least this, and each next one four times larger, up
 * to the most.
 */
const PROMPT_CHUNK_MIN = 40
const PROMPT_CHUNK_MAX = 2000

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

export async function loadPolicy(userId: string): Promise<{ policy: GhostPolicy, fsrsParams: Record<string, unknown> }> {
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

export async function submitAnswer(userId: string, input: SubmitAnswerInput, deferred?: DeferredRecompute): Promise<AnswerResult> {
  const receivedAt = new Date()
  // When the learner answered, which is what every date on the card follows:
  // an offline session synced tomorrow still happened today. Only a clock that
  // cannot be right (the future, or past any real backlog) is pulled in.
  const clamped = clampReviewedAt(new Date(input.reviewedAt), receivedAt)
  const answeredAt = clamped.reviewedAt
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
      const seed = emptyCardState(answeredAt)
      const [created] = await tx
        .insert(srsCards)
        .values({
          userId,
          facetId: facet.facetId,
          languageId: facet.languageId,
          ...cardStateColumns(seed),
          firstSeenAt: answeredAt
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
        reviewedAt: answeredAt,
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
      reviewedAt: answeredAt,
      ...(input.clientId ? { clientId: input.clientId } : {})
    }

    const cached = effectiveCardState(toCardState(card), event.reviewedAt)
    const fast = canFastForward(cached, [event])
    let next: CardState
    let replayed = false
    /** On a replay, the card's ratings in order, superseded ones left out. */
    let replayedRatings: number[] | null = null
    /** When it was last answered correctly, on a replay read from the history. */
    let lastCorrectAt = input.rating !== 1 ? answeredAt : card.lastCorrectAt
    /** The newest answer the card now rests on: this one, unless replayed into the middle. */
    let newestAt = answeredAt

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
      const superseded = new Set(folded.supersededIds)
      const kept = history.filter(h => !superseded.has(h.id))
      replayedRatings = kept.map(h => h.rating)
      lastCorrectAt = [...kept].reverse().find(h => h.rating !== 1)?.reviewedAt ?? null
      newestAt = kept.at(-1)?.reviewedAt ?? answeredAt

      // The flags follow this fold, both ways: an answer landing in the middle
      // can change which of two devices' near-simultaneous reports is the
      // double, so one dropped before may be kept now.
      await tx
        .update(srsReviewLogs)
        .set({ superseded: folded.supersededIds.length > 0 ? inArray(srsReviewLogs.id, folded.supersededIds) : sql`false` })
        .where(and(eq(srsReviewLogs.userId, userId), eq(srsReviewLogs.cardId, card.id)))
    }

    const wasCorrect = input.rating !== 1
    // Counters follow the history. On the fast path this answer is the newest,
    // so adding to the stored counts is exact; after a replay an older answer
    // may have landed in the middle, so they are re-derived from the fold.
    const counters = replayedRatings
      ? {
          consecutiveCorrect: replayedRatings.length - 1 - replayedRatings.lastIndexOf(1),
          totalCorrect: replayedRatings.filter(r => r !== 1).length,
          totalReviews: replayedRatings.length
        }
      : {
          consecutiveCorrect: wasCorrect ? card.consecutiveCorrect + 1 : 0,
          totalCorrect: card.totalCorrect + (wasCorrect ? 1 : 0),
          totalReviews: card.totalReviews + 1
        }
    const { consecutiveCorrect } = counters

    // The NEWEST ratings — the ghost check is about how the card is going now.
    // This read the oldest ones, so a card that had come good was still judged
    // on its first stumbles, and one going bad was judged on its good start.
    const recent = (await tx
      .select({ rating: srsReviewLogs.rating, reviewedAt: srsReviewLogs.reviewedAt })
      .from(srsReviewLogs)
      .where(and(eq(srsReviewLogs.userId, userId), eq(srsReviewLogs.cardId, card.id), eq(srsReviewLogs.superseded, false)))
      .orderBy(desc(srsReviewLogs.reviewedAt), desc(srsReviewLogs.id))
      .limit(policy.recentWindow)).reverse()

    const decision = evaluateGhost({
      ghost: card.ghost,
      lapses: next.lapses,
      consecutiveCorrect,
      scheduledDays: next.scheduledDays,
      recentRatings: recent.map(r => r.rating as 1 | 2 | 3 | 4),
      streakSpanDays: streakSpanDays(recent)
    }, policy)

    await tx
      .update(srsCards)
      .set({
        ...cardStateColumns(next),
        ghost: decision.ghost,
        ...(decision.event === 'flagged' ? { ghostSince: newestAt } : {}),
        ...(decision.reason ? { ghostReason: decision.reason } : {}),
        ...counters,
        lastCorrectAt,
        // An answer older than any other on the card is when it was first met.
        firstSeenAt: sql`least(${srsCards.firstSeenAt}, ${answeredAt.toISOString()}::timestamp)`,
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
        .set({ clearedAt: answeredAt, updatedAt: receivedAt })
        .where(and(
          eq(lessonMisses.userId, userId),
          eq(lessonMisses.promptId, input.promptId),
          isNull(lessonMisses.clearedAt),
          // An answer pays off only a miss made before it, however late it syncs.
          lte(lessonMisses.missedAt, answeredAt)
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
  // cheaper correct answer. A batch passes `deferred` and rebuilds once at
  // its end instead.
  //
  // A duplicate in a batch means the client is resending one it already sent,
  // most likely because the first attempt's response never arrived, so that
  // attempt's rebuild may never have finished either. It asks for the whole
  // history again rather than trust it did.
  if (deferred && !outcome.result.applied)
    deferProgress(deferred, outcome.languageId, undefined)
  if (outcome.result.applied) {
    const since = outcome.result.replayed
      ? undefined
      : new Date(answeredAt.getTime() - 2 * 24 * 60 * 60 * 1000)
    if (deferred)
      deferProgress(deferred, outcome.languageId, since)
    else
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

/**
 * Put a word met while reading into review.
 *
 * The same entry `enterReview` gives a finished lesson: one card on the word's
 * first facet, at state 1 so it is due at once instead of queueing behind the
 * new-card limit. No `srs_review_logs` row is written — tapping a word is not
 * evidence of having learned it, and the cards are a fold over that log.
 *
 * A word that already has ANY card is left alone. It is already in review, and
 * a second entry point would reset nothing useful and could only double it up.
 *
 * Returns null when the word has no published study item, so there is nothing
 * to review it with.
 */
export async function saveWord(userId: string, wordId: string): Promise<SaveWordResult | null> {
  return cardFirstFacet(userId, eq(studyItems.wordId, wordId), 'saved')
}

/** Several words at once — a page of dictionary results: reviewable, and in review. */
export async function wordStatuses(userId: string, wordIds: readonly string[]): Promise<Record<string, { reviewable: boolean, inReview: boolean }>> {
  if (wordIds.length === 0)
    return {}
  const rows = await db
    .select({ wordId: studyItems.wordId, cardId: srsCards.id })
    .from(studyItems)
    .innerJoin(studyItemFacets, eq(studyItemFacets.studyItemId, studyItems.id))
    .leftJoin(srsCards, and(eq(srsCards.facetId, studyItemFacets.id), eq(srsCards.userId, userId)))
    .where(and(inArray(studyItems.wordId, [...wordIds]), eq(studyItems.published, true), eq(studyItems.active, true)))
  const out: Record<string, { reviewable: boolean, inReview: boolean }> = {}
  for (const r of rows) {
    if (!r.wordId)
      continue
    const s = out[r.wordId] ?? { reviewable: true, inReview: false }
    s.inReview ||= r.cardId !== null
    out[r.wordId] = s
  }
  return out
}

/** Where one word stands in this learner's reviews. */
export async function wordStatus(userId: string, wordId: string): Promise<WordStatus> {
  const rows = await db
    .select({ cardId: srsCards.id, due: srsCards.due, state: srsCards.state, ghost: srsCards.ghost })
    .from(studyItems)
    .innerJoin(studyItemFacets, eq(studyItemFacets.studyItemId, studyItems.id))
    .leftJoin(srsCards, and(eq(srsCards.facetId, studyItemFacets.id), eq(srsCards.userId, userId)))
    .where(and(eq(studyItems.wordId, wordId), eq(studyItems.published, true), eq(studyItems.active, true)))
  const cards = rows.filter(r => r.cardId !== null)
  const soonest = cards.map(c => c.due!).sort((a, b) => a.getTime() - b.getTime())[0]
  return {
    reviewable: rows.length > 0,
    inReview: cards.length > 0,
    due: soonest ? soonest.toISOString() : null,
    learned: cards.some(c => (c.state ?? 0) >= 2),
    ghost: cards.some(c => c.ghost === true)
  }
}

/**
 * Put a Speak prompt the learner missed into review.
 *
 * The only way a Speak item becomes a card — the queue never introduces them
 * (see `introducedByQueue`). Same entry as a saved word, and for the same
 * reason no review log: answering "Not quite" in a session is the session's
 * business, and the SRS starts counting from the first review.
 */
export async function saveSpeakStep(userId: string, speakStepId: string): Promise<SaveWordResult | null> {
  return cardFirstFacet(userId, eq(studyItems.speakStepId, speakStepId), 'speak-miss')
}

/**
 * Put one study item into review by id — used when a kana lesson is finished,
 * so the characters just taught come back while they are fresh.
 */
export async function saveStudyItem(userId: string, studyItemId: string, origin: CardOrigin): Promise<SaveWordResult | null> {
  return cardFirstFacet(userId, eq(studyItems.id, studyItemId), origin)
}

/** One card, at state 1 and due now, on the first facet of the one published item `target` picks. */
async function cardFirstFacet(userId: string, target: SQL, origin: CardOrigin): Promise<SaveWordResult | null> {
  const facets = await db
    .select({
      facetId: studyItemFacets.id,
      languageId: studyItems.languageId,
      cardId: srsCards.id
    })
    .from(studyItems)
    .innerJoin(studyItemFacets, and(eq(studyItemFacets.studyItemId, studyItems.id), eq(studyItemFacets.enabled, true)))
    .leftJoin(srsCards, and(eq(srsCards.facetId, studyItemFacets.id), eq(srsCards.userId, userId)))
    .where(and(target, eq(studyItems.published, true), eq(studyItems.active, true)))
    .orderBy(asc(studyItemFacets.introOrder), asc(studyItemFacets.id))

  const first = facets[0]
  if (!first)
    return null
  if (facets.some(f => f.cardId !== null))
    return { added: false }

  const now = new Date()
  const created = await db
    .insert(srsCards)
    .values({
      userId,
      facetId: first.facetId,
      languageId: first.languageId,
      due: now,
      state: 1,
      firstSeenAt: now,
      origin
    })
    .onConflictDoNothing()
    .returning({ id: srsCards.id })

  return { added: created.length > 0 }
}

/**
 * How much of a stage must have stuck before the next one opens.
 *
 * Not 1. At 100% a single leech held a stage shut forever, and there is always
 * one — the card you keep failing is exactly the card that stops being worth
 * waiting for. Suspended cards leave the ratio entirely rather than counting
 * against it, so giving up on one is a decision the gate respects.
 *
 * In shared constants, because the Course map says it out loud.
 */

/**
 * A learner snapshot, or one already loading, so a caller can start the load
 * early and share it between reads.
 */
type Snapshot = LearnerState | Promise<LearnerState>

/** Rollups already worked out, per snapshot and catalogue: both are immutable. */
const rollups = new WeakMap<LearnerState, WeakMap<Catalogue, StageRow[]>>()

/**
 * Stage progress, defined ONCE.
 *
 * Three places report this — the gate that decides what may be introduced, the
 * counter in the study header, and the course page — and they had drifted into
 * three copies of nearly the same SQL. The last drift shipped: the gate counted
 * items while the course counted cards, so the two pages disagreed about which
 * stage you were on and the course drew a padlock on a stage the gate had
 * already opened. Anything that reports a stage now reads `rollupStages`
 * (`lib/srs/curriculum.ts`), so there is one place to change and no way for
 * them to disagree.
 *
 * A row per (level, stage, kind). Callers roll it up as they need: the gate and
 * the header sum over kind, the course keeps the breakdown so it can say what a
 * stage is made of.
 *
 * `total` and `learned` count CARDS — every facet of every item. An item is not
 * finished because one way of drilling it stuck; recognising 日 does not mean
 * you can write it.
 */
async function stageRows(userId: string, languageId: string, state?: Snapshot): Promise<{ rows: StageRow[], cat: Catalogue }> {
  const [cat, learner] = await Promise.all([catalogue(languageId), state ?? loadLearnerState(userId, languageId)])
  const byCatalogue = rollups.get(learner) ?? new WeakMap<Catalogue, StageRow[]>()
  rollups.set(learner, byCatalogue)
  const rows = byCatalogue.get(cat) ?? rollupStages(cat, learner)
  byCatalogue.set(cat, rows)
  return { rows, cat }
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
export async function stageCeilings(userId: string, languageId: string, state?: Snapshot): Promise<Map<string, number>> {
  return ceilingsFrom((await stageRows(userId, languageId, state)).rows)
}

/**
 * The reader's position in each level, for showing the progression.
 *
 * Same shape as `stageCeilings` but carrying the numbers a person can read:
 * which stage, out of how many, and how far through it they are.
 */
export async function stageProgress(userId: string, languageId: string, state?: Snapshot): Promise<StageProgress[]> {
  const { rows, cat } = await stageRows(userId, languageId, state)
  return progressFrom(rows, cat)
}

/**
 * What a learner's prompt choice depends on beyond the card itself: the
 * grammar they have learned, in any language, and the lesson questions they
 * still owe. See `pickPrompt`.
 */
async function promptContextFor(userId: string): Promise<Omit<LearnerPromptContext, 'salt'>> {
  const [grammar, misses] = await Promise.all([
    db
      .selectDistinct({ id: studyItems.grammarPointId })
      .from(srsCards)
      .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
      .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
      .where(and(eq(srsCards.userId, userId), gte(srsCards.state, 2), isNotNull(studyItems.grammarPointId))),
    db
      .select({ promptId: lessonMisses.promptId })
      .from(lessonMisses)
      .where(and(eq(lessonMisses.userId, userId), isNull(lessonMisses.clearedAt)))
  ])
  return {
    knownGrammar: new Set(grammar.flatMap(g => g.id === null ? [] : [g.id])),
    missed: new Set(misses.map(m => m.promptId))
  }
}

/**
 * The published prompts of these facets, with the rules `pickPrompt` applies.
 * The kind's template row may be absent: then the template's own
 * first-exposure flag holds and nothing bounds state or reps. The published /
 * active / enabled tests repeat what the catalogue applied, so a catalogue a
 * moment stale can never serve withdrawn content.
 */
async function promptOptions(languageId: string, facetIds: string[]): Promise<PromptOption[]> {
  return db
    .select({
      id: exercisePrompts.id,
      facetId: exercisePrompts.facetId,
      requiresGrammarPointId: exercisePrompts.requiresGrammarPointId,
      firstExposureOnly: sql<boolean>`coalesce(${kindFacetTemplates.firstExposureOnly}, ${exerciseTemplates.firstExposureOnly})`,
      minState: kindFacetTemplates.minState,
      maxReps: kindFacetTemplates.maxReps
    })
    .from(exercisePrompts)
    .innerJoin(exerciseTemplates, eq(exerciseTemplates.id, exercisePrompts.templateId))
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, exercisePrompts.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .leftJoin(kindFacetTemplates, and(
      eq(kindFacetTemplates.languageId, languageId),
      eq(kindFacetTemplates.kind, studyItems.kind),
      eq(kindFacetTemplates.facet, studyItemFacets.facet),
      eq(kindFacetTemplates.templateId, exercisePrompts.templateId)
    ))
    .where(and(
      inArray(exercisePrompts.facetId, facetIds),
      eq(exercisePrompts.status, 'published'),
      eq(studyItems.published, true),
      eq(studyItems.active, true),
      eq(studyItemFacets.enabled, true)
    ))
}

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

/** The chosen prompts in full, with the facet and item they belong to. */
function promptRows(promptIds: string[]) {
  return db
    .select({
      facetId: studyItemFacets.id,
      studyItemId: studyItems.id,
      kind: studyItems.kind,
      facet: studyItemFacets.facet,
      ...promptColumns
    })
    .from(exercisePrompts)
    .innerJoin(exerciseTemplates, eq(exerciseTemplates.id, exercisePrompts.templateId))
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, exercisePrompts.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .where(inArray(exercisePrompts.id, promptIds))
}

/** A card, or a facet about to become one, that needs a prompt. */
type PickableRow = Pick<SrsCard, 'facetId' | 'state' | 'reps'>
/** A chosen prompt in full. */
type PromptRow = Awaited<ReturnType<typeof promptRows>>[number]

/**
 * Up to `limit` rows, in their order, each with ONE prompt. A facet is one
 * card; the prompt pool is meant to vary WHICH drill you get, not to hand the
 * same card back several times.
 *
 * Rows come a chunk at a time from `nextChunk`: a facet with no prompt this
 * learner may see yet drops out, and the next chunk fills its place. Chunks
 * grow, so a deck whose first thousand rows all drop out costs a few queries,
 * not hundreds. The choice is made in memory (`pickPrompt`); only the chosen
 * prompts are then read in full.
 */
async function withPrompts<R extends PickableRow>(
  languageId: string,
  prompting: LearnerPromptContext,
  nextChunk: (offset: number, size: number) => Promise<R[]>,
  limit: number
): Promise<Array<R & PromptRow>> {
  if (limit <= 0)
    return []
  const picked: Array<{ row: R, promptId: string }> = []
  let size = Math.max(2 * limit, PROMPT_CHUNK_MIN)
  for (let offset = 0; picked.length < limit; offset += size, size = Math.min(size * 4, PROMPT_CHUNK_MAX)) {
    const rows = await nextChunk(offset, size)
    if (rows.length === 0)
      break
    const options = new Map<string, PromptOption[]>()
    for (const option of await promptOptions(languageId, rows.map(r => r.facetId)))
      options.set(option.facetId, [...(options.get(option.facetId) ?? []), option])
    for (const row of rows) {
      const promptId = pickPrompt(options.get(row.facetId) ?? [], { ...prompting, state: row.state, reps: row.reps })
      if (promptId !== null)
        picked.push({ row, promptId })
      if (picked.length === limit)
        break
    }
    if (rows.length < size)
      break
  }
  if (picked.length === 0)
    return []
  const full = new Map((await promptRows(picked.map(p => p.promptId))).map(p => [p.promptId, p]))
  // A prompt withdrawn between the two reads drops its row.
  return picked.flatMap(({ row, promptId }) => {
    const prompt = full.get(promptId)
    return prompt ? [{ ...row, ...prompt }] : []
  })
}

/**
 * Give each sound-series card the series itself: its kanji split into their
 * parts, their readings, meanings and a word that uses each, and which of them
 * this learner knows. The card used to carry only the part and a few grey
 * kanji, and nothing tied them together.
 */
async function withSeries(items: StudyQueueItem[], userId: string, languageId: string): Promise<StudyQueueItem[]> {
  const components = [...new Set(items
    .filter(i => i.prompt?.kind === 'sound-series' && typeof i.prompt.component === 'string')
    .map(i => String(i.prompt.component)))]
  if (components.length === 0)
    return items
  const known = await knownKanjiCharacters(userId, languageId)
  const series = await loadSeries(languageId, components, known)
  return items.map((item) => {
    const view = item.prompt?.kind === 'sound-series' ? series.get(String(item.prompt.component)) : undefined
    return view ? { ...item, prompt: { ...item.prompt, series: view } } : item
  })
}

/** At most this many meanings are listed under a word: the common ones lead. */
const SENSES_SHOWN = 6

/**
 * Every meaning of each word card's word, in the dictionary's order, so the
 * card can say "also means …" once answered. A word asked as "softly" is also
 * "gently" and "quietly", and a learner who only ever meets the first meaning
 * is surprised by the rest in a sentence.
 */
async function withSenses(items: StudyQueueItem[]): Promise<StudyQueueItem[]> {
  const ids = [...new Set(items.filter(i => i.kind === 'word').map(i => i.studyItemId))]
  if (ids.length === 0)
    return items
  const rows = await db
    .select({ studyItemId: studyItems.id, glosses: wordSenses.glosses })
    .from(studyItems)
    .innerJoin(wordSenses, eq(wordSenses.wordId, studyItems.wordId))
    .where(inArray(studyItems.id, ids))
    .orderBy(asc(wordSenses.sortIndex))
  const senses = new Map<string, string[]>()
  for (const r of rows) {
    const text = r.glosses.filter(g => !g.lang || g.lang === 'en' || g.lang === 'eng').map(g => g.text).join(', ')
    const list = senses.get(r.studyItemId) ?? []
    if (text && list.length < SENSES_SHOWN)
      list.push(text)
    senses.set(r.studyItemId, list)
  }
  return items.map(item => senses.has(item.studyItemId)
    ? { ...item, prompt: { ...item.prompt, senses: senses.get(item.studyItemId) } }
    : item)
}

/** An English meaning as compared for twins: no asides, case or spacing. */
function plainGloss(text: string): string {
  return text.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim().toLowerCase()
}

/**
 * Give each fill-in card the other words its meaning fits, and the sound that
 * tells its own word from them (see `distinguishingStart`). "The missing word
 * means 'car'" is as true of 車 as of 自動車, so the card says which it wants
 * ("starts with じ"), and the page treats the other word typed as neither
 * right nor wrong.
 *
 * A twin is an everyday N5 or N4 word whose first meaning, asides aside, is
 * exactly the card's meaning: one a learner might actually type.
 */
async function withClozeTwins(items: StudyQueueItem[], languageId: string): Promise<StudyQueueItem[]> {
  const cloze = items.filter(i => i.prompt?.kind === 'cloze' && typeof i.prompt.gloss === 'string')
  const glosses = [...new Set(cloze.map(i => plainGloss(String(i.prompt!.gloss))))].filter(Boolean)
  if (glosses.length === 0)
    return items
  const rows = await db.execute<{ form: string, reading: string, gloss: string }>(sql`
    select distinct w.primary_form as form, w.primary_reading as reading,
      lower(trim(regexp_replace(regexp_replace(g->>'text', '\s*\([^)]*\)', '', 'g'), '\s+', ' ', 'g'))) as gloss
    from words w
    join study_items si on si.word_id = w.id and si.published and si.active
    join word_senses ws on ws.word_id = w.id and ws.sort_index = 0
    join language_levels lv on lv.id = w.level_id and lv.code in ('N5', 'N4')
    cross join lateral jsonb_array_elements(ws.glosses) g
    where w.language_id = ${languageId} and w.published and w.is_common and w.primary_reading is not null
      and coalesce(g->>'lang', 'en') in ('en', 'eng')
      and lower(trim(regexp_replace(regexp_replace(g->>'text', '\s*\([^)]*\)', '', 'g'), '\s+', ' ', 'g'))) in ${glosses}
  `)
  return items.map((item) => {
    if (item.prompt?.kind !== 'cloze' || typeof item.prompt.gloss !== 'string')
      return item
    const gloss = plainGloss(item.prompt.gloss)
    const reading = typeof item.prompt.hint === 'string' ? item.prompt.hint : ''
    const accepted = new Set([item.answer.primary, ...item.answer.accepted])
    const twins = [...new Map(rows.rows
      .filter(r => r.gloss === gloss && !accepted.has(r.form) && !accepted.has(r.reading) && r.reading !== reading)
      .map(r => [`${r.form}|${r.reading}`, { form: r.form, reading: r.reading }])).values()]
    if (twins.length === 0 || !reading)
      return item
    const startsWith = distinguishingStart(reading, twins.map(t => t.reading))
    return { ...item, prompt: { ...item.prompt, twins, ...(startsWith ? { startsWith } : {}) } }
  })
}

/**
 * Give each kanji card its readings to introduce it with. A kanji's meaning
 * card carried only the English, so its introduction said "long" with no
 * sound at all, and the reading card that followed asked for something never
 * shown. Up to two kun readings (written out, なが.い as ながい; affix forms
 * like -び left out), then up to two on: 明 has a dozen kun readings, and a
 * plain "first four" never reached メイ.
 */
async function withKanjiReadings(items: StudyQueueItem[]): Promise<StudyQueueItem[]> {
  const characters = [...new Set(items.filter(i => i.prompt?.kind === 'kanji' && typeof i.prompt.character === 'string').map(i => String(i.prompt!.character)))]
  if (characters.length === 0)
    return items
  const rows = await db.execute<{ character: string, type: string, reading: string }>(sql`
    select k.character, r.type, replace(r.reading, '.', '') as reading
    from kanji_readings r
    join kanji k on k.id = r.kanji_id
    where k.character in ${characters} and r.type in ('kun', 'on') and r.reading not like '-%' and r.reading not like '%-'
    order by k.character, r.is_common desc, r.sort_index, r.reading
  `)
  const byCharacter = new Map<string, string[]>()
  for (const character of characters) {
    const mine = rows.rows.filter(r => r.character === character)
    const pick = (type: string) => [...new Set(mine.filter(r => r.type === type).map(r => r.reading))].slice(0, 2)
    byCharacter.set(character, [...pick('kun'), ...pick('on')])
  }
  return items.map((item) => {
    const readings = item.prompt?.kind === 'kanji' ? byCharacter.get(String(item.prompt.character)) : undefined
    return readings?.length ? { ...item, prompt: { ...item.prompt, introReading: readings.join(' · ') } } : item
  })
}

/** Kanji this learner has graduated a card for. */
async function knownKanjiCharacters(userId: string, languageId: string): Promise<Set<string>> {
  const rows = await db.execute<{ character: string }>(sql`
    select distinct k.character
    from srs_cards sc
    join study_item_facets f on f.id = sc.facet_id
    join study_items si on si.id = f.study_item_id
    join kanji k on k.id = si.kanji_id
    where sc.user_id = ${userId} and sc.language_id = ${languageId} and sc.state >= 2
  `)
  return new Set(rows.rows.map(r => r.character))
}

/** Speak prompts are never introduced by the queue (see `newCandidates`). */
function introducedByQueue(): SQL {
  return sql`${studyItems.kind} <> 'speak'`
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
export async function claimStageCelebration(
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
  const levelIds = [...idByCode.values()]
  const rowsFor = async () => new Map((await db
    .select({
      levelId: stageCelebrations.levelId,
      highestStageSeen: stageCelebrations.highestStageSeen,
      lastStageSeen: stageCelebrations.lastStageSeen,
      pendingFrom: stageCelebrations.pendingFrom,
      pendingTo: stageCelebrations.pendingTo
    })
    .from(stageCelebrations)
    .where(and(eq(stageCelebrations.userId, userId), inArray(stageCelebrations.levelId, levelIds)))
  ).map(({ levelId, ...marks }) => [levelId, marks]))

  const seen = await rowsFor()
  for (const p of progress) {
    const levelId = idByCode.get(p.level)
    if (!levelId)
      continue
    const marks = seen.get(levelId) ?? null
    const next = nextCelebration(marks, p.stage)

    // First sight of a level: record where it is and say nothing.
    if (!marks) {
      await db.insert(stageCelebrations).values({ userId, levelId, ...next.marks }).onConflictDoNothing()
      continue
    }

    // A pass. Claimed with the WRITE, not with the read above: two requests in
    // flight at once both read the old mark, and only the one whose update
    // raises it records the pass. The starting point is taken in SQL for the
    // same reason, and an earlier pass still waiting to be shown keeps its own.
    if (next.claimed) {
      await db
        .update(stageCelebrations)
        .set({
          highestStageSeen: p.stage,
          lastStageSeen: p.stage,
          pendingFrom: sql`coalesce(${stageCelebrations.pendingFrom}, ${stageCelebrations.lastStageSeen})`,
          pendingTo: p.stage,
          updatedAt: new Date()
        })
        .where(and(
          eq(stageCelebrations.userId, userId),
          eq(stageCelebrations.levelId, levelId),
          lt(stageCelebrations.highestStageSeen, p.stage)
        ))
      continue
    }

    // Anything else, down included: follow them, silently.
    if (marks.lastStageSeen !== p.stage) {
      await db
        .update(stageCelebrations)
        .set({ lastStageSeen: p.stage, updatedAt: new Date() })
        .where(and(eq(stageCelebrations.userId, userId), eq(stageCelebrations.levelId, levelId)))
    }
  }

  // Whatever is waiting to be shown, this pass or one a lost response never
  // delivered. It stays until a screen says it has shown it.
  const after = await rowsFor()
  for (const p of progress) {
    const marks = after.get(idByCode.get(p.level) ?? '')
    if (marks?.pendingTo != null && marks.pendingFrom != null)
      return { level: p.level, from: marks.pendingFrom, to: marks.pendingTo, stages: p.stages }
  }
  return null
}

/**
 * A celebration has been shown: stop offering it. Only the pass that was
 * shown; a newer one that arrived meanwhile stays pending.
 */
export async function markCelebrationSeen(userId: string, languageCode: string, level: string, to: number): Promise<void> {
  const [row] = await db
    .select({ id: languageLevels.id })
    .from(languageLevels)
    .innerJoin(languages, eq(languages.id, languageLevels.languageId))
    .where(and(eq(languages.code, languageCode), eq(languageLevels.code, level)))
    .limit(1)
  if (!row)
    return
  await db
    .update(stageCelebrations)
    .set({ pendingFrom: null, pendingTo: null, updatedAt: new Date() })
    .where(and(
      eq(stageCelebrations.userId, userId),
      eq(stageCelebrations.levelId, row.id),
      lte(stageCelebrations.pendingTo, to)
    ))
}

/**
 * New cards the queue has introduced in the learner's current study day.
 *
 * A queue card's `firstSeenAt` is stamped by its first answer. Cards made
 * another way (`origin` other than `queue`) are the learner's own choice and do
 * not count against the day's limit.
 */
export async function newCardsToday(userId: string, languageId: string, now: Date): Promise<number> {
  const { timezone, dayBoundaryHour } = await loadUserContext(userId)
  const { start, end } = studyDayRange(studyDateFor(now, timezone, dayBoundaryHour), timezone, dayBoundaryHour)
  const [row] = await db
    .select({ total: sql<number>`count(*)`.mapWith(Number) })
    .from(srsCards)
    .where(and(
      eq(srsCards.userId, userId),
      eq(srsCards.languageId, languageId),
      eq(srsCards.origin, 'queue'),
      gte(srsCards.firstSeenAt, start),
      lt(srsCards.firstSeenAt, end)
    ))
  return row?.total ?? 0
}

/**
 * New WORDS the queue introduced this study day: items whose first card ever
 * was started by the queue today. A card of a word met before is not a new
 * word, and nor is a word that came in through a lesson, the dictionary or
 * Speak; those were the learner's own choice.
 */
export async function newWordsToday(userId: string, languageId: string, now: Date): Promise<number> {
  const { timezone, dayBoundaryHour } = await loadUserContext(userId)
  const { start, end } = studyDayRange(studyDateFor(now, timezone, dayBoundaryHour), timezone, dayBoundaryHour)
  // Times are stored as UTC wall-clock (how the ORM writes a Date), so compare
  // with UTC strings: a Date passed raw would be read in the session's zone.
  const [from, to] = [start.toISOString(), end.toISOString()]
  const res = await db.execute<{ n: number }>(sql`
    select count(*)::int as n from (
      select f.study_item_id
      from srs_cards c
      join study_item_facets f on f.id = c.facet_id
      where c.user_id = ${userId}
        and f.study_item_id in (
          select f2.study_item_id from srs_cards c2
          join study_item_facets f2 on f2.id = c2.facet_id
          where c2.user_id = ${userId} and c2.language_id = ${languageId}
            and c2.first_seen_at >= ${from}::timestamp and c2.first_seen_at < ${to}::timestamp
        )
      group by f.study_item_id
      having min(c.first_seen_at) >= ${from}::timestamp and min(c.first_seen_at) < ${to}::timestamp
        and bool_and(c.origin = 'queue')
    ) t`)
  return res.rows[0]?.n ?? 0
}

/**
 * What the queue could still offer, in ITEMS: words never met (new words) and
 * words already met with a card not yet started (extra practice). One number
 * used to cover both, so "136 new" counted words already known.
 */
async function countAvailableNew(
  languageId: string,
  state: Snapshot,
  filter: ItemFilter,
  ceilings: ReadonlyMap<string, number>
): Promise<{ words: number, extras: number }> {
  const [cat, learner] = await Promise.all([catalogue(languageId), state])
  return availableNew(cat, learner, filter, ceilings)
}

/**
 * New words and extras still to come today, as the Today page shows them.
 *
 * Scoped to the level the learner studies (Settings, shared with Study), so
 * Today and Study count the same words. `stageWait` says when the stage is why
 * no new word is left: every word in it met and too little of it learned. The
 * page used to say "11 new words for today" right then, and Study served thirty
 * cards of words already met with nothing to say why.
 */
export async function newLeftToday(userId: string, languageId: string, now: Date, moreNew = 0, state?: Snapshot): Promise<{
  budget: NewBudget
  extrasLeft: number
  newAvailable: number
  stageWait: StageProgress | null
}> {
  const learner = state ?? loadLearnerState(userId, languageId)
  const [{ rows, cat }, [settings]] = await Promise.all([
    stageRows(userId, languageId, learner),
    db.select({ studyLevel: userSettings.studyLevel }).from(userSettings).where(eq(userSettings.userId, userId)).limit(1)
  ])
  const ceilings = ceilingsFrom(rows)
  const levelCode = settings?.studyLevel ?? ''
  const level = levelCode ? cat.levels.find(l => l.code === levelCode) : undefined
  const [budget, available] = await Promise.all([
    todayBudget(userId, languageId, now, moreNew),
    countAvailableNew(languageId, learner, level ? { levelId: level.id } : {}, ceilings)
  ])
  const waiting = available.words === 0 && budget.wordsLeft > 0 && ceilings.size > 0
  const stages = waiting ? progressFrom(rows, cat) : []
  const stageWait = (level ? stages.find(s => s.level === levelCode) : stages[0]) ?? null
  return {
    budget,
    extrasLeft: Math.min(budget.extrasLeft, available.extras),
    newAvailable: available.words,
    stageWait
  }
}

/**
 * When each word these learners know was first met, for words first met since
 * `since`: one row per word, at its first card. Feeds "new words" counts
 * (friends, the weekly email), which used to add up new CARDS, so a second
 * card of a word known for weeks counted as a new word. Any origin counts
 * here: a word learned in a lesson is still a word learned.
 */
export async function wordsFirstMet(userIds: string[], since: Date): Promise<Array<{ userId: string, firstSeen: Date }>> {
  if (userIds.length === 0)
    return []
  // UTC wall-clock both ways, as the ORM stores it (see newWordsToday).
  const res = await db.execute<{ user_id: string, first_seen: string }>(sql`
    select c.user_id, to_char(min(c.first_seen_at), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as first_seen
    from srs_cards c
    join study_item_facets f on f.id = c.facet_id
    where c.user_id in ${userIds}
    group by c.user_id, f.study_item_id
    having min(c.first_seen_at) >= ${since.toISOString()}::timestamp`)
  return res.rows.map(r => ({ userId: r.user_id, firstSeen: new Date(r.first_seen) }))
}

/** Today's new words and extra practice, from the learner's settings and what they have started. */
export async function todayBudget(userId: string, languageId: string, now: Date, moreNew = 0): Promise<NewBudget> {
  const [[settings], cards, words] = await Promise.all([
    db.select({ dailyNewLimit: userSettings.dailyNewLimit, extraPracticeMultiple: userSettings.extraPracticeMultiple })
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1),
    newCardsToday(userId, languageId, now),
    newWordsToday(userId, languageId, now)
  ])
  return newBudget({
    dailyNewLimit: settings?.dailyNewLimit ?? 10,
    moreNew,
    extraPracticeMultiple: settings?.extraPracticeMultiple ?? 2,
    newWordsToday: words,
    newCardsToday: cards
  })
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
    return { items: [], counts: { due: 0, dueCards: 0, learning: 0, newAvailable: 0, extrasAvailable: 0, ghost: 0, newToday: 0, newLimit: 0, extrasToday: 0, extrasLimit: 0 }, gate: null, progress: [], serverTime: now.toISOString() }
  }

  // The limit is DAILY, and counts WORDS: each new word's first card is its
  // introduction, and the other cards of words already met come beside them,
  // up to their own multiple of it (see `newBudget`).
  //
  // The limit is DAILY. It was applied per request, so every "Refresh" handed
  // over ten more and a beginner could take sixty new words on day one, then
  // meet a wall of reviews on day three. Only cards the queue introduced count
  // — a finished lesson or a saved word was the learner's own choice.
  // "Learn 5 more anyway" raises TODAY's limit. The page sends what it has
  // been granted today on every request — it used to send it once, so the
  // next refill counted the day afresh and the wall came straight back.
  const [budget, learner, cat, learnerPrompting] = await Promise.all([
    todayBudget(userId, language.id, now, query.moreNew ?? 0),
    loadLearnerState(userId, language.id),
    catalogue(language.id),
    promptContextFor(userId)
  ])

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
  // Unlevelled items pass every level filter.
  //
  // The 63 sound-series items carry no JLPT level, because the concept is not
  // JLPT-graded. Excluding them is the filter's literal meaning and the wrong
  // reading of it: picking N5 silently dropped a whole deck rather than
  // narrowing to a level, and nothing said so.
  const levelFilter = levelId === null
    ? []
    : [or(eq(studyItems.levelId, levelId), isNull(studyItems.levelId))!]

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
  // The same three filters, for the rules worked out in memory.
  const filter: ItemFilter = {
    ...(query.kind ? { kind: query.kind } : {}),
    ...(levelId === null ? {} : { levelId }),
    ...(unitIds ? { unitItemIds: new Set(unitIds) } : {})
  }

  const prompting = { ...learnerPrompting, salt: promptSalt }

  // Cards the page still holds, when it fetches ahead (see `inFlight` on the
  // query): left out of this batch, and their unanswered new ones charged to
  // today's limits as though answered.
  const inFlight = new Set(query.inFlight?.split(',').filter(Boolean) ?? [])
  const charge = inFlightCharge(cat, learner, inFlight)
  const wordsLeft = Math.max(0, budget.wordsLeft - charge.words)
  const extrasLeft = Math.max(0, budget.extrasLeft - charge.extras)
  const fill = <R extends PickableRow>(nextChunk: (offset: number, size: number) => Promise<R[]>, limit: number) =>
    withPrompts(language.id, prompting, nextChunk, limit)

  // Cards in due order, a chunk at a time, for `withPrompts` to walk.
  const cardColumns = {
    cardId: srsCards.id,
    facetId: srsCards.facetId,
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
    lastReview: srsCards.lastReview
  }
  const dueCards = (...where: SQL[]) => (offset: number, size: number) => db
    .select(cardColumns)
    .from(srsCards)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
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
      ...levelFilter,
      ...(inFlight.size > 0 ? [notInArray(srsCards.facetId, [...inFlight])] : []),
      ...where
    ))
    .orderBy(asc(srsCards.due), asc(srsCards.facetId))
    .limit(size)
    .offset(offset)

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
  let dueRows = query.mode === 'new' ? [] : await fill(dueCards(), query.limit)

  // --- New: published items this user has never seen ------------------------
  //
  // Bounded by the curriculum. Without this the "new" pool was the entire
  // corpus at once, so there was no progression — just 12,000 items in an
  // order nothing had set. Reviews are deliberately NOT bounded: anything
  // already started keeps coming back regardless of where it sits.
  const ceilings = await stageCeilings(userId, language.id, learner)
  const curriculumBounded = ceilings.size > 0
  // Without this a fresh account gets an empty queue forever, because a card
  // only comes into existence when the first answer is recorded.
  //
  // Two kinds of new card, limited separately: a word never met (its first
  // card is its introduction, counted against today's new WORDS), and another
  // card of a word already met (extra practice, counted against its own
  // multiple). Introductions first; in a mixed session extras fill what is
  // left of the batch, and in any session they carry on alone once the day's
  // words are done.
  //
  // Which facets qualify is worked out in memory (`newCandidates`), in the
  // order they are introduced. No card exists yet, so state and reps are zero.
  const pickNew = async (met: boolean, limit: number) => {
    if (limit <= 0)
      return []
    const candidates = newCandidates(cat, learner, filter, ceilings, met).filter(f => !inFlight.has(f.id))
    return fill(async (offset, size) => candidates.slice(offset, offset + size).map(f => ({ facetId: f.id, state: 0, reps: 0 })), limit)
  }

  const slots = Math.max(0, query.limit - dueRows.length)
  const introRows = query.mode === 'due' ? [] : await pickNew(false, Math.min(wordsLeft, slots))
  // "Learning new words" means new words: a met word's next card only comes
  // once there are none to give, never shuffled in among them. Mixed
  // sessions still fill the batch with both.
  const extraRows = query.mode === 'due' || (query.mode === 'new' && introRows.length > 0)
    ? []
    : await pickNew(true, Math.min(extrasLeft, slots - introRows.length))
  const newRows = [...introRows, ...extraRows]

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
  //
  // Only when the stage is out of new material, not when today's limits are
  // reached: then the day is done, and the page says so, instead of carrying
  // on with the stage's started cards under "Practising words you've met".
  if (query.mode === 'new' && newRows.length === 0 && ceilings.size > 0 && wordsLeft > 0) {
    dueRows = await fill(dueCards(
      // Not yet learned. A graduated card in this stage is finished; its
      // review belongs in the review queue, not in "finish the stage".
      lt(srsCards.state, 2),
      sql.raw(currentStagePredicate(ceilings, STAGE_SIZE)),
      // A missed Speak prompt is the reader's review, not this stage's material.
      introducedByQueue()
    ), query.limit)
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

  // Clips only while they say what the sentence or word says now, and the
  // dictation hint from the current translation (see clips.service).
  const [dueServed, newServed] = await Promise.all([withCurrentAudio(dueRows), withCurrentAudio(newRows)])

  let items: StudyQueueItem[] = [
    ...dueServed.map(r => ({
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
      prompt: withPromptTokens(withDialogueTokens(withDialogueAudio(withSpeakAudio(r.prompt)), gloss), gloss, r.answer),
      answer: r.answer,
      distractors: r.distractors,
      assets: withAssetUrls(r.assets)
    })),
    ...newServed.map(r => ({
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
      prompt: withPromptTokens(withDialogueTokens(withDialogueAudio(withSpeakAudio(r.prompt)), gloss), gloss, r.answer),
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
  // `newCandidates` bounds the NEW pool, but the due pool legitimately
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
  items = await withSeries(items, userId, language.id)
  items = await withSenses(items)
  items = await withClozeTwins(items, language.id)
  items = await withKanjiReadings(items)

  shuffle(items)

  // Introduce an item ONCE, ever.
  //
  // `isNew` is a fact about a CARD — state 0 — but "have I met 仕事?" is a fact
  // about the ITEM, and a word is three or four cards. So the introduction
  // fired for every facet: meaning, reading, production, listening, each
  // shuffled to a different point in the session, all announcing the same word.
  //
  // Taught means: for grammar, the lesson was read (`lesson_views`); for
  // everything else, one of the item's cards has actually been ANSWERED. The
  // view used to count for every kind — written the moment "Got it" was
  // pressed — so a word whose question was skipped, or whose session ended
  // before it was answered, came back later as a quiz with nothing taught.
  const itemIds = [...new Set(items.map(i => i.studyItemId))]
  const grammarIds = new Set(items.filter(i => i.kind === 'grammar').map(i => i.studyItemId))
  const [viewed, answered] = itemIds.length === 0
    ? [[], []]
    : await Promise.all([
        db.select({ studyItemId: lessonViews.studyItemId })
          .from(lessonViews)
          .where(and(eq(lessonViews.userId, userId), inArray(lessonViews.studyItemId, [...grammarIds]))),
        db.selectDistinct({ studyItemId: studyItemFacets.studyItemId })
          .from(srsCards)
          .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
          .where(and(
            eq(srsCards.userId, userId),
            inArray(studyItemFacets.studyItemId, itemIds),
            sql`(${srsCards.reps} > 0 or ${srsCards.lastReview} is not null)`
          ))
      ])
  const seen = new Set([
    ...viewed.map(r => r.studyItemId).filter(id => grammarIds.has(id)),
    ...answered.map(r => r.studyItemId).filter(id => !grammarIds.has(id))
  ])

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

  for (const item of items) {
    item.firstTime = item.isNew
    item.isNew = introducer.get(item.studyItemId) === item.facetId
  }

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

  const available = await countAvailableNew(language.id, learner, filter, ceilings)

  // What this deck is holding back, if anything. Only worth asking when the
  // deck came up empty of new material — otherwise there is nothing to explain.
  // Only when the deck genuinely has nothing to give. `newAvailable` being zero
  // is no longer sufficient: the stage fallback above may have filled the queue
  // with the current stage's unfinished cards, and explaining that material is
  // locked ahead while handing the reader twenty cards is simply false.
  const gate = items.length > 0 || available.words || !curriculumBounded
    ? null
    : heldBack(cat, learner, filter)

  const progress = await stageProgress(userId, language.id, learner)

  return {
    items,
    gate,
    progress,
    celebrate: await claimStageCelebration(userId, progress),
    counts: {
      due: counts?.due ?? 0,
      dueCards: counts?.dueCards ?? 0,
      learning: counts?.learning ?? 0,
      newAvailable: available.words,
      extrasAvailable: available.extras,
      ghost: ghosts?.total ?? 0,
      newToday: budget.wordsToday,
      newLimit: budget.wordsLimit,
      extrasToday: budget.extrasToday,
      extrasLimit: budget.extrasLimit
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
  // Unlevelled items pass every level filter (see `matchesFilter`).
  //
  // The 63 sound-series items carry no JLPT level, because the concept is not
  // JLPT-graded. Excluding them is the filter's literal meaning and the wrong
  // reading of it: picking N5 silently dropped a whole deck rather than
  // narrowing to a level, and nothing said so.
  const filter: ItemFilter = levelId === null ? {} : { levelId }

  // Everything the counts need is in memory: no per-deck SQL.
  const [learner, cat, units] = await Promise.all([
    loadLearnerState(userId, language.id),
    catalogue(language.id),
    catalogueUnits(language.id)
  ])
  // The unseen counts must respect the curriculum too. Without this the picker
  // advertised "Kanji 1351 new" while the queue, correctly gated, served none
  // of them — the same defect the level filter had, in a second place.
  const ceilings = await stageCeilings(userId, language.id, learner)
  const items = new Map<string, CatalogueItem>()
  const itemsOfKind = new Map<string, CatalogueItem[]>()
  for (const item of cat.items) {
    if (!matchesFilter(item, filter))
      continue
    items.set(item.id, item)
    const ofKind = itemsOfKind.get(item.kind)
    if (ofKind)
      ofKind.push(item)
    else
      itemsOfKind.set(item.kind, [item])
  }

  // Kinds in the order Postgres grouped them: by code point, not by locale,
  // so not `localeCompare`.
  const byKind = [...itemsOfKind]
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([kind, ofKind]) => ({ kind, ...deckCounts(ofKind, learner, ceilings, now) }))
  const byUnit = units.map(u => ({ ...u, ...deckCounts([...u.itemIds].flatMap(id => items.get(id) ?? []), learner, ceilings, now) }))

  const KIND_LABELS: Record<string, { label: string, description: string }> = {
    'kana': { label: 'Kana', description: 'Hiragana and katakana' },
    'word': { label: 'Vocabulary', description: 'Words: meaning and reading' },
    'kanji': { label: 'Kanji', description: 'Stroke order and handwriting' },
    'grammar': { label: 'Grammar', description: 'Patterns, and why they work that way' },
    'sentence': { label: 'Sentences', description: 'Word order: rebuild a sentence from its parts' },
    'phonetic-series': { label: 'Sound series', description: 'Learn 青 = セイ, then watch 晴・清・静 fall into place' },
    'speak': { label: 'Speak', description: 'Prompts you missed in Speak, to say out loud again' }
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
 * When the next card that is not yet due becomes due, or null if none is
 * waiting. The due list says "the next one is in 3 hours" from it, and the nav
 * sets a timer on it so the Review badge moves the moment a card comes due.
 */
export async function nextDueAfter(userId: string, languageId: string, now: Date): Promise<string | null> {
  const [soonest] = await db
    .select({ due: srsCards.due })
    .from(srsCards)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .where(and(
      eq(srsCards.userId, userId),
      eq(srsCards.languageId, languageId),
      eq(srsCards.suspended, false),
      gt(srsCards.due, now),
      inArray(srsCards.state, [1, 2, 3]),
      eq(studyItemFacets.enabled, true),
      eq(studyItems.published, true),
      eq(studyItems.active, true)
    ))
    .orderBy(asc(srsCards.due))
    .limit(1)
  return soonest?.due?.toISOString() ?? null
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
    return { items: [], total: 0, totalCards: 0, byKind: [], serverTime: now.toISOString(), nextDueAt: null }

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
          seriesReading: phoneticSeries.primaryReading,
          speakText: speakSteps.text,
          speakReading: speakSteps.readingKana,
          speakCode: speakSessions.code
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
        .leftJoin(speakSteps, eq(speakSteps.id, studyItems.speakStepId))
        .leftJoin(speakSessions, eq(speakSessions.id, speakSteps.sessionId))
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
                : r.speakText
                  ? [r.speakText, r.speakReading, r.speakCode ? `${ROUTE_BASE_PATHS.SPEAK}/${encodeURIComponent(r.speakCode)}` : null]
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

  // When nothing is due, when the next thing will be.
  //
  // "Nothing is due" on its own leaves the reader guessing whether that means
  // an hour or a week, and the only way to find out was to keep opening the
  // page. Asked for only when the list is empty, so the common path pays
  // nothing for it.
  const nextDueAt = (totals?.total ?? 0) === 0 ? await nextDueAfter(userId, language.id, now) : null

  return {
    items,
    total: totals?.total ?? 0,
    totalCards: totals?.totalCards ?? 0,
    byKind,
    serverTime: now.toISOString(),
    nextDueAt
  }
}

/**
 * Just the stage the reader is ON, not everything up to it.
 *
 * `inCurriculum` bounds new material at the top of the current stage, which
 * is right for introducing things. Finishing a stage needs the narrower
 * window: cards from earlier stages are already learned and their reviews are
 * not what "finish stage 4" means.
 *
 * Inlined rather than parameterised because the map holds one row per level.
 * The ids come from the database, never from user input, and are quoted
 * regardless.
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

  const [{ rows: rollup, cat }, samples] = await Promise.all([stageRows(userId, language.id), stageSamples(language.id)])
  const levelCode = new Map(cat.levels.map(l => [l.id, l.code]))
  // In level, stage, kind order, as the rollup returns them.
  const rows = rollup.flatMap((r) => {
    const level = levelCode.get(r.levelId)
    return level === undefined ? [] : [{ ...r, level }]
  })

  // Group into levels, then stages.
  const byLevel = new Map<string, Map<number, { total: number, learned: number, started: number, kinds: Map<string, number> }>>()
  for (const row of rows) {
    const level = byLevel.get(row.level) ?? new Map()
    const stage = level.get(row.stage) ?? { total: 0, learned: 0, started: 0, kinds: new Map<string, number>() }
    stage.total += row.total
    stage.learned += row.learned
    stage.started += row.started
    // Keyed on ITEMS: this is the "what is in this stage" line, not progress.
    stage.kinds.set(row.kind, (stage.kinds.get(row.kind) ?? 0) + row.items)
    level.set(row.stage, stage)
    byLevel.set(row.level, level)
  }

  const levels: CourseLevel[] = []
  for (const [level, stageMap] of byLevel) {
    const ordered = [...stageMap.entries()].sort((a, b) => a[0] - b[0])
    // The first stage not yet retained well enough — the one you are on.
    const current = ordered.find(([, v]) => v.total > 0 && v.learned / v.total < STAGE_PASS)?.[0] ?? null

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
        started: v.started,
        kinds: [...v.kinds].map(([kind, count]) => ({ kind, count })).sort((a, b) => b.count - a.count),
        sample: samples.get(`${level}:${stage}`) ?? [],
        // Everything up to and including the current stage is reachable.
        open: current === null || stage <= current
      }))
    })
  }

  return { levels }
}

/**
 * Up to four subjects per stage, so a stage can be described by its content.
 * Content only, so cached with the catalogue.
 */
async function stageSamples(languageId: string): Promise<Map<string, string[]>> {
  return cachedContent(`stage-samples:${languageId}`, () => loadStageSamples(languageId))
}

async function loadStageSamples(languageId: string): Promise<Map<string, string[]>> {
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
        -- cannot be what a stage is about. Speak prompts, likewise.
        and si.kind not in ('grammar', 'speak', 'phonetic-series')
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
