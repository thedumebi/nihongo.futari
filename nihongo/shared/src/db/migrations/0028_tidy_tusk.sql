-- Friends can share what they studied: counts of reviews, new words, lessons,
-- conversations, readings and so on, shown when you open a friend's card.
-- Off by default like every other share; never which words, never accuracy.
ALTER TABLE "friend_profiles" ADD COLUMN IF NOT EXISTS "share_activity" boolean DEFAULT false NOT NULL;
