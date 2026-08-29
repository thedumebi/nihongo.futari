-- Make N3, N2 and N1 schedulable, and queue the prose for sign-off.
--
-- One statement per concern across all three levels rather than three copies of
-- 017: the wiring is identical and only the level set differs.

INSERT INTO study_items (id, language_id, kind, grammar_point_id, level_id, sort_index, published, active)
SELECT 'si-'||g.id, g.language_id, 'grammar', g.id, g.level_id, 3000 + g.sort_index, true, true
FROM grammar_points g
WHERE g.language_id = 'lang-ja' AND g.level_id IN ('lvl-ja-n3', 'lvl-ja-n2', 'lvl-ja-n1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO study_item_facets (id, study_item_id, facet, enabled, weight, intro_order)
SELECT 'sif-'||si.id||'-usage', si.id, 'usage', true, 1, 0
FROM study_items si
JOIN grammar_points g ON g.id = si.grammar_point_id
WHERE g.level_id IN ('lvl-ja-n3', 'lvl-ja-n2', 'lvl-ja-n1')
ON CONFLICT (study_item_id, facet) DO NOTHING;

-- Distractors come from the SAME level, as at N4: an N5 particle beside three
-- N1 classical forms is eliminated on register alone, which teaches nothing.
INSERT INTO exercise_prompts (id, facet_id, template_id, language_id, prompt, answer, distractors, status)
SELECT
  'ep-'||f.id,
  f.id,
  'tpl-mcq',
  g.language_id,
  jsonb_build_object(
    'kind', 'grammar',
    'character', g.title,
    'pattern', g.pattern,
    'instruction', 'What does this pattern mean?'
  ),
  jsonb_build_object('primary', g.meaning_short, 'accepted', jsonb_build_array(g.meaning_short)),
  (
    SELECT jsonb_agg(m) FROM (
      SELECT o.meaning_short AS m
      FROM grammar_points o
      WHERE o.language_id = g.language_id AND o.level_id = g.level_id AND o.id <> g.id
      ORDER BY md5(o.id || g.id)
      LIMIT 3
    ) picked
  ),
  'published'
FROM study_item_facets f
JOIN study_items si ON si.id = f.study_item_id
JOIN grammar_points g ON g.id = si.grammar_point_id
WHERE f.facet = 'usage' AND g.level_id IN ('lvl-ja-n3', 'lvl-ja-n2', 'lvl-ja-n1')
ON CONFLICT (facet_id, template_id, version) DO NOTHING;

INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, origin, priority, status)
SELECT 'crq-gp-'||g.slug, g.language_id, 'grammar_points', g.id, 'create',
       jsonb_build_object(
         'title', g.title, 'pattern', g.pattern,
         'meaningShort', g.meaning_short, 'meaningLong', g.meaning_long, 'nuance', g.nuance
       ),
       'human', 20, 'pending'
FROM grammar_points g
WHERE g.language_id = 'lang-ja' AND g.level_id IN ('lvl-ja-n3', 'lvl-ja-n2', 'lvl-ja-n1')
ON CONFLICT (id) DO NOTHING;
