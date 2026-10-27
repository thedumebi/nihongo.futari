import { PgDialect } from 'drizzle-orm/pg-core'
import { describe, expect, it, vi } from 'vitest'

import { UNCONFIRMED_ACCOUNT_TTL_HOURS, unconfirmedAccountsFilter } from './users.service.js'

// The filter is built from the schema alone; no connection is needed.
vi.mock('@nihongo/shared/db', () => ({ default: {} }))

const dialect = new PgDialect()

describe('unconfirmedAccountsFilter', () => {
  const now = new Date('2026-10-26T12:00:00.000Z')
  const query = dialect.sqlToQuery(unconfirmedAccountsFilter(now)!)

  it('keeps confirmed accounts, newer accounts and admins', () => {
    expect(query.sql).toBe('("auth"."users"."email_verified" = $1 and "auth"."users"."created_at" < $2 and "auth"."users"."role" <> $3)')
  })

  it('takes only unconfirmed, non-admin accounts', () => {
    expect(query.params[0]).toBe(false)
    expect(query.params[2]).toBe('admin')
  })

  it('cuts off exactly the TTL before now', () => {
    expect(UNCONFIRMED_ACCOUNT_TTL_HOURS).toBe(24)
    expect(query.params[1]).toBe('2026-10-25T12:00:00.000Z')
  })
})
