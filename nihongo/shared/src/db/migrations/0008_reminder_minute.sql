-- Reminders on the quarter hour.
--
-- `reminder_hour` alone could only mean "some time in that hour". The cron runs
-- every fifteen minutes, so a quarter is the finest grain the scheduler can
-- actually honour — anything finer would promise precision it does not have.
--
-- Defaults to 0, which is the behaviour every existing row already had.
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "reminder_minute" integer DEFAULT 0 NOT NULL;
