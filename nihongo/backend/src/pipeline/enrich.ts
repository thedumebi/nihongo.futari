/* eslint-disable no-console */
import type { EnrichmentDraft, GroundingPacket } from '@nihongo/shared/types'

import Anthropic from '@anthropic-ai/sdk'
import db, { connection } from '@nihongo/shared/db'
import {
  contentReviewQueue,
  enrichmentItems,
  enrichmentRuns,
  etymologyEntries,
  etymologySources,
  grammarPoints,
  kanji,
  languages,
  phoneticSeries,
  phoneticSeriesMembers,
  sources,
  words
} from '@nihongo/shared/db/schema'
import env from '@nihongo/shared/env'
import { grammarLookupKey, pickGlyphEntry, pickGrammarEntry, validateDraft } from '@nihongo/shared/lib'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { readFile, writeFile } from 'node:fs/promises'

import { DATASETS, ensureDataset } from './fetch.js'
import { loadEtymologies } from './sources/wiktextract.js'

/**
 * Grounded etymology enrichment.
 *
 * The rule that shapes everything here: THE MODEL IS NEVER ASKED WHAT THE
 * ETYMOLOGY IS. It is handed passages from named sources and asked to explain
 * only what those passages support. A word with no passage is skipped, not
 * guessed at — shipping a word with no etymology is fine, shipping one with an
 * invented etymology is the failure this whole layer exists to prevent.
 *
 * Every draft then passes `validateDraft`, which checks each quote is a literal
 * substring of the passage it claims to come from. That is what makes a
 * fabricated citation mechanically detectable rather than a matter of reviewer
 * vigilance.
 *
 *   pnpm -C nihongo/backend enrich --limit 20                 # dry run
 *   pnpm -C nihongo/backend enrich --limit 20 --export p.json # packets out
 *   pnpm -C nihongo/backend enrich --import drafts.json       # validate + queue
 *   pnpm -C nihongo/backend enrich --limit 20 --execute       # direct API call
 *
 * The export/import pair exists so the drafting step can be done by anything —
 * a subagent, a batch job, a person — while the validation gate stays in one
 * place. Whatever produced the drafts, they land through the same check.
 */

/**
 * Default model for the direct --execute path.
 *
 * The plan called for Opus on etymology prose. Grounded extraction turned out
 * to be closer to mechanical work than that assumed — the model is summarising
 * a passage it was handed and quoting it verbatim, not composing history — so a
 * smaller model is defensible here. `--model` overrides it, and whatever ran is
 * recorded on the run for comparison.
 */
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001'
const PROMPT_VERSION = 'etymology-word-v1'

const SYSTEM = `You explain the etymology of Japanese words for a learning app.

You will be given a word and one or more SOURCE PASSAGES. Explain ONLY what those passages support.

Hard rules:
- Every citation must quote the passage VERBATIM. Copy the characters exactly; do not paraphrase, tidy, translate or extend a quotation.
- Only cite a sourceId that appears in the packet.
- If the passages do not actually explain the word's origin, return confidence "unknown" with an empty body. This is a correct and expected answer, not a failure. Do not reach for general knowledge to fill the gap.
- If the passages disagree, set isDisputed and record the alternatives in competingTheories.

Write for someone learning the word. Lead with the claim in one sentence, then explain why it is useful to know — what it makes predictable, or what confusion it clears up. Do not pad. If the history explains nothing helpful, say so briefly rather than inventing significance.`

const DRAFT_SCHEMA = {
  type: 'object',
  properties: {
    claim: { type: 'string', description: 'One sentence: the origin.' },
    body: { type: 'string', description: 'Why it is worth knowing. Empty if confidence is unknown.' },
    confidence: { type: 'string', enum: ['well-supported', 'attested', 'disputed', 'folk', 'unknown'] },
    isDisputed: { type: 'boolean' },
    period: { type: ['string', 'null'] },
    citations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sourceId: { type: 'string' },
          quote: { type: 'string', description: 'VERBATIM substring of that source passage.' },
          supports: { type: 'string', enum: ['supports', 'contradicts', 'partial'] }
        },
        required: ['sourceId', 'quote', 'supports'],
        additionalProperties: false
      }
    },
    competingTheories: {
      type: 'array',
      items: {
        type: 'object',
        properties: { theoryName: { type: 'string' }, summary: { type: 'string' } },
        required: ['theoryName', 'summary'],
        additionalProperties: false
      }
    }
  },
  required: ['claim', 'body', 'confidence', 'isDisputed', 'period', 'citations', 'competingTheories'],
  additionalProperties: false
} as const

