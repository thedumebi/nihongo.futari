import { computed, onMounted, ref } from 'vue'

import type { TourPage } from '@/components/tours/tours'

import { useAuthStore } from '@/store/auth'

/**
 * A page's tour: open on the first visit, put away for good once dismissed,
 * and back whenever its help button is pressed.
 *
 * Remembered on this device, per learner, as the onboarding flag is: a tour is
 * a convenience, and seeing it again on a new phone is no harm.
 */
export function usePageTour(page: TourPage) {
  const auth = useAuthStore()
  const open = ref(false)
  const key = computed(() => `go-tour:${page}:${auth.user?.id ?? 'guest'}`)

  function seen(): boolean {
    try {
      return localStorage.getItem(key.value) === '1'
    } catch {
      // Without storage there is no way to remember it, so do not insist.
      return true
    }
  }

  function dismiss() {
    open.value = false
    try {
      localStorage.setItem(key.value, '1')
    } catch {
      // Shown again next time; nothing worse.
    }
  }

  // The router settles the session before any page mounts, so the learner is
  // known by now and the key is theirs.
  onMounted(() => {
    if (!seen())
      open.value = true
  })

  return {
    open,
    show() {
      open.value = true
    },
    dismiss
  }
}
