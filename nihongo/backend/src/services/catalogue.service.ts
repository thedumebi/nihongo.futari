import type { Catalogue, CatalogueItem, CatalogueUnit, FacetFacts, Language } from '@nihongo/shared/types'
import type { SQL } from 'drizzle-orm'

import { pino } from '@nihongo/shared'
import db from '@nihongo/shared/db'
import { kana, kanji, languages, studyItemFacets, studyItems } from '@nihongo/shared/db/schema'
import { eq, inArray, sql } from 'drizzle-orm'

/**
 * The curriculum of one language, held in memory (see `types/curriculum.ts`).
 *
 * It changes when seeds run, which is a deploy and so a restart, and when an
 * admin approves content, which calls `invalidateCatalogue`. Past its age, or
 * once invalidated, a catalogue is stale: the next request still gets it while
 * a fresh one loads beside it, so no learner waits on a reload. Only the very
 * first load is waited on.
 *
 * A promise rather than the value, as in `glossary.service.ts`, so concurrent
 * first requests share one load.
 */

/** Backstop for anything that writes study items without invalidating. */
const MAX_AGE_MS = 5 * 60 * 1000
/** After a failed reload, how long the stale copy is served before trying again. */
const RETRY_MS = 30 * 1000

interface Entry {
  loaded: Promise<unknown>
  /** When it was loaded; 0 once invalidated. */
  at: number
  /** A reload is running beside it. */
  reloading?: boolean
}
const entries = new Map<string, Entry>()

async function loadCatalogue(languageId: string): Promise<Catalogue> {
  const [levels, items, series] = await Promise.all([
    db.execute<{ id: string, code: string, sort_index: number }>(sql`
      select id, code, sort_index from language_levels
      where language_id = ${languageId}
      order by sort_index, id`),
    // Facets come in (intro_order, id) order, so each item's list is already
    // in the order its facets are introduced; `rank` is the queue's order.
    db.execute<{
      id: string
      kind: string
      level_id: string | null
      sort_index: number
      phonetic_series_id: string | null
      facet_id: string | null
      intro_order: number | null
      rank: string
    }>(sql`
      select si.id, si.kind, si.level_id, si.sort_index, si.phonetic_series_id,
        f.id as facet_id, f.intro_order,
        row_number() over (order by si.sort_index, f.id) as rank
      from study_items si
      left join study_item_facets f on f.study_item_id = si.id and f.enabled
      where si.language_id = ${languageId} and si.published and si.active
      order by si.sort_index, si.id, f.intro_order, f.id`),
    db.execute<{ series_id: string, kanji_id: string }>(sql`
      select distinct m.series_id, m.kanji_id
      from phonetic_series_members m
      join phonetic_series s on s.id = m.series_id
      where s.language_id = ${languageId} and m.follows_series`)
  ])

  const byId = new Map<string, CatalogueItem>()
  for (const row of items.rows) {
    let item = byId.get(row.id)
    if (!item) {
      item = { id: row.id, kind: row.kind, levelId: row.level_id, sortIndex: row.sort_index, phoneticSeriesId: row.phonetic_series_id, facets: [] }
      byId.set(row.id, item)
    }
    if (row.facet_id !== null)
      item.facets.push({ id: row.facet_id, introOrder: row.intro_order ?? 0, rank: Number(row.rank) })
  }

  const seriesKanji = new Map<string, string[]>()
  for (const row of series.rows)
    seriesKanji.set(row.series_id, [...(seriesKanji.get(row.series_id) ?? []), row.kanji_id])

  return {
    languageId,
    levels: levels.rows.map(l => ({ id: l.id, code: l.code, sortIndex: l.sort_index })),
    items: [...byId.values()],
    seriesKanji
  }
}

function fresh(key: string, loader: () => Promise<unknown>): Promise<unknown> {
  // A real promise, run once: a query builder handed back un-awaited would run
  // again on every `.then`.
  const entry: Entry = { loaded: Promise.resolve().then(loader), at: Date.now() }
  entries.set(key, entry)
  // A failed load must not stay cached: the next request tries again.
  // An invalidation meanwhile keeps the same promise in a new entry.
  entry.loaded.catch(() => {
    if (entries.get(key)?.loaded === entry.loaded)
      entries.delete(key)
  })
  return entry.loaded
}

/**
 * Load a fresh copy beside a stale one, one reload at a time. A reload that
 * started before an invalidation is not kept: the entry it would replace is no
 * longer the current one.
 */
function reloadBeside(key: string, entry: Entry, loader: () => Promise<unknown>): void {
  if (entry.reloading)
    return
  entry.reloading = true
  Promise.resolve().then(loader).then((next) => {
    if (entries.get(key) === entry)
      entries.set(key, { loaded: Promise.resolve(next), at: Date.now() })
  }, (err: unknown) => {
    pino.error({ err, key }, '[catalogue] reload failed; serving the stale copy')
    entry.reloading = false
    entry.at = Date.now() - MAX_AGE_MS + RETRY_MS
  })
}

/**
 * Content derived from the catalogue tables, cached under `key` by the rules at
 * the top of this file. `loader` must read only content, never a learner's rows.
 *
 * One key, one type: a key is always used with the same `T`, which is what
 * makes the casts below sound. Each key has one typed wrapper (`catalogue`,
 * `kanaRows`, `levelPool`, the lesson list) and is used nowhere else.
 */
