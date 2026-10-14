/* eslint-disable no-console */
/**
 * Every line the app shows, word by word, checked for a wrong or missing reading.
 *
 *   pnpm -C nihongo/backend exec dotenvx run -f .env -- tsx src/pipeline/check-line-readings.ts [--list]
 *
 * Reads what is in the database, so it checks exactly what is served: the
 * conversations, Speak, the read-aloud speeches, grammar examples, word-page
 * example sentences and every cloze card's sentence, each cut by the same `glossLine` the routes use.
 *
 * Reports, per surface:
 *  - broken: a word with kanji shown with no reading, or a reading that does
 *    not fit the line at all. These must be zero.
 *  - differs: a word whose reading is not the dictionary's. Often right (今日
 *    as こんにち), sometimes an authoring or import mistake — listed with
 *    --list for a person to look at.
 */

import type { FuriganaSegment } from '@nihongo/shared/lib'
import type { GlossedToken } from '@nihongo/shared/types'

import db, { connection } from '@nihongo/shared/db'
import { hasKanji, readTokenProblems, sentenceFurigana, toHiragana } from '@nihongo/shared/lib'
import { sql } from 'drizzle-orm'

import { glossary, glossLine } from '../services/glossary.service.js'

const LIST = process.argv.includes('--list')

interface Line { surface: string, ref: string, text: string, tokens: GlossedToken[], hasReading: boolean }

const plain = (s: string) => toHiragana(s.replace(/\s+/g, ''))

async function rows<T>(query: ReturnType<typeof sql>): Promise<T[]> {
  return (await db.execute(query)).rows as T[]
}

async function main() {
  const g = await glossary('ja')
  const lines: Line[] = []
  const add = (surface: string, ref: string, text: string, reading: string | null, opts: { regroupKana?: boolean } = {}) => {
    if (!text)
      return
    lines.push({ surface, ref, text, tokens: glossLine(text, g, reading ?? undefined, opts), hasReading: Boolean(reading) })
  }

  for (const r of await rows<{ code: string, text: string, reading: string | null }>(sql`
    select d.code, t.text, t.reading_kana as reading from dialogue_turns t join dialogues d on d.id = t.dialogue_id
    union all
    select d.code, r.text, r.reading_kana from dialogue_replies r join dialogue_turns t on t.id = r.turn_id join dialogues d on d.id = t.dialogue_id`))
    add('conversation', r.code, r.text, r.reading)

  for (const r of await rows<{ code: string, text: string, reading: string | null }>(sql`
    select s.code, st.text, st.reading_kana as reading from speak_steps st join speak_sessions s on s.id = st.session_id where st.text is not null`))
    add('speak', r.code, r.text, r.reading, { regroupKana: true })

  for (const r of await rows<{ code: string, text: string, reading: string | null }>(sql`
    select rd.code, l.text, l.reading_kana as reading from reading_lines l join readings rd on rd.id = l.reading_id`))
    add('reading', r.code, r.text, r.reading, { regroupKana: true })

  for (const r of await rows<{ id: string, text: string, reading: string | null }>(sql`
    select id, text, reading_kana as reading from sentences where published and reading_kana is not null`))
    add('sentence', r.id, r.text, r.reading)

  for (const r of await rows<{ id: string, prompt: Record<string, unknown> }>(sql`
    select id, prompt from exercise_prompts where prompt->>'kind' = 'cloze'`)) {
    for (const half of ['before', 'after'] as const) {
      const text = r.prompt[half]
      const segments = r.prompt[`${half}Furigana`]
      if (typeof text === 'string' && text && Array.isArray(segments))
        lines.push({ surface: 'cloze', ref: r.id, text, tokens: glossLine(text, g, segments as never), hasReading: true })
    }
  }

  // Example sentences on word pages: the whole imported sentence, its
  // furigana stitched from its tokens exactly as words.service does.
  const exampleTokens = new Map<string, { text: string, tokens: Array<{ charStart: number, charEnd: number, furigana: FuriganaSegment[] }> }>()
  for (const r of await rows<{ id: string, text: string, char_start: number, char_end: number, furigana: FuriganaSegment[] }>(sql`
    select s.id, s.text, st.char_start, st.char_end, st.furigana
    from sentences s join sentence_tokens st on st.sentence_id = s.id where s.published and s.source = 'tatoeba'`)) {
    const e = exampleTokens.get(r.id) ?? { text: r.text, tokens: [] }
    e.tokens.push({ charStart: r.char_start, charEnd: r.char_end, furigana: r.furigana })
    exampleTokens.set(r.id, e)
  }
  for (const [id, e] of exampleTokens) {
    const f = sentenceFurigana(e.text, e.tokens)
    lines.push({ surface: 'example', ref: id, text: e.text, tokens: [{ t: e.text, f }], hasReading: true })
  }

  const bySurface = new Map<string, { lines: number, broken: string[], differs: string[] }>()
  for (const line of lines) {
    const s = bySurface.get(line.surface) ?? { lines: 0, broken: [], differs: [] }
    bySurface.set(line.surface, s)
    s.lines++
    if (!line.hasReading)
      continue
    const problems = line.tokens.flatMap(t => readTokenProblems(t))
    if (problems.length)
      s.broken.push(`[${line.ref}] ${line.text} — ${problems.join('; ')}`)
    for (const t of line.tokens) {
      if (t.w && t.w.form === t.t && t.r && hasKanji(t.t) && plain(t.r) !== plain(t.w.reading))
        s.differs.push(`[${line.ref}] ${line.text} — ${t.t}=${t.r.trim()} (dictionary ${t.w.reading})`)
    }
  }

  let broken = 0
  for (const [surface, s] of bySurface) {
    broken += s.broken.length
    console.log(`${surface.padEnd(13)} ${String(s.lines).padStart(5)} lines  broken ${s.broken.length}  differs ${s.differs.length}`)
    if (LIST) {
      for (const [label, list] of [['BROKEN', s.broken], ['DIFFERS', s.differs]] as const) {
        for (const item of list)
          console.log(`  ${label} ${item}`)
      }
    }
  }
  await connection.end()
  process.exit(broken === 0 ? 0 : 1)
}

void main()
