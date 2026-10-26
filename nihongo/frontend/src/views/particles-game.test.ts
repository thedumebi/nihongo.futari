import type { ParticleQuestion, ParticlesGame } from '@nihongo/shared/types'

import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import ParticlesGameView from './particles-game.vue'

const record = vi.fn(async () => {})
const played: string[] = []
let game: ParticlesGame

vi.mock('@/api/games', () => ({ getParticlesGame: async () => game }))
vi.mock('@/api/activities', () => ({ recordActivity: (...args: unknown[]) => record(...(args as [])) }))
vi.mock('@/store/language', () => ({ useLanguageStore: () => ({ code: 'ja' }) }))
vi.mock('@/composables/use-audio', () => ({
  playAudio: async (url: string) => played.push(url),
  stopAudio: () => {}
}))
vi.mock('@/composables/use-furigana', () => ({
  useFurigana: () => ({ mode: ref('always'), knownKanji: ref(new Set()), loadKnownKanji: async () => {}, loadSettings: async () => {} })
}))

function question(i: number, answer = 'で'): ParticleQuestion {
  return {
    id: `q${i}`,
    sentenceId: `s${i}`,
    before: `場所${i}`,
    after: '勉強します。',
    beforeTokens: [],
    afterTokens: [],
    beforeSegments: [{ t: `場所${i}` }],
    afterSegments: [{ t: '勉強します。' }],
    answer,
    wrong: ['を', 'が', 'へ'],
    note: 'で marks where the action happens.',
    translation: 'I study there.',
    audio: `/audio/s${i}.m4a`,
    lesson: { slug: 'de-location', title: 'で (place of action)' },
    familiar: 0
  }
}

async function open() {
  const wrapper = mount(ParticlesGameView, {
    global: {
      stubs: {
        AppShell: { template: '<div><slot /></div>' },
        RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        WordMeaning: true
      }
    }
  })
  await flushPromises()
  return wrapper
}

function box(wrapper: Awaited<ReturnType<typeof open>>, text: string) {
  return wrapper.findAll('.grid button').find(b => b.text() === text)!
}

describe('particles game', () => {
  beforeEach(() => {
    record.mockClear()
    played.length = 0
    game = { questions: Array.from({ length: 20 }, (_, i) => question(i)) }
  })

  it('starts straight away with four boxes, nothing to choose first', async () => {
    const wrapper = await open()
    expect(wrapper.text()).toContain('1 of 15')
    expect(wrapper.findAll('.grid button').map(b => b.text()).sort()).toEqual(['が', 'で', 'へ', 'を'].sort())
    expect(wrapper.text()).toContain('I study there.')
  })

  it('marks a right pick, plays the sentence and says why', async () => {
    const wrapper = await open()
    await box(wrapper, 'で').trigger('click')
    expect(wrapper.text()).toContain('Right.')
    expect(wrapper.text()).toContain('で marks where the action happens.')
    expect(played).toHaveLength(1)
    expect(box(wrapper, 'を').attributes('disabled')).toBeDefined()
  })

  it('ends after three misses, lists them, and records the game', async () => {
    const wrapper = await open()
    for (let i = 0; i < 3; i++) {
      await box(wrapper, 'を').trigger('click')
      expect(wrapper.text()).toContain('Not quite. It is で.')
      await wrapper.findAll('button').find(b => b.text() === 'Next' || b.text() === 'See how you did')!.trigger('click')
    }
    expect(wrapper.text()).toContain('0 / 15')
    expect(wrapper.text()).toContain('Out of hearts after 3 of 15.')
    expect(wrapper.text()).toContain('To go over')
    expect(record).toHaveBeenCalledWith({ kind: 'particles', refId: 'mixed', score: 0, total: 15 }, 'ja')
  })

  it('says so when no questions are published yet', async () => {
    game = { questions: [] }
    const wrapper = await open()
    expect(wrapper.text()).toContain('No particle questions yet.')
  })
})
