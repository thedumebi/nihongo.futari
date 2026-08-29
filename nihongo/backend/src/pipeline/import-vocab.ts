/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import {
  importRuns,
  importSources,
  kanjiReadings,
  kanji as kanjiTable,
  languageLevels,
  languages,
  wordForms,
  wordKanji,
  words,
  wordSenses,
  wordSenseSources
} from '@nihongo/shared/db/schema'
import { and, eq } from 'drizzle-orm'

import { DATASETS, ensureDataset } from './fetch.js'
import { loadJlptLevel } from './sources/jlpt-levels.js'
import { frequencyRank, parseJmdict } from './sources/jmdict.js'
import { parseKanjidic2 } from './sources/kanjidic2.js'

/**
 * Import the N5 vocabulary and its kanji.
 *
 * Run locally, never on the VPS: JMdict is ~60 MB of XML and streaming it is
 * cheap on a laptop but pointless contention on a 2-vCPU box shared with two
 * other apps. Restore a dump instead.
 *
 *   pnpm -C nihongo/backend import:n5
 *
 * Idempotent. Words are keyed by JMdict's `ent_seq`, kanji by character, so a
 * re-run updates rather than duplicates.
 */

/** CJK Unified Ideographs — i.e. "is this character a kanji". */
const CJK = /[\u4E00-\u9FFF]/u

function pickPrimaryForm(entry: { kanji: Array<{ form: string, common: boolean }>, readings: Array<{ form: string }> }): string {
  const common = entry.kanji.find(k => k.common)
  return common?.form ?? entry.kanji[0]?.form ?? entry.readings[0]?.form ?? ''
}

const LEVEL_DATASETS = {
  N1: DATASETS.jlptN1,
  N2: DATASETS.jlptN2,
  N3: DATASETS.jlptN3,
  N4: DATASETS.jlptN4,
  N5: DATASETS.jlptN5
} as const

type LevelCode = keyof typeof LEVEL_DATASETS

