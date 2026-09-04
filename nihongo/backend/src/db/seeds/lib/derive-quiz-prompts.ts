/**
 * Derive the lesson quiz from whatever authored sentences exist.
 *
 * Word-order, dictation and "which one is correct?" questions, cut from
 * `sentence_tokens` rather than from sentence text — the tokens are what know
 * where one word ends and the next begins.
 *
 * This lives in code because a seed is recorded in `seed_history` by filename
 * and never runs a second time, so a seed written today cannot see sentences
 * that arrive tomorrow. Every batch of examples needs the derivation run again,
 * and the alternative was another verbatim copy of 120 lines of SQL each time —
 * 055, 057 and 059 are three such copies, which is where that stopped being
 * tolerable. A batch seed is now three lines that call this.
 *
 * Idempotent: every insert is ON CONFLICT DO NOTHING, so re-running picks up
 * only the sentences that have no questions yet and leaves the rest alone.
 */
import db from '@nihongo/shared/db'
import { sql } from 'drizzle-orm'

const DERIVATION = `WITH grouped AS (
  SELECT
    st.sentence_id, st.index, st.surface, st.furigana,
    -- A chip starts at every token the dictionary knows, and at every token
    -- longer than one character. An unlinked SINGLE kana is a fragment —
    -- \`glossLine\` shreds anything outside the published vocabulary, so です
    -- arrives as the real particle で plus an orphan す — and it belongs to the
    -- chip before it. Dragging で and す separately is a puzzle about the
    -- tokeniser, not about Japanese.
    sum(CASE WHEN st.word_id IS NOT NULL OR length(st.surface) > 1 THEN 1 ELSE 0 END)
      OVER (PARTITION BY st.sentence_id ORDER BY st.index
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS grp
  FROM sentence_tokens st
  JOIN sentences ss ON ss.id = st.sentence_id AND ss.source = 'authored'
  WHERE st.surface !~ '^[。、！？「」]+$'
),
-- Text and ruby are aggregated SEPARATELY and joined back.
--
-- Doing both in one pass meant lateral-joining the furigana array, which
-- multiplies the row per segment — so a two-segment token had its surface
-- concatenated twice and 朝ご飯を食べる came out as
-- ["朝ご飯","朝ご飯","朝ご飯を","食べる","食べる"].
chip_text AS (
  SELECT sentence_id, grp, min(index) AS pos, string_agg(surface, '' ORDER BY index) AS chip
  FROM grouped GROUP BY sentence_id, grp
),
chip_ruby AS (
  SELECT g.sentence_id, g.grp,
         jsonb_agg(
           CASE WHEN e.seg ? 'r' THEN jsonb_set(e.seg, '{r}', to_jsonb(btrim(e.seg->>'r'))) ELSE e.seg END
           ORDER BY g.index, e.ord
         ) AS ruby
  FROM grouped g
  CROSS JOIN LATERAL jsonb_array_elements(g.furigana) WITH ORDINALITY e(seg, ord)
  GROUP BY g.sentence_id, g.grp
),
chips AS (
  SELECT t.sentence_id, t.pos, t.chip, COALESCE(r.ruby, jsonb_build_array(jsonb_build_object('t', t.chip))) AS ruby
  FROM chip_text t
  LEFT JOIN chip_ruby r ON r.sentence_id = t.sentence_id AND r.grp = t.grp
)
INSERT INTO exercise_prompts (id, facet_id, template_id, language_id, version, prompt, answer, distractors, assets, status)
SELECT
  'ep-wo-' || gps.grammar_point_id || '-' || gps.sort_index,
  f.id,
  'tpl-word-order',
  'lang-ja',
  gps.sort_index + 1,
  jsonb_build_object(
    'kind', 'word-order',
    'instruction', 'Put the words in order',
    'translation', tr.text,
    -- Shuffled deterministically, so the same sentence always presents the
    -- same way and a reader who returns is not re-learning the layout.
    'tokens', (SELECT jsonb_agg(c.chip ORDER BY md5(c.chip || s.id)) FROM chips c WHERE c.sentence_id = s.id),
    'tokenFurigana', (SELECT jsonb_object_agg(c.chip, c.ruby) FROM chips c WHERE c.sentence_id = s.id)
  ),
  jsonb_build_object(
    -- Every punctuation mark stripped, not just a trailing one.
    --
    -- The chips are built from tokens with punctuation removed, so a comma in
    -- the middle of a sentence is something the input CANNOT produce. Anchoring
    -- the strip to the end left 電話して、会社に行きます as the only accepted
    -- answer to a puzzle whose chips join to 電話して会社に行きます — four
    -- questions that could be ordered perfectly and still marked wrong.
    'primary', regexp_replace(s.text, '[。、！？「」]', '', 'g'),
    'accepted', jsonb_build_array(
      regexp_replace(s.text, '[。、！？「」]', '', 'g'),
      regexp_replace(s.text, '[。、！？]+$', ''),
      s.text
    )
  ),
  '[]'::jsonb,
  jsonb_build_object('audio', '/audio/sentences/' || s.id || '.m4a', 'sentenceId', s.id),
  'published'
FROM grammar_point_sentences gps
JOIN sentences s ON s.id = gps.sentence_id AND s.published AND s.source = 'authored'
JOIN study_items si ON si.grammar_point_id = gps.grammar_point_id
JOIN study_item_facets f ON f.study_item_id = si.id AND f.facet = 'usage'
LEFT JOIN sentence_translations tr ON tr.sentence_id = s.id AND tr.lang = 'en'
WHERE gps.role = 'example'
  -- Two chips are not an arrangement.
  AND (SELECT count(*) FROM chips c WHERE c.sentence_id = s.id) >= 3
ON CONFLICT (facet_id, template_id, version) DO NOTHING;

-- 2. Dictation, one per example sentence.
--
-- Audio for every published sentence is produced by \`audio:sentences\` and
-- addressed by row id, so its existence follows from the sentence being
-- published — the same reasoning \`044-cloze-audio.sql\` used. A prompt pointing
-- at a missing clip would be worse than no prompt at all.
INSERT INTO exercise_prompts (id, facet_id, template_id, language_id, version, prompt, answer, distractors, assets, status)
SELECT
  'ep-dict-' || gps.grammar_point_id || '-' || gps.sort_index,
  f.id,
  'tpl-dictation',
  'lang-ja',
  gps.sort_index + 1,
  jsonb_build_object(
    'kind', 'dictation',
    'instruction', 'Listen, and type what you hear',
    'hint', tr.text
  ),
  jsonb_build_object(
    'primary', s.text,
    -- NOT the stored reading. \`reading_kana\` is deliberately SPOKEN — は is
    -- written わ, を is お — so accepting it would mark わたしわがくせいです
    -- correct and teach a misspelling. Only the sentence, with or without its
    -- full stop.
    -- Dictation is typed, so the sentence as written is the primary answer —
    -- but punctuation is not what is being tested, and a learner who hears
    -- 電話して、会社に行きます and types it without the comma has got it right.
    'accepted', jsonb_build_array(
      s.text,
      regexp_replace(s.text, '[。、！？]+$', ''),
      regexp_replace(s.text, '[。、！？「」]', '', 'g')
    )
  ),
  '[]'::jsonb,
  jsonb_build_object('audio', '/audio/sentences/' || s.id || '.m4a', 'sentenceId', s.id),
  'published'
FROM grammar_point_sentences gps
JOIN sentences s ON s.id = gps.sentence_id AND s.published AND s.source = 'authored'
JOIN study_items si ON si.grammar_point_id = gps.grammar_point_id
JOIN study_item_facets f ON f.study_item_id = si.id AND f.facet = 'usage'
LEFT JOIN sentence_translations tr ON tr.sentence_id = s.id AND tr.lang = 'en'
WHERE gps.role = 'example' AND s.reading_kana IS NOT NULL
ON CONFLICT (facet_id, template_id, version) DO NOTHING;

-- 3. "Which sentence is correct?", from the mistakes already authored.
--
-- Version starts at 2 because version 1 on tpl-mcq is the meaning question
-- every topic already has.
INSERT INTO exercise_prompts (id, facet_id, template_id, language_id, version, prompt, answer, distractors, assets, status)
SELECT
  'ep-mis-' || gm.id,
  f.id,
  'tpl-mcq',
  'lang-ja',
  1 + row_number() OVER (PARTITION BY gm.grammar_point_id ORDER BY gm.sort_index),
  jsonb_build_object(
    'kind', 'grammar',
    'instruction', 'Which one is correct?',
    'character', g.title,
    'pattern', g.pattern,
    -- \`explanation\`, not \`gloss\`: the renderer prints a gloss as the question's
    -- subtitle, so "く-verbs take いて, but 行く is irregular" appeared above
    -- 行くて and 行って and gave the answer away. It shows on reveal instead.
    'explanation', gm.why_wrong
  ),
  jsonb_build_object('primary', gm."right", 'accepted', jsonb_build_array(gm."right")),
  jsonb_build_array(gm.wrong),
  '{}'::jsonb,
  'published'
FROM grammar_mistakes gm
JOIN grammar_points g ON g.id = gm.grammar_point_id AND g.published
JOIN study_items si ON si.grammar_point_id = gm.grammar_point_id
JOIN study_item_facets f ON f.study_item_id = si.id AND f.facet = 'usage'
ON CONFLICT (facet_id, template_id, version) DO NOTHING;
`

export async function deriveQuizPrompts(): Promise<void> {
  await db.execute(sql.raw(DERIVATION))
}
