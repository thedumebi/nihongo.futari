-- Hold each conjugation drill back until the grammar that explains it is learned.
--
-- 仕事 arrives at sort_index 154 carrying four conjugation drills. 〜ます is at
-- 157, 〜て form at 165, 〜た at 173, 〜ない at 188. So the app has been asking for
-- the past form roughly twenty items before anything said what a past form is:
-- "I haven't been thought a plain past. What does a plain past even mean?"
--
-- The gate goes on the PROMPT rather than on study_item_prerequisites, which is
-- keyed per item. 仕事's item also carries its meaning and its reading, and both
-- are perfectly fine at 154 — it is only the drills that are early. Blocking the
-- item would delay the word to fix the drills.
--
-- `targetForm` maps one-to-one onto a point, 135 prompts each:
--   masu → 〜ます   te → 〜て form   ta → 〜た   nai → 〜ない
--
-- Touches `requires_grammar_point_id` on conjugation-drill prompts and nothing
-- else — no accounts, no srs_cards, no review logs. Safe on a live database and
-- safe to re-run.

UPDATE exercise_prompts p
SET requires_grammar_point_id = g.id,
    updated_at = now()
FROM exercise_templates t, grammar_points g
WHERE t.id = p.template_id
  AND t.code = 'conjugation-drill'
  AND g.language_id = 'lang-ja'
  AND g.slug = CASE p.prompt ->> 'targetForm'
                 WHEN 'masu' THEN 'masu'
                 WHEN 'te'   THEN 'te-form'
                 WHEN 'ta'   THEN 'ta-form'
                 WHEN 'nai'  THEN 'nai'
               END
  AND p.requires_grammar_point_id IS DISTINCT FROM g.id;

-- A gated prompt is withheld until its grammar graduates. If a drill ever sits
-- in an EARLIER stage than the grammar it waits for, its facet can never be
-- answered, and since a stage needs every card to graduate the level stalls
-- forever. That is not the case today — all 540 drills and all four points are
-- in stage 4 — but build-curriculum recomputes sort_index from frequency data,
-- so it could become the case without anyone noticing. Fail loudly here instead
-- of silently at 3am in a user's queue.
DO $$
DECLARE bad integer;
BEGIN
  SELECT count(*) INTO bad
  FROM exercise_prompts p
  JOIN study_item_facets f ON f.id = p.facet_id
  JOIN study_items dsi ON dsi.id = f.study_item_id
  JOIN grammar_points g ON g.id = p.requires_grammar_point_id
  JOIN study_items gsi ON gsi.grammar_point_id = g.id
  WHERE p.requires_grammar_point_id IS NOT NULL
    AND dsi.level_id = gsi.level_id
    AND ceil(dsi.sort_index::float / 50) < ceil(gsi.sort_index::float / 50);

  IF bad > 0 THEN
    RAISE EXCEPTION
      'Conjugation gate would deadlock: % drill prompt(s) sit in an earlier stage than the grammar they require. Re-run build-curriculum or move the grammar earlier before applying this.', bad;
  END IF;
END $$;
