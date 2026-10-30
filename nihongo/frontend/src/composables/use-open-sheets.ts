import { computed, ref } from 'vue'

/**
 * How many bottom sheets are up, app-wide. A page with its own keyboard
 * shortcuts (Study's 1, 2, 3 and Enter) checks this so a key pressed inside a
 * sheet is the sheet's, not the page's behind it.
 */
const count = ref(0)

export const sheetOpen = computed(() => count.value > 0)

export function useOpenSheets() {
  return {
    opened() {
      count.value += 1
    },
    closed() {
      count.value = Math.max(0, count.value - 1)
    }
  }
}
