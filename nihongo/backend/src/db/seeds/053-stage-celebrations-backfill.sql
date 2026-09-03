-- Record how far each reader has ALREADY got, before the celebration goes live.
--
-- The celebration now fires when a level's current stage exceeds the highest
-- ever reached. With an empty table the first request would seed "highest" from
-- the CURRENT stage — and current is `min(stage) where learned < total`, the
-- lowest unfinished stage, which is 1 for anyone who has a single unlearned
-- card down in stage 1. It is 1 for the owner right now: N5 stage 1 stands at
-- 14/96 because `038-listening-cards.sql` added a listening facet to words he
-- learned months ago.
--
-- So seeding from `current` would set highest = 1 and then congratulate him on
-- "completing stage 1" the moment he cleared it and the number sprang back to
-- 4. That is precisely the bug being fixed, reintroduced by the fix.
--
-- Seeded instead from the furthest stage the reader has demonstrably LEARNED
-- something in: the highest stage holding a card of theirs at state >= 2. That
-- is the same bar `stageRollup` uses for "learned" everywhere else in this
-- service, so the two agree by construction.
--
-- Deliberately not "the highest stage holding any card at all". A card exists
-- from the first answer, right or wrong, so that measure is dragged up by a
-- single item glanced at once — on the owner's own data it reads 39 against a
-- genuine 12, which would silence the celebration for the rest of the level.
-- Nor is the exact history recoverable: what we want is the highest `current`
-- he ever held, and nothing records it. This is the closest honest proxy, and
-- it errs towards silence, which is the right way to be wrong here — a missed
-- celebration is a smaller insult than a false one.
--
-- Derived from srs_cards, so it is right for every user without naming any.
-- Touches `stage_celebrations` only. Safe on a live database and safe to re-run.
INSERT INTO stage_celebrations (user_id, level_id, highest_stage_seen)
SELECT
  c.user_id,
  si.level_id,
  MAX(ceil(si.sort_index::float / 50))::integer
FROM srs_cards c
JOIN study_item_facets f ON f.id = c.facet_id
JOIN study_items si ON si.id = f.study_item_id
WHERE si.level_id IS NOT NULL
  AND c.state >= 2
GROUP BY c.user_id, si.level_id
ON CONFLICT (user_id, level_id) DO UPDATE
  SET highest_stage_seen = GREATEST(stage_celebrations.highest_stage_seen, EXCLUDED.highest_stage_seen),
      updated_at = now();
