import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import PageTour from './page-tour.vue'
import { TOURS } from './tours'

vi.mock('@/store/auth', () => ({ useAuthStore: () => ({ user: { id: 'u1' } }) }))

const SheetStub = {
  props: ['open', 'label'],
  emits: ['close'],
  template: '<div v-if="open" data-test="sheet"><slot name="header" /><slot /></div>'
}

function tour() {
  return mount(PageTour, {
    props: { page: 'recall' },
    global: { stubs: { BottomSheet: SheetStub } }
  })
}

const steps = TOURS.recall.steps

describe('pageTour', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('opens by itself on the first visit, at the first step', async () => {
    const wrapper = tour()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-test="sheet"]').exists()).toBe(true)
    expect(wrapper.text()).toContain(steps[0]!.title)
    expect(wrapper.text()).toContain(`1 of ${steps.length}`)
  })

  it('steps forward and back, and Done puts it away for good', async () => {
    const wrapper = tour()
    await wrapper.vm.$nextTick()
    const button = (label: string) => wrapper.findAll('button').find(b => b.text() === label)!

    await button('Next').trigger('click')
    expect(wrapper.text()).toContain(steps[1]!.title)
    await button('Back').trigger('click')
    expect(wrapper.text()).toContain(steps[0]!.title)

    for (let i = 1; i < steps.length; i++)
      await button('Next').trigger('click')
    await button('Done').trigger('click')

    expect(wrapper.find('[data-test="sheet"]').exists()).toBe(false)
    expect(localStorage.getItem('go-tour:recall:u1')).toBe('1')

    const again = tour()
    await again.vm.$nextTick()
    expect(again.find('[data-test="sheet"]').exists()).toBe(false)
  })

  it('closing it counts as seen, and the help button brings it back from the start', async () => {
    const wrapper = tour()
    await wrapper.vm.$nextTick()
    await wrapper.findAll('button').find(b => b.text() === 'Next')!.trigger('click')
    wrapper.findComponent(SheetStub).vm.$emit('close')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-test="sheet"]').exists()).toBe(false)
    expect(localStorage.getItem('go-tour:recall:u1')).toBe('1')

    await wrapper.find(`button[aria-label="${TOURS.recall.title}"]`).trigger('click')
    expect(wrapper.text()).toContain(steps[0]!.title)
  })
})
