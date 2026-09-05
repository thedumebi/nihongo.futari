-- One vocabulary for confidence and period, now that all 355 are visible.
--
-- Three entries carried confidence 'probable', a word used nowhere else and
-- absent from the enrichment vocabulary in shared/src/types/enrichment.ts,
-- which allows well-supported, attested, disputed, folk and unknown. It does
-- not break the API — grammar.service selects the column raw and that schema
-- governs pipeline input rather than the response — but it shows a reader a
-- third register beside the 295 well-supported and 57 attested.
--
--   ety-deshou goes to well-supported: the N4 verification settled it. でしょう
--   is です + う (でせう), and だろう is である + う, which is the correction
--   that pass forced into this very entry.
--
--   ety-desu and ety-masu go to attested. Both derivations — です from a longer
--   copula on にてあり, ます from まゐらす — are the standard accounts and both
--   are argued over, which is exactly what attested is for.
--
-- Period had the same drift in miniature: 'Edo period' beside 73 'Edo', and
-- 'modern' beside 10 'Modern'. Kamakura is left alone — it is a real period
-- name that simply had not come up in the new batches.

UPDATE etymology_entries SET confidence = 'well-supported', updated_at = now()
WHERE id = 'ety-deshou' AND confidence = 'probable';

UPDATE etymology_entries SET confidence = 'attested', updated_at = now()
WHERE id IN ('ety-desu', 'ety-masu') AND confidence = 'probable';

UPDATE etymology_entries SET period = 'Edo', updated_at = now() WHERE period = 'Edo period';
UPDATE etymology_entries SET period = 'Modern', updated_at = now() WHERE period = 'modern';
