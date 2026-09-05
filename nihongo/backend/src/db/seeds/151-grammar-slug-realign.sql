-- Five grammar slugs that name a different pattern than the topic teaches.
--
-- Found while verifying the why-layer: the ならでは entry carried the id
-- ety-n1-to-wa-ie-mono-no, because entry ids follow the topic's slug and that
-- topic's slug says とはいえ／ものの. Three names for one row —
-- id gp-nagara-mo-n1, slug to-wa-ie-mono-no, title 〜ならでは — and none of them
-- agreed. That is how the tangle happened, and it is mine: seed 021 wrote it.
--
-- The slug is the one that matters, because it is the URL: grammar.service.ts
-- builds hrefs from it and getDueList links by it. Ids are internal foreign
-- keys nobody sees, so they are left alone — 49 of them disagree with their
-- slug and almost all are harmless spelling variants (gp-tari-tomo against
-- taritomo). Only the five below name the WRONG PATTERN:
--
--   toki-doki-place       〜の中 / 上 / 下 / 前 / 後ろ  -- "sometimes" is not position
--   te-form-request-chain 〜て、〜て                    -- a sequence, not a request
--   nikui-gatai           〜がたい                      -- にくい is a separate topic,
--                                                        and a separate WORD: the N3
--                                                        pass established がたい is
--                                                        難し while にくい is 憎い
--   wo-kiniseze           〜をものともせず              -- 気にせず is a different pattern
--   to-wa-ie-mono-no      〜ならでは                    -- names two other patterns
--
-- Safe to change: nothing stores a grammar slug except this column. No sentence
-- id embeds one, and no user progress keys on one — lesson_views and srs_cards
-- both reference study_items by id. The only casualty is a bookmark to one of
-- the five old URLs, and each of those URLs was wrong.
--
-- The four etymology entries keyed on these slugs are renamed to match. Their
-- source rows are dropped and rebuilt rather than updated, because the foreign
-- key is ON DELETE CASCADE with no ON UPDATE, and rebuilding is the derivation
-- seed 144 already used.

UPDATE grammar_points SET slug = 'position-nouns', updated_at = now()
WHERE slug = 'toki-doki-place' AND language_id = 'lang-ja';

UPDATE grammar_points SET slug = 'te-form-sequence', updated_at = now()
WHERE slug = 'te-form-request-chain' AND language_id = 'lang-ja';

UPDATE grammar_points SET slug = 'gatai', updated_at = now()
WHERE slug = 'nikui-gatai' AND language_id = 'lang-ja';

UPDATE grammar_points SET slug = 'wo-mono-tomo-sezu', updated_at = now()
WHERE slug = 'wo-kiniseze' AND language_id = 'lang-ja';

UPDATE grammar_points SET slug = 'nara-de-wa', updated_at = now()
WHERE slug = 'to-wa-ie-mono-no' AND language_id = 'lang-ja';

-- Sources come off first: the FK has no ON UPDATE.
DELETE FROM etymology_sources WHERE etymology_id IN
  ('ety-n5-toki-doki-place', 'ety-n3-nikui-gatai', 'ety-n2-wo-kiniseze', 'ety-n1-to-wa-ie-mono-no');

UPDATE etymology_entries SET id = 'ety-n5-position-nouns', updated_at = now() WHERE id = 'ety-n5-toki-doki-place';
UPDATE etymology_entries SET id = 'ety-n3-gatai', updated_at = now() WHERE id = 'ety-n3-nikui-gatai';
UPDATE etymology_entries SET id = 'ety-n2-wo-mono-tomo-sezu', updated_at = now() WHERE id = 'ety-n2-wo-kiniseze';
UPDATE etymology_entries SET id = 'ety-n1-nara-de-wa', updated_at = now() WHERE id = 'ety-n1-to-wa-ie-mono-no';

-- Rebuilt by the same rule as seed 144: tier-1 source by aspect, Wiktionary second.
INSERT INTO etymology_sources (etymology_id, source_id, locator, quote, supports, sort_index)
SELECT e.id,
       CASE WHEN e.aspect = 'word-origin' THEN 'src-nikkoku' ELSE 'src-frellesvig' END,
       g.title, NULL, 'supports', 0
FROM etymology_entries e JOIN grammar_points g ON g.id = e.grammar_point_id
WHERE e.id IN ('ety-n5-position-nouns', 'ety-n3-gatai', 'ety-n2-wo-mono-tomo-sezu', 'ety-n1-nara-de-wa')
ON CONFLICT DO NOTHING;

INSERT INTO etymology_sources (etymology_id, source_id, locator, quote, supports, sort_index)
SELECT e.id, 'src-wiktionary', g.title, NULL, 'supports', 1
FROM etymology_entries e JOIN grammar_points g ON g.id = e.grammar_point_id
WHERE e.id IN ('ety-n5-position-nouns', 'ety-n3-gatai', 'ety-n2-wo-mono-tomo-sezu', 'ety-n1-nara-de-wa')
ON CONFLICT DO NOTHING;

UPDATE etymology_entries e
SET source_count = (SELECT count(*) FROM etymology_sources s WHERE s.etymology_id = e.id)
WHERE e.id IN ('ety-n5-position-nouns', 'ety-n3-gatai', 'ety-n2-wo-mono-tomo-sezu', 'ety-n1-nara-de-wa');

-- And the review-queue rows that point at them.
UPDATE content_review_queue SET id = 'rq-ety-n5-position-nouns', target_id = 'ety-n5-position-nouns', updated_at = now() WHERE target_id = 'ety-n5-toki-doki-place';
UPDATE content_review_queue SET id = 'rq-ety-n3-gatai', target_id = 'ety-n3-gatai', updated_at = now() WHERE target_id = 'ety-n3-nikui-gatai';
UPDATE content_review_queue SET id = 'rq-ety-n2-wo-mono-tomo-sezu', target_id = 'ety-n2-wo-mono-tomo-sezu', updated_at = now() WHERE target_id = 'ety-n2-wo-kiniseze';
UPDATE content_review_queue SET id = 'rq-ety-n1-nara-de-wa', target_id = 'ety-n1-nara-de-wa', updated_at = now() WHERE target_id = 'ety-n1-to-wa-ie-mono-no';
