CREATE TABLE "dialogue_replies" (
	"id" text PRIMARY KEY NOT NULL,
	"turn_id" text NOT NULL,
	"text" text NOT NULL,
	"reading_kana" text NOT NULL,
	"furigana" jsonb,
	"translation" text,
	"is_correct" boolean DEFAULT false NOT NULL,
	"why_wrong" text,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dialogue_replies_wrong_needs_reason" CHECK ("dialogue_replies"."is_correct" or "dialogue_replies"."why_wrong" is not null)
);
--> statement-breakpoint
CREATE TABLE "dialogue_turns" (
	"id" text PRIMARY KEY NOT NULL,
	"dialogue_id" text NOT NULL,
	"index" integer NOT NULL,
	"speaker" text NOT NULL,
	"text" text NOT NULL,
	"reading_kana" text NOT NULL,
	"furigana" jsonb,
	"translation" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dialogues" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"level_id" text,
	"unit_id" text,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"situation" text NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "study_items" DROP CONSTRAINT "study_items_exactly_one_target";--> statement-breakpoint
ALTER TABLE "study_items" ADD COLUMN "dialogue_id" text;--> statement-breakpoint
ALTER TABLE "dialogue_replies" ADD CONSTRAINT "dialogue_replies_turn_id_dialogue_turns_id_fk" FOREIGN KEY ("turn_id") REFERENCES "public"."dialogue_turns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dialogue_turns" ADD CONSTRAINT "dialogue_turns_dialogue_id_dialogues_id_fk" FOREIGN KEY ("dialogue_id") REFERENCES "public"."dialogues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dialogues" ADD CONSTRAINT "dialogues_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dialogues" ADD CONSTRAINT "dialogues_level_id_language_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."language_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dialogues" ADD CONSTRAINT "dialogues_unit_id_curriculum_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."curriculum_units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dialogue_replies_turn_idx" ON "dialogue_replies" USING btree ("turn_id","sort_index");--> statement-breakpoint
CREATE UNIQUE INDEX "dialogue_turns_order_unique" ON "dialogue_turns" USING btree ("dialogue_id","index");--> statement-breakpoint
CREATE INDEX "dialogue_turns_dialogue_idx" ON "dialogue_turns" USING btree ("dialogue_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dialogues_code_unique" ON "dialogues" USING btree ("language_id","code");--> statement-breakpoint
CREATE INDEX "dialogues_level_idx" ON "dialogues" USING btree ("language_id","level_id","sort_index");--> statement-breakpoint
ALTER TABLE "study_items" ADD CONSTRAINT "study_items_dialogue_id_dialogues_id_fk" FOREIGN KEY ("dialogue_id") REFERENCES "public"."dialogues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "study_items_dialogue_unique" ON "study_items" USING btree ("dialogue_id") WHERE "study_items"."dialogue_id" is not null;--> statement-breakpoint
ALTER TABLE "study_items" ADD CONSTRAINT "study_items_exactly_one_target" CHECK (num_nonnulls("study_items"."kana_id", "study_items"."kanji_id", "study_items"."word_id", "study_items"."grammar_point_id", "study_items"."sentence_id", "study_items"."phonetic_series_id", "study_items"."dialogue_id") = 1);