import { conjugationTables } from '@nihongo/shared/lib'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ConjugationTable from './conjugation-table.vue'

function render(form: string, reading: string, pos: string[][]) {
  const [table] = conjugationTables({ form, reading, pos })
  return mount(ConjugationTable, { props: { table: table!, mode: 'off' } })
}

describe('conjugationTable', () => {
  it('folds to its title until opened', () => {
    const wrapper = render('食べる', 'たべる', [['v1']])
    expect(wrapper.text()).toContain('Verb forms')
    expect(wrapper.find('table').isVisible()).toBe(false)
  })

  it('lays the tenses out polite beside plain once opened', async () => {
    const wrapper = render('食べる', 'たべる', [['v1']])
    await wrapper.find('button[aria-expanded]').trigger('click')
    const rows = wrapper.findAll('tbody tr').map(r => r.findAll('th, td').map(c => c.text()).join(' '))
    expect(rows).toEqual(['Present 食べます 食べる', 'Negative 食べません 食べない', 'Past 食べました 食べた', 'Past negative 食べませんでした 食べなかった'])
  })

  it('names an adjective table as one', () => {
    expect(render('静か', 'しずか', [['adj-na']]).text()).toContain('Adjective forms')
  })

  it('says when a noun is a verb with する', () => {
    expect(render('勉強', 'べんきょう', [['n', 'vs']]).text()).toContain('Used as a verb with する: 勉強する.')
  })
})
