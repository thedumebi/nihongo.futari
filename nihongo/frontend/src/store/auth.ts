import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { authClient } from '@/lib/auth-client'

interface SessionUser {
  id: string
  email: string
  name: string
  image?: string | null
  role?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<SessionUser | null>(null)
  const isAuthenticated = computed(() => user.value != null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function syncSession() {
    const { data } = await authClient.getSession()
    // getSession returns `undefined` (not `null`) when there's no session —
    // coalesce so `isAuthenticated` doesn't read undefined as "signed in".
    user.value = (data?.user as SessionUser | undefined) ?? null
  }

  async function logout() {
    await authClient.signOut()
    user.value = null
  }

  return { user, isAuthenticated, isAdmin, syncSession, logout }
})
