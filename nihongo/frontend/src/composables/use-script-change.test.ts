import type { AnswerScript } from '@nihongo/shared/constants'

import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'

import { useScriptChange } from './use-script-change'

describe('useScriptChange', () => {
  it('is off on the first card, on when the type changes, and off again on the next card of the same type', async () => {
    const card = ref({ id: 1 })
    const script = ref<AnswerScript | null>('romaji')
    const { changed } = useScriptChange(card, script)

    card.value = { id: 1 }
    await nextTick()
    expect(changed.value).toBe(false)

    card.value = { id: 2 }
    script.value = 'kana'
    await nextTick()
    expect(changed.value).toBe(true)

    card.value = { id: 3 }
    await nextTick()
    expect(changed.value).toBe(false)
  })
})
