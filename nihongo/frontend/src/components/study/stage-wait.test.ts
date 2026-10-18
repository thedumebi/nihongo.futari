import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import StageWait from './stage-wait.vue'

const stage4 = { level: 'N5', stage: 4, stages: 62, learned: 132, total: 172 }

describe('stageWait', () => {
  it('says which stage opens and how many cards are left to learn', () => {
    const text = mount(StageWait, { props: { stage: stage4 } }).text()
    expect(text).toContain('No new words until stage 5')
    expect(text).toContain('Learn 15 more cards from it (132 of 172 now, 147 needed)')
  })

  it('has a one-line form for above a card', () => {
    expect(mount(StageWait, { props: { stage: stage4, compact: true } }).text())
      .toBe('New words open at stage 5. Learn 15 more cards from stage 4 to get there.')
  })

  it('points to the next level after the last stage', () => {
    const last = { ...stage4, stage: 62, learned: 40, total: 48 }
    expect(mount(StageWait, { props: { stage: last, compact: true } }).text())
      .toBe('New words open at the level after N5. Learn 1 more card from stage 62 to get there.')
  })
})
