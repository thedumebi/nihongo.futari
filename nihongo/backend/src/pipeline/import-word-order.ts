/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import {
  exercisePrompts,
  exerciseTemplates,
  languages,
  sentences,
  sentenceTokens,
  sentenceTranslations,
  studyItemFacets,
  studyItems
} from '@nihongo/shared/db/schema'
import { and, asc, eq } from 'drizzle-orm'
import { access } from 'node:fs/promises'
import path from 'node:path'

/**
 * Word-order exercises: rebuild a sentence from its shuffled words.
 *
 * This is the one drill that tests word ORDER rather than vocabulary, which is
 * most of what makes Japanese sentences hard for an English speaker — particles
 * do the work that position does in English.
 *
 * Sentences become study items in their own right here (the `sentence` arm of
 * the study_items arc), so they can be scheduled and appear as their own deck.
 *
 *   pnpm -C nihongo/backend import:word-order
 */

/** Too few tokens and there is nothing to arrange; too many and it is a puzzle. */
const MIN_TOKENS = 4
const MAX_TOKENS = 8
const PUBLIC_AUDIO = path.resolve(process.cwd(), '../frontend/public/audio')

/** Deterministic shuffle, so re-running does not reshuffle every prompt. */
function shuffle<T>(items: T[], seed: string): T[] {
  const out = [...items]
  let state = [...seed].reduce((a, c) => (a * 31 + c.codePointAt(0)!) % 2147483647, 7) || 1
  for (let i = out.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) % 2147483648
    const j = state % (i + 1)
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

async function main() {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, 'ja')).limit(1)
  if (!language)
    throw new Error('Japanese language row missing')

  const [template] = await db
    .select({ id: exerciseTemplates.id })
    .from(exerciseTemplates)
    .where(eq(exerciseTemplates.code, 'word-order'))
    .limit(1)
  if (!template)
    throw new Error('word-order template missing — run the seeds')

  const sentenceRows = await db
    .select({ id: sentences.id, text: sentences.text, levelId: sentences.levelId })
    .from(sentences)
    .where(and(eq(sentences.languageId, language.id), eq(sentences.published, true)))
    .orderBy(asc(sentences.text))

  const tokensBySentence = new Map<string, string[]>()
  /**
   * Per-token furigana, keyed by surface.
   *
   * The tiles were bare strings, so a sentence containing 静か offered no way
   * to read it — the reading exists on sentence_tokens and simply was not
   * carried through. Keyed by surface rather than by position because the
   * tiles are shuffled, and safe to key that way because a sentence with a
   * repeated surface is rejected below.
   */
  const furiganaBySentence = new Map<string, Record<string, unknown>>()

  /**
   * Particles whose spelling and pronunciation differ.
   *
   * は is read わ and へ is read え when they are particles, and a token that is
   * ONE of these characters standing alone is the particle — the syllable
   * inside a word would not be tokenised on its own. The tokenizer left `pos`
   * empty for every row, so this is the only handle available, but it is a
   * reliable one at token granularity.
   *
   * を needs no such test: it has no use in modern Japanese except as the
   * object particle, and it is pronounced お wherever it appears.
   *
   * It matters most in romaji mode, where は would otherwise be taught as
   * "ha" to precisely the reader who cannot yet correct for it.
   */
  const SPOKEN_PARTICLE: Record<string, string> = { は: 'わ', へ: 'え', を: 'お' }
  for (const token of await db
    .select({
      sentenceId: sentenceTokens.sentenceId,
      surface: sentenceTokens.surface,
      index: sentenceTokens.index,
      furigana: sentenceTokens.furigana
    })
    .from(sentenceTokens)
    .orderBy(asc(sentenceTokens.sentenceId), asc(sentenceTokens.index))) {
    const list = tokensBySentence.get(token.sentenceId) ?? []
    list.push(token.surface)
    tokensBySentence.set(token.sentenceId, list)

    const spoken = SPOKEN_PARTICLE[token.surface]
    if (spoken || token.furigana) {
      const map = furiganaBySentence.get(token.sentenceId) ?? {}
      map[token.surface] = spoken
        ? [{ t: token.surface, r: spoken }]
        : token.furigana
      furiganaBySentence.set(token.sentenceId, map)
    }
  }

  const translations = new Map<string, string>()
  for (const row of await db
    .select({ sentenceId: sentenceTranslations.sentenceId, text: sentenceTranslations.text })
    .from(sentenceTranslations)
    .where(eq(sentenceTranslations.lang, 'en'))) {
    translations.set(row.sentenceId, row.text)
  }

  let items = 0
  let facets = 0
  let prompts = 0
  let skipped = 0

  for (const [index, sentence] of sentenceRows.entries()) {
    const tokens = tokensBySentence.get(sentence.id) ?? []
    if (tokens.length < MIN_TOKENS || tokens.length > MAX_TOKENS) {
      skipped++
      continue
    }
    // Repeated surfaces make the arrangement ambiguous to grade and to play:
    // two identical tiles have no distinguishable correct position.
    if (new Set(tokens).size !== tokens.length) {
      skipped++
      continue
    }

    const [created] = await db.insert(studyItems).values({
      languageId: language.id,
      sentenceId: sentence.id,
      kind: 'sentence',
      levelId: sentence.levelId,
      sortIndex: index,
      published: true,
      active: true
    }).onConflictDoNothing().returning({ id: studyItems.id })

    const studyItemId = created?.id ?? (await db
      .select({ id: studyItems.id })
      .from(studyItems)
      .where(eq(studyItems.sentenceId, sentence.id))
      .limit(1))[0]?.id
    if (!studyItemId)
      continue
    if (created)
      items++

    const [insertedFacet] = await db.insert(studyItemFacets).values({
      studyItemId,
      facet: 'usage',
      enabled: true,
      introOrder: 3
    }).onConflictDoNothing().returning({ id: studyItemFacets.id })

    const facetId = insertedFacet?.id ?? (await db
      .select({ id: studyItemFacets.id })
      .from(studyItemFacets)
      .where(and(eq(studyItemFacets.studyItemId, studyItemId), eq(studyItemFacets.facet, 'usage')))
      .limit(1))[0]?.id
    if (!facetId)
      continue
    if (insertedFacet)
      facets++

    const audio = await exists(path.join(PUBLIC_AUDIO, 'sentences', `${sentence.id}.m4a`))
      ? `/audio/sentences/${sentence.id}.m4a`
      : null

    const correct = tokens.join('')
    const [prompt] = await db.insert(exercisePrompts).values({
      facetId,
      templateId: template.id,
      languageId: language.id,
      prompt: {
        kind: 'word-order',
        tokens: shuffle(tokens, sentence.id),
        tokenFurigana: furiganaBySentence.get(sentence.id) ?? {},
        translation: translations.get(sentence.id) ?? null,
        instruction: 'Put the words in order'
      },
      // Both forms accepted: tokens do not include the trailing 。, so the
      // arrangement is the sentence minus its punctuation.
      answer: { primary: correct, accepted: [correct, sentence.text] },
      assets: audio ? { audio } : {}
    }).onConflictDoUpdate({
      target: [exercisePrompts.facetId, exercisePrompts.templateId, exercisePrompts.version],
      set: {
        prompt: {
          kind: 'word-order',
          tokens: shuffle(tokens, sentence.id),
          tokenFurigana: furiganaBySentence.get(sentence.id) ?? {},
          translation: translations.get(sentence.id) ?? null,
          instruction: 'Put the words in order'
        },
        answer: { primary: correct, accepted: [correct, sentence.text] },
        assets: audio ? { audio } : {},
        updatedAt: new Date()
      }
    }).returning({ id: exercisePrompts.id })
    if (prompt)
      prompts++
  }

  console.log(`Sentence study items: ${items}`)
  console.log(`Usage facets:         ${facets}`)
  console.log(`Word-order prompts:   ${prompts}`)
  console.log(`Skipped (length or repeated words): ${skipped}`)
}

main()
  .catch((err) => {
    console.error('Failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await connection.end()
  })