function packetToPrompt(packet: GroundingPacket): string {
  const facts = Object.entries(packet.facts)
    .map(([k, v]) => `- ${k}: ${String(v)}`)
    .join('\n')
  const passages = packet.sources
    .map(s => `<source id="${s.sourceId}" label="${s.label}" locator="${s.locator}">\n${s.passage}\n</source>`)
    .join('\n\n')

  return `WORD: ${packet.subject}\nASPECT: ${packet.aspect}\n\nFACTS FROM IMPORTED DATA (not citable — context only):\n${facts}\n\nSOURCE PASSAGES (the only text you may quote):\n\n${passages}`
}

/**
 * Persist one validated draft: etymology entry, its citations, and a review row.
 *
 * Shared by the direct API path and the imported-drafts path so a draft cannot
 * reach the database by a route that skips the check.
 */
async function persistDraft(opts: {
  draft: EnrichmentDraft
  packet: GroundingPacket
  languageId: string
  runId: string
  itemId: string
  model: string
}): Promise<void> {
  const { draft, packet, languageId, runId, itemId, model } = opts

  // `etymology_entries` uses an exclusive arc: exactly one owner column may be
  // set. Writing wordId for a grammar packet put a grammar-point id in the
  // words FK, which the database refused outright — the arc doing its job.
  const owner
    = packet.targetTable === 'grammar_points'
      ? { grammarPointId: packet.targetId }
      : packet.targetTable === 'kanji'
        ? { kanjiId: packet.targetId }
        : { wordId: packet.targetId }

  const [entry] = await db.insert(etymologyEntries).values({
    languageId,
    ...owner,
    aspect: packet.aspect,
    claim: draft.claim,
    body: draft.body,
    period: draft.period,
    confidence: draft.confidence,
    isDisputed: draft.isDisputed,
    isPrimary: true,
    status: 'in-review',
    generatedBy: 'claude',
    model,
    promptVersion: PROMPT_VERSION,
    enrichmentRunId: runId,
    sourceCount: draft.citations.length
  }).returning({ id: etymologyEntries.id })

  for (const [index, citation] of draft.citations.entries()) {
    const source = packet.sources.find(sp => sp.sourceId === citation.sourceId)
    await db.insert(etymologySources).values({
      etymologyId: entry!.id,
      sourceId: citation.sourceId,
      locator: source?.locator ?? '',
      quote: citation.quote,
      supports: citation.supports,
      sortIndex: index
    }).onConflictDoNothing()
  }

  await db.insert(contentReviewQueue).values({
    languageId,
    targetTable: 'etymology_entries',
    targetId: entry!.id,
    changeType: 'create',
    proposed: { claim: draft.claim, body: draft.body, confidence: draft.confidence },
    origin: 'claude',
    enrichmentItemId: itemId,
    priority: 10,
    status: 'pending'
  }).onConflictDoNothing()
}

