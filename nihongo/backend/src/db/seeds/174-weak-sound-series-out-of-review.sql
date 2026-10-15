-- Sound series that hold for under 60% of their kanji leave the review queue.
--
-- A "pattern" that is right half the time teaches nothing: 共 is キョウ in 供
-- and 恭, but イ in 異 and コウ in 洪. These eleven (京 共 区 寺 方 旨 昔 未 正
-- 牙 責) stay on the Sound series page, where every exception is listed, but no
-- longer come up as cards. Deactivated rather than deleted: review history is
-- kept, and due cards simply stop being served (the queue only serves active
-- items).
--
-- Derived from the series' own reliability, so a re-run changes nothing.

UPDATE study_items SET active = false, updated_at = now()
WHERE active
  AND phonetic_series_id IN (SELECT id FROM phonetic_series WHERE reliability < 0.6);
