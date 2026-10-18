import { ref } from 'vue'

/**
 * Stage celebrations closed this session, across every screen that shows one.
 *
 * Study and Today may both hold the same pending pass for a moment (the "seen"
 * call is still in flight while the other screen refreshes), and it must not
 * open twice.
 */
const dismissed = ref(new Set<string>())

export function useStageCelebration() {
  const keyOf = (c: { level: string, to: number }) => `${c.level}:${c.to}`
  return {
    isDismissed: (c: { level: string, to: number }) => dismissed.value.has(keyOf(c)),
    dismiss: (c: { level: string, to: number }) => {
      dismissed.value = new Set([...dismissed.value, keyOf(c)])
    }
  }
}
