-- Mark everything already studied as already introduced.
--
-- The introduction is now an event in the life of an ITEM rather than of a
-- card. Until this seed, `lesson_views` held only grammar lessons, so the day
-- the new rule ships every word, kanji and kana the reader has ever studied
-- would look un-introduced and announce itself again — a wave of "here is
-- 仕事, something new" for a vocabulary they have known for months. That is a
-- worse first impression of the fix than the bug it fixes.
--
-- The evidence that an item was met is that one of its facets has a card: cards
-- are created by the first answer and never by anything else. `first_seen_at`
-- takes the earliest of those, which is as close to the true moment as the
-- database can get; `now()` covers the rare card whose own `first_seen_at` is
-- null.
--
-- Derived entirely from srs_cards, so it is correct for every user without
-- naming any of them, and `ON CONFLICT DO NOTHING` leaves the grammar rows that
-- are already there untouched.
--
-- Touches `lesson_views` only — no accounts, no srs_cards, no review logs.
-- Safe on a live database and safe to re-run.
INSERT INTO lesson_views (user_id, study_item_id, first_seen_at)
SELECT
  c.user_id,
  f.study_item_id,
  COALESCE(MIN(c.first_seen_at), now())
FROM srs_cards c
JOIN study_item_facets f ON f.id = c.facet_id
GROUP BY c.user_id, f.study_item_id
ON CONFLICT (user_id, study_item_id) DO NOTHING;
