-- Make the dialogues schedulable.
--
-- One study item per dialogue, not per turn: the unit of practice is the whole
-- exchange. A single turn out of context is a vocabulary card with extra
-- steps, and the thing worth remembering is how the conversation goes.
--
-- sort_index sits at 4000 so `build:curriculum` (which rewrites it as a
-- position within the level) has something ordered to start from; the SPAN
-- entry for `dialogue` puts them in the last 55% of the level, after the words
-- and patterns they use.

INSERT INTO study_items (id, language_id, kind, dialogue_id, level_id, sort_index, published, active)
SELECT 'si-'||d.id, d.language_id, 'dialogue', d.id, d.level_id, 4000 + d.sort_index, d.published, true
FROM dialogues d
WHERE d.language_id = 'lang-ja'
ON CONFLICT (id) DO NOTHING;

INSERT INTO study_item_facets (id, study_item_id, facet, enabled, weight, intro_order)
SELECT 'sif-'||si.id||'-usage', si.id, 'usage', true, 1, 0
FROM study_items si
WHERE si.kind = 'dialogue'
ON CONFLICT (study_item_id, facet) DO NOTHING;

-- The prompt carries the whole script. Unlike every other exercise this is not
-- a single question — the card walks the turns and grades each learner turn as
-- it reaches it, so the client needs the lot up front. That also keeps it
-- working offline, which a per-turn fetch would not.
INSERT INTO exercise_prompts (id, facet_id, template_id, language_id, prompt, answer, distractors, status)
SELECT
  'ep-'||f.id,
  f.id,
  'tpl-dialogue-reply',
  d.language_id,
  jsonb_build_object(
    'kind', 'dialogue',
    'title', d.title,
    'situation', d.situation,
    'instruction', 'Choose your reply',
    'turns', (
      SELECT jsonb_agg(turn ORDER BY turn->>'index')
      FROM (
        SELECT jsonb_build_object(
          'index', t.index,
          'speaker', t.speaker,
          'text', t.text,
          'reading', t.reading_kana,
          'translation', t.translation,
          'replies', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
              'id', r.id,
              'text', r.text,
              'reading', r.reading_kana,
              'translation', r.translation,
              'isCorrect', r.is_correct,
              'whyWrong', r.why_wrong
            ) ORDER BY r.sort_index)
            FROM dialogue_replies r WHERE r.turn_id = t.id
          ), '[]'::jsonb)
        ) AS turn
        FROM dialogue_turns t WHERE t.dialogue_id = d.id
      ) turns
    )
  ),
  -- The whole exchange counts as one answer: you finish it or you do not.
  -- Per-turn correctness drives the feedback, not the SRS grade.
  jsonb_build_object('primary', d.code, 'accepted', jsonb_build_array(d.code)),
  '[]'::jsonb,
  'published'
FROM study_item_facets f
JOIN study_items si ON si.id = f.study_item_id
JOIN dialogues d ON d.id = si.dialogue_id
WHERE f.facet = 'usage'
ON CONFLICT (facet_id, template_id, version) DO NOTHING;
