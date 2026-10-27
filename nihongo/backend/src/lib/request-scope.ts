import type { MiddlewareHandler } from 'hono'

import { AsyncLocalStorage } from 'node:async_hooks'

/**
 * Reads shared by everything one request does. Opening Today asks for the
 * learner's timezone six times over, from services that each need it and
 * know nothing of each other; inside a request the answer cannot change, so
 * it is asked once.
 *
 * Only reads open a scope: a request that writes may change what it reads
 * next, and must see the change.
 */
const scope = new AsyncLocalStorage<Map<string, Promise<unknown>>>()

export const requestScope: MiddlewareHandler = (c, next) =>
  c.req.method === 'GET' || c.req.method === 'HEAD' ? scope.run(new Map(), next) : next()

/**
 * `load()` once per request under `key`, shared by every caller in it; called
 * afresh outside one. A key is always used with the same `T`. A failed load is
 * not kept, so a later caller tries again.
 */
export function perRequest<T>(key: string, load: () => Promise<T>): Promise<T> {
  const memo = scope.getStore()
  if (!memo)
    return load()
  const held = memo.get(key)
  if (held)
    return held as Promise<T>
  const loading = load()
  memo.set(key, loading)
  loading.catch(() => memo.delete(key))
  return loading
}

/** Run `fn` in a fresh scope, as a GET request does. For tests and scripts. */
export function inRequestScope<T>(fn: () => Promise<T>): Promise<T> {
  return scope.run(new Map(), fn)
}
