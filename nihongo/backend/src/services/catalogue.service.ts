import type { Catalogue, CatalogueItem } from '@nihongo/shared/types'

import { pino } from '@nihongo/shared'
import db from '@nihongo/shared/db'
import { sql } from 'drizzle-orm'

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
  loaded: Promise<Catalogue>
  /** When it was loaded; 0 once invalidated. */
  at: number
  /** A reload is running beside it. */
  reloading?: boolean
}
const entries = new Map<string, Entry>()

async function load(languageId: string): Promise<Catalogue> {
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

function fresh(languageId: string): Promise<Catalogue> {
  const entry: Entry = { loaded: load(languageId), at: Date.now() }
  entries.set(languageId, entry)
  // A failed load must not stay cached: the next request tries again.
  // An invalidation meanwhile keeps the same promise in a new entry.
  entry.loaded.catch(() => {
    if (entries.get(languageId)?.loaded === entry.loaded)
      entries.delete(languageId)
  })
  return entry.loaded
}

/**
 * Load a fresh catalogue beside a stale one, one reload at a time. A reload
 * that started before an invalidation is not kept: the entry it would replace
 * is no longer the current one.
 */
function reloadBeside(languageId: string, entry: Entry): void {
  if (entry.reloading)
    return
  entry.reloading = true
  load(languageId).then((next) => {
    if (entries.get(languageId) === entry)
      entries.set(languageId, { loaded: Promise.resolve(next), at: Date.now() })
  }, (err: unknown) => {
    pino.error({ err, languageId }, '[catalogue] reload failed; serving the stale copy')
    entry.reloading = false
    entry.at = Date.now() - MAX_AGE_MS + RETRY_MS
  })
}

/** The catalogue of one language; see the top of this file for how fresh it is. */
export async function catalogue(languageId: string): Promise<Catalogue> {
  const entry = entries.get(languageId)
  if (!entry)
    return fresh(languageId)
  if (Date.now() - entry.at > MAX_AGE_MS)
    reloadBeside(languageId, entry)
  return entry.loaded
}

/**
 * Content changed. Every catalogue goes stale: the next request reloads it,
 * and is served the old one meanwhile, so a run of approvals costs a reload
 * each without making a learner wait.
 */
export function invalidateCatalogue(): void {
  for (const [languageId, entry] of entries)
    entries.set(languageId, { loaded: entry.loaded, at: 0 })
}
