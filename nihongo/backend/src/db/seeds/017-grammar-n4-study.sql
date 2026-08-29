-- Make the N4 points schedulable, and queue the prose for sign-off.
--
-- Keyed on level_id rather than a sort_index range: 013 used `sort_index >= 20`
-- because N5 was the only level, and repeating that trick would sweep up every
-- level added after this one.

INSERT INTO study_items (id, language_id, kind, grammar_point_id, level_id, sort_index, published, active)
SELECT 'si-'||g.id, g.language_id, 'grammar', g.id, g.level_id, 3000 + g.sort_index, true, true
FROM grammar_points g
WHERE g.language_id = 'lang-ja' AND g.level_id = 'lvl-ja-n4'
ON CONFLICT (id) DO NOTHING;

INSERT INTO study_item_facets (id, study_item_id, facet, enabled, weight, intro_order)
SELECT 'sif-'||si.id||'-usage', si.id, 'usage', true, 1, 0
FROM study_items si
JOIN grammar_points g ON g.id = si.grammar_point_id
WHERE g.level_id = 'lvl-ja-n4'
ON CONFLICT (study_item_id, facet) DO NOTHING;

-- Distractors are drawn from OTHER N4 points, not the whole corpus. Mixing an
-- N5 particle in beside four N4 auxiliaries makes the wrong answer obvious for
-- the wrong reason — the level, not the meaning.
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
WHERE f.facet = 'usage' AND g.level_id = 'lvl-ja-n4'
ON CONFLICT (facet_id, template_id, version) DO NOTHING;

-- Every point is a draft until a human signs it off, exactly as at N5.
INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, origin, priority, status)
SELECT 'crq-gp-'||g.slug, g.language_id, 'grammar_points', g.id, 'create',
       jsonb_build_object(
         'title', g.title, 'pattern', g.pattern,
         'meaningShort', g.meaning_short, 'meaningLong', g.meaning_long, 'nuance', g.nuance
       ),
       'human', 20, 'pending'
FROM grammar_points g
WHERE g.language_id = 'lang-ja' AND g.level_id = 'lvl-ja-n4'
ON CONFLICT (id) DO NOTHING;
