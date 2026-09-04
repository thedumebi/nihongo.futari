-- Give every linked token its part of speech.
--
-- `sentence_tokens.pos` was empty on all 10,962 rows. The column has been there
-- since the first migration; the Tatoeba importer never filled it, and the
-- authored tokeniser did not either — `glossLine` knows the part of speech,
-- because it is what the popover prints, and it was simply not carried through.
--
-- Everything downstream that wants real grammar has been working around the
-- gap. The particle-reading rule keys on a token BEING は or を rather than on
-- it being a particle; better distractors and conjugation drills built from
-- sentences were listed as blocked on it outright.
--
-- Derived rather than authored: the word is already linked, and the word's
-- first sense already carries JMdict's codes. Storing the codes rather than a
-- friendly label keeps what downstream needs — v5r means godan, vi means
-- intransitive, and both matter to a drill that a rendered "godan verb" throws
-- away.
--
-- A token with no `word_id` — a particle the dictionary does not hold, a
-- fragment — keeps its empty pos. Guessing one would be worse than the gap.
--
-- Touches `pos` on sentence_tokens and nothing else. Safe to re-run: it only
-- writes where the value would change.
UPDATE sentence_tokens st
SET pos = src.codes
FROM (
  SELECT w.id AS word_id, array_to_string(s.pos, ',') AS codes
  FROM words w
  JOIN LATERAL (
    SELECT ws.pos FROM word_senses ws
    WHERE ws.word_id = w.id AND ws.pos IS NOT NULL AND cardinality(ws.pos) > 0
    ORDER BY ws.sort_index
    LIMIT 1
  ) s ON true
) src
WHERE st.word_id = src.word_id
  AND src.codes <> ''
  AND st.pos IS DISTINCT FROM src.codes;
