-- Every account's day now starts at midnight in its own timezone.
--
-- The boundary was 4am for everyone — the column default, which no screen
-- ever let anyone change, so every stored 4 is the default rather than a
-- choice. From now on Settings offers the hour, and the default is midnight
-- (migration 0024). Days already studied keep the dates they were recorded
-- with; only what happens from here on uses the new boundary.
--
-- Runs once (seeds are tracked by name), so a learner who later picks 4am
-- again keeps it.

UPDATE user_settings SET day_boundary_hour = 0, updated_at = now() WHERE day_boundary_hour = 4;
