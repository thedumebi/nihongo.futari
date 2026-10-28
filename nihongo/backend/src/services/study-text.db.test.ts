import db, { connection } from '@nihongo/shared/db'
import { kanji, srsCards, studyItems, users } from '@nihongo/shared/db/schema'
import { and, eq } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'

import { LANGUAGE_ID } from '@/test/learner-specs.js'

import { getDueList, saveStudyItem, twinCandidates } from './srs.service.js'

const USER = 'study-text-test'

describe('words shown on study pages', () => {
  afterAll(async () => {
    await connection.end()
  })

  it('finds every everyday word a meaning fits, 車 and 自動車 for "car"', async () => {
    const found = await twinCandidates(LANGUAGE_ID, ['car'])
    expect(found).toEqual(expect.arrayContaining([
      { form: '車', reading: 'くるま', gloss: 'car' },
      { form: '自動車', reading: 'じどうしゃ', gloss: 'car' }
    ]))
    expect(found.every(r => r.gloss === 'car')).toBe(true)
  })

  it('finds nothing for a meaning no word has', async () => {
    expect(await twinCandidates(LANGUAGE_ID, ['no such meaning'])).toEqual([])
  })

  it('lists a due kanji with its English meanings, not the objects they are stored as', async () => {
    await db.insert(users).values({ id: USER, name: USER, email: `${USER}@example.test`, emailVerified: true, timezone: 'Asia/Tokyo' })
    const [item] = await db
      .select({ id: studyItems.id })
      .from(studyItems)
      .innerJoin(kanji, eq(kanji.id, studyItems.kanjiId))
      .where(and(eq(studyItems.languageId, LANGUAGE_ID), eq(kanji.character, '車'), eq(studyItems.published, true)))
      .limit(1)
    await saveStudyItem(USER, item!.id, 'saved')
    await db.update(srsCards).set({ state: 2, due: new Date('2026-01-01T00:00:00.000Z') }).where(eq(srsCards.userId, USER))

    const list = await getDueList(USER, { languageCode: 'ja', limit: 50, offset: 0 })
    expect(list.items.map(i => [i.subject, i.detail])).toEqual([['車', 'car']])
  })
})
