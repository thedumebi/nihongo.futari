import type { GhostPools, GhostRound, GhostSubject } from '@/types/games.js'

import { hasKanji } from '../ja/script/index.js'

/**
 * Ghost boss: the questions for each card that keeps slipping.
 *
 * The first round asks the side that is actually failing: a word missed on
 * its English-to-Japanese card is asked "which is 'one'?", not "what does
 * 一つ mean?", which is the side the learner already gets right. The second
 * asks one other side of the same thing. Wrong answers are real: other common
 * words, the same word spelled with a look-alike kanji, the kana it is
 * mistaken for, the patterns a grammar question was reviewed with.
 */

/**
 * Kana that are classically mistaken for each other. Hand-picked: shape is
 * the confusion, and no table in the data says which shapes are alike.
 */
export const KANA_LOOKALIKES: Readonly<Record<string, readonly string[]>> = {
  // Katakana
  シ: ['ツ', 'ソ', 'ン'],
  ツ: ['シ', 'ソ', 'ン'],
  ソ: ['ン', 'リ', 'シ'],
  ン: ['ソ', 'シ', 'ツ'],
  ヲ: ['フ', 'ラ', 'ヨ'],
  フ: ['ヲ', 'ワ', 'ク'],
  ワ: ['ウ', 'フ', 'ク'],
  ウ: ['ワ', 'ラ', 'フ'],
  ク: ['タ', 'ケ', 'ワ'],
  タ: ['ク', 'ヌ', 'ケ'],
  ケ: ['ク', 'タ', 'ナ'],
  ヌ: ['ス', 'フ', 'メ'],
  ス: ['ヌ', 'ネ', 'フ'],
  メ: ['ナ', 'ヌ', 'ノ'],
  ナ: ['メ', 'チ', 'テ'],
  チ: ['テ', 'ナ', 'キ'],
  テ: ['チ', 'ラ', 'ナ'],
  ラ: ['ウ', 'テ', 'フ'],
  コ: ['ユ', 'ロ', 'エ'],
  ユ: ['コ', 'ヨ', 'エ'],
  ヨ: ['ユ', 'コ', 'ヲ'],
  ロ: ['コ', 'ヨ', 'エ'],
  エ: ['コ', 'ユ', 'ニ'],
  ニ: ['エ', 'ミ', 'コ'],
  ミ: ['シ', 'ニ', 'ラ'],
  ハ: ['ル', 'ヘ', 'ト'],
  ル: ['レ', 'ハ', 'ノ'],
  レ: ['ル', 'ノ', 'ヒ'],
  ヒ: ['レ', 'ヘ', 'ト'],
  ト: ['ヒ', 'ハ', 'ル'],
  マ: ['ア', 'ム', 'ヤ'],
  ア: ['マ', 'ヤ', 'ノ'],
  ヤ: ['セ', 'マ', 'ア'],
  セ: ['ヤ', 'サ', 'モ'],
  サ: ['セ', 'キ', 'ヤ'],
  キ: ['サ', 'チ', 'モ'],
  モ: ['キ', 'チ', 'セ'],
  ホ: ['ネ', 'オ', 'キ'],
  ネ: ['ホ', 'ス', 'オ'],
  オ: ['ホ', 'ネ', 'キ'],
  ノ: ['ソ', 'ン', 'メ'],
  ム: ['マ', 'ス', 'ヌ'],
  イ: ['ト', 'ノ', 'ル'],
  // Hiragana
  ぬ: ['め', 'ね', 'わ'],
  め: ['ぬ', 'あ', 'の'],
  ね: ['れ', 'わ', 'ぬ'],
  れ: ['わ', 'ね', 'る'],
  わ: ['れ', 'ね', 'ぬ'],
  る: ['ろ', 'ら', 'れ'],
  ろ: ['る', 'ら', 'う'],
  さ: ['ち', 'き', 'そ'],
  ち: ['さ', 'ら', 'ろ'],
  き: ['さ', 'ち', 'ま'],
  は: ['ほ', 'け', 'よ'],
  ほ: ['は', 'ま', 'け'],
  ま: ['ほ', 'も', 'よ'],
  け: ['は', 'ほ', 'い'],
  い: ['り', 'こ', 'け'],
  り: ['い', 'こ', 'う'],
  こ: ['い', 'に', 'た'],
  に: ['こ', 'た', 'け'],
  た: ['な', 'に', 'こ'],
  な: ['た', 'は', 'ま'],
  う: ['ら', 'つ', 'ろ'],
  ら: ['う', 'ち', 'ろ'],
  つ: ['う', 'し', 'そ'],
  し: ['つ', 'い', 'も'],
  も: ['し', 'ま', 'よ'],
  よ: ['ま', 'は', 'ほ'],
  あ: ['お', 'め', 'の'],
  お: ['あ', 'め', 'む'],
  む: ['お', 'す', 'め'],
  す: ['む', 'お', 'あ'],
  の: ['め', 'あ', 'ぬ'],
  く: ['へ', 'し', 'て'],
  へ: ['く', 'え', 'て'],
  て: ['く', 'そ', 'ち'],
  そ: ['て', 'う', 'ろ'],
  え: ['ん', 'そ', 'わ'],
  ん: ['え', 'ろ', 'そ']
}

