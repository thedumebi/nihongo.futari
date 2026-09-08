/**
 * Re-derive the quiz prompts so dictation answers carry their tokens.
 *
 * Reported from the app: ご飯を食べてテレビをみます was marked wrong against
 * ご飯を食べて、テレビを見ます。 The `accepted` list holds whole sentences and
 * so can only offer all kanji or all kana — a learner who has met 食べる but
 * not 見る writes the mix, which is correct Japanese and correctly heard, and
 * matched neither. The answer now carries each token with its reading and the
 * grader walks them.
 *
 * The derivation is ON CONFLICT DO NOTHING, so existing rows keep their old
 * answer; the update below is what actually moves them. Prompt ids are stable
 * (`ep-dict-<topic>-<n>`), so nothing is orphaned and `lesson_misses`, which
 * cascades on prompt delete, is untouched.
 */
import { sql } from 'drizzle-orm'

import db from '@nihongo/shared/db'

import { deriveQuizPrompts } from './lib/derive-quiz-prompts.js'

export async function run(): Promise<void> {
  await deriveQuizPrompts()

  await db.execute(sql`
    UPDATE exercise_prompts ep
    SET answer = ep.answer || jsonb_build_object('tokens', tk.tokens),
        updated_at = now()
    FROM (
      SELECT st.sentence_id,
             jsonb_agg(
               CASE WHEN st.reading IS NULL OR st.reading = st.surface
                    THEN jsonb_build_array(st.surface)
                    ELSE jsonb_build_array(st.surface, st.reading) END
               ORDER BY st.index
             ) AS tokens
      FROM sentence_tokens st
      GROUP BY st.sentence_id
    ) tk
    WHERE ep.assets ->> 'sentenceId' = tk.sentence_id
      AND ep.template_id = 'tpl-dictation'
      AND NOT (ep.answer ? 'tokens')
  `)
}
