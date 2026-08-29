import { text, timestamp } from 'drizzle-orm/pg-core'

/** Every table gets these. */
export const timestamps = {
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}

/** Text UUID primary key, matching the sibling repos' idiom. */
export function primaryId() {
  return text('id').primaryKey().$defaultFn(() => crypto.randomUUID())
}
