import db, { connection } from '@nihongo/shared/db'
import { languageLevels, srsCards, studyItems, users } from '@nihongo/shared/db/schema'
import { and, eq, isNotNull } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'

import { LANGUAGE_ID } from '@/test/learner-specs.js'

import { getCrossword } from './crossword.service.js'
import { saveStudyItem } from './srs.service.js'

async function learnerKnowing(id: string, levelCode: string): Promise<void> {
  await db.insert(users).values({ id, name: id, email: `${id}@example.test`, emailVerified: true, timezone: 'UTC' })
  const words = await db.select({ id: studyItems.id }).from(studyItems).innerJoin(languageLevels, eq(languageLevels.id, studyItems.levelId)).where(and(eq(studyItems.languageId, LANGUAGE_ID), eq(languageLevels.code, levelCode), isNotNull(studyItems.wordId), eq(studyItems.published, true)))
  for (const word of words)
    await saveStudyItem(id, word.id, 'saved')
  await db.update(srsCards).set({ state: 2 }).where(eq(srsCards.userId, id))
}

describe('the crossword', () => {
  afterAll(async () => {
    await connection.end()
  })

  it('builds a puzzle from the words a learner knows', async () => {
    await learnerKnowing('crossword-knows-n5', 'N5')
    const puzzle = await getCrossword('crossword-knows-n5', { languageCode: 'ja', level: 'N5', source: 'known' })
    expect('error' in puzzle ? puzzle : null).toBeNull()
  })

  it('asks a learner who knows no words to learn more first', async () => {
    await db.insert(users).values({ id: 'crossword-knows-none', name: 'n', email: 'crossword-knows-none@example.test', emailVerified: true, timezone: 'UTC' })
    expect(await getCrossword('crossword-knows-none', { languageCode: 'ja', level: 'N5', source: 'known' })).toEqual({ error: 'learn-more', knownCount: 0 })
  })
})
