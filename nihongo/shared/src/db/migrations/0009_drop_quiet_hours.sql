-- Remove the quiet-hours window.
--
-- It was never reachable. No screen exposed it, it was not in the preferences
-- the settings page saves, and so every account carried the 22:00-07:00
-- default that nobody had chosen and nobody could change. It then silenced the
-- reminder hour people HAD chosen — a late evening reminder, which is the
-- obvious time to study, could never fire.
--
-- It was also the wrong layer. The server cannot know when someone is asleep;
-- the phone's own Do Not Disturb already holds notifications quietly and is
-- the only thing that does know. This duplicated that badly and overrode an
-- explicit choice to do it.
--
-- If quiet hours are wanted later they need a UI first, and the columns can
-- come back with it.
ALTER TABLE "user_settings" DROP COLUMN IF EXISTS "quiet_start_hour";
ALTER TABLE "user_settings" DROP COLUMN IF EXISTS "quiet_end_hour";
