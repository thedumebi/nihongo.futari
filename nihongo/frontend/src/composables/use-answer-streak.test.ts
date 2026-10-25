import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import { recordAnswer, releaseCelebration, setStreakCelebrations, useAnswerStreak, useStreakCelebration } from './use-answer-streak'

const { celebrating, close } = useStreakCelebration()

/** A screen that answers: mounting it starts a run, unmounting ends it. */
const Screen = defineComponent({
  setup() {
    useAnswerStreak()
    return () => h('div')
  }
})

function right(times: number) {
  for (let i = 0; i < times; i++)
    recordAnswer(true)
  vi.runAllTimers()
}

describe('answers in a row', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setStreakCelebrations(true)
    close()
  })
  afterEach(() => vi.useRealTimers())

  it('celebrates at 5 and 10, and not at 4', () => {
    const screen = mount(Screen)
    right(4)
    expect(celebrating.value).toBeNull()
    right(1)
    expect(celebrating.value).toBe(5)
    close()
    right(5)
    expect(celebrating.value).toBe(10)
    screen.unmount()
  })

  it('starts again from zero after a wrong answer', () => {
    const screen = mount(Screen)
    right(4)
    recordAnswer(false)
    right(4)
    expect(celebrating.value).toBeNull()
    right(1)
    expect(celebrating.value).toBe(5)
    screen.unmount()
  })

  it('ends the run when the screen goes, including a celebration not yet open', () => {
    const first = mount(Screen)
    right(3)
    recordAnswer(true)
    recordAnswer(true)
    first.unmount()
    vi.runAllTimers()
    expect(celebrating.value).toBeNull()
    const second = mount(Screen)
    right(4)
    expect(celebrating.value).toBeNull()
    second.unmount()
  })

  it('in Study, waits for the rating: held through the verdict, opened once the card is rated', () => {
    const screen = mount(Screen)
    right(4)
    recordAnswer(true, { hold: true })
    vi.runAllTimers()
    expect(celebrating.value).toBeNull()
    releaseCelebration()
    expect(celebrating.value).toBe(5)
    close()
    releaseCelebration()
    expect(celebrating.value).toBeNull()
    screen.unmount()
  })

  it('moving on waits for the celebration to close, and goes straight on when there is none', async () => {
    const screen = mount(Screen)
    let movedOn = false
    await releaseCelebration().then(() => {
      movedOn = true
    })
    expect(movedOn).toBe(true)

    movedOn = false
    for (let i = 0; i < 5; i++)
      recordAnswer(true, { hold: true })
    const going = releaseCelebration().then(() => {
      movedOn = true
    })
    await Promise.resolve()
    expect(celebrating.value).toBe(5)
    expect(movedOn).toBe(false)
    close()
    await going
    expect(movedOn).toBe(true)
    screen.unmount()
  })

  it('stays quiet when the learner has turned it off', () => {
    setStreakCelebrations(false)
    const screen = mount(Screen)
    right(10)
    expect(celebrating.value).toBeNull()
    screen.unmount()
  })
})
