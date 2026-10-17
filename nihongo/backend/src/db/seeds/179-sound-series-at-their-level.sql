-- Each sound series at the level where it can first be taught.
--
-- A series is offered only once the learner knows two of its kanji, but it
-- was levelled by its sound part alone, so N5 listed series whose second kanji
-- is N4 or N3 (反: only 飯 at N5; 工: only 紅). Progress showed "0/9 sound
-- families" at N5 that no amount of N5 study could finish. Now a series sits
-- at the level of its second-easiest kanji in the course, and one with fewer
-- than two kanji in the course (it could never be offered) leaves review, as
-- the unreliable ones did in seed 174: still on the Sound series page, never a
-- card. Derived from the course itself, so a re-run changes nothing.

UPDATE study_items si
SET level_id = s.level_id, updated_at = now()
FROM (
  SELECT item_id, level_id FROM (
    SELECT si2.id AS item_id, ll.id AS level_id,
      row_number() OVER (PARTITION BY si2.id ORDER BY ll.sort_index, m.kanji_id) AS rn
    FROM study_items si2
    JOIN phonetic_series_members m ON m.series_id = si2.phonetic_series_id AND m.follows_series
    JOIN study_items ki ON ki.kanji_id = m.kanji_id AND ki.kind = 'kanji' AND ki.published
    JOIN language_levels ll ON ll.id = ki.level_id
    WHERE si2.kind = 'phonetic-series'
  ) ranked
  WHERE rn = 2
) s
WHERE si.id = s.item_id AND si.level_id IS DISTINCT FROM s.level_id;

UPDATE study_items si
SET active = false, updated_at = now()
WHERE si.kind = 'phonetic-series' AND si.active
  AND (
    SELECT count(DISTINCT m.kanji_id)
    FROM phonetic_series_members m
    JOIN study_items ki ON ki.kanji_id = m.kanji_id AND ki.kind = 'kanji' AND ki.published
    WHERE m.series_id = si.phonetic_series_id AND m.follows_series
  ) < 2;
