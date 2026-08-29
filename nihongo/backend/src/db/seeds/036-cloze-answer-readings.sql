-- Cloze cards: accept the reading of what is written in the blank.
--
-- A cloze accepted the surface, the word's dictionary form, and that
-- DICTIONARY FORM's reading — but not the reading of the text actually sitting
-- in the blank. A sentence writing ６つ therefore rejected むっつ, the correct
-- reading of what is on screen, and told the reader they were wrong for being
-- right.
--
-- Derived here rather than shipped as a list of literals: the reading is
-- already in `sentence_tokens.reading` for the very token the blank was cut
-- from, so this recomputes it in place and cannot drift from the corpus. The
-- importer writes the same value for new cards (`import-cloze.ts`); this exists
-- to correct the ones generated before it did.
--
-- Touches `answer` on cloze prompts and nothing else — no accounts, no
-- srs_cards, no review logs. Safe on a live database, and safe to re-run.
UPDATE exercise_prompts p
SET answer = jsonb_set(
      p.answer,
      '{accepted}',
      (
        SELECT jsonb_agg(DISTINCT value)
        FROM (
          SELECT jsonb_array_elements_text(p.answer -> 'accepted') AS value
          UNION
          SELECT t.reading
        ) AS candidates
        WHERE value IS NOT NULL AND value <> ''
      )
    ),
    updated_at = now()
FROM sentence_tokens t
WHERE p.prompt ->> 'kind' = 'cloze'
  AND t.sentence_id = p.assets ->> 'sentenceId'
  AND t.surface = p.answer ->> 'primary'
  AND t.reading IS NOT NULL
  AND t.reading <> ''
  -- Only where it would actually change something, so a re-run is a no-op.
  AND NOT (p.answer -> 'accepted' @> to_jsonb(t.reading));