/** Readings written differently that sound the same. */
const SAID_ALIKE = new Set(['wo', 'o'])

/** Which round kinds, in order, a facet calls for: the failing side first. */
const ORDER: Record<GhostSubject['entry']['kind'], Record<string, GhostRound['kind'][]>> = {
  word: {
    meaning: ['meaning', 'reading', 'production'],
    reading: ['reading', 'meaning', 'production'],
    production: ['production', 'meaning', 'reading'],
    listening: ['listening', 'production', 'meaning'],
    writing: ['look-alike', 'reading', 'meaning']
  },
  kanji: {
    meaning: ['meaning', 'look-alike', 'reading'],
    reading: ['reading', 'meaning', 'look-alike'],
    writing: ['look-alike', 'meaning', 'reading']
  },
  grammar: {
    usage: ['pattern-reverse', 'pattern'],
    meaning: ['pattern', 'pattern-reverse']
  },
  kana: {
    reading: ['kana-reading', 'kana-writing'],
    writing: ['kana-writing', 'kana-reading']
  }
}

const DEFAULT_ORDER: Record<GhostSubject['entry']['kind'], GhostRound['kind'][]> = {
  word: ['meaning', 'reading', 'production'],
  kanji: ['meaning', 'reading', 'look-alike'],
  grammar: ['pattern', 'pattern-reverse'],
  kana: ['kana-reading', 'kana-writing']
}

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

/** Up to `n` distinct values from `from`, none equal to `answer` or each other. */
function pickWrong(from: readonly string[], answer: string, n: number, random: () => number): string[] {
  return [...new Set(shuffled(from, random))].filter(x => x && x !== answer).slice(0, n)
}

function round(subject: GhostSubject, kind: GhostRound['kind'], question: string, answer: string, wrong: string[], script: 'ja' | 'en', random: () => number, audio: string | null = null): GhostRound | null {
  if (wrong.length < 3)
    return null
  return { ghost: subject.entry.key, kind, question, answer, options: shuffled([answer, ...wrong.slice(0, 3)], random), script, audio }
}

