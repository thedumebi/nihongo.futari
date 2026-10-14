import type { GamesQuery, GhostBoss, GhostBossEntry, KanjiBuildGame, KanjiBuildRound, ListeningGame } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { findMinimalPairs, hasKatakana, lookAlikes, parseIds, studyDateFor } from '@nihongo/shared/lib'
import { sql } from 'drizzle-orm'
import { DateTime } from 'luxon'

import { assetUrl } from '../lib/assets.js'
import { loadUserContext } from './progress.service.js'

/**
 * The games: listening for one sound, building a kanji from its parts, and
 * the weekly ghost boss. All read-only — none of them writes a review, so
 * none of them can move a card's schedule. A finished game is recorded by the
 * client as an activity, like a conversation or a speech.
 */

/** Levels each game draws from when none is asked for. */
const DEFAULT_LEVELS = ['N5', 'N4']

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

function levelsFor(query: GamesQuery): string[] {
  return query.level ? [query.level] : DEFAULT_LEVELS
}

/** The first English meaning, asides dropped — short enough for a button. */
function firstGloss(glosses: Array<{ lang?: string, text?: string, gloss?: string }> | null | undefined): string {
  const g = (glosses ?? []).find(x => (x.lang ?? 'en') === 'en')
  return (g?.text ?? g?.gloss ?? '').replace(/\s*\([^)]*\)/g, '').trim()
}

// ============ Listening: minimal pairs ============

interface PairWord {
  id: string
  reading: string
  text: string
  meaning: string
  entSeq: number
}

/** Pairs per language and level set, worked out once — the word list only changes on deploy. */
const pairCache = new Map<string, ReturnType<typeof findMinimalPairs<PairWord>>>()

async function minimalPairs(languageCode: string, levels: string[]) {
  const key = `${languageCode}:${levels.join(',')}`
  const cached = pairCache.get(key)
  if (cached)
    return cached
  const rows = await db.execute<{ id: string, reading: string, text: string, glosses: Array<{ lang: string, text: string }>, ent_seq: number }>(sql`
    select distinct on (w.id) w.id, w.primary_reading as reading, w.primary_form as text, ws.glosses, w.ent_seq
    from words w
    join languages l on l.id = w.language_id and l.code = ${languageCode}
    join language_levels lv on lv.id = w.level_id and lv.code in ${levels}
    join study_items si on si.word_id = w.id and si.published and si.active
    join word_senses ws on ws.word_id = w.id and ws.sort_index = 0
    where w.ent_seq is not null and w.published and w.is_common
  `)
  // Katakana words are left out: their long vowels are a written ー, which
  // makes for pairs that are obvious on the page before a sound is heard.
  const words: PairWord[] = rows.rows
    // Two kana at least: a one-sound word (て, ゆ) is all contrast and no word.
    .filter(r => r.reading && [...r.reading].length >= 2 && !hasKatakana(r.reading))
    .map(r => ({ id: r.id, reading: r.reading, text: r.text, meaning: firstGloss(r.glosses), entSeq: Number(r.ent_seq) }))
    .filter(w => w.meaning)
  const pairs = findMinimalPairs(words)
  pairCache.set(key, pairs)
  return pairs
}

/**
 * Listening reaches one level further than the other games: a minimal pair
 * needs BOTH words in the pool, and N5–N4 alone holds barely three. Hearing
 * the difference does not need the word to be known — its meaning is shown
 * after.
 */
const LISTENING_LEVELS = ['N5', 'N4', 'N3']

export async function getListeningGame(query: GamesQuery): Promise<ListeningGame> {
  const pairs = await minimalPairs(query.languageCode, query.level ? [query.level] : LISTENING_LEVELS)
  const rounds = shuffle(pairs).slice(0, query.size).map((pair) => {
    const answer = Math.random() < 0.5 ? 0 : 1
    const options = [pair.a, pair.b]
    return {
      contrast: pair.contrast,
      audio: assetUrl(`/audio/words/${options[answer]!.entSeq}.m4a`),
      options: options.map(w => ({ reading: w.reading, text: w.text, meaning: w.meaning })),
      answer
    }
  })
  return { rounds }
}

// ============ Build-a-kanji ============

