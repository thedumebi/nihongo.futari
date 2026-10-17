import { describe, expect, it } from 'vitest'

import { clipRefs, withCurrentClips } from './index.js'

const clips = {
  sentences: new Map<string, string | null>([['sent-1', '/audio/sentences/AbC.m4a'], ['sent-2', null]]),
  words: new Map<number, string | null>([[1000220, '/audio/words/XyZ.m4a']])
}

describe('clipRefs', () => {
  it('finds sentence ids and word numbers in any asset', () => {
    expect(clipRefs([
      { audio: '/audio/sentences/sent-1.m4a', sentenceId: 'sent-1' },
      { audio: '/audio/words/1000220.m4a', wordAudio: '/audio/words/1000220.m4a' },
      { sentenceId: 'sent-9' }
    ])).toEqual({ sentenceIds: ['sent-1', 'sent-9'], entSeqs: [1000220] })
  })
})

describe('withCurrentClips', () => {
  it('swaps a clip for the recording of what it says now', () => {
    expect(withCurrentClips({ audio: '/audio/sentences/sent-1.m4a', sentenceId: 'sent-1' }, clips))
      .toEqual({ assets: { audio: '/audio/sentences/AbC.m4a', sentenceId: 'sent-1' }, missing: false })
    expect(withCurrentClips({ audio: '/audio/words/1000220.m4a', wordAudio: '/audio/words/1000220.m4a' }, clips).assets)
      .toEqual({ audio: '/audio/words/XyZ.m4a', wordAudio: '/audio/words/XyZ.m4a' })
  })

  it('drops a clip that would say the old words, and says so', () => {
    expect(withCurrentClips({ audio: '/audio/sentences/sent-2.m4a', sentenceId: 'sent-2' }, clips))
      .toEqual({ assets: { sentenceId: 'sent-2' }, missing: true })
    expect(withCurrentClips({ audio: '/audio/words/42.m4a' }, clips).missing).toBe(true)
  })

  it('leaves everything else alone', () => {
    const assets = { audio: '/audio/kana/hiragana-a.m4a', strokes: [1, 2] }
    expect(withCurrentClips(assets, clips)).toEqual({ assets, missing: false })
  })
})
