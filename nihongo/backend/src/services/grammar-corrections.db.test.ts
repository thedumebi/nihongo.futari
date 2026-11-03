import type { CorrectionProposal } from '@nihongo/shared/types'

import db, { connection } from '@nihongo/shared/db'
import { contentReviewQueue, grammarFurigana, users } from '@nihongo/shared/db/schema'
import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { LANGUAGE_ID, uuidFrom } from '@/test/learner-specs.js'

import { grammarReadings, proseKey } from './grammar-furigana.service.js'
import { approve, listPending } from './review-queue.service.js'

/** Texts no seed carries, so this file owns their rows. */
const TEXT = '使役形は試験に出る。'
const STALE = '使役形は試験に出ない。'

const wrong = [{ t: '使', r: 'つか' }, { t: '役', r: 'えき' }, { t: '形', r: 'けい' }, { t: 'は' }, { t: '試験', r: 'しけん' }, { t: 'に' }, { t: '出', r: 'で' }, { t: 'る。' }]
const right = [{ t: '使役', r: 'しえき' }, { t: '形', r: 'けい' }, { t: 'は' }, { t: '試験', r: 'しけん' }, { t: 'に' }, { t: '出', r: 'で' }, { t: 'る。' }]

function proposal(text: string, before: typeof wrong, after: typeof right): CorrectionProposal {
  return {
    type: 'grammar',
    text,
    point: 'Causative',
    before,
    after,
    changes: [{ word: '使役', from: before.slice(0, 2), to: after.slice(0, 1), why: 'The compound reads しえき.' }]
  }
}

async function queue(text: string, before: typeof wrong) {
  const id = `crq-grammar-test-${proseKey(text).slice(0, 8)}`
  await db.insert(contentReviewQueue).values({
    id,
    languageId: LANGUAGE_ID,
    targetTable: 'grammar_furigana',
    targetId: proseKey(text),
    changeType: 'update',
    proposed: proposal(text, before, right.map(s => s.t === 'る。' && text === STALE ? { t: 'ない。' } : s)),
    current: { furigana: before },
    origin: 'ai',
    // Ahead of everything the seeds queue, so the first page always holds it.
    priority: 1,
    status: 'pending'
  })
  return id
}

let adminId = ''

describe('a grammar reading correction, from queue to page', () => {
  beforeAll(async () => {
    adminId = uuidFrom('grammar-corrections', 'admin')
    await db.insert(users).values({ id: adminId, name: 'Reviewer', email: `${adminId}@example.test`, emailVerified: true, role: 'admin' })
    await db.insert(grammarFurigana).values([
      { textHash: proseKey(TEXT), text: TEXT, segments: wrong },
      { textHash: proseKey(STALE), text: STALE, segments: [{ t: '使役', r: 'しえき' }, { t: '形', r: 'けい' }, { t: 'は' }, { t: '試験', r: 'しけん' }, { t: 'に' }, { t: '出', r: 'で' }, { t: 'ない。' }] }
    ])
  })

  afterAll(async () => {
    await connection.end()
  })

  it('shows the reviewer the text under its grammar point', async () => {
    const id = await queue(TEXT, wrong)
    const { items } = await listPending(200, 0, 'correction')
    const item = items.find(i => i.id === id)
    expect(item).toMatchObject({ kind: 'correction', subject: 'Grammar · Causative', correction: { type: 'grammar', text: TEXT } })
  })

  it('writes the readings on approval, marks them corrected, and the page reads them at once', async () => {
    await grammarReadings()
    const id = `crq-grammar-test-${proseKey(TEXT).slice(0, 8)}`
    expect(await approve(id, adminId)).toBe(true)

    const [row] = await db.select().from(grammarFurigana).where(eq(grammarFurigana.textHash, proseKey(TEXT)))
    expect(row).toMatchObject({ segments: right, source: 'corrected' })
    expect((await grammarReadings()).get(TEXT)).toEqual(right)
  })

  it('leaves readings alone that changed after the proposal was made', async () => {
    const changedSince = [{ t: '使役', r: 'しえき' }, { t: '形', r: 'けい' }, { t: 'は' }, { t: '試験', r: 'しけん' }, { t: 'に' }, { t: '出', r: 'で' }, { t: 'ない。' }]
    const id = await queue(STALE, wrong.map(s => s.t === 'る。' ? { t: 'ない。' } : s))
    await approve(id, adminId)

    const [row] = await db.select().from(grammarFurigana).where(eq(grammarFurigana.textHash, proseKey(STALE)))
    expect(row).toMatchObject({ segments: changedSince, source: 'annotator' })
  })
})
