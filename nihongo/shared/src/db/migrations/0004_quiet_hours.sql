-- Quiet hours for reminders.
--
-- A reminder that lands at 3am does not get someone to study; it gets the app
-- muted. Stored as local hours on the user's own settings, because the whole
-- point is the user's night, not the server's.
--
-- Defaults 22:00-07:00. Equal values mean no quiet period.
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "quiet_start_hour" integer NOT NULL DEFAULT 22;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "quiet_end_hour" integer NOT NULL DEFAULT 7;
