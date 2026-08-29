-- Attach the pre-generated kana audio to each drill prompt.
--
-- Real files, not browser SpeechSynthesis: the synthetic voice differs per
-- device, is unavailable offline, and can't be shadowed against. These are
-- generated once and served statically — the same model the R2 pipeline will
-- use, just sourced locally for now.
--
-- The URL lives on the prompt rather than being derived client-side, so the
-- storage location can move to R2 without touching the app.
UPDATE exercise_prompts ep
SET assets = jsonb_build_object(
  'audio', '/audio/kana/' || k.script || '-' || k.romaji || '.m4a'
)
FROM study_item_facets f
JOIN study_items si ON si.id = f.study_item_id
JOIN kana k ON k.id = si.kana_id
WHERE ep.facet_id = f.id
  AND si.kind = 'kana';
