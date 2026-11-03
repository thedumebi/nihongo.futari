import { REVIEW_KIND_TABLES } from '@nihongo/shared/constants'
import { PgDialect } from 'drizzle-orm/pg-core'
import { describe, expect, it, vi } from 'vitest'

import { MNEMONIC_TABLE, visibleToLearners } from './mnemonics.service.js'

// The filter is built from the schema alone; no connection is needed.
vi.mock('@nihongo/shared/db', () => ({ default: {} }))
vi.mock('@nihongo/shared', () => ({ pino: { warn: vi.fn() } }))
vi.mock('./catalogue.service.js', () => ({ languageByCode: vi.fn() }))

const dialect = new PgDialect()

describe('visibleToLearners', () => {
  const query = dialect.sqlToQuery(visibleToLearners())

  it('shows only published mnemonics meant for everyone', () => {
    expect(query.sql).toBe('("editorial"."mnemonics"."status" = $1 and "editorial"."mnemonics"."visibility" in ($2, $3))')
    expect(query.params).toEqual(['published', 'system', 'shared'])
  })

  it('never shows a learner\'s private mnemonic or an unreviewed draft', () => {
    expect(query.params).not.toContain('private')
    expect(query.params).not.toContain('in-review')
    expect(query.params).not.toContain('draft')
  })
})

describe('the review-queue table name', () => {
  it('is the one the queue\'s mnemonic kind filters on, so the Mnemonics tab finds what is queued', () => {
    expect(REVIEW_KIND_TABLES.mnemonic).toBe(MNEMONIC_TABLE)
  })
})
