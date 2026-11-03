import { connection } from '@nihongo/shared/db'
import { afterAll, describe, expect, it } from 'vitest'

import { grammarProseTexts, grammarReadings } from './grammar-furigana.service.js'
import { getGrammarPoint } from './grammar.service.js'

/**
 * Grammar furigana is precomputed and shipped as a seed. This is the check
 * that a change to grammar prose came with its readings: built from the same
 * migrations and seeds as production, it fails when any grammar text with a
 * kanji has nothing stored, which would show that text with no ruby at all.
 */
describe('grammar furigana', () => {
  afterAll(async () => {
    await connection.end()
  })

  it('is stored for every piece of grammar prose with a kanji in it', async () => {
    const readings = await grammarReadings()
    const missing = (await grammarProseTexts()).filter(t => !readings.has(t.text)).map(t => t.text)
    // Run `pnpm -C nihongo/backend seed:grammar-furigana` and commit the seed it writes.
    expect(missing).toEqual([])
  })

  it('keeps every stored text intact: the segments spell the text out', async () => {
    const broken = [...(await grammarReadings())].filter(([text, segments]) => segments.map(s => s.t).join('') !== text).map(([text]) => text)
    expect(broken).toEqual([])
  })

  it('reads 分け on the wake page as わ, not ふん', async () => {
    const point = await getGrammarPoint('ja', 'wake')
    const segments = point!.furigana.etymology.flatMap(e => [...e.claim, ...e.body])
    const bun = segments.filter(s => s.t === '分')
    expect(bun.length).toBeGreaterThan(0)
    expect(new Set(bun.map(s => s.r))).toEqual(new Set(['わ']))
  })
})
