CREATE TABLE "invite_redemptions" (
	"id" text PRIMARY KEY NOT NULL,
	"invite_id" text NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invite_reservations" (
	"id" text PRIMARY KEY NOT NULL,
	"invite_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"consumed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"email" text,
	"note" text,
	"role" text DEFAULT 'user' NOT NULL,
	"max_uses" integer DEFAULT 1 NOT NULL,
	"use_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"revoked_at" timestamp,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invite_redemptions" ADD CONSTRAINT "invite_redemptions_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_redemptions" ADD CONSTRAINT "invite_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_reservations" ADD CONSTRAINT "invite_reservations_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invite_redemptions_invite_idx" ON "invite_redemptions" USING btree ("invite_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invite_redemptions_user_unique" ON "invite_redemptions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invite_reservations_live_email" ON "invite_reservations" USING btree ("email") WHERE "invite_reservations"."consumed_at" is null;--> statement-breakpoint
CREATE INDEX "invite_reservations_invite_idx" ON "invite_reservations" USING btree ("invite_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invites_code_unique" ON "invites" USING btree ("code");--> statement-breakpoint
CREATE INDEX "invites_live_idx" ON "invites" USING btree ("code") WHERE "invites"."revoked_at" is null and "invites"."use_count" < "invites"."max_uses";--> statement-breakpoint
CREATE INDEX "invites_email_idx" ON "invites" USING btree ("email");