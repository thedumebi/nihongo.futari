import type { CrosswordScript, CrosswordSource } from '@nihongo/shared/constants'
import type {
  CrosswordCandidate,
  CrosswordEntry,
  CrosswordGrid,
  CrosswordPuzzle,
  CrosswordQuery,
  CrosswordResultInput,
  CrosswordResultResponse
} from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import {
  crosswordResults,
  languageLevels,
  languages,
  srsCards,
  studyItemFacets,
  studyItems,
  words,
  wordSenses
} from '@nihongo/shared/db/schema'
import { crosswordCells, crosswordScript, generateCrossword, seedFrom, studyDateFor } from '@nihongo/shared/lib'
import { and, desc, eq, gte, isNotNull, or, sql } from 'drizzle-orm'
import { createHash, randomInt } from 'node:crypto'

import { assetUrl } from '../lib/assets.js'
import { crosswordClue } from '../lib/crossword-clues.js'
import { posLabel } from '../lib/pos.js'
import { loadUserContext } from './progress.service.js'

/**
 * The kana crossword.
 *
 * Puzzles are generated, not stored: the word lists and a seed make one, and
 * it is sent whole — answers included, since this is practice and the phone
 * checks each kana as it is typed. Only a finished puzzle is recorded.
 *
 * Words come from the learner's level, filtered to ones that make a fair clue
 * (`crosswordClue`), and split by script: a puzzle is all hiragana or, for
 * loanwords, all katakana, because crossing kana must match exactly.
 */

/** "Words I know" needs this many usable words; fewer is topped up with new ones. */
export const KNOWN_ENOUGH = 12
/** Below this many known words there is nothing to top up — learn some first. */
const KNOWN_AT_ALL = 4
/** A loanword puzzle needs a pool this big to come out well. */
const LOANWORDS_ENOUGH = 15
/** Roughly one in this many new or mixed puzzles is a loanword one. */
const LOANWORD_EVERY = 6
/** Words from this many recent puzzles are placed only when nothing else fits. */
const RECENT_PUZZLES = 5

interface PoolWord {
  id: string
  form: string
  reading: string
  meanings: string[]
  pos: string | null
  entSeq: number | null
  script: CrosswordScript
  candidate: CrosswordCandidate
}

type CrosswordError = 'no-level' | 'learn-more' | 'no-puzzle'

/** The level's words that can go in a crossword, each with its clue. */
async function levelPool(languageId: string, levelId: string): Promise<PoolWord[]> {
  const rows = await db
    .select({
      id: words.id,
      form: words.primaryForm,
      reading: words.primaryReading,
      entSeq: words.entSeq,
      glosses: wordSenses.glosses,
      pos: wordSenses.pos,
      misc: wordSenses.misc
    })
    .from(words)
    .innerJoin(wordSenses, and(eq(wordSenses.wordId, words.id), eq(wordSenses.sortIndex, 0)))
    .where(and(
      eq(words.languageId, languageId),
      eq(words.levelId, levelId),
      eq(words.published, true),
      // The level lists were matched to JMdict by reading as well as spelling,
      // which let in rare homographs — 朝 read ちょう, "dynasty". The glossary
      // keeps them out the same way.
      or(eq(words.isCommon, true), isNotNull(words.frequencyRank))
    ))
    // Postgres row order is not stable; a seed must always see the same list.
    .orderBy(words.id)

  const seen = new Set<string>()
  const pool: PoolWord[] = []
  for (const r of rows) {
    const glosses = r.glosses.filter(g => g.lang === 'en').map(g => g.text)
    const clue = crosswordClue({ reading: r.reading, form: r.form, glosses, pos: r.pos, misc: r.misc })
    const script = crosswordScript(r.reading)
    const cells = crosswordCells(r.reading)
    // One entry per spelling: 一日 is いちにち and ついたち, two rows, but a
    // grid only cares what is written in the cells.
    if (!clue || !script || cells.length < 2 || cells.length > 5 || seen.has(cells.join('')))
      continue
    seen.add(cells.join(''))
    pool.push({
      id: r.id,
      form: r.form,
      reading: r.reading,
      meanings: glosses.slice(0, 3),
      pos: posLabel(r.pos),
      entSeq: r.entSeq,
      script,
      candidate: { id: r.id, cells, clue }
    })
  }
  return pool
}

