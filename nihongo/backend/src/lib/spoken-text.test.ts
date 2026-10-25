import { describe, expect, it } from 'vitest'

import { respelledVersion, spokenText } from './spoken-text.js'

describe('spokenText', () => {
  it('spells 明日 as あした for the voice, wherever it falls', () => {
    expect(spokenText('明日買い物に行きます。')).toBe('あした買い物に行きます。')
    expect(spokenText('ではまた明日。')).toBe('ではまたあした。')
  })

  it('leaves everything else exactly as written', () => {
    expect(spokenText('今日は月曜日です。')).toBe('今日は月曜日です。')
  })

  it('marks only a respelled clip\'s address with a version, so a cached old recording is not reused', () => {
    expect(respelledVersion('明日学校でね。')).toMatch(/^\?v=[0-9a-f]{8}$/)
    expect(respelledVersion('学校でね。')).toBe('')
  })
})
