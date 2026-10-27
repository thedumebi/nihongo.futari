import { describe, expect, it } from 'vitest'

import { statementLabel } from './timing.js'

describe('statementLabel', () => {
  it('blanks every kind of literal and keeps parameters and names', () => {
    expect(statementLabel(`select 'a@b.test', 'it''s', $1::text, "don't" as x`)).toBe(`select ?, ?, $1::text, "don't" as x`)
    expect(statementLabel(`select E'it\\'s a@b.test', e'\\\\', 1`)).toBe('select ?, ?, 1')
    expect(statementLabel('select $$a@b.test$$, $tag$it\'s$tag$, 2')).toBe('select ?, ?, 2')
    expect(statementLabel(`select 1 -- 'a@b.test\n, 2 /* it's */ , 3`)).toBe('select 1 , 2 , 3')
  })

  it('does not mistake a word ending in e for an escape string', () => {
    expect(statementLabel(`select date'2020-01-01', 'a@b.test'`)).toBe('select date?, ?')
  })

  it('cuts a long statement to its start and its FROM', () => {
    const label = statementLabel(`select ${Array.from({ length: 20 }, (_, i) => `"t"."column_${i}"`).join(', ')} from "srs_cards" where "user_id" = $1`)
    expect(label).toBe('select "t"."column_0", "t"."co … from "srs_cards" where "user_id" = $1')
  })
})
