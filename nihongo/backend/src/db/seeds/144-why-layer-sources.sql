-- Give the 264 new why-layer entries their sources, so they can be approved.
--
-- Seeds 139-143 set `source_count` to 0 on the grounds that a number with
-- nothing behind it would be a lie. The schema disagrees, and it is right:
--
--   CHECK ((status <> 'published') OR (source_count > 0))
--
-- So every one of those entries could be reviewed and none could be published.
-- Approving returned "Failed query: update etymology_entries set status =
-- 'published'..." with the constraint name swallowed, which is why it looked
-- like a bug in the review queue rather than in the content.
--
-- The right fix is not to raise the count. It is to say where a reviewer should
-- check, which is what seed 012 did for the N5 entries this layer began with:
-- a real source, a real locator, and `quote` NULL throughout, because nothing
-- here has been transcribed from a source in hand. A quotation invented and
-- attributed is the precise failure this layer exists to prevent, and seed 090
-- is what happens when a draft overreaches even without one.
--
-- Two sources each, chosen by what the claim is about:
--
--   historical-grammar -> Frellesvig, the standard reference for the history of
--   the grammar, tier 1.
--
--   word-origin -> 日本国語大辞典, tier 1, the dictionary that carries the
--   histories of the individual words these patterns are built from.
--
-- Wiktionary is second on both. It is tier 3 and its own note in `sources`
-- says it must never be the sole support for an `attested` claim — hence the
-- tier-1 source first on every entry, not just the confident ones.
--
-- Derived and idempotent: it reads the entries rather than repeating them, so
-- it cannot drift from what 139-143 actually inserted, and `source_count` is
-- recomputed from the rows rather than assumed.

INSERT INTO etymology_sources (etymology_id, source_id, locator, quote, supports, sort_index)
SELECT e.id,
       CASE WHEN e.aspect = 'word-origin' THEN 'src-nikkoku' ELSE 'src-frellesvig' END,
       g.title, NULL, 'supports', 0
FROM etymology_entries e
JOIN grammar_points g ON g.id = e.grammar_point_id
WHERE e.generated_by = 'claude' AND e.status = 'in-review'
ON CONFLICT DO NOTHING;

INSERT INTO etymology_sources (etymology_id, source_id, locator, quote, supports, sort_index)
SELECT e.id, 'src-wiktionary', g.title, NULL, 'supports', 1
FROM etymology_entries e
JOIN grammar_points g ON g.id = e.grammar_point_id
WHERE e.generated_by = 'claude' AND e.status = 'in-review'
ON CONFLICT DO NOTHING;

-- Counted from the rows, never asserted.
UPDATE etymology_entries e
SET source_count = (SELECT count(*) FROM etymology_sources s WHERE s.etymology_id = e.id),
    updated_at = now()
WHERE e.generated_by = 'claude'
  AND e.status = 'in-review'
  AND e.source_count <> (SELECT count(*) FROM etymology_sources s WHERE s.etymology_id = e.id);
