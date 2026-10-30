import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AnswerCue from './answer-cue.vue'

describe('answerCue', () => {
  it('names the script with its glyph and the prompt instruction', () => {
    const text = mount(AnswerCue, { props: { script: 'romaji', instruction: 'Type the sound in romaji' } }).text()
    expect(text).toContain('Aa Answer in romaji')
    expect(text).toContain('Type the sound in romaji')
  })

  it('says romaji is read as kana on a kana card', () => {
    expect(mount(AnswerCue, { props: { script: 'kana' } }).text()).toContain('Romaji works too: it turns into kana.')
  })

  it('does not offer romaji where it would not count', () => {
    expect(mount(AnswerCue, { props: { script: 'kanji' } }).text()).not.toContain('Romaji works too')
  })

  it('says so when the last card wanted something else', () => {
    const wrapper = mount(AnswerCue, { props: { script: 'hiragana', changed: true } })
    expect(wrapper.classes()).toContain('changed')
    expect(wrapper.text()).toContain('Not the same as the last card')
  })

  it('stays quiet when nothing changed', () => {
    const wrapper = mount(AnswerCue, { props: { script: 'hiragana' } })
    expect(wrapper.classes()).not.toContain('changed')
    expect(wrapper.text()).not.toContain('Not the same as the last card')
  })
})
