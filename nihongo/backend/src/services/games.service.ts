import type { FuriganaSegment } from '@nihongo/shared/lib'
import type { DictionarySpelling, DrillForm, GamesQuery, GhostBoss, GhostBossEntry, GhostPools, GhostSubject, KanjiBuildGame, KanjiBuildRound, ListeningGame, ParticlesGame, VerbFormsGame, VerbFormsGameVerb } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { buildGhostRounds, classifyPitch, classifyVerb, clozeFurigana, conjugatesReliably, countMorae, DRILL_FORMS, findMinimalPairs, findPitchPairs, hasKanji, hasKatakana, KANA_LOOKALIKES, lookAlikes, parseIds, pitchShape, RARE_SPELLING_TAGS, studyDateFor, toHiragana, VERB_FORM_INFO } from '@nihongo/shared/lib'
import { sql } from 'drizzle-orm'
import { DateTime } from 'luxon'

import { assetUrl } from '../lib/assets.js'
import { currentClips } from './clips.service.js'
import { glossary, glossLine } from './glossary.service.js'
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

interface PitchWord {
  id: string
  reading: string
  text: string
  meaning: string
  position: number
}

const pitchPairCache = new Map<string, ReturnType<typeof findPitchPairs<PitchWord>>>()

/** Common words that sound alike but for their pitch, worked out once like the sound pairs. */
async function pitchPairs(languageCode: string, levels: string[]) {
  const key = `${languageCode}:${levels.join(',')}`
  const cached = pitchPairCache.get(key)
  if (cached)
    return cached
  const rows = await db.execute<{ id: string, reading: string, text: string, glosses: Array<{ lang: string, text: string }>, position: number }>(sql`
    select distinct on (w.id) w.id, w.primary_reading as reading, w.primary_form as text, ws.glosses,
      (w.pitch_accent->0->'positions'->>0)::int as position
    from words w
    join languages l on l.id = w.language_id and l.code = ${languageCode}
    join language_levels lv on lv.id = w.level_id and lv.code in ${levels}
    join study_items si on si.word_id = w.id and si.published and si.active
    join word_senses ws on ws.word_id = w.id and ws.sort_index = 0
    where w.published and w.is_common and jsonb_array_length(coalesce(w.pitch_accent, '[]'::jsonb)) > 0
  `)
  const words: PitchWord[] = rows.rows
    .map(r => ({ id: r.id, reading: r.reading, text: r.text, meaning: firstGloss(r.glosses), position: Number(r.position) }))
    // Same spelling twice is one word read two ways, not two words.
    .filter(w => w.meaning && Number.isInteger(w.position))
  const pairs = findPitchPairs(words).filter(p => p.a.text !== p.b.text && p.a.meaning !== p.b.meaning)
  pitchPairCache.set(key, pairs)
  return pairs
}

/** About one round in four is a pitch round, when there are pitch pairs to draw on. */
const PITCH_SHARE = 0.25

