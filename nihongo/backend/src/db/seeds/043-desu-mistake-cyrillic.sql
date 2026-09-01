-- Fix a です mistake example that was written in Russian.
--
-- The card taught "i-adjectives keep their own ending" with the wrong form
-- given as `высокийです。` — высокий is Russian for "tall". Presumably a
-- slip while reaching for 高い; the explanation beside it was correct and named
-- 高いだ as the error, so the example contradicted its own lesson and showed a
-- learner a sentence in a language they are not studying.
--
-- Two changes were needed, and this is only half of the fix. `009-grammar.sql`
-- was corrected at source so a FRESH database never inserts the bad row, and
-- this seed repairs the databases where 009 has already run — `seed_history`
-- records seeds by filename, so an applied seed never runs again however much
-- it is edited.
--
-- Targeted by id and guarded on the broken value, so it cannot disturb a
-- database that already holds the corrected row, and re-running it is a no-op.
UPDATE grammar_mistakes
SET wrong = '高いだ。'
WHERE id = 'gm-desu-1'
  AND wrong = 'высокийです。';
