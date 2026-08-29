import type { SearchResponse } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { collapseLongVowels, looksLikeRomaji, romajiToHiragana, toKatakana } from '@nihongo/shared/lib'
import { sql } from 'drizzle-orm'

/**
 * Dictionary search across words, kanji and grammar.
 *
 * Postgres cannot segment Japanese, so this does not pretend to: Japanese text
 * is matched by substring and trigram similarity, and only English glosses go
 * near a text-search configuration.
 *
 * Ranking is the part that matters. An exact match must always win, because
 * someone typing 山 wants 山 and not the forty words containing it. Everything
 * below that is ordered by similarity, then by how common the word is —
 * frequency is the tiebreak that makes the first hit usually right.
 */
export async function search(query: string, languageCode: string, limit: number): Promise<SearchResponse> {
  const q = query.trim()
  if (!q)
    return { query, hits: [], total: 0 }

  // Readings are stored in kana and people type romaji. Without this, "yama"
  // matched only glosses that happened to contain those letters — "Yamato
  // court" — and never 山 itself. Searched ALONGSIDE the raw query, never
  // instead of it, so an English word that is also valid romaji still works as
  // English.
  const kana = looksLikeRomaji(q) ? romajiToHiragana(q) : q
  // Loan words store their reading in KATAKANA — グラス, not ぐらす — so the
  // hiragana form alone never reaches them. "gurasu" has to try both.
  const katakana = looksLikeRomaji(q) ? collapseLongVowels(toKatakana(kana)) : q

  // A single UNION so ranking is global. Ranking each kind separately and
  // interleaving afterwards would put a weak kanji match above an exact word.
  const rows = await db.execute(sql`
    with lang as (select id from languages where code = ${languageCode} limit 1),
    word_hits as (
      select
        'word'::text as kind,
        w.id as key,
        w.primary_form as headword,
        w.primary_reading as reading,
        (select g->>'text'
           from word_senses s, jsonb_array_elements(s.glosses) g
          where s.word_id = w.id
          order by s.sort_index
          limit 1) as gloss,
        l.code as level,
        case
          when w.primary_form = ${q} or w.primary_reading = ${q} or w.primary_reading = ${kana}
            or w.primary_form = ${katakana} or w.primary_reading = ${katakana} then 1.0
          when w.primary_form like ${`${q}%`} or w.primary_reading like ${`${q}%`}
            or w.primary_reading like ${`${kana}%`}
            or w.primary_reading like ${`${katakana}%`} then 0.9
          -- An English query never resembles the Japanese form, so scoring only
          -- against form and reading left every gloss match near zero and put
          -- 尾 ("lower slope of mountain") above 山 for "mountain". Gloss
          -- matches are scored on their own terms: the headline sense beats a
          -- passing mention buried in a longer definition.
          when exists (
            select 1 from word_senses s
            where s.word_id = w.id and s.sort_index = 0
              and lower(s.glosses->0->>'text') = lower(${q})
          ) then 0.97
          when exists (
            select 1 from word_senses s
            where s.word_id = w.id and s.sort_index = 0 and s.glosses::text ilike ${`%${q}%`}
          ) then 0.8
          when exists (
            select 1 from word_senses s
            where s.word_id = w.id and s.glosses::text ilike ${`%${q}%`}
          ) then 0.65
          else greatest(similarity(w.primary_form, ${q}), similarity(w.primary_reading, ${q}))
        end as score,
        w.is_common as common
      from words w
      cross join lang
      left join language_levels l on l.id = w.level_id
      where w.language_id = lang.id
        and w.published
        and (
          w.primary_form ilike ${`%${q}%`}
          or w.primary_reading ilike ${`%${q}%`}
          or w.primary_reading ilike ${`%${kana}%`}
          or w.primary_reading ilike ${`%${katakana}%`}
          or exists (
            select 1 from word_senses s
            where s.word_id = w.id and s.glosses::text ilike ${`%${q}%`}
          )
        )
    ),
    kanji_hits as (
      select
        'kanji'::text, k.character, k.character,
        null::text,
        (select string_agg(m->>'gloss', ', ')
           from jsonb_array_elements(k.meanings) m
          where m->>'lang' = 'en') as gloss,
        l.code,
        case
          when k.character = ${q} then 1.0
          -- A kanji whose headline meaning IS the query outranks one that
          -- merely mentions it somewhere in a list of six glosses.
          when lower(k.meanings->0->>'gloss') = lower(${q}) then 0.85
          else 0.5
        end as score,
        true as common
      from kanji k
      cross join lang
      left join language_levels l on l.id = k.level_id
      where k.language_id = lang.id
        and k.published
        and (k.character ilike ${`%${q}%`} or k.meanings::text ilike ${`%${q}%`})
    ),
    grammar_hits as (
      select
        'grammar'::text, g.slug, g.title, g.pattern, g.meaning_short, l.code,
        case when g.title = ${q} then 1.0 else 0.6 end as score,
        true as common
      from grammar_points g
      cross join lang
      left join language_levels l on l.id = g.level_id
      where g.language_id = lang.id
        and (g.title ilike ${`%${q}%`} or g.meaning_short ilike ${`%${q}%`})
    )
    select * from (
      select * from word_hits
      union all select * from kanji_hits
      union all select * from grammar_hits
    ) hits
    order by score desc, common desc, headword
    limit ${limit}
  `)

  return {
    query: q,
    hits: (rows.rows as Array<Record<string, unknown>>).map(r => ({
      kind: r.kind as 'word' | 'kanji' | 'grammar',
      key: String(r.key),
      headword: String(r.headword),
      reading: r.reading === null ? null : String(r.reading),
      gloss: r.gloss === null ? null : String(r.gloss),
      level: r.level === null ? null : String(r.level),
      score: Number(r.score)
    })),
    total: rows.rows.length
  }
}
