import { computed, ref } from 'vue'

export function usePagination(initialLimit = 10) {
  const page = ref(1)
  const limit = ref(initialLimit)
  const total = ref(0)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))

  function next() {
    if (page.value < totalPages.value)
      page.value += 1
  }
  function prev() {
    if (page.value > 1)
      page.value -= 1
  }
  function reset() {
    page.value = 1
  }

  return { page, limit, total, totalPages, next, prev, reset }
}
