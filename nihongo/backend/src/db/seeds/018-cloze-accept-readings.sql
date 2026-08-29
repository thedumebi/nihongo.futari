-- Accept the kana reading on cloze cards whose answer is written in kanji.
--
-- A cloze on お茶 accepted only "お茶" and rejected "おちゃ", so an N5 card was
-- really asking the learner to WRITE 茶. Producing the character is what the
-- `writing` facet exists for; this drill is vocabulary in context, and the
-- dictionary form was already accepted beside the inflected one.
--
-- The reading was in the prompt all along as `hint` — it was being shown as a
-- nudge and never counted as an answer.
--
-- `import-cloze.ts` now writes it this way; this brings the rows that already
-- exist into line.

UPDATE exercise_prompts p
SET answer = jsonb_set(
      p.answer,
      '{accepted}',
      (
        SELECT jsonb_agg(DISTINCT v)
        FROM jsonb_array_elements_text(
          coalesce(p.answer->'accepted', '[]'::jsonb) || jsonb_build_array(p.prompt->>'hint')
        ) AS t(v)
      )
    ),
    updated_at = now()
WHERE p.prompt->>'kind' = 'cloze'
  -- Only where the expected answer needs a character the reader may not write.
  AND p.answer->>'primary' ~ '[㐀-䶿一-鿿]'
  -- Only a real kana reading. A hint that is itself kanji adds nothing, and a
  -- null one would insert a JSON null into the accepted list.
  AND p.prompt->>'hint' ~ '^[ぁ-ゟ゠-ヿーー]+$'
  AND NOT (coalesce(p.answer->'accepted', '[]'::jsonb) ? (p.prompt->>'hint'));
