-- A scene illustration per curriculum unit.
--
-- The scenario decks (restaurant, konbini, ward office, station) each have a
-- hand-drawn scene that nothing could reference. Vocabulary images ride in
-- `exercise_prompts.assets`, which already carries audio, so only the units
-- needed a new column.
ALTER TABLE "curriculum_units" ADD COLUMN IF NOT EXISTS "image_url" text;
