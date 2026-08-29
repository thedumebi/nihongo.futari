import { describe, expect, it } from 'vitest'

import { PaginationQuerySchema } from './base.js'

describe('paginationQuerySchema', () => {
  it('applies defaults', () => {
    const result = PaginationQuerySchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
  })

  it('coerces string query params to numbers', () => {
    const result = PaginationQuerySchema.parse({ page: '3', limit: '25' })
    expect(result.page).toBe(3)
    expect(result.limit).toBe(25)
  })

  it('clamps limit to a max of 100', () => {
    expect(() => PaginationQuerySchema.parse({ limit: '500' })).toThrow()
  })

  it('rejects page below 1', () => {
    expect(() => PaginationQuerySchema.parse({ page: '0' })).toThrow()
  })

  it('passes through optional keyword and tagId', () => {
    const result = PaginationQuerySchema.parse({ keyword: 'vue', tagId: 'abc' })
    expect(result.keyword).toBe('vue')
    expect(result.tagId).toBe('abc')
  })
})
