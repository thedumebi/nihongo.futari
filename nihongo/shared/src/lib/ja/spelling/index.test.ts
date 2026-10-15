import { describe, expect, it } from 'vitest'

import { otherSpelling } from './index.js'

describe('otherSpelling', () => {
  it('swaps ください and 下さい both ways', () => {
    expect(otherSpelling('ください', '下さい', 'ください')).toBe('下さい')
    expect(otherSpelling('下さい', '下さい', 'ください')).toBe('ください')
  })

  it('swaps an inflected verb, keeping its ending', () => {
    expect(otherSpelling('見て', '見る', 'みる')).toBe('みて')
    expect(otherSpelling('みて', '見る', 'みる')).toBe('見て')
    expect(otherSpelling('食べました', '食べる', 'たべる')).toBe('たべました')
  })

  it('swaps a whole noun, and nothing that only starts like it', () => {
    expect(otherSpelling('しゃしん', '写真', 'しゃしん')).toBe('写真')
    expect(otherSpelling('写真家', '写真', 'しゃしん')).toBeNull()
  })

  it('leaves a spelling that is not this word, and a kana-only word', () => {
    expect(otherSpelling('きって', '見る', 'みる')).toBeNull()
    expect(otherSpelling('これ', 'これ', 'これ')).toBeNull()
  })
})
