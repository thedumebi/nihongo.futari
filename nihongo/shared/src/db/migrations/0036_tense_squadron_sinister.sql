-- A celebration at every 5 answers right in a row (5, 10, 15…). On by default:
-- the learner can turn it off in Settings, and the celebration says so.
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "streak_celebrations" boolean DEFAULT true NOT NULL;
