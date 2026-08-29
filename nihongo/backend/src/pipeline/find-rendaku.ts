/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import {
  contentReviewQueue,
  etymologyEntries,
  etymologySources,
  kanji,
  kanjiReadings,
  languages,
  sources,
  words
} from '@nihongo/shared/db/schema'
import { analyseRendaku, hasVoicedObstruent } from '@nihongo/shared/lib'
import { and, eq } from 'drizzle-orm'

/**
 * Find real rendaku in the corpus.
 *
 * Detected, not curated: a two-kanji word whose reading starts with the first
 * kanji's kun-reading and ends with a VOICED form of the second kanji's
 * kun-reading is rendaku. That is computable from KANJIDIC readings, which are
 * already imported.
 *
 * Lyman's Law is then checked against each find, which is the point — the law
 * is what turns a list of odd readings into one rule plus its exceptions.
 *
 *   pnpm -C nihongo/backend find:rendaku            # report only
 *   pnpm -C nihongo/backend find:rendaku --apply    # write entries
 */

function stripOkurigana(reading: string): string {
  // KANJIDIC marks okurigana after a dot (た.べる) and prefixes with a hyphen.
  return reading.split('.')[0]!.replace(/-/g, '')
}

async function main() {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing')

  const kanjiRows = await db
    .select({ id: kanji.id, character: kanji.character })
    .from(kanji)
    .where(eq(kanji.languageId, language.id))
  const idByChar = new Map(kanjiRows.map(k => [k.character, k.id]))

  const kunByKanji = new Map<string, string[]>()
  for (const row of await db
    .select({ kanjiId: kanjiReadings.kanjiId, reading: kanjiReadings.reading })
    .from(kanjiReadings)
    .where(eq(kanjiReadings.type, 'kun'))) {
    const list = kunByKanji.get(row.kanjiId) ?? []
    list.push(stripOkurigana(row.reading))
    kunByKanji.set(row.kanjiId, list)
  }

  const wordRows = await db
    .select({ form: words.primaryForm, reading: words.primaryReading, isCommon: words.isCommon })
    .from(words)
    .where(and(eq(words.languageId, language.id), eq(words.published, true)))

  interface Find {
    word: string
    reading: string
    first: string
    second: string
    observed: string
    base: string
    violates: boolean
  }
  const finds: Find[] = []
  let blocked = 0

  for (const w of wordRows) {
    const chars = [...w.form]
    // Two-kanji compounds only: longer forms need real segmentation, and a
    // wrong split would invent rendaku that is not there.
    if (chars.length !== 2)
      continue
    const [a, b] = chars as [string, string]
    const aId = idByChar.get(a)
    const bId = idByChar.get(b)
    if (!aId || !bId)
      continue

    const aKuns = kunByKanji.get(aId) ?? []
    const bKuns = kunByKanji.get(bId) ?? []
    if (aKuns.length === 0 || bKuns.length === 0)
      continue

    for (const aKun of aKuns) {
      if (!w.reading.startsWith(aKun))
        continue
      const tail = w.reading.slice(aKun.length)
      for (const bKun of bKuns) {
        if (tail.length !== bKun.length)
          continue
        const analysis = analyseRendaku(tail, bKun)
        if (analysis.isRendaku) {
          finds.push({
            word: w.form,
            reading: w.reading,
            first: a,
            second: b,
            observed: tail,
            base: bKun,
            violates: analysis.violatesLyman
          })
        } else if (tail === bKun && hasVoicedObstruent(bKun)) {
          // Rendaku did NOT apply and Lyman's Law explains exactly why.
          blocked++
        }
      }
    }
  }

  const unique = [...new Map(finds.map(f => [f.word, f])).values()]
  const violations = unique.filter(f => f.violates)

  // ---- Optionally write them as etymology entries ----------------------------
  //
  // Written DIRECTLY rather than through the model: every claim here is pure
  // computation over KANJIDIC readings, so there is nothing to infer and
  // nothing to hallucinate. Sending it to a model could only add risk.
  if (process.argv.includes('--apply')) {
    const [kanjidic] = await db
      .select({ id: sources.id })
      .from(sources)
      .where(eq(sources.slug, 'kanjidic2'))
      .limit(1)
    if (!kanjidic)
      throw new Error('kanjidic2 source row missing — run db:seed')

    const wordIds = new Map(
      (await db
        .select({ id: words.id, form: words.primaryForm })
        .from(words)
        .where(and(eq(words.languageId, language.id), eq(words.published, true))))
        .map(w => [w.form, w.id])
    )

    let written = 0
    for (const f of unique) {
      const wordId = wordIds.get(f.word)
      if (!wordId)
        continue

      const claim = `${f.word} shows rendaku: ${f.second} is normally ${f.base}, and voices to ${f.observed} as the second half of a compound.`
      const body = f.violates
        ? `Rendaku usually cannot apply when the second element already contains a voiced sound (Lyman's Law), yet ${f.word} voices anyway. Exceptions like this are real, and worth knowing so the rule does not feel broken when you meet one.`
        : `${f.base} already begins a word cleanly, so nothing blocks the change. Lyman's Law says rendaku is blocked when the second element already contains a voiced sound — ${f.base} does not, so it voices. Once you can spot that, readings like ${f.reading} stop needing to be memorised one at a time.`

      const [entry] = await db.insert(etymologyEntries).values({
        languageId: language.id,
        wordId,
        aspect: 'rendaku',
        claim,
        body,
        confidence: 'well-supported',
        isDisputed: f.violates,
        isPrimary: false,
        status: 'in-review',
        generatedBy: 'system',
        sourceCount: 1
      }).onConflictDoNothing().returning({ id: etymologyEntries.id })
      if (!entry)
        continue

      await db.insert(etymologySources).values({
        etymologyId: entry.id,
        sourceId: kanjidic.id,
        locator: `${f.second} (kun ${f.base})`,
        // The quote IS the data: KANJIDIC's reading for that kanji.
        quote: `${f.second}: ${f.base}`,
        supports: 'supports',
        sortIndex: 0
      }).onConflictDoNothing()

      await db.insert(contentReviewQueue).values({
        languageId: language.id,
        targetTable: 'etymology_entries',
        targetId: entry.id,
        changeType: 'create',
        proposed: { claim, body },
        origin: 'system',
        priority: 15,
        status: 'pending'
      }).onConflictDoNothing()
      written++
    }
    console.log(`\nEtymology entries written: ${written}`)
  }

  console.log(`Two-kanji compounds scanned: ${wordRows.length}`)
  console.log(`Rendaku detected:            ${unique.length}`)
  console.log(`Blocked by Lyman's Law:      ${blocked}`)
  console.log(`Violating Lyman's Law:       ${violations.length}`)
  console.log('\nExamples:')
  for (const f of unique.slice(0, 10)) {
    console.log(`  ${f.word} (${f.reading}): ${f.second} ${f.base} -> ${f.observed}${f.violates ? '  [violates Lyman]' : ''}`)
  }
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
