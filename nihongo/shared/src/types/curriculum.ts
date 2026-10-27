import type { LanguageLevel } from './languages.js'
import type { SrsCard } from './srs.js'
import type { CurriculumUnit, StudyItem, StudyItemFacet } from './study-items.js'
import type { StudyDeck } from './study.js'

/**
 * The curriculum held in memory, and what one learner has of it.
 *
 * Every learner read used to ask Postgres the same question of the whole
 * corpus: for each of 34,000 facets, does this learner have a card? That is a
 * catalogue that changes at a deploy or an approval, crossed with a few hundred
 * rows of the learner's own. So the catalogue is loaded once per language
 * (`catalogue.service.ts`), the learner's rows once per request
 * (`learner-state.service.ts`), and the crossing is done in plain functions
 * (`lib/srs/curriculum.ts`).
 */

/**
 * An enabled facet. `rank` is its place in the order the queue introduces
 * material, item `sort_index` then facet id, as POSTGRES collates the ids:
 * production sorts en_US, which ignores hyphens, so a JavaScript sort of the
 * ids would not agree with it.
 */
export type CatalogueFacet = Pick<StudyItemFacet, 'id' | 'introOrder'> & { rank: number }

/** A published, active item, with its enabled facets in `(intro_order, id)` order. */
export type CatalogueItem = Pick<StudyItem, 'id' | 'kind' | 'levelId' | 'sortIndex' | 'phoneticSeriesId'> & {
  facets: CatalogueFacet[]
}

export type CatalogueLevel = Pick<LanguageLevel, 'id' | 'code' | 'sortIndex'>

/** A published curriculum unit and the items in it. */
export type CatalogueUnit = Pick<CurriculumUnit, 'code' | 'title' | 'description' | 'imageUrl' | 'sortIndex'> & {
  itemIds: Set<string>
}

export interface Catalogue {
  languageId: string
  /** In `sort_index` order. */
  levels: CatalogueLevel[]
  items: CatalogueItem[]
  /** A sound series' following kanji, by series id. */
  seriesKanji: Map<string, string[]>
}

/**
 * One of the learner's cards, with what the counts need of its facet and item:
 * `itemId` (the facet's study item) and `live`, whether the facet is enabled
 * and the item published and active, which every due count requires.
 */
export type LearnerCard = Pick<SrsCard, 'id' | 'state' | 'suspended' | 'due' | 'firstSeenAt' | 'origin' | 'createdAt'> & {
  itemId: StudyItemFacet['studyItemId']
  live: boolean
}

/** How much is due, in items (the headline) and in cards. */
export interface DueCount {
  items: number
  cards: number
}

/** One learner's cards in one language, and the lessons they have opened. */
export interface LearnerState {
  /** By facet id, in `due, facet_id` order as Postgres sorts them. */
  cards: Map<string, LearnerCard>
  /** Items with a card on any facet, enabled or not. */
  itemsWithCard: Set<string>
  /** Each such item's highest card state: 2 or more is known. */
  itemStates: Map<string, number>
  /** Kanji with a learned card (state 2 or more) on any of their items. */
  knownKanji: Set<string>
  /** Words with a learned card (state 2 or more) that is not suspended. */
  knownWords: Set<string>
  /** Items whose lesson has been opened. */
  lessonsViewed: Set<string>
}

/**
 * The deck filters a queue or a count applies. `levelId` keeps unlevelled
 * items, and an empty string matches only those; `unitItemIds` empty matches
 * nothing.
 */
export interface ItemFilter {
  kind?: string
  levelId?: string
  unitItemIds?: ReadonlySet<string>
}

/** One (level, stage, kind) of the stage rollup. Cards, except `items`. */
export interface StageRow {
  levelId: string
  stage: number
  kind: string
  total: number
  learned: number
  started: number
  items: number
}

/** What cards a page still holds will take from today's limits once answered. */
export interface InFlightCharge {
  words: number
  extras: number
}

/** The numbers on one deck in the picker. */
export type DeckCounts = Pick<StudyDeck, 'total' | 'due' | 'learning' | 'unseen' | 'locked'>
