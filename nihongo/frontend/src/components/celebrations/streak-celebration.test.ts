import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useStreakCelebration } from '@/composables/use-answer-streak'
import { celebrationFor } from '@/lib/streak-celebrations'

import StreakCelebration from './streak-celebration.vue'

const push = vi.fn()
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))

const ModalStub = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: '<div v-if="modelValue" data-test="modal"><slot /></div>'
}

const { celebrating } = useStreakCelebration()

function mountIt() {
  return mount(StreakCelebration, { global: { stubs: { VueFinalModal: ModalStub, RouterLink: true } } })
}

describe('streakCelebration', () => {
  beforeEach(() => {
    celebrating.value = null
    push.mockClear()
  })

  it('shows the run, its line and the way to turn these off, and Keep going closes it', async () => {
    celebrating.value = 10
    const wrapper = mountIt()
    const text = wrapper.text()
    expect(text).toContain('わあ！ 10 in a row')
    expect(text).toContain(celebrationFor(10).line)
    expect(text).toContain('Don\'t want these? Turn them off in')
    await wrapper.findAll('button').find(b => b.text() === 'Keep going')!.trigger('click')
    expect(celebrating.value).toBeNull()
  })

  it('the Settings link closes it and goes to Settings', async () => {
    celebrating.value = 5
    const wrapper = mountIt()
    await wrapper.findAll('button').find(b => b.text() === 'Settings')!.trigger('click')
    expect(celebrating.value).toBeNull()
    expect(push).toHaveBeenCalledWith('/settings')
  })

  it('past 60 the celebrations come round again with the real count', () => {
    expect(celebrationFor(65)).toEqual({ ...celebrationFor(5), title: 'やった！ 65 in a row' })
    expect(celebrationFor(120).line).toBe(celebrationFor(60).line)
  })
})
