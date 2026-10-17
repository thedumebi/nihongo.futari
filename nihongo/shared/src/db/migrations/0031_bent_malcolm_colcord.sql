-- What each sentence's and word's audio clip actually says, and in which
-- voice. Clips were filed by id, so a reworded sentence went on playing its old
-- wording (and a dictation marked the learner wrong for typing what was
-- shown). Now a clip is only played while these match the current text; they
-- are filled by the generated clip seed after an audio run.
ALTER TABLE "sentences" ADD COLUMN IF NOT EXISTS "audio_text" text;--> statement-breakpoint
ALTER TABLE "sentences" ADD COLUMN IF NOT EXISTS "audio_voice" text;--> statement-breakpoint
ALTER TABLE "words" ADD COLUMN IF NOT EXISTS "audio_text" text;--> statement-breakpoint
ALTER TABLE "words" ADD COLUMN IF NOT EXISTS "audio_voice" text;
