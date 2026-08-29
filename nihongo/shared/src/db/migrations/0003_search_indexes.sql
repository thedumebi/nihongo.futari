-- Dictionary search.
--
-- Postgres has no Japanese parser, and a `simple` tsvector over unsegmented
-- Japanese produces one enormous token per string — useless. So Japanese text
-- is matched with pg_trgm (substring and similarity), and only the English
-- glosses go through a real text-search configuration.
--
-- At 8,000 words these indexes are not needed for speed; a sequential scan is
-- already milliseconds. They are here for RANKING: `similarity()` is what lets
-- a near-miss reading surface above an unrelated exact substring.
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint

-- Japanese surface and reading. gin_trgm_ops supports both LIKE '%x%' and
-- similarity ordering from the same index.
CREATE INDEX IF NOT EXISTS "words_form_trgm" ON "words" USING gin ("primary_form" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "words_reading_trgm" ON "words" USING gin ("primary_reading" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kanji_character_trgm" ON "kanji" USING gin ("character" gin_trgm_ops);--> statement-breakpoint

-- English glosses live in a jsonb array on word_senses. Indexing the extracted
-- text directly avoids a denormalised column that the importer would have to
-- keep in step.
CREATE INDEX IF NOT EXISTS "word_senses_gloss_trgm"
  ON "word_senses" USING gin ((glosses::text) gin_trgm_ops);--> statement-breakpoint

-- Grammar points are few, but searching them from the same box is what makes
-- one dictionary rather than three.
CREATE INDEX IF NOT EXISTS "grammar_points_title_trgm" ON "grammar_points" USING gin ("title" gin_trgm_ops);
