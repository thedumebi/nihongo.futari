CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" text,
	"role" text DEFAULT 'user' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"locale" text DEFAULT 'en' NOT NULL,
	"active_language_id" text,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "etymology_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"kanji_id" text,
	"word_id" text,
	"grammar_point_id" text,
	"phonetic_series_id" text,
	"radical_id" text,
	"aspect" text NOT NULL,
	"claim" text NOT NULL,
	"body" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"period" text,
	"confidence" text DEFAULT 'unknown' NOT NULL,
	"is_disputed" boolean DEFAULT false NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"competing_group_id" text,
	"supersedes_id" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"generated_by" text DEFAULT 'human' NOT NULL,
	"source_count" integer DEFAULT 0 NOT NULL,
	"model" text,
	"prompt_version" text,
	"enrichment_run_id" text,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"review_notes" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "etymology_exactly_one_target" CHECK (num_nonnulls("etymology_entries"."kanji_id", "etymology_entries"."word_id", "etymology_entries"."grammar_point_id", "etymology_entries"."phonetic_series_id", "etymology_entries"."radical_id") = 1),
	CONSTRAINT "etymology_publish_needs_source" CHECK ("etymology_entries"."status" <> 'published' or "etymology_entries"."source_count" > 0),
	CONSTRAINT "etymology_publish_needs_reviewer" CHECK ("etymology_entries"."status" <> 'published' or "etymology_entries"."reviewed_by" is not null)
);
--> statement-breakpoint
CREATE TABLE "etymology_sources" (
	"etymology_id" text NOT NULL,
	"source_id" text NOT NULL,
	"locator" text DEFAULT '' NOT NULL,
	"quote" text,
	"supports" text DEFAULT 'supports' NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "etymology_sources_etymology_id_source_id_locator_pk" PRIMARY KEY("etymology_id","source_id","locator")
);
--> statement-breakpoint
CREATE TABLE "mnemonics" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"kanji_id" text,
	"word_id" text,
	"grammar_point_id" text,
	"text" text NOT NULL,
	"imagery" text,
	"kind" text DEFAULT 'story' NOT NULL,
	"components_used" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"author_user_id" text,
	"visibility" text DEFAULT 'system' NOT NULL,
	"is_official" boolean DEFAULT false NOT NULL,
	"generated_by" text DEFAULT 'human' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mnemonics_exactly_one_target" CHECK (num_nonnulls("mnemonics"."kanji_id", "mnemonics"."word_id", "mnemonics"."grammar_point_id") = 1)
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"abbreviation" text,
	"authors" text[] DEFAULT '{}' NOT NULL,
	"publisher" text,
	"year" integer,
	"isbn" text,
	"url" text,
	"accessed_at" timestamp,
	"license" text,
	"citation" text,
	"reliability_tier" smallint DEFAULT 3 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sources_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "exercise_prompts" (
	"id" text PRIMARY KEY NOT NULL,
	"facet_id" text NOT NULL,
	"template_id" text NOT NULL,
	"language_id" text NOT NULL,
	"prompt" jsonb NOT NULL,
	"answer" jsonb NOT NULL,
	"distractors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"assets" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"content_hash" text,
	"version" integer DEFAULT 1 NOT NULL,
	"generated_by" text DEFAULT 'system' NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"language_id" text,
	"name" text NOT NULL,
	"applies_to_kinds" text[] DEFAULT '{}' NOT NULL,
	"applies_to_facets" text[] DEFAULT '{}' NOT NULL,
	"input_mode" text NOT NULL,
	"grader_code" text NOT NULL,
	"requires" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"first_exposure_only" boolean DEFAULT false NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kind_facet_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"kind" text NOT NULL,
	"facet" text NOT NULL,
	"template_id" text NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"min_state" smallint,
	"max_reps" integer,
	"first_exposure_only" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_item_facet_templates" (
	"facet_id" text NOT NULL,
	"template_id" text NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grammar_formations" (
	"id" text PRIMARY KEY NOT NULL,
	"grammar_point_id" text NOT NULL,
	"attaches_to" text NOT NULL,
	"rule_template" text NOT NULL,
	"example" text,
	"notes" text,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grammar_mistakes" (
	"id" text PRIMARY KEY NOT NULL,
	"grammar_point_id" text NOT NULL,
	"wrong" text NOT NULL,
	"right" text NOT NULL,
	"why_wrong" text NOT NULL,
	"explanation" text,
	"reviewed_by" text,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grammar_relations" (
	"from_id" text NOT NULL,
	"to_id" text NOT NULL,
	"kind" text NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "grammar_relations_from_id_to_id_kind_pk" PRIMARY KEY("from_id","to_id","kind")
);
--> statement-breakpoint
CREATE TABLE "grammar_points" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"pattern" text NOT NULL,
	"level_id" text,
	"category" text,
	"register" text,
	"meaning_short" text NOT NULL,
	"meaning_long" text,
	"nuance" text,
	"frequency_rank" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grammar_variants" (
	"id" text PRIMARY KEY NOT NULL,
	"grammar_point_id" text NOT NULL,
	"form" text NOT NULL,
	"register" text,
	"notes" text,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kana" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"script" text NOT NULL,
	"character" text NOT NULL,
	"romaji" text NOT NULL,
	"row" text NOT NULL,
	"column" text NOT NULL,
	"variant" text DEFAULT 'base' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kanji" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"character" text NOT NULL,
	"codepoint" integer,
	"stroke_count" integer,
	"grade" integer,
	"jouyou" boolean DEFAULT false NOT NULL,
	"level_id" text,
	"frequency_rank" integer,
	"meanings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"kanjivg_svg" text,
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
CREATE TABLE "kanji_components" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_kanji_id" text NOT NULL,
	"component_radical_id" text,
	"component_kanji_id" text,
	"role" text NOT NULL,
	"position" text,
	"ids_expression" text,
	"source" text NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kanji_components_exactly_one" CHECK (num_nonnulls("kanji_components"."component_radical_id", "kanji_components"."component_kanji_id") = 1)
);
--> statement-breakpoint
CREATE TABLE "kanji_confusables" (
	"id" text PRIMARY KEY NOT NULL,
	"kanji_id" text NOT NULL,
	"confusable_id" text NOT NULL,
	"reason" text NOT NULL,
	"score" numeric(4, 3),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kanji_readings" (
	"id" text PRIMARY KEY NOT NULL,
	"kanji_id" text NOT NULL,
	"type" text NOT NULL,
	"reading" text NOT NULL,
	"okurigana" text,
	"is_common" boolean DEFAULT false NOT NULL,
	"is_jouyou" boolean DEFAULT false NOT NULL,
	"phonetic_series_id" text,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kanji_strokes" (
	"id" text PRIMARY KEY NOT NULL,
	"kanji_id" text NOT NULL,
	"stroke_index" integer NOT NULL,
	"path" text NOT NULL,
	"start_x" numeric(8, 3),
	"start_y" numeric(8, 3),
	"end_x" numeric(8, 3),
	"end_y" numeric(8, 3),
	"direction_deg" numeric(6, 2),
	"kvg_type" text,
	"kvg_element" text,
	"kvg_radical" text,
	"kvg_part" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phonetic_series" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"component_character" text NOT NULL,
	"component_kanji_id" text,
	"primary_reading" text NOT NULL,
	"alternate_readings" text[] DEFAULT '{}' NOT NULL,
	"member_count" integer DEFAULT 0 NOT NULL,
	"reliability" numeric(4, 3),
	"notes" text,
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
CREATE TABLE "phonetic_series_members" (
	"id" text PRIMARY KEY NOT NULL,
	"series_id" text NOT NULL,
	"kanji_id" text NOT NULL,
	"reading" text NOT NULL,
	"follows_series" boolean DEFAULT true NOT NULL,
	"exception_note" text,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "radicals" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"character" text,
	"codepoint" integer,
	"kangxi_number" integer,
	"name_ja" text,
	"name_en" text,
	"meaning" text,
	"stroke_count" integer,
	"variants" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"kvg_element" text,
	"notes" text,
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
CREATE TABLE "language_features" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"key" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "language_levels" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"rank" integer NOT NULL,
	"description" text,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"native_name" text NOT NULL,
	"script_direction" text DEFAULT 'ltr' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "languages_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "content_audio" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"kana_id" text,
	"word_id" text,
	"sentence_id" text,
	"role" text DEFAULT 'primary' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "content_audio_exactly_one_target" CHECK (num_nonnulls("content_audio"."kana_id", "content_audio"."word_id", "content_audio"."sentence_id") = 1)
);
--> statement-breakpoint
CREATE TABLE "handwriting_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kanji_id" text NOT NULL,
	"card_id" text,
	"log_id" text,
	"score" numeric(4, 3),
	"per_stroke" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"stroke_count_given" integer,
	"strokes" jsonb,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"kind" text NOT NULL,
	"storage_key" text NOT NULL,
	"url" text,
	"mime" text,
	"duration_ms" integer,
	"bytes" integer,
	"voice" text,
	"provider" text,
	"text_hash" text,
	"license" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"channel" text NOT NULL,
	"kind" text NOT NULL,
	"dedupe_key" text NOT NULL,
	"status" text DEFAULT 'sent' NOT NULL,
	"error" text,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text,
	"device_id" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"last_success_at" timestamp,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "content_review_queue" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text,
	"target_table" text NOT NULL,
	"target_id" text NOT NULL,
	"change_type" text DEFAULT 'update' NOT NULL,
	"proposed" jsonb NOT NULL,
	"current" jsonb,
	"diff" jsonb,
	"origin" text NOT NULL,
	"enrichment_item_id" text,
	"import_run_id" text,
	"priority" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"claimed_by" text,
	"claimed_at" timestamp,
	"reviewer_id" text,
	"reviewed_at" timestamp,
	"reviewer_notes" text,
	"applied_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrichment_items" (
	"id" text PRIMARY KEY NOT NULL,
	"run_id" text NOT NULL,
	"target_table" text NOT NULL,
	"target_id" text NOT NULL,
	"input_context" jsonb NOT NULL,
	"output" jsonb,
	"output_hash" text,
	"validation" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrichment_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"language_id" text,
	"model" text NOT NULL,
	"prompt_version" text NOT NULL,
	"prompt_hash" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"cost_usd" numeric(10, 4),
	"batch_id" text,
	"triggered_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_conflicts" (
	"id" text PRIMARY KEY NOT NULL,
	"run_id" text NOT NULL,
	"target_table" text NOT NULL,
	"target_id" text NOT NULL,
	"field" text NOT NULL,
	"current_value" jsonb,
	"incoming_value" jsonb,
	"resolution" text DEFAULT 'pending' NOT NULL,
	"resolved_by" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_records" (
	"id" text PRIMARY KEY NOT NULL,
	"run_id" text NOT NULL,
	"source_id" text NOT NULL,
	"source_ref" text NOT NULL,
	"target_table" text NOT NULL,
	"target_id" text,
	"content_hash" text,
	"action" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"language_id" text,
	"status" text DEFAULT 'running' NOT NULL,
	"dataset_version" text,
	"dataset_checksum" text,
	"rows_read" integer DEFAULT 0 NOT NULL,
	"rows_inserted" integer DEFAULT 0 NOT NULL,
	"rows_updated" integer DEFAULT 0 NOT NULL,
	"rows_skipped" integer DEFAULT 0 NOT NULL,
	"rows_conflicted" integer DEFAULT 0 NOT NULL,
	"log" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"error" text,
	"triggered_by" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"url" text,
	"homepage" text,
	"license" text NOT NULL,
	"attribution_text" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "import_sources_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sentence_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"sentence_id" text NOT NULL,
	"index" integer NOT NULL,
	"surface" text NOT NULL,
	"reading" text,
	"lemma" text,
	"word_id" text,
	"pos" text,
	"char_start" integer NOT NULL,
	"char_end" integer NOT NULL,
	"furigana" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"alignment_confidence" numeric(4, 3),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sentence_translations" (
	"id" text PRIMARY KEY NOT NULL,
	"sentence_id" text NOT NULL,
	"lang" text NOT NULL,
	"text" text NOT NULL,
	"source" text,
	"license" text,
	"attribution" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sentences" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"text" text NOT NULL,
	"reading_kana" text,
	"level_id" text,
	"difficulty" numeric(5, 3),
	"source" text NOT NULL,
	"source_ref_external" text,
	"license" text,
	"attribution" text,
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
CREATE TABLE "review_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"language_id" text NOT NULL,
	"mode" text DEFAULT 'due' NOT NULL,
	"planned_count" integer DEFAULT 0 NOT NULL,
	"completed_count" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"source" text DEFAULT 'online' NOT NULL,
	"device_id" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "srs_cards" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"facet_id" text NOT NULL,
	"language_id" text NOT NULL,
	"due" timestamp with time zone DEFAULT now() NOT NULL,
	"stability" double precision DEFAULT 0 NOT NULL,
	"difficulty" double precision DEFAULT 0 NOT NULL,
	"elapsed_days" integer DEFAULT 0 NOT NULL,
	"scheduled_days" integer DEFAULT 0 NOT NULL,
	"learning_steps" integer DEFAULT 0 NOT NULL,
	"reps" integer DEFAULT 0 NOT NULL,
	"lapses" integer DEFAULT 0 NOT NULL,
	"state" smallint DEFAULT 0 NOT NULL,
	"last_review" timestamp with time zone,
	"suspended" boolean DEFAULT false NOT NULL,
	"buried_until" timestamp with time zone,
	"ghost" boolean DEFAULT false NOT NULL,
	"ghost_since" timestamp,
	"ghost_reason" text,
	"ghost_lapse_streak" integer DEFAULT 0 NOT NULL,
	"consecutive_correct" integer DEFAULT 0 NOT NULL,
	"total_correct" integer DEFAULT 0 NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"first_seen_at" timestamp,
	"last_correct_at" timestamp,
	"last_applied_log_id" text,
	"history_version" integer DEFAULT 0 NOT NULL,
	"replay_generation" integer DEFAULT 0 NOT NULL,
	"replay_truncated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "srs_daily_stats" (
	"user_id" text NOT NULL,
	"language_id" text NOT NULL,
	"local_date" date NOT NULL,
	"timezone" text NOT NULL,
	"new_count" integer DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"lapse_count" integer DEFAULT 0 NOT NULL,
	"time_ms" integer DEFAULT 0 NOT NULL,
	"xp_earned" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "srs_daily_stats_user_id_language_id_local_date_pk" PRIMARY KEY("user_id","language_id","local_date")
);
--> statement-breakpoint
CREATE TABLE "srs_ghost_events" (
	"id" text PRIMARY KEY NOT NULL,
	"card_id" text NOT NULL,
	"user_id" text NOT NULL,
	"event" text NOT NULL,
	"lapses_at_event" integer,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "srs_review_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"card_id" text NOT NULL,
	"facet_id" text NOT NULL,
	"study_item_id" text,
	"language_id" text NOT NULL,
	"session_id" text,
	"rating" smallint NOT NULL,
	"reviewed_at" timestamp with time zone NOT NULL,
	"client_reviewed_at" timestamp with time zone,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"client_id" text,
	"client_seq" bigint,
	"offline" boolean DEFAULT false NOT NULL,
	"clock_adjusted" boolean DEFAULT false NOT NULL,
	"duration_ms" integer,
	"exercise_template_id" text,
	"exercise_prompt_id" text,
	"answer_given" text,
	"is_correct" boolean,
	"hints_used" integer DEFAULT 0 NOT NULL,
	"state_before" smallint,
	"stability_before" double precision,
	"difficulty_before" double precision,
	"due_before" timestamp with time zone,
	"elapsed_days" integer,
	"last_elapsed_days" integer,
	"scheduled_days" integer,
	"state_after" smallint,
	"stability_after" double precision,
	"difficulty_after" double precision,
	"due_after" timestamp with time zone,
	"applied" boolean DEFAULT true NOT NULL,
	"superseded" boolean DEFAULT false NOT NULL,
	"replay_generation" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curriculum_unit_items" (
	"unit_id" text NOT NULL,
	"study_item_id" text NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "curriculum_unit_items_unit_id_study_item_id_pk" PRIMARY KEY("unit_id","study_item_id")
);
--> statement-breakpoint
CREATE TABLE "curriculum_units" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"level_id" text,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"published" boolean DEFAULT false NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_item_facets" (
	"id" text PRIMARY KEY NOT NULL,
	"study_item_id" text NOT NULL,
	"facet" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"intro_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_item_prerequisites" (
	"item_id" text NOT NULL,
	"requires_item_id" text NOT NULL,
	"kind" text DEFAULT 'soft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "study_item_prerequisites_item_id_requires_item_id_pk" PRIMARY KEY("item_id","requires_item_id")
);
--> statement-breakpoint
CREATE TABLE "study_items" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"kind" text NOT NULL,
	"kana_id" text,
	"kanji_id" text,
	"word_id" text,
	"grammar_point_id" text,
	"sentence_id" text,
	"phonetic_series_id" text,
	"level_id" text,
	"frequency_rank" integer,
	"difficulty_hint" double precision,
	"published" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "study_items_exactly_one_target" CHECK (num_nonnulls("study_items"."kana_id", "study_items"."kanji_id", "study_items"."word_id", "study_items"."grammar_point_id", "study_items"."sentence_id", "study_items"."phonetic_series_id") = 1)
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"language_id" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text,
	"category" text,
	"threshold_kind" text NOT NULL,
	"threshold" integer NOT NULL,
	"secret" boolean DEFAULT false NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "achievements_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "level_readiness_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"language_id" text NOT NULL,
	"level_id" text NOT NULL,
	"computed_at" timestamp DEFAULT now() NOT NULL,
	"coverage" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"estimated_score" numeric(5, 2),
	"confidence" numeric(4, 3),
	"ready" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streak_freezes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"used_on_date" date,
	"reason" text DEFAULT 'earned' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"user_id" text NOT NULL,
	"achievement_id" text NOT NULL,
	"unlocked_at" timestamp,
	"progress" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_achievements_user_id_achievement_id_pk" PRIMARY KEY("user_id","achievement_id")
);
--> statement-breakpoint
CREATE TABLE "user_known_kanji" (
	"user_id" text NOT NULL,
	"kanji_id" text NOT NULL,
	"language_id" text NOT NULL,
	"known_at" timestamp DEFAULT now() NOT NULL,
	"source" text DEFAULT 'srs' NOT NULL,
	"strength" numeric(6, 3),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_known_kanji_user_id_kanji_id_pk" PRIMARY KEY("user_id","kanji_id")
);
--> statement-breakpoint
CREATE TABLE "user_languages" (
	"user_id" text NOT NULL,
	"language_id" text NOT NULL,
	"current_level_id" text,
	"target_level_id" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_languages_user_id_language_id_pk" PRIMARY KEY("user_id","language_id")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"daily_new_limit" integer DEFAULT 10 NOT NULL,
	"daily_review_limit" integer DEFAULT 200 NOT NULL,
	"session_length" integer DEFAULT 20 NOT NULL,
	"furigana_mode" text DEFAULT 'unknown-only' NOT NULL,
	"romaji_enabled" boolean DEFAULT false NOT NULL,
	"autoplay_audio" boolean DEFAULT true NOT NULL,
	"audio_speed" numeric(3, 2) DEFAULT '1.00' NOT NULL,
	"theme" text DEFAULT 'system' NOT NULL,
	"day_boundary_hour" integer DEFAULT 4 NOT NULL,
	"reminder_email_enabled" boolean DEFAULT true NOT NULL,
	"reminder_push_enabled" boolean DEFAULT false NOT NULL,
	"reminder_hour" integer DEFAULT 19 NOT NULL,
	"weekly_summary_enabled" boolean DEFAULT true NOT NULL,
	"fsrs_params" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ghost_threshold" integer DEFAULT 4 NOT NULL,
	"ghost_interval_factor" numeric(3, 2) DEFAULT '0.50' NOT NULL,
	"handwriting_tolerance" numeric(3, 2) DEFAULT '0.50' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_streaks" (
	"user_id" text NOT NULL,
	"language_id" text NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_active_date" date,
	"timezone_at_last_active" text,
	"freeze_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_streaks_user_id_language_id_pk" PRIMARY KEY("user_id","language_id")
);
--> statement-breakpoint
CREATE TABLE "user_xp" (
	"user_id" text NOT NULL,
	"language_id" text NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_xp_user_id_language_id_pk" PRIMARY KEY("user_id","language_id")
);
--> statement-breakpoint
CREATE TABLE "xp_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"language_id" text NOT NULL,
	"source" text NOT NULL,
	"ref_id" text NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "word_forms" (
	"id" text PRIMARY KEY NOT NULL,
	"word_id" text NOT NULL,
	"form" text NOT NULL,
	"kind" text NOT NULL,
	"is_common" boolean DEFAULT false NOT NULL,
	"is_irregular" boolean DEFAULT false NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "word_kanji" (
	"id" text PRIMARY KEY NOT NULL,
	"word_id" text NOT NULL,
	"kanji_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "word_sense_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"sense_id" text NOT NULL,
	"source_lang" text NOT NULL,
	"source_text" text,
	"is_wasei" boolean DEFAULT false NOT NULL,
	"partial" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "word_senses" (
	"id" text PRIMARY KEY NOT NULL,
	"word_id" text NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"glosses" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"pos" text[] DEFAULT '{}' NOT NULL,
	"fields" text[] DEFAULT '{}' NOT NULL,
	"misc" text[] DEFAULT '{}' NOT NULL,
	"dialect" text[] DEFAULT '{}' NOT NULL,
	"info" text,
	"restricted_to_forms" text[] DEFAULT '{}' NOT NULL,
	"cross_refs" text[] DEFAULT '{}' NOT NULL,
	"antonyms" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "words" (
	"id" text PRIMARY KEY NOT NULL,
	"language_id" text NOT NULL,
	"ent_seq" integer,
	"primary_form" text NOT NULL,
	"primary_reading" text NOT NULL,
	"level_id" text,
	"frequency_rank" integer,
	"is_common" boolean DEFAULT false NOT NULL,
	"pitch_accent" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"word_origin" text,
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
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "etymology_entries" ADD CONSTRAINT "etymology_entries_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "etymology_entries" ADD CONSTRAINT "etymology_entries_kanji_id_kanji_id_fk" FOREIGN KEY ("kanji_id") REFERENCES "public"."kanji"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "etymology_entries" ADD CONSTRAINT "etymology_entries_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "etymology_entries" ADD CONSTRAINT "etymology_entries_grammar_point_id_grammar_points_id_fk" FOREIGN KEY ("grammar_point_id") REFERENCES "public"."grammar_points"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "etymology_entries" ADD CONSTRAINT "etymology_entries_phonetic_series_id_phonetic_series_id_fk" FOREIGN KEY ("phonetic_series_id") REFERENCES "public"."phonetic_series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "etymology_entries" ADD CONSTRAINT "etymology_entries_radical_id_radicals_id_fk" FOREIGN KEY ("radical_id") REFERENCES "public"."radicals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "etymology_entries" ADD CONSTRAINT "etymology_entries_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "etymology_sources" ADD CONSTRAINT "etymology_sources_etymology_id_etymology_entries_id_fk" FOREIGN KEY ("etymology_id") REFERENCES "public"."etymology_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "etymology_sources" ADD CONSTRAINT "etymology_sources_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mnemonics" ADD CONSTRAINT "mnemonics_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mnemonics" ADD CONSTRAINT "mnemonics_kanji_id_kanji_id_fk" FOREIGN KEY ("kanji_id") REFERENCES "public"."kanji"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mnemonics" ADD CONSTRAINT "mnemonics_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mnemonics" ADD CONSTRAINT "mnemonics_grammar_point_id_grammar_points_id_fk" FOREIGN KEY ("grammar_point_id") REFERENCES "public"."grammar_points"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mnemonics" ADD CONSTRAINT "mnemonics_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_prompts" ADD CONSTRAINT "exercise_prompts_facet_id_study_item_facets_id_fk" FOREIGN KEY ("facet_id") REFERENCES "public"."study_item_facets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_prompts" ADD CONSTRAINT "exercise_prompts_template_id_exercise_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."exercise_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_prompts" ADD CONSTRAINT "exercise_prompts_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_templates" ADD CONSTRAINT "exercise_templates_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kind_facet_templates" ADD CONSTRAINT "kind_facet_templates_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kind_facet_templates" ADD CONSTRAINT "kind_facet_templates_template_id_exercise_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."exercise_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_item_facet_templates" ADD CONSTRAINT "study_item_facet_templates_facet_id_study_item_facets_id_fk" FOREIGN KEY ("facet_id") REFERENCES "public"."study_item_facets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_item_facet_templates" ADD CONSTRAINT "study_item_facet_templates_template_id_exercise_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."exercise_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_formations" ADD CONSTRAINT "grammar_formations_grammar_point_id_grammar_points_id_fk" FOREIGN KEY ("grammar_point_id") REFERENCES "public"."grammar_points"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_mistakes" ADD CONSTRAINT "grammar_mistakes_grammar_point_id_grammar_points_id_fk" FOREIGN KEY ("grammar_point_id") REFERENCES "public"."grammar_points"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_mistakes" ADD CONSTRAINT "grammar_mistakes_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_relations" ADD CONSTRAINT "grammar_relations_from_id_grammar_points_id_fk" FOREIGN KEY ("from_id") REFERENCES "public"."grammar_points"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_relations" ADD CONSTRAINT "grammar_relations_to_id_grammar_points_id_fk" FOREIGN KEY ("to_id") REFERENCES "public"."grammar_points"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_points" ADD CONSTRAINT "grammar_points_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_points" ADD CONSTRAINT "grammar_points_level_id_language_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."language_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_points" ADD CONSTRAINT "grammar_points_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_variants" ADD CONSTRAINT "grammar_variants_grammar_point_id_grammar_points_id_fk" FOREIGN KEY ("grammar_point_id") REFERENCES "public"."grammar_points"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kana" ADD CONSTRAINT "kana_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kanji" ADD CONSTRAINT "kanji_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kanji" ADD CONSTRAINT "kanji_level_id_language_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."language_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kanji" ADD CONSTRAINT "kanji_source_id_import_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kanji_components" ADD CONSTRAINT "kanji_components_parent_kanji_id_kanji_id_fk" FOREIGN KEY ("parent_kanji_id") REFERENCES "public"."kanji"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kanji_components" ADD CONSTRAINT "kanji_components_component_radical_id_radicals_id_fk" FOREIGN KEY ("component_radical_id") REFERENCES "public"."radicals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kanji_components" ADD CONSTRAINT "kanji_components_component_kanji_id_kanji_id_fk" FOREIGN KEY ("component_kanji_id") REFERENCES "public"."kanji"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kanji_confusables" ADD CONSTRAINT "kanji_confusables_kanji_id_kanji_id_fk" FOREIGN KEY ("kanji_id") REFERENCES "public"."kanji"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kanji_confusables" ADD CONSTRAINT "kanji_confusables_confusable_id_kanji_id_fk" FOREIGN KEY ("confusable_id") REFERENCES "public"."kanji"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kanji_readings" ADD CONSTRAINT "kanji_readings_kanji_id_kanji_id_fk" FOREIGN KEY ("kanji_id") REFERENCES "public"."kanji"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kanji_readings" ADD CONSTRAINT "kanji_readings_phonetic_series_id_phonetic_series_id_fk" FOREIGN KEY ("phonetic_series_id") REFERENCES "public"."phonetic_series"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kanji_strokes" ADD CONSTRAINT "kanji_strokes_kanji_id_kanji_id_fk" FOREIGN KEY ("kanji_id") REFERENCES "public"."kanji"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phonetic_series" ADD CONSTRAINT "phonetic_series_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phonetic_series" ADD CONSTRAINT "phonetic_series_component_kanji_id_kanji_id_fk" FOREIGN KEY ("component_kanji_id") REFERENCES "public"."kanji"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phonetic_series" ADD CONSTRAINT "phonetic_series_source_id_import_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phonetic_series_members" ADD CONSTRAINT "phonetic_series_members_series_id_phonetic_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."phonetic_series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phonetic_series_members" ADD CONSTRAINT "phonetic_series_members_kanji_id_kanji_id_fk" FOREIGN KEY ("kanji_id") REFERENCES "public"."kanji"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radicals" ADD CONSTRAINT "radicals_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radicals" ADD CONSTRAINT "radicals_source_id_import_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "language_features" ADD CONSTRAINT "language_features_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "language_levels" ADD CONSTRAINT "language_levels_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_audio" ADD CONSTRAINT "content_audio_asset_id_media_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_audio" ADD CONSTRAINT "content_audio_kana_id_kana_id_fk" FOREIGN KEY ("kana_id") REFERENCES "public"."kana"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_audio" ADD CONSTRAINT "content_audio_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_audio" ADD CONSTRAINT "content_audio_sentence_id_sentences_id_fk" FOREIGN KEY ("sentence_id") REFERENCES "public"."sentences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "handwriting_attempts" ADD CONSTRAINT "handwriting_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "handwriting_attempts" ADD CONSTRAINT "handwriting_attempts_kanji_id_kanji_id_fk" FOREIGN KEY ("kanji_id") REFERENCES "public"."kanji"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_log" ADD CONSTRAINT "notification_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_review_queue" ADD CONSTRAINT "content_review_queue_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_review_queue" ADD CONSTRAINT "content_review_queue_enrichment_item_id_enrichment_items_id_fk" FOREIGN KEY ("enrichment_item_id") REFERENCES "public"."enrichment_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_review_queue" ADD CONSTRAINT "content_review_queue_import_run_id_import_runs_id_fk" FOREIGN KEY ("import_run_id") REFERENCES "public"."import_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_review_queue" ADD CONSTRAINT "content_review_queue_claimed_by_users_id_fk" FOREIGN KEY ("claimed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_review_queue" ADD CONSTRAINT "content_review_queue_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrichment_items" ADD CONSTRAINT "enrichment_items_run_id_enrichment_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."enrichment_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrichment_runs" ADD CONSTRAINT "enrichment_runs_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrichment_runs" ADD CONSTRAINT "enrichment_runs_triggered_by_users_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_conflicts" ADD CONSTRAINT "import_conflicts_run_id_import_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."import_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_conflicts" ADD CONSTRAINT "import_conflicts_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_records" ADD CONSTRAINT "import_records_run_id_import_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."import_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_records" ADD CONSTRAINT "import_records_source_id_import_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."import_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_runs" ADD CONSTRAINT "import_runs_source_id_import_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."import_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_runs" ADD CONSTRAINT "import_runs_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_runs" ADD CONSTRAINT "import_runs_triggered_by_users_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sentence_tokens" ADD CONSTRAINT "sentence_tokens_sentence_id_sentences_id_fk" FOREIGN KEY ("sentence_id") REFERENCES "public"."sentences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sentence_tokens" ADD CONSTRAINT "sentence_tokens_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sentence_translations" ADD CONSTRAINT "sentence_translations_sentence_id_sentences_id_fk" FOREIGN KEY ("sentence_id") REFERENCES "public"."sentences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sentences" ADD CONSTRAINT "sentences_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sentences" ADD CONSTRAINT "sentences_level_id_language_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."language_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sentences" ADD CONSTRAINT "sentences_source_id_import_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_sessions" ADD CONSTRAINT "review_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_sessions" ADD CONSTRAINT "review_sessions_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_cards" ADD CONSTRAINT "srs_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_cards" ADD CONSTRAINT "srs_cards_facet_id_study_item_facets_id_fk" FOREIGN KEY ("facet_id") REFERENCES "public"."study_item_facets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_cards" ADD CONSTRAINT "srs_cards_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_daily_stats" ADD CONSTRAINT "srs_daily_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_daily_stats" ADD CONSTRAINT "srs_daily_stats_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_ghost_events" ADD CONSTRAINT "srs_ghost_events_card_id_srs_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."srs_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_ghost_events" ADD CONSTRAINT "srs_ghost_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_review_logs" ADD CONSTRAINT "srs_review_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_review_logs" ADD CONSTRAINT "srs_review_logs_card_id_srs_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."srs_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_review_logs" ADD CONSTRAINT "srs_review_logs_facet_id_study_item_facets_id_fk" FOREIGN KEY ("facet_id") REFERENCES "public"."study_item_facets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_review_logs" ADD CONSTRAINT "srs_review_logs_study_item_id_study_items_id_fk" FOREIGN KEY ("study_item_id") REFERENCES "public"."study_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srs_review_logs" ADD CONSTRAINT "srs_review_logs_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_unit_items" ADD CONSTRAINT "curriculum_unit_items_unit_id_curriculum_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."curriculum_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_unit_items" ADD CONSTRAINT "curriculum_unit_items_study_item_id_study_items_id_fk" FOREIGN KEY ("study_item_id") REFERENCES "public"."study_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_units" ADD CONSTRAINT "curriculum_units_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_units" ADD CONSTRAINT "curriculum_units_level_id_language_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."language_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_item_facets" ADD CONSTRAINT "study_item_facets_study_item_id_study_items_id_fk" FOREIGN KEY ("study_item_id") REFERENCES "public"."study_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_item_prerequisites" ADD CONSTRAINT "study_item_prerequisites_item_id_study_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."study_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_item_prerequisites" ADD CONSTRAINT "study_item_prerequisites_requires_item_id_study_items_id_fk" FOREIGN KEY ("requires_item_id") REFERENCES "public"."study_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_items" ADD CONSTRAINT "study_items_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_items" ADD CONSTRAINT "study_items_kana_id_kana_id_fk" FOREIGN KEY ("kana_id") REFERENCES "public"."kana"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_items" ADD CONSTRAINT "study_items_kanji_id_kanji_id_fk" FOREIGN KEY ("kanji_id") REFERENCES "public"."kanji"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_items" ADD CONSTRAINT "study_items_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_items" ADD CONSTRAINT "study_items_grammar_point_id_grammar_points_id_fk" FOREIGN KEY ("grammar_point_id") REFERENCES "public"."grammar_points"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_items" ADD CONSTRAINT "study_items_sentence_id_sentences_id_fk" FOREIGN KEY ("sentence_id") REFERENCES "public"."sentences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_items" ADD CONSTRAINT "study_items_phonetic_series_id_phonetic_series_id_fk" FOREIGN KEY ("phonetic_series_id") REFERENCES "public"."phonetic_series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_items" ADD CONSTRAINT "study_items_level_id_language_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."language_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_readiness_snapshots" ADD CONSTRAINT "level_readiness_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_readiness_snapshots" ADD CONSTRAINT "level_readiness_snapshots_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_readiness_snapshots" ADD CONSTRAINT "level_readiness_snapshots_level_id_language_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."language_levels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streak_freezes" ADD CONSTRAINT "streak_freezes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_known_kanji" ADD CONSTRAINT "user_known_kanji_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_known_kanji" ADD CONSTRAINT "user_known_kanji_kanji_id_kanji_id_fk" FOREIGN KEY ("kanji_id") REFERENCES "public"."kanji"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_known_kanji" ADD CONSTRAINT "user_known_kanji_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_languages" ADD CONSTRAINT "user_languages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_languages" ADD CONSTRAINT "user_languages_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_languages" ADD CONSTRAINT "user_languages_current_level_id_language_levels_id_fk" FOREIGN KEY ("current_level_id") REFERENCES "public"."language_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_languages" ADD CONSTRAINT "user_languages_target_level_id_language_levels_id_fk" FOREIGN KEY ("target_level_id") REFERENCES "public"."language_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_xp" ADD CONSTRAINT "user_xp_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_xp" ADD CONSTRAINT "user_xp_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_forms" ADD CONSTRAINT "word_forms_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_kanji" ADD CONSTRAINT "word_kanji_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_kanji" ADD CONSTRAINT "word_kanji_kanji_id_kanji_id_fk" FOREIGN KEY ("kanji_id") REFERENCES "public"."kanji"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_sense_sources" ADD CONSTRAINT "word_sense_sources_sense_id_word_senses_id_fk" FOREIGN KEY ("sense_id") REFERENCES "public"."word_senses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_senses" ADD CONSTRAINT "word_senses_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "words" ADD CONSTRAINT "words_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "words" ADD CONSTRAINT "words_level_id_language_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."language_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "words" ADD CONSTRAINT "words_source_id_import_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "etymology_kanji_aspect_idx" ON "etymology_entries" USING btree ("kanji_id","aspect","is_primary");--> statement-breakpoint
CREATE INDEX "etymology_word_idx" ON "etymology_entries" USING btree ("word_id","aspect");--> statement-breakpoint
CREATE INDEX "etymology_grammar_idx" ON "etymology_entries" USING btree ("grammar_point_id","aspect");--> statement-breakpoint
CREATE INDEX "etymology_competing_idx" ON "etymology_entries" USING btree ("competing_group_id");--> statement-breakpoint
CREATE INDEX "etymology_status_idx" ON "etymology_entries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "etymology_sources_source_idx" ON "etymology_sources" USING btree ("source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mnemonics_one_private_per_kanji" ON "mnemonics" USING btree ("kanji_id","author_user_id") WHERE "mnemonics"."visibility" = 'private';--> statement-breakpoint
CREATE INDEX "mnemonics_kanji_idx" ON "mnemonics" USING btree ("kanji_id","visibility");--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_prompts_unique" ON "exercise_prompts" USING btree ("facet_id","template_id","version");--> statement-breakpoint
CREATE INDEX "exercise_prompts_facet_idx" ON "exercise_prompts" USING btree ("facet_id") WHERE "exercise_prompts"."status" = 'published';--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_templates_code_unique" ON "exercise_templates" USING btree ("code","language_id");--> statement-breakpoint
CREATE UNIQUE INDEX "kind_facet_templates_unique" ON "kind_facet_templates" USING btree ("language_id","kind","facet","template_id");--> statement-breakpoint
CREATE UNIQUE INDEX "study_item_facet_templates_unique" ON "study_item_facet_templates" USING btree ("facet_id","template_id");--> statement-breakpoint
CREATE INDEX "grammar_formations_point_idx" ON "grammar_formations" USING btree ("grammar_point_id","sort_index");--> statement-breakpoint
CREATE INDEX "grammar_mistakes_point_idx" ON "grammar_mistakes" USING btree ("grammar_point_id","sort_index");--> statement-breakpoint
CREATE INDEX "grammar_relations_to_idx" ON "grammar_relations" USING btree ("to_id");--> statement-breakpoint
CREATE UNIQUE INDEX "grammar_points_slug_unique" ON "grammar_points" USING btree ("language_id","slug");--> statement-breakpoint
CREATE INDEX "grammar_points_level_idx" ON "grammar_points" USING btree ("language_id","level_id","sort_index");--> statement-breakpoint
CREATE UNIQUE INDEX "kana_character_unique" ON "kana" USING btree ("language_id","script","character");--> statement-breakpoint
CREATE UNIQUE INDEX "kanji_character_unique" ON "kanji" USING btree ("language_id","character");--> statement-breakpoint
CREATE INDEX "kanji_level_idx" ON "kanji" USING btree ("language_id","level_id","frequency_rank");--> statement-breakpoint
CREATE INDEX "kanji_components_parent_idx" ON "kanji_components" USING btree ("parent_kanji_id");--> statement-breakpoint
CREATE INDEX "kanji_components_child_kanji_idx" ON "kanji_components" USING btree ("component_kanji_id");--> statement-breakpoint
CREATE INDEX "kanji_components_child_radical_idx" ON "kanji_components" USING btree ("component_radical_id");--> statement-breakpoint
CREATE UNIQUE INDEX "kanji_confusables_unique" ON "kanji_confusables" USING btree ("kanji_id","confusable_id","reason");--> statement-breakpoint
CREATE INDEX "kanji_readings_kanji_type_idx" ON "kanji_readings" USING btree ("kanji_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "kanji_strokes_unique" ON "kanji_strokes" USING btree ("kanji_id","stroke_index");--> statement-breakpoint
CREATE UNIQUE INDEX "phonetic_series_component_unique" ON "phonetic_series" USING btree ("language_id","component_character");--> statement-breakpoint
CREATE UNIQUE INDEX "phonetic_series_members_unique" ON "phonetic_series_members" USING btree ("series_id","kanji_id");--> statement-breakpoint
CREATE INDEX "phonetic_series_members_kanji_idx" ON "phonetic_series_members" USING btree ("kanji_id");--> statement-breakpoint
CREATE INDEX "radicals_character_idx" ON "radicals" USING btree ("language_id","character");--> statement-breakpoint
CREATE INDEX "radicals_kangxi_idx" ON "radicals" USING btree ("kangxi_number");--> statement-breakpoint
CREATE UNIQUE INDEX "language_features_key_unique" ON "language_features" USING btree ("language_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "language_levels_code_unique" ON "language_levels" USING btree ("language_id","code");--> statement-breakpoint
CREATE INDEX "language_levels_rank_idx" ON "language_levels" USING btree ("language_id","rank");--> statement-breakpoint
CREATE INDEX "content_audio_word_idx" ON "content_audio" USING btree ("word_id","role");--> statement-breakpoint
CREATE INDEX "content_audio_sentence_idx" ON "content_audio" USING btree ("sentence_id","role");--> statement-breakpoint
CREATE INDEX "handwriting_attempts_user_kanji_idx" ON "handwriting_attempts" USING btree ("user_id","kanji_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_dedupe" ON "media_assets" USING btree ("text_hash","voice","provider") WHERE "media_assets"."text_hash" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "notification_log_dedupe" ON "notification_log" USING btree ("dedupe_key");--> statement-breakpoint
CREATE INDEX "notification_log_user_idx" ON "notification_log" USING btree ("user_id","sent_at");--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_idx" ON "push_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "content_review_queue_work_idx" ON "content_review_queue" USING btree ("language_id","status","priority","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "content_review_queue_one_pending" ON "content_review_queue" USING btree ("target_table","target_id") WHERE "content_review_queue"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "enrichment_items_run_idx" ON "enrichment_items" USING btree ("run_id","status");--> statement-breakpoint
CREATE INDEX "enrichment_items_target_idx" ON "enrichment_items" USING btree ("target_table","target_id");--> statement-breakpoint
CREATE INDEX "import_conflicts_pending_idx" ON "import_conflicts" USING btree ("resolution","created_at");--> statement-breakpoint
CREATE INDEX "import_records_run_idx" ON "import_records" USING btree ("run_id","action");--> statement-breakpoint
CREATE INDEX "import_records_target_idx" ON "import_records" USING btree ("target_table","target_id");--> statement-breakpoint
CREATE INDEX "import_runs_source_idx" ON "import_runs" USING btree ("source_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sentence_tokens_unique" ON "sentence_tokens" USING btree ("sentence_id","index");--> statement-breakpoint
CREATE INDEX "sentence_tokens_word_idx" ON "sentence_tokens" USING btree ("word_id");--> statement-breakpoint
CREATE INDEX "sentence_translations_sentence_lang_idx" ON "sentence_translations" USING btree ("sentence_id","lang");--> statement-breakpoint
CREATE INDEX "sentences_level_idx" ON "sentences" USING btree ("language_id","level_id");--> statement-breakpoint
CREATE INDEX "review_sessions_user_idx" ON "review_sessions" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "srs_cards_unique" ON "srs_cards" USING btree ("user_id","facet_id");--> statement-breakpoint
CREATE INDEX "srs_cards_due_idx" ON "srs_cards" USING btree ("user_id","due") WHERE not "srs_cards"."suspended";--> statement-breakpoint
CREATE INDEX "srs_cards_state_idx" ON "srs_cards" USING btree ("user_id","language_id","state");--> statement-breakpoint
CREATE INDEX "srs_cards_ghost_idx" ON "srs_cards" USING btree ("user_id") WHERE "srs_cards"."ghost";--> statement-breakpoint
CREATE INDEX "srs_ghost_events_card_idx" ON "srs_ghost_events" USING btree ("card_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "srs_review_logs_client_seq_unique" ON "srs_review_logs" USING btree ("user_id","client_id","client_seq") WHERE "srs_review_logs"."client_id" is not null;--> statement-breakpoint
CREATE INDEX "srs_review_logs_replay_idx" ON "srs_review_logs" USING btree ("user_id","card_id","reviewed_at","id");--> statement-breakpoint
CREATE INDEX "srs_review_logs_user_time_idx" ON "srs_review_logs" USING btree ("user_id","reviewed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "curriculum_units_code_unique" ON "curriculum_units" USING btree ("language_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "study_item_facets_unique" ON "study_item_facets" USING btree ("study_item_id","facet");--> statement-breakpoint
CREATE INDEX "study_item_facets_enabled_idx" ON "study_item_facets" USING btree ("study_item_id") WHERE "study_item_facets"."enabled";--> statement-breakpoint
CREATE INDEX "study_item_prerequisites_requires_idx" ON "study_item_prerequisites" USING btree ("requires_item_id");--> statement-breakpoint
CREATE INDEX "study_items_queue_idx" ON "study_items" USING btree ("language_id","level_id","sort_index") WHERE "study_items"."published" and "study_items"."active";--> statement-breakpoint
CREATE UNIQUE INDEX "study_items_kana_unique" ON "study_items" USING btree ("kana_id") WHERE "study_items"."kana_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "study_items_kanji_unique" ON "study_items" USING btree ("kanji_id") WHERE "study_items"."kanji_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "study_items_word_unique" ON "study_items" USING btree ("word_id") WHERE "study_items"."word_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "study_items_grammar_unique" ON "study_items" USING btree ("grammar_point_id") WHERE "study_items"."grammar_point_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "study_items_sentence_unique" ON "study_items" USING btree ("sentence_id") WHERE "study_items"."sentence_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "study_items_series_unique" ON "study_items" USING btree ("phonetic_series_id") WHERE "study_items"."phonetic_series_id" is not null;--> statement-breakpoint
CREATE INDEX "level_readiness_user_level_idx" ON "level_readiness_snapshots" USING btree ("user_id","level_id","computed_at");--> statement-breakpoint
CREATE INDEX "streak_freezes_user_idx" ON "streak_freezes" USING btree ("user_id") WHERE "streak_freezes"."used_on_date" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "xp_events_dedupe" ON "xp_events" USING btree ("user_id","source","ref_id");--> statement-breakpoint
CREATE INDEX "xp_events_user_idx" ON "xp_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "word_forms_word_idx" ON "word_forms" USING btree ("word_id");--> statement-breakpoint
CREATE INDEX "word_forms_form_idx" ON "word_forms" USING btree ("form");--> statement-breakpoint
CREATE UNIQUE INDEX "word_kanji_unique" ON "word_kanji" USING btree ("word_id","kanji_id","position");--> statement-breakpoint
CREATE INDEX "word_kanji_kanji_idx" ON "word_kanji" USING btree ("kanji_id");--> statement-breakpoint
CREATE INDEX "word_sense_sources_sense_idx" ON "word_sense_sources" USING btree ("sense_id");--> statement-breakpoint
CREATE INDEX "word_senses_word_idx" ON "word_senses" USING btree ("word_id","sort_index");--> statement-breakpoint
CREATE UNIQUE INDEX "words_ent_seq_unique" ON "words" USING btree ("language_id","ent_seq");--> statement-breakpoint
CREATE INDEX "words_level_idx" ON "words" USING btree ("language_id","level_id","frequency_rank");--> statement-breakpoint
CREATE INDEX "words_primary_form_idx" ON "words" USING btree ("primary_form");--> statement-breakpoint
CREATE INDEX "words_primary_reading_idx" ON "words" USING btree ("primary_reading");