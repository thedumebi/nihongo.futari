import type { PhoneticSeriesView } from '@nihongo/shared/types'

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

import SeriesCard from './series-card.vue'

function member(character: string, reading: string, follows: boolean, parts: string[], meaning: string, word: PhoneticSeriesView['members'][number]['word'] = null) {
  return {
    character,
    reading,
    meaning,
    followsSeries: follows,
    exceptionNote: null,
    strokeCount: null,
    grade: null,
    parts,
    word,
    known: false
  }
}

const series: PhoneticSeriesView = {
  component: '共',
  primaryReading: 'キョウ',
  alternateReadings: [],
  memberCount: 4,
  reliability: 0.5,
  componentMeaning: 'together',
  members: [
    member('供', 'キョウ', true, ['亻', '共'], 'offer', { form: '提供', reading: 'ていきょう', meaning: 'offer' }),
    member('恭', 'キョウ', true, ['共', '㣺'], 'reverent'),
    member('洪', 'コウ', false, ['氵', '共'], 'flood')
  ]
}

describe('seriesCard', () => {
  beforeEach(() => localStorage.clear())

  it('asks without giving the reading away, and shows the kanji split into parts', () => {
    const text = mount(SeriesCard, { props: { series, mode: 'ask', script: 'kana' } }).text()
    expect(text).toContain('These kanji all contain 共')
    expect(text).toContain('亻 + 共')
    expect(text).toContain('offer')
    expect(text).not.toContain('きょう')
    expect(text).not.toContain('提供')
    expect(text).not.toContain('洪')
  })

  it('once answered, shows readings in the reader\'s script, a word using it, and the exceptions', () => {
    const text = mount(SeriesCard, { props: { series, mode: 'ask', revealed: true, script: 'kana' } }).text()
    expect(text).toContain('Read きょう — 2 of 3 kanji with 共')
    expect(text).toContain('提供（ていきょう）')
    expect(text).toContain('Break the pattern')
    expect(text).toContain('洪')
    expect(text).toContain('こう')
  })

  it('opens the explanation the first time a series is taught', () => {
    const wrapper = mount(SeriesCard, { props: { series, mode: 'teach', script: 'always' } })
    expect(wrapper.find('details').attributes('open')).toBeDefined()
    expect(wrapper.text()).toContain('キョウ · きょう')
  })
})
