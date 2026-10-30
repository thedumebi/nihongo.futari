import type { CrosswordEntry, CrosswordPuzzle } from '@nihongo/shared/types'

import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import CrosswordView from './crossword.vue'

function entry(fields: Pick<CrosswordEntry, 'number' | 'direction' | 'row' | 'col' | 'answer' | 'clue'>): CrosswordEntry {
  return { ...fields, audio: null } as CrosswordEntry
}

/** がつこう across the top: one word is all these need. */
const PUZZLE: CrosswordPuzzle = {
  puzzleKey: 'test-view-gakkou',
  level: 'N5',
  source: 'daily',
  script: 'hiragana',
  size: 4,
  cells: [['が', 'つ', 'こ', 'う'], [null, null, null, null], [null, null, null, null], [null, null, null, null]],
  entries: [entry({ number: 1, direction: 'across', row: 0, col: 0, answer: ['が', 'つ', 'こ', 'う'], clue: 'school' })],
  bonus: null,
  knownCount: null,
  note: null,
  completed: null
}

vi.mock('@/api/crossword', () => ({
  getCrossword: async () => structuredClone(PUZZLE),
  saveCrosswordResult: async () => ({ bestSeconds: 1, lastSeconds: 1, best: true })
}))
vi.mock('@/store/language', () => ({ useLanguageStore: () => ({ code: 'ja' }) }))
vi.mock('@/composables/use-audio', () => ({ playAudio: async () => true, prefetchAudio: async () => {} }))
vi.mock('@/composables/use-level', () => ({ useLevel: () => ({ level: ref('N5'), loadLevel: async () => {} }) }))
vi.mock('vue-router', async original => ({ ...await original<typeof import('vue-router')>(), useRoute: () => ({ query: {} }) }))

async function open() {
  const wrapper = mount(CrosswordView, {
    global: { stubs: { AppShell: { template: '<div><slot /></div>' }, CrosswordFinish: true, PageTour: true } }
  })
  await flushPromises()
  return wrapper
}

/** The kana shown in the grid's top row, in order. */
function topRow(wrapper: Awaited<ReturnType<typeof open>>) {
  return wrapper.findAll('[role="gridcell"]').slice(0, 4).map(cell => cell.find('span.text-2xl').text()).join('')
}

function beforeInput(el: HTMLInputElement, inputType: string, data: string | null, isComposing = false) {
  el.dispatchEvent(new InputEvent('beforeinput', { inputType, data, isComposing, cancelable: true, bubbles: true }))
}

describe('crossword keyboard', () => {
  beforeEach(() => {
    localStorage.clear()
    // A phone: no pointer that would focus the grid on its own.
    window.matchMedia = (query: string) => ({ matches: false, media: query }) as MediaQueryList
  })

  it('takes typing again after a Japanese word that never said it ended', async () => {
    const wrapper = await open()
    const input = wrapper.find('input[aria-label="Type the answer"]').element as HTMLInputElement
    input.dispatchEvent(new CompositionEvent('compositionstart'))
    // Switched to the English keyboard mid-word: no compositionend, just keys.
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', keyCode: 71 }))
    beforeInput(input, 'insertText', 'g')
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', keyCode: 65 }))
    beforeInput(input, 'insertText', 'a')
    await flushPromises()
    expect(topRow(wrapper)).toBe('が')
  })

  it('writes a confirmed word once, not again for the commit the keyboard sends with it', async () => {
    const wrapper = await open()
    const input = wrapper.find('input[aria-label="Type the answer"]').element as HTMLInputElement
    input.dispatchEvent(new CompositionEvent('compositionstart'))
    input.value = ' がつ'
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertCompositionText', data: 'がつ', isComposing: true }))
    beforeInput(input, 'insertFromComposition', 'がつ')
    input.dispatchEvent(new CompositionEvent('compositionend', { data: 'がつ' }))
    await flushPromises()
    expect(topRow(wrapper)).toBe('がつ')
  })

  it('types a suggestion the keyboard puts in place of a key press', async () => {
    const wrapper = await open()
    const input = wrapper.find('input[aria-label="Type the answer"]').element as HTMLInputElement
    beforeInput(input, 'insertReplacementText', 'gakkou')
    await flushPromises()
    expect(topRow(wrapper)).toBe('がつこう')
  })
})
