import { useLocalStorage } from '@vueuse/core'

/**
 * The JLPT level the reader is working at, shared across the whole app.
 *
 * It used to be per-page: Study persisted its choice, Grammar kept a plain
 * `ref('')` that reset on every visit, and Progress was hardcoded to N5. So
 * picking N5 to drill told the rest of the app nothing, and Progress would
 * happily report on a level you were not studying.
 *
 * One `localStorage` key behind one composable. `useLocalStorage` is reactive
 * and shared, so a change in any picker updates every other page that is
 * mounted — and survives a reload, and syncs across tabs.
 *
 * Empty string means "every level", which is what the Study and Grammar
 * pickers already meant by their "All" option. Anywhere that cannot show
 * everything at once — Progress reports on one level at a time — should fall
 * back to a default of its own rather than sending an empty filter.
 */
const STORAGE_KEY = 'go-level'

export function useLevel() {
  const level = useLocalStorage(STORAGE_KEY, '')

  /** For pages that must name exactly one level. */
  const levelOrDefault = (fallback = 'N5') => level.value || fallback

  return { level, levelOrDefault }
}
