/* eslint-disable no-console */
/**
 * Turn checked reading corrections into a seed.
 *
 *   pnpm -C nihongo/backend exec dotenvx run -f .env -- tsx src/pipeline/make-reading-fixes-seed.ts <verified.jsonl> <seed-number>
 *
 * The imported (Tatoeba) sentences got their readings from a tokeniser at
 * import, and some are wrong in context — 五時 read ごとき, 来た read くた — or
 * missing, for names the tokeniser did not know. Each correction here was
 * proposed by one reviewer and confirmed by another (see the review notes in
 * the seed header), then approved by the owner.
 *
 * Input lines, as the verifier writes them:
 *   {"id","index","final":"来[き]た","verdict":"accept|modify|reject"}   a token
 *   {"id","gap_at","t","reading"}                                         a name with no token
 *
 * The seed:
 *  - rewrites the token's furigana, guarded by its current value;
 *  - adds a token for each name that had none, guarded by its position;
 *  - rebuilds every cloze card cut from a changed sentence, since a card keeps
 *    its own copy of the sentence's furigana, and puts the corrected reading
 *    of the blank in place of the wrong one among the accepted answers.
 * Every statement is guarded by the value it replaces, so a re-run is a no-op.
 */

import type { FuriganaSegment } from '@nihongo/shared/lib'

import db, { connection } from '@nihongo/shared/db'
import { hasHiragana, hasKatakana, sentenceFurigana } from '@nihongo/shared/lib'
import { sql } from 'drizzle-orm'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface TokenFix { id: string, index: number, final: string | null, verdict: string }
interface GapFix { id: string, gap_at: number, t: string, reading: string }

/** `来[き]た` → [{t:'来', r:'き'}, {t:'た'}]. */
export function parseBracketed(token: string): FuriganaSegment[] {
  const out: FuriganaSegment[] = []
  for (const match of token.matchAll(/([^[\]]+)(?:\[([^\]]+)\])?/g)) {
    const [, text, reading] = match
    if (!reading) {
      out.push({ t: text! })
      continue
    }
    // Brackets follow a kanji run; any kana before it stay plain.
    const chars = [...text!]
    let start = chars.length
    while (start > 0 && !hasHiragana(chars[start - 1]!) && !hasKatakana(chars[start - 1]!))
      start--
    const head = chars.slice(0, start).join('')
    if (head)
      out.push({ t: head })
    out.push({ t: chars.slice(start).join('') || text!, r: reading })
  }
  return out
}

const q = (s: string) => `'${s.replace(/'/g, '\'\'')}'`
const json = (v: unknown) => `${q(JSON.stringify(v))}::jsonb`

interface Tok { index: number, surface: string, charStart: number, charEnd: number, furigana: FuriganaSegment[] }

