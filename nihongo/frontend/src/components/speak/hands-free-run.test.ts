import { recallSteps } from '@nihongo/shared/lib'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import HandsFreeRun from './hands-free-run.vue'

vi.mock('@/composables/use-audio', () => ({
  playAudioQueue: async () => {},
  prefetchAudio: async () => {},
  stopAudio: () => {}
}))

const session = {
  items: [
    { key: 'w1', kind: 'word' as const, prompt: 'one', promptAudio: ['one.mp3', 'hi.mp3'], hint: 'ひ', text: '一つ', reading: 'ひとつ', answerAudio: 'hitotsu.mp3' },
    { key: 'w2', kind: 'word' as const, prompt: 'cat', promptAudio: ['cat.mp3'], hint: null, text: '猫', reading: 'ねこ', answerAudio: 'neko.mp3' }
  ],
  order: [0, 1, 0]
}

function open() {
  const { steps, tags } = recallSteps(session)
  return mount(HandsFreeRun, {
    props: { steps, tags, title: 'Recall', album: 'Recall', thinkScale: 1, showReading: true },
    slots: { intro: '<p>Recall intro</p>' }
  })
}

describe('hands-free run, playing Recall', () => {
  it('shows the intro it is given in place of Speak\'s', () => {
    const text = open().text()
    expect(text).toContain('Recall intro')
    expect(text).not.toContain('Listening does not mark the session done')
  })

  it('shows the hint, and tags a word asked before', async () => {
    const wrapper = open()
    expect(wrapper.text()).toMatch(/\(starts with\s+ひ\)/)
    expect(wrapper.text()).not.toContain('again')
    await wrapper.find('[aria-label="Next"]').trigger('click')
    await wrapper.find('[aria-label="Next"]').trigger('click')
    expect(wrapper.text()).toContain('3 of 3')
    expect(wrapper.text()).toContain('again')
  })

  it('goes back as well as on', async () => {
    const wrapper = open()
    await wrapper.find('[aria-label="Next"]').trigger('click')
    await wrapper.find('[aria-label="Previous"]').trigger('click')
    expect(wrapper.text()).toContain('1 of 3')
  })
})
