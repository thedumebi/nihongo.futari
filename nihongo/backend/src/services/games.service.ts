import type { DictionarySpelling, DrillForm, GamesQuery, GhostBoss, GhostBossEntry, KanjiBuildGame, KanjiBuildRound, ListeningGame, VerbFormsGame, VerbFormsGameVerb } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { classifyPitch, classifyVerb, conjugatesReliably, countMorae, DRILL_FORMS, findMinimalPairs, findPitchPairs, hasKanji, hasKatakana, lookAlikes, parseIds, pitchShape, RARE_SPELLING_TAGS, studyDateFor, VERB_FORM_INFO } from '@nihongo/shared/lib'
import { sql } from 'drizzle-orm'
import { DateTime } from 'luxon'

import { assetUrl } from '../lib/assets.js'
import { currentClips } from './clips.service.js'
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

  type Round = GhostBoss['rounds'][number]

  const kanjiRounds: Round[] = ghosts
    .filter(g => g.kind === 'kanji' && g.lookAlikes.length > 0 && g.meaning)
    .map(g => ({ kind: 'look-alike', question: `Which one means “${g.meaning}”?`, answer: g.text, options: shuffle([g.text, ...g.lookAlikes.map(l => l.character)]) }))

  // Words: the real spelling against the same word with one kanji swapped for
  // a look-alike — 待つ against 持つ and 時つ. Most ghosts are words, and the
  // usual slip is exactly a part misread.
  const wordGhosts = ghosts.filter(g => g.kind === 'word' && g.meaning)
  const chars = [...new Set(wordGhosts.flatMap(g => [...g.text].filter(ch => hasKanji(ch))))]
  const swaps = chars.length === 0
    ? []
    : (await db.execute<{ character: string, confusable: string }>(sql`
        select a.character, b.character as confusable
        from kanji_confusables kc
        join kanji a on a.id = kc.kanji_id
        join kanji b on b.id = kc.confusable_id
        where a.character in ${chars}
        order by kc.score desc
      `)).rows
  const wordRounds = wordGhosts.flatMap((g) => {
    const variants = [...new Set([...g.text].flatMap((ch, i) => swaps
      .filter(s => s.character === ch)
      .map(s => [...g.text].map((c, j) => j === i ? s.confusable : c).join(''))))]
      .slice(0, 3)
    return variants.length > 0 ? [{ kind: 'look-alike' as const, question: `Which one means “${g.meaning}”?`, answer: g.text, options: shuffle([g.text, ...variants]) }] : []
  })

  // Every ghost, look-alikes or not, gets its meaning and (when written in
  // kanji) its reading — wrong answers drawn from other common N5–N4 words.
  // A ghost with nothing to fight was a boss that was only a list.
  const pool = ghosts.length === 0
    ? []
    : (await db.execute<{ reading: string, glosses: Array<{ lang: string, text: string }> }>(sql`
        select w.primary_reading as reading, ws.glosses
        from words w
        join languages l on l.id = w.language_id and l.code = ${languageCode}
        join language_levels lv on lv.id = w.level_id and lv.code in ${DEFAULT_LEVELS}
        join study_items si on si.word_id = w.id and si.published and si.active
        join word_senses ws on ws.word_id = w.id and ws.sort_index = 0
        where w.is_common and w.published
        order by random()
        limit 120
      `)).rows.map(r => ({ reading: r.reading, meaning: firstGloss(r.glosses) })).filter(r => r.reading && r.meaning)

  const basicRounds: Round[] = ghosts.flatMap((g) => {
    const out: Round[] = []
    const wrongMeanings = shuffle([...new Set(pool.map(p => p.meaning))]).filter(m => m.toLowerCase() !== g.meaning.toLowerCase()).slice(0, 3)
    if (g.meaning && wrongMeanings.length === 3)
      out.push({ kind: 'meaning', question: `What does ${g.text} mean?`, answer: g.meaning, options: shuffle([g.meaning, ...wrongMeanings]) })
    const reading = g.kind === 'word' ? g.reading : null
    if (reading && hasKanji(g.text)) {
      const length = [...reading].length
      const wrongReadings = shuffle([...new Set(pool.map(p => p.reading))])
        .filter(r => r !== reading && Math.abs([...r].length - length) <= 1 && !hasKatakana(r))
        .slice(0, 3)
      if (wrongReadings.length === 3)
        out.push({ kind: 'reading', question: `How is ${g.text} read?`, answer: reading, options: shuffle([reading, ...wrongReadings]) })
    }
    return out
  })

  const rounds = [...shuffle(basicRounds), ...kanjiRounds, ...wordRounds]

  return { week, ghosts, rounds }
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