/** One round of the given kind for this ghost, or null when there is nothing honest to ask. */
function make(subject: GhostSubject, kind: GhostRound['kind'], pools: GhostPools, random: () => number): GhostRound | null {
  const g = subject.entry
  const otherWords = pools.words.filter(w => w.text !== g.text && w.meaning.toLowerCase() !== g.meaning.toLowerCase())
  switch (kind) {
    case 'meaning':
      if (!g.meaning)
        return null
      return round(subject, kind, `What does ${g.text} mean?`, g.meaning, pickWrong(otherWords.map(w => w.meaning), g.meaning, 3, random), 'en', random)
    case 'reading': {
      const reading = g.kind === 'kanji' ? subject.kanjiReadings?.[0] : g.reading
      if (!reading || !hasKanji(g.text))
        return null
      const length = [...reading].length
      const near = otherWords.map(w => w.reading).filter(r => Math.abs([...r].length - length) <= 1 && !(subject.kanjiReadings ?? []).includes(r))
      return round(subject, kind, `How is ${g.text} read?`, reading, pickWrong(near, reading, 3, random), 'ja', random)
    }
    case 'production':
      if (!g.meaning)
        return null
      return round(subject, kind, `Which one is "${g.meaning}"?`, g.text, pickWrong(otherWords.map(w => w.text), g.text, 3, random), 'ja', random)
    case 'listening':
      if (!subject.audio)
        return null
      return round(subject, kind, 'Which word did you hear?', g.text, pickWrong(otherWords.map(w => w.text), g.text, 3, random), 'ja', random, subject.audio)
    case 'look-alike': {
      const wrong = g.kind === 'kanji' ? g.lookAlikes.map(l => l.character) : subject.misspellings ?? []
      return round(subject, kind, `Which one means "${g.meaning}"?`, g.text, pickWrong(wrong, g.text, 3, random), 'ja', random)
    }
    case 'pattern': {
      const q = subject.meaningQuestion
      if (!q)
        return null
      return round(subject, kind, `What does ${g.text} mean?`, q.answer, q.wrong.map(w => w.meaning), 'en', random)
    }
    case 'pattern-reverse': {
      const q = subject.meaningQuestion
      const titles = (q?.wrong ?? []).map(w => w.title).filter((t): t is string => Boolean(t) && t !== g.text)
      if (!q)
        return null
      return round(subject, kind, `Which pattern means "${q.answer}"?`, g.text, titles, 'ja', random)
    }
    case 'kana-reading': {
      const romaji = g.reading ?? ''
      // を and ヲ are said "o": that is never a wrong answer for them, nor "wo" for お.
      const sameSound = (r: string) => r === romaji || (SAID_ALIKE.has(r) && SAID_ALIKE.has(romaji))
      const alike = (KANA_LOOKALIKES[g.text] ?? []).map(k => pools.kana.find(x => x.character === k)?.romaji ?? '')
      const same = pools.kana.filter(k => k.script === subject.script).map(k => k.romaji)
      const wrong = [...new Set([...alike, ...shuffled(same, random)])].filter(r => r && !sameSound(r)).slice(0, 3)
      return round(subject, kind, `How is ${g.text} read?`, romaji, wrong, 'en', random)
    }
    case 'kana-writing': {
      const romaji = g.reading ?? ''
      const alike = KANA_LOOKALIKES[g.text] ?? []
      const same = pools.kana.filter(k => k.script === subject.script && k.romaji !== romaji).map(k => k.character)
      const wrong = [...new Set([...alike, ...shuffled(same, random)])].filter(k => k !== g.text).slice(0, 3)
      return round(subject, kind, `Which one is "${romaji}"?`, g.text, wrong, 'ja', random)
    }
  }
}

/** Two rounds for each ghost, the failing side first, the ghosts in turn. */
export function buildGhostRounds(subjects: readonly GhostSubject[], pools: GhostPools, random: () => number = Math.random): GhostRound[] {
  const perGhost = subjects.map((subject) => {
    const order = ORDER[subject.entry.kind][subject.entry.facet] ?? DEFAULT_ORDER[subject.entry.kind]
    const rounds: GhostRound[] = []
    for (const kind of order) {
      if (rounds.length >= 2)
        break
      const r = make(subject, kind, pools, random)
      if (r)
        rounds.push(r)
    }
    return rounds
  })
  // Every ghost's first round, then every second: the same card is not asked twice running.
  return [...perGhost.map(r => r[0]), ...perGhost.map(r => r[1])].filter((r): r is GhostRound => Boolean(r))
}