export async function getListeningGame(query: GamesQuery): Promise<ListeningGame> {
  const levels = query.level ? [query.level] : LISTENING_LEVELS
  const [pairs, pitched] = await Promise.all([minimalPairs(query.languageCode, levels), pitchPairs(query.languageCode, levels)])
  const pitchCount = Math.min(pitched.length, Math.round(query.size * PITCH_SHARE))

  // A round is its audio: only words whose recording says what they say now.
  const chosen = shuffle(pairs).slice(0, (query.size - pitchCount) * 2)
  const clips = await currentClips([], [...new Set(chosen.flatMap(p => [p.a.entSeq, p.b.entSeq]))])
  const soundRounds = chosen.flatMap((pair) => {
    const answer = Math.random() < 0.5 ? 0 : 1
    const options = [pair.a, pair.b]
    const clip = clips.words.get(options[answer]!.entSeq)
    return clip ? [{ pair, answer, options, clip }] : []
  }).slice(0, query.size - pitchCount).map(({ pair, answer, options, clip }) => {
    return {
      contrast: pair.contrast,
      audio: assetUrl(clip),
      options: options.map(w => ({ reading: w.reading, text: w.text, meaning: w.meaning })),
      answer
    }
  })

  const pitchRounds = shuffle(pitched).slice(0, pitchCount).map((pair) => {
    const answer = Math.random() < 0.5 ? 0 : 1
    return {
      contrast: 'pitch' as const,
      audio: null,
      options: [pair.a, pair.b].map((w) => {
        const morae = countMorae(w.reading)
        return {
          reading: w.reading,
          text: w.text,
          meaning: w.meaning,
          pitch: { reading: w.reading, positions: [w.position], pattern: classifyPitch(w.position, morae), shape: pitchShape(w.position, morae) }
        }
      }),
      answer
    }
  })

  return { rounds: shuffle([...soundRounds, ...pitchRounds]) }
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

/** Ghosts in one boss, at most. */
const BOSS_MAX = 12
/** Below this many ghosts, cards nearly haunting top the boss up to it. */
const BOSS_TOP_UP = 8
/** Nearly haunting: answered Again or Hard at least this often in the window. */
const NEARLY_MISSES = 2
const NEARLY_DAYS = 14

/** The kinds of study item the boss can ask about. */
const BOSS_KINDS = sql`(si.kanji_id is not null or si.word_id is not null or si.grammar_point_id is not null or si.kana_id is not null)`

/**
 * The cards for this week's boss: the ghosts, worst first, then (while there
 * are fewer than `BOSS_TOP_UP`) the cards nearly haunting, most slipped
 * first. One per study item, by its worst card, whose facet is the side the
 * boss asks first.
 */
async function bossCards(userId: string, languageId: string): Promise<Array<{ key: string, facet: string, status: 'ghost' | 'nearly' }>> {
  const ghosts = await db.execute<{ key: string, facet: string }>(sql`
    select key, facet from (
      select distinct on (si.id) si.id as key, f.facet, c.lapses
      from srs_cards c
      join study_item_facets f on f.id = c.facet_id
      join study_items si on si.id = f.study_item_id and si.published and si.active
      where c.user_id = ${userId} and c.language_id = ${languageId} and c.ghost and not c.suspended and ${BOSS_KINDS}
      order by si.id, c.lapses desc
    ) g order by lapses desc limit ${BOSS_MAX}
  `)
  const room = BOSS_TOP_UP - ghosts.rows.length
  const nearly = room <= 0
    ? []
    : (await db.execute<{ key: string, facet: string }>(sql`
        select key, facet from (
          select distinct on (si.id) si.id as key, f.facet, x.misses
          from (
            select l.card_id, count(*) as misses from srs_review_logs l
            where l.user_id = ${userId} and l.language_id = ${languageId} and not l.superseded
              and l.rating in (1, 2) and l.reviewed_at > now() - make_interval(days => ${NEARLY_DAYS})
            group by l.card_id having count(*) >= ${NEARLY_MISSES}
          ) x
          join srs_cards c on c.id = x.card_id and not c.ghost and not c.suspended
          join study_item_facets f on f.id = c.facet_id
          join study_items si on si.id = f.study_item_id and si.published and si.active
          where ${BOSS_KINDS} and si.id not in ${ghosts.rows.length ? ghosts.rows.map(g => g.key) : ['']}
          order by si.id, x.misses desc
        ) n order by misses desc limit ${room}
      `)).rows
  return [
    ...ghosts.rows.map(g => ({ ...g, status: 'ghost' as const })),
    ...nearly.map(n => ({ ...n, status: 'nearly' as const }))
  ]
}

/** Whether this week's boss has anyone to face: a ghost, or a card nearly one. */
export async function ghostBossHasCards(userId: string, languageId: string): Promise<boolean> {
  return (await bossCards(userId, languageId)).length > 0
}

/**
 * This week's ghost boss: the cards that keep slipping, with what to read up
 * on, and two rounds each, asked from the side that keeps failing.
 */
export async function getGhostBoss(userId: string, languageCode: string): Promise<GhostBoss> {
  const ctx = await loadUserContext(userId)
  const week = DateTime.fromISO(studyDateFor(new Date(), ctx.timezone, ctx.dayBoundaryHour)).toFormat('kkkk-\'W\'WW')
  const [language] = (await db.execute<{ id: string }>(sql`select id from languages where code = ${languageCode}`)).rows
  if (!language)
    return { week, ghosts: [], rounds: [] }

  const cards = await bossCards(userId, language.id)
  if (cards.length === 0)
    return { week, ghosts: [], rounds: [] }

  const items = (await db.execute<{
    key: string
    kanji_id: string | null
    word_id: string | null
    grammar_point_id: string | null
    character: string | null
    kanji_meanings: ShapeRow['meanings'] | null
    form: string | null
    reading: string | null
    glosses: Array<{ lang: string, text: string }> | null
    ent_seq: number | null
    gp_title: string | null
    gp_slug: string | null
    gp_pattern: string | null
    gp_meaning: string | null
    kana_character: string | null
    kana_romaji: string | null
    kana_script: 'hiragana' | 'katakana' | null
  }>(sql`
    select si.id as key, si.kanji_id, si.word_id, si.grammar_point_id,
      k.character, k.meanings as kanji_meanings,
      w.primary_form as form, w.primary_reading as reading, ws.glosses, w.ent_seq,
      g.title as gp_title, g.slug as gp_slug, g.pattern as gp_pattern, g.meaning_short as gp_meaning,
      ka.character as kana_character, ka.romaji as kana_romaji, ka.script as kana_script
    from study_items si
    left join kanji k on k.id = si.kanji_id
    left join words w on w.id = si.word_id
    left join word_senses ws on ws.word_id = w.id and ws.sort_index = 0
    left join grammar_points g on g.id = si.grammar_point_id
    left join kana ka on ka.id = si.kana_id
    where si.id in ${cards.map(c => c.key)}
  `)).rows
  const itemOf = new Map(items.map(i => [i.key, i]))

  const kanjiIds = items.flatMap(r => r.kanji_id ? [r.kanji_id] : [])
  const wordIds = items.flatMap(r => r.word_id ? [r.word_id] : [])
  const pointIds = items.flatMap(r => r.grammar_point_id ? [r.grammar_point_id] : [])
  const wordChars = [...new Set(items.flatMap(r => r.word_id && r.form ? [...r.form].filter(ch => hasKanji(ch)) : []))]

  const [etymology, confusables, swaps, kanjiReadingRows, meaningQuestions, examples, clips, wordPool, kanaPool] = await Promise.all([
    // Published, sourced etymology only: the boss never shows a mnemonic.
    kanjiIds.length + wordIds.length === 0
      ? []
      : db.execute<{ kanji_id: string | null, word_id: string | null, claim: string, confidence: string, is_disputed: boolean, source: string | null }>(sql`
          select distinct on (coalesce(e.kanji_id, e.word_id)) e.kanji_id, e.word_id, e.claim, e.confidence, e.is_disputed,
            (select coalesce(s.abbreviation, s.title) from etymology_sources es join sources s on s.id = es.source_id
             where es.etymology_id = e.id order by es.sort_index limit 1) as source
          from etymology_entries e
          where e.status = 'published'
            and (e.kanji_id in ${kanjiIds.length ? kanjiIds : ['']} or e.word_id in ${wordIds.length ? wordIds : ['']})
          order by coalesce(e.kanji_id, e.word_id), e.is_primary desc, e.aspect
        `).then(r => r.rows),
    kanjiIds.length === 0
      ? []
      : db.execute<{ kanji_id: string, character: string, meanings: ShapeRow['meanings'] }>(sql`
          select kc.kanji_id, k.character, k.meanings
          from kanji_confusables kc join kanji k on k.id = kc.confusable_id
          where kc.kanji_id in ${kanjiIds}
          order by kc.score desc
        `).then(r => r.rows),
    // Words: the real spelling against the same word with one kanji swapped
    // for a look-alike, 待つ against 持つ and 時つ.
    wordChars.length === 0
      ? []
      : db.execute<{ character: string, confusable: string }>(sql`
          select a.character, b.character as confusable
          from kanji_confusables kc
          join kanji a on a.id = kc.kanji_id
          join kanji b on b.id = kc.confusable_id
          where a.character in ${wordChars}
          order by kc.score desc
        `).then(r => r.rows),
    kanjiIds.length === 0
      ? []
      : db.execute<{ kanji_id: string, type: string, reading: string }>(sql`
          select kanji_id, type, reading from kanji_readings
          where kanji_id in ${kanjiIds} and type in ('on', 'kun')
          order by kanji_id, is_common desc, sort_index
        `).then(r => r.rows),
    // Grammar: the meaning question its lesson was reviewed with, and the
    // patterns its wrong meanings belong to.
    pointIds.length === 0
      ? []
      : db.execute<{ grammar_point_id: string, answer: string, distractors: string[] }>(sql`
          select distinct on (si.grammar_point_id) si.grammar_point_id, p.answer->>'primary' as answer, p.distractors
          from exercise_prompts p
          join exercise_templates t on t.id = p.template_id and t.code = 'mcq'
          join study_item_facets f on f.id = p.facet_id
          join study_items si on si.id = f.study_item_id
          where si.grammar_point_id in ${pointIds} and p.status = 'published' and p.prompt->>'kind' = 'grammar'
            -- The meaning question; the same template also holds conjugation drills.
            and p.prompt->>'instruction' = 'What does this pattern mean?'
          order by si.grammar_point_id, p.version desc
        `).then(r => r.rows),
    pointIds.length === 0
      ? []
      : db.execute<{ grammar_point_id: string, text: string, translation: string | null }>(sql`
          select distinct on (gs.grammar_point_id) gs.grammar_point_id, s.text,
            (select t.text from sentence_translations t where t.sentence_id = s.id and t.lang = 'en' order by t.created_at limit 1) as translation
          from grammar_point_sentences gs join sentences s on s.id = gs.sentence_id and s.published
          where gs.grammar_point_id in ${pointIds} and gs.role = 'example'
          order by gs.grammar_point_id, gs.sort_index
        `).then(r => r.rows),
    currentClips([], items.flatMap(r => r.ent_seq ? [Number(r.ent_seq)] : [])),
    // Wrong answers: other common N5 and N4 words.
    db.execute<{ form: string, reading: string, glosses: Array<{ lang: string, text: string }> }>(sql`
      select w.primary_form as form, w.primary_reading as reading, ws.glosses
      from words w
      join languages l on l.id = w.language_id and l.code = ${languageCode}
      join language_levels lv on lv.id = w.level_id and lv.code in ${DEFAULT_LEVELS}
      join study_items si on si.word_id = w.id and si.published and si.active
      join word_senses ws on ws.word_id = w.id and ws.sort_index = 0
      where w.is_common and w.published
      order by random()
      limit 120
    `).then(r => r.rows),
    db.execute<{ character: string, romaji: string, script: 'hiragana' | 'katakana' }>(sql`
      select k.character, k.romaji, k.script from kana k
      join languages l on l.id = k.language_id and l.code = ${languageCode}
      where k.variant = 'base'
    `).then(r => r.rows)
  ])

  const meaningTitles = new Map<string, string>()
  const wrongMeanings = [...new Set(meaningQuestions.flatMap(q => q.distractors))]
  if (wrongMeanings.length) {
    const titles = await db.execute<{ meaning: string, title: string }>(sql`
      select distinct on (meaning_short) meaning_short as meaning, title from grammar_points
      where language_id = ${language.id} and meaning_short in ${wrongMeanings}
      order by meaning_short, sort_index
    `)
    for (const t of titles.rows) meaningTitles.set(t.meaning, t.title)
  }

  /** A kanji reading as a learner says it: kana, no okurigana marks. */
  const spoken = (reading: string) => toHiragana(reading.split('.')[0]!.replace(/-/g, ''))

  const subjects: GhostSubject[] = cards.flatMap((card): GhostSubject[] => {
    const r = itemOf.get(card.key)
    if (!r)
      return []
    const base: Pick<GhostBossEntry, 'key' | 'facet' | 'status' | 'etymology' | 'lookAlikes' | 'grammar'> = { key: card.key, facet: card.facet, status: card.status, etymology: null, lookAlikes: [], grammar: null }
    const e = etymology.find(x => (r.kanji_id && x.kanji_id === r.kanji_id) || (r.word_id && x.word_id === r.word_id))
    const sourced = e ? { claim: e.claim, confidence: e.confidence, isDisputed: e.is_disputed, source: e.source } : null
    if (r.kanji_id && r.character) {
      return [{
        entry: {
          ...base,
          kind: 'kanji' as const,
          text: r.character,
          reading: null,
          meaning: firstGloss(r.kanji_meanings),
          ref: r.character,
          etymology: sourced,
          lookAlikes: confusables.filter(c => c.kanji_id === r.kanji_id).slice(0, 3).map(c => ({ character: c.character, meaning: firstGloss(c.meanings) }))
        },
        kanjiReadings: [...new Set(kanjiReadingRows.filter(k => k.kanji_id === r.kanji_id).map(k => spoken(k.reading)))]
      }]
    }
    if (r.word_id && r.form) {
      const form = r.form
      const misspellings = [...new Set([...form].flatMap((ch, i) => swaps
        .filter(sw => sw.character === ch)
        .map(sw => [...form].map((c, j) => j === i ? sw.confusable : c).join(''))))]
      return [{
        entry: { ...base, kind: 'word' as const, text: form, reading: r.reading, meaning: firstGloss(r.glosses), ref: r.word_id, etymology: sourced },
        audio: r.ent_seq ? clips.words.get(Number(r.ent_seq)) ?? null : null,
        misspellings
      }]
    }
    if (r.grammar_point_id && r.gp_title) {
      const q = meaningQuestions.find(m => m.grammar_point_id === r.grammar_point_id)
      const example = examples.find(x => x.grammar_point_id === r.grammar_point_id)
      return [{
        entry: {
          ...base,
          kind: 'grammar' as const,
          text: r.gp_title,
          reading: null,
          meaning: q?.answer ?? r.gp_meaning ?? '',
          ref: r.gp_slug ?? '',
          grammar: { pattern: r.gp_pattern, example: example ? { text: example.text, translation: example.translation } : null }
        },
        meaningQuestion: q ? { answer: q.answer, wrong: q.distractors.map(meaning => ({ meaning, title: meaningTitles.get(meaning) ?? null })) } : undefined
      }]
    }
    if (r.kana_character && r.kana_romaji && r.kana_script) {
      const romajiOf = (ch: string) => kanaPool.find(k => k.character === ch)?.romaji ?? ''
      return [{
        entry: {
          ...base,
          kind: 'kana' as const,
          text: r.kana_character,
          reading: r.kana_romaji,
          meaning: '',
          ref: '',
          lookAlikes: (KANA_LOOKALIKES[r.kana_character] ?? []).map(ch => ({ character: ch, meaning: romajiOf(ch) }))
        },
        script: r.kana_script
      }]
    }
    return []
  })

  const pools: GhostPools = {
    words: wordPool.map(w => ({ text: w.form, reading: w.reading, meaning: firstGloss(w.glosses) })).filter(w => w.text && w.reading && w.meaning),
    kana: kanaPool
  }
  const rounds = buildGhostRounds(subjects, pools).map(round => ({ ...round, audio: round.audio ? assetUrl(round.audio) : null }))
  return { week, ghosts: subjects.map(s => s.entry), rounds }
}

// ============ Verb forms ============

/** Verbs sent per game: enough for a mixed round of every form without repeats. */
const VERB_FORMS_POOL = 40

/**
 * The Verb forms game: the verbs to ask about, and which forms are open.
 *
 * Verbs are the ones the learner has learned, any level, topped up with the
 * level's earliest verbs while they know fewer than a game's worth. Only
 * verbs `conjugate` gets right in every form (`conjugatesReliably`), no
 * くる compound, whose prefix the くる table would drop, and no noun that
 * merely takes する.
 *
 * A form is open once any grammar point that teaches it is learned, by the
 * rule the conjugation drills are gated by: a card on that point past
 * learning. The device builds the questions; the answers never travel.
 */
export async function getVerbFormsGame(userId: string, query: GamesQuery): Promise<VerbFormsGame> {
  const levels = levelsFor(query)
  const rows = await db.execute<{ id: string, surface: string, reading: string, pos: string[], glosses: Array<{ lang: string, text: string }>, known: boolean, level: string | null }>(sql`
    select distinct on (w.id) w.id, w.primary_form as surface, w.primary_reading as reading, ws.pos, ws.glosses,
      exists (
        select 1 from srs_cards c
        join study_item_facets f on f.id = c.facet_id
        where f.study_item_id = si.id and c.user_id = ${userId} and c.state >= 2 and not c.suspended
      ) as known,
      lv.code as level,
      si.sort_index
    from words w
    join languages l on l.id = w.language_id and l.code = ${query.languageCode}
    join study_items si on si.word_id = w.id and si.published and si.active
    join word_senses ws on ws.word_id = w.id and ws.sort_index = 0
    left join language_levels lv on lv.id = si.level_id
    where w.published and exists (select 1 from unnest(ws.pos) p where p like 'v%')
    order by w.id, si.sort_index
  `)

  const verbs: Array<Omit<VerbFormsGameVerb, 'spellings'> & { sortIndex: number, level: string | null }> = []
  for (const r of rows.rows as Array<typeof rows.rows[number] & { sort_index: number }>) {
    const verbClass = classifyVerb(r.pos)
    const meaning = firstGloss(r.glosses)
    if (!verbClass || !conjugatesReliably(r.pos) || !meaning || !r.reading)
      continue
    if (verbClass === 'kuru' && r.reading !== 'くる')
      continue
    // A noun that can take する (戦争, 予定) is filed and glossed as the noun:
    // "war", not "to wage war". Asking for 戦争したい under "war" is a puzzle
    // about the noun, so only words that are themselves verbs are played.
    if (verbClass === 'suru' && !r.reading.endsWith('する'))
      continue
    verbs.push({
      wordId: r.id,
      surface: r.surface,
      reading: r.reading,
      verbClass,
      meaning,
      known: r.known,
      sortIndex: Number(r.sort_index),
      level: r.level
    })
  }

  const known = shuffle(verbs.filter(v => v.known)).slice(0, VERB_FORMS_POOL)
  // The first level's earliest verbs first: N5 before N4.
  const rank = (v: { level: string | null }) => levels.indexOf(v.level ?? '')
  const topUp = verbs
    .filter(v => !v.known && rank(v) >= 0)
    .sort((a, b) => rank(a) - rank(b) || a.sortIndex - b.sortIndex)
    .slice(0, Math.max(0, query.size - known.length))
  const chosen = [...known, ...topUp]

  const spellings = new Map<string, DictionarySpelling[]>()
  if (chosen.length) {
    const forms = await db.execute<{ word_id: string, form: string, tags: string[] | null, reading: string }>(sql`
      select wf.word_id, wf.form, wf.tags, w.primary_reading as reading
      from word_forms wf join words w on w.id = wf.word_id
      where wf.word_id in ${chosen.map(v => v.wordId)}
    `)
    for (const f of forms.rows) {
      if ((f.tags ?? []).some(tag => RARE_SPELLING_TAGS.has(tag)))
        continue
      const list = spellings.get(f.word_id) ?? []
      list.push({ form: f.form, reading: f.reading })
      spellings.set(f.word_id, list)
    }
  }

  const slugs = [...new Set(DRILL_FORMS.flatMap(f => VERB_FORM_INFO[f].grammar))]
  const points = await db.execute<{ slug: string, title: string, learned: boolean }>(sql`
    select g.slug, g.title,
      exists (
        select 1 from srs_cards c
        join study_item_facets f on f.id = c.facet_id
        join study_items si on si.id = f.study_item_id
        where si.grammar_point_id = g.id and c.user_id = ${userId} and c.state >= 2
      ) as learned
    from grammar_points g
    join languages l on l.id = g.language_id and l.code = ${query.languageCode}
    where g.slug in ${slugs} and g.published
  `)
  const bySlug = new Map(points.rows.map(p => [p.slug, p]))

  return {
    verbs: chosen.map(({ sortIndex: _s, level: _l, ...v }) => ({ ...v, spellings: spellings.get(v.wordId) ?? [] })),
    forms: DRILL_FORMS.map((form: DrillForm) => {
      const taught = VERB_FORM_INFO[form].grammar.map(slug => bySlug.get(slug)).filter(p => p !== undefined)
      const unlocked = taught.some(p => p.learned)
      const first = taught[0]
      return { form, unlocked, lesson: unlocked || !first ? null : { slug: first.slug, title: first.title } }
    })
  }
}

// ============ Particles ============

/** Questions sent per game: enough to deal fifteen without a sentence twice, and a replay. */
const PARTICLES_POOL = 60

/**
 * The Particles game: published questions from every particle lesson at the
 * game's levels, the sentences the learner knows most of first.
 *
 * Every particle is in play from the start: there is nothing to choose and
 * nothing locked. A sentence's familiarity is the share of its dictionary
 * words the learner has learned (a card past learning), bucketed by quarters
 * and random within a bucket, so a game is not always the same sixty.
 */
export async function getParticlesGame(userId: string, query: GamesQuery): Promise<ParticlesGame> {
  const levels = levelsFor(query)
  const rows = await db.execute<{
    id: string
    sentence_id: string
    blank_start: number
    blank_end: number
    answer: string
    wrong: string[]
    note: string
    text: string
    slug: string
    title: string
    translation: string | null
    familiar: number
  }>(sql`
    with pool as (
      select q.id, q.sentence_id, q.blank_start, q.blank_end, q.answer, q.wrong, q.note,
        s.text, g.slug, g.title,
        (select t.text from sentence_translations t where t.sentence_id = s.id and t.lang = 'en' order by t.created_at limit 1) as translation,
        coalesce((
          select avg(case when exists (
            select 1 from study_items si
            join study_item_facets f on f.study_item_id = si.id
            join srs_cards c on c.facet_id = f.id
            where si.word_id = tok.word_id and c.user_id = ${userId} and c.state >= 2
          ) then 1.0 else 0.0 end)
          from sentence_tokens tok where tok.sentence_id = s.id and tok.word_id is not null
        ), 0)::float as familiar
      from particle_questions q
      join particle_sets ps on ps.id = q.set_id and ps.published
      join languages l on l.id = ps.language_id and l.code = ${query.languageCode}
      join grammar_points g on g.id = ps.grammar_point_id
      join language_levels lv on lv.id = g.level_id
      join sentences s on s.id = q.sentence_id and s.published
      where lv.code in ${levels}
    )
    select * from pool order by floor(familiar * 4) desc, random() limit ${PARTICLES_POOL}
  `)
  if (rows.rows.length === 0)
    return { questions: [] }

  const sentenceIds = [...new Set(rows.rows.map(r => r.sentence_id))]
  const [g, clips, tokenRows] = await Promise.all([
    glossary(query.languageCode),
    currentClips(sentenceIds, []),
    db.execute<{ sentence_id: string, char_start: number, char_end: number, furigana: FuriganaSegment[] }>(sql`
      select sentence_id, char_start, char_end, furigana from sentence_tokens
      where sentence_id in ${sentenceIds} order by sentence_id, char_start
    `)
  ])
  const tokensOf = new Map<string, Array<{ charStart: number, charEnd: number, furigana: FuriganaSegment[] }>>()
  for (const t of tokenRows.rows) {
    const list = tokensOf.get(t.sentence_id) ?? []
    list.push({ charStart: t.char_start, charEnd: t.char_end, furigana: t.furigana })
    tokensOf.set(t.sentence_id, list)
  }

  return {
    questions: rows.rows.flatMap((r) => {
      const chars = [...r.text]
      // A gap that no longer holds its particle (the sentence was reworded) is left out.
      if (chars.slice(r.blank_start, r.blank_end).join('') !== r.answer)
        return []
      const before = chars.slice(0, r.blank_start).join('')
      const after = chars.slice(r.blank_end).join('')
      const { beforeFurigana, afterFurigana } = clozeFurigana(r.text, before, after, tokensOf.get(r.sentence_id) ?? [])
      const clip = clips.sentences.get(r.sentence_id)
      return [{
        id: r.id,
        sentenceId: r.sentence_id,
        before,
        after,
        beforeTokens: before ? glossLine(before, g, beforeFurigana) : [],
        afterTokens: after ? glossLine(after, g, afterFurigana) : [],
        beforeSegments: beforeFurigana,
        afterSegments: afterFurigana,
        answer: r.answer,
        wrong: r.wrong,
        note: r.note,
        translation: r.translation,
        audio: clip ? assetUrl(clip) : null,
        lesson: { slug: r.slug, title: r.title },
        familiar: Math.min(1, Math.max(0, Number(r.familiar)))
      }]
    })
  }
}
