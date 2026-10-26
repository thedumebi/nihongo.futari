import type { LanguageLevel } from './languages.js'
import type { SrsCard } from './srs.js'
import type { StudyItem, StudyItemFacet } from './study-items.js'

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

export interface Catalogue {
  languageId: string
  /** In `sort_index` order. */
  levels: CatalogueLevel[]
  items: CatalogueItem[]
  /** A sound series' following kanji, by series id. */
  seriesKanji: Map<string, string[]>
}

export type LearnerCard = Pick<SrsCard, 'state' | 'suspended'>

/** One learner's cards in one language, and the lessons they have opened. */
export interface LearnerState {
  /** By facet id. */
  cards: Map<string, LearnerCard>
  /** Items with a card on any facet, enabled or not. */
  itemsWithCard: Set<string>
  /** Each such item's highest card state: 2 or more is known. */
  itemStates: Map<string, number>
  /** Kanji with a learned card (state 2 or more) on any of their items. */
  knownKanji: Set<string>
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
