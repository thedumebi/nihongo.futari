import type { Catalogue, CatalogueFacet, CatalogueItem, DeckCounts, InFlightCharge, ItemFilter, LearnerState, StageRow } from '@/types/curriculum.js'
import type { StageProgress } from '@/types/study.js'

import { STAGE_PASS, STAGE_SIZE } from '@/constants/endpoints.js'

import { SERIES_KNOWN_MIN } from '../series/index.js'

/**
 * The curriculum rules, as plain functions of the catalogue and one learner's
 * state (see `types/curriculum.ts`). Each one is the SQL it replaced, rule for
 * rule, and the learner goldens (`learner-goldens.db.test.ts`) hold them to it.
 */

/**
 * Kinds that are not part of the stage system.
 *
 * Grammar: a topic is admitted to review by reading its lesson, and Lessons is
 * a surface of its own that a reader moves through in their own order. Two
 * gates on the same content meant a topic could be unlocked by the curriculum
 * and barred by the lesson, or the reverse; and it made the stage a reader is
 * on depend on how much grammar they happened to have read.
 *
 * Speak prompts: they become cards only by being missed in a session, so they
 * are never material a stage is waiting on.
 *
 * Sound series: one is offered only once its kanji are known (`seriesReady`),
 * so a stage must not wait on it.
 */
const OUTSIDE_STAGES = new Set(['grammar', 'speak', 'phonetic-series'])

export function stageOf(sortIndex: number): number {
  return Math.ceil(sortIndex / STAGE_SIZE)
}

/**
 * A row per (level, stage, kind), in level, stage, kind order.
 *
 * Suspended cards are excluded from BOTH halves of the ratio. A leech you have
 * given up on should not hold a stage shut: with the pass mark at 100% one
 * suspended card made a stage unpassable forever, and counting it as
 * unlearned-but-required is the opposite of what suspending it meant.
 *
 * `started` is met at least once: the difference from `learned` is what is
 * still settling. `items` is there because a stage needs both units to
 * describe itself honestly: "50 kana" is what the stage IS, "14/96" is how far
 * through its cards you are.
 */
export function rollupStages(catalogue: Catalogue, state: LearnerState): StageRow[] {
  const rows = new Map<string, StageRow>()
  for (const item of catalogue.items) {
    if (item.levelId === null || OUTSIDE_STAGES.has(item.kind) || item.facets.length === 0)
      continue
    const stage = stageOf(item.sortIndex)
    const key = `${item.levelId}\u0000${stage}\u0000${item.kind}`
    let row = rows.get(key)
    if (!row) {
      row = { levelId: item.levelId, stage, kind: item.kind, total: 0, learned: 0, started: 0, items: 0 }
      rows.set(key, row)
    }
    row.items++
    for (const facet of item.facets) {
      const card = state.cards.get(facet.id)
      if (card?.suspended)
        continue
      row.total++
      if (card) {
        row.started++
        if (card.state >= 2)
          row.learned++
      }
    }
  }
  const levelOrder = new Map(catalogue.levels.map((l, i) => [l.id, i]))
  return [...rows.values()].sort((a, b) =>
    (levelOrder.get(a.levelId) ?? 0) - (levelOrder.get(b.levelId) ?? 0)
    || a.stage - b.stage
    || (a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : 0))
}

interface StageTotal { stage: number, total: number, learned: number }

/** Each level's stages, summed over kind, in stage order. */
function stagesByLevel(rows: StageRow[]): Map<string, StageTotal[]> {
  const byLevel = new Map<string, Map<number, StageTotal>>()
  for (const row of rows) {
    const level = byLevel.get(row.levelId) ?? new Map<number, StageTotal>()
    const stage = level.get(row.stage) ?? { stage: row.stage, total: 0, learned: 0 }
    stage.total += row.total
    stage.learned += row.learned
    level.set(row.stage, stage)
    byLevel.set(row.levelId, level)
  }
  return new Map([...byLevel].map(([levelId, stages]) => [levelId, [...stages.values()].sort((a, b) => a.stage - b.stage)]))
}

/**
 * The stage you are on: the first not yet retained well enough.
 *
 * `total > 0` so a stage whose every card is suspended cannot become an
 * eternal wall: it reports 0/0, less than any pass mark, and would be the
 * first open stage forever. Nothing left to learn there is passed, not failed.
 */
function isOpen(stage: StageTotal): boolean {
  return stage.total > 0 && stage.learned / stage.total < STAGE_PASS
}

