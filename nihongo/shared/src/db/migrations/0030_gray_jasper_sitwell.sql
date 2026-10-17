-- One push subscription per app copy. Every push arrived twice when a device
-- held two rows; from now a copy that subscribes again replaces its own row,
-- and the database refuses a second one for the same (user, device id).
--
-- Any existing pair would stop the index being built, so first keep only the
-- most recently updated row of each (user, device id). Rows without a device
-- id (subscribed before it was sent) are untouched.
DELETE FROM "push_subscriptions" p
USING "push_subscriptions" newer
WHERE p.device_id IS NOT NULL
  AND newer.user_id = p.user_id
  AND newer.device_id = p.device_id
  AND (newer.updated_at, newer.id) > (p.updated_at, p.id);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "push_subscriptions_user_device_unique" ON "push_subscriptions" USING btree ("user_id","device_id") WHERE "push_subscriptions"."device_id" is not null;
