-- Grammar prose furigana, precomputed. The grammar pages annotated their
-- explanations from the dictionary on every request, against the rule that
-- furigana is computed at import. Readings now ship as a generated seed
-- (seed:grammar-furigana), keyed by the text's sha256 so an edit can never
-- inherit a stale reading.
CREATE TABLE "content"."grammar_furigana" (
	"text_hash" text PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"segments" jsonb NOT NULL,
	"source" text DEFAULT 'annotator' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
