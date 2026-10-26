import { ref } from 'vue'

/**
 * The last few keyboard events on an input, to see on a phone what its
 * keyboard actually sent when typing goes missing. Only switched on by hand
 * (the crossword shows it with `?keys=1`), so it costs nothing otherwise.
 */

const LIMIT = 20

export function useInputLog(enabled: boolean) {
  // ============ Reactive State ============
  const lines = ref<string[]>([])

  // ============ Methods ============
  function log(e: Event) {
    if (!enabled)
      return
    const input = e as InputEvent & KeyboardEvent & CompositionEvent
    const target = e.target as HTMLInputElement | null
    const parts = [
      e.type,
      input.inputType ? `type=${input.inputType}` : '',
      input.key ? `key=${input.key}` : '',
      input.data != null ? `data=${JSON.stringify(input.data)}` : '',
      input.isComposing ? 'composing' : '',
      target ? `value=${JSON.stringify(target.value)}` : ''
    ]
    lines.value = [parts.filter(Boolean).join(' '), ...lines.value].slice(0, LIMIT)
  }

  return { enabled, lines, log }
}
