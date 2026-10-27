import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'

import { inRequestScope, perRequest, requestScope } from './request-scope.js'

describe('perRequest', () => {
  it('loads once for every caller in a request', async () => {
    let loads = 0
    const load = async () => ++loads
    const results = await inRequestScope(() => Promise.all([perRequest('k', load), perRequest('k', load), perRequest('k', load)]))
    expect(results).toEqual([1, 1, 1])
    expect(loads).toBe(1)
  })

  it('loads afresh in each request, and every time outside one', async () => {
    let loads = 0
    const load = async () => ++loads
    expect(await inRequestScope(() => perRequest('k', load))).toBe(1)
    expect(await inRequestScope(() => perRequest('k', load))).toBe(2)
    expect(await perRequest('k', load)).toBe(3)
    expect(await perRequest('k', load)).toBe(4)
  })

  it('does not keep a failed load, so the next caller tries again', async () => {
    let calls = 0
    const load = async () => {
      if (++calls === 1)
        throw new Error('down')
      return calls
    }
    const second = await inRequestScope(async () => {
      await expect(perRequest('k', load)).rejects.toThrow('down')
      return perRequest('k', load)
    })
    expect(second).toBe(2)
  })

  it('shares within a GET, and not within a request that writes', async () => {
    const app = new Hono()
    app.use(requestScope)
    let loads = 0
    const twice = async () => {
      await perRequest('k', async () => ++loads)
      await perRequest('k', async () => ++loads)
      return loads
    }
    app.get('/', async c => c.json(await twice()))
    app.post('/', async c => c.json(await twice()))
    expect(await (await app.request('/')).json()).toBe(1)
    expect(await (await app.request('/', { method: 'POST' })).json()).toBe(3)
  })
})
