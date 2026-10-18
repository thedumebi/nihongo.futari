-- Stage celebrations: repair marks that were wrong from the start, and set the
-- new "last stage seen" column from where each learner actually is.
--
-- The 053 backfill set each mark from the furthest stage holding any LEARNED
-- card. In the owner's first days, before the curriculum gate, the queue
-- served a few words far ahead, and one from N5 stage 39 was learned by 4 Sept.
-- So the mark read 39 while the owner was on stage 1, and since it only ever
-- rises, no celebration could fire before stage 40. None ever fired for anyone.
--
-- Each learner's current stage per level is recomputed with the rules of
-- `stageRollup` / `stageProgress` (published, active, levelled items; grammar,
-- Speak and sound series excluded; enabled facets; suspended cards out of both
-- halves; a stage with nothing to learn is passed; pass mark 85%). A mark above
-- it comes down to it, so the next real pass fires. Derived, so it is right for
-- every user without naming any; a second run changes nothing.
WITH learners AS (
  SELECT DISTINCT user_id FROM stage_celebrations
),
stages AS (
  SELECT
    u.user_id,
    si.level_id,
    ceil(si.sort_index::float / 50) AS stage,
    count(*) FILTER (WHERE c.id IS NULL OR NOT c.suspended) AS total,
    count(*) FILTER (WHERE c.state >= 2 AND NOT c.suspended) AS learned
  FROM learners u
  CROSS JOIN study_items si
  JOIN study_item_facets f ON f.study_item_id = si.id AND f.enabled
  LEFT JOIN srs_cards c ON c.facet_id = f.id AND c.user_id = u.user_id
  WHERE si.published AND si.active
    AND si.level_id IS NOT NULL
    AND si.kind NOT IN ('grammar', 'speak', 'phonetic-series')
  GROUP BY 1, 2, 3
),
current AS (
  SELECT user_id, level_id, min(stage)::integer AS stage
  FROM stages
  WHERE total > 0 AND learned::float / total < 0.85
  GROUP BY 1, 2
)
UPDATE stage_celebrations sc
SET highest_stage_seen = LEAST(sc.highest_stage_seen, cur.stage),
    last_stage_seen = cur.stage,
    updated_at = now()
FROM current cur
WHERE sc.user_id = cur.user_id
  AND sc.level_id = cur.level_id
  AND (sc.highest_stage_seen > cur.stage OR sc.last_stage_seen <> cur.stage);

-- The owner passed N5 stage 4 on 18 Oct (11:38 Tokyo) under the stale mark and
-- saw nothing; they asked for that celebration. It waits as pending and shows
-- on their next Study or Today.
UPDATE stage_celebrations
SET pending_from = 4, pending_to = 5, updated_at = now()
WHERE user_id = 'e765d564-330e-445c-a492-bca1a0813762'
  AND level_id = 'lvl-ja-n5'
  AND highest_stage_seen = 5
  AND pending_to IS NULL;