/** Words at this level the learner knows: any card on the word past learning. */
async function knownWordIds(userId: string, levelId: string): Promise<Set<string>> {
  const rows = await db
    .selectDistinct({ id: studyItems.wordId })
    .from(srsCards)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .where(and(
      eq(srsCards.userId, userId),
      gte(srsCards.state, 2),
      eq(srsCards.suspended, false),
      eq(studyItems.levelId, levelId),
      isNotNull(studyItems.wordId)
    ))
  return new Set(rows.map(r => r.id!))
}

/** Words at this level with any card at all — "new" means none of these. */
async function seenWordIds(userId: string, levelId: string): Promise<Set<string>> {
  const rows = await db
    .selectDistinct({ id: studyItems.wordId })
    .from(srsCards)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
    .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
    .where(and(eq(srsCards.userId, userId), eq(studyItems.levelId, levelId), isNotNull(studyItems.wordId)))
  return new Set(rows.map(r => r.id!))
}

/** Words from the learner's last few puzzles, so the next one is not the same again. */
async function recentWordIds(userId: string): Promise<Set<string>> {
  const rows = await db
    .select({ wordIds: crosswordResults.wordIds })
    .from(crosswordResults)
    .where(eq(crosswordResults.userId, userId))
    .orderBy(desc(crosswordResults.completedAt))
    .limit(RECENT_PUZZLES)
  return new Set(rows.flatMap(r => r.wordIds))
}

/** Names the grid itself, so a result and a resumed puzzle refer to what was played. */
function puzzleKeyOf(level: string, grid: CrosswordGrid): string {
  const body = JSON.stringify({ level, cells: grid.cells, placements: grid.placements.map(p => [p.id, p.dir, p.row, p.col]) })
  return createHash('sha1').update(body).digest('hex').slice(0, 24)
}

function audioOf(word: PoolWord): string | null {
  return word.entSeq ? assetUrl(`/audio/words/${word.entSeq}.m4a`) : null
}

function wordView(word: PoolWord) {
  return {
    form: word.form,
    reading: word.reading,
    meanings: word.meanings,
    pos: word.pos,
    wordId: word.id,
    answer: word.candidate.cells,
    clue: word.candidate.clue,
    audio: audioOf(word)
  }
}

