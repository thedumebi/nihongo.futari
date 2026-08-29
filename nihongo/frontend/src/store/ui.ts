import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { watchEffect } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // Key bumped to -v3 so the new light "A.B.M" default applies even for visitors
  // who had an older value stored. Light is the default (dark is opt-in).
  const theme = useLocalStorage<'light' | 'dark'>('nihongo-theme-v3', 'light')

  // Allow ?theme=dark|light to force a theme (deep links + headless visual
  // verification against the Canva exports).
  if (typeof location !== 'undefined') {
    const param = new URLSearchParams(location.search).get('theme')
    if (param === 'dark' || param === 'light')
      theme.value = param
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  watchEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme.value
    }
  })

  return { theme, toggleTheme }
})