async function main() {
  const [file, number] = process.argv.slice(2)
  if (!file || !number)
    throw new Error('usage: make-reading-fixes-seed.ts <verified.jsonl> <seed-number>')

  const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l) as TokenFix & GapFix)
  const tokenFixes = lines.filter(l => 'index' in l && l.final && l.verdict !== 'reject')
  const gapFixes = lines.filter(l => 'gap_at' in l && l.reading)
  const ids = [...new Set([...tokenFixes, ...gapFixes].map(l => l.id))]

  const tokens = new Map<string, Tok[]>()
  const texts = new Map<string, string>()
  for (const row of (await db.execute(sql`
    select s.id, s.text, st.index, st.surface, st.char_start, st.char_end, st.furigana
    from sentences s join sentence_tokens st on st.sentence_id = s.id
    where s.id in ${ids}`)).rows as Array<{ id: string, text: string, index: number, surface: string, char_start: number, char_end: number, furigana: FuriganaSegment[] }>) {
    texts.set(row.id, row.text)
    const list = tokens.get(row.id) ?? []
    list.push({ index: row.index, surface: row.surface, charStart: row.char_start, charEnd: row.char_end, furigana: row.furigana })
    tokens.set(row.id, list)
  }

  const out: string[] = []
  const after = new Map<string, Tok[]>()
  for (const id of ids)
    after.set(id, (tokens.get(id) ?? []).map(t => ({ ...t })))

  for (const fix of tokenFixes) {
    const tok = after.get(fix.id)?.find(t => t.index === fix.index)
    if (!tok)
      throw new Error(`no token ${fix.id}#${fix.index}`)
    const segments = parseBracketed(fix.final!)
    if (segments.map(s => s.t).join('') !== tok.surface)
      throw new Error(`${fix.id}#${fix.index}: ${fix.final} does not spell ${tok.surface}`)
    out.push(`UPDATE sentence_tokens SET furigana = ${json(segments)}, alignment_confidence = 1, updated_at = now()\n  WHERE sentence_id = ${q(fix.id)} AND index = ${fix.index} AND furigana = ${json(tok.furigana)};`)
    tok.furigana = segments
  }

  for (const gap of gapFixes) {
    const text = texts.get(gap.id)!
    const at = gap.gap_at
    const end = at + [...gap.t].length
    if ([...text].slice(at, end).join('') !== gap.t)
      throw new Error(`${gap.id}: ${gap.t} is not at ${at}`)
    const furigana = [{ t: gap.t, r: gap.reading }]
    // Index past the tokeniser's own: readers order tokens by position.
    out.push(`INSERT INTO sentence_tokens (id, sentence_id, index, surface, reading, char_start, char_end, furigana, alignment_confidence)
  SELECT gen_random_uuid()::text, ${q(gap.id)}, ${1000 + at}, ${q(gap.t)}, ${q(gap.reading)}, ${at}, ${end}, ${json(furigana)}, 1
  WHERE NOT EXISTS (SELECT 1 FROM sentence_tokens WHERE sentence_id = ${q(gap.id)} AND char_start = ${at});`)
    after.get(gap.id)!.push({ index: 1000 + at, surface: gap.t, charStart: at, charEnd: end, furigana })
  }

  // Cloze cards cut from these sentences.
  const prompts = (await db.execute(sql`
    select id, prompt, answer from exercise_prompts
    where prompt->>'kind' = 'cloze' and assets->>'sentenceId' in ${ids}`)).rows as Array<{ id: string, prompt: Record<string, unknown>, answer: { primary: string, accepted: string[] } }>
  const half = (text: string, list: Tok[], from: number, to: number) => sentenceFurigana(
    text,
    list.filter(t => t.charStart >= from && t.charEnd <= to).map(t => ({ ...t, charStart: t.charStart - from, charEnd: t.charEnd - from }))
  )
  let cards = 0
  for (const p of prompts) {
    const sentence = String(p.prompt.sentence)
    const sid = [...texts].find(([, t]) => t === sentence)?.[0]
    if (!sid)
      continue
    const before = String(p.prompt.before)
    const after2 = String(p.prompt.after)
    const blankStart = [...before].length
    const blankEnd = [...sentence].length - [...after2].length
    const list = after.get(sid)!
    const old = tokens.get(sid) ?? []
    const nb = half(before, list, 0, blankStart)
    const na = half(after2, list, blankEnd, [...sentence].length)
    const blankOf = (l: Tok[]) => half(sentence.slice(before.length, sentence.length - after2.length), l, blankStart, blankEnd).map(s => s.r ?? s.t).join('')
    const oldBlank = blankOf(old)
    const newBlank = blankOf(list)
    const sets: string[] = []
    if (JSON.stringify(nb) !== JSON.stringify(p.prompt.beforeFurigana))
      sets.push(`prompt = jsonb_set(prompt, '{beforeFurigana}', ${json(nb)})`)
    if (JSON.stringify(na) !== JSON.stringify(p.prompt.afterFurigana))
      sets.push(`prompt = jsonb_set(prompt, '{afterFurigana}', ${json(na)})`)
    if (sets.length === 2)
      sets.splice(0, 2, `prompt = jsonb_set(jsonb_set(prompt, '{beforeFurigana}', ${json(nb)}), '{afterFurigana}', ${json(na)})`)
    if (oldBlank !== newBlank && p.answer.accepted.includes(oldBlank)) {
      // The wrong reading came only from the bad furigana; the right one replaces it.
      // A blank that had no reading spelled itself, so its "reading" was the
      // written answer — which must stay accepted.
      const keep = (a: string) => a !== oldBlank || a === p.answer.primary
      const accepted = [...new Set([...p.answer.accepted.filter(keep), newBlank])]
      sets.push(`answer = jsonb_set(answer, '{accepted}', ${json(accepted)})`)
    }
    if (sets.length === 0)
      continue
    cards++
    out.push(`UPDATE exercise_prompts SET ${sets.join(', ')}, updated_at = now()\n  WHERE id = ${q(p.id)} AND prompt->'beforeFurigana' = ${json(p.prompt.beforeFurigana)} AND prompt->'afterFurigana' = ${json(p.prompt.afterFurigana)};`)
  }

  const header = `-- Readings in imported sentences, corrected.
--
-- The Tatoeba sentences got their readings from a tokeniser at import. Every
-- one of the ${texts.size} sentences touched here was checked in context: a
-- first reviewer read all 1,826 imported sentences and proposed fixes, and a
-- second, independent reviewer confirmed each one before it was kept. Then
-- the owner approved the list.
--
-- ${tokenFixes.length} word readings corrected (五時 read ごとき, 来た read くた, 何ですか
-- read なにですか …), ${gapFixes.length} names given a reading they never had, and
-- ${cards} cloze cards rebuilt from the corrected sentences.
--
-- Generated by pipeline/make-reading-fixes-seed.ts. Every statement is guarded
-- by the value it replaces, so a re-run changes nothing.
`
  const path = join('src/db/seeds', `${number}-imported-sentence-readings.sql`)
  writeFileSync(path, `${header}\n${out.join('\n\n')}\n`)
  console.log(`${path}: ${tokenFixes.length} tokens, ${gapFixes.length} gaps, ${cards} cards`)
  await connection.end()
}

void main()
