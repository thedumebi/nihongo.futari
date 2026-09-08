-- Give the phonetic series a JLPT level, so they stop landing on beginners.
--
-- Reported from the app: an N5 deck served 元 / ガン on its own — no member
-- kanji, no explanation — and it was baffling, correctly. The cause is that all
-- 63 series carried no level at all, and the level filter deliberately lets an
-- unlevelled item pass EVERY level, so that picking N5 does not silently drop a
-- whole deck. Sound-series items were the reason that rule exists, and they
-- were also the thing it broke.
--
-- A phonetic series is not JLPT-graded in itself, but it becomes USEFUL at a
-- definite point: when you know more than one kanji that contains the
-- component. Knowing 元 predicts ガン is worth nothing until you have met 完 and
-- 院 as well. So the level is the level of the SECOND-earliest member — the
-- point at which the pattern has something to be a pattern about.
--
-- That puts 11 series at N5, 13 at N4, 38 at N3, 24 at N2 and 11 at N1. The
-- series with fewer than two levelled members fall back to their one member's
-- level, and anything still unknown goes to N1 rather than staying unlevelled:
-- the failure mode of guessing too late is a card nobody sees, and the failure
-- mode of guessing too early is the one being fixed.

UPDATE study_items si
SET level_id = lv.level_id, updated_at = now()
FROM (
  SELECT ps.id AS series_id,
         COALESCE(
           (array_agg(l.id ORDER BY l.sort_index))[2],
           (array_agg(l.id ORDER BY l.sort_index))[1]
         ) AS level_id
  FROM phonetic_series ps
  JOIN phonetic_series_members m ON m.series_id = ps.id
  JOIN kanji k ON k.id = m.kanji_id
  JOIN language_levels l ON l.id = k.level_id
  GROUP BY ps.id
) lv
WHERE si.phonetic_series_id = lv.series_id
  AND si.level_id IS DISTINCT FROM lv.level_id;

-- Anything with no levelled member at all: N1, not nothing.
UPDATE study_items si
SET level_id = (SELECT id FROM language_levels WHERE code = 'N1' AND language_id = si.language_id),
    updated_at = now()
WHERE si.kind = 'phonetic-series' AND si.level_id IS NULL;
