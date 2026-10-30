import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import BottomSheet from './bottom-sheet.vue'

const ModalStub = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: '<div v-if="modelValue" data-test="modal"><slot /></div>'
}

function sheet(open: boolean) {
  return mount(BottomSheet, {
    props: { open, label: 'Dictionary entry' },
    slots: { header: '<p>Dictionary</p>', default: '<p>食べる</p>' },
    global: { stubs: { VueFinalModal: ModalStub } }
  })
}

describe('bottomSheet', () => {
  it('shows its header and body when open', () => {
    const text = sheet(true).text()
    expect(text).toContain('Dictionary')
    expect(text).toContain('食べる')
  })

  it('shows nothing when closed', () => {
    expect(sheet(false).find('[data-test="modal"]').exists()).toBe(false)
  })

  it('asks to close from its close button', async () => {
    const wrapper = sheet(true)
    await wrapper.find('button[aria-label="Close"]').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