async function main() {
  const requested = (process.argv[2] ?? 'N5').toUpperCase()
  if (!(requested in LEVEL_DATASETS))
    throw new Error(`Unknown level "${requested}". Expected one of ${Object.keys(LEVEL_DATASETS).join(', ')}`)
  const levelCode = requested as LevelCode

  const startedAt = new Date()
  console.log(`Fetching datasets for ${levelCode}…`)
  const [jm, kd, jl] = await Promise.all([
    ensureDataset(DATASETS.jmdict),
    ensureDataset(DATASETS.kanjidic2),
    ensureDataset(LEVEL_DATASETS[levelCode])
  ])

  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing — run db:seed first')

  const [level] = await db
    .select({ id: languageLevels.id })
    .from(languageLevels)
    .where(and(eq(languageLevels.languageId, language.id), eq(languageLevels.code, levelCode)))
    .limit(1)
  if (!level)
    throw new Error(`${levelCode} level row missing — run db:seed first`)

  const [source] = await db
    .select({ id: importSources.id })
    .from(importSources)
    .where(eq(importSources.code, 'jmdict'))
    .limit(1)
  if (!source)
    throw new Error('import_sources row for jmdict missing — run db:seed first')

  const [run] = await db.insert(importRuns).values({
    sourceId: source.id,
    languageId: language.id,
    status: 'running',
    datasetVersion: jm.checksum,
    datasetChecksum: jm.checksum,
    startedAt
  }).returning({ id: importRuns.id })

  // ---- 1. Which words are at this level? ------------------------------------
  const n5 = await loadJlptLevel(jl.filePath)
  const wanted = new Map<string, { expression: string, reading: string }>()
  for (const e of n5) {
    wanted.set(`${e.expression}|${e.reading}`, e)
    // Some list entries are kana-only where JMdict has a kanji spelling, and
    // vice versa. Index both so the match below is forgiving.
    wanted.set(`${e.expression}|`, e)
    wanted.set(`|${e.reading}`, e)
  }
  console.log(`${levelCode} list: ${n5.length} entries`)

  // ---- 2. Pull those entries out of JMdict ----------------------------------
  type Entry = Parameters<Parameters<typeof parseJmdict>[1]>[0]
  const keep: Entry[] = []

  const total = await parseJmdict(jm.filePath, (entry) => {
    const forms = entry.kanji.map(k => k.form)
    const reads = entry.readings.map(r => r.form)
    const hit = forms.some(f => reads.some(r => wanted.has(`${f}|${r}`)))
      || forms.some(f => wanted.has(`${f}|`))
      || (forms.length === 0 && reads.some(r => wanted.has(`|${r}`)))
    if (hit)
      keep.push(entry)
  })
  console.log(`JMdict: scanned ${total} entries, matched ${keep.length}`)

  // ---- 3. Write words -------------------------------------------------------
  let inserted = 0
  const kanjiChars = new Set<string>()

  for (const entry of keep) {
    const primaryForm = pickPrimaryForm(entry)
    const primaryReading = entry.readings[0]?.form ?? primaryForm
    if (!primaryForm)
      continue

    for (const ch of primaryForm) {
      if (CJK.test(ch))
        kanjiChars.add(ch)
    }

    // The best rank any of the entry's forms carries. JMdict tags each written
    // and spoken form separately, and a word is as common as its commonest
    // form.
    const ranks = [...entry.kanji, ...entry.readings]
      .map(f => frequencyRank(f.tags))
      .filter((v): v is number => v !== undefined)
    const rank = ranks.length > 0 ? Math.min(...ranks) : null

    const [word] = await db.insert(words).values({
      languageId: language.id,
      entSeq: entry.entSeq,
      primaryForm,
      primaryReading,
      levelId: level.id,
      frequencyRank: rank,
      isCommon: entry.kanji.some(k => k.common) || entry.readings.some(r => r.common),
      published: true,
      sourceRef: String(entry.entSeq),
      sourceHash: `${entry.entSeq}:${entry.senses.length}`
    }).onConflictDoUpdate({
      target: [words.languageId, words.entSeq],
      set: { primaryForm, primaryReading, levelId: level.id, frequencyRank: rank, updatedAt: new Date() }
    }).returning({ id: words.id })

    if (!word)
      continue
    inserted++

    // Replace children wholesale — cheaper and less error-prone than diffing,
    // and safe because nothing human-edited lives on these rows.
    await db.delete(wordForms).where(eq(wordForms.wordId, word.id))
    await db.delete(wordSenses).where(eq(wordSenses.wordId, word.id))
    await db.delete(wordKanji).where(eq(wordKanji.wordId, word.id))

    const formRows = [
      ...entry.kanji.map((k, i) => ({ wordId: word.id, form: k.form, kind: 'kanji', isCommon: k.common, tags: k.tags, sortIndex: i })),
      ...entry.readings.map((r, i) => ({ wordId: word.id, form: r.form, kind: 'kana', isCommon: r.common, tags: r.tags, sortIndex: 100 + i }))
    ]
    if (formRows.length > 0)
      await db.insert(wordForms).values(formRows)

    for (const [i, s] of entry.senses.entries()) {
      const [sense] = await db.insert(wordSenses).values({
        wordId: word.id,
        sortIndex: i,
        glosses: s.glosses.map(text => ({ lang: 'en', text })),
        pos: s.pos,
        fields: s.fields,
        misc: s.misc,
        dialect: s.dialect,
        ...(s.info ? { info: s.info } : {}),
        restrictedToForms: s.restrictedToForms,
        crossRefs: s.crossRefs,
        antonyms: s.antonyms
      }).returning({ id: wordSenses.id })

      if (sense && s.loanSources.length > 0) {
        await db.insert(wordSenseSources).values(s.loanSources.map(l => ({
          senseId: sense.id,
          sourceLang: l.lang,
          ...(l.text ? { sourceText: l.text } : {}),
          isWasei: l.wasei,
          partial: l.partial
        })))
      }
    }
  }
  console.log(`Words: ${inserted} written, ${kanjiChars.size} distinct kanji referenced`)

  // ---- 4. Kanji used by those words -----------------------------------------
  let kanjiCount = 0
  const kanjiIds = new Map<string, string>()
  const pending: Array<Parameters<Parameters<typeof parseKanjidic2>[1]>[0]> = []
  await parseKanjidic2(kd.filePath, (k) => {
    if (kanjiChars.has(k.character))
      pending.push(k)
  })

  for (const k of pending) {
    const [row] = await db.insert(kanjiTable).values({
      languageId: language.id,
      character: k.character,
      ...(k.codepoint !== undefined ? { codepoint: k.codepoint } : {}),
      ...(k.strokeCount !== undefined ? { strokeCount: k.strokeCount } : {}),
      ...(k.grade !== undefined ? { grade: k.grade } : {}),
      jouyou: k.grade !== undefined && k.grade <= 8,
      levelId: level.id,
      ...(k.frequency !== undefined ? { frequencyRank: k.frequency } : {}),
      meanings: k.meanings.map(gloss => ({ gloss, lang: 'en' })),
      published: true,
      sourceRef: k.character,
      sourceHash: `${k.strokeCount}:${k.meanings.length}`
    }).onConflictDoUpdate({
      target: [kanjiTable.languageId, kanjiTable.character],
      set: { meanings: k.meanings.map(gloss => ({ gloss, lang: 'en' })), updatedAt: new Date() }
    }).returning({ id: kanjiTable.id })

    if (!row)
      continue
    kanjiIds.set(k.character, row.id)
    kanjiCount++

    await db.delete(kanjiReadings).where(eq(kanjiReadings.kanjiId, row.id))
    const readings = [
      ...k.onReadings.map((reading, i) => ({ kanjiId: row.id, type: 'on', reading, sortIndex: i })),
      ...k.kunReadings.map((reading, i) => ({ kanjiId: row.id, type: 'kun', reading, sortIndex: 100 + i }))
    ]
    if (readings.length > 0)
      await db.insert(kanjiReadings).values(readings)
  }
  console.log(`Kanji: ${kanjiCount} written`)

  // ---- 5. Link words to their kanji ----------------------------------------
  const allWords = await db
    .select({ id: words.id, form: words.primaryForm })
    .from(words)
    .where(and(eq(words.languageId, language.id), eq(words.levelId, level.id)))

  for (const w of allWords) {
    const rows = [...w.form].filter(ch => CJK.test(ch)).map((ch, position) => {
      const kanjiId = kanjiIds.get(ch)
      return kanjiId ? { wordId: w.id, kanjiId, position } : null
    }).filter(Boolean) as Array<{ wordId: string, kanjiId: string, position: number }>
    if (rows.length > 0)
      await db.insert(wordKanji).values(rows).onConflictDoNothing()
  }

  await db.update(importRuns).set({
    status: 'succeeded',
    finishedAt: new Date(),
    rowsRead: total,
    rowsInserted: inserted + kanjiCount
  }).where(eq(importRuns.id, run!.id))

  console.log('\nDone. Run `import:vocab-study <level>` to build study items and drills.')
}

main()
  .catch((err) => {
    console.error('Import failed:', err)
    process.exitCode = 1
  })
  .finally(async () => { await connection.end() })