export async function cachedContent<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const entry = entries.get(key)
  if (!entry)
    return fresh(key, loader) as Promise<T>
  if (Date.now() - entry.at > MAX_AGE_MS)
    reloadBeside(key, entry, loader)
  return entry.loaded as Promise<T>
}

/** The catalogue of one language; see the top of this file for how fresh it is. */
export async function catalogue(languageId: string): Promise<Catalogue> {
  return cachedContent(`catalogue:${languageId}`, () => loadCatalogue(languageId))
}

async function loadUnits(languageId: string): Promise<CatalogueUnit[]> {
  const rows = await db.execute<{ code: string, title: string, description: string | null, image_url: string | null, sort_index: number, study_item_id: string }>(sql`
    select u.code, u.title, u.description, u.image_url, u.sort_index, ui.study_item_id
    from curriculum_units u
    join curriculum_unit_items ui on ui.unit_id = u.id
    where u.language_id = ${languageId} and u.published
    order by u.sort_index, u.id`)
  const units = new Map<string, CatalogueUnit>()
  for (const row of rows.rows) {
    let unit = units.get(row.code)
    if (!unit) {
      unit = { code: row.code, title: row.title, description: row.description, imageUrl: row.image_url, sortIndex: row.sort_index, itemIds: new Set() }
      units.set(row.code, unit)
    }
    unit.itemIds.add(row.study_item_id)
  }
  return [...units.values()]
}

/** What a card needs of each facet `where` picks; the one definition of `FacetFacts`. */
async function readFacetFacts(where: SQL): Promise<Map<string, FacetFacts>> {
  const rows = await db
    .select({
      id: studyItemFacets.id,
      itemId: studyItemFacets.studyItemId,
      kind: studyItems.kind,
      levelId: studyItems.levelId,
      kanjiId: studyItems.kanjiId,
      kanaId: studyItems.kanaId,
      wordId: studyItems.wordId,
      live: sql<boolean>`${studyItemFacets.enabled} and ${studyItems.published} and ${studyItems.active}`
    })
    .from(studyItemFacets)
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .where(where)
  return new Map(rows.map(({ id, ...fact }) => [id, fact]))
}

/** The same facts for particular facets, read now rather than from the cache. */
export function facetFactsOf(facetIds: string[]): Promise<Map<string, FacetFacts>> {
  return readFacetFacts(inArray(studyItemFacets.id, facetIds))
}

/**
 * Every facet of a language, enabled or not, by id, with what a learner's card
 * needs of it (`FacetFacts`). Cached like the catalogue, and reloaded with it
 * on an approval, which is what can enable or publish one.
 */
export async function facetFacts(languageId: string): Promise<Map<string, FacetFacts>> {
  return cachedContent(`facet-facts:${languageId}`, () => readFacetFacts(eq(studyItems.languageId, languageId)))
}

/**
 * The character of every kanji and kana a language's study items teach, by
 * kanji or kana id: what a learner's known ids are read out as.
 */
export async function itemCharacters(languageId: string): Promise<Map<string, string>> {
  return cachedContent(`characters:${languageId}`, () => Promise.all([
    db.select({ id: kanji.id, character: kanji.character }).from(kanji).where(inArray(kanji.id, db.select({ id: studyItems.kanjiId }).from(studyItems).where(eq(studyItems.languageId, languageId)))),
    db.select({ id: kana.id, character: kana.character }).from(kana).where(inArray(kana.id, db.select({ id: studyItems.kanaId }).from(studyItems).where(eq(studyItems.languageId, languageId))))
  ]).then(byId))
}

/**
 * The characters of particular kanji and kana ids, read now rather than from
 * the cache: for one taught by an item added since `itemCharacters` loaded.
 */
export async function charactersOf(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0)
    return new Map()
  return byId(await Promise.all([
    db.select({ id: kanji.id, character: kanji.character }).from(kanji).where(inArray(kanji.id, ids)),
    db.select({ id: kana.id, character: kana.character }).from(kana).where(inArray(kana.id, ids))
  ]))
}

function byId(lists: Array<Array<{ id: string, character: string }>>): Map<string, string> {
  return new Map(lists.flat().map(r => [r.id, r.character]))
}

/** A language's published units that hold items, in `sort_index` order, cached like the catalogue. */
export async function catalogueUnits(languageId: string): Promise<CatalogueUnit[]> {
  return cachedContent(`units:${languageId}`, () => loadUnits(languageId))
}

/**
 * A language by its code, or null if there is none. Asked by nearly every
 * request, and languages change only with a deploy, so cached like the rest.
 */
export async function languageByCode(code: string): Promise<Pick<Language, 'id'> | null> {
  return (await languagesByCode()).get(code) ?? null
}

/** Every language's code, from the same cached read. */
export async function languageCodes(): Promise<Array<Language['code']>> {
  return [...(await languagesByCode()).keys()]
}

// Every language under one key, so a code that is not one (it arrives
// straight from the request) is a miss in this map, not a new cache entry.
function languagesByCode(): Promise<Map<Language['code'], Pick<Language, 'id'>>> {
  return cachedContent('languages', async () =>
    new Map((await db.select({ code: languages.code, id: languages.id }).from(languages)).map(l => [l.code, { id: l.id }])))
}

/**
 * Content changed. Everything cached goes stale: the next request reloads it,
 * and is served the old copy meanwhile, so a run of approvals costs a reload
 * each without making a learner wait.
 */
export function invalidateCatalogue(): void {
  for (const [key, entry] of entries)
    entries.set(key, { loaded: entry.loaded, at: 0 })
}
