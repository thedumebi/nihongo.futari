-- Reword three example sentences, and give every authored sentence its tokens.
--
-- Two things, together because the second depends on the first.
--
-- 1. Three sentences from 051 name something the dictionary does not hold, and
--    a word outside the published vocabulary is not left alone — `glossLine`
--    shreds it into the characters it CAN match. 田中さんは先生です。 came apart
--    into 田 | 中 | さん, and 六時 / 七時 into 六 | 時 and 七 | 時. Each half is a
--    real published word on its own, which is exactly why nothing caught it:
--    the existing check looks for runs of single KANA, and these are kanji that
--    gloss perfectly well separately. `check:examples` now also rejects two
--    single kanji side by side, which is what a split compound looks like.
--
--    It matters because these sentences are about to become word-order
--    questions. A puzzle that asks the reader to assemble 田 + 中 + さん is not
--    teaching Japanese, it is teaching the tokeniser's failure mode.
--
--    Reworded rather than repaired, because the tokeniser is right to refuse a
--    word it does not have. 起きる is kept in the verb-classes example — the
--    sentence is there to show an ichidan verb, so the verb is the one part
--    that could not change.
--
-- 2. Authored sentences had no `sentence_tokens` rows AT ALL — 1,826 Tatoeba
--    sentences carry 8,613 tokens between them, and the 32 authored ones
--    carried none, because Tatoeba arrives pre-tokenised and nothing tokenised
--    the rest. The dev script `tokenise:authored` fills that in locally; this
--    seed is how the result reaches production, which runs migrations and seeds
--    and nothing else.
--
--    Without it the quiz derivation in 055 reads an empty table, generates
--    nothing, and records itself as done — the failure would be silent and
--    permanent.
--
-- Delete-then-insert, so a reworded sentence cannot keep stale tokens and a
-- second run is a no-op. Touches sentences, their translations and their
-- tokens; no accounts, no srs_cards, no review logs.

-- 1. The rewordings.
UPDATE sentences SET text = '母は先生です。',     reading_kana = 'はは わ せんせい です。', updated_at = now() WHERE id = 'sent-ex-desu-3';
UPDATE sentences SET text = '毎朝早く起きる。',   reading_kana = 'まいあさ はやく おきる。', updated_at = now() WHERE id = 'sent-ex-vclass-1';
UPDATE sentences SET text = '朝ご飯を食べます。', reading_kana = 'あさごはん お たべます。', updated_at = now() WHERE id = 'sent-ex-masu-2';

UPDATE sentence_translations SET text = 'My mother is a teacher.',                         updated_at = now() WHERE sentence_id = 'sent-ex-desu-3';
UPDATE sentence_translations SET text = 'I get up early every morning. (起きる — ichidan)', updated_at = now() WHERE sentence_id = 'sent-ex-vclass-1';
UPDATE sentence_translations SET text = 'I eat breakfast.',                                updated_at = now() WHERE sentence_id = 'sent-ex-masu-2';

-- 2. The tokens.
DELETE FROM sentence_tokens WHERE sentence_id IN ('sent-ex-desu-1', 'sent-ex-desu-2', 'sent-ex-desu-4', 'sent-ex-dict-1', 'sent-ex-dict-2', 'sent-ex-dict-3', 'sent-ex-dict-4', 'sent-ex-vclass-2', 'sent-ex-vclass-3', 'sent-ex-vclass-4', 'sent-ex-masu-1', 'sent-ex-masu-3', 'sent-ex-masu-4', 'sent-ex-te-1', 'sent-ex-te-2', 'sent-ex-te-3', 'sent-ex-te-4', 'sent-ex-ta-1', 'sent-ex-ta-2', 'sent-ex-ta-3', 'sent-ex-ta-4', 'sent-ex-teiru-1', 'sent-ex-teiru-2', 'sent-ex-teiru-3', 'sent-ex-teiru-4', 'sent-ex-nai-1', 'sent-ex-nai-2', 'sent-ex-nai-3', 'sent-ex-nai-4', 'sent-ex-desu-3', 'sent-ex-vclass-1', 'sent-ex-masu-2');
INSERT INTO sentence_tokens (id, sentence_id, index, surface, reading, word_id, char_start, char_end, furigana) VALUES
  (gen_random_uuid()::text, 'sent-ex-desu-1', 0, '私', 'わたし', (select id from words where primary_form = '私' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"私","r":"わたし"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-1', 1, 'は', 'わ', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 1, 2, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-1', 2, '学生', 'がくせい', (select id from words where primary_form = '学生' and language_id = 'lang-ja' and published order by id limit 1), 2, 4, '[{"t":"学生","r":"がくせい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-1', 3, 'で', NULL, (select id from words where primary_form = 'で' and language_id = 'lang-ja' and published order by id limit 1), 4, 5, '[{"t":"で"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-1', 4, 'す', NULL, NULL, 5, 6, '[{"t":"す"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-1', 5, '。', NULL, NULL, 6, 7, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-2', 0, '私', 'わたし', (select id from words where primary_form = '私' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"私","r":"わたし"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-2', 1, 'の', NULL, NULL, 1, 2, '[{"t":"の"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-2', 2, '本', 'ほん', (select id from words where primary_form = '本' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"本","r":"ほん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-2', 3, 'で', NULL, (select id from words where primary_form = 'で' and language_id = 'lang-ja' and published order by id limit 1), 3, 4, '[{"t":"で"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-2', 4, 'す', NULL, NULL, 4, 5, '[{"t":"す"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-2', 5, '。', NULL, NULL, 5, 6, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-4', 0, '今日', 'きょう', (select id from words where primary_form = '今日' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"今日","r":"きょう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-4', 1, 'は', 'わ', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-4', 2, '水曜日', 'すいようび', (select id from words where primary_form = '水曜日' and language_id = 'lang-ja' and published order by id limit 1), 3, 6, '[{"t":"水曜日","r":"すいようび"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-4', 3, 'で', NULL, (select id from words where primary_form = 'で' and language_id = 'lang-ja' and published order by id limit 1), 6, 7, '[{"t":"で"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-4', 4, 'す', NULL, NULL, 7, 8, '[{"t":"す"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-4', 5, '。', NULL, NULL, 8, 9, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-1', 0, '毎日', 'まいにち', (select id from words where primary_form = '毎日' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"毎日","r":"まいにち"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-1', 1, '勉強する', NULL, (select id from words where primary_form = '勉強' and language_id = 'lang-ja' and published order by id limit 1), 2, 6, '[{"t":"勉強する"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-1', 2, '。', NULL, NULL, 6, 7, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-2', 0, '明日', 'あした', (select id from words where primary_form = '明日' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"明日","r":"あした"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-2', 1, '友だち', 'ともだち', (select id from words where primary_form = '友達' and language_id = 'lang-ja' and published order by id limit 1), 2, 5, '[{"t":"友","r":"とも"},{"t":"だち"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-2', 2, 'に', NULL, (select id from words where primary_form = 'に' and language_id = 'lang-ja' and published order by id limit 1), 5, 6, '[{"t":"に"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-2', 3, '会う', 'あう', (select id from words where primary_form = '会う' and language_id = 'lang-ja' and published order by id limit 1), 6, 8, '[{"t":"会","r":"あ"},{"t":"う"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-2', 4, '。', NULL, NULL, 8, 9, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-3', 0, '朝ご飯', 'あさごはん', (select id from words where primary_form = '朝ごはん' and language_id = 'lang-ja' and published order by id limit 1), 0, 3, '[{"t":"朝","r":"あさ"},{"t":"ご"},{"t":"飯","r":"はん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-3', 1, 'を', 'お', NULL, 3, 4, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-3', 2, '食べる', 'たべる', (select id from words where primary_form = '食べる' and language_id = 'lang-ja' and published order by id limit 1), 4, 7, '[{"t":"食","r":"た"},{"t":"べる"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-3', 3, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-4', 0, '電車', 'でんしゃ', (select id from words where primary_form = '電車' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"電車","r":"でんしゃ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-4', 1, 'で', NULL, (select id from words where primary_form = 'で' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"で"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-4', 2, '会社', 'かいしゃ', (select id from words where primary_form = '会社' and language_id = 'lang-ja' and published order by id limit 1), 3, 5, '[{"t":"会社","r":"かいしゃ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-4', 3, 'に', NULL, (select id from words where primary_form = 'に' and language_id = 'lang-ja' and published order by id limit 1), 5, 6, '[{"t":"に"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-4', 4, '行く', 'いく', (select id from words where primary_form = '行く' and language_id = 'lang-ja' and published order by id limit 1), 6, 8, '[{"t":"行","r":"い"},{"t":"く"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-4', 5, '。', NULL, NULL, 8, 9, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-2', 0, '手紙', 'てがみ', (select id from words where primary_form = '手紙' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"手紙","r":"てがみ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-2', 1, 'を', 'お', NULL, 2, 3, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-2', 2, '書く', 'かく', (select id from words where primary_form = '書く' and language_id = 'lang-ja' and published order by id limit 1), 3, 5, '[{"t":"書","r":"か"},{"t":"く"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-2', 3, '。', NULL, NULL, 5, 6, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-3', 0, '毎日', 'まいにち', (select id from words where primary_form = '毎日' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"毎日","r":"まいにち"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-3', 1, '勉強する', NULL, (select id from words where primary_form = '勉強' and language_id = 'lang-ja' and published order by id limit 1), 2, 6, '[{"t":"勉強する"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-3', 2, '。', NULL, NULL, 6, 7, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-4', 0, '友だち', 'ともだち', (select id from words where primary_form = '友達' and language_id = 'lang-ja' and published order by id limit 1), 0, 3, '[{"t":"友","r":"とも"},{"t":"だち"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-4', 1, 'が', NULL, NULL, 3, 4, '[{"t":"が"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-4', 2, '来る', 'くる', (select id from words where primary_form = '来る' and language_id = 'lang-ja' and published order by id limit 1), 4, 6, '[{"t":"来","r":"く"},{"t":"る"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-4', 3, '。', NULL, NULL, 6, 7, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-1', 0, '毎日', 'まいにち', (select id from words where primary_form = '毎日' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"毎日","r":"まいにち"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-1', 1, '勉強します', NULL, (select id from words where primary_form = '勉強' and language_id = 'lang-ja' and published order by id limit 1), 2, 7, '[{"t":"勉強します"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-1', 2, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-3', 0, '明日', 'あした', (select id from words where primary_form = '明日' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"明日","r":"あした"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-3', 1, '会社', 'かいしゃ', (select id from words where primary_form = '会社' and language_id = 'lang-ja' and published order by id limit 1), 2, 4, '[{"t":"会社","r":"かいしゃ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-3', 2, 'に', NULL, (select id from words where primary_form = 'に' and language_id = 'lang-ja' and published order by id limit 1), 4, 5, '[{"t":"に"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-3', 3, '行きます', 'いきます', (select id from words where primary_form = '行く' and language_id = 'lang-ja' and published order by id limit 1), 5, 9, '[{"t":"行","r":"い"},{"t":"きます"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-3', 4, '。', NULL, NULL, 9, 10, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-4', 0, 'お茶', 'おちゃ', (select id from words where primary_form = 'お茶' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"お"},{"t":"茶","r":"ちゃ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-4', 1, 'を', 'お', NULL, 2, 3, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-4', 2, '飲みます', 'のみます', (select id from words where primary_form = '飲む' and language_id = 'lang-ja' and published order by id limit 1), 3, 7, '[{"t":"飲","r":"の"},{"t":"みます"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-4', 3, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-1', 0, 'ご飯', 'ごはん', (select id from words where primary_form = 'ご飯' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"ご"},{"t":"飯","r":"はん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-1', 1, 'を', 'お', NULL, 2, 3, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-1', 2, '食べて', 'たべて', (select id from words where primary_form = '食べる' and language_id = 'lang-ja' and published order by id limit 1), 3, 6, '[{"t":"食","r":"た"},{"t":"べて"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-1', 3, '、', NULL, NULL, 6, 7, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-1', 4, 'テレビ', NULL, (select id from words where primary_form = 'テレビ' and language_id = 'lang-ja' and published order by id limit 1), 7, 10, '[{"t":"テレビ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-1', 5, 'を', 'お', NULL, 10, 11, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-1', 6, '見ます', 'みます', (select id from words where primary_form = '見る' and language_id = 'lang-ja' and published order by id limit 1), 11, 14, '[{"t":"見","r":"み"},{"t":"ます"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-1', 7, '。', NULL, NULL, 14, 15, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-2', 0, '少し', 'すこし', (select id from words where primary_form = '少し' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"少","r":"すこ"},{"t":"し"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-2', 1, '待って', 'まって', (select id from words where primary_form = '待つ' and language_id = 'lang-ja' and published order by id limit 1), 2, 5, '[{"t":"待","r":"ま"},{"t":"って"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-2', 2, 'ください', NULL, (select id from words where primary_form = '下さい' and language_id = 'lang-ja' and published order by id limit 1), 5, 9, '[{"t":"ください"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-2', 3, '。', NULL, NULL, 9, 10, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-3', 0, '手', 'て', (select id from words where primary_form = '手' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"手","r":"て"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-3', 1, 'を', 'お', NULL, 1, 2, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-3', 2, '洗って', 'あらって', (select id from words where primary_form = '洗う' and language_id = 'lang-ja' and published order by id limit 1), 2, 5, '[{"t":"洗","r":"あら"},{"t":"って"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-3', 3, '、', NULL, NULL, 5, 6, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-3', 4, '座って', 'すわって', (select id from words where primary_form = '座る' and language_id = 'lang-ja' and published order by id limit 1), 6, 9, '[{"t":"座","r":"すわ"},{"t":"って"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-3', 5, 'ください', NULL, (select id from words where primary_form = '下さい' and language_id = 'lang-ja' and published order by id limit 1), 9, 13, '[{"t":"ください"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-3', 6, '。', NULL, NULL, 13, 14, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-4', 0, '電話して', 'でんわして', (select id from words where primary_form = '電話' and language_id = 'lang-ja' and published order by id limit 1), 0, 4, '[{"t":"電話","r":"でんわ"},{"t":"して"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-4', 1, '、', NULL, NULL, 4, 5, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-4', 2, '会社', 'かいしゃ', (select id from words where primary_form = '会社' and language_id = 'lang-ja' and published order by id limit 1), 5, 7, '[{"t":"会社","r":"かいしゃ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-4', 3, 'に', NULL, (select id from words where primary_form = 'に' and language_id = 'lang-ja' and published order by id limit 1), 7, 8, '[{"t":"に"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-4', 4, '行きます', 'いきます', (select id from words where primary_form = '行く' and language_id = 'lang-ja' and published order by id limit 1), 8, 12, '[{"t":"行","r":"い"},{"t":"きます"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-4', 5, '。', NULL, NULL, 12, 13, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-1', 0, '昨日', 'きのう', (select id from words where primary_form = '昨日' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"昨日","r":"きのう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-1', 1, '映画', 'えいが', (select id from words where primary_form = '映画' and language_id = 'lang-ja' and published order by id limit 1), 2, 4, '[{"t":"映画","r":"えいが"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-1', 2, 'を', 'お', NULL, 4, 5, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-1', 3, '見た', 'みた', (select id from words where primary_form = '見る' and language_id = 'lang-ja' and published order by id limit 1), 5, 7, '[{"t":"見","r":"み"},{"t":"た"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-1', 4, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-2', 0, 'ご飯', 'ごはん', (select id from words where primary_form = 'ご飯' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"ご"},{"t":"飯","r":"はん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-2', 1, 'は', 'わ', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-2', 2, 'もう', NULL, (select id from words where primary_form = 'もう' and language_id = 'lang-ja' and published order by id limit 1), 3, 5, '[{"t":"もう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-2', 3, '食べた', 'たべた', (select id from words where primary_form = '食べる' and language_id = 'lang-ja' and published order by id limit 1), 5, 8, '[{"t":"食","r":"た"},{"t":"べた"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-2', 4, '。', NULL, NULL, 8, 9, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-3', 0, '友だち', 'ともだち', (select id from words where primary_form = '友達' and language_id = 'lang-ja' and published order by id limit 1), 0, 3, '[{"t":"友","r":"とも"},{"t":"だち"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-3', 1, 'に', NULL, (select id from words where primary_form = 'に' and language_id = 'lang-ja' and published order by id limit 1), 3, 4, '[{"t":"に"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-3', 2, '会った', 'あった', (select id from words where primary_form = '会う' and language_id = 'lang-ja' and published order by id limit 1), 4, 7, '[{"t":"会","r":"あ"},{"t":"った"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-3', 3, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-4', 0, '分かった', 'わかった', (select id from words where primary_form = '分かる' and language_id = 'lang-ja' and published order by id limit 1), 0, 4, '[{"t":"分","r":"わ"},{"t":"かった"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-4', 1, '！', NULL, NULL, 4, 5, '[{"t":"！"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-1', 0, '今', 'いま', (select id from words where primary_form = '今' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"今","r":"いま"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-1', 1, '、', NULL, NULL, 1, 2, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-1', 2, '本', 'ほん', (select id from words where primary_form = '本' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"本","r":"ほん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-1', 3, 'を', 'お', NULL, 3, 4, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-1', 4, '読んで', 'よんで', (select id from words where primary_form = '読む' and language_id = 'lang-ja' and published order by id limit 1), 4, 7, '[{"t":"読","r":"よ"},{"t":"んで"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-1', 5, 'いる', NULL, (select id from words where primary_form = '要る' and language_id = 'lang-ja' and published order by id limit 1), 7, 9, '[{"t":"いる"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-1', 6, '。', NULL, NULL, 9, 10, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-2', 0, '雨', 'あめ', (select id from words where primary_form = '雨' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"雨","r":"あめ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-2', 1, 'が', NULL, NULL, 1, 2, '[{"t":"が"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-2', 2, '降って', 'ふって', (select id from words where primary_form = '降る' and language_id = 'lang-ja' and published order by id limit 1), 2, 5, '[{"t":"降","r":"ふ"},{"t":"って"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-2', 3, 'いる', NULL, (select id from words where primary_form = '要る' and language_id = 'lang-ja' and published order by id limit 1), 5, 7, '[{"t":"いる"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-2', 4, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-3', 0, '日本', 'にほん', (select id from words where primary_form = '日本' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"日本","r":"にほん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-3', 1, 'に', NULL, (select id from words where primary_form = 'に' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"に"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-3', 2, '住んで', 'すんで', (select id from words where primary_form = '住む' and language_id = 'lang-ja' and published order by id limit 1), 3, 6, '[{"t":"住","r":"す"},{"t":"んで"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-3', 3, 'いる', NULL, (select id from words where primary_form = '要る' and language_id = 'lang-ja' and published order by id limit 1), 6, 8, '[{"t":"いる"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-3', 4, '。', NULL, NULL, 8, 9, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-4', 0, '彼', 'かれ', (select id from words where primary_form = '彼' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"彼","r":"かれ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-4', 1, 'は', 'わ', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 1, 2, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-4', 2, '結婚して', 'けっこんして', (select id from words where primary_form = '結婚' and language_id = 'lang-ja' and published order by id limit 1), 2, 6, '[{"t":"結婚","r":"けっこん"},{"t":"して"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-4', 3, 'いる', NULL, (select id from words where primary_form = '要る' and language_id = 'lang-ja' and published order by id limit 1), 6, 8, '[{"t":"いる"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-4', 4, '。', NULL, NULL, 8, 9, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-1', 0, '今日', 'きょう', (select id from words where primary_form = '今日' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"今日","r":"きょう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-1', 1, 'は', 'わ', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-1', 2, '行かない', 'いかない', (select id from words where primary_form = '行く' and language_id = 'lang-ja' and published order by id limit 1), 3, 7, '[{"t":"行","r":"い"},{"t":"かない"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-1', 3, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-2', 0, 'お酒', 'おさけ', (select id from words where primary_form = 'お酒' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"お"},{"t":"酒","r":"さけ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-2', 1, 'は', 'わ', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 2, 3, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-2', 2, '飲まない', 'のまない', (select id from words where primary_form = '飲む' and language_id = 'lang-ja' and published order by id limit 1), 3, 7, '[{"t":"飲","r":"の"},{"t":"まない"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-2', 3, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-3', 0, '何', 'なに', (select id from words where primary_form = '何' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"何","r":"なに"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-3', 1, 'も', NULL, NULL, 1, 2, '[{"t":"も"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-3', 2, '食べない', 'たべない', (select id from words where primary_form = '食べる' and language_id = 'lang-ja' and published order by id limit 1), 2, 6, '[{"t":"食","r":"た"},{"t":"べない"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-3', 3, '。', NULL, NULL, 6, 7, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-4', 0, '分からない', 'わからない', (select id from words where primary_form = '分かる' and language_id = 'lang-ja' and published order by id limit 1), 0, 5, '[{"t":"分","r":"わ"},{"t":"からない"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-4', 1, '。', NULL, NULL, 5, 6, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-3', 0, '母', 'はは', (select id from words where primary_form = '母' and language_id = 'lang-ja' and published order by id limit 1), 0, 1, '[{"t":"母","r":"はは"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-3', 1, 'は', 'わ', (select id from words where primary_form = 'は' and language_id = 'lang-ja' and published order by id limit 1), 1, 2, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-3', 2, '先生', 'せんせい', (select id from words where primary_form = '先生' and language_id = 'lang-ja' and published order by id limit 1), 2, 4, '[{"t":"先生","r":"せんせい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-3', 3, 'で', NULL, (select id from words where primary_form = 'で' and language_id = 'lang-ja' and published order by id limit 1), 4, 5, '[{"t":"で"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-3', 4, 'す', NULL, NULL, 5, 6, '[{"t":"す"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-3', 5, '。', NULL, NULL, 6, 7, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-1', 0, '毎朝', 'まいあさ', (select id from words where primary_form = '毎朝' and language_id = 'lang-ja' and published order by id limit 1), 0, 2, '[{"t":"毎朝","r":"まいあさ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-1', 1, '早く', NULL, (select id from words where primary_form = '早める' and language_id = 'lang-ja' and published order by id limit 1), 2, 4, '[{"t":"早く"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-1', 2, '起きる', 'おきる', (select id from words where primary_form = '起きる' and language_id = 'lang-ja' and published order by id limit 1), 4, 7, '[{"t":"起","r":"お"},{"t":"きる"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-1', 3, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-2', 0, '朝ご飯', 'あさごはん', (select id from words where primary_form = '朝ごはん' and language_id = 'lang-ja' and published order by id limit 1), 0, 3, '[{"t":"朝","r":"あさ"},{"t":"ご"},{"t":"飯","r":"はん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-2', 1, 'を', 'お', NULL, 3, 4, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-2', 2, '食べます', 'たべます', (select id from words where primary_form = '食べる' and language_id = 'lang-ja' and published order by id limit 1), 4, 8, '[{"t":"食","r":"た"},{"t":"べます"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-2', 3, '。', NULL, NULL, 8, 9, '[{"t":"。"}]'::jsonb);
