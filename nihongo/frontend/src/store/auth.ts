import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { syncTimezone } from '@/api/notifications'
import { authClient } from '@/lib/auth-client'

interface SessionUser {
  id: string
  email: string
  name: string
  image?: string | null
  role?: string
  timezone?: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<SessionUser | null>(null)
  const isAuthenticated = computed(() => user.value != null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  /** Whether the session has been asked about at least once this page load. */
  const ready = ref(false)
  /** The in-flight request, so concurrent callers share one round trip. */
  let inflight: Promise<void> | null = null

  /**
   * Find out who, if anyone, is signed in.
   *
   * Cached after the first call: the router asks on every navigation, and a
   * round trip per route change would be a needless cost on an app people move
   * around inside constantly. Pass `force` after signing in or out, when the
   * answer is known to have changed.
   */
  async function syncSession(force = false): Promise<void> {
    if (!force && ready.value)
      return
    if (!force && inflight)
      return inflight

    inflight = (async () => {
      const { data } = await authClient.getSession()
      // getSession returns `undefined` (not `null`) when there's no session —
      // coalesce so `isAuthenticated` doesn't read undefined as "signed in".
      user.value = (data?.user as SessionUser | undefined) ?? null
      ready.value = true

      // A reminder hour is meaningless without the zone it is measured in, and
      // nothing else in the app ever set it. Fire and forget — nothing on
      // screen waits for it.
      if (user.value)
        void syncTimezone()
    })()

    try {
      await inflight
    } finally {
      inflight = null
    }
  }

  async function logout() {
    await authClient.signOut()
    user.value = null
    ready.value = true
  }

  return { user, isAuthenticated, isAdmin, ready, syncSession, logout }
})
