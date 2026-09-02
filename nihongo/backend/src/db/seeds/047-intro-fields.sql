-- Give the introduction the Japanese, and let a card play its word as well as
-- its sentence.
--
-- Two faults with one cause: a card's prompt holds only what the QUESTION needs,
-- and the introduction needs more than that.
--
-- A listening card carries no word at all, deliberately — printing 今月 beside
-- "Listen. What does it mean?" would turn it into a reading exercise. So the
-- introduction, finding nothing, fell back to the answer and announced the
-- English "this month" as though that were the thing being learned. It spoiled
-- the card and taught nothing.
--
-- The fields are named `introWord` and `introReading` rather than `word` and
-- `reading` precisely so the question cannot pick them up. The card renders
-- `word`; the introduction renders these; neither can leak into the other by
-- accident.
--
-- Second: a cloze knows its sentence's audio and not the word's, so a card
-- teaching 今月 inside 今月いっぱいここにいます could play the sentence and never
-- the word on its own. Both are worth hearing and they are different things —
-- `wordAudio` sits beside `audio` rather than replacing it.
--
-- Touches `prompt` and `assets` on those cards and nothing else — no accounts,
-- no srs_cards, no review logs. Safe on a live database and safe to re-run.

-- 1. The Japanese, for cards whose question deliberately withholds it.
UPDATE exercise_prompts p
SET prompt = p.prompt || jsonb_build_object(
      'introWord', w.primary_form,
      'introReading', w.primary_reading
    ),
    updated_at = now()
FROM study_item_facets f
JOIN study_items si ON si.id = f.study_item_id
JOIN words w ON w.id = si.word_id
WHERE p.facet_id = f.id
  AND EXISTS (
    SELECT 1 FROM exercise_templates t
    WHERE t.id = p.template_id
      AND t.code IN ('listening', 'dictation')
  )
  AND COALESCE(p.prompt ->> 'introWord', '') <> w.primary_form;

-- 2. The word's own clip, alongside the sentence's.
--
-- Only where the clip exists: every published word has one, and pointing at a
-- missing file would give a button that does nothing.
UPDATE exercise_prompts p
SET assets = p.assets || jsonb_build_object('wordAudio', '/audio/words/' || w.ent_seq || '.m4a'),
    updated_at = now()
FROM study_item_facets f
JOIN study_items si ON si.id = f.study_item_id
JOIN words w ON w.id = si.word_id
WHERE p.facet_id = f.id
  AND w.ent_seq IS NOT NULL
  AND p.assets ? 'audio'
  -- Only where the existing clip is something OTHER than the word itself, which
  -- is what makes a second button worth having.
  AND p.assets ->> 'audio' <> '/audio/words/' || w.ent_seq || '.m4a'
  AND COALESCE(p.assets ->> 'wordAudio', '') <> '/audio/words/' || w.ent_seq || '.m4a';

-- 3. The WORD's meaning on a cloze, which only carried the sentence's.
--
-- A cloze teaching 今年 showed "This winter is warm." — the sentence's English,
-- which never says what 今年 itself means. Both belong: the gloss tells you the
-- word, the translation shows it doing its job in a sentence.
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
  AND EXISTS (
    SELECT 1 FROM exercise_templates t
    WHERE t.id = p.template_id AND t.code IN ('typed-cloze', 'word-order')
  )
  AND COALESCE(p.prompt ->> 'gloss', '') <> g.text;
