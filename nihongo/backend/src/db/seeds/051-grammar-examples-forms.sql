-- Example sentences for the eight points the complaint was actually about.
--
-- Bunpo teaches a point with explanations AND example sentences; this app had
-- 353 explanations and 20 examples. Without them a lesson is a paragraph about
-- a pattern you have never seen doing anything.
--
-- These are the form points, in curriculum order: です(143) → dictionary form
-- and verb classes(156) → 〜ます(157) → 〜て(165) → 〜た(173) → 〜ている(181) →
-- 〜ない(188). The rest of N5 follows in later seeds.
--
-- They go in `sentences` rather than a `grammar_examples` table on purpose. A
-- sentence there already gets tokenised and glossed by `glossLine` (so every
-- word is tappable), romanised per token (so は reads as wa), spoken by
-- `audio:sentences`, and is eligible for the cloze and word-order importers.
-- One authored line therefore yields the lesson card and two drills.
--
-- `reading_kana` carries SPOKEN kana: は as わ, を as お, へ as え. `kanaToRomaji`
-- does not correct particles, so a line stored with the written forms teaches
-- "ha" and "wo". Every tatoeba row has this column NULL; these must not.
--
-- Every line is checked by `check-examples.ts` before it lands. `glossLine`
-- matches longest-first against the published vocabulary, so a word outside it
-- is shredded into single kana — 東京, 日本語, ちょっと and います all are, and
-- 日本語を came out as 日本 + 語を glossed "to talk about". None of that is
-- visible until it renders, which is why the check is a script and not a habit.
--
-- Vocabulary is held to words introduced at or before each point's position.
-- The fault being fixed here is being quizzed on something never taught, and
-- reintroducing it in the examples would be absurd.
--
-- Additive: sentences, their English, and the join. Nothing is deleted, no
-- accounts, no srs_cards, no review logs. Safe on a live database and safe to
-- re-run.

