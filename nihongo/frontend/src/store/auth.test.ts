import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from './auth'

const getSession = vi.fn()
const replace = vi.fn()
const route = { value: { meta: { requiresAuth: true }, fullPath: '/study' } }

vi.mock('@/lib/auth-client', () => ({ authClient: { getSession: () => getSession(), signOut: vi.fn() } }))
vi.mock('@/api/notifications', () => ({ syncTimezone: vi.fn() }))
vi.mock('@/api/onboarding', () => ({}))
vi.mock('@/router/index', () => ({ default: { currentRoute: route, replace: (to: unknown) => replace(to) } }))

const AKI = { id: 'u1', email: 'aki@example.test', name: 'Aki', role: 'user' }

/** A getSession that answers only when told to. */
function pendingSession() {
  let answer: (value: unknown) => void = () => {}
  getSession.mockReturnValueOnce(new Promise((resolve) => {
    answer = resolve
  }))
  return (value: unknown) => answer(value)
}

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    getSession.mockReset()
    replace.mockReset()
  })

  it('asks the server when the device remembers no one, and remembers who answers', async () => {
    getSession.mockResolvedValueOnce({ data: { user: AKI }, error: null })
    const auth = useAuthStore()
    await auth.syncSession()
    expect(auth.user).toEqual(AKI)
    expect(JSON.parse(localStorage.getItem('go-session-user') ?? 'null')).toEqual(AKI)
  })

  it('answers from memory at once, and confirms with the server behind it', async () => {
    localStorage.setItem('go-session-user', JSON.stringify(AKI))
    const answer = pendingSession()
    const auth = useAuthStore()
    await auth.syncSession()
    expect(auth.user).toEqual(AKI)
    expect(getSession).toHaveBeenCalledTimes(1)

    answer({ data: { user: { ...AKI, name: 'Aki T' } }, error: null })
    await vi.waitFor(() => expect(auth.user?.name).toBe('Aki T'))
  })

  it('leaves a page drawn from memory once the server says the session is gone', async () => {
    localStorage.setItem('go-session-user', JSON.stringify(AKI))
    localStorage.setItem('go-onboarded:u1', '1')
    getSession.mockResolvedValueOnce({ data: null, error: null })
    const auth = useAuthStore()
    await auth.syncSession()
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith({ name: 'login', query: { redirect: '/study' } }))
    expect(auth.user).toBeNull()
    expect(localStorage.getItem('go-session-user')).toBeNull()
    expect(localStorage.getItem('go-onboarded:u1')).toBeNull()
  })

  it('keeps the remembered learner when the server cannot be reached', async () => {
    localStorage.setItem('go-session-user', JSON.stringify(AKI))
    getSession.mockResolvedValue({ data: null, error: { status: 0, message: 'offline' } })
    const auth = useAuthStore()
    await auth.syncSession()
    // Still unconfirmed, so this asks again, and is still offline.
    await auth.confirmSession()
    expect(getSession).toHaveBeenCalledTimes(2)
    expect(auth.user).toEqual(AKI)
    expect(replace).not.toHaveBeenCalled()
  })

  it('keeps the remembered learner when asking throws rather than answers', async () => {
    localStorage.setItem('go-session-user', JSON.stringify(AKI))
    getSession.mockRejectedValue(new TypeError('Failed to fetch'))
    const auth = useAuthStore()
    await auth.syncSession()
    expect(await auth.confirmSession()).toBe(false)
    expect(auth.user).toEqual(AKI)
  })

  it('drops a background answer overtaken by a sign-in', async () => {
    localStorage.setItem('go-session-user', JSON.stringify(AKI))
    const stale = pendingSession()
    const auth = useAuthStore()
    await auth.syncSession()

    const BEN = { id: 'u2', email: 'ben@example.test', name: 'Ben', role: 'user' }
    getSession.mockResolvedValueOnce({ data: { user: BEN }, error: null })
    await auth.syncSession(true)
    stale({ data: null, error: null })
    await Promise.resolve()
    await Promise.resolve()
    expect(auth.user).toEqual(BEN)
    expect(replace).not.toHaveBeenCalled()
  })

  it('forgets a remembered entry that is not a whole user', async () => {
    localStorage.setItem('go-session-user', JSON.stringify({ id: 'u1' }))
    const answer = pendingSession()
    const auth = useAuthStore()
    const synced = auth.syncSession()
    expect(auth.user).toBeNull()
    answer({ data: { user: AKI }, error: null })
    await synced
    expect(auth.user).toEqual(AKI)
  })

  it('makes an admin page wait for the server, not the remembered role', async () => {
    localStorage.setItem('go-session-user', JSON.stringify({ ...AKI, role: 'admin' }))
    const answer = pendingSession()
    const auth = useAuthStore()
    await auth.syncSession()
    expect(auth.isAdmin).toBe(true)

    const confirmed = auth.confirmSession()
    answer({ data: { user: AKI }, error: null })
    await confirmed
    expect(auth.isAdmin).toBe(false)
  })
})
