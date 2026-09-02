-- Put the word's meaning on the cards that never carried it.
--
-- A card can now introduce itself before quizzing, but a reading card had
-- nothing to introduce: `reading-input` prompts hold the word, its character and
-- a hint, and no meaning at all. So 今年 arrived with ことし beneath it and
-- nothing saying it means "this year" — the reading without the sense, which is
-- how you end up able to pronounce a word you do not know.
--
-- The meaning was never missing from the database, only from the prompt. The
-- same word's multiple-choice card has it as the ANSWER, because that card asks
-- for it; the reading card asks for something else and so was never given it.
--
-- Taken from the first sense, preferring the English gloss and falling back to
-- whatever the first gloss is, which matches how `import-listening` and the
-- dictionary already choose one. Only the first: a card wants the meaning, not
-- a lexicographic entry.
--
-- Covers word-backed cards only. Kana and kanji cards are excluded on purpose —
-- a kana has a reading rather than a meaning, and a kanji's meaning lives in a
-- different table with different rules.
--
-- Touches `prompt` on those cards and nothing else — no accounts, no srs_cards,
-- no review logs. Safe on a live database and safe to re-run.
UPDATE exercise_prompts p
SET prompt = p.prompt || jsonb_build_object('gloss', g.text),
    updated_at = now()
FROM study_item_facets f
JOIN study_items si ON si.id = f.study_item_id
JOIN LATERAL (
  SELECT COALESCE(
           (SELECT e ->> 'text' FROM jsonb_array_elements(s.glosses) e
             WHERE e ->> 'lang' = 'en' LIMIT 1),
           (SELECT e ->> 'text' FROM jsonb_array_elements(s.glosses) e LIMIT 1)
         ) AS text
  FROM word_senses s
  WHERE s.word_id = si.word_id
  ORDER BY s.sort_index
  LIMIT 1
) g ON g.text IS NOT NULL AND g.text <> ''
WHERE p.facet_id = f.id
  AND si.word_id IS NOT NULL
  -- As EXISTS rather than a join: UPDATE ... FROM cannot reference the target
  -- table from inside its own FROM clause.
  AND EXISTS (
    SELECT 1 FROM exercise_templates t
    WHERE t.id = p.template_id
      AND t.code IN ('reading-input', 'conjugation-drill')
  )
  -- Only where it would change something, so a second run is a no-op.
  AND COALESCE(p.prompt ->> 'gloss', '') <> g.text;
