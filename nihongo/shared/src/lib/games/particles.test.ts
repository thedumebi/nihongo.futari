import { describe, expect, it } from 'vitest'

import type { ParticleQuestion } from '@/types/games.js'

import { buildParticleRounds } from './particles.js'

/** A fixed sequence, so a shuffle is the same every run. */
function seeded(seed = 1): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

function question(id: string, before: string, after: string, answer: string, familiar = 0, sentenceId = id): ParticleQuestion {
  return {
    id,
    sentenceId,
    before,
    after,
    beforeTokens: [],
    afterTokens: [],
    beforeSegments: [],
    afterSegments: [],
    answer,
    wrong: ['を', 'が', 'へ', 'に'].filter(p => p !== answer).slice(0, 3),
    note: 'why',
    translation: null,
    audio: null,
    lesson: { slug: 'de-location', title: 'で (place of action)' },
    familiar
  }
}

describe('buildParticleRounds', () => {
  it('offers the answer and its three wrong particles, in four boxes', () => {
    const [round] = buildParticleRounds([question('q1', '学校', '勉強します。', 'で')], 15, seeded())
    expect(round!.options).toHaveLength(4)
    expect([...round!.options].sort()).toEqual(['が', 'で', 'へ', 'を'].sort())
  })

  it('asks a sentence once, even when it has two gaps', () => {
    const rounds = buildParticleRounds([
      question('q1', '部屋', '音楽を聞きます。', 'で', 0, 's1'),
      question('q2', '部屋で音楽', '聞きます。', 'を', 0, 's1'),
      question('q3', '海', '泳ぎます。', 'で')
    ], 15, seeded())
    expect(rounds).toHaveLength(2)
    expect(rounds.map(r => r.question.id)).toContain('q3')
  })

  it('takes sentences the learner knows more of first', () => {
    const pool = [
      ...Array.from({ length: 10 }, (_, i) => question(`new${i}`, `新${i}`, 'です。', 'は', 0)),
      ...Array.from({ length: 3 }, (_, i) => question(`known${i}`, `猫${i}`, 'です。', 'は', 1))
    ]
    const ids = buildParticleRounds(pool, 5, seeded(7)).map(r => r.question.id)
    expect(ids.filter(id => id.startsWith('known'))).toHaveLength(3)
    expect(ids).toHaveLength(5)
  })
})
