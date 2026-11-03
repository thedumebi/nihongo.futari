import { describe, expect, it } from 'vitest'

import { sqlJsonb, sqlText } from './sql.js'

describe('seed SQL literals', () => {
  it('doubles single quotes inside a string literal', () => {
    expect(sqlText('it\'s 子供\'s')).toBe('\'it\'\'s 子供\'\'s\'')
  })

  it('writes a value as a jsonb literal, quotes escaped', () => {
    expect(sqlJsonb({ t: 'don\'t', r: 'し' })).toBe('\'{"t":"don\'\'t","r":"し"}\'::jsonb')
  })
})