async function main() {
  const args = process.argv.slice(2)
  const execute = args.includes('--execute')
  const exportTo = args[args.indexOf('--export') + 1]
  const importFrom = args[args.indexOf('--import') + 1]
  const MODEL = args.includes('--model') ? args[args.indexOf('--model') + 1]! : DEFAULT_MODEL
  const kind = args.includes('--kind') ? args[args.indexOf('--kind') + 1]! : 'word'
  const limitArg = args.find(a => a.startsWith('--limit'))
  const limit = Number.parseInt(limitArg?.split('=')[1] ?? args[args.indexOf('--limit') + 1] ?? '20', 10) || 20

  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing')

  // ---- Import path: drafts produced elsewhere, validated here ---------------
  if (importFrom && !importFrom.startsWith('--')) {
    const payload = JSON.parse(await readFile(importFrom, 'utf8')) as {
      model?: string
      drafts: Array<{ targetId: string, draft: EnrichmentDraft }>
      packets: GroundingPacket[]
    }
    const byTarget = new Map(payload.packets.map(pk => [pk.targetId, pk]))

    const [run] = await db.insert(enrichmentRuns).values({
      kind: 'etymology-draft',
      languageId: language.id,
      model: payload.model ?? MODEL,
      promptVersion: PROMPT_VERSION,
      status: 'running',
      itemCount: payload.drafts.length
    }).returning({ id: enrichmentRuns.id })

    let ok = 0
    let declined = 0
    let failed = 0

    for (const { targetId, draft } of payload.drafts) {
      const packet = byTarget.get(targetId)
      if (!packet) {
        // A draft for a packet we did not issue cannot be validated against
        // anything, so it is refused rather than trusted.
        console.log(`  no packet for ${targetId} — refused`)
        failed++
        continue
      }

      const [item] = await db.insert(enrichmentItems).values({
        runId: run!.id,
        targetTable: packet.targetTable,
        targetId: packet.targetId,
        inputContext: packet as unknown as Record<string, unknown>,
        output: draft as unknown as Record<string, unknown>,
        status: 'pending'
      }).returning({ id: enrichmentItems.id })

      const validation = validateDraft(draft, packet)
      await db.update(enrichmentItems)
        .set({
          validation: validation as unknown as Record<string, unknown>,
          status: validation.ok ? 'generated' : 'auto-rejected'
        })
        .where(eq(enrichmentItems.id, item!.id))

      if (validation.dropped) {
        declined++
        continue
      }
      if (!validation.ok) {
        console.log(`  rejected ${packet.subject}: ${validation.reason}`)
        failed++
        continue
      }

      await persistDraft({
        draft,
        packet,
        languageId: language.id,
        runId: run!.id,
        itemId: item!.id,
        model: payload.model ?? MODEL
      })
      ok++
    }

    await db.update(enrichmentRuns).set({ status: 'complete' }).where(eq(enrichmentRuns.id, run!.id))
    console.log(`\nQueued for review: ${ok}`)
    console.log(`Model declined (no support in passage): ${declined}`)
    console.log(`Failed validation: ${failed}`)
    return
  }

  const [wiktionarySource] = await db
    .select({ id: sources.id })
    .from(sources)
    .where(eq(sources.slug, 'wiktionary'))
    .limit(1)
  if (!wiktionarySource)
    throw new Error('wiktionary source row missing — run db:seed')

  // ---- Phonetic-series reading logic ------------------------------------------
  //
  // The one "why" that needs no external scholarship: it is COMPUTED from
  // KANJIDIC readings and the derived series. The passage below is a faithful
  // rendering of that data, so quoting it is quoting the data — and the
  // substring check then stops the model inflating the numbers, which is the
  // only way this particular explanation can go wrong.
  if (kind === 'phonetic') {
    const [kanjidicSource] = await db
      .select({ id: sources.id })
      .from(sources)
      .where(eq(sources.slug, 'kanjidic2'))
      .limit(1)
    if (!kanjidicSource)
      throw new Error('kanjidic2 source row missing — run db:seed')

    const members = await db
      .select({
        kanjiId: kanji.id,
        character: kanji.character,
        component: phoneticSeries.componentCharacter,
        seriesReading: phoneticSeries.primaryReading,
        memberCount: phoneticSeries.memberCount,
        reliability: phoneticSeries.reliability,
        follows: phoneticSeriesMembers.followsSeries,
        memberReading: phoneticSeriesMembers.reading,
        // KANJIDIC lists on-readings in order of prominence, so sort_index 0 is
        // the reading a learner will actually meet most.
        dominantReading: sql<string | null>`(
          select r.reading from kanji_readings r
          where r.kanji_id = ${kanji.id} and r.type = 'on'
          order by r.sort_index limit 1
        )`
      })
      .from(phoneticSeriesMembers)
      .innerJoin(phoneticSeries, eq(phoneticSeries.id, phoneticSeriesMembers.seriesId))
      .innerJoin(kanji, eq(kanji.id, phoneticSeriesMembers.kanjiId))
      .leftJoin(etymologyEntries, eq(etymologyEntries.kanjiId, kanji.id))
      .where(and(eq(kanji.published, true), isNull(etymologyEntries.id)))
      .orderBy(sql`${phoneticSeries.reliability} desc nulls last`)
      .limit(limit * 2)

    const built: GroundingPacket[] = []
    for (const row of members) {
      const followers = Math.round(Number(row.reliability ?? 0) * (row.memberCount ?? 0))
      const isPrimaryReading = !row.dominantReading || row.dominantReading === row.memberReading
      // Phrased so it cannot contradict itself. A kanji with several on-readings
      // follows its series through ONE of them, and saying "records ジョウ …
      // follows the series" invites exactly the confused explanation it got.
      const passage = row.follows
        ? `${row.character} has the on-reading ${row.memberReading}, which ${
          row.memberReading === row.seriesReading
            ? 'matches'
            : `differs only in voicing from ${row.seriesReading}, the reading of`
        } its phonetic component ${row.component}. `
        + `Across the ${row.memberCount} kanji that use ${row.component} as a phonetic component, `
        + `${followers} share the reading ${row.seriesReading}. ${row.character} follows the series.${
          isPrimaryReading
            ? ''
            // 情 reads ジョウ far more often than セイ, and セイ is what matches
            // 青. Saying only "expect セイ" would mislead a learner straight into
            // 情報 and 情熱. Which reading DOMINATES is part of the fact.
            : ` Note that ${row.memberReading} is not the most common reading of ${row.character}; `
              + `KANJIDIC2 lists ${row.dominantReading} first.`}`
        : `${row.character} has the on-reading ${row.memberReading}. Its phonetic component ${row.component} `
          + `normally signals ${row.seriesReading}, shared by ${followers} of the ${row.memberCount} kanji that use it. `
          + `${row.character} does not follow the series and is an exception.`

      built.push({
        targetTable: 'kanji',
        targetId: row.kanjiId,
        subject: `${row.character} (reading ${row.memberReading})`,
        aspect: 'reading-logic',
        facts: {
          character: row.character,
          component: row.component,
          seriesReading: row.seriesReading ?? '',
          followsSeries: row.follows
        },
        sources: [{
          sourceId: kanjidicSource.id,
          label: 'KANJIDIC2 (derived phonetic series)',
          locator: `${row.character} / series ${row.component}`,
          passage
        }]
      })
      if (built.length >= limit)
        break
    }

    console.log(`Series members without etymology: ${members.length}`)
    console.log(`Packets built:                    ${built.length}`)

    if (exportTo && !exportTo.startsWith('--')) {
      await writeFile(exportTo, JSON.stringify({
        promptVersion: PROMPT_VERSION,
        system: SYSTEM,
        schema: DRAFT_SCHEMA,
        packets: built.map(pk => ({ ...pk, renderedPrompt: packetToPrompt(pk) }))
      }, null, 2))
      console.log(`\nWrote ${built.length} packets to ${exportTo}`)
      return
    }
    if (built.length > 0) {
      console.log('\n--- DRY RUN. Sample packet: ---\n')
      console.log(packetToPrompt(built[0]!))
    }
    return
  }

  // ---- Kanji glyph-origin packets ---------------------------------------------
  if (kind === 'kanji') {
    const chars = await db
      .select({ id: kanji.id, character: kanji.character, meanings: kanji.meanings, strokeCount: kanji.strokeCount })
      .from(kanji)
      .leftJoin(etymologyEntries, eq(etymologyEntries.kanjiId, kanji.id))
      .where(and(
        eq(kanji.languageId, language.id),
        eq(kanji.published, true),
        isNull(etymologyEntries.id)
      ))
      .orderBy(sql`${kanji.frequencyRank} nulls last`)
      .limit(limit * 6)

    const byChar = new Map(chars.map(k => [k.character, k]))
    const dataset = await ensureDataset(DATASETS.wiktextractTranslingual)
    console.log('Scanning Translingual wiktextract for glyph origins…')
    const found = await loadEtymologies(dataset.filePath, new Set(byChar.keys()))

    const built: GroundingPacket[] = []
    let wordEntryOnly = 0
    for (const [character, row] of byChar) {
      const entries = found.get(character)
      if (!entries?.length)
        continue

      // Require a `character` entry. A `noun` entry for 人 explains the word
      // ひと, not the shape of the glyph — the same wrong-question trap as the
      // grammar path, pointing the other way.
      const best = pickGlyphEntry(entries)
      if (!best) {
        wordEntryOnly++
        continue
      }

      built.push({
        targetTable: 'kanji',
        targetId: row.id,
        subject: character,
        aspect: 'glyph-origin',
        facts: {
          character,
          meanings: (row.meanings ?? []).map((m: { gloss: string }) => m.gloss).slice(0, 4).join(', '),
          strokeCount: row.strokeCount ?? 'unknown'
        },
        sources: [{
          sourceId: wiktionarySource.id,
          label: 'Wiktionary (Translingual)',
          locator: `${character} (${best.pos})`,
          passage: best.text
        }]
      })
      if (built.length >= limit)
        break
    }

    console.log(`Kanji without etymology: ${chars.length}`)
    console.log(`Packets built:           ${built.length}`)
    console.log(`Rejected (word entry only): ${wordEntryOnly}`)

    if (exportTo && !exportTo.startsWith('--')) {
      await writeFile(exportTo, JSON.stringify({
        promptVersion: PROMPT_VERSION,
        system: SYSTEM,
        schema: DRAFT_SCHEMA,
        packets: built.map(pk => ({ ...pk, renderedPrompt: packetToPrompt(pk) }))
      }, null, 2))
      console.log(`\nWrote ${built.length} packets to ${exportTo}`)
      return
    }
    if (built.length > 0) {
      console.log('\n--- DRY RUN. Sample packet: ---\n')
      console.log(packetToPrompt(built[0]!))
    }
    return
  }

  // ---- Grammar packets -------------------------------------------------------
  if (kind === 'grammar') {
    const points = await db
      .select({ id: grammarPoints.id, title: grammarPoints.title, pattern: grammarPoints.pattern })
      .from(grammarPoints)
      .leftJoin(etymologyEntries, eq(etymologyEntries.grammarPointId, grammarPoints.id))
      .where(and(eq(grammarPoints.languageId, language.id), isNull(etymologyEntries.id)))
      .limit(limit * 3)

    const keys = new Map(points.map(pt => [grammarLookupKey(pt.title), pt]))
    const dataset = await ensureDataset(DATASETS.wiktextract)
    console.log('Scanning wiktextract for source passages…')
    const found = await loadEtymologies(dataset.filePath, new Set(keys.keys()))

    const built: GroundingPacket[] = []
    let scriptOnly = 0
    for (const [key, point] of keys) {
      const entries = found.get(key)
      if (!entries?.length)
        continue

      // Reject the kana-glyph entries outright. Grounding は in the descent of
      // the letter 波 would produce a well-cited, entirely wrong explanation.
      const best = pickGrammarEntry(entries)
      if (!best) {
        scriptOnly++
        continue
      }

      built.push({
        targetTable: 'grammar_points',
        targetId: point.id,
        subject: `${point.title} — ${point.pattern}`,
        aspect: 'historical-grammar',
        facts: { title: point.title, pattern: point.pattern },
        sources: [{
          sourceId: wiktionarySource.id,
          label: 'Wiktionary (English)',
          locator: `${key} (${best.pos})`,
          passage: best.text
        }]
      })
      if (built.length >= limit)
        break
    }

    console.log(`Grammar points without etymology: ${points.length}`)
    console.log(`Packets built:                    ${built.length}`)
    console.log(`Rejected (script entry only):     ${scriptOnly}`)

    if (exportTo && !exportTo.startsWith('--')) {
      await writeFile(exportTo, JSON.stringify({
        promptVersion: PROMPT_VERSION,
        system: SYSTEM,
        schema: DRAFT_SCHEMA,
        packets: built.map(pk => ({ ...pk, renderedPrompt: packetToPrompt(pk) }))
      }, null, 2))
      console.log(`\nWrote ${built.length} packets to ${exportTo}`)
      return
    }
    if (built.length > 0) {
      console.log('\n--- DRY RUN. Sample packet: ---\n')
      console.log(packetToPrompt(built[0]!))
    }
    return
  }

  // Candidates: published words with no etymology yet, commonest first.
  const candidates = await db
    .select({ id: words.id, form: words.primaryForm, reading: words.primaryReading })
    .from(words)
    .leftJoin(etymologyEntries, eq(etymologyEntries.wordId, words.id))
    .where(and(
      eq(words.languageId, language.id),
      eq(words.published, true),
      eq(words.isCommon, true),
      isNull(etymologyEntries.id)
    ))
    .orderBy(sql`${words.frequencyRank} nulls last`)
    .limit(limit * 4)

  const dataset = await ensureDataset(DATASETS.wiktextract)
  console.log('Scanning wiktextract for source passages…')
  const etymologies = await loadEtymologies(dataset.filePath, new Set(candidates.map(c => c.form)))

  // NO PACKET, NO GENERATION. A word without a passage is dropped here and
  // never reaches the model at all.
  const packets: GroundingPacket[] = []
  for (const word of candidates) {
    const found = etymologies.get(word.form)
    if (!found?.length)
      continue
    packets.push({
      targetTable: 'words',
      targetId: word.id,
      subject: `${word.form} (${word.reading})`,
      aspect: 'word-origin',
      facts: { form: word.form, reading: word.reading },
      // Up to two passages: Wiktionary gives a separate etymology per part of
      // speech, and both are legitimate grounding. They share a sourceId, which
      // the validator handles.
      sources: found.slice(0, 2).map(e => ({
        sourceId: wiktionarySource.id,
        label: 'Wiktionary (English)',
        locator: `${word.form}${e.pos ? ` (${e.pos})` : ''}`,
        passage: e.text
      }))
    })
    if (packets.length >= limit)
      break
  }

  console.log(`Candidates considered: ${candidates.length}`)
  console.log(`Packets built:         ${packets.length}`)
  console.log(`Skipped (no source passage): ${candidates.length - packets.length}`)

  if (packets.length === 0) {
    console.log('\nNothing to enrich.')
    return
  }

  if (exportTo && !exportTo.startsWith('--')) {
    // Packets out, drafts back in. Whatever does the drafting, the validation
    // gate below is the same one the direct API path uses.
    await writeFile(exportTo, JSON.stringify({
      promptVersion: PROMPT_VERSION,
      system: SYSTEM,
      schema: DRAFT_SCHEMA,
      packets: packets.map(packet => ({ ...packet, renderedPrompt: packetToPrompt(packet) }))
    }, null, 2))
    console.log(`\nWrote ${packets.length} packets to ${exportTo}`)
    console.log('Draft them, then: enrich --import <drafts.json>')
    return
  }

  if (!execute) {
    console.log('\n--- DRY RUN. Sample packet: ---\n')
    console.log(packetToPrompt(packets[0]!))
    console.log('\n--- end ---')
    console.log(`\nRe-run with --export <file> to draft elsewhere, or --execute to call ${MODEL}.`)
    return
  }

  if (!env.ANTHROPIC_API_KEY)
    throw new Error('ANTHROPIC_API_KEY not set')
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

  const [run] = await db.insert(enrichmentRuns).values({
    kind: 'etymology-draft',
    languageId: language.id,
    model: MODEL,
    promptVersion: PROMPT_VERSION,
    status: 'running',
    itemCount: packets.length
  }).returning({ id: enrichmentRuns.id })

  let queued = 0
  let dropped = 0
  let rejected = 0

  for (const packet of packets) {
    const [item] = await db.insert(enrichmentItems).values({
      runId: run!.id,
      targetTable: packet.targetTable,
      targetId: packet.targetId,
      // Stored verbatim: this IS the audit trail, and the text the validator
      // checks quotes against.
      inputContext: packet as unknown as Record<string, unknown>,
      status: 'pending'
    }).returning({ id: enrichmentItems.id })

    let draft: EnrichmentDraft
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 2000,
        thinking: { type: 'adaptive' },
        system: SYSTEM,
        messages: [{ role: 'user', content: packetToPrompt(packet) }],
        output_config: { format: { type: 'json_schema', schema: DRAFT_SCHEMA } }
      } as never) as unknown as { content: Array<{ type: string, text?: string }> }

      const text = response.content.find(b => b.type === 'text')?.text ?? '{}'
      draft = JSON.parse(text) as EnrichmentDraft
    } catch (err) {
      await db.update(enrichmentItems)
        .set({ status: 'auto-rejected', error: String(err) })
        .where(eq(enrichmentItems.id, item!.id))
      rejected++
      continue
    }

    const validation = validateDraft(draft, packet)
    await db.update(enrichmentItems)
      .set({
        output: draft as unknown as Record<string, unknown>,
        validation: validation as unknown as Record<string, unknown>,
        status: validation.ok ? 'generated' : 'auto-rejected'
      })
      .where(eq(enrichmentItems.id, item!.id))

    if (validation.dropped) {
      dropped++
      continue
    }
    if (!validation.ok) {
      console.log(`  rejected ${packet.subject}: ${validation.reason}`)
      rejected++
      continue
    }

    await persistDraft({
      draft,
      packet,
      languageId: language.id,
      runId: run!.id,
      itemId: item!.id,
      model: MODEL
    })

    queued++
  }

  await db.update(enrichmentRuns).set({ status: 'complete' }).where(eq(enrichmentRuns.id, run!.id))

  console.log(`\nQueued for review: ${queued}`)
  console.log(`Model declined (no support in passage): ${dropped}`)
  console.log(`Failed validation: ${rejected}`)
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