/** In the CJK Unified Ideographs block, the one every Japanese font covers. */
function isUnifiedKanji(ch: string): boolean {
  const cp = ch.codePointAt(0) ?? 0
  return cp >= 0x4E00 && cp <= 0x9FFF
}

interface ShapeRow {
  character: string
  ids: string | null
  meanings: Array<{ gloss: string, lang: string }>
}

export async function getKanjiBuildGame(query: GamesQuery): Promise<KanjiBuildGame> {
  const levels = levelsFor(query)
  // Every levelled kanji's shape, so distractor tiles can come from anywhere;
  // the kanji asked about come from the requested levels only.
  const shapes = await db.execute<{ character: string, ids: string | null, meanings: ShapeRow['meanings'], level: string }>(sql`
    select k.character, max(kc.ids_expression) as ids, k.meanings, lv.code as level
    from kanji k
    join languages l on l.id = k.language_id and l.code = ${query.languageCode}
    join language_levels lv on lv.id = k.level_id
    join kanji_components kc on kc.parent_kanji_id = k.id
    group by k.character, k.meanings, lv.code
  `)
  const entries = shapes.rows.flatMap((r) => {
    const shape = parseIds(r.ids)
    // Tiles must be ordinary kanji. Radical-supplement and extension forms
    // (⺀, 㐅) are real parts, but too many fonts draw them as boxes.
    if (shape && !shape.parts.every(isUnifiedKanji))
      return []
    const meaning = firstGloss(r.meanings)
    return shape && meaning ? [{ character: r.character, shape, meaning, level: r.level }] : []
  })
  const similar = lookAlikes(entries, 4, 0.2)
  const byChar = new Map(entries.map(e => [e.character, e]))
  const allParts = [...new Set(entries.flatMap(e => e.shape.parts))]

  const TILES = 6
  const assemble: KanjiBuildRound[] = shuffle(entries.filter(e => levels.includes(e.level)))
    .slice(0, Math.ceil(query.size * 2 / 3))
    .map((e) => {
      // Wrong tiles from look-alikes first — they are the parts that could
      // plausibly belong — then anything, to fill the row.
      const near = similar.filter(s => s.character === e.character)
        .flatMap(s => byChar.get(s.confusable)?.shape.parts ?? [])
      const distractors = [...new Set([...near, ...shuffle(allParts)])]
        .filter(p => !e.shape.parts.includes(p))
        .slice(0, TILES - e.shape.parts.length)
      return {
        kind: 'assemble' as const,
        character: e.character,
        meaning: e.meaning,
        layout: e.shape.layout,
        parts: e.shape.parts,
        tiles: shuffle([...e.shape.parts, ...distractors])
      }
    })

  // Sound families: which reading does this kanji's sound part suggest?
  const members = await db.execute<{ character: string, meanings: ShapeRow['meanings'], component: string, primary: string, family: string[] }>(sql`
    select k.character, k.meanings, ps.component_character as component, ps.primary_reading as primary,
      (select array_agg(k2.character order by m2.sort_index) from phonetic_series_members m2 join kanji k2 on k2.id = m2.kanji_id
       where m2.series_id = ps.id and m2.kanji_id <> k.id) as family
    from phonetic_series ps
    join languages l on l.id = ps.language_id and l.code = ${query.languageCode}
    join phonetic_series_members m on m.series_id = ps.id and m.follows_series
    join kanji k on k.id = m.kanji_id
    join language_levels lv on lv.id = k.level_id and lv.code in ${levels}
    where ps.published
  `)
  const readings = [...new Set(members.rows.map(r => r.primary))]
  const phonetic: KanjiBuildRound[] = shuffle(members.rows)
    .filter(r => r.component !== r.character && firstGloss(r.meanings))
    .slice(0, Math.max(0, query.size - assemble.length))
    .map(r => ({
      kind: 'phonetic' as const,
      character: r.character,
      meaning: firstGloss(r.meanings),
      component: r.component,
      options: shuffle([r.primary, ...shuffle(readings.filter(x => x !== r.primary)).slice(0, 3)]),
      answer: r.primary,
      family: (r.family ?? []).slice(0, 6),
      follows: true
    }))

  return { rounds: shuffle([...assemble, ...phonetic]) }
}

