-- The last five topics, and the one duplicated sentence.
--
-- 〜をものともせず (N2), 〜を余儀なくされる, 〜ところを, 〜うが〜まいが and
-- 〜まい (N1). Seeds 129, 133 and 135 each recorded these as unwritable and
-- said why: every one of them failed in the tokeniser rather than in the
-- writing, so no choice of sentence could have fixed them.
--
--   〜をものともせず and 〜を余儀なくされる are titled with their particle
--   attached, and the pattern indexer skipped anything starting in を — so
--   the patterns were never indexed at all and 余|儀|な|く|さ|れ|た was what a
--   reader saw. The particle now comes off the front instead of taking the
--   pattern with it, and a pattern ending in a verb conjugates, because
--   中止を余儀なくされました is the form the topic exists to teach.
--
--   〜まい was on the pattern stop-list, put there when it stole the front of
--   まいります and してしまいました. 参る is now in KANA_CONJUGATING and てしまう
--   conjugates as a pattern, so both of those words claim their own spelling
--   first and まい is free to be itself.
--
--   〜ところを and 〜うが〜まいが were never broken. check:examples reads a
--   token ending in a particle as a swallowed one, which is right for 語を and
--   wrong for a pattern that ends in を by design; it now exempts patterns.
--
-- That closes N1 at 55/55 and N2 at 55/55 — every published topic in the
-- language has four example sentences.
--
-- Also here: 明日は寒いでしょう was the first example on BOTH 〜でしょう and
-- 〜だろう, so the topic teaching the plain form demonstrated the polite one.
-- Its text, reading, translation, tokens and audio are all rewritten below;
-- seed 095, which shipped it, has already run and is left alone.
--
-- Additive apart from that one correction, idempotent, safe on a live database.

