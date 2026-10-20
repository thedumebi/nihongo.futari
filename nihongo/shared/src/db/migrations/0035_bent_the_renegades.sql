-- The Particles game: authored questions on published sentences, one set per
-- particle lesson, published only by approving its review-queue row.
CREATE TABLE "particle_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"set_id" text NOT NULL,
	"sentence_id" text NOT NULL,
	"blank_start" integer NOT NULL,
	"blank_end" integer NOT NULL,
	"answer" text NOT NULL,
	"also_right" text[] DEFAULT '{}' NOT NULL,
	"wrong" text[] NOT NULL,
	"note" text NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "particle_questions_gap_valid" CHECK ("particle_questions"."blank_end" > "particle_questions"."blank_start" and "particle_questions"."blank_start" >= 0),
	CONSTRAINT "particle_questions_three_wrong" CHECK (cardinality("particle_questions"."wrong") = 3)
);
--> statement-breakpoint
CREATE TABLE "particle_sets" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"grammar_point_id" text NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"source_id" text,
	"source_ref" text,
	"source_hash" text,
	"human_edited" boolean DEFAULT false NOT NULL,
	"locked_fields" text[] DEFAULT '{}' NOT NULL,
	"upstream_removed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "particle_questions" ADD CONSTRAINT "particle_questions_set_id_particle_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."particle_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "particle_questions" ADD CONSTRAINT "particle_questions_sentence_id_sentences_id_fk" FOREIGN KEY ("sentence_id") REFERENCES "public"."sentences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "particle_sets" ADD CONSTRAINT "particle_sets_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "particle_sets" ADD CONSTRAINT "particle_sets_grammar_point_id_grammar_points_id_fk" FOREIGN KEY ("grammar_point_id") REFERENCES "public"."grammar_points"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "particle_sets" ADD CONSTRAINT "particle_sets_source_id_import_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "particle_questions_gap_unique" ON "particle_questions" USING btree ("set_id","sentence_id","blank_start");--> statement-breakpoint
CREATE INDEX "particle_questions_set_idx" ON "particle_questions" USING btree ("set_id","sort_index");--> statement-breakpoint
CREATE UNIQUE INDEX "particle_sets_point_unique" ON "particle_sets" USING btree ("grammar_point_id");