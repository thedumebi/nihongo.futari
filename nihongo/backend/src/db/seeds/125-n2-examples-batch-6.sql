-- N2 example sentences, batch 6: four suffixes, and what is left uncovered.
--
-- 〜上 ("as far as X goes"), 〜げ (the look of a feeling), 〜まみれ (covered
-- in) and 〜ずくめ (nothing but). Four topics, 16 sentences.
--
-- 〜上 needs a KATAKANA noun in front of it, for exactly the reason 〜中 did
-- in N3 batch 4: 規則上 is one unbroken run of kanji, `splitReading` puts the
-- whole run's reading on its first character, and 上 shipped with no ruby at
-- all — invisible to `check:examples`, which sees correct segmentation.
-- ルール上, データ上, スケジュール上 and デザイン上 break the run.
--
-- STILL UNCOVERED after this batch: 〜をものともせず (slug wo-kiniseze), for
-- the reason recorded in seed 115 — せず, the literary negative of する,
-- shreds to せ|ず in every spelling tried, and the only forms that cut clean
-- (ものともしない, ものともしないで) are not the form the topic teaches. It
-- needs a lexicon entry for せず, which is a vocabulary import and not
-- something a seed should attempt. Every other published N2 topic now has its
-- four examples: 54 of 55.
--
-- Additive, idempotent, safe on a live database.

INSERT INTO sentences (id, language_id, text, reading_kana, level_id, source, published) VALUES
  -- jou
  ('sent-ex-jou-1', 'lang-ja', 'ルール上、できません。', 'ルール じょう、できません。', 'lvl-ja-n2', 'authored', true),
  ('sent-ex-jou-2', 'lang-ja', 'データ上、問題はありません。', 'データ じょう、もんだい わ ありません。', 'lvl-ja-n2', 'authored', true),
  ('sent-ex-jou-3', 'lang-ja', 'スケジュール上、無理です。', 'スケジュール じょう、むり です。', 'lvl-ja-n2', 'authored', true),
  ('sent-ex-jou-4', 'lang-ja', 'デザイン上の問題です。', 'デザイン じょう の もんだい です。', 'lvl-ja-n2', 'authored', true),
  -- ge
  ('sent-ex-ge-1', 'lang-ja', '彼は嬉しげに笑った。', 'かれ わ うれしげ に わらった。', 'lvl-ja-n2', 'authored', true),
  ('sent-ex-ge-2', 'lang-ja', '悲しげな顔をしていた。', 'かなしげ な かお お して いた。', 'lvl-ja-n2', 'authored', true),
  ('sent-ex-ge-3', 'lang-ja', '彼女は寂しげだった。', 'かのじょ わ さびしげ だった。', 'lvl-ja-n2', 'authored', true),
  ('sent-ex-ge-4', 'lang-ja', '不安げな様子だった。', 'ふあんげ な ようす だった。', 'lvl-ja-n2', 'authored', true),
  -- mamire
  ('sent-ex-mamire-1', 'lang-ja', '服が泥まみれになった。', 'ふく が どろまみれ に なった。', 'lvl-ja-n2', 'authored', true),
  ('sent-ex-mamire-2', 'lang-ja', '汗まみれで働いた。', 'あせまみれ で はたらいた。', 'lvl-ja-n2', 'authored', true),
  ('sent-ex-mamire-3', 'lang-ja', '手が油まみれになった。', 'て が あぶらまみれ に なった。', 'lvl-ja-n2', 'authored', true),
  ('sent-ex-mamire-4', 'lang-ja', '子供は砂まみれで遊んでいた。', 'こども わ すなまみれ で あそんで いた。', 'lvl-ja-n2', 'authored', true),
  -- zukume
  ('sent-ex-zukume-1', 'lang-ja', '黒ずくめの服を着ている。', 'くろずくめ の ふく お きて いる。', 'lvl-ja-n2', 'authored', true),
  ('sent-ex-zukume-2', 'lang-ja', '白ずくめの人が来た。', 'しろずくめ の ひと が きた。', 'lvl-ja-n2', 'authored', true),
  ('sent-ex-zukume-3', 'lang-ja', '今年は良いことずくめでした。', 'ことし わ よい こと ずくめ でした。', 'lvl-ja-n2', 'authored', true),
  ('sent-ex-zukume-4', 'lang-ja', '規則ずくめの学校だ。', 'きそく ずくめ の がっこう だ。', 'lvl-ja-n2', 'authored', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sentence_translations (id, sentence_id, lang, text, source) VALUES
  ('st-ex-jou-1', 'sent-ex-jou-1', 'en', 'As far as the rules go, it cannot be done.', 'authored'),
  ('st-ex-jou-2', 'sent-ex-jou-2', 'en', 'As far as the data goes, there is no problem.', 'authored'),
  ('st-ex-jou-3', 'sent-ex-jou-3', 'en', 'Schedule-wise, it is impossible.', 'authored'),
  ('st-ex-jou-4', 'sent-ex-jou-4', 'en', 'It is a problem of design.', 'authored'),
  ('st-ex-ge-1', 'sent-ex-ge-1', 'en', 'He laughed, looking pleased.', 'authored'),
  ('st-ex-ge-2', 'sent-ex-ge-2', 'en', 'She had a sad look about her.', 'authored'),
  ('st-ex-ge-3', 'sent-ex-ge-3', 'en', 'She seemed lonely.', 'authored'),
  ('st-ex-ge-4', 'sent-ex-ge-4', 'en', 'He had an uneasy look about him.', 'authored'),
  ('st-ex-mamire-1', 'sent-ex-mamire-1', 'en', 'My clothes got covered in mud.', 'authored'),
  ('st-ex-mamire-2', 'sent-ex-mamire-2', 'en', 'I worked, covered in sweat.', 'authored'),
  ('st-ex-mamire-3', 'sent-ex-mamire-3', 'en', 'My hands got covered in oil.', 'authored'),
  ('st-ex-mamire-4', 'sent-ex-mamire-4', 'en', 'The children were playing, covered in sand.', 'authored'),
  ('st-ex-zukume-1', 'sent-ex-zukume-1', 'en', 'He is dressed all in black.', 'authored'),
  ('st-ex-zukume-2', 'sent-ex-zukume-2', 'en', 'A person dressed all in white came.', 'authored'),
  ('st-ex-zukume-3', 'sent-ex-zukume-3', 'en', 'This year has been nothing but good news.', 'authored'),
  ('st-ex-zukume-4', 'sent-ex-zukume-4', 'en', 'It is a school of nothing but rules.', 'authored')
ON CONFLICT (id) DO NOTHING;

INSERT INTO grammar_point_sentences (grammar_point_id, sentence_id, role, sort_index)
SELECT g.id, s.id, 'example', s.n
FROM (VALUES
  ('jou', 'sent-ex-jou-1', 0),
  ('jou', 'sent-ex-jou-2', 1),
  ('jou', 'sent-ex-jou-3', 2),
  ('jou', 'sent-ex-jou-4', 3),
  ('ge', 'sent-ex-ge-1', 0),
  ('ge', 'sent-ex-ge-2', 1),
  ('ge', 'sent-ex-ge-3', 2),
  ('ge', 'sent-ex-ge-4', 3),
  ('mamire', 'sent-ex-mamire-1', 0),
  ('mamire', 'sent-ex-mamire-2', 1),
  ('mamire', 'sent-ex-mamire-3', 2),
  ('mamire', 'sent-ex-mamire-4', 3),
  ('zukume', 'sent-ex-zukume-1', 0),
  ('zukume', 'sent-ex-zukume-2', 1),
  ('zukume', 'sent-ex-zukume-3', 2),
  ('zukume', 'sent-ex-zukume-4', 3)
) AS s(slug, id, n)
JOIN grammar_points g ON g.language_id = 'lang-ja' AND g.slug = s.slug
ON CONFLICT (grammar_point_id, sentence_id, role) DO NOTHING;

-- The tokens. `tokenise:authored` is a dev script and production runs only
-- migrations and seeds; the quiz derivation cuts its chips from these rows.
DELETE FROM sentence_tokens WHERE sentence_id IN ('sent-ex-jou-1', 'sent-ex-jou-2', 'sent-ex-jou-3', 'sent-ex-jou-4', 'sent-ex-ge-1', 'sent-ex-ge-2', 'sent-ex-ge-3', 'sent-ex-ge-4', 'sent-ex-mamire-1', 'sent-ex-mamire-2', 'sent-ex-mamire-3', 'sent-ex-mamire-4', 'sent-ex-zukume-1', 'sent-ex-zukume-2', 'sent-ex-zukume-3', 'sent-ex-zukume-4');
INSERT INTO sentence_tokens (id, sentence_id, index, surface, reading, word_id, char_start, char_end, furigana) VALUES
  (gen_random_uuid()::text, 'sent-ex-jou-1', 0, 'ルール', 'ルール', (select id from words where primary_form = 'ルール' and language_id = 'lang-ja' and published order by id limit 1), 0, 3, '[{"t":"ルール"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-1', 1, '上', 'じょう', (select id from words where primary_form = '上' and language_id = 'lang-ja' and published order by id limit 1), 3, 4, '[{"t":"上","r":"じょう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-1', 2, '、', '、', NULL, 4, 5, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-1', 3, 'で', 'で', (select id from words where primary_form = 'で' and language_id = 'lang-ja' and published order by id limit 1), 5, 6, '[{"t":"で"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-1', 4, 'き', 'き', NULL, 6, 7, '[{"t":"き"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-1', 5, 'ません', 'ません', NULL, 7, 10, '[{"t":"ません"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-1', 6, '。', '。', NULL, 10, 11, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-2', 0, 'データ', 'データ', (select id from words where primary_form = 'データ' and language_id = 'lang-ja' and published order by id limit 1), 0, 3, '[{"t":"データ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-2', 1, '上', 'じょう', (select id from words where primary_form = '上' and language_id = 'lang-ja' and published order by id limit 1), 3, 4, '[{"t":"上","r":"じょう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-2', 2, '、', '、', NULL, 4, 5, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-2', 3, '問題', 'もんだい', (select id from words where primary_form = '問題' and language_id = 'lang-ja' and published order by id limit 1), 5, 7, '[{"t":"問題","r":"もんだい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-2', 4, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 7, 8, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-2', 5, 'ありません', 'ありません', (select id from words where primary_form = '有る' and language_id = 'lang-ja' and published order by id limit 1), 8, 13, '[{"t":"ありません"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-2', 6, '。', '。', NULL, 13, 14, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-3', 0, 'スケジュール', 'スケジュール', (select id from words where primary_form = 'スケジュール' and language_id = 'lang-ja' and published order by id limit 1), 0, 6, '[{"t":"スケジュール"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-3', 1, '上', 'じょう', (select id from words where primary_form = '上' and language_id = 'lang-ja' and published order by id limit 1), 6, 7, '[{"t":"上","r":"じょう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-3', 2, '、', '、', NULL, 7, 8, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-3', 3, '無理', 'むり', (select id from words where primary_form = '無理' and language_id = 'lang-ja' and published order by id limit 1), 8, 10, '[{"t":"無理","r":"むり"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-3', 4, 'です', 'です', NULL, 10, 12, '[{"t":"です"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-3', 5, '。', '。', NULL, 12, 13, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-4', 0, 'デザイン', 'デザイン', (select id from words where primary_form = 'デザイン' and language_id = 'lang-ja' and published order by id limit 1), 0, 4, '[{"t":"デザイン"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-4', 1, '上', 'じょう', (select id from words where primary_form = '上' and language_id = 'lang-ja' and published order by id limit 1), 4, 5, '[{"t":"上","r":"じょう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-4', 2, 'の', 'の', NULL, 5, 6, '[{"t":"の"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-4', 3, '問題', 'もんだい', (select id from words where primary_form = '問題' and language_id = 'lang-ja' and published order by id limit 1), 6, 8, '[{"t":"問題","r":"もんだい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-4', 4, 'です', 'です', NULL, 8, 10, '[{"t":"です"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-jou-4', 5, '。', '。', NULL, 10, 11, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-1', 0, '彼', 'かれ', (select id from words where primary_form = '彼' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"彼","r":"かれ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-1', 1, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 1, 2, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-1', 2, '嬉しげに', 'うれしげに', (select id from words where primary_form = '嬉しい' and language_id = 'lang-ja' and published order by id limit 1), 2, 6, '[{"t":"嬉","r":"うれ"},{"t":"しげに"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-1', 3, '笑った', 'わらった', (select id from words where primary_form = '笑う' and language_id = 'lang-ja' and published order by id limit 1), 6, 9, '[{"t":"笑","r":"わら"},{"t":"った"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-1', 4, '。', '。', NULL, 9, 10, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-2', 0, '悲しげな', 'かなしげな', (select id from words where primary_form = '悲しむ' and language_id = 'lang-ja' and published order by id limit 1), 0, 4, '[{"t":"悲","r":"かな"},{"t":"しげな"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-2', 1, '顔', 'かお', (select id from words where primary_form = '顔' and language_id = 'lang-ja' and published order by id limit 1), 4, 5, '[{"t":"顔","r":"かお"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-2', 2, 'を', 'を', NULL, 5, 6, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-2', 3, 'して', 'して', (select id from words where primary_form = '為る' and language_id = 'lang-ja' and published order by id limit 1), 6, 8, '[{"t":"して"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-2', 4, 'いた', 'いた', (select id from words where primary_form = '居る' and language_id = 'lang-ja' and published order by id limit 1), 8, 10, '[{"t":"いた"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-2', 5, '。', '。', NULL, 10, 11, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-3', 0, '彼女', 'かのじょ', (select id from words where primary_form = '彼女' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"彼女","r":"かのじょ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-3', 1, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-3', 2, '寂しげだった', 'さびしげだった', (select id from words where primary_form = '寂しい' and language_id = 'lang-ja' and published order by id limit 1), 3, 9, '[{"t":"寂","r":"さび"},{"t":"しげだった"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-3', 3, '。', '。', NULL, 9, 10, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-4', 0, '不安', 'ふあん', (select id from words where primary_form = '不安' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"不安","r":"ふあん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-4', 1, 'げ', 'げ', NULL, 2, 3, '[{"t":"げ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-4', 2, 'な', 'な', (select id from words where primary_form = 'な' and language_id = 'lang-ja' and published order by id limit 1), 3, 4, '[{"t":"な"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-4', 3, '様子', 'ようす', (select id from words where primary_form = '様子' and language_id = 'lang-ja' and published order by id limit 1), 4, 6, '[{"t":"様子","r":"ようす"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-4', 4, 'だった', 'だった', NULL, 6, 9, '[{"t":"だった"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ge-4', 5, '。', '。', NULL, 9, 10, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-1', 0, '服', 'ふく', (select id from words where primary_form = '服' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"服","r":"ふく"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-1', 1, 'が', 'が', NULL, 1, 2, '[{"t":"が"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-1', 2, '泥', 'どろ', (select id from words where primary_form = '泥' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"泥","r":"どろ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-1', 3, 'まみれ', 'まみれ', NULL, 3, 6, '[{"t":"まみれ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-1', 4, 'に', 'に', (select id from words where primary_form = 'に' and language_id = 'lang-ja' and published order by id limit 1), 6, 7, '[{"t":"に"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-1', 5, 'なった', 'なった', (select id from words where primary_form = '成る' and language_id = 'lang-ja' and published order by id limit 1), 7, 10, '[{"t":"なった"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-1', 6, '。', '。', NULL, 10, 11, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-2', 0, '汗', 'あせ', (select id from words where primary_form = '汗' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"汗","r":"あせ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-2', 1, 'まみれ', 'まみれ', NULL, 1, 4, '[{"t":"まみれ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-2', 2, 'で', 'で', (select id from words where primary_form = 'で' and language_id = 'lang-ja' and published order by id limit 1), 4, 5, '[{"t":"で"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-2', 3, '働いた', 'はたらいた', (select id from words where primary_form = '働く' and language_id = 'lang-ja' and published order by id limit 1), 5, 8, '[{"t":"働","r":"はたら"},{"t":"いた"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-2', 4, '。', '。', NULL, 8, 9, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-3', 0, '手', 'て', (select id from words where primary_form = '手' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"手","r":"て"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-3', 1, 'が', 'が', NULL, 1, 2, '[{"t":"が"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-3', 2, '油', 'あぶら', (select id from words where primary_form = '油' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"油","r":"あぶら"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-3', 3, 'まみれ', 'まみれ', NULL, 3, 6, '[{"t":"まみれ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-3', 4, 'に', 'に', (select id from words where primary_form = 'に' and language_id = 'lang-ja' and published order by id limit 1), 6, 7, '[{"t":"に"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-3', 5, 'なった', 'なった', (select id from words where primary_form = '成る' and language_id = 'lang-ja' and published order by id limit 1), 7, 10, '[{"t":"なった"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-3', 6, '。', '。', NULL, 10, 11, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-4', 0, '子供', 'こども', (select id from words where primary_form = '子供' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"子供","r":"こども"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-4', 1, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-4', 2, '砂', 'すな', (select id from words where primary_form = '砂' and language_id = 'lang-ja' and published order by id limit 1), 3, 4, '[{"t":"砂","r":"すな"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-4', 3, 'まみれ', 'まみれ', NULL, 4, 7, '[{"t":"まみれ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-4', 4, 'で', 'で', (select id from words where primary_form = 'で' and language_id = 'lang-ja' and published order by id limit 1), 7, 8, '[{"t":"で"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-4', 5, '遊んで', 'あそんで', (select id from words where primary_form = '遊ぶ' and language_id = 'lang-ja' and published order by id limit 1), 8, 11, '[{"t":"遊","r":"あそ"},{"t":"んで"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-4', 6, 'いた', 'いた', (select id from words where primary_form = '居る' and language_id = 'lang-ja' and published order by id limit 1), 11, 13, '[{"t":"いた"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-mamire-4', 7, '。', '。', NULL, 13, 14, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-1', 0, '黒', 'くろ', (select id from words where primary_form = '黒' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"黒","r":"くろ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-1', 1, 'ずくめ', 'ずくめ', NULL, 1, 4, '[{"t":"ずくめ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-1', 2, 'の', 'の', NULL, 4, 5, '[{"t":"の"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-1', 3, '服', 'ふく', (select id from words where primary_form = '服' and language_id = 'lang-ja' and published order by id limit 1), 5, 6, '[{"t":"服","r":"ふく"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-1', 4, 'を', 'を', NULL, 6, 7, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-1', 5, '着て', 'きて', (select id from words where primary_form = '着る' and language_id = 'lang-ja' and published order by id limit 1), 7, 9, '[{"t":"着","r":"き"},{"t":"て"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-1', 6, 'いる', 'いる', (select id from words where primary_form = '要る' and language_id = 'lang-ja' and published order by id limit 1), 9, 11, '[{"t":"いる"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-1', 7, '。', '。', NULL, 11, 12, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-2', 0, '白', 'しろ', (select id from words where primary_form = '白' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"白","r":"しろ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-2', 1, 'ずくめ', 'ずくめ', NULL, 1, 4, '[{"t":"ずくめ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-2', 2, 'の', 'の', NULL, 4, 5, '[{"t":"の"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-2', 3, '人', 'ひと', (select id from words where primary_form = '人' and language_id = 'lang-ja' and published order by id limit 1), 5, 6, '[{"t":"人","r":"ひと"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-2', 4, 'が', 'が', NULL, 6, 7, '[{"t":"が"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-2', 5, '来た', 'きた', (select id from words where primary_form = '来る' and language_id = 'lang-ja' and published order by id limit 1), 7, 9, '[{"t":"来","r":"き"},{"t":"た"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-2', 6, '。', '。', NULL, 9, 10, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-3', 0, '今年', 'ことし', (select id from words where primary_form = '今年' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"今年","r":"ことし"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-3', 1, 'は', 'は', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-3', 2, '良い', 'よい', (select id from words where primary_form = '良い' and language_id = 'lang-ja' and published order by id limit 1), 3, 5, '[{"t":"良","r":"よ"},{"t":"い"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-3', 3, 'こと', 'こと', (select id from words where primary_form = '事' and language_id = 'lang-ja' and published order by id limit 1), 5, 7, '[{"t":"こと"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-3', 4, 'ずくめ', 'ずくめ', NULL, 7, 10, '[{"t":"ずくめ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-3', 5, 'でした', 'でした', NULL, 10, 13, '[{"t":"でした"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-3', 6, '。', '。', NULL, 13, 14, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-4', 0, '規則', 'きそく', (select id from words where primary_form = '規則' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"規則","r":"きそく"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-4', 1, 'ずくめ', 'ずくめ', NULL, 2, 5, '[{"t":"ずくめ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-4', 2, 'の', 'の', NULL, 5, 6, '[{"t":"の"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-4', 3, '学校', 'がっこう', (select id from words where primary_form = '学校' and language_id = 'lang-ja' and published order by id limit 1), 6, 8, '[{"t":"学校","r":"がっこう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-4', 4, 'だ', 'だ', NULL, 8, 9, '[{"t":"だ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-zukume-4', 5, '。', '。', NULL, 9, 10, '[{"t":"。"}]'::jsonb);
