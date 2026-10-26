import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { syncTimezone } from '@/api/notifications'
import { authClient } from '@/lib/auth-client'
import { forgetLastToday } from '@/lib/last-today'

import { useOnboardingStore } from './onboarding'

interface SessionUser {
  id: string
  email: string
  name: string
  image?: string | null
  role?: string
  timezone?: string | null
}

/**
 * Who was signed in on this device last time, so opening the app does not
 * wait on a round trip to find out. The session cookie is what actually signs
 * requests in; this only lets the first screen draw while the server confirms
 * it. Cleared whenever the server says nobody is signed in, and on sign-out.
 */
const REMEMBERED = 'go-session-user'

/** Enough of a user to draw a first screen for; anything less is asked for. */
function isSessionUser(value: unknown): value is SessionUser {
  return value !== null && typeof value === 'object'
    && 'id' in value && typeof value.id === 'string'
    && 'email' in value && typeof value.email === 'string'
    && 'name' in value && typeof value.name === 'string'
}

function readRemembered(): SessionUser | null {
  try {
    const saved = localStorage.getItem(REMEMBERED)
    const parsed: unknown = saved ? JSON.parse(saved) : null
    return isSessionUser(parsed) ? parsed : null
  } catch {
    return null
  }
}

function remember(user: SessionUser | null): void {
  try {
    if (user)
      localStorage.setItem(REMEMBERED, JSON.stringify(user))
    else
      localStorage.removeItem(REMEMBERED)
  } catch {
    // Without storage the app asks the server first, as it always did.
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<SessionUser | null>(null)
  const isAuthenticated = computed(() => user.value != null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  /** Whether the session has been asked about at least once this page load. */
  const ready = ref(false)
  /** Whether the server itself has answered, rather than this device's memory. */
  let confirmed = false
  /** The in-flight request, so concurrent callers share one round trip. */
  let inflight: Promise<void> | null = null
  /**
   * Bumped by every request and every local sign-out. An answer that arrives
   * after a newer request, or after the learner signed out here, is about a
   * session that no longer matters, and is dropped rather than undoing it.
   */
  let generation = 0

  /** A page that needs an account, left once the server says there is none. */
  async function leaveSignedOutPage(): Promise<void> {
    const { default: router } = await import('@/router/index')
    const here = router.currentRoute.value
    if (here.meta.requiresAuth || here.meta.isAdmin)
      await router.replace({ name: 'login', query: { redirect: here.fullPath } })
  }

  async function getSession() {
    try {
      return await authClient.getSession()
    } catch (error) {
      return { data: null, error }
    }
  }

  async function fetchSession(asked: number): Promise<void> {
    const { data, error } = await getSession()
    if (asked !== generation)
      return
    // Offline, most likely: keep the learner this device remembered rather
    // than signing them out of a session that may be perfectly good.
    if (error && user.value)
      return
    const shown = user.value
    // getSession returns `undefined` (not `null`) when there's no session —
    // coalesce so `isAuthenticated` doesn't read undefined as "signed in".
    user.value = (data?.user as SessionUser | undefined) ?? null
    ready.value = true
    if (error)
      return
    confirmed = true
    remember(user.value)
    if (user.value) {
      // A reminder hour is meaningless without the zone it is measured in,
      // and nothing else in the app ever set it. Fire and forget — nothing on
      // screen waits for it.
      void syncTimezone()
      return
    }
    // The server says nobody is signed in (expired, or signed out on another
    // device): drop what this device saved for whoever was, and leave a page
    // drawn for them from memory.
    if (!shown) {
      forgetLastToday()
      return
    }
    forgetLocally()
    // Not awaited: an admin guard waiting on this answer must not also wait
    // on a navigation of its own.
    leaveSignedOutPage().catch(() => {})
  }

  /** One request at a time; `fresh` starts a new one even if one is running. */
  function ask(fresh = false): Promise<void> {
    if (inflight && !fresh)
      return inflight
    const request = fetchSession(++generation).finally(() => {
      if (inflight === request)
        inflight = null
    })
    inflight = request
    return request
  }

  /**
   * Find out who, if anyone, is signed in.
   *
   * Cached after the first call: the router asks on every navigation, and a
   * round trip per route change would be a needless cost on an app people move
   * around inside constantly. The first call answers from this device's memory
   * when it has one, and asks the server in the background. Pass `force` after
   * signing in or out, when the answer is known to have changed.
   */
  async function syncSession(force = false): Promise<void> {
    if (force)
      return ask(true)
    if (ready.value)
      return
    const remembered = inflight ? null : readRemembered()
    if (remembered) {
      user.value = remembered
      ready.value = true
      // Errors are handled inside: offline keeps the remembered learner.
      ask().catch(() => {})
      return
    }
    return ask()
  }

  /**
   * The server's answer, not the remembered one: for pages that grant more
   * than a learner's own, where a role this device remembers is not enough.
   * False when the server could not be reached to say.
   */
  async function confirmSession(): Promise<boolean> {
    if (!confirmed)
      await ask()
    // The request awaited may have been overtaken by a newer one.
    if (!confirmed && inflight)
      await inflight
    return confirmed
  }

  async function logout() {
    try {
      await authClient.signOut()
    } finally {
      forgetLocally()
    }
  }

  /**
   * Drop everything this browser holds for the learner. On its own after an
   * account is deleted: there is no session left to sign out of.
   */
  function forgetLocally() {
    generation++
    user.value = null
    ready.value = true
    remember(null)
    // This learner's cached API responses must not outlive their session.
    navigator.serviceWorker?.controller?.postMessage({ type: 'CLEAR_USER_CACHES' })
    // Nor where they were with onboarding, or their day: the next person here
    // is someone else.
    useOnboardingStore().reset()
    forgetLastToday()
  }

  return { user, isAuthenticated, isAdmin, ready, syncSession, confirmSession, logout, forgetLocally }
})
