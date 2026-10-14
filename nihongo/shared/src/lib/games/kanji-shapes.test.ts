import { describe, expect, it } from 'vitest'

import { lookAlikes, parseIds } from './kanji-shapes.js'

describe('parseIds', () => {
  it('splits a flat expression into layout and parts', () => {
    expect(parseIds('⿰彳寺')).toEqual({ layout: '⿰', parts: ['彳', '寺'] })
    expect(parseIds('⿲彳山攵')).toEqual({ layout: '⿲', parts: ['彳', '山', '攵'] })
  })

  it('refuses nested expressions, missing ones and parts outside the basic plane', () => {
    expect(parseIds('⿱⿰木木木')).toBeNull()
    expect(parseIds(null)).toBeNull()
    expect(parseIds('木')).toBeNull()
    expect(parseIds('⿸𠂇口')).toBeNull()
  })
})

describe('lookAlikes', () => {
  const entry = (character: string, ids: string) => ({ character, shape: parseIds(ids)! })

  it('links kanji that share a distinctive part in the same layout', () => {
    const pairs = lookAlikes([
      entry('待', '⿰彳寺'),
      entry('持', '⿰扌寺'),
      entry('時', '⿰日寺'),
      entry('問', '⿵門口'),
      entry('間', '⿵門日')
    ])
    const of = (c: string) => pairs.filter(p => p.character === c).map(p => p.confusable)
    expect(of('待').sort()).toEqual(['持', '時'])
    expect(of('問')).toEqual(['間'])
    expect(of('間')).toEqual(['問'])
  })

  it('does not link across layouts', () => {
    const pairs = lookAlikes([entry('時', '⿰日寺'), entry('音', '⿱立日')])
    expect(pairs).toEqual([])
  })

  it('does not call kanji alike for sharing only a part that is everywhere', () => {
    const many = ['休', '体', '作', '何', '住'].map((c, i) => entry(c, `⿰亻${'木本乍可主'[i]}`))
    expect(lookAlikes(many)).toEqual([])
  })

  it('keeps only the closest few per kanji', () => {
    const family = ['待', '持', '時', '侍'].map((c, i) => entry(c, `⿰${'彳扌日亻'[i]}寺`))
    expect(lookAlikes(family, 2).filter(p => p.character === '待')).toHaveLength(2)
  })
})
