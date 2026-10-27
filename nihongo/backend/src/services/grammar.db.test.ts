import db, { connection } from '@nihongo/shared/db'
import { grammarPoints } from '@nihongo/shared/db/schema'
import { asc, eq } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'

import { LANGUAGE_ID } from '@/test/learner-specs.js'

import { loadLessons } from './grammar.service.js'

describe('study lessons', () => {
  afterAll(async () => {
    await connection.end()
  })

  it('hands back a point the cache does not hold yet, beside the ones it does', async () => {
    const [a, b] = await db.select({ id: grammarPoints.id, slug: grammarPoints.slug }).from(grammarPoints).where(eq(grammarPoints.languageId, LANGUAGE_ID)).orderBy(asc(grammarPoints.id)).limit(2)
    const first = await loadLessons('ja', [a!.id], true)
    expect([...first.values()].map(l => l.slug)).toEqual([a!.slug])

    const both = await loadLessons('ja', [a!.id, b!.id], true)
    expect([...both.keys()]).toEqual([a!.id, b!.id])
    expect(both.get(b!.id)?.slug).toBe(b!.slug)
    // The point already held is the one shaped before, not shaped again.
    expect(both.get(a!.id)).toBe(first.get(a!.id))
  })

  it('finds nothing for a language that is not one, or a point that is not one', async () => {
    expect(await loadLessons('xx', ['gp-toki'], true)).toEqual(new Map())
    expect(await loadLessons('ja', ['no-such-point'], false)).toEqual(new Map())
  })
})
