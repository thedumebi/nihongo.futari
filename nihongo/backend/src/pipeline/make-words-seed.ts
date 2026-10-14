/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import { words } from '@nihongo/shared/db/schema'
import { hasKanji } from '@nihongo/shared/lib'
import { inArray } from 'drizzle-orm'
import { readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { JmdictEntry } from './sources/jmdict.js'

import { glossary, glossLine } from '../services/glossary.service.js'
import { READINGS } from './data/readings/index.js'
import { DATASETS, ensureDataset } from './fetch.js'
import { frequencyRank, parseJmdict } from './sources/jmdict.js'

/**
 * Add to the dictionary the words the read-aloud speeches use and it lacks.
 *
 *   pnpm -C nihongo/backend seed:words
 *
 * The published dictionary is the JLPT vocabulary lists, 8,240 words. Real
 * speeches use words outside them — それから, しかし, 新郎, 部署 — and those
 * came out untappable or cut into pieces. The author's reading marks each word,
 * so the words the speeches need are known exactly: this finds every one the
 * dictionary cannot match whole, looks it up in JMdict (the dictionary jisho.org
 * is built on, and the one this app already imports), and writes a seed.
 *
 * Deliberately NOT the whole of JMdict. The glossary is longest-match over
 * every published spelling, and its rare entries hijack common strings — いい
 * as 飯 "rice", どうか as 銅貨 "copper coin". Adding only words a speech
 * actually uses keeps that from growing.
 *
 * Dictionary only: no study items. A word with no level would be served to
 * every learner as a new card, and deciding where these belong in the course
 * is a curriculum choice, not a side effect of a speech using them. So they
 * can be tapped and read, but not added to reviews.
 *
 * A NEW numbered seed each run, idempotent like the rest: ON CONFLICT DO
 * NOTHING keyed on JMdict's ent_seq, so a word that is already in the
 * dictionary is never touched.
 */

const SEEDS = path.resolve(process.cwd(), 'src/db/seeds')
const LANGUAGE = 'lang-ja'
const LETTERS = /^\p{L}+$/u

/**
 * Kana that could be several words, pinned to the one the speeches mean.
 *
 * さい alone is 歳 "years old", 才, 際, 犀 and 妻 — the speeches only ever say
 * how old someone is.
 */
const KANA_MEANS: Record<string, string> = {
  さい: '歳'
}

/**
 * Matches that are the wrong word for how the speeches use them, checked by
 * hand. Left out, they stay split with their parts listed, which is honest;
 * added, they would gloss confidently and wrongly.
 *
 *   山本     a surname here, not "foot of a mountain"
 *   一つ目   "the first", not "one-eyed"; 三つ目 likewise
 *   かも     the かもしれない "maybe", not "duck"
 *   みたい   してみたい "want to try", not "-like"
 *   正しく   正しくする "make right", not "certainly"
 *   作り方   "how to make", not "style of building"
 *   お話し   humble "talk", not "story"
 *   かさ     an umbrella (傘), not a pine "cone"
 *   あし     a foot or leg (足), not "common reed"
 */
const WRONG_SENSE = new Set(['山本', '一つ目', '三つ目', 'かも', 'みたい', '正しく', '作り方', 'お話し', 'かさ', 'あし'])

const q = (value: string) => `'${value.replace(/'/g, '\'\'')}'`
const arr = (values: string[]) => values.length === 0 ? `'{}'::text[]` : `ARRAY[${values.map(q).join(', ')}]::text[]`

/** Every word an author wrote as one that the dictionary cannot match whole. */
async function wanted(): Promise<Map<string, string>> {
  const g = await glossary('ja')
  const found = new Map<string, string>()
  for (const reading of READINGS) {
    for (const line of reading.stanzas.flat()) {
      const tokens = glossLine(line.t, g, line.r)
      let group: typeof tokens = []
      const flush = () => {
        const surface = group.map(t => t.t).join('')
        if (group.length > 1 && LETTERS.test(surface) && !g.byForm.has(surface) && !found.has(surface) && !WRONG_SENSE.has(surface))
          found.set(surface, `${reading.code}: ${line.t}`)
        group = []
      }
      for (const token of tokens) {
        if (!LETTERS.test(token.t) || token.r === undefined || /^\s/u.test(token.r))
          flush()
        if (LETTERS.test(token.t) && token.r !== undefined)
          group.push(token)
      }
      flush()
    }
  }
  return found
}

function score(entry: JmdictEntry): number {
  const common = entry.kanji.some(k => k.common) || entry.readings.some(r => r.common)
  const ranks = [...entry.kanji, ...entry.readings].map(f => frequencyRank(f.tags)).filter((v): v is number => v !== undefined)
  return (common ? 0 : 1_000_000) + (ranks.length > 0 ? Math.min(...ranks) : 500_000)
}

/** Whether this entry is the word `surface` names. */
function matches(entry: JmdictEntry, surface: string): boolean {
  const pinned = KANA_MEANS[surface]
  if (pinned)
    return entry.kanji.some(k => k.form === pinned) && entry.readings.some(r => r.form === surface)
  if (hasKanji(surface))
    return entry.kanji.some(k => k.form === surface)
  // Kana: only a word that is genuinely written that way — a kana headword, or
  // one JMdict marks as usually written in kana. Otherwise every reading of
  // every kanji word would be a candidate, which is the homophone problem.
  return entry.readings.some(r => r.form === surface)
    && (entry.kanji.length === 0 || (entry.senses[0]?.misc ?? []).includes('uk'))
}

async function main(): Promise<void> {
  const need = await wanted()
  console.log(`${need.size} words the speeches use that the dictionary cannot match whole`)

  const jm = await ensureDataset(DATASETS.jmdict)
  const best = new Map<string, JmdictEntry>()
  await parseJmdict(jm.filePath, (entry) => {
    for (const surface of need.keys()) {
      if (!matches(entry, surface))
        continue
      const current = best.get(surface)
      if (!current || score(entry) < score(current))
        best.set(surface, entry)
    }
  })

  const existing = new Set((await db
    .select({ entSeq: words.entSeq })
    .from(words)
    .where(inArray(words.entSeq, [...best.values()].map(e => e.entSeq)))).map(r => r.entSeq))

  const statements: string[] = []
  const added: string[] = []
  for (const [surface, where] of need) {
    const entry = best.get(surface)
    if (!entry) {
      console.log(`  - not in JMdict (an inflection or a name): ${surface}   [${where}]`)
      continue
    }
    if (existing.has(entry.entSeq)) {
      console.log(`  = already in the dictionary under another spelling: ${surface} (ent_seq ${entry.entSeq}) — needs a KANA_SPELLED entry`)
      continue
    }

    const id = `w-jmdict-${entry.entSeq}`
    const primaryForm = hasKanji(surface) ? surface : (KANA_MEANS[surface] ?? surface)
    const primaryReading = entry.readings[0]?.form ?? surface
    const common = entry.kanji.some(k => k.common) || entry.readings.some(r => r.common)
    const ranks = [...entry.kanji, ...entry.readings].map(f => frequencyRank(f.tags)).filter((v): v is number => v !== undefined)
    added.push(`${surface} → ${entry.senses[0]?.glosses.slice(0, 2).join('; ')}`)

    statements.push(`-- ${surface} · ${entry.senses[0]?.glosses[0] ?? ''}
INSERT INTO words (id, language_id, ent_seq, primary_form, primary_reading, frequency_rank, is_common, published, source_id, source_ref, source_hash)
VALUES (${q(id)}, ${q(LANGUAGE)}, ${entry.entSeq}, ${q(primaryForm)}, ${q(primaryReading)}, ${ranks.length > 0 ? Math.min(...ranks) : 'NULL'}, ${common}, true, 'imp-jmdict', ${q(String(entry.entSeq))}, ${q(`${entry.entSeq}:${entry.senses.length}`)})
ON CONFLICT (language_id, ent_seq) DO NOTHING;`)

    const forms = [
      ...entry.kanji.map((k, i) => `  (${q(`${id}-k${i}`)}, ${q(id)}, ${q(k.form)}, 'kanji', ${k.common}, ${arr(k.tags)}, ${i})`),
      ...entry.readings.map((r, i) => `  (${q(`${id}-r${i}`)}, ${q(id)}, ${q(r.form)}, 'kana', ${r.common}, ${arr(r.tags)}, ${100 + i})`)
    ]
    statements.push(`INSERT INTO word_forms (id, word_id, form, kind, is_common, tags, sort_index)
SELECT v.* FROM (VALUES
${forms.join(',\n')}
) AS v(id, word_id, form, kind, is_common, tags, sort_index)
WHERE EXISTS (SELECT 1 FROM words WHERE id = ${q(id)})
ON CONFLICT (id) DO NOTHING;`)

    const senses = entry.senses.map((s, i) => `  (${q(`${id}-s${i}`)}, ${q(id)}, ${i}, ${q(JSON.stringify(s.glosses.map(text => ({ lang: 'en', text }))))}::jsonb, ${arr(s.pos)}, ${arr(s.fields)}, ${arr(s.misc)}, ${arr(s.dialect)})`)
    statements.push(`INSERT INTO word_senses (id, word_id, sort_index, glosses, pos, fields, misc, dialect)
SELECT v.* FROM (VALUES
${senses.join(',\n')}
) AS v(id, word_id, sort_index, glosses, pos, fields, misc, dialect)
WHERE EXISTS (SELECT 1 FROM words WHERE id = ${q(id)})
ON CONFLICT (id) DO NOTHING;`)
  }

  if (statements.length === 0) {
    console.log('Nothing new to add.')
    return
  }

  const files = (await readdir(SEEDS)).filter(f => /^\d{3}-/.test(f)).sort()
  const next = String(Number.parseInt(files.at(-1)?.slice(0, 3) ?? '0', 10) + 1).padStart(3, '0')
  const name = `${next}-reading-words.sql`
  const header = `-- Dictionary words the read-aloud speeches use, from JMdict (CC BY-SA 4.0, EDRDG).
--
-- Generated by \`pnpm -C nihongo/backend seed:words\`. Do not edit: generate a
-- new seed instead. Dictionary only — no study items — so they can be tapped
-- in a speech but are not introduced as new cards.
--
-- Idempotent: keyed on JMdict's ent_seq, and nothing already in the dictionary
-- is touched.
--
${added.map(a => `--   ${a}`).join('\n')}

`
  await writeFile(path.join(SEEDS, name), `${header}${statements.join('\n\n')}\n`)
  console.log(`Wrote src/db/seeds/${name}: ${added.length} words`)
  for (const a of added) console.log(`  + ${a}`)
}

main()
  .catch((err) => {
    console.error('Failed:', err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
