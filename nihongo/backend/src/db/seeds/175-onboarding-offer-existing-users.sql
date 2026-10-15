-- Accounts from before onboarding existed are OFFERED it, not sent to it.
--
-- A new account starts 'pending' (the column default) and goes straight to the
-- welcome flow. Someone who has been using the app should not be bounced there
-- on their next visit; Today offers it instead, and they can skip it.
--
-- Every existing user gets a settings row if they had none (rows are otherwise
-- created on demand, and a missing row would read as 'pending'). Runs once.

INSERT INTO user_settings (user_id, onboarding_status)
SELECT id, 'offer' FROM users
ON CONFLICT (user_id) DO UPDATE SET onboarding_status = 'offer', updated_at = now()
WHERE user_settings.onboarding_status = 'pending';