// ============ Ghost boss ============

export async function getGhostBoss(userId: string, languageCode: string): Promise<GhostBoss> {
  const ctx = await loadUserContext(userId)
  const week = DateTime.fromISO(studyDateFor(new Date(), ctx.timezone, ctx.dayBoundaryHour)).toFormat('kkkk-\'W\'WW')

  const rows = await db.execute<{
    key: string
    kanji_id: string | null
    word_id: string | null
    character: string | null
    kanji_meanings: ShapeRow['meanings'] | null
    form: string | null
    reading: string | null
    glosses: Array<{ lang: string, text: string }> | null
  }>(sql`
    select distinct on (si.id) si.id as key, si.kanji_id, si.word_id,
      k.character, k.meanings as kanji_meanings, w.primary_form as form, w.primary_reading as reading, ws.glosses
    from srs_cards c
    join languages l on l.id = c.language_id and l.code = ${languageCode}
    join study_item_facets f on f.id = c.facet_id
    join study_items si on si.id = f.study_item_id and si.published and si.active
    left join kanji k on k.id = si.kanji_id
    left join words w on w.id = si.word_id
    left join word_senses ws on ws.word_id = w.id and ws.sort_index = 0
    where c.user_id = ${userId} and c.ghost and not c.suspended
      and (si.kanji_id is not null or si.word_id is not null)
    limit 12
  `)

  const kanjiIds = rows.rows.flatMap(r => r.kanji_id ? [r.kanji_id] : [])
  const wordIds = rows.rows.flatMap(r => r.word_id ? [r.word_id] : [])

  // Published, sourced etymology only — the boss never shows a mnemonic.
  const etymology = kanjiIds.length + wordIds.length === 0
    ? []
    : (await db.execute<{ kanji_id: string | null, word_id: string | null, claim: string, confidence: string, is_disputed: boolean, source: string | null }>(sql`
        select distinct on (coalesce(e.kanji_id, e.word_id)) e.kanji_id, e.word_id, e.claim, e.confidence, e.is_disputed,
          (select coalesce(s.abbreviation, s.title) from etymology_sources es join sources s on s.id = es.source_id
           where es.etymology_id = e.id order by es.sort_index limit 1) as source
        from etymology_entries e
        where e.status = 'published'
          and (e.kanji_id in ${kanjiIds.length ? kanjiIds : ['']} or e.word_id in ${wordIds.length ? wordIds : ['']})
        order by coalesce(e.kanji_id, e.word_id), e.is_primary desc, e.aspect
      `)).rows

  const confusables = kanjiIds.length === 0
    ? []
    : (await db.execute<{ kanji_id: string, character: string, meanings: ShapeRow['meanings'] }>(sql`
        select kc.kanji_id, k.character, k.meanings
        from kanji_confusables kc join kanji k on k.id = kc.confusable_id
        where kc.kanji_id in ${kanjiIds}
        order by kc.score desc
      `)).rows

  const ghosts: GhostBossEntry[] = rows.rows.map((r) => {
    const e = etymology.find(x => (r.kanji_id && x.kanji_id === r.kanji_id) || (r.word_id && x.word_id === r.word_id))
    const isKanji = Boolean(r.kanji_id)
    return {
      key: r.key,
      kind: isKanji ? 'kanji' : 'word',
      text: (isKanji ? r.character : r.form) ?? '',
      reading: isKanji ? null : r.reading,
      meaning: isKanji ? firstGloss(r.kanji_meanings) : firstGloss(r.glosses),
      ref: (isKanji ? r.character : r.word_id) ?? '',
      etymology: e ? { claim: e.claim, confidence: e.confidence, isDisputed: e.is_disputed, source: e.source } : null,
      lookAlikes: confusables
        .filter(c => c.kanji_id === r.kanji_id)
        .slice(0, 3)
        .map(c => ({ character: c.character, meaning: firstGloss(c.meanings) }))
    }
  })

  const rounds = ghosts
    .filter(g => g.kind === 'kanji' && g.lookAlikes.length > 0 && g.meaning)
    .map(g => ({ meaning: g.meaning, answer: g.text, options: shuffle([g.text, ...g.lookAlikes.map(l => l.character)]) }))

  return { week, ghosts, rounds }
}
