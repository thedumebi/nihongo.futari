-- Give fill-in-the-blank cards the sentence they are asking about.
--
-- Cloze was the only card type with no audio at all: 0 of 1,679. You could work
-- out which word belonged in the gap and still never hear the sentence said,
-- which is most of what the exercise is for — knowing a word fits is not the
-- same as knowing how it sounds in place.
--
-- Nothing needs recording. Every cloze already carries the `sentenceId` it was
-- cut from, and `audio/sentences/<id>.m4a` has existed since the sentence audio
-- was generated; the two were simply never joined up.
--
-- The clip plays only AFTER the answer is revealed, which is a frontend
-- decision but worth recording here because it constrains this one: the missing
-- word is spoken in the sentence, so offering it beforehand would read the
-- answer aloud.
--
-- Touches `assets` on cloze prompts and nothing else — no accounts, no
-- srs_cards, no review logs. Safe on a live database and safe to re-run.
UPDATE exercise_prompts p
SET assets = p.assets || jsonb_build_object('audio', '/audio/sentences/' || (p.assets ->> 'sentenceId') || '.m4a'),
    updated_at = now()
FROM exercise_templates t
WHERE t.id = p.template_id
  AND t.code = 'typed-cloze'
  AND p.assets ? 'sentenceId'
  -- Only where a clip is actually expected to exist. A card pointing at a
  -- missing file is worse than one with no audio button at all.
  AND EXISTS (
    SELECT 1 FROM sentences s
    WHERE s.id = p.assets ->> 'sentenceId'
      AND s.published
  )
  AND coalesce(p.assets ->> 'audio', '') <> '/audio/sentences/' || (p.assets ->> 'sentenceId') || '.m4a';
