-- Rebuild the embedded dialogue prompts.
--
-- 030 copies the turns into `exercise_prompts.prompt` as a snapshot so the
-- whole exchange ships in one payload and works offline. That is the right
-- trade, but it means any edit to the underlying tables leaves the prompt
-- stale — 031 respaced every reading and the prompts kept the old ones.
--
-- Idempotent and safe to re-run after any dialogue edit. Runs as an UPDATE
-- rather than an insert-on-conflict because the rows already exist.

UPDATE exercise_prompts p
SET prompt = jsonb_build_object(
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
    updated_at = now()
FROM study_item_facets f, study_items si, dialogues d
WHERE p.facet_id = f.id
  AND si.id = f.study_item_id
  AND d.id = si.dialogue_id
  AND p.prompt->>'kind' = 'dialogue';
