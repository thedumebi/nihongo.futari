-- Give every finished lesson the review card it was told it had.
--
-- `completeLesson` recorded the view, recorded the questions missed, and then
-- returned `addedToReview: true` without creating anything. So a finished
-- lesson produced a topic with no `srs_cards` row, which no queue can serve —
-- and the missed questions, faithfully stored in `lesson_misses`, could never
-- come back, because `promptPick` only chooses a prompt for a card that is
-- already in the queue. Reported twice from the app before it was believed.
--
-- The code is fixed; this repairs what the broken version left behind.
--
-- state 1 (Learning), so it counts as due under the canonical predicate at
-- once rather than queueing behind the new-card limit. Due now rather than at
-- the next day boundary: these lessons were finished days ago, and a topic the
-- reader was promised would come back should not wait another night.
--
-- No `srs_review_logs` rows. `srs_cards` is a fold over those logs, and
-- inventing history would inflate every future interval permanently.

INSERT INTO srs_cards (id, user_id, facet_id, language_id, due, state, first_seen_at, created_at, updated_at)
SELECT
  gen_random_uuid()::text,
  lv.user_id,
  f.id,
  si.language_id,
  now(),
  1,
  COALESCE(lv.completed_at, now()),
  now(),
  now()
FROM lesson_views lv
JOIN study_items si       ON si.id = lv.study_item_id AND si.kind = 'grammar'
JOIN study_item_facets f  ON f.study_item_id = si.id AND f.facet = 'usage' AND f.enabled
WHERE lv.completed_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM srs_cards c WHERE c.user_id = lv.user_id AND c.facet_id = f.id
  );
