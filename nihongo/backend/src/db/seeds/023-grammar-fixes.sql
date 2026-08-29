-- Two fixes found by auditing the levels after 019–022.
--
-- 1. An N3 point that never inserted. 019 gave 〜から〜にかけて the slug
--    `kara-made`, which N5 already holds for 〜から〜まで. (language_id, slug)
--    is unique, so the row was silently rejected and N3 shipped 54 points
--    instead of 55. Re-added under a slug of its own.
--
-- 2. Twenty N5 grammar prompts with an EMPTY distractor list. They come from
--    the original 009/010 pass, before 013 started building distractors from
--    other points' meanings. A multiple-choice card with no distractors shows
--    one option, which is always the right one — it cannot be got wrong, so it
--    taught nothing and inflated the accuracy figures besides.

INSERT INTO grammar_points
  (id, language_id, slug, title, pattern, level_id, category, register, meaning_short, meaning_long, nuance, status, published, sort_index) VALUES
  ('gp-kara-nikakete', 'lang-ja', 'kara-nikakete', '〜から〜にかけて', 'Noun + から + Noun + にかけて', 'lvl-ja-n3', 'expression', 'formal', 'From one point to another, roughly.', '夕方から夜にかけて雨が降るでしょう.', 'Deliberately vague at both ends, which から〜まで is not. Forecasts prefer it because the edges genuinely are not known.', 'in-review', true, 253)
ON CONFLICT (language_id, slug) DO NOTHING;

INSERT INTO study_items (id, language_id, kind, grammar_point_id, level_id, sort_index, published, active)
SELECT 'si-'||g.id, g.language_id, 'grammar', g.id, g.level_id, 3000 + g.sort_index, true, true
FROM grammar_points g WHERE g.slug = 'kara-nikakete'
ON CONFLICT (id) DO NOTHING;

INSERT INTO study_item_facets (id, study_item_id, facet, enabled, weight, intro_order)
SELECT 'sif-'||si.id||'-usage', si.id, 'usage', true, 1, 0
FROM study_items si JOIN grammar_points g ON g.id = si.grammar_point_id
WHERE g.slug = 'kara-nikakete'
ON CONFLICT (study_item_id, facet) DO NOTHING;

INSERT INTO exercise_prompts (id, facet_id, template_id, language_id, prompt, answer, distractors, status)
SELECT
  'ep-'||f.id, f.id, 'tpl-mcq', g.language_id,
  jsonb_build_object('kind', 'grammar', 'character', g.title, 'pattern', g.pattern,
                     'instruction', 'What does this pattern mean?'),
  jsonb_build_object('primary', g.meaning_short, 'accepted', jsonb_build_array(g.meaning_short)),
  (SELECT jsonb_agg(m) FROM (
     SELECT o.meaning_short AS m FROM grammar_points o
     WHERE o.language_id = g.language_id AND o.level_id = g.level_id AND o.id <> g.id
     ORDER BY md5(o.id || g.id) LIMIT 3) picked),
  'published'
FROM study_item_facets f
JOIN study_items si ON si.id = f.study_item_id
JOIN grammar_points g ON g.id = si.grammar_point_id
WHERE f.facet = 'usage' AND g.slug = 'kara-nikakete'
ON CONFLICT (facet_id, template_id, version) DO NOTHING;

INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, origin, priority, status)
SELECT 'crq-gp-'||g.slug, g.language_id, 'grammar_points', g.id, 'create',
       jsonb_build_object('title', g.title, 'pattern', g.pattern, 'meaningShort', g.meaning_short,
                          'meaningLong', g.meaning_long, 'nuance', g.nuance),
       'human', 20, 'pending'
FROM grammar_points g WHERE g.slug = 'kara-nikakete'
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Backfill the empty distractor lists.
-- ---------------------------------------------------------------------------

UPDATE exercise_prompts p
SET distractors = (
      SELECT jsonb_agg(m) FROM (
        SELECT o.meaning_short AS m
        FROM grammar_points o
        WHERE o.language_id = g.language_id
          AND o.level_id = g.level_id
          AND o.id <> g.id
          AND o.meaning_short <> g.meaning_short
        ORDER BY md5(o.id || g.id)
        LIMIT 3
      ) picked
    ),
    updated_at = now()
FROM study_item_facets f, study_items si, grammar_points g
WHERE p.facet_id = f.id
  AND si.id = f.study_item_id
  AND g.id = si.grammar_point_id
  AND jsonb_array_length(coalesce(p.distractors, '[]'::jsonb)) < 3;
