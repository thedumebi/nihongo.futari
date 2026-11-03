-- Mnemonics get the same human gate as etymology: a reviewer column and a
-- CHECK that refuses status 'published' without one. No mnemonic is published
-- yet, so the constraint holds for every existing row. The word index serves
-- the word entry's lookup, as the kanji index already serves the kanji page.
ALTER TABLE "editorial"."mnemonics" ADD COLUMN "reviewed_by" text;--> statement-breakpoint
ALTER TABLE "editorial"."mnemonics" ADD COLUMN "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "editorial"."mnemonics" ADD CONSTRAINT "mnemonics_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mnemonics_word_idx" ON "editorial"."mnemonics" USING btree ("word_id","visibility");--> statement-breakpoint
ALTER TABLE "editorial"."mnemonics" ADD CONSTRAINT "mnemonics_publish_needs_reviewer" CHECK ("editorial"."mnemonics"."status" <> 'published' or "editorial"."mnemonics"."reviewed_by" is not null);