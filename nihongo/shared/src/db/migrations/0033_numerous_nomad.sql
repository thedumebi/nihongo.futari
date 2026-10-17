-- "Reviews ready": a daytime push when 10 or more reviews are waiting, at most
-- once a day, and never close to the daily reminder. Off by default: it is the
-- one notification whose timing the learner did not choose.
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "due_alert_enabled" boolean DEFAULT false NOT NULL;
