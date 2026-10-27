-- The tables leave public for six schemas, by who writes them: auth,
-- content, editorial, learner, social, ops. Organisation only. SET SCHEMA is
-- a catalog change: no row is copied, and indexes, constraints, foreign keys
-- and owned sequences go with their table. Every app connection already
-- names these schemas on its search_path (the commit before this one), so
-- the container still serving during the deploy keeps finding its tables.
CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "content";
--> statement-breakpoint
CREATE SCHEMA "editorial";
--> statement-breakpoint
CREATE SCHEMA "learner";
--> statement-breakpoint
CREATE SCHEMA "ops";
--> statement-breakpoint
CREATE SCHEMA "social";
--> statement-breakpoint
ALTER TABLE "public"."accounts" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "public"."sessions" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "public"."users" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "public"."verifications" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "public"."crossword_results" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."etymology_entries" SET SCHEMA "editorial";
--> statement-breakpoint
ALTER TABLE "public"."etymology_sources" SET SCHEMA "editorial";
--> statement-breakpoint
ALTER TABLE "public"."mnemonics" SET SCHEMA "editorial";
--> statement-breakpoint
ALTER TABLE "public"."sources" SET SCHEMA "editorial";
--> statement-breakpoint
ALTER TABLE "public"."exercise_prompts" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."exercise_templates" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."kind_facet_templates" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."lesson_misses" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."study_item_facet_templates" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."friend_board_snapshots" SET SCHEMA "social";
--> statement-breakpoint
ALTER TABLE "public"."friend_profiles" SET SCHEMA "social";
--> statement-breakpoint
ALTER TABLE "public"."friendships" SET SCHEMA "social";
--> statement-breakpoint
ALTER TABLE "public"."dialogue_replies" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."dialogue_turns" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."dialogues" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."email_campaigns" SET SCHEMA "ops";
--> statement-breakpoint
ALTER TABLE "public"."email_deliveries" SET SCHEMA "ops";
--> statement-breakpoint
ALTER TABLE "public"."grammar_formations" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."grammar_mistakes" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."grammar_relations" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."grammar_point_sentences" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."grammar_points" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."grammar_variants" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."invite_redemptions" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "public"."invite_reservations" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "public"."invites" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "public"."kana" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."character_strokes" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."kanji" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."kanji_components" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."kanji_confusables" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."kanji_readings" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."phonetic_series" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."phonetic_series_members" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."radicals" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."language_features" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."language_levels" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."languages" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."content_audio" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."handwriting_attempts" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."media_assets" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."notification_log" SET SCHEMA "ops";
--> statement-breakpoint
ALTER TABLE "public"."push_subscriptions" SET SCHEMA "ops";
--> statement-breakpoint
ALTER TABLE "public"."content_review_queue" SET SCHEMA "editorial";
--> statement-breakpoint
ALTER TABLE "public"."enrichment_items" SET SCHEMA "editorial";
--> statement-breakpoint
ALTER TABLE "public"."enrichment_runs" SET SCHEMA "editorial";
--> statement-breakpoint
ALTER TABLE "public"."import_conflicts" SET SCHEMA "editorial";
--> statement-breakpoint
ALTER TABLE "public"."import_records" SET SCHEMA "editorial";
--> statement-breakpoint
ALTER TABLE "public"."import_runs" SET SCHEMA "editorial";
--> statement-breakpoint
ALTER TABLE "public"."import_sources" SET SCHEMA "editorial";
--> statement-breakpoint
ALTER TABLE "public"."particle_questions" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."particle_sets" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."reading_lines" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."readings" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."sentence_tokens" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."sentence_translations" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."sentences" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."speak_progress" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."speak_sessions" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."speak_steps" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."review_sessions" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."srs_cards" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."srs_daily_stats" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."srs_ghost_events" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."srs_review_logs" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."curriculum_unit_items" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."curriculum_units" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."lesson_views" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."study_item_facets" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."study_item_prerequisites" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."study_items" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."achievements" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."learning_activities" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."level_readiness_snapshots" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."stage_celebrations" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."streak_freezes" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."user_achievements" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."user_known_kanji" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."user_languages" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."user_settings" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."user_streaks" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."user_xp" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."xp_events" SET SCHEMA "learner";
--> statement-breakpoint
ALTER TABLE "public"."word_forms" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."word_kanji" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."word_sense_sources" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."word_senses" SET SCHEMA "content";
--> statement-breakpoint
ALTER TABLE "public"."words" SET SCHEMA "content";
--> statement-breakpoint
-- The same path for every other session (psql, an operator's checks), which
-- would otherwise look only in public and find nothing. pg_catalog is left
-- implicit, so it is searched first there.
DO $$ BEGIN
  EXECUTE format('ALTER DATABASE %I SET search_path = auth, content, editorial, learner, social, ops, public', current_database());
END $$;
