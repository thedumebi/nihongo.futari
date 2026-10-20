import type { GhostBoss } from '@nihongo/shared/types'

import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import GhostBossView from './ghost-boss.vue'

const record = vi.fn(async () => {})
let boss: GhostBoss

vi.mock('@/api/games', () => ({ getGhostBoss: async () => boss }))
vi.mock('@/api/activities', () => ({ recordActivity: (...args: unknown[]) => record(...(args as [])) }))
vi.mock('@/store/language', () => ({ useLanguageStore: () => ({ code: 'ja' }) }))
vi.mock('@/composables/use-audio', () => ({ playAudio: async () => true, stopAudio: () => {} }))
vi.mock('@/composables/use-furigana', async () => {
  const { ref } = await import('vue')
  return { useFurigana: () => ({ mode: ref('always'), knownKanji: ref(new Set()), loadKnownKanji: async () => {}, loadSettings: async () => {} }) }
})

function ghost(key: string, text: string, status: 'ghost' | 'nearly', kind: 'word' | 'kana' = 'word') {
  return { key, kind, facet: kind === 'kana' ? 'reading' : 'production', status, text, reading: kind === 'kana' ? 'wo' : null, meaning: kind === 'kana' ? '' : 'one', ref: kind === 'kana' ? '' : 'w1', etymology: null, lookAlikes: [], grammar: null }
}

function round(ghostKey: string, answer: string, options: string[]) {
  return { ghost: ghostKey, kind: 'production' as const, question: `Which one is ${answer}?`, answer, options, script: 'ja' as const, audio: null }
}

async function open() {
  const wrapper = mount(GhostBossView, {
    global: { stubs: { AppShell: { template: '<div><slot /></div>' }, RouterLink: { props: ['to'], template: '<a><slot /></a>' } } }
  })
  await flushPromises()
  return wrapper
}

function click(wrapper: Awaited<ReturnType<typeof open>>, text: string) {
  return wrapper.findAll('button').find(b => b.text() === text)!.trigger('click')
}

describe('ghost boss: furigana', () => {
  function readingBoss(kind: 'meaning' | 'reading') {
    return {
      week: '2026-W43',
      ghosts: [{ ...ghost('w', '渡る', 'nearly'), reading: 'わたる', meaning: 'to cross' }],
      rounds: [{ ghost: 'w', kind, question: kind === 'reading' ? 'How is 渡る read?' : 'What does 渡る mean?', answer: kind === 'reading' ? 'わたる' : 'to cross', options: kind === 'reading' ? ['わたる', 'みっつ', 'いけん', 'けっして'] : ['to cross', 'cold', 'right', 'to pull out'], script: kind === 'reading' ? 'ja' as const : 'en' as const, audio: null }]
    }
  }

  it('puts the reading over the word on a meaning question', async () => {
    boss = readingBoss('meaning')
    const wrapper = await open()
    await click(wrapper, 'Face it')
    expect(wrapper.find('rt').text()).toBe('わた')
  })

  it('holds it back on a reading question until it is answered', async () => {
    boss = readingBoss('reading')
    const wrapper = await open()
    await click(wrapper, 'Face it')
    expect(wrapper.find('rt').exists()).toBe(false)
    await click(wrapper, 'わたる')
    expect(wrapper.find('rt').text()).toBe('わた')
  })
})

describe('ghost boss', () => {
  beforeEach(() => {
    record.mockClear()
    boss = {
      week: '2026-W43',
      ghosts: [ghost('a', '一つ', 'ghost'), ghost('b', 'ヲ', 'nearly', 'kana')],
      rounds: [round('a', '一つ', ['一つ', '二つ', '三つ', '猫']), round('b', 'ヲ', ['ヲ', 'フ', 'ラ', 'ヨ'])]
    }
  })

  it('briefs ghosts and cards nearly haunting, each with the side that slips', async () => {
    const text = (await open()).text()
    expect(text).toContain('1 card keeps slipping, and 1 is close to it.')
    expect(text).toContain('Ghost · saying it from English')
    expect(text).toContain('Nearly haunting · reading it')
  })

  it('brings a missed round back once, and ends with each ghost beaten or still haunting', async () => {
    const wrapper = await open()
    await click(wrapper, 'Face them')
    await click(wrapper, '二つ')
    expect(wrapper.text()).toContain('It was 一つ.')
    await click(wrapper, 'Next')
    await click(wrapper, 'ヲ')
    await click(wrapper, 'Next')
    expect(wrapper.text()).toContain('Once more')
    await click(wrapper, '三つ')
    await click(wrapper, 'See how you did')
    expect(wrapper.text()).toContain('1 / 2')
    const rows = wrapper.findAll('li').map(l => l.text())
    expect(rows).toContain('一つStill haunting')
    expect(rows).toContain('ヲBeaten')
    expect(record).toHaveBeenCalledWith({ kind: 'ghost-boss', refId: '2026-W43', score: 1, total: 2 }, 'ja')
  })
})
