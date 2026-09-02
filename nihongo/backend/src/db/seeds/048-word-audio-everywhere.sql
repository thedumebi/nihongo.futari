-- Let every word-backed card play its word.
--
-- 047 added `wordAudio` only where the card already had OTHER audio — a cloze
-- with a sentence clip. That missed the cards with no audio at all: all 540
-- conjugation drills, where 仕事 introduced itself with a reading and a meaning
-- and no way to hear it, despite the clip existing since the word audio was
-- generated.
--
-- The condition was wrong rather than the idea. A card should offer the word
-- whenever there is a word and a clip for it; whether it also has a sentence to
-- play is a separate question.
--
-- Set even where `audio` already IS the word's clip. That looks redundant and
-- is not: it makes `wordAudio` mean one thing everywhere — "this card's word,
-- spoken" — rather than something that appears only in the cases where it
-- differs. The reader never sees a duplicate button, because the frontend drops
-- `wordAudio` when it matches `audio`.
--
-- Kanji cards are left alone deliberately. A kanji has several readings and no
-- single clip; recording one would teach whichever reading happened to be
-- chosen as though it were the only one.
--
-- Touches `assets` on word-backed cards and nothing else — no accounts, no
-- srs_cards, no review logs. Safe on a live database and safe to re-run.
UPDATE exercise_prompts p
SET assets = p.assets || jsonb_build_object('wordAudio', '/audio/words/' || w.ent_seq || '.m4a'),
    updated_at = now()
FROM study_item_facets f
JOIN study_items si ON si.id = f.study_item_id
JOIN words w ON w.id = si.word_id
WHERE p.facet_id = f.id
  AND w.ent_seq IS NOT NULL
  AND w.published
  AND COALESCE(p.assets ->> 'wordAudio', '') <> '/audio/words/' || w.ent_seq || '.m4a';
