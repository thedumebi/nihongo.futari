import type { AttributionResponse } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { importSources } from '@nihongo/shared/db/schema'
import { asc, eq } from 'drizzle-orm'

/**
 * The datasets this app is built from, and their licence terms.
 *
 * Read from `import_sources` — the same rows the import pipeline uses — so the
 * page cannot drift from what actually shipped. A hand-written list would.
 */
export async function listAttribution(): Promise<AttributionResponse> {
  const rows = await db
    .select({
      code: importSources.code,
      name: importSources.name,
      url: importSources.url,
      homepage: importSources.homepage,
      license: importSources.license,
      attributionText: importSources.attributionText
    })
    .from(importSources)
    .where(eq(importSources.active, true))
    .orderBy(asc(importSources.name))

  return { sources: rows }
}
