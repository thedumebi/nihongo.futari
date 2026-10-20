import type { SpeakStepView } from '@nihongo/shared/types'

import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import OnScreenRun from './on-screen-run.vue'

const played: string[] = []
vi.mock('@/composables/use-audio', () => ({
  playAudio: (url: string | null) => url && played.push(url),
  playAudioQueue: async (urls: Array<string | null>) => {
    for (const u of urls) {
      if (typeof u === 'string')
        played.push(u)
    }
  },
  prefetchAudio: async () => {},
  stopAudio: () => {}
}))

function step(index: number, kind: SpeakStepView['kind'], text: string | null): SpeakStepView {
  return {
    index,
    kind,
    say: [{ lang: 'en', text: `say ${index}`, audio: `say-${index}.mp3` }],
    text,
    reading: text,
    note: null,
    tokens: [],
    answerAudio: text ? `answer-${index}.mp3` : null
  }
}

const steps = [step(0, 'explain', null), step(1, 'prompt', 'ねこ'), step(2, 'prompt', 'いぬ')]

async function open() {
  const wrapper = mount(OnScreenRun, {
    props: { steps, mode: 'always', thinkScale: 1 },
    global: { stubs: { TokenLine: true, WordMeaning: true } }
  })
  await flushPromises()
  return wrapper
}

function button(wrapper: Awaited<ReturnType<typeof open>>, label: string) {
  return wrapper.findAll('button').find(b => b.attributes('aria-label') === label || b.text() === label)!
}

describe('on-screen run: going back', () => {
  it('cannot go back from the first step', async () => {
    const wrapper = await open()
    expect(button(wrapper, 'Previous').attributes('disabled')).toBeDefined()
  })

  it('goes back one step and plays it again from the start', async () => {
    const wrapper = await open()
    await button(wrapper, 'Next').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('say 1')
    played.length = 0
    await button(wrapper, 'Previous').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('say 0')
    expect(played).toEqual(['say-0.mp3'])
  })

  it('keeps the first answer to a prompt when it is answered again', async () => {
    const wrapper = await open()
    await button(wrapper, 'Next').trigger('click')
    await flushPromises()
    await button(wrapper, 'Show answer').trigger('click')
    await button(wrapper, 'Not quite').trigger('click')
    await flushPromises()

    // Back to ねこ, and this time "Got it".
    await button(wrapper, 'Previous').trigger('click')
    await flushPromises()
    await button(wrapper, 'Show answer').trigger('click')
    await button(wrapper, 'Got it').trigger('click')
    await flushPromises()

    // いぬ, then ねこ comes round once (not twice) as the retry.
    for (let i = 0; i < 2; i++) {
      await button(wrapper, 'Show answer').trigger('click')
      await button(wrapper, 'Got it').trigger('click')
      await flushPromises()
    }
    expect(wrapper.emitted('finished')).toEqual([[{ gotIt: 1, total: 2 }]])
  })
})
