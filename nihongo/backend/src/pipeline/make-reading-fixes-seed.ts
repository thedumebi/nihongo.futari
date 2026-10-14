/* eslint-disable no-console */
/**
 * Turn checked reading corrections into review-queue proposals.
 *
 *   pnpm -C nihongo/backend exec dotenvx run -f .env -- tsx src/pipeline/make-reading-fixes-seed.ts <verified.jsonl> <seed-number>
 *
 * The imported (Tatoeba) sentences got their readings from a tokeniser at
 * import, and some are wrong in context — 五時 read ごとき, 来た read くた — or
 * missing, for names the tokeniser did not know. Each correction here was
 * proposed by one reviewer and confirmed by another.
 *
 * Nothing is changed by the seed. It puts one proposal per sentence in the
 * admin review queue — the sentence as it reads now and as it would read, and
 * why — and approving it there applies the change to the sentence and to every
 * cloze card cut from it (review-queue.service applyCorrection).
 *
 * Input lines, as the verifier writes them:
 *   {"id","index","final":"来[き]た","verdict":"accept|modify|reject","why"}   a token
 *   {"id","gap_at","t","reading","why"}                                        a name with no token
 *
 * Sentences are found by their text, not their id, so the seed works whatever
 * ids a database gave them.
 */

import type { FuriganaSegment } from '@nihongo/shared/lib'
import type { CorrectionProposal } from '@nihongo/shared/types'

import db, { connection } from '@nihongo/shared/db'
import { hasHiragana, hasKatakana, sentenceFurigana } from '@nihongo/shared/lib'
import { sql } from 'drizzle-orm'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface Fix { id: string, index?: number, final?: string | null, verdict?: string, gap_at?: number, t?: string, reading?: string, why?: string }

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

interface Tok { index: number, charStart: number, charEnd: number, furigana: FuriganaSegment[] }

async function main() {
  const [file, number] = process.argv.slice(2)
  if (!file || !number)
    throw new Error('usage: make-reading-fixes-seed.ts <verified.jsonl> <seed-number>')

  const fixes = readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l) as Fix)
  const usable = fixes.filter(f => (f.index !== undefined && f.final && f.verdict !== 'reject') || (f.gap_at !== undefined && f.reading))
  const ids = [...new Set(usable.map(f => f.id))]

  const rows = (await db.execute(sql`
    select s.id, s.text, (select tr.text from sentence_translations tr where tr.sentence_id = s.id limit 1) as translation,
      st.index, st.char_start, st.char_end, st.furigana
    from sentences s join sentence_tokens st on st.sentence_id = s.id
    where s.id in ${ids}`)).rows as Array<{ id: string, text: string, translation: string | null, index: number, char_start: number, char_end: number, furigana: FuriganaSegment[] }>
  const sentences = new Map<string, { text: string, translation: string | null, tokens: Tok[] }>()
  for (const r of rows) {
    const s = sentences.get(r.id) ?? { text: r.text, translation: r.translation, tokens: [] }
    s.tokens.push({ index: r.index, charStart: r.char_start, charEnd: r.char_end, furigana: r.furigana })
    sentences.set(r.id, s)
  }

  const out: string[] = []
  let tokenCount = 0
  let gapCount = 0
  for (const id of ids) {
    const s = sentences.get(id)!
    const after = s.tokens.map(t => ({ ...t }))
    const proposal: Extract<CorrectionProposal, { type: 'sentence' }> = {
      type: 'sentence',
      text: s.text,
      translation: s.translation,
      before: sentenceFurigana(s.text, s.tokens),
      after: [],
      tokens: [],
      gaps: []
    }
    for (const fix of usable.filter(f => f.id === id)) {
      if (fix.index !== undefined) {
        const tok = after.find(t => t.index === fix.index)!
        const surface = [...s.text].slice(tok.charStart, tok.charEnd).join('')
        const to = parseBracketed(fix.final!)
        if (to.map(seg => seg.t).join('') !== surface)
          throw new Error(`${id}#${fix.index}: ${fix.final} does not spell ${surface}`)
        proposal.tokens.push({ index: fix.index, from: tok.furigana, to, why: fix.why ?? '' })
        tok.furigana = to
        tokenCount++
      } else {
        const at = fix.gap_at!
        if ([...s.text].slice(at, at + [...fix.t!].length).join('') !== fix.t)
          throw new Error(`${id}: ${fix.t} is not at ${at}`)
        proposal.gaps.push({ at, t: fix.t!, reading: fix.reading!, why: fix.why ?? '' })
        after.push({ index: 1000 + at, charStart: at, charEnd: at + [...fix.t!].length, furigana: [{ t: fix.t!, r: fix.reading! }] })
        gapCount++
      }
    }
    proposal.after = sentenceFurigana(s.text, after)

    const key = `crq-reading-${createHash('sha1').update(s.text).digest('hex').slice(0, 16)}`
    out.push(`-- ${s.text}
INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, current, origin, priority, status)
SELECT ${q(key)}, s.language_id, 'sentences', s.id, 'update', ${json(proposal)}, ${json({ furigana: proposal.before })}, 'ai', 900, 'pending'
FROM sentences s
WHERE s.text = ${q(s.text)} AND s.source = 'tatoeba'
  AND NOT EXISTS (SELECT 1 FROM content_review_queue c WHERE c.target_table = 'sentences' AND c.target_id = s.id AND c.status = 'pending')
LIMIT 1
ON CONFLICT DO NOTHING;`)
  }

  const header = `-- Reading corrections for imported sentences, for review.
--
-- The Tatoeba sentences got their readings from a tokeniser at import. A first
-- reviewer read all 1,826 of them in context and proposed fixes; a second,
-- independent reviewer confirmed each. Nothing changes here: each sentence
-- becomes one proposal in the admin review queue (Corrections), showing how it
-- reads now and how it would read, and why. Approving one applies it to the
-- sentence and to every cloze card cut from it.
--
-- ${ids.length} sentences: ${tokenCount} word readings (五時 read ごとき, 来た read くた,
-- 何ですか read なにですか …) and ${gapCount} names that had no reading at all.
--
-- Generated by pipeline/make-reading-fixes-seed.ts. Sentences are found by
-- their text; a sentence already awaiting review is skipped.
`
  const path = join('src/db/seeds', `${number}-imported-sentence-readings.sql`)
  writeFileSync(path, `${header}\n${out.join('\n\n')}\n`)
  console.log(`${path}: ${ids.length} sentences, ${tokenCount} tokens, ${gapCount} gaps`)
  await connection.end()
}

void main()
