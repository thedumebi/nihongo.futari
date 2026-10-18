/**
 * Every typed answer accepts every common spelling of its words.
 *
 * Reported from the app: 友達がくる was marked wrong against 友だちが来る。
 * Each word of a dictation answer offered only the spelling in the sentence
 * and its kana, and the serve-time helper that tried to add one more knew two
 * spellings per word, so 友達, 在ります, 聴いた and many like them were refused
 * (about 40% of sentence dictations had at least one). It also invented some:
 * くない for 来ない, から for 空.
 *
 * The word is already known here: a sentence token carries `word_id`, and a
 * word card's prompt hangs off the word's study item. So each answer gets the
 * word's dictionary spellings, anchored on the reading it was said with
 * (`spellingsOf`), and stores them. Grading is then the stored answer and
 * nothing else, the same online, offline and in lessons.
 *
 * Idempotent: options are only ever added, so a second run changes nothing.
 * Called by its seed and after any derivation that makes new prompts.
 */
import type { DictionarySpelling } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { hasKanji, RARE_SPELLING_TAGS, widenOptions } from '@nihongo/shared/lib'
import { sql } from 'drizzle-orm'

interface Answer { primary: string, accepted: string[], tokens?: string[][] }

async function rows<T>(query: ReturnType<typeof sql>): Promise<T[]> {
  return (await db.execute(query)).rows as T[]
}

/** Common spellings of every word, keyed by word id. */
async function spellingsByWord(): Promise<Map<string, DictionarySpelling[]>> {
  const forms = await rows<{ word_id: string, form: string, tags: string[] | null, reading: string }>(sql`
    select wf.word_id, wf.form, wf.tags, w.primary_reading as reading
    from word_forms wf join words w on w.id = wf.word_id`)
  const out = new Map<string, DictionarySpelling[]>()
  for (const f of forms) {
    if ((f.tags ?? []).some(tag => RARE_SPELLING_TAGS.has(tag)))
      continue
    const list = out.get(f.word_id) ?? []
    list.push({ form: f.form, reading: f.reading })
    out.set(f.word_id, list)
  }
  return out
}

/** Sentence answers: each token widened by its own word. */
async function sentenceAnswers(words: Map<string, DictionarySpelling[]>): Promise<Array<{ id: string, answer: Answer }>> {
  const prompts = await rows<{ id: string, answer: Answer, sentence_id: string }>(sql`
    select id, answer, assets ->> 'sentenceId' as sentence_id
    from exercise_prompts where answer ? 'tokens'`)
  const tokens = await rows<{ sentence_id: string, surface: string, reading: string | null, word_id: string | null }>(sql`
    select sentence_id, surface, reading, word_id from sentence_tokens
    where sentence_id in (select assets ->> 'sentenceId' from exercise_prompts where answer ? 'tokens')
    order by sentence_id, index`)
  const bySentence = new Map<string, typeof tokens>()
  for (const t of tokens) {
    const list = bySentence.get(t.sentence_id) ?? []
    list.push(t)
    bySentence.set(t.sentence_id, list)
  }

  const changed: Array<{ id: string, answer: Answer }> = []
  for (const p of prompts) {
    const own = bySentence.get(p.sentence_id) ?? []
    const stored = p.answer.tokens ?? []
    // The answer's tokens were cut from these rows one to one (seed 155). If
    // the sentence has been re-cut since, they no longer line up; leave it.
    if (own.length !== stored.length)
      continue
    const widened = stored.map((options, i) => {
      const t = own[i]!
      const spellings = t.word_id ? words.get(t.word_id) : undefined
      if (!spellings)
        return options
      return widenOptions(t.surface, options, [t.reading ?? '', ...options], spellings)
    })
    if (widened.some((options, i) => options.length !== stored[i]!.length))
      changed.push({ id: p.id, answer: { ...p.answer, tokens: widened } })
  }
  return changed
}

/**
 * Word answers (word dictation, typed cloze, conjugation drills): widened from
 * the kana entries they already accept.
 *
 * Only where a kanji spelling is already accepted. An answer that accepts kana
 * alone asks for kana, and the input says so ("In hiragana", from the accepted
 * forms); adding kanji would change what the card asks.
 */
async function wordAnswers(words: Map<string, DictionarySpelling[]>): Promise<Array<{ id: string, answer: Answer }>> {
  const prompts = await rows<{ id: string, answer: Answer, word_id: string }>(sql`
    select p.id, p.answer, si.word_id
    from exercise_prompts p
    join study_item_facets f on f.id = p.facet_id
    join study_items si on si.id = f.study_item_id
    where si.word_id is not null and not (p.answer ? 'tokens')
      and jsonb_typeof(p.answer -> 'accepted') = 'array'`)

  const changed: Array<{ id: string, answer: Answer }> = []
  for (const p of prompts) {
    const spellings = words.get(p.word_id)
    const accepted = p.answer.accepted
    if (!spellings || !accepted.some(a => hasKanji(a)))
      continue
    const widened = widenOptions(p.answer.primary, accepted, [p.answer.primary, ...accepted], spellings)
    if (widened.length !== accepted.length)
      changed.push({ id: p.id, answer: { ...p.answer, accepted: widened } })
  }
  return changed
}

/** The answers that would change, without writing them. */
export async function answerSpellingChanges(): Promise<{ sentences: Array<{ id: string, answer: Answer }>, words: Array<{ id: string, answer: Answer }> }> {
  const words = await spellingsByWord()
  const [sentences, single] = await Promise.all([sentenceAnswers(words), wordAnswers(words)])
  return { sentences, words: single }
}

export async function widenAnswerSpellings(): Promise<{ sentences: number, words: number }> {
  const { sentences, words } = await answerSpellingChanges()
  const all = [...sentences, ...words]
  for (let i = 0; i < all.length; i += 500) {
    const chunk = JSON.stringify(all.slice(i, i + 500))
    await db.execute(sql`
      update exercise_prompts p
      set answer = v.answer, updated_at = now()
      from jsonb_to_recordset(${chunk}::jsonb) as v(id text, answer jsonb)
      where p.id = v.id and p.answer is distinct from v.answer`)
  }
  return { sentences: sentences.length, words: words.length }
}
