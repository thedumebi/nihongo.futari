import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import StageUpModal from './stage-up-modal.vue'

const seen = vi.fn(async () => {})
vi.mock('@/api/study', () => ({ markCelebrationSeen: (...args: unknown[]) => seen(...(args as [])) }))

const ModalStub = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: '<div v-if="modelValue" data-test="modal"><slot /></div>'
}

function open(to: number) {
  return mount(StageUpModal, {
    props: { celebration: { level: 'N5', from: to - 1, to, stages: 62 }, languageCode: 'ja' },
    global: { stubs: { VueFinalModal: ModalStub } }
  })
}

describe('stageUpModal', () => {
  beforeEach(() => seen.mockClear())

  it('announces the stage just finished and tells the server it was shown', () => {
    const text = open(5).text()
    expect(text).toContain('Stage 4 complete')
    expect(text).toContain('stage 5 is open')
    expect(seen).toHaveBeenCalledWith('ja', 'N5', 5)
  })

  it('does not open again this session once closed', async () => {
    const first = open(6)
    await first.find('button').trigger('click')
    expect(first.emitted('close')).toHaveLength(1)
    seen.mockClear()
    expect(open(6).find('[data-test="modal"]').exists()).toBe(false)
    expect(seen).not.toHaveBeenCalled()
  })
})
