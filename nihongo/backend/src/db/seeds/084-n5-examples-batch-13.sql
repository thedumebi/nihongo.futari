-- N5 example sentences, batch 13: the last topic.
--
-- Dropping the subject, which is why every sentence here is shorter than its
-- English translation — 学生です is "I am a student" with nobody mentioned. The
-- sentences are deliberately bare, because the topic IS what is missing from
-- them.
--
-- This completes N5: all 129 published topics have four example sentences,
-- their tokens, their audio, and questions generated from them.
--
-- Additive, idempotent, safe on a live database.

INSERT INTO sentences (id, language_id, text, reading_kana, level_id, source, published) VALUES
  -- subject-drop
  ('sent-ex-subjdrop-1', 'lang-ja', '学生です。', 'がくせい です。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-subjdrop-2', 'lang-ja', '明日行きます。', 'あした いきます。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-subjdrop-3', 'lang-ja', '電車で来ました。', 'でんしゃ で きました。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-subjdrop-4', 'lang-ja', 'お茶を飲みました。', 'おちゃ お のみました。', 'lvl-ja-n5', 'authored', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sentence_translations (id, sentence_id, lang, text, source) VALUES
  ('st-ex-subjdrop-1', 'sent-ex-subjdrop-1', 'en', 'I am a student.', 'authored'),
  ('st-ex-subjdrop-2', 'sent-ex-subjdrop-2', 'en', 'I am going tomorrow.', 'authored'),
  ('st-ex-subjdrop-3', 'sent-ex-subjdrop-3', 'en', 'I came by train.', 'authored'),
  ('st-ex-subjdrop-4', 'sent-ex-subjdrop-4', 'en', 'I drank tea.', 'authored')
ON CONFLICT (id) DO NOTHING;

INSERT INTO grammar_point_sentences (grammar_point_id, sentence_id, role, sort_index)
SELECT g.id, s.id, 'example', s.n
FROM (VALUES
  ('subject-drop', 'sent-ex-subjdrop-1', 0),
  ('subject-drop', 'sent-ex-subjdrop-2', 1),
  ('subject-drop', 'sent-ex-subjdrop-3', 2),
  ('subject-drop', 'sent-ex-subjdrop-4', 3)
) AS s(slug, id, n)
JOIN grammar_points g ON g.language_id = 'lang-ja' AND g.slug = s.slug
ON CONFLICT (grammar_point_id, sentence_id, role) DO NOTHING;

-- The tokens. `tokenise:authored` is a dev script and production runs only
-- migrations and seeds; the quiz derivation cuts its chips from these rows.
DELETE FROM sentence_tokens WHERE sentence_id IN ('sent-ex-subjdrop-1', 'sent-ex-subjdrop-2', 'sent-ex-subjdrop-3', 'sent-ex-subjdrop-4');
INSERT INTO sentence_tokens (id, sentence_id, index, surface, reading, word_id, char_start, char_end, furigana) VALUES
  (gen_random_uuid()::text, 'sent-ex-subjdrop-1', 0, '学生', 'がくせい', (select id from words where primary_form = '学生' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"学生","r":"がくせい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-subjdrop-1', 1, 'です', 'です', NULL, 2, 4, '[{"t":"です"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-subjdrop-1', 2, '。', '。', NULL, 4, 5, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-subjdrop-2', 0, '明日', 'あした', (select id from words where primary_form = '明日' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"明日","r":"あした"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-subjdrop-2', 1, '行きます', 'いきます', (select id from words where primary_form = '行く' and language_id = 'lang-ja' and published order by id limit 1), 2, 6, '[{"t":"行","r":"い"},{"t":"きます"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-subjdrop-2', 2, '。', '。', NULL, 6, 7, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-subjdrop-3', 0, '電車', 'でんしゃ', (select id from words where primary_form = '電車' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"電車","r":"でんしゃ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-subjdrop-3', 1, 'で', 'で', (select id from words where primary_form = 'で' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"で"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-subjdrop-3', 2, '来ました', 'きました', (select id from words where primary_form = '来る' and language_id = 'lang-ja' and published order by id limit 1), 3, 7, '[{"t":"来","r":"き"},{"t":"ました"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-subjdrop-3', 3, '。', '。', NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-subjdrop-4', 0, 'お茶', 'おちゃ', (select id from words where primary_form = 'お茶' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"お"},{"t":"茶","r":"ちゃ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-subjdrop-4', 1, 'を', 'を', NULL, 2, 3, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-subjdrop-4', 2, '飲みました', 'のみました', (select id from words where primary_form = '飲む' and language_id = 'lang-ja' and published order by id limit 1), 3, 8, '[{"t":"飲","r":"の"},{"t":"みました"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-subjdrop-4', 3, '。', '。', NULL, 8, 9, '[{"t":"。"}]'::jsonb);
