/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import {
  exercisePrompts,
  exerciseTemplates,
  kanji,
  languages,
  phoneticSeries,
  phoneticSeriesMembers,
  studyItemFacets,
  studyItems
} from '@nihongo/shared/db/schema'
import { and, asc, eq } from 'drizzle-orm'

/**
 * Drill the sound series themselves.
 *
 * Learning 青 = セイ turns 晴・清・請・精・静 from five memorisations into one
 * rule, so the rule is worth scheduling in its own right rather than only
 * browsing. Series become study items via the `phoneticSeriesId` arm.
 *
 * Only series that survived the reliability floor are here, so every drilled
 * rule actually predicts more often than not.
 *
 *   pnpm -C nihongo/backend import:series-drill
 */

const CHOICES = 4
/** Enough members that the pattern is visible rather than a coincidence. */
const MIN_MEMBERS = 3

function shuffle<T>(items: T[], seed: string): T[] {
  const out = [...items]
  let state = [...seed].reduce((a, c) => (a * 31 + c.codePointAt(0)!) % 2147483647, 11) || 1
  for (let i = out.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) % 2147483648
    const j = state % (i + 1)
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

async function main() {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing')

  const [template] = await db
    .select({ id: exerciseTemplates.id })
    .from(exerciseTemplates)
    .where(eq(exerciseTemplates.code, 'sound-series-pick'))
    .limit(1)
  if (!template)
    throw new Error('sound-series-pick template missing — run the seeds')

  const seriesRows = await db
    .select({
      id: phoneticSeries.id,
      component: phoneticSeries.componentCharacter,
      reading: phoneticSeries.primaryReading,
      memberCount: phoneticSeries.memberCount,
      reliability: phoneticSeries.reliability
    })
    .from(phoneticSeries)
    .where(eq(phoneticSeries.languageId, language.id))
    .orderBy(asc(phoneticSeries.componentCharacter))

  const usable = seriesRows.filter(s => (s.memberCount ?? 0) >= MIN_MEMBERS)
  const readingPool = [...new Set(usable.map(s => s.reading).filter((r): r is string => Boolean(r)))]
  console.log(`Series with ${MIN_MEMBERS}+ members: ${usable.length}`)

  // Members that FOLLOW the rule, for the examples shown on the card. The
  // exceptions are on the browse page, but a card teaching the rule should
  // show the rule working.
  const followers = new Map<string, string[]>()
  for (const row of await db
    .select({ seriesId: phoneticSeriesMembers.seriesId, character: kanji.character })
    .from(phoneticSeriesMembers)
    .innerJoin(kanji, eq(kanji.id, phoneticSeriesMembers.kanjiId))
    .where(eq(phoneticSeriesMembers.followsSeries, true))
    .orderBy(asc(phoneticSeriesMembers.sortIndex))) {
    const list = followers.get(row.seriesId) ?? []
    list.push(row.character)
    followers.set(row.seriesId, list)
  }

  let items = 0
  let facets = 0
  let prompts = 0

  for (const [index, series] of usable.entries()) {
    if (!series.reading)
      continue
    const examples = followers.get(series.id) ?? []
    if (examples.length < 2)
      continue

    const [created] = await db.insert(studyItems).values({
      languageId: language.id,
      phoneticSeriesId: series.id,
      kind: 'phonetic-series',
      // Most reliable first: the rules that always hold should be met before
      // the ones that mostly hold.
      sortIndex: Math.round((1 - Number(series.reliability ?? 0)) * 1000) + index,
      published: true,
      active: true
    }).onConflictDoNothing().returning({ id: studyItems.id })

    const studyItemId = created?.id ?? (await db
      .select({ id: studyItems.id })
      .from(studyItems)
      .where(eq(studyItems.phoneticSeriesId, series.id))
      .limit(1))[0]?.id
    if (!studyItemId)
      continue
    if (created)
      items++

    const [insertedFacet] = await db.insert(studyItemFacets).values({
      studyItemId,
      facet: 'reading',
      enabled: true,
      introOrder: 2
    }).onConflictDoNothing().returning({ id: studyItemFacets.id })

    const facetId = insertedFacet?.id ?? (await db
      .select({ id: studyItemFacets.id })
      .from(studyItemFacets)
      .where(and(eq(studyItemFacets.studyItemId, studyItemId), eq(studyItemFacets.facet, 'reading')))
      .limit(1))[0]?.id
    if (!facetId)
      continue
    if (insertedFacet)
      facets++

    const distractors = shuffle(readingPool.filter(r => r !== series.reading), series.id).slice(0, CHOICES - 1)

    const [prompt] = await db.insert(exercisePrompts).values({
      facetId,
      templateId: template.id,
      languageId: language.id,
      prompt: {
        kind: 'sound-series',
        component: series.component,
        examples: examples.slice(0, 5),
        reliability: Number(series.reliability ?? 0),
        instruction: `Which on-reading does ${series.component} predict?`
      },
      answer: { primary: series.reading, accepted: [series.reading] },
      distractors
    }).onConflictDoNothing().returning({ id: exercisePrompts.id })
    if (prompt)
      prompts++
  }

  console.log(`Series study items: ${items}`)
  console.log(`Reading facets:     ${facets}`)
  console.log(`Series prompts:     ${prompts}`)
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
