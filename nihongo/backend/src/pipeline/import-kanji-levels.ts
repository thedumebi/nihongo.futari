/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import { languages } from '@nihongo/shared/db/schema'
import { eq, sql } from 'drizzle-orm'

/**
 * Assign each kanji the level of the EASIEST word that uses it.
 *
 * A kanji is not inherently N2; it is first met in whatever word first needs
 * it. 日 appears in N1 vocabulary too, but you learn it at N5 — so the minimum
 * rank across the words containing it is the honest answer.
 *
 * Recomputed wholesale rather than set during vocabulary import, because the
 * importer only ever set the level on INSERT. Kanji already present from
 * `import:kanji` were therefore never levelled at all, leaving 1,381 of them
 * unreachable from any level-scoped query.
 *
 *   pnpm -C nihongo/backend import:kanji-levels
 */

async function main() {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing')

  // One statement: for every kanji, the level of the lowest-ranked published
  // word whose primary form contains that character.
  const assigned = await db.execute(sql`
    with best as (
      select k.id as kanji_id, min(l.rank) as rank
      from kanji k
      join words w
        on w.language_id = k.language_id
       and w.published
       and position(k.character in w.primary_form) > 0
      join language_levels l on l.id = w.level_id
      where k.language_id = ${language.id}
      group by k.id
    )
    update kanji k
    set level_id = l.id,
        published = true,
        updated_at = now()
    from best
    join language_levels l on l.rank = best.rank and l.language_id = ${language.id}
    where k.id = best.kanji_id
      and (k.level_id is distinct from l.id or not k.published)
    returning k.id
  `)

  const rows = await db.execute(sql`
    select l.code, count(k.id)::int as total
    from language_levels l
    left join kanji k on k.level_id = l.id
    where l.language_id = ${language.id}
    group by l.code, l.rank
    order by l.rank
  `)

  console.log(`Kanji re-levelled: ${assigned.rowCount ?? 0}`)
  for (const row of rows.rows as Array<{ code: string, total: number }>) {
    console.log(`  ${row.code}: ${row.total}`)
  }

  const orphans = await db.execute(sql`
    select count(*)::int as total from kanji
    where language_id = ${language.id} and level_id is null and published
  `)
  const count = (orphans.rows[0] as { total: number } | undefined)?.total ?? 0
  if (count > 0)
    console.log(`Published but unlevelled: ${count}`)
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