/** A sort_index ceiling per level; a level with every stage passed is absent. */
export function ceilingsFrom(rows: StageRow[]): Map<string, number> {
  const ceilings = new Map<string, number>()
  for (const [levelId, stages] of stagesByLevel(rows)) {
    const current = stages.find(isOpen)
    if (current)
      ceilings.set(levelId, current.stage * STAGE_SIZE)
  }
  return ceilings
}

/** The stage each level is on, in level order. */
export function progressFrom(rows: StageRow[], catalogue: Catalogue): StageProgress[] {
  const byLevel = stagesByLevel(rows)
  const progress: StageProgress[] = []
  for (const level of catalogue.levels) {
    const stages = byLevel.get(level.id)
    const current = stages?.find(isOpen)
    if (stages && current)
      progress.push({ level: level.code, stage: current.stage, stages: stages.length, learned: current.learned, total: current.total })
  }
  return progress
}

/**
 * Within the curriculum: new material up to the top of the current stage.
 *
 * Grammar is admitted by its LESSON, not by the curriculum (`lessonOpened`).
 * Taking grammar out of the stage rollup stopped topics counting towards a
 * stage, but the bound still applied to them, so a topic whose lesson had been
 * read was barred anyway if it sorted past the ceiling. A sound series is
 * admitted by knowing its kanji (`seriesReady`). A level with no ceiling is
 * unrestricted.
 */
export function inCurriculum(item: CatalogueItem, ceilings: ReadonlyMap<string, number>): boolean {
  if (item.levelId === null || item.kind === 'grammar' || item.kind === 'phonetic-series')
    return true
  const ceiling = ceilings.get(item.levelId)
  return ceiling === undefined || item.sortIndex <= Math.floor(ceiling)
}

export function matchesFilter(item: CatalogueItem, filter: ItemFilter): boolean {
  if (filter.kind !== undefined && item.kind !== filter.kind)
    return false
  if (filter.levelId !== undefined && item.levelId !== null && item.levelId !== filter.levelId)
    return false
  return filter.unitItemIds === undefined || filter.unitItemIds.has(item.id)
}

/**
 * A sound series is only worth teaching once its kanji are familiar.
 *
 * "共 is read キョウ in 供 and 恭" means nothing to someone who has met neither,
 * and the card arrived regardless: three unknown kanji and a rule about them.
 * So a series is offered only when the learner already knows (has graduated a
 * card for) at least two kanji that follow it. Anything else passes.
 */
export function seriesReady(item: CatalogueItem, catalogue: Catalogue, state: LearnerState): boolean {
  if (item.phoneticSeriesId === null)
    return true
  let known = 0
  for (const kanjiId of catalogue.seriesKanji.get(item.phoneticSeriesId) ?? []) {
    if (state.knownKanji.has(kanjiId))
      known++
  }
  return known >= SERIES_KNOWN_MIN
}

/**
 * A topic is only offered once its lesson has been opened.
 *
 * Reading the lesson is what admits a grammar point to review: you learn a
 * topic, then it comes back. Without this the queue would go on introducing
 * topics cold: "everything is a quiz. Nothing teaches me stuff before quizzing
 * me". Only grammar; words, kanji and kana have no lesson.
 */
export function lessonOpened(item: CatalogueItem, state: LearnerState): boolean {
  return item.kind !== 'grammar' || state.lessonsViewed.has(item.id)
}

function uncardedCount(item: CatalogueItem, state: LearnerState): number {
  let n = 0
  for (const facet of item.facets) {
    if (!state.cards.has(facet.id))
      n++
  }
  return n
}

/**
 * What the queue could still introduce, in items: never met (`words`), or met
 * with a facet not yet started (`extras`).
 */
export function availableNew(
  catalogue: Catalogue,
  state: LearnerState,
  filter: ItemFilter,
  ceilings: ReadonlyMap<string, number>
): { words: number, extras: number } {
  let words = 0
  let extras = 0
  for (const item of catalogue.items) {
    if (item.kind === 'speak' || !matchesFilter(item, filter) || !inCurriculum(item, ceilings)
      || !item.facets.some(f => !state.cards.has(f.id)) || !seriesReady(item, catalogue, state)) {
      continue
    }
    if (!state.itemsWithCard.has(item.id))
      words++
    else if (lessonOpened(item, state))
      extras++
  }
  return { words, extras }
}

