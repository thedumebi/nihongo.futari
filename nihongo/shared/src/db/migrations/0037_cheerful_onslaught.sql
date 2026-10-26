-- Lessons and the course join from a study item to its unit. The primary key
-- leads on unit_id, so that join had no index to use.
CREATE INDEX IF NOT EXISTS "curriculum_unit_items_item_idx" ON "curriculum_unit_items" USING btree ("study_item_id");
