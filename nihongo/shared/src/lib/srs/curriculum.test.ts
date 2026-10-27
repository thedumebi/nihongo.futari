import { describe, expect, it } from 'vitest'

import type { Catalogue, CatalogueItem, LearnerCard, LearnerState } from '@/types/curriculum.js'

import { availableNew, ceilingsFrom, deckCounts, heldBack, inCurriculum, inFlightCharge, matchesFilter, newCandidates, progressFrom, rollupStages, seriesReady } from './curriculum.js'

/** An item with `facets` facets named `<id>.<n>`, ranked by sort_index then n. */
function item(id: string, sortIndex: number, extra: Partial<CatalogueItem> = {}, facets = 1): CatalogueItem {
  return {
    id,
    kind: 'word',
    levelId: 'n5',
    sortIndex,
    phoneticSeriesId: null,
    facets: Array.from({ length: facets }, (_, n) => ({ id: `${id}.${n}`, introOrder: n, rank: sortIndex * 10 + n })),
    ...extra
  }
}

function catalogueOf(items: CatalogueItem[], seriesKanji: Record<string, string[]> = {}): Catalogue {
  return {
    languageId: 'ja',
    levels: [{ id: 'n5', code: 'N5', sortIndex: 1 }, { id: 'n4', code: 'N4', sortIndex: 2 }],
    items,
    seriesKanji: new Map(Object.entries(seriesKanji))
  }
}

function stateOf(cards: Record<string, LearnerCard> = {}, extra: Partial<LearnerState> = {}): LearnerState {
  return {
    cards: new Map(Object.entries(cards)),
    itemsWithCard: new Set(Object.keys(cards).map(facet => facet.split('.')[0]!)),
    itemStates: new Map(),
    knownKanji: new Set(),
    lessonsViewed: new Set(),
    ...extra
  }
}

const DUE = new Date('2026-01-01T00:00:00Z')
const learned: LearnerCard = { id: '', state: 2, suspended: false, due: DUE, firstSeenAt: null, origin: 'queue', createdAt: DUE, itemId: '', live: true }
const learning: LearnerCard = { ...learned, state: 1 }

describe('rollupStages', () => {
  it('counts cards per stage and kind, leaving suspended cards out of both halves', () => {
    const cat = catalogueOf([item('a', 1, {}, 2), item('b', 2), item('c', 51), item('g', 3, { kind: 'grammar' })])
    const rows = rollupStages(cat, stateOf({ 'a.0': learned, 'a.1': { ...learned, suspended: true }, 'b.0': learning }))
    expect(rows).toEqual([
      { levelId: 'n5', stage: 1, kind: 'word', total: 2, learned: 1, started: 2, items: 2 },
      { levelId: 'n5', stage: 2, kind: 'word', total: 1, learned: 0, started: 0, items: 1 }
    ])
  })

  it('orders by level, then stage, then kind', () => {
    const cat = catalogueOf([item('w', 60, { levelId: 'n4' }), item('k', 1, { kind: 'kanji' }), item('a', 2, { kind: 'kana' })])
    expect(rollupStages(cat, stateOf()).map(r => `${r.levelId}:${r.stage}:${r.kind}`)).toEqual(['n5:1:kana', 'n5:1:kanji', 'n4:2:word'])
  })
})

describe('ceilingsFrom and progressFrom', () => {
  it('opens a level up to the top of its first unpassed stage', () => {
    const cat = catalogueOf([item('a', 1), item('b', 51), item('c', 101)])
    const rows = rollupStages(cat, stateOf({ 'a.0': learned }))
    expect(ceilingsFrom(rows)).toEqual(new Map([['n5', 100]]))
    expect(progressFrom(rows, cat)).toEqual([{ level: 'N5', stage: 2, stages: 3, learned: 0, total: 1 }])
  })

  it('passes a stage whose every card is suspended, and drops a finished level', () => {
    const cat = catalogueOf([item('a', 1), item('b', 51)])
    const rows = rollupStages(cat, stateOf({ 'a.0': { ...learning, suspended: true }, 'b.0': learned }))
    expect(ceilingsFrom(rows)).toEqual(new Map())
    expect(progressFrom(rows, cat)).toEqual([])
  })
})

describe('inCurriculum', () => {
  const ceilings = new Map([['n5', 50]])
  it('bounds levelled material by its level\'s ceiling', () => {
    expect(inCurriculum(item('a', 50), ceilings)).toBe(true)
    expect(inCurriculum(item('a', 51), ceilings)).toBe(false)
  })

  it('lets through unlevelled items, levels without a ceiling, grammar and sound series', () => {
    expect(inCurriculum(item('a', 99, { levelId: null }), ceilings)).toBe(true)
    expect(inCurriculum(item('a', 99, { levelId: 'n4' }), ceilings)).toBe(true)
    expect(inCurriculum(item('a', 99, { kind: 'grammar' }), ceilings)).toBe(true)
    expect(inCurriculum(item('a', 99, { kind: 'phonetic-series' }), ceilings)).toBe(true)
  })
})

