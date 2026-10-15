-- Friends' weekly board nudges: a push when a friend passes you, or is close
-- behind. friend_board_snapshots holds the board as it last stood between two
-- friends, so the cron can tell "they just went ahead" from "your day dropped
-- out of the seven". notify_board is the switch in Settings, on by default.
CREATE TABLE IF NOT EXISTS "friend_board_snapshots" (
	"user_id" text NOT NULL,
	"friend_id" text NOT NULL,
	"my_days" integer NOT NULL,
	"my_xp" integer NOT NULL,
	"friend_days" integer NOT NULL,
	"friend_xp" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "friend_board_snapshots_user_id_friend_id_pk" PRIMARY KEY("user_id","friend_id")
);
--> statement-breakpoint
ALTER TABLE "friend_profiles" ADD COLUMN IF NOT EXISTS "notify_board" boolean DEFAULT true NOT NULL;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "friend_board_snapshots" ADD CONSTRAINT "friend_board_snapshots_user_id_friend_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."friend_profiles"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "friend_board_snapshots" ADD CONSTRAINT "friend_board_snapshots_friend_id_friend_profiles_user_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."friend_profiles"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
