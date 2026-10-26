import db, { connection } from '@nihongo/shared/db'
import { studyItems } from '@nihongo/shared/db/schema'
import { and, asc, eq, sql } from 'drizzle-orm'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'

import { LANGUAGE_ID } from '@/test/learner-specs.js'

import { catalogue, invalidateCatalogue } from './catalogue.service.js'

/** A published item, to withdraw and put back. */
async function publishedItem(): Promise<string> {
  const [row] = await db.select({ id: studyItems.id }).from(studyItems).where(and(eq(studyItems.languageId, LANGUAGE_ID), eq(studyItems.published, true), eq(studyItems.active, true))).orderBy(asc(studyItems.id)).limit(1)
  if (!row)
    throw new Error('The seeds hold no published item to test with')
  return row.id
}

async function setPublished(id: string, published: boolean): Promise<void> {
  await db.update(studyItems).set({ published }).where(eq(studyItems.id, id))
}

describe('the catalogue', () => {
  afterEach(async () => {
    vi.useRealTimers()
    // Settle on the seeded content again before the next test reads it.
    invalidateCatalogue()
    const before = await catalogue(LANGUAGE_ID)
    await vi.waitFor(async () => {
      expect(await catalogue(LANGUAGE_ID)).not.toBe(before)
    })
  })

  afterAll(async () => {
    await connection.end()
  })

  it('ranks facets in the order Postgres sorts them, sort_index then facet id', async () => {
    const expected = await db.execute<{ id: string }>(sql`
      select f.id from study_item_facets f
      join study_items si on si.id = f.study_item_id
      where si.language_id = ${LANGUAGE_ID} and si.published and si.active and f.enabled
      order by si.sort_index, f.id`)
    const ranked = (await catalogue(LANGUAGE_ID)).items.flatMap(i => i.facets).sort((a, b) => a.rank - b.rank)
    expect(ranked.map(f => f.id)).toEqual(expected.rows.map(r => r.id))
  })

  it('holds each item\'s facets in the order they are introduced', async () => {
    const expected = await db.execute<{ id: string }>(sql`
      select f.id from study_item_facets f
      join study_items si on si.id = f.study_item_id
      where si.language_id = ${LANGUAGE_ID} and si.published and si.active and f.enabled
      order by si.id, f.intro_order, f.id`)
    const items = [...(await catalogue(LANGUAGE_ID)).items].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    expect(items.flatMap(i => i.facets.map(f => f.id))).toEqual(expected.rows.map(r => r.id))
  })

  it('once invalidated, serves what it has while the change loads, then the change', async () => {
    const id = await publishedItem()
    const holds = async () => (await catalogue(LANGUAGE_ID)).items.some(i => i.id === id)
    const first = await catalogue(LANGUAGE_ID)
    try {
      await setPublished(id, false)
      expect(await catalogue(LANGUAGE_ID)).toBe(first)
      invalidateCatalogue()
      expect(await catalogue(LANGUAGE_ID)).toBe(first)
      await vi.waitFor(async () => {
        expect(await holds()).toBe(false)
      })
    } finally {
      await setPublished(id, true)
    }
  })

  it('past its age, serves what it has while a fresh one loads, then the fresh one', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    const id = await publishedItem()
    const first = await catalogue(LANGUAGE_ID)
    try {
      await setPublished(id, false)
      vi.setSystemTime(Date.now() + 6 * 60 * 1000)
      expect(await catalogue(LANGUAGE_ID)).toBe(first)
      await vi.waitFor(async () => {
        expect((await catalogue(LANGUAGE_ID)).items.some(i => i.id === id)).toBe(false)
      })
    } finally {
      await setPublished(id, true)
    }
  })
})
