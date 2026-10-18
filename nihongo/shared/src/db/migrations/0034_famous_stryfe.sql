-- Stage celebrations: the stage last seen (follows the learner both ways), and
-- a pass waiting to be shown, so a dropped response can no longer lose it.
ALTER TABLE "stage_celebrations" ADD COLUMN IF NOT EXISTS "last_stage_seen" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "stage_celebrations" ADD COLUMN IF NOT EXISTS "pending_from" integer;--> statement-breakpoint
ALTER TABLE "stage_celebrations" ADD COLUMN IF NOT EXISTS "pending_to" integer;
