import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useUiStore } from './ui'

describe('ui store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('defaults to light theme', () => {
    const ui = useUiStore()
    expect(ui.theme).toBe('light')
  })

  it('toggles between light and dark', () => {
    const ui = useUiStore()
    ui.toggleTheme()
    expect(ui.theme).toBe('dark')
    ui.toggleTheme()
    expect(ui.theme).toBe('light')
  })

  it('reflects the theme onto the document element', async () => {
    const ui = useUiStore()
    ui.toggleTheme()
    await Promise.resolve()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