/**
 * The facets the queue may introduce next, in introduction order. `met` picks
 * items already met (extra practice) or never met (new words).
 *
 * One facet per item: its LOWEST `intro_order` uncarded facet. A word is
 * several cards (仕事 is `meaning`, `reading`, `production` and `listening`),
 * and the pool used to select all four the moment the word came up: shuffled
 * apart, each carrying `isNew`, that is four introductions of the same word
 * scattered through a session. Reading `intro_order` means a word is met by its
 * meaning first, and the rest follow one at a time as each earns a card.
 *
 * Never Speak prompts: one becomes a card only when the learner misses it in a
 * session (`saveSpeakStep`). Offered cold, a prompt out of its build-up is just
 * a hard sentence. Every count of new material applies the same rule, so none
 * advertises a Speak card the queue would never give.
 */
export function newCandidates(
  catalogue: Catalogue,
  state: LearnerState,
  filter: ItemFilter,
  ceilings: ReadonlyMap<string, number>,
  met: boolean
): CatalogueFacet[] {
  const candidates: CatalogueFacet[] = []
  for (const item of catalogue.items) {
    if (item.kind === 'speak' || state.itemsWithCard.has(item.id) !== met || !matchesFilter(item, filter)
      || !inCurriculum(item, ceilings) || !lessonOpened(item, state) || !seriesReady(item, catalogue, state)) {
      continue
    }
    const first = item.facets.find(f => !state.cards.has(f.id))
    if (first)
      candidates.push(first)
  }
  return candidates.sort((a, b) => a.rank - b.rank)
}

/**
 * Why a deck has no new material, when the curriculum is the reason.
 *
 * The same filters as the queue MINUS the stage ceiling. If facets turn up,
 * they are waiting behind the gate rather than absent, and the first one's
 * position says which stage opens them.
 */
export function heldBack(catalogue: Catalogue, state: LearnerState, filter: ItemFilter): { waiting: number, opensAtStage: number } | null {
  let waiting = 0
  let firstAt: number | null = null
  for (const item of catalogue.items) {
    if (item.kind === 'speak' || !matchesFilter(item, filter))
      continue
    const facets = uncardedCount(item, state)
    if (facets === 0)
      continue
    waiting += facets
    firstAt = firstAt === null ? item.sortIndex : Math.min(firstAt, item.sortIndex)
  }
  return waiting === 0 || firstAt === null ? null : { waiting, opensAtStage: stageOf(firstAt) }
}

/**
 * One deck's numbers, over the items in it.
 *
 * In ITEMS for `due`: states 1-3, unsuspended, counted per distinct item, the
 * same definition every other surface uses. The picker sits directly above the
 * Study header, and while this counted state-2 cards the two disagreed on the
 * same screen. `learning` counts cards in steps, and `total`, `unseen` and
 * `locked` count facets: unseen within the curriculum, locked beyond it.
 *
 * A Speak prompt is in a deck only once it is the reader's own card.
 */
export function deckCounts(items: Iterable<CatalogueItem>, state: LearnerState, ceilings: ReadonlyMap<string, number>, now: Date): DeckCounts {
  const counts: DeckCounts = { total: 0, due: 0, learning: 0, unseen: 0, locked: 0 }
  const at = now.getTime()
  for (const item of items) {
    const open = inCurriculum(item, ceilings)
    let due = false
    for (const facet of item.facets) {
      const card = state.cards.get(facet.id)
      if (!card) {
        if (item.kind === 'speak')
          continue
        if (open)
          counts.unseen++
        else
          counts.locked++
      } else if (!card.suspended && card.due.getTime() <= at) {
        due ||= card.state >= 1 && card.state <= 3
        if (card.state === 1 || card.state === 3)
          counts.learning++
      }
      counts.total++
    }
    if (due)
      counts.due++
  }
  return counts
}

/**
 * What cards the page still holds will take from today's limits once answered:
 * a facet with no card yet is an introduction if its item has none either (one
 * per item), and extra practice otherwise. Facets already carded take nothing.
 */
export function inFlightCharge(catalogue: Catalogue, state: LearnerState, inFlight: ReadonlySet<string>): InFlightCharge {
  let words = 0
  let extras = 0
  if (inFlight.size === 0)
    return { words, extras }
  for (const item of catalogue.items) {
    let uncarded = 0
    for (const facet of item.facets) {
      if (inFlight.has(facet.id) && !state.cards.has(facet.id))
        uncarded++
    }
    if (uncarded === 0)
      continue
    if (state.itemsWithCard.has(item.id)) {
      extras += uncarded
    } else {
      words++
      extras += uncarded - 1
    }
  }
  return { words, extras }
}