INSERT INTO sentences (id, language_id, text, reading_kana, level_id, source, published) VALUES
  -- です
  ('sent-ex-desu-1', 'lang-ja', '私は学生です。', 'わたし わ がくせい です。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-desu-2', 'lang-ja', '私の本です。', 'わたし の ほん です。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-desu-3', 'lang-ja', '田中さんは先生です。', 'たなか さん わ せんせい です。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-desu-4', 'lang-ja', '今日は水曜日です。', 'きょう わ すいようび です。', 'lvl-ja-n5', 'authored', true),
  -- Dictionary form
  ('sent-ex-dict-1', 'lang-ja', '毎日勉強する。', 'まいにち べんきょう する。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-dict-2', 'lang-ja', '明日友だちに会う。', 'あした ともだち に あう。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-dict-3', 'lang-ja', '朝ご飯を食べる。', 'あさごはん お たべる。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-dict-4', 'lang-ja', '電車で会社に行く。', 'でんしゃ で かいしゃ に いく。', 'lvl-ja-n5', 'authored', true),
  -- Verb classes: one sentence per class, so the grouping is visible rather than asserted.
  ('sent-ex-vclass-1', 'lang-ja', '毎朝六時に起きる。', 'まいあさ ろくじ に おきる。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-vclass-2', 'lang-ja', '手紙を書く。', 'てがみ お かく。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-vclass-3', 'lang-ja', '毎日勉強する。', 'まいにち べんきょう する。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-vclass-4', 'lang-ja', '友だちが来る。', 'ともだち が くる。', 'lvl-ja-n5', 'authored', true),
  -- 〜ます
  ('sent-ex-masu-1', 'lang-ja', '毎日勉強します。', 'まいにち べんきょう します。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-masu-2', 'lang-ja', '七時に起きます。', 'しちじ に おきます。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-masu-3', 'lang-ja', '明日会社に行きます。', 'あした かいしゃ に いきます。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-masu-4', 'lang-ja', 'お茶を飲みます。', 'おちゃ お のみます。', 'lvl-ja-n5', 'authored', true),
  -- 〜て
  ('sent-ex-te-1', 'lang-ja', 'ご飯を食べて、テレビを見ます。', 'ごはん お たべて、テレビ お みます。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-te-2', 'lang-ja', '少し待ってください。', 'すこし まって ください。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-te-3', 'lang-ja', '手を洗って、座ってください。', 'て お あらって、すわって ください。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-te-4', 'lang-ja', '電話して、会社に行きます。', 'でんわ して、かいしゃ に いきます。', 'lvl-ja-n5', 'authored', true),
  -- 〜た
  ('sent-ex-ta-1', 'lang-ja', '昨日映画を見た。', 'きのう えいが お みた。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-ta-2', 'lang-ja', 'ご飯はもう食べた。', 'ごはん わ もう たべた。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-ta-3', 'lang-ja', '友だちに会った。', 'ともだち に あった。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-ta-4', 'lang-ja', '分かった！', 'わかった！', 'lvl-ja-n5', 'authored', true),
  -- 〜ている
  ('sent-ex-teiru-1', 'lang-ja', '今、本を読んでいる。', 'いま、ほん お よんで いる。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-teiru-2', 'lang-ja', '雨が降っている。', 'あめ が ふって いる。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-teiru-3', 'lang-ja', '日本に住んでいる。', 'にほん に すんで いる。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-teiru-4', 'lang-ja', '彼は結婚している。', 'かれ わ けっこん して いる。', 'lvl-ja-n5', 'authored', true),
  -- 〜ない
  ('sent-ex-nai-1', 'lang-ja', '今日は行かない。', 'きょう わ いかない。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-nai-2', 'lang-ja', 'お酒は飲まない。', 'おさけ わ のまない。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-nai-3', 'lang-ja', '何も食べない。', 'なに も たべない。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-nai-4', 'lang-ja', '分からない。', 'わからない。', 'lvl-ja-n5', 'authored', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sentence_translations (id, sentence_id, lang, text, source) VALUES
  ('st-ex-desu-1', 'sent-ex-desu-1', 'en', 'I''m a student.', 'authored'),
  ('st-ex-desu-2', 'sent-ex-desu-2', 'en', 'It''s my book.', 'authored'),
  ('st-ex-desu-3', 'sent-ex-desu-3', 'en', 'Tanaka is a teacher.', 'authored'),
  ('st-ex-desu-4', 'sent-ex-desu-4', 'en', 'Today is Wednesday.', 'authored'),
  ('st-ex-dict-1', 'sent-ex-dict-1', 'en', 'I study every day.', 'authored'),
  ('st-ex-dict-2', 'sent-ex-dict-2', 'en', 'I''ll meet a friend tomorrow.', 'authored'),
  ('st-ex-dict-3', 'sent-ex-dict-3', 'en', 'I eat breakfast.', 'authored'),
  ('st-ex-dict-4', 'sent-ex-dict-4', 'en', 'I go to the office by train.', 'authored'),
  ('st-ex-vclass-1', 'sent-ex-vclass-1', 'en', 'I get up at six every morning. (起きる — ichidan)', 'authored'),
  ('st-ex-vclass-2', 'sent-ex-vclass-2', 'en', 'I write a letter. (書く — godan)', 'authored'),
  ('st-ex-vclass-3', 'sent-ex-vclass-3', 'en', 'I study every day. (勉強する — irregular)', 'authored'),
  ('st-ex-vclass-4', 'sent-ex-vclass-4', 'en', 'A friend is coming. (来る — irregular)', 'authored'),
  ('st-ex-masu-1', 'sent-ex-masu-1', 'en', 'I study every day.', 'authored'),
  ('st-ex-masu-2', 'sent-ex-masu-2', 'en', 'I get up at seven.', 'authored'),
  ('st-ex-masu-3', 'sent-ex-masu-3', 'en', 'I''ll go to the office tomorrow.', 'authored'),
  ('st-ex-masu-4', 'sent-ex-masu-4', 'en', 'I drink tea.', 'authored'),
  ('st-ex-te-1', 'sent-ex-te-1', 'en', 'I eat, and then watch TV.', 'authored'),
  ('st-ex-te-2', 'sent-ex-te-2', 'en', 'Please wait a moment.', 'authored'),
  ('st-ex-te-3', 'sent-ex-te-3', 'en', 'Wash your hands and sit down.', 'authored'),
  ('st-ex-te-4', 'sent-ex-te-4', 'en', 'I''ll call, and then go to the office.', 'authored'),
  ('st-ex-ta-1', 'sent-ex-ta-1', 'en', 'I watched a film yesterday.', 'authored'),
  ('st-ex-ta-2', 'sent-ex-ta-2', 'en', 'I''ve already eaten.', 'authored'),
  ('st-ex-ta-3', 'sent-ex-ta-3', 'en', 'I met a friend.', 'authored'),
  ('st-ex-ta-4', 'sent-ex-ta-4', 'en', 'Got it! (a state just reached, not a past event)', 'authored'),
  ('st-ex-teiru-1', 'sent-ex-teiru-1', 'en', 'I''m reading a book right now.', 'authored'),
  ('st-ex-teiru-2', 'sent-ex-teiru-2', 'en', 'It''s raining.', 'authored'),
  ('st-ex-teiru-3', 'sent-ex-teiru-3', 'en', 'I live in Japan. (an ongoing state, not an action)', 'authored'),
  ('st-ex-teiru-4', 'sent-ex-teiru-4', 'en', 'He''s married. (a state, which is why English uses no -ing)', 'authored'),
  ('st-ex-nai-1', 'sent-ex-nai-1', 'en', 'I''m not going today.', 'authored'),
  ('st-ex-nai-2', 'sent-ex-nai-2', 'en', 'I don''t drink alcohol.', 'authored'),
  ('st-ex-nai-3', 'sent-ex-nai-3', 'en', 'I''m not eating anything.', 'authored'),
  ('st-ex-nai-4', 'sent-ex-nai-4', 'en', 'I don''t understand.', 'authored')
ON CONFLICT (id) DO NOTHING;

INSERT INTO grammar_point_sentences (grammar_point_id, sentence_id, role, sort_index)
SELECT g.id, s.id, 'example', s.n
FROM (VALUES
  ('desu', 'sent-ex-desu-1', 0), ('desu', 'sent-ex-desu-2', 1), ('desu', 'sent-ex-desu-3', 2), ('desu', 'sent-ex-desu-4', 3),
  ('dictionary-form', 'sent-ex-dict-1', 0), ('dictionary-form', 'sent-ex-dict-2', 1), ('dictionary-form', 'sent-ex-dict-3', 2), ('dictionary-form', 'sent-ex-dict-4', 3),
  ('verb-classes', 'sent-ex-vclass-1', 0), ('verb-classes', 'sent-ex-vclass-2', 1), ('verb-classes', 'sent-ex-vclass-3', 2), ('verb-classes', 'sent-ex-vclass-4', 3),
  ('masu', 'sent-ex-masu-1', 0), ('masu', 'sent-ex-masu-2', 1), ('masu', 'sent-ex-masu-3', 2), ('masu', 'sent-ex-masu-4', 3),
  ('te-form', 'sent-ex-te-1', 0), ('te-form', 'sent-ex-te-2', 1), ('te-form', 'sent-ex-te-3', 2), ('te-form', 'sent-ex-te-4', 3),
  ('ta-form', 'sent-ex-ta-1', 0), ('ta-form', 'sent-ex-ta-2', 1), ('ta-form', 'sent-ex-ta-3', 2), ('ta-form', 'sent-ex-ta-4', 3),
  ('teiru', 'sent-ex-teiru-1', 0), ('teiru', 'sent-ex-teiru-2', 1), ('teiru', 'sent-ex-teiru-3', 2), ('teiru', 'sent-ex-teiru-4', 3),
  ('nai', 'sent-ex-nai-1', 0), ('nai', 'sent-ex-nai-2', 1), ('nai', 'sent-ex-nai-3', 2), ('nai', 'sent-ex-nai-4', 3)
) AS s(slug, id, n)
JOIN grammar_points g ON g.language_id = 'lang-ja' AND g.slug = s.slug
ON CONFLICT (grammar_point_id, sentence_id, role) DO NOTHING;
