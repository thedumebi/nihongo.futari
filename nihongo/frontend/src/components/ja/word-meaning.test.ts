import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useWordEntrySheet } from '@/composables/use-word-entry-sheet'

import WordMeaning from './word-meaning.vue'

vi.mock('@/api/study', () => ({
  getWordStatus: vi.fn(async () => ({ reviewable: false, inReview: false, ghost: false, due: null })),
  saveWord: vi.fn()
}))

const taberu = { form: '食べる', reading: 'たべる', meanings: ['to eat'], pos: 'ichidan verb', wordId: 'w-taberu' }

function sheet(word: typeof taberu | Omit<typeof taberu, 'wordId'>) {
  return mount(WordMeaning, { props: { word }, attachTo: document.body })
}

describe('wordMeaning', () => {
  afterEach(() => {
    useWordEntrySheet().close()
    document.body.innerHTML = ''
  })

  it('opens the full entry for a word the dictionary has', async () => {
    const wrapper = sheet(taberu)
    const button = [...document.querySelectorAll('button')].find(b => b.textContent?.includes('Full entry'))
    button?.click()
    expect(useWordEntrySheet().wordId.value).toBe('w-taberu')
    wrapper.unmount()
  })

  it('offers no full entry for a word the dictionary only knows in pieces', () => {
    const { wordId: _, ...pieces } = taberu
    const wrapper = sheet(pieces)
    expect(document.body.textContent).not.toContain('Full entry')
    wrapper.unmount()
  })

  it('stays open when a tap lands on the full entry over it', () => {
    const wrapper = sheet(taberu)
    useWordEntrySheet().open('w-taberu')
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('close')).toBeUndefined()
    useWordEntrySheet().close()
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })
})
