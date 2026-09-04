-- N5 example sentences, batch 10: counters, 何か, iAdj〜くて, frequency adverbs,
-- 〜なさい, 〜も〜も, 時々, and 〜と言いました.
--
-- The counter topics are written around the number-and-counter combinations the
-- dictionary actually holds — 一つ, 二つ, 三つ, 一人, 二人. Those are single
-- entries with their own irregular readings (ひとり, not いちにん), which is
-- exactly why they tokenise. 二時, 十時, 五時, 五分 and 三人 are NOT entries and
-- split as 二 | 時 and 五 | 分.
--
-- So 時 / 分 has no lesson here. Only 一時 is a word, and four sentences all
-- using 一時 would teach the counter by repeating one example of it. 〜くて (as
-- a reason) takes its place, and the counter topics wait for the number-plus-
-- counter forms to be indexed the way the grammar patterns now are.
--
-- Additive, idempotent, safe on a live database.

INSERT INTO sentences (id, language_id, text, reading_kana, level_id, source, published) VALUES
  -- counter-tsu
  ('sent-ex-countertsu-1', 'lang-ja', '一つください。', 'ひとつ ください。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-countertsu-2', 'lang-ja', '二つ買います。', 'ふたつ かいます。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-countertsu-3', 'lang-ja', '三つあります。', 'みっつ あります。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-countertsu-4', 'lang-ja', '一つ食べます。', 'ひとつ たべます。', 'lvl-ja-n5', 'authored', true),
  -- counter-nin
  ('sent-ex-counternin-1', 'lang-ja', '一人で行きます。', 'ひとり で いきます。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-counternin-2', 'lang-ja', '二人で食べます。', 'ふたり で たべます。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-counternin-3', 'lang-ja', '一人で住んでいます。', 'ひとり で すんで います。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-counternin-4', 'lang-ja', '二人で来ました。', 'ふたり で きました。', 'lvl-ja-n5', 'authored', true),
  -- nakute
  ('sent-ex-nakute-1', 'lang-ja', '寒くて行きませんでした。', 'さむくて いきません でした。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-nakute-2', 'lang-ja', '高くて買いませんでした。', 'たかくて かいません でした。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-nakute-3', 'lang-ja', '忙しくて休みませんでした。', 'いそがしくて やすみません でした。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-nakute-4', 'lang-ja', '暑くて寝ませんでした。', 'あつくて ねません でした。', 'lvl-ja-n5', 'authored', true),
  -- nani-ka
  ('sent-ex-nanika-1', 'lang-ja', '何か食べます。', 'なに か たべます。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-nanika-2', 'lang-ja', '何か買います。', 'なに か かいます。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-nanika-3', 'lang-ja', '何か飲みますか。', 'なに か のみます か。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-nanika-4', 'lang-ja', '何か欲しいですか。', 'なに か ほしい です か。', 'lvl-ja-n5', 'authored', true),
  -- te-adjective
  ('sent-ex-teadj-1', 'lang-ja', '安くて新しいです。', 'やすくて あたらしい です。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-teadj-2', 'lang-ja', '高くて古いです。', 'たかくて ふるい です。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-teadj-3', 'lang-ja', '大きくて綺麗です。', 'おおきくて きれい です。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-teadj-4', 'lang-ja', '小さくて安いです。', 'ちいさくて やすい です。', 'lvl-ja-n5', 'authored', true),
  -- frequency-adverbs
  ('sent-ex-freqadv-1', 'lang-ja', 'よく食べます。', 'よく たべます。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-freqadv-2', 'lang-ja', '時々行きます。', 'ときどき いきます。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-freqadv-3', 'lang-ja', 'いつも勉強します。', 'いつも べんきょう します。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-freqadv-4', 'lang-ja', 'たまに休みます。', 'たまに やすみます。', 'lvl-ja-n5', 'authored', true),
  -- nasai
  ('sent-ex-nasai-1', 'lang-ja', '早く寝なさい。', 'はやく ねなさい。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-nasai-2', 'lang-ja', '勉強しなさい。', 'べんきょう しなさい。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-nasai-3', 'lang-ja', '食べなさい。', 'たべなさい。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-nasai-4', 'lang-ja', '起きなさい。', 'おきなさい。', 'lvl-ja-n5', 'authored', true),
  -- mo-mo
  ('sent-ex-momo-1', 'lang-ja', '魚も肉も食べます。', 'さかな も にく も たべます。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-momo-2', 'lang-ja', '本も新聞も読みます。', 'ほん も しんぶん も よみます。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-momo-3', 'lang-ja', '海も山も好きです。', 'うみ も やま も すき です。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-momo-4', 'lang-ja', '靴も服も買います。', 'くつ も ふく も かいます。', 'lvl-ja-n5', 'authored', true),
  -- toki-doki-place
  ('sent-ex-tokidoki-1', 'lang-ja', '時々海へ行きます。', 'ときどき うみ え いきます。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-tokidoki-2', 'lang-ja', '時々映画を見ます。', 'ときどき えいが お みます。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-tokidoki-3', 'lang-ja', '時々店で買います。', 'ときどき みせ で かいます。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-tokidoki-4', 'lang-ja', '時々料理を作ります。', 'ときどき りょうり お つくります。', 'lvl-ja-n5', 'authored', true),
  -- to-quotation
  ('sent-ex-toquote-1', 'lang-ja', '安いと言いました。', 'やすい と いいました。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-toquote-2', 'lang-ja', '行くと言いました。', 'いく と いいました。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-toquote-3', 'lang-ja', '好きだと言いました。', 'すき だ と いいました。', 'lvl-ja-n5', 'authored', true),
  ('sent-ex-toquote-4', 'lang-ja', '来ると言いました。', 'くる と いいました。', 'lvl-ja-n5', 'authored', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sentence_translations (id, sentence_id, lang, text, source) VALUES
  ('st-ex-countertsu-1', 'sent-ex-countertsu-1', 'en', 'One, please.', 'authored'),
  ('st-ex-countertsu-2', 'sent-ex-countertsu-2', 'en', 'I will buy two.', 'authored'),
  ('st-ex-countertsu-3', 'sent-ex-countertsu-3', 'en', 'There are three.', 'authored'),
  ('st-ex-countertsu-4', 'sent-ex-countertsu-4', 'en', 'I will eat one.', 'authored'),
  ('st-ex-counternin-1', 'sent-ex-counternin-1', 'en', 'I am going on my own.', 'authored'),
  ('st-ex-counternin-2', 'sent-ex-counternin-2', 'en', 'The two of us will eat.', 'authored'),
  ('st-ex-counternin-3', 'sent-ex-counternin-3', 'en', 'I live alone.', 'authored'),
  ('st-ex-counternin-4', 'sent-ex-counternin-4', 'en', 'The two of us came.', 'authored'),
  ('st-ex-nakute-1', 'sent-ex-nakute-1', 'en', 'It was cold, so I did not go.', 'authored'),
  ('st-ex-nakute-2', 'sent-ex-nakute-2', 'en', 'It was expensive, so I did not buy it.', 'authored'),
  ('st-ex-nakute-3', 'sent-ex-nakute-3', 'en', 'I was busy, so I did not rest.', 'authored'),
  ('st-ex-nakute-4', 'sent-ex-nakute-4', 'en', 'It was hot, so I did not sleep.', 'authored'),
  ('st-ex-nanika-1', 'sent-ex-nanika-1', 'en', 'I will eat something.', 'authored'),
  ('st-ex-nanika-2', 'sent-ex-nanika-2', 'en', 'I will buy something.', 'authored'),
  ('st-ex-nanika-3', 'sent-ex-nanika-3', 'en', 'Would you like something to drink?', 'authored'),
  ('st-ex-nanika-4', 'sent-ex-nanika-4', 'en', 'Do you want anything?', 'authored'),
  ('st-ex-teadj-1', 'sent-ex-teadj-1', 'en', 'It is cheap and new.', 'authored'),
  ('st-ex-teadj-2', 'sent-ex-teadj-2', 'en', 'It is expensive and old.', 'authored'),
  ('st-ex-teadj-3', 'sent-ex-teadj-3', 'en', 'It is big and beautiful.', 'authored'),
  ('st-ex-teadj-4', 'sent-ex-teadj-4', 'en', 'It is small and cheap.', 'authored'),
  ('st-ex-freqadv-1', 'sent-ex-freqadv-1', 'en', 'I eat it often.', 'authored'),
  ('st-ex-freqadv-2', 'sent-ex-freqadv-2', 'en', 'I go sometimes.', 'authored'),
  ('st-ex-freqadv-3', 'sent-ex-freqadv-3', 'en', 'I always study.', 'authored'),
  ('st-ex-freqadv-4', 'sent-ex-freqadv-4', 'en', 'I take a day off occasionally.', 'authored'),
  ('st-ex-nasai-1', 'sent-ex-nasai-1', 'en', 'Go to bed early.', 'authored'),
  ('st-ex-nasai-2', 'sent-ex-nasai-2', 'en', 'Study.', 'authored'),
  ('st-ex-nasai-3', 'sent-ex-nasai-3', 'en', 'Eat.', 'authored'),
  ('st-ex-nasai-4', 'sent-ex-nasai-4', 'en', 'Get up.', 'authored'),
  ('st-ex-momo-1', 'sent-ex-momo-1', 'en', 'I eat both fish and meat.', 'authored'),
  ('st-ex-momo-2', 'sent-ex-momo-2', 'en', 'I read both books and newspapers.', 'authored'),
  ('st-ex-momo-3', 'sent-ex-momo-3', 'en', 'I like both the sea and the mountains.', 'authored'),
  ('st-ex-momo-4', 'sent-ex-momo-4', 'en', 'I buy both shoes and clothes.', 'authored'),
  ('st-ex-tokidoki-1', 'sent-ex-tokidoki-1', 'en', 'I sometimes go to the sea.', 'authored'),
  ('st-ex-tokidoki-2', 'sent-ex-tokidoki-2', 'en', 'I sometimes watch a film.', 'authored'),
  ('st-ex-tokidoki-3', 'sent-ex-tokidoki-3', 'en', 'I sometimes buy it at the shop.', 'authored'),
  ('st-ex-tokidoki-4', 'sent-ex-tokidoki-4', 'en', 'I sometimes cook.', 'authored'),
  ('st-ex-toquote-1', 'sent-ex-toquote-1', 'en', 'He said it was cheap.', 'authored'),
  ('st-ex-toquote-2', 'sent-ex-toquote-2', 'en', 'He said he would go.', 'authored'),
  ('st-ex-toquote-3', 'sent-ex-toquote-3', 'en', 'She said she liked it.', 'authored'),
  ('st-ex-toquote-4', 'sent-ex-toquote-4', 'en', 'He said he would come.', 'authored')
ON CONFLICT (id) DO NOTHING;

INSERT INTO grammar_point_sentences (grammar_point_id, sentence_id, role, sort_index)
SELECT g.id, s.id, 'example', s.n
FROM (VALUES
  ('counter-tsu', 'sent-ex-countertsu-1', 0),
  ('counter-tsu', 'sent-ex-countertsu-2', 1),
  ('counter-tsu', 'sent-ex-countertsu-3', 2),
  ('counter-tsu', 'sent-ex-countertsu-4', 3),
  ('counter-nin', 'sent-ex-counternin-1', 0),
  ('counter-nin', 'sent-ex-counternin-2', 1),
  ('counter-nin', 'sent-ex-counternin-3', 2),
  ('counter-nin', 'sent-ex-counternin-4', 3),
  ('nakute', 'sent-ex-nakute-1', 0),
  ('nakute', 'sent-ex-nakute-2', 1),
  ('nakute', 'sent-ex-nakute-3', 2),
  ('nakute', 'sent-ex-nakute-4', 3),
  ('nani-ka', 'sent-ex-nanika-1', 0),
  ('nani-ka', 'sent-ex-nanika-2', 1),
  ('nani-ka', 'sent-ex-nanika-3', 2),
  ('nani-ka', 'sent-ex-nanika-4', 3),
  ('te-adjective', 'sent-ex-teadj-1', 0),
  ('te-adjective', 'sent-ex-teadj-2', 1),
  ('te-adjective', 'sent-ex-teadj-3', 2),
  ('te-adjective', 'sent-ex-teadj-4', 3),
  ('frequency-adverbs', 'sent-ex-freqadv-1', 0),
  ('frequency-adverbs', 'sent-ex-freqadv-2', 1),
  ('frequency-adverbs', 'sent-ex-freqadv-3', 2),
  ('frequency-adverbs', 'sent-ex-freqadv-4', 3),
  ('nasai', 'sent-ex-nasai-1', 0),
  ('nasai', 'sent-ex-nasai-2', 1),
  ('nasai', 'sent-ex-nasai-3', 2),
  ('nasai', 'sent-ex-nasai-4', 3),
  ('mo-mo', 'sent-ex-momo-1', 0),
  ('mo-mo', 'sent-ex-momo-2', 1),
  ('mo-mo', 'sent-ex-momo-3', 2),
  ('mo-mo', 'sent-ex-momo-4', 3),
  ('toki-doki-place', 'sent-ex-tokidoki-1', 0),
  ('toki-doki-place', 'sent-ex-tokidoki-2', 1),
  ('toki-doki-place', 'sent-ex-tokidoki-3', 2),
  ('toki-doki-place', 'sent-ex-tokidoki-4', 3),
  ('to-quotation', 'sent-ex-toquote-1', 0),
  ('to-quotation', 'sent-ex-toquote-2', 1),
  ('to-quotation', 'sent-ex-toquote-3', 2),
  ('to-quotation', 'sent-ex-toquote-4', 3)
) AS s(slug, id, n)
JOIN grammar_points g ON g.language_id = 'lang-ja' AND g.slug = s.slug
ON CONFLICT (grammar_point_id, sentence_id, role) DO NOTHING;

-- The tokens. `tokenise:authored` is a dev script and production runs only
-- migrations and seeds; the quiz derivation cuts its chips from these rows.

-- The tokens. `tokenise:authored` is a dev script and production runs only
-- migrations and seeds; the quiz derivation cuts its chips from these rows.
DELETE FROM sentence_tokens WHERE sentence_id IN ('sent-ex-nakute-1', 'sent-ex-nakute-2', 'sent-ex-nakute-3', 'sent-ex-nakute-4');
INSERT INTO sentence_tokens (id, sentence_id, index, surface, reading, word_id, char_start, char_end, furigana) VALUES
  (gen_random_uuid()::text, 'sent-ex-nakute-1', 0, '寒くて', 'さむくて', (select id from words where primary_form = '寒い' and language_id = 'lang-ja' and published order by id limit 1), 0, 3, '[{"t":"寒","r":"さむ"},{"t":"くて"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nakute-1', 1, '行きませんでした', 'いきませんでした', (select id from words where primary_form = '行く' and language_id = 'lang-ja' and published order by id limit 1), 3, 11, '[{"t":"行","r":"い"},{"t":"きませんでした"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nakute-1', 2, '。', '。', NULL, 11, 12, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nakute-2', 0, '高くて', 'たかくて', (select id from words where primary_form = '高まる' and language_id = 'lang-ja' and published order by id limit 1), 0, 3, '[{"t":"高","r":"たか"},{"t":"くて"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nakute-2', 1, '買いませんでした', 'かいませんでした', (select id from words where primary_form = '買う' and language_id = 'lang-ja' and published order by id limit 1), 3, 11, '[{"t":"買","r":"か"},{"t":"いませんでした"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nakute-2', 2, '。', '。', NULL, 11, 12, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nakute-3', 0, '忙しくて', 'いそがしくて', (select id from words where primary_form = '忙しい' and language_id = 'lang-ja' and published order by id limit 1), 0, 4, '[{"t":"忙","r":"いそが"},{"t":"しくて"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nakute-3', 1, '休みませんでした', 'やすみませんでした', (select id from words where primary_form = '休む' and language_id = 'lang-ja' and published order by id limit 1), 4, 12, '[{"t":"休","r":"やす"},{"t":"みませんでした"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nakute-3', 2, '。', '。', NULL, 12, 13, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nakute-4', 0, '暑くて', 'あつくて', (select id from words where primary_form = '暑い' and language_id = 'lang-ja' and published order by id limit 1), 0, 3, '[{"t":"暑","r":"あつ"},{"t":"くて"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nakute-4', 1, '寝ませんでした', 'ねませんでした', (select id from words where primary_form = '寝る' and language_id = 'lang-ja' and published order by id limit 1), 3, 10, '[{"t":"寝","r":"ね"},{"t":"ませんでした"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nakute-4', 2, '。', '。', NULL, 10, 11, '[{"t":"。"}]'::jsonb);