export async function getCrossword(userId: string, query: CrosswordQuery): Promise<CrosswordPuzzle | { error: CrosswordError, knownCount?: number }> {
  const [level] = await db
    .select({ id: languageLevels.id, languageId: languages.id })
    .from(languageLevels)
    .innerJoin(languages, eq(languages.id, languageLevels.languageId))
    .where(and(eq(languages.code, query.languageCode), eq(languageLevels.code, query.level)))
    .limit(1)
  if (!level)
    return { error: 'no-level' }

  const pool = await levelPool(level.languageId, level.id)
  const byId = new Map(pool.map(w => [w.id, w]))

  let source: CrosswordSource = query.source
  let seed: number
  let chosen: PoolWord[]
  let prefer = new Set<string>()
  let knownCount: number | null = null
  let note: string | null = null

  if (source === 'daily') {
    // The same puzzle for everyone on the same study day — the learner's own
    // day, which turns over at 4am local, not at midnight UTC.
    const { timezone, dayBoundaryHour } = await loadUserContext(userId)
    seed = seedFrom(`${query.level}:${studyDateFor(new Date(), timezone, dayBoundaryHour)}`)
    chosen = pool.filter(w => w.script === 'hiragana')
  } else {
    seed = randomInt(0, 2 ** 31)
    const known = await knownWordIds(userId, level.id)
    const knownWords = pool.filter(w => known.has(w.id) && w.script === 'hiragana')

    if (source === 'known') {
      knownCount = knownWords.length
      if (knownWords.length < KNOWN_AT_ALL)
        return { error: 'learn-more', knownCount }
      if (knownWords.length < KNOWN_ENOUGH) {
        source = 'mix'
        note = `You know ${knownWords.length} ${query.level} words that fit a puzzle, so it is topped up with new ones.`
      }
    }

    // New and mixed puzzles are sometimes all loanwords — they cannot share a
    // grid with hiragana words, so this is the only way they appear.
    const loanwords = pool.filter(w => w.script === 'katakana')
    if ((source === 'new' || source === 'mix') && loanwords.length >= LOANWORDS_ENOUGH && seed % LOANWORD_EVERY === 0)
      source = 'loanwords'

    if (source === 'known') {
      chosen = knownWords
    } else if (source === 'loanwords') {
      chosen = loanwords
    } else if (source === 'new') {
      const seen = await seenWordIds(userId, level.id)
      chosen = pool.filter(w => w.script === 'hiragana' && !seen.has(w.id))
    } else {
      // Mix: everything, known words placed first wherever they fit.
      chosen = pool.filter(w => w.script === 'hiragana')
      prefer = new Set(knownWords.map(w => w.id))
      knownCount ??= knownWords.length
    }
  }

  const avoid = source === 'daily' ? new Set<string>() : await recentWordIds(userId)
  const candidates = chosen.map(w => w.candidate)
  const levelSameScript = pool.filter(w => w.script === (source === 'loanwords' ? 'katakana' : 'hiragana')).map(w => w.candidate)

  let grid: CrosswordGrid | null = null
  // A rare unlucky seed is retried; the daily varies its seed deterministically.
  for (let tryNo = 0; tryNo < 4 && !grid; tryNo++) {
    grid = generateCrossword(candidates, {
      seed: seed + tryNo,
      attempts: 15,
      minWords: source === 'known' ? 3 : 4,
      avoid,
      prefer,
      bonusCandidates: [candidates, levelSameScript]
    })
  }
  if (!grid)
    return { error: 'no-puzzle' }

  const entries: CrosswordEntry[] = grid.placements.map((p) => {
    const word = byId.get(p.id)!
    return { ...wordView(word), number: p.number, direction: p.dir, row: p.row, col: p.col }
  })
  const bonusWord = grid.bonus ? byId.get(grid.bonus.id) : undefined
  const puzzleKey = puzzleKeyOf(query.level, grid)
  const [done] = await db
    .select({ bestSeconds: crosswordResults.bestSeconds })
    .from(crosswordResults)
    .where(and(eq(crosswordResults.userId, userId), eq(crosswordResults.puzzleKey, puzzleKey)))
    .limit(1)

  return {
    puzzleKey,
    level: query.level,
    source,
    script: source === 'loanwords' ? 'katakana' : 'hiragana',
    size: grid.size,
    cells: grid.cells,
    entries,
    bonus: grid.bonus && bonusWord ? { ...wordView(bonusWord), cells: grid.bonus.cells } : null,
    knownCount,
    note,
    completed: done ?? null
  }
}

/**
 * Record a finished puzzle. One row per learner and puzzle: finishing it
 * again keeps the best time and replaces the last, so a retried request
 * changes nothing.
 */
export async function saveCrosswordResult(userId: string, languageCode: string, input: CrosswordResultInput): Promise<CrosswordResultResponse | null> {
  const [level] = await db
    .select({ id: languageLevels.id, languageId: languages.id })
    .from(languageLevels)
    .innerJoin(languages, eq(languages.id, languageLevels.languageId))
    .where(and(eq(languages.code, languageCode), eq(languageLevels.code, input.level)))
    .limit(1)
  if (!level)
    return null

  const now = new Date()
  const [row] = await db
    .insert(crosswordResults)
    .values({
      userId,
      puzzleKey: input.puzzleKey,
      languageId: level.languageId,
      levelId: level.id,
      source: input.source,
      wordIds: input.wordIds,
      bestSeconds: input.seconds,
      lastSeconds: input.seconds,
      hintsUsed: input.hintsUsed,
      completedAt: now
    })
    .onConflictDoUpdate({
      target: [crosswordResults.userId, crosswordResults.puzzleKey],
      set: {
        bestSeconds: sql`least(${crosswordResults.bestSeconds}, ${input.seconds})`,
        lastSeconds: input.seconds,
        hintsUsed: input.hintsUsed,
        completedAt: now,
        updatedAt: now
      }
    })
    .returning({ bestSeconds: crosswordResults.bestSeconds, lastSeconds: crosswordResults.lastSeconds })

  return { bestSeconds: row!.bestSeconds, lastSeconds: row!.lastSeconds, best: row!.bestSeconds === input.seconds }
}
