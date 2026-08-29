-- Generalise kanji_strokes -> character_strokes.
--
-- Handwriting practice needs kana as much as kanji — hiragana is where it
-- starts — so stroke data now belongs to EXACTLY ONE of a kanji or a kana via
-- the same exclusive-arc pattern used by study_items.
--
-- Written by hand rather than taken from drizzle-kit's diff on purpose: the
-- generated version drops and recreates the table, which would discard the
-- 2,143 kanji of KanjiVG data already imported. This renames in place.
ALTER TABLE "kanji_strokes" RENAME TO "character_strokes";--> statement-breakpoint

-- RENAME TABLE leaves constraint and index names behind; rename them too so the
-- database matches the snapshot and future diffs stay clean.
ALTER TABLE "character_strokes" RENAME CONSTRAINT "kanji_strokes_kanji_id_kanji_id_fk" TO "character_strokes_kanji_id_kanji_id_fk";--> statement-breakpoint
DROP INDEX IF EXISTS "kanji_strokes_unique";--> statement-breakpoint
ALTER INDEX "kanji_strokes_pkey" RENAME TO "character_strokes_pkey";--> statement-breakpoint

ALTER TABLE "character_strokes" ALTER COLUMN "kanji_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "character_strokes" ADD COLUMN "kana_id" text;--> statement-breakpoint
ALTER TABLE "character_strokes" ADD CONSTRAINT "character_strokes_kana_id_kana_id_fk" FOREIGN KEY ("kana_id") REFERENCES "public"."kana"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- One partial unique index per arm. A plain composite over both owner columns
-- would enforce nothing on either, because NULLs never collide in a unique index.
CREATE UNIQUE INDEX "character_strokes_kanji_unique" ON "character_strokes" USING btree ("kanji_id","stroke_index") WHERE "character_strokes"."kanji_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "character_strokes_kana_unique" ON "character_strokes" USING btree ("kana_id","stroke_index") WHERE "character_strokes"."kana_id" is not null;--> statement-breakpoint

-- Existing rows all have kanji_id set, so the arc holds before it is enforced.
ALTER TABLE "character_strokes" ADD CONSTRAINT "character_strokes_exactly_one_owner" CHECK (num_nonnulls("character_strokes"."kanji_id", "character_strokes"."kana_id") = 1);
