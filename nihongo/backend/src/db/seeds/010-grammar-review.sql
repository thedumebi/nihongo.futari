-- Queue the grammar prose for sign-off too.
--
-- The points are already published so the app is usable, but they carry
-- status='in-review' and render with a "Draft" badge. Without a queue row there
-- was no way to clear that — the etymology had a review path and the prose that
-- surrounds it did not.
INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, origin, priority, status)
SELECT 'crq-gp-'||g.slug, g.language_id, 'grammar_points', g.id, 'create',
       jsonb_build_object(
         'title', g.title,
         'pattern', g.pattern,
         'meaningShort', g.meaning_short,
         'meaningLong', g.meaning_long,
         'nuance', g.nuance
       ),
       'human',
       -- After the etymology (priority 10): the prose is lower-stakes, since a
       -- wrong explanation of usage is easier to spot than a wrong etymology.
       20, 'pending'
FROM grammar_points g
WHERE g.status = 'in-review'
ON CONFLICT DO NOTHING;
