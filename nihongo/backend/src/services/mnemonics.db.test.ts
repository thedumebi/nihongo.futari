import db, { connection } from '@nihongo/shared/db'
import { contentReviewQueue, kanji, mnemonics, users } from '@nihongo/shared/db/schema'
import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { LANGUAGE_ID, uuidFrom } from '@/test/learner-specs.js'

import { createForReview, listForKanji, listForWord } from './mnemonics.service.js'
import { approve, listPending, reject } from './review-queue.service.js'

/** A character no seed carries, so this file owns every mnemonic on it. */
const CHARACTER = '𪚲'
let adminId = ''

describe('mnemonics, from queue to learner', () => {
  beforeAll(async () => {
    adminId = uuidFrom('mnemonics', 'admin')
    await db.insert(users).values({ id: adminId, name: 'Reviewer', email: `${adminId}@example.test`, emailVerified: true, role: 'admin' })
    await db.insert(kanji).values({ id: uuidFrom('mnemonics', 'kanji'), languageId: LANGUAGE_ID, character: CHARACTER })
  })

  afterAll(async () => {
    await connection.end()
  })

  it('queues a new mnemonic for review and shows a learner nothing yet', async () => {
    const created = await createForReview({ languageCode: 'ja', kanji: CHARACTER, text: 'Three dragons stacked up.', kind: 'story', generatedBy: 'ai' }, adminId)
    expect(created).not.toBeNull()

    const [queued] = await db.select().from(contentReviewQueue).where(eq(contentReviewQueue.id, created!.reviewId))
    expect(queued).toMatchObject({ targetTable: 'mnemonics', targetId: created!.id, status: 'pending', origin: 'ai', changeType: 'create' })
    expect(await listForKanji('ja', CHARACTER)).toEqual({ mnemonics: [] })
  })

  it('hands the reviewer the aid and its kanji under the mnemonic kind', async () => {
    const { items } = await listPending(100, 0, 'mnemonic')
    const item = items.find(i => i.mnemonic?.text === 'Three dragons stacked up.')
    expect(item).toMatchObject({
      kind: 'mnemonic',
      subject: CHARACTER,
      mnemonic: { text: 'Three dragons stacked up.', imagery: null, kind: 'story', subject: CHARACTER },
      claim: null,
      citations: []
    })
  })

  it('publishes on approval, recording the reviewer, and the kanji page then shows it', async () => {
    const { items } = await listPending(100, 0, 'mnemonic')
    const item = items.find(i => i.mnemonic?.text === 'Three dragons stacked up.')!
    expect(await approve(item.id, adminId)).toBe(true)

    const [row] = await db.select().from(mnemonics).where(eq(mnemonics.id, item.targetId))
    expect(row).toMatchObject({ status: 'published', reviewedBy: adminId })
    expect(await listForKanji('ja', CHARACTER)).toEqual({
      mnemonics: [{ id: item.targetId, text: 'Three dragons stacked up.', imagery: null, kind: 'story' }]
    })
  })

  it('keeps a rejected mnemonic from learners', async () => {
    const created = await createForReview({ languageCode: 'ja', kanji: CHARACTER, text: 'A rejected story.', kind: 'story', generatedBy: 'human' }, adminId)
    expect(await reject(created!.reviewId, adminId, 'Too far-fetched')).toBe(true)
    const texts = (await listForKanji('ja', CHARACTER)).mnemonics.map(m => m.text)
    expect(texts).toEqual(['Three dragons stacked up.'])
  })

  it('never lists a learner\'s private mnemonic publicly', async () => {
    const [target] = await db.select({ id: kanji.id }).from(kanji).where(eq(kanji.character, CHARACTER))
    await db.insert(mnemonics).values({
      languageId: LANGUAGE_ID,
      kanjiId: target!.id,
      text: 'My own one.',
      authorUserId: adminId,
      visibility: 'private',
      status: 'published',
      reviewedBy: adminId
    })
    const texts = (await listForKanji('ja', CHARACTER)).mnemonics.map(m => m.text)
    expect(texts).toEqual(['Three dragons stacked up.'])
  })

  it('refuses, in the database, to publish a mnemonic nobody reviewed', async () => {
    const [target] = await db.select({ id: kanji.id }).from(kanji).where(eq(kanji.character, CHARACTER))
    await expect(db.insert(mnemonics).values({
      languageId: LANGUAGE_ID,
      kanjiId: target!.id,
      text: 'Sneaked in.',
      status: 'published'
    })).rejects.toThrow()
  })

  it('returns null for a kanji that does not exist, and nothing for an unknown word', async () => {
    expect(await createForReview({ languageCode: 'ja', kanji: '〇〇', text: 'x', kind: 'story', generatedBy: 'human' }, adminId)).toBeNull()
    expect(await listForWord(uuidFrom('mnemonics', 'no-word'))).toEqual({ mnemonics: [] })
  })
})