describe('matchesFilter', () => {
  it('keeps unlevelled items under a level filter, and an unknown level keeps only those', () => {
    expect(matchesFilter(item('a', 1, { levelId: 'n4' }), { levelId: 'n5' })).toBe(false)
    expect(matchesFilter(item('a', 1, { levelId: null }), { levelId: 'n5' })).toBe(true)
    expect(matchesFilter(item('a', 1), { levelId: '' })).toBe(false)
  })

  it('matches nothing for an empty unit', () => {
    expect(matchesFilter(item('a', 1), { unitItemIds: new Set() })).toBe(false)
    expect(matchesFilter(item('a', 1), { unitItemIds: new Set(['a']), kind: 'word' })).toBe(true)
  })
})

describe('seriesReady', () => {
  it('needs two of the series\' kanji learned', () => {
    const series = item('s', 1, { kind: 'phonetic-series', levelId: null, phoneticSeriesId: 'ps' })
    const cat = catalogueOf([series], { ps: ['k1', 'k2', 'k3'] })
    expect(seriesReady(series, cat, stateOf({}, { knownKanji: new Set(['k1']) }))).toBe(false)
    expect(seriesReady(series, cat, stateOf({}, { knownKanji: new Set(['k1', 'k3']) }))).toBe(true)
  })
})

describe('newCandidates', () => {
  it('offers each unmet item\'s first facet, in rank order, and never a Speak prompt', () => {
    const cat = catalogueOf([item('b', 2, {}, 2), item('a', 1, {}, 2), item('sp', 0, { kind: 'speak' })])
    expect(newCandidates(cat, stateOf(), {}, new Map(), false).map(f => f.id)).toEqual(['a.0', 'b.0'])
  })

  it('offers a met item\'s next uncarded facet as extra practice', () => {
    const cat = catalogueOf([item('a', 1, {}, 3), item('b', 2)])
    expect(newCandidates(cat, stateOf({ 'a.0': learning }), {}, new Map(), true).map(f => f.id)).toEqual(['a.1'])
  })

  it('waits on a grammar topic\'s lesson and on the stage ceiling', () => {
    const cat = catalogueOf([item('g', 1, { kind: 'grammar' }), item('far', 200)])
    const ceilings = new Map([['n5', 50]])
    expect(newCandidates(cat, stateOf(), {}, ceilings, false)).toEqual([])
    expect(newCandidates(cat, stateOf({}, { lessonsViewed: new Set(['g']) }), {}, ceilings, false).map(f => f.id)).toEqual(['g.0'])
  })
})

describe('availableNew and heldBack', () => {
  it('counts unmet items as words and met ones with an uncarded facet as extras', () => {
    const cat = catalogueOf([item('a', 1, {}, 2), item('b', 2), item('c', 3)])
    expect(availableNew(cat, stateOf({ 'a.0': learning, 'c.0': learning }), {}, new Map())).toEqual({ words: 1, extras: 1 })
  })

  it('names the stage that opens material held back by the ceiling', () => {
    const cat = catalogueOf([item('a', 1), item('far', 120, {}, 2)])
    const state = stateOf({ 'a.0': learning })
    expect(availableNew(cat, state, {}, new Map([['n5', 50]]))).toEqual({ words: 0, extras: 0 })
    expect(heldBack(cat, state, {})).toEqual({ waiting: 2, opensAtStage: 3 })
    expect(heldBack(cat, stateOf({ 'a.0': learning, 'far.0': learning, 'far.1': learning }), {})).toBeNull()
  })
})

describe('deckCounts', () => {
  const now = new Date('2026-06-01T00:00:00Z')
  const later = new Date('2026-07-01T00:00:00Z')

  it('counts due items, learning cards, and unseen facets within the curriculum and locked beyond it', () => {
    const cat = catalogueOf([item('a', 1, {}, 2), item('b', 2, {}, 2), item('c', 3), item('far', 120, {}, 2)])
    const state = stateOf({
      'a.0': learning,
      'a.1': { ...learning, state: 3 },
      'b.0': learned,
      'b.1': { ...learning, due: later },
      'c.0': { ...learning, suspended: true }
    })
    expect(deckCounts(cat.items, state, new Map([['n5', 50]]), now)).toEqual({ total: 7, due: 2, learning: 2, unseen: 0, locked: 2 })
    expect(deckCounts(cat.items, state, new Map(), now)).toEqual({ total: 7, due: 2, learning: 2, unseen: 2, locked: 0 })
  })

  it('leaves out a Speak prompt until it is the reader\'s own card', () => {
    const cat = catalogueOf([item('s', 1, { kind: 'speak' }, 2)])
    expect(deckCounts(cat.items, stateOf({ 's.0': learning }), new Map(), now)).toEqual({ total: 1, due: 1, learning: 1, unseen: 0, locked: 0 })
  })
})

describe('inFlightCharge', () => {
  it('counts an unmet item once as a word, other uncarded facets as extras, and carded ones not at all', () => {
    const cat = catalogueOf([item('new', 1, {}, 2), item('met', 2, {}, 2), item('done', 3)])
    const state = stateOf({ 'met.0': learning, 'done.0': learned })
    const inFlight = new Set(['new.0', 'new.1', 'met.1', 'done.0'])
    expect(inFlightCharge(cat, state, inFlight)).toEqual({ words: 1, extras: 2 })
    expect(inFlightCharge(cat, state, new Set())).toEqual({ words: 0, extras: 0 })
  })
})
