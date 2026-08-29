-- Make the part-two grammar points schedulable, and queue them for sign-off.
--
-- Written as SELECTs over grammar_points rather than a hand-typed list: the
-- points are already in the database, so restating their slugs here would be a
-- second place to keep in step.

INSERT INTO study_items (id, language_id, kind, grammar_point_id, level_id, sort_index, published, active)
SELECT 'si-'||g.id, g.language_id, 'grammar', g.id, g.level_id, 2000 + g.sort_index, true, true
FROM grammar_points g
WHERE g.language_id = 'lang-ja' AND g.sort_index >= 20
ON CONFLICT (id) DO NOTHING;

-- The usage facet is what the scheduler actually serves.
INSERT INTO study_item_facets (id, study_item_id, facet, enabled, weight, intro_order)
SELECT 'sif-'||si.id||'-usage', si.id, 'usage', true, 1, 0
FROM study_items si
JOIN grammar_points g ON g.id = si.grammar_point_id
WHERE g.sort_index >= 20
ON CONFLICT (study_item_id, facet) DO NOTHING;

-- A recognition prompt per point. Distractors are other points' short meanings,
-- so a wrong option is always a plausible grammar explanation rather than
-- obvious filler.
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
      WHERE o.language_id = g.language_id AND o.id <> g.id
      ORDER BY md5(o.id || g.id)
      LIMIT 3
    ) picked
  ),
  'published'
FROM study_item_facets f
JOIN study_items si ON si.id = f.study_item_id
JOIN grammar_points g ON g.id = si.grammar_point_id
WHERE f.facet = 'usage' AND g.sort_index >= 20
ON CONFLICT (facet_id, template_id, version) DO NOTHING;

-- Queue the new prose and the new etymology for sign-off, same as 010.
INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, origin, priority, status)
SELECT 'crq-gp-'||g.slug, g.language_id, 'grammar_points', g.id, 'create',
       jsonb_build_object(
         'title', g.title, 'pattern', g.pattern,
         'meaningShort', g.meaning_short, 'meaningLong', g.meaning_long, 'nuance', g.nuance
       ),
       'human', 20, 'pending'
FROM grammar_points g
WHERE g.language_id = 'lang-ja' AND g.sort_index >= 20
ON CONFLICT (id) DO NOTHING;

INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, origin, priority, status)
SELECT 'crq-'||e.id, e.language_id, 'etymology_entries', e.id, 'create',
       jsonb_build_object('claim', e.claim, 'body', e.body, 'confidence', e.confidence),
       'human', 10, 'pending'
FROM etymology_entries e
WHERE e.id LIKE 'ety-%' AND e.grammar_point_id IN (
  SELECT id FROM grammar_points WHERE language_id = 'lang-ja' AND sort_index >= 20
)
ON CONFLICT (id) DO NOTHING;
