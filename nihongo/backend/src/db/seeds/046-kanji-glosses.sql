-- Put the meaning on kanji cards too.
--
-- 045 gave word cards their gloss and stopped there, on the reasoning that a
-- kanji's meaning lives in a different table under different rules. That was
-- the wrong call: a kanji you can read and cannot understand is the exact
-- failure the introduction exists to prevent, and "different table" is a reason
-- to write a second statement, not to leave 5,840 cards without a meaning.
--
-- The shape genuinely does differ — `kanji.meanings` is `{lang, gloss}` where
-- `word_senses.glosses` is `{lang, text}` — which is why this is its own seed
-- rather than a widened version of the last one.
--
-- Up to three meanings, joined. One is not enough for a kanji: 奥 alone as
-- "heart" is misleading where "heart; interior" is not, and a character's
-- senses are usually facets of one idea rather than competing definitions. Three
-- is where that stops helping and starts being a dictionary entry.
--
-- Touches `prompt` on kanji-backed cards and nothing else — no accounts, no
-- srs_cards, no review logs. Safe on a live database and safe to re-run.
UPDATE exercise_prompts p
SET prompt = p.prompt || jsonb_build_object('gloss', g.text),
    updated_at = now()
FROM study_item_facets f
JOIN study_items si ON si.id = f.study_item_id
JOIN kanji k ON k.id = si.kanji_id
JOIN LATERAL (
  SELECT string_agg(m.gloss, '; ' ORDER BY m.n) AS text
  FROM (
    SELECT e ->> 'gloss' AS gloss, row_number() OVER () AS n
    FROM jsonb_array_elements(k.meanings) e
    WHERE e ->> 'lang' = 'en' AND coalesce(e ->> 'gloss', '') <> ''
    LIMIT 3
  ) m
) g ON g.text IS NOT NULL AND g.text <> ''
WHERE p.facet_id = f.id
  AND si.kanji_id IS NOT NULL
  -- As EXISTS rather than a join: UPDATE ... FROM cannot reference the target
  -- table from inside its own FROM clause.
  AND EXISTS (
    SELECT 1 FROM exercise_templates t
    WHERE t.id = p.template_id
      AND t.code IN ('reading-input', 'mcq', 'handwriting')
  )
  -- Only where it would change something, so a second run is a no-op.
  AND COALESCE(p.prompt ->> 'gloss', '') <> g.text;