INSERT INTO sentences (id, language_id, text, reading_kana, level_id, source, published) VALUES
  -- wo-kiniseze — 〜をものともせず
  ('sent-ex-monotomo-1', 'lang-ja', '雨をものともせず、試合を続けた。', 'あめ お ものともせず、しあい お つづけた。', 'lvl-ja-n2', 'authored', true),
  ('sent-ex-monotomo-2', 'lang-ja', '彼は失敗をものともせず、挑戦を続けた。', 'かれ わ しっぱい お ものともせず、ちょうせん お つづけた。', 'lvl-ja-n2', 'authored', true),
  ('sent-ex-monotomo-3', 'lang-ja', '寒さをものともせず、子どもは外で遊んでいる。', 'さむさ お ものともせず、こども わ そと で あそんで いる。', 'lvl-ja-n2', 'authored', true),
  ('sent-ex-monotomo-4', 'lang-ja', '反対をものともせず、彼女は計画を進めた。', 'はんたい お ものともせず、かのじょ わ けいかく お すすめた。', 'lvl-ja-n2', 'authored', true),
  -- wo-yoginaku-sareru — 〜を余儀なくされる
  ('sent-ex-yoginaku-1', 'lang-ja', '台風で試合は中止を余儀なくされた。', 'たいふう で しあい わ ちゅうし お よぎなくされた。', 'lvl-ja-n1', 'authored', true),
  ('sent-ex-yoginaku-2', 'lang-ja', '会社は工場の閉鎖を余儀なくされました。', 'かいしゃ わ こうじょう の へいさ お よぎなくされました。', 'lvl-ja-n1', 'authored', true),
  ('sent-ex-yoginaku-3', 'lang-ja', '病気のため、彼は引退を余儀なくされた。', 'びょうき の ため、かれ わ いんたい お よぎなくされた。', 'lvl-ja-n1', 'authored', true),
  ('sent-ex-yoginaku-4', 'lang-ja', '地震で多くの人が避難を余儀なくされている。', 'じしん で おおく の ひと が ひなん お よぎなくされて いる。', 'lvl-ja-n1', 'authored', true),
  -- tokoro-wo — 〜ところを
  ('sent-ex-tokorowo-1', 'lang-ja', 'お忙しいところをすみません。', 'お いそがしい ところお すみません。', 'lvl-ja-n1', 'authored', true),
  ('sent-ex-tokorowo-2', 'lang-ja', 'お休みのところをすみませんが、少し話せますか。', 'お やすみ の ところお すみません が、すこし はなせます か。', 'lvl-ja-n1', 'authored', true),
  ('sent-ex-tokorowo-3', 'lang-ja', 'お疲れのところを申し訳ありません。', 'お つかれ の ところお もうしわけ ありません。', 'lvl-ja-n1', 'authored', true),
  ('sent-ex-tokorowo-4', 'lang-ja', 'お忙しいところをありがとうございます。', 'お いそがしい ところお ありがとうございます。', 'lvl-ja-n1', 'authored', true),
  -- you-ga-you-ga — 〜うが〜まいが
  ('sent-ex-ugamaiga-1', 'lang-ja', '行こうが行くまいが、私には関係ない。', 'いこう が いく まいが、わたし に わ かんけい ない。', 'lvl-ja-n1', 'authored', true),
  ('sent-ex-ugamaiga-2', 'lang-ja', '雨が降ろうが降るまいが、試合は行われる。', 'あめ が ふろう が ふる まいが、しあい わ おこなわれる。', 'lvl-ja-n1', 'authored', true),
  ('sent-ex-ugamaiga-3', 'lang-ja', '彼が来ようが来まいが、会議は始めます。', 'かれ が こよう が こ まいが、かいぎ わ はじめます。', 'lvl-ja-n1', 'authored', true),
  ('sent-ex-ugamaiga-4', 'lang-ja', '賛成しようがしまいが、決定は変わらない。', 'さんせい しよう が し まいが、けってい わ かわらない。', 'lvl-ja-n1', 'authored', true),
  -- mai — 〜まい
  ('sent-ex-mai-1', 'lang-ja', '二度と同じ失敗はするまい。', 'にどと おなじ しっぱい わ する まい。', 'lvl-ja-n1', 'authored', true),
  ('sent-ex-mai-2', 'lang-ja', 'もう二度とあの店には行くまい。', 'もう にどと あの みせ に わ いく まい。', 'lvl-ja-n1', 'authored', true),
  ('sent-ex-mai-3', 'lang-ja', '彼はもう来るまい。', 'かれ わ もう くる まい。', 'lvl-ja-n1', 'authored', true),
  ('sent-ex-mai-4', 'lang-ja', 'こんな機会は二度とあるまい。', 'こんな きかい わ にどと ある まい。', 'lvl-ja-n1', 'authored', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sentence_translations (id, sentence_id, lang, text, source) VALUES
  ('st-ex-monotomo-1', 'sent-ex-monotomo-1', 'en', 'Undaunted by the rain, they played on.', 'authored'),
  ('st-ex-monotomo-2', 'sent-ex-monotomo-2', 'en', 'Undaunted by failure, he kept trying.', 'authored'),
  ('st-ex-monotomo-3', 'sent-ex-monotomo-3', 'en', 'Undaunted by the cold, the children are playing outside.', 'authored'),
  ('st-ex-monotomo-4', 'sent-ex-monotomo-4', 'en', 'Undaunted by the opposition, she pressed on with the plan.', 'authored'),
  ('st-ex-yoginaku-1', 'sent-ex-yoginaku-1', 'en', 'The typhoon forced the match to be called off.', 'authored'),
  ('st-ex-yoginaku-2', 'sent-ex-yoginaku-2', 'en', 'The company was forced to close the factory.', 'authored'),
  ('st-ex-yoginaku-3', 'sent-ex-yoginaku-3', 'en', 'Illness forced him into retirement.', 'authored'),
  ('st-ex-yoginaku-4', 'sent-ex-yoginaku-4', 'en', 'The earthquake has forced many people to evacuate.', 'authored'),
  ('st-ex-tokorowo-1', 'sent-ex-tokorowo-1', 'en', 'Sorry to trouble you when you are busy.', 'authored'),
  ('st-ex-tokorowo-2', 'sent-ex-tokorowo-2', 'en', 'Sorry to catch you on your day off, but could we talk for a moment?', 'authored'),
  ('st-ex-tokorowo-3', 'sent-ex-tokorowo-3', 'en', 'I am sorry to bother you when you must be tired.', 'authored'),
  ('st-ex-tokorowo-4', 'sent-ex-tokorowo-4', 'en', 'Thank you for your time when you are so busy.', 'authored'),
  ('st-ex-ugamaiga-1', 'sent-ex-ugamaiga-1', 'en', 'Whether he goes or not, it is nothing to do with me.', 'authored'),
  ('st-ex-ugamaiga-2', 'sent-ex-ugamaiga-2', 'en', 'Rain or no rain, the match will be played.', 'authored'),
  ('st-ex-ugamaiga-3', 'sent-ex-ugamaiga-3', 'en', 'Whether he comes or not, we will start the meeting.', 'authored'),
  ('st-ex-ugamaiga-4', 'sent-ex-ugamaiga-4', 'en', 'Whether you agree or not, the decision stands.', 'authored'),
  ('st-ex-mai-1', 'sent-ex-mai-1', 'en', 'I will not make the same mistake twice.', 'authored'),
  ('st-ex-mai-2', 'sent-ex-mai-2', 'en', 'I will never go to that shop again.', 'authored'),
  ('st-ex-mai-3', 'sent-ex-mai-3', 'en', 'He surely will not come now.', 'authored'),
  ('st-ex-mai-4', 'sent-ex-mai-4', 'en', 'A chance like this will surely not come twice.', 'authored')
ON CONFLICT (id) DO NOTHING;

INSERT INTO grammar_point_sentences (grammar_point_id, sentence_id, role, sort_index)
SELECT g.id, s.id, 'example', s.n
FROM (VALUES
  ('wo-kiniseze', 'sent-ex-monotomo-1', 0),
  ('wo-kiniseze', 'sent-ex-monotomo-2', 1),
  ('wo-kiniseze', 'sent-ex-monotomo-3', 2),
  ('wo-kiniseze', 'sent-ex-monotomo-4', 3),
  ('wo-yoginaku-sareru', 'sent-ex-yoginaku-1', 0),
  ('wo-yoginaku-sareru', 'sent-ex-yoginaku-2', 1),
  ('wo-yoginaku-sareru', 'sent-ex-yoginaku-3', 2),
  ('wo-yoginaku-sareru', 'sent-ex-yoginaku-4', 3),
  ('tokoro-wo', 'sent-ex-tokorowo-1', 0),
  ('tokoro-wo', 'sent-ex-tokorowo-2', 1),
  ('tokoro-wo', 'sent-ex-tokorowo-3', 2),
  ('tokoro-wo', 'sent-ex-tokorowo-4', 3),
  ('you-ga-you-ga', 'sent-ex-ugamaiga-1', 0),
  ('you-ga-you-ga', 'sent-ex-ugamaiga-2', 1),
  ('you-ga-you-ga', 'sent-ex-ugamaiga-3', 2),
  ('you-ga-you-ga', 'sent-ex-ugamaiga-4', 3),
  ('mai', 'sent-ex-mai-1', 0),
  ('mai', 'sent-ex-mai-2', 1),
  ('mai', 'sent-ex-mai-3', 2),
  ('mai', 'sent-ex-mai-4', 3)
) AS s(gp, id, n)
JOIN grammar_points g ON g.slug = s.gp AND g.language_id = 'lang-ja'
ON CONFLICT DO NOTHING;

-- 〜だろう taught itself with でしょう.
--
-- Guarded on the old text so a second run changes nothing, and so it cannot
-- overwrite a later correction.
UPDATE sentences
SET text = '明日は寒いだろう。', reading_kana = 'あした わ さむい だろう。'
WHERE id = 'sent-ex-darou-1' AND text = '明日は寒いでしょう。';

UPDATE sentence_translations
SET text = 'It will probably be cold tomorrow.'
WHERE sentence_id = 'sent-ex-darou-1' AND lang = 'en';

-- Tokens are cut from the text, so the rewritten sentence needs new ones.
DELETE FROM sentence_tokens WHERE sentence_id = 'sent-ex-darou-1';

DELETE FROM sentence_tokens WHERE sentence_id IN ('sent-ex-monotomo-1', 'sent-ex-monotomo-2', 'sent-ex-monotomo-3', 'sent-ex-monotomo-4', 'sent-ex-yoginaku-1', 'sent-ex-yoginaku-2', 'sent-ex-yoginaku-3', 'sent-ex-yoginaku-4', 'sent-ex-tokorowo-1', 'sent-ex-tokorowo-2', 'sent-ex-tokorowo-3', 'sent-ex-tokorowo-4', 'sent-ex-ugamaiga-1', 'sent-ex-ugamaiga-2', 'sent-ex-ugamaiga-3', 'sent-ex-ugamaiga-4', 'sent-ex-mai-1', 'sent-ex-mai-2', 'sent-ex-mai-3', 'sent-ex-mai-4', 'sent-ex-darou-1');
INSERT INTO sentence_tokens (id, sentence_id, index, surface, reading, word_id, char_start, char_end, furigana) VALUES
  (gen_random_uuid()::text, 'sent-ex-monotomo-1', 0, '雨', 'あめ', (select id from words where primary_form = '雨' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"雨","r":"あめ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-1', 1, 'を', 'を', NULL, 1, 2, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-1', 2, 'ものともせず', 'ものともせず', NULL, 2, 8, '[{"t":"ものともせず"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-1', 3, '、', '、', NULL, 8, 9, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-1', 4, '試合', 'しあい', (select id from words where primary_form = '試合' and language_id = 'lang-ja' and published order by id limit 1), 9, 11, '[{"t":"試合","r":"しあい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-1', 5, 'を', 'を', NULL, 11, 12, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-1', 6, '続けた', 'つづけた', (select id from words where primary_form = '続ける' and language_id = 'lang-ja' and published order by id limit 1), 12, 15, '[{"t":"続","r":"つづ"},{"t":"けた"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-1', 7, '。', '。', NULL, 15, 16, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-2', 0, '彼', 'かれ', (select id from words where primary_form = '彼' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"彼","r":"かれ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-2', 1, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 1, 2, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-2', 2, '失敗', 'しっぱい', (select id from words where primary_form = '失敗' and language_id = 'lang-ja' and published order by id limit 1), 2, 4, '[{"t":"失敗","r":"しっぱい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-2', 3, 'を', 'を', NULL, 4, 5, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-2', 4, 'ものともせず', 'ものともせず', NULL, 5, 11, '[{"t":"ものともせず"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-2', 5, '、', '、', NULL, 11, 12, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-2', 6, '挑戦', 'ちょうせん', (select id from words where primary_form = '挑戦' and language_id = 'lang-ja' and published order by id limit 1), 12, 14, '[{"t":"挑戦","r":"ちょうせん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-2', 7, 'を', 'を', NULL, 14, 15, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-2', 8, '続けた', 'つづけた', (select id from words where primary_form = '続ける' and language_id = 'lang-ja' and published order by id limit 1), 15, 18, '[{"t":"続","r":"つづ"},{"t":"けた"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-2', 9, '。', '。', NULL, 18, 19, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-3', 0, '寒さをものともせず', 'さむさをものともせず', (select id from words where primary_form = '寒い' and language_id = 'lang-ja' and published order by id limit 1), 0, 9, '[{"t":"寒","r":"さむ"},{"t":"さをものともせず"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-3', 1, '、', '、', NULL, 9, 10, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-3', 2, '子ども', 'こども', (select id from words where primary_form = '子供' and language_id = 'lang-ja' and published order by id limit 1), 10, 13, '[{"t":"子","r":"こ"},{"t":"ども"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-3', 3, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 13, 14, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-3', 4, '外', 'そと', (select id from words where primary_form = '外' and language_id = 'lang-ja' and published order by id limit 1), 14, 15, '[{"t":"外","r":"そと"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-3', 5, 'で', 'で', (select id from words where primary_form = 'で' and language_id = 'lang-ja' and published order by id limit 1), 15, 16, '[{"t":"で"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-3', 6, '遊んで', 'あそんで', (select id from words where primary_form = '遊ぶ' and language_id = 'lang-ja' and published order by id limit 1), 16, 19, '[{"t":"遊","r":"あそ"},{"t":"んで"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-3', 7, 'いる', 'いる', (select id from words where primary_form = '要る' and language_id = 'lang-ja' and published order by id limit 1), 19, 21, '[{"t":"いる"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-3', 8, '。', '。', NULL, 21, 22, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-4', 0, '反対', 'はんたい', (select id from words where primary_form = '反対' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"反対","r":"はんたい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-4', 1, 'を', 'を', NULL, 2, 3, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-4', 2, 'ものともせず', 'ものともせず', NULL, 3, 9, '[{"t":"ものともせず"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-4', 3, '、', '、', NULL, 9, 10, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-4', 4, '彼女', 'かのじょ', (select id from words where primary_form = '彼女' and language_id = 'lang-ja' and published order by id limit 1), 10, 12, '[{"t":"彼女","r":"かのじょ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-4', 5, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 12, 13, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-4', 6, '計画', 'けいかく', (select id from words where primary_form = '計画' and language_id = 'lang-ja' and published order by id limit 1), 13, 15, '[{"t":"計画","r":"けいかく"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-4', 7, 'を', 'を', NULL, 15, 16, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-4', 8, '進めた', 'すすめた', (select id from words where primary_form = '進める' and language_id = 'lang-ja' and published order by id limit 1), 16, 19, '[{"t":"進","r":"すす"},{"t":"めた"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-monotomo-4', 9, '。', '。', NULL, 19, 20, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-1', 0, '台風', 'たいふう', (select id from words where primary_form = '台風' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"台風","r":"たいふう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-1', 1, 'で', 'で', (select id from words where primary_form = 'で' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"で"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-1', 2, '試合', 'しあい', (select id from words where primary_form = '試合' and language_id = 'lang-ja' and published order by id limit 1), 3, 5, '[{"t":"試合","r":"しあい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-1', 3, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 5, 6, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-1', 4, '中止', 'ちゅうし', (select id from words where primary_form = '中止' and language_id = 'lang-ja' and published order by id limit 1), 6, 8, '[{"t":"中止","r":"ちゅうし"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-1', 5, 'を', 'を', NULL, 8, 9, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-1', 6, '余儀なくされた', 'よぎなくされた', NULL, 9, 16, '[{"t":"余儀","r":"よぎ"},{"t":"なくされた"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-1', 7, '。', '。', NULL, 16, 17, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-2', 0, '会社', 'かいしゃ', (select id from words where primary_form = '会社' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"会社","r":"かいしゃ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-2', 1, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-2', 2, '工場', 'こうじょう', (select id from words where primary_form = '工場' and language_id = 'lang-ja' and published order by id limit 1), 3, 5, '[{"t":"工場","r":"こうじょう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-2', 3, 'の', 'の', NULL, 5, 6, '[{"t":"の"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-2', 4, '閉鎖', 'へいさ', (select id from words where primary_form = '閉鎖' and language_id = 'lang-ja' and published order by id limit 1), 6, 8, '[{"t":"閉鎖","r":"へいさ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-2', 5, 'を', 'を', NULL, 8, 9, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-2', 6, '余儀なくされました', 'よぎなくされました', NULL, 9, 18, '[{"t":"余儀","r":"よぎ"},{"t":"なくされました"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-2', 7, '。', '。', NULL, 18, 19, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-3', 0, '病気', 'びょうき', (select id from words where primary_form = '病気' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"病気","r":"びょうき"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-3', 1, 'の', 'の', NULL, 2, 3, '[{"t":"の"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-3', 2, 'ため', 'ため', (select id from words where primary_form = '為' and language_id = 'lang-ja' and published order by id limit 1), 3, 5, '[{"t":"ため"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-3', 3, '、', '、', NULL, 5, 6, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-3', 4, '彼', 'かれ', (select id from words where primary_form = '彼' and language_id = 'lang-ja' and published order by id limit 1), 6, 7, '[{"t":"彼","r":"かれ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-3', 5, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 7, 8, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-3', 6, '引退', 'いんたい', (select id from words where primary_form = '引退' and language_id = 'lang-ja' and published order by id limit 1), 8, 10, '[{"t":"引退","r":"いんたい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-3', 7, 'を', 'を', NULL, 10, 11, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-3', 8, '余儀なくされた', 'よぎなくされた', NULL, 11, 18, '[{"t":"余儀","r":"よぎ"},{"t":"なくされた"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-3', 9, '。', '。', NULL, 18, 19, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-4', 0, '地震', 'じしん', (select id from words where primary_form = '地震' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"地震","r":"じしん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-4', 1, 'で', 'で', (select id from words where primary_form = 'で' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"で"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-4', 2, '多くの', 'おおくの', (select id from words where primary_form = '多い' and language_id = 'lang-ja' and published order by id limit 1), 3, 6, '[{"t":"多","r":"おお"},{"t":"くの"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-4', 3, '人', 'ひと', (select id from words where primary_form = '人' and language_id = 'lang-ja' and published order by id limit 1), 6, 7, '[{"t":"人","r":"ひと"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-4', 4, 'が', 'が', NULL, 7, 8, '[{"t":"が"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-4', 5, '避難', 'ひなん', (select id from words where primary_form = '避難' and language_id = 'lang-ja' and published order by id limit 1), 8, 10, '[{"t":"避難","r":"ひなん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-4', 6, 'を', 'を', NULL, 10, 11, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-4', 7, '余儀なくされて', 'よぎなくされて', NULL, 11, 18, '[{"t":"余儀","r":"よぎ"},{"t":"なくされて"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-4', 8, 'いる', 'いる', (select id from words where primary_form = '要る' and language_id = 'lang-ja' and published order by id limit 1), 18, 20, '[{"t":"いる"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-yoginaku-4', 9, '。', '。', NULL, 20, 21, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-1', 0, 'お', 'お', NULL, 0, 1, '[{"t":"お"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-1', 1, '忙しい', 'いそがしい', (select id from words where primary_form = '忙しい' and language_id = 'lang-ja' and published order by id limit 1), 1, 4, '[{"t":"忙","r":"いそが"},{"t":"しい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-1', 2, 'ところを', 'ところを', NULL, 4, 8, '[{"t":"ところを"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-1', 3, 'すみません', 'すみません', NULL, 8, 13, '[{"t":"すみません"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-1', 4, '。', '。', NULL, 13, 14, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-2', 0, 'お休み', 'おやすみ', (select id from words where primary_form = 'お休み' and language_id = 'lang-ja' and published order by id limit 1), 0, 3, '[{"t":"お"},{"t":"休","r":"やす"},{"t":"み"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-2', 1, 'の', 'の', NULL, 3, 4, '[{"t":"の"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-2', 2, 'ところを', 'ところを', NULL, 4, 8, '[{"t":"ところを"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-2', 3, 'すみません', 'すみません', NULL, 8, 13, '[{"t":"すみません"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-2', 4, 'が', 'が', NULL, 13, 14, '[{"t":"が"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-2', 5, '、', '、', NULL, 14, 15, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-2', 6, '少し', 'すこし', (select id from words where primary_form = '少し' and language_id = 'lang-ja' and published order by id limit 1), 15, 17, '[{"t":"少","r":"すこ"},{"t":"し"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-2', 7, '話せ', 'はなせ', (select id from words where primary_form = '話す' and language_id = 'lang-ja' and published order by id limit 1), 17, 19, '[{"t":"話","r":"はな"},{"t":"せ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-2', 8, 'ます', 'ます', NULL, 19, 21, '[{"t":"ます"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-2', 9, 'か', 'か', (select id from words where primary_form = 'か' and language_id = 'lang-ja' and published order by id limit 1), 21, 22, '[{"t":"か"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-2', 10, '。', '。', NULL, 22, 23, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-3', 0, 'お', 'お', NULL, 0, 1, '[{"t":"お"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-3', 1, '疲れ', 'つかれ', (select id from words where primary_form = '疲れ' and language_id = 'lang-ja' and published order by id limit 1), 1, 3, '[{"t":"疲","r":"つか"},{"t":"れ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-3', 2, 'の', 'の', NULL, 3, 4, '[{"t":"の"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-3', 3, 'ところを', 'ところを', NULL, 4, 8, '[{"t":"ところを"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-3', 4, '申し訳', 'もうしわけ', (select id from words where primary_form = '申し訳' and language_id = 'lang-ja' and published order by id limit 1), 8, 11, '[{"t":"申","r":"もう"},{"t":"し"},{"t":"訳","r":"わけ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-3', 5, 'ありません', 'ありません', (select id from words where primary_form = '有る' and language_id = 'lang-ja' and published order by id limit 1), 11, 16, '[{"t":"ありません"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-3', 6, '。', '。', NULL, 16, 17, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-4', 0, 'お', 'お', NULL, 0, 1, '[{"t":"お"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-4', 1, '忙しい', 'いそがしい', (select id from words where primary_form = '忙しい' and language_id = 'lang-ja' and published order by id limit 1), 1, 4, '[{"t":"忙","r":"いそが"},{"t":"しい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-4', 2, 'ところを', 'ところを', NULL, 4, 8, '[{"t":"ところを"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-4', 3, 'ありがとうございます', 'ありがとうございます', NULL, 8, 18, '[{"t":"ありがとうございます"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-tokorowo-4', 4, '。', '。', NULL, 18, 19, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-1', 0, '行こう', 'いこう', (select id from words where primary_form = '行く' and language_id = 'lang-ja' and published order by id limit 1), 0, 3, '[{"t":"行","r":"い"},{"t":"こう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-1', 1, 'が', 'が', NULL, 3, 4, '[{"t":"が"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-1', 2, '行く', 'いく', (select id from words where primary_form = '行く' and language_id = 'lang-ja' and published order by id limit 1), 4, 6, '[{"t":"行","r":"い"},{"t":"く"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-1', 3, 'まいが', 'まいが', NULL, 6, 9, '[{"t":"まいが"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-1', 4, '、', '、', NULL, 9, 10, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-1', 5, '私', 'わたし', (select id from words where primary_form = '私' and language_id = 'lang-ja' and published order by id limit 1), 10, 11, '[{"t":"私","r":"わたし"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-1', 6, 'に', 'に', (select id from words where primary_form = 'に' and language_id = 'lang-ja' and published order by id limit 1), 11, 12, '[{"t":"に"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-1', 7, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 12, 13, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-1', 8, '関係', 'かんけい', (select id from words where primary_form = '関係' and language_id = 'lang-ja' and published order by id limit 1), 13, 15, '[{"t":"関係","r":"かんけい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-1', 9, 'ない', 'ない', (select id from words where primary_form = 'ない' and language_id = 'lang-ja' and published order by id limit 1), 15, 17, '[{"t":"ない"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-1', 10, '。', '。', NULL, 17, 18, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-2', 0, '雨', 'あめ', (select id from words where primary_form = '雨' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"雨","r":"あめ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-2', 1, 'が', 'が', NULL, 1, 2, '[{"t":"が"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-2', 2, '降ろう', 'ふろう', (select id from words where primary_form = '降る' and language_id = 'lang-ja' and published order by id limit 1), 2, 5, '[{"t":"降","r":"ふ"},{"t":"ろう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-2', 3, 'が', 'が', NULL, 5, 6, '[{"t":"が"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-2', 4, '降る', 'ふる', (select id from words where primary_form = '降る' and language_id = 'lang-ja' and published order by id limit 1), 6, 8, '[{"t":"降","r":"ふ"},{"t":"る"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-2', 5, 'まいが', 'まいが', NULL, 8, 11, '[{"t":"まいが"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-2', 6, '、', '、', NULL, 11, 12, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-2', 7, '試合', 'しあい', (select id from words where primary_form = '試合' and language_id = 'lang-ja' and published order by id limit 1), 12, 14, '[{"t":"試合","r":"しあい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-2', 8, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 14, 15, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-2', 9, '行われる', 'おこなわれる', (select id from words where primary_form = '行う' and language_id = 'lang-ja' and published order by id limit 1), 15, 19, '[{"t":"行","r":"おこな"},{"t":"われる"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-2', 10, '。', '。', NULL, 19, 20, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-3', 0, '彼', 'かれ', (select id from words where primary_form = '彼' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"彼","r":"かれ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-3', 1, 'が', 'が', NULL, 1, 2, '[{"t":"が"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-3', 2, '来よう', 'こよう', (select id from words where primary_form = '来る' and language_id = 'lang-ja' and published order by id limit 1), 2, 5, '[{"t":"来","r":"こ"},{"t":"よう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-3', 3, 'が', 'が', NULL, 5, 6, '[{"t":"が"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-3', 4, '来', 'こ', (select id from words where primary_form = '来' and language_id = 'lang-ja' and published order by id limit 1), 6, 7, '[{"t":"来","r":"こ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-3', 5, 'まいが', 'まいが', NULL, 7, 10, '[{"t":"まいが"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-3', 6, '、', '、', NULL, 10, 11, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-3', 7, '会議', 'かいぎ', (select id from words where primary_form = '会議' and language_id = 'lang-ja' and published order by id limit 1), 11, 13, '[{"t":"会議","r":"かいぎ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-3', 8, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 13, 14, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-3', 9, '始めます', 'はじめます', (select id from words where primary_form = '始める' and language_id = 'lang-ja' and published order by id limit 1), 14, 18, '[{"t":"始","r":"はじ"},{"t":"めます"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-3', 10, '。', '。', NULL, 18, 19, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-4', 0, '賛成しよう', 'さんせいしよう', (select id from words where primary_form = '賛成' and language_id = 'lang-ja' and published order by id limit 1), 0, 5, '[{"t":"賛成","r":"さんせい"},{"t":"しよう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-4', 1, 'が', 'が', NULL, 5, 6, '[{"t":"が"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-4', 2, 'し', 'し', (select id from words where primary_form = 'し' and language_id = 'lang-ja' and published order by id limit 1), 6, 7, '[{"t":"し"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-4', 3, 'まいが', 'まいが', NULL, 7, 10, '[{"t":"まいが"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-4', 4, '、', '、', NULL, 10, 11, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-4', 5, '決定', 'けってい', (select id from words where primary_form = '決定' and language_id = 'lang-ja' and published order by id limit 1), 11, 13, '[{"t":"決定","r":"けってい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-4', 6, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 13, 14, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-4', 7, '変わらない', 'かわらない', (select id from words where primary_form = '変わる' and language_id = 'lang-ja' and published order by id limit 1), 14, 19, '[{"t":"変","r":"か"},{"t":"わらない"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ugamaiga-4', 8, '。', '。', NULL, 19, 20, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-1', 0, '二度', 'にど', (select id from words where primary_form = '再び' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"二度","r":"にど"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-1', 1, 'と', 'と', (select id from words where primary_form = 'と' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"と"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-1', 2, '同じ', 'おなじ', (select id from words where primary_form = '同じ' and language_id = 'lang-ja' and published order by id limit 1), 3, 5, '[{"t":"同","r":"おな"},{"t":"じ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-1', 3, '失敗', 'しっぱい', (select id from words where primary_form = '失敗' and language_id = 'lang-ja' and published order by id limit 1), 5, 7, '[{"t":"失敗","r":"しっぱい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-1', 4, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 7, 8, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-1', 5, 'する', 'する', (select id from words where primary_form = '為る' and language_id = 'lang-ja' and published order by id limit 1), 8, 10, '[{"t":"する"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-1', 6, 'まい', 'まい', NULL, 10, 12, '[{"t":"まい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-1', 7, '。', '。', NULL, 12, 13, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-2', 0, 'もう', 'もう', (select id from words where primary_form = 'もう' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"もう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-2', 1, '二度', 'にど', (select id from words where primary_form = '再び' and language_id = 'lang-ja' and published order by id limit 1), 2, 4, '[{"t":"二度","r":"にど"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-2', 2, 'と', 'と', (select id from words where primary_form = 'と' and language_id = 'lang-ja' and published order by id limit 1), 4, 5, '[{"t":"と"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-2', 3, 'あの', 'あの', (select id from words where primary_form = 'あの' and language_id = 'lang-ja' and published order by id limit 1), 5, 7, '[{"t":"あの"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-2', 4, '店', 'みせ', (select id from words where primary_form = '店' and language_id = 'lang-ja' and published order by id limit 1), 7, 8, '[{"t":"店","r":"みせ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-2', 5, 'に', 'に', (select id from words where primary_form = 'に' and language_id = 'lang-ja' and published order by id limit 1), 8, 9, '[{"t":"に"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-2', 6, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 9, 10, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-2', 7, '行く', 'いく', (select id from words where primary_form = '行く' and language_id = 'lang-ja' and published order by id limit 1), 10, 12, '[{"t":"行","r":"い"},{"t":"く"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-2', 8, 'まい', 'まい', NULL, 12, 14, '[{"t":"まい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-2', 9, '。', '。', NULL, 14, 15, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-3', 0, '彼', 'かれ', (select id from words where primary_form = '彼' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"彼","r":"かれ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-3', 1, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 1, 2, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-3', 2, 'もう', 'もう', (select id from words where primary_form = 'もう' and language_id = 'lang-ja' and published order by id limit 1), 2, 4, '[{"t":"もう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-3', 3, '来る', 'くる', (select id from words where primary_form = '来る' and language_id = 'lang-ja' and published order by id limit 1), 4, 6, '[{"t":"来","r":"く"},{"t":"る"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-3', 4, 'まい', 'まい', NULL, 6, 8, '[{"t":"まい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-3', 5, '。', '。', NULL, 8, 9, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-4', 0, 'こんな', 'こんな', (select id from words where primary_form = 'こんな' and language_id = 'lang-ja' and published order by id limit 1), 0, 3, '[{"t":"こんな"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-4', 1, '機会', 'きかい', (select id from words where primary_form = '機会' and language_id = 'lang-ja' and published order by id limit 1), 3, 5, '[{"t":"機会","r":"きかい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-4', 2, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 5, 6, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-4', 3, '二度', 'にど', (select id from words where primary_form = '再び' and language_id = 'lang-ja' and published order by id limit 1), 6, 8, '[{"t":"二度","r":"にど"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-4', 4, 'と', 'と', (select id from words where primary_form = 'と' and language_id = 'lang-ja' and published order by id limit 1), 8, 9, '[{"t":"と"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-4', 5, 'ある', 'ある', (select id from words where primary_form = '有る' and language_id = 'lang-ja' and published order by id limit 1), 9, 11, '[{"t":"ある"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-4', 6, 'まい', 'まい', NULL, 11, 13, '[{"t":"まい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mai-4', 7, '。', '。', NULL, 13, 14, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-darou-1', 0, '明日', 'あした', (select id from words where primary_form = '明日' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"明日","r":"あした"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-darou-1', 1, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-darou-1', 2, '寒い', 'さむい', (select id from words where primary_form = '寒い' and language_id = 'lang-ja' and published order by id limit 1), 3, 5, '[{"t":"寒","r":"さむ"},{"t":"い"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-darou-1', 3, 'だろう', 'だろう', NULL, 5, 8, '[{"t":"だろう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-darou-1', 4, '。', '。', NULL, 8, 9, '[{"t":"。"}]'::jsonb);
