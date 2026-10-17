-- The daily limit now counts new WORDS, not cards. The other cards of words
-- already met ("a new way to practise") come beside them, up to this multiple
-- of the word limit: Settings → Extra practice, 1×, 2× (default) or 3×.
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "extra_practice_multiple" integer DEFAULT 2 NOT NULL;
