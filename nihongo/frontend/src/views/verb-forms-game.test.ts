import type { VerbFormsGame } from '@nihongo/shared/types'

import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import VerbFormsGameView from './verb-forms-game.vue'

const record = vi.fn(async () => {})
let game: VerbFormsGame

vi.mock('@/api/games', () => ({ getVerbFormsGame: async () => game }))
vi.mock('@/api/activities', () => ({ recordActivity: (...args: unknown[]) => record(...(args as [])) }))
vi.mock('@/store/language', () => ({ useLanguageStore: () => ({ code: 'ja' }) }))

function verb(surface: string, reading: string, verbClass: 'godan' | 'ichidan') {
  return { wordId: surface, surface, reading, verbClass, meaning: 'to do', known: true, spellings: [{ form: surface, reading }] }
}

function form(f: VerbFormsGame['forms'][number]['form'], unlocked: boolean) {
  return { form: f, unlocked, lesson: unlocked ? null : { slug: f, title: `〜${f}` } }
}

async function open() {
  const wrapper = mount(VerbFormsGameView, {
    global: {
      stubs: {
        AppShell: { template: '<div><slot /></div>' },
        RouterLink: { props: ['to'], template: '<a><slot /></a>' }
      }
    }
  })
  await flushPromises()
  return wrapper
}

function buttons(wrapper: Awaited<ReturnType<typeof open>>, text: string) {
  return wrapper.findAll('button').filter(b => b.text().includes(text))
}

/** The answer, worked out from the verb on screen and the form asked. */
function rightFor(reading: string, text: string): string {
  const masu = text.includes('Make it 〜ます')
  return {
    かく: masu ? 'かきます' : 'かいて',
    たべる: masu ? 'たべます' : 'たべて',
    のむ: masu ? 'のみます' : 'のんで'
  }[reading as 'かく' | 'たべる' | 'のむ']
}

describe('verb forms game', () => {
  beforeEach(() => {
    record.mockClear()
    try {
      localStorage.clear()
    } catch {}
    game = {
      verbs: [verb('書く', 'かく', 'godan'), verb('食べる', 'たべる', 'ichidan'), verb('飲む', 'のむ', 'godan')],
      forms: [form('masu', true), form('te', true), form('tai', false)]
    }
  })

  it('offers the taught forms, and says what to learn for the rest', async () => {
    const wrapper = await open()
    expect(buttons(wrapper, 'Mixed')).toHaveLength(1)
    expect(buttons(wrapper, '〜ます polite')).toHaveLength(1)
    expect(buttons(wrapper, '〜たい')).toHaveLength(0)
    expect(wrapper.text()).toContain('Learn 〜tai first')
  })

  it('takes a heart for a wrong pick and shows the rule', async () => {
    const wrapper = await open()
    await buttons(wrapper, '〜て te-form')[0]!.trigger('click')
    await buttons(wrapper, 'Play')[0]!.trigger('click')

    const reading = wrapper.find('p.text-sm span').text() as 'かく' | 'たべる' | 'のむ'
    const right = { かく: 'かいて', たべる: 'たべて', のむ: 'のんで' }[reading]
    expect(wrapper.findAll('.grid button').map(b => b.text())).toContain(right)
    await wrapper.findAll('.grid button').find(b => b.text() !== right)!.trigger('click')

    expect(wrapper.text()).toContain('Not quite.')
    expect(wrapper.text()).toMatch(/verb: /)
    expect(wrapper.find('[aria-label$="hearts left"]').attributes('aria-label')).toBe('2 of 3 hearts left')
  })

  it('ends after three wrong answers and records the game', async () => {
    const wrapper = await open()
    await buttons(wrapper, 'Play')[0]!.trigger('click')
    for (let i = 0; i < 3; i++) {
      const options = wrapper.findAll('.grid button')
      const right = rightFor(wrapper.find('p.text-sm span').text(), wrapper.text())
      await options.find(b => b.text() !== right)!.trigger('click')
      // The last miss still shows its answer and rule before the end.
      expect(wrapper.text()).toContain('Not quite.')
      await buttons(wrapper, i < 2 ? 'Next' : 'See how you did')[0]!.trigger('click')
    }
    expect(wrapper.text()).toContain('Out of hearts after 3 of 15')
    expect(record).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('To go over')
    expect(record).toHaveBeenCalledWith({ kind: 'verb-forms', refId: 'mixed', score: 0, total: 15 }, 'ja')
  })
})
