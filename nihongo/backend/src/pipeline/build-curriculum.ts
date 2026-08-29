/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import { sql } from 'drizzle-orm'

/**
 * Put the corpus in a teaching order.
 *
 * `study_items.sort_index` was set per kind, and the ranges overlap — words run
 * to 102789 while kana stop at 1070 — so ordering the whole corpus by it
 * interleaved the kinds arbitrarily. A complete beginner's first cards were
 * ああ, 一, あっ, うろうろ and a full sentence. There was no progression because
 * nothing put the material in an order.
 *
 * This rewrites sort_index as a position WITHIN a level, so that ordering by
 * (level, sort_index) is a curriculum.
 *
 * The rule: every kind advances at the same relative pace. Each item gets its
 * position within its own kind, normalised to 0..1, and everything is sorted by
 * that. You meet common words, common kanji and early grammar together rather
 * than finishing one pile before starting the next — which is how a course
 * works and is not how a filtered corpus behaves.
 *
 * Each kind occupies a span of the level, because some genuinely depend on
 * others and one of them has to finish before the rest get going:
 *
 *   kana      0.00–0.06  the writing system comes before anything written in
 *                        it, and there are only 142 of them — spread over the
 *                        whole level, the last kana arrived after 2,800 other
 *                        cards, which is not learning an alphabet
 *   grammar   0.05–1.00  a sentence needs a pattern as much as it needs words
 *   word      0.05–1.00
 *   kanji     0.12–1.00  slightly after words, so the first kanji you meet are
 *                        ones you have already met inside a word
 *   sentence  0.35–1.00  rebuilding a sentence is pointless without vocabulary
 *   dialogue  0.45–1.00  a conversation needs its words and patterns known
 *                        first, or every turn is four unknowns and a guess
 *
 * Within a kind the order is the best evidence available: kana by their
 * gojūon index, words and kanji by frequency rank, grammar by the order its
 * seed files set. Items with no rank sort last — they are the rare tail, and
 * inventing a number for them would sort them against measured ones as if it
 * meant something.
 *
 *   pnpm -C nihongo/backend build:curriculum
 */

/** The slice of the level each kind occupies, as fractions. */
const SPAN: Record<string, [number, number]> = {
  kana: [0, 0.06],
  grammar: [0.05, 1],
  word: [0.05, 1],
  kanji: [0.12, 1],
  sentence: [0.35, 1],
  // Last of all. A conversation needs the words and the patterns in it to be
  // familiar already, or every turn is four unknowns and a guess.
  dialogue: [0.45, 1]
}

async function main() {
  const levels = await db.execute(sql`
    select id, code from language_levels order by sort_index
  `)

  let total = 0
  for (const row of (levels.rows ?? []) as Array<Record<string, unknown>>) {
    const levelId = String(row.id)
    const code = String(row.code)

    // One pass per level. `position` is the item's rank within its own kind,
    // and `span` that kind's size, so position/span is the normalised 0..1.
    const result = await db.execute(sql`
      with ranked as (
        select
          si.id,
          si.kind,
          row_number() over (
            partition by si.kind
            order by
              -- Kana follow the gojūon order they are always taught in.
              ka.order_index asc nulls last,
              -- Words and kanji by frequency; unranked ones last.
              w.frequency_rank asc nulls last,
              k.frequency_rank asc nulls last,
              -- Grammar keeps the order its seeds set.
              g.sort_index asc nulls last,
              si.sort_index asc,
              si.id asc
          ) as position,
          count(*) over (partition by si.kind) as span
        from study_items si
        left join kana ka on ka.id = si.kana_id
        left join kanji k on k.id = si.kanji_id
        left join words w on w.id = si.word_id
        left join grammar_points g on g.id = si.grammar_point_id
        where si.level_id = ${levelId}
      ),
      placed as (
        select
          id,
          -- The kind's own 0..1 position, mapped onto its slice of the level.
          ${sql.raw(spanCase(0))}
            + (${sql.raw(spanCase(1))} - ${sql.raw(spanCase(0))})
              * (position::float / greatest(span, 1))
            as slot
        from ranked
      )
      update study_items t
      set sort_index = o.ordinal, updated_at = now()
      from (
        select id, row_number() over (order by slot, id) as ordinal
        from placed
      ) o
      where t.id = o.id and t.sort_index is distinct from o.ordinal
    `)

    const changed = result.rowCount ?? 0
    total += changed
    console.log(`${code}: ${changed} items reordered`)
  }

  console.log(`\nTotal reordered: ${total}`)
}

/**
 * One end of the per-kind span, as a SQL CASE over `kind`.
 *
 * A kind not listed in SPAN falls back to the middle of the level rather than
 * the start, so a content type added later cannot silently jump the queue.
 */
function spanCase(edge: 0 | 1): string {
  const arms = Object.entries(SPAN)
    .map(([kind, span]) => `when '${kind}' then ${span[edge]}`)
    .join(' ')
  return `(case kind ${arms} else ${edge === 0 ? 0.5 : 1} end)`
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
