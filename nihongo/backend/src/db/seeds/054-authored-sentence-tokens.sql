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
  (gen_random_uuid()::text, 'sent-ex-desu-1', 0, '私', 'わたし', '07d07dec-dc8f-45b2-8095-b49b5087da75', 0, 1, '[{"t":"私","r":"わたし"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-1', 1, 'は', 'わ', '0dacf911-48fa-4c5e-8d6f-d2b5cd33a0b6', 1, 2, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-1', 2, '学生', 'がくせい', '15fb2da0-1205-42cf-8c9c-59295ac9fb62', 2, 4, '[{"t":"学生","r":"がくせい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-1', 3, 'で', NULL, '107c2108-67cd-4a47-b42b-0e4f19b2a745', 4, 5, '[{"t":"で"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-1', 4, 'す', NULL, NULL, 5, 6, '[{"t":"す"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-1', 5, '。', NULL, NULL, 6, 7, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-2', 0, '私', 'わたし', '07d07dec-dc8f-45b2-8095-b49b5087da75', 0, 1, '[{"t":"私","r":"わたし"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-2', 1, 'の', NULL, NULL, 1, 2, '[{"t":"の"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-2', 2, '本', 'ほん', 'beca25ad-0afa-4c20-bb1f-06c53a60f4ad', 2, 3, '[{"t":"本","r":"ほん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-2', 3, 'で', NULL, '107c2108-67cd-4a47-b42b-0e4f19b2a745', 3, 4, '[{"t":"で"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-2', 4, 'す', NULL, NULL, 4, 5, '[{"t":"す"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-2', 5, '。', NULL, NULL, 5, 6, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-4', 0, '今日', 'きょう', '3e025dc9-b02a-42a8-9558-47084b9e5e32', 0, 2, '[{"t":"今日","r":"きょう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-4', 1, 'は', 'わ', '0dacf911-48fa-4c5e-8d6f-d2b5cd33a0b6', 2, 3, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-4', 2, '水曜日', 'すいようび', '18ad1c7f-834e-4d3c-aba0-d9922addfb44', 3, 6, '[{"t":"水曜日","r":"すいようび"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-4', 3, 'で', NULL, '107c2108-67cd-4a47-b42b-0e4f19b2a745', 6, 7, '[{"t":"で"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-4', 4, 'す', NULL, NULL, 7, 8, '[{"t":"す"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-4', 5, '。', NULL, NULL, 8, 9, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-1', 0, '毎日', 'まいにち', '7475b67c-3081-49d9-81ce-4065be5e79f2', 0, 2, '[{"t":"毎日","r":"まいにち"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-1', 1, '勉強する', NULL, 'b5a69b9b-5017-4a76-b301-dbd5c9f5ba2a', 2, 6, '[{"t":"勉強する"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-1', 2, '。', NULL, NULL, 6, 7, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-2', 0, '明日', 'あした', '823cfb1a-cb34-4c88-86d6-5cdfca69eed5', 0, 2, '[{"t":"明日","r":"あした"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-2', 1, '友だち', 'ともだち', '826a97e0-e8f0-4ae7-a4ce-c9899a7a3c6f', 2, 5, '[{"t":"友","r":"とも"},{"t":"だち"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-2', 2, 'に', NULL, '05bb22cc-d56f-436c-b3ba-710cb3e2e41a', 5, 6, '[{"t":"に"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-2', 3, '会う', 'あう', '887821df-833f-4aac-a413-7ae78d3cfe17', 6, 8, '[{"t":"会","r":"あ"},{"t":"う"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-2', 4, '。', NULL, NULL, 8, 9, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-3', 0, '朝ご飯', 'あさごはん', '57b8c859-cd68-40a7-932e-bc4f035e1454', 0, 3, '[{"t":"朝","r":"あさ"},{"t":"ご"},{"t":"飯","r":"はん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-3', 1, 'を', 'お', NULL, 3, 4, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-3', 2, '食べる', 'たべる', '788557df-2bac-4ae7-a157-8a81fbe1da16', 4, 7, '[{"t":"食","r":"た"},{"t":"べる"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-3', 3, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-4', 0, '電車', 'でんしゃ', '36d08b54-317b-4525-9c99-cf5cae0c7ae2', 0, 2, '[{"t":"電車","r":"でんしゃ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-4', 1, 'で', NULL, '107c2108-67cd-4a47-b42b-0e4f19b2a745', 2, 3, '[{"t":"で"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-4', 2, '会社', 'かいしゃ', '25dda620-f5a1-476f-8bb1-bef2843c78ea', 3, 5, '[{"t":"会社","r":"かいしゃ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-4', 3, 'に', NULL, '05bb22cc-d56f-436c-b3ba-710cb3e2e41a', 5, 6, '[{"t":"に"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-4', 4, '行く', 'いく', '6897cf00-2694-4be3-bbf5-0486e60dcdcb', 6, 8, '[{"t":"行","r":"い"},{"t":"く"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-dict-4', 5, '。', NULL, NULL, 8, 9, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-2', 0, '手紙', 'てがみ', '041bc6df-1284-47ba-95ff-b197c144f360', 0, 2, '[{"t":"手紙","r":"てがみ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-2', 1, 'を', 'お', NULL, 2, 3, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-2', 2, '書く', 'かく', 'd28ed980-0333-4bf5-aab0-e7947c6ee424', 3, 5, '[{"t":"書","r":"か"},{"t":"く"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-2', 3, '。', NULL, NULL, 5, 6, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-3', 0, '毎日', 'まいにち', '7475b67c-3081-49d9-81ce-4065be5e79f2', 0, 2, '[{"t":"毎日","r":"まいにち"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-3', 1, '勉強する', NULL, 'b5a69b9b-5017-4a76-b301-dbd5c9f5ba2a', 2, 6, '[{"t":"勉強する"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-3', 2, '。', NULL, NULL, 6, 7, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-4', 0, '友だち', 'ともだち', '826a97e0-e8f0-4ae7-a4ce-c9899a7a3c6f', 0, 3, '[{"t":"友","r":"とも"},{"t":"だち"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-4', 1, 'が', NULL, NULL, 3, 4, '[{"t":"が"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-4', 2, '来る', 'くる', 'e40f6686-fee0-4bc0-820d-ba5c272193a8', 4, 6, '[{"t":"来","r":"く"},{"t":"る"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-4', 3, '。', NULL, NULL, 6, 7, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-1', 0, '毎日', 'まいにち', '7475b67c-3081-49d9-81ce-4065be5e79f2', 0, 2, '[{"t":"毎日","r":"まいにち"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-1', 1, '勉強します', NULL, 'b5a69b9b-5017-4a76-b301-dbd5c9f5ba2a', 2, 7, '[{"t":"勉強します"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-1', 2, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-3', 0, '明日', 'あした', '823cfb1a-cb34-4c88-86d6-5cdfca69eed5', 0, 2, '[{"t":"明日","r":"あした"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-3', 1, '会社', 'かいしゃ', '25dda620-f5a1-476f-8bb1-bef2843c78ea', 2, 4, '[{"t":"会社","r":"かいしゃ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-3', 2, 'に', NULL, '05bb22cc-d56f-436c-b3ba-710cb3e2e41a', 4, 5, '[{"t":"に"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-3', 3, '行きます', 'いきます', '6897cf00-2694-4be3-bbf5-0486e60dcdcb', 5, 9, '[{"t":"行","r":"い"},{"t":"きます"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-3', 4, '。', NULL, NULL, 9, 10, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-4', 0, 'お茶', 'おちゃ', '99ec9749-6643-4371-9ba0-25d05cb28c8a', 0, 2, '[{"t":"お"},{"t":"茶","r":"ちゃ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-4', 1, 'を', 'お', NULL, 2, 3, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-4', 2, '飲みます', 'のみます', '4ed30497-acb5-467e-ba5b-898fbc4c4c7c', 3, 7, '[{"t":"飲","r":"の"},{"t":"みます"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-4', 3, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-1', 0, 'ご飯', 'ごはん', 'ef7c1c27-7c91-46bf-9abf-1bb2ab95f4dc', 0, 2, '[{"t":"ご"},{"t":"飯","r":"はん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-1', 1, 'を', 'お', NULL, 2, 3, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-1', 2, '食べて', 'たべて', '788557df-2bac-4ae7-a157-8a81fbe1da16', 3, 6, '[{"t":"食","r":"た"},{"t":"べて"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-1', 3, '、', NULL, NULL, 6, 7, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-1', 4, 'テレビ', NULL, '78089363-6ebf-428e-8b21-c594934ee626', 7, 10, '[{"t":"テレビ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-1', 5, 'を', 'お', NULL, 10, 11, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-1', 6, '見ます', 'みます', '85ec6cc4-0dca-4479-abcf-d53e33fc9e49', 11, 14, '[{"t":"見","r":"み"},{"t":"ます"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-1', 7, '。', NULL, NULL, 14, 15, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-2', 0, '少し', 'すこし', 'c3fea249-9141-44a5-a822-a2bbe599d73d', 0, 2, '[{"t":"少","r":"すこ"},{"t":"し"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-2', 1, '待って', 'まって', '9e737ca0-2423-4337-859c-402dded4a3a7', 2, 5, '[{"t":"待","r":"ま"},{"t":"って"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-2', 2, 'ください', NULL, '1ae2c483-be5f-49ac-ae8b-388c185550f1', 5, 9, '[{"t":"ください"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-2', 3, '。', NULL, NULL, 9, 10, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-3', 0, '手', 'て', '0efec346-391e-41b1-af6c-f48b68b9eec1', 0, 1, '[{"t":"手","r":"て"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-3', 1, 'を', 'お', NULL, 1, 2, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-3', 2, '洗って', 'あらって', '2bbb8c32-86e8-4c45-a12b-1174a8f4d189', 2, 5, '[{"t":"洗","r":"あら"},{"t":"って"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-3', 3, '、', NULL, NULL, 5, 6, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-3', 4, '座って', 'すわって', '22244406-e875-4888-97e1-59a0604c4182', 6, 9, '[{"t":"座","r":"すわ"},{"t":"って"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-3', 5, 'ください', NULL, '1ae2c483-be5f-49ac-ae8b-388c185550f1', 9, 13, '[{"t":"ください"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-3', 6, '。', NULL, NULL, 13, 14, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-4', 0, '電話して', 'でんわして', 'd39abe7d-c638-4789-b2c7-368c66d1feec', 0, 4, '[{"t":"電話","r":"でんわ"},{"t":"して"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-4', 1, '、', NULL, NULL, 4, 5, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-4', 2, '会社', 'かいしゃ', '25dda620-f5a1-476f-8bb1-bef2843c78ea', 5, 7, '[{"t":"会社","r":"かいしゃ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-4', 3, 'に', NULL, '05bb22cc-d56f-436c-b3ba-710cb3e2e41a', 7, 8, '[{"t":"に"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-4', 4, '行きます', 'いきます', '6897cf00-2694-4be3-bbf5-0486e60dcdcb', 8, 12, '[{"t":"行","r":"い"},{"t":"きます"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-te-4', 5, '。', NULL, NULL, 12, 13, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-1', 0, '昨日', 'きのう', '89b5855e-63be-4984-8c64-31de7d611fca', 0, 2, '[{"t":"昨日","r":"きのう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-1', 1, '映画', 'えいが', '94093c2a-fa1e-4b90-9f87-b13ba46cd7fb', 2, 4, '[{"t":"映画","r":"えいが"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-1', 2, 'を', 'お', NULL, 4, 5, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-1', 3, '見た', 'みた', '85ec6cc4-0dca-4479-abcf-d53e33fc9e49', 5, 7, '[{"t":"見","r":"み"},{"t":"た"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-1', 4, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-2', 0, 'ご飯', 'ごはん', 'ef7c1c27-7c91-46bf-9abf-1bb2ab95f4dc', 0, 2, '[{"t":"ご"},{"t":"飯","r":"はん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-2', 1, 'は', 'わ', '0dacf911-48fa-4c5e-8d6f-d2b5cd33a0b6', 2, 3, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-2', 2, 'もう', NULL, '4f205665-62ea-4fe1-acdc-39a4ae8265d6', 3, 5, '[{"t":"もう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-2', 3, '食べた', 'たべた', '788557df-2bac-4ae7-a157-8a81fbe1da16', 5, 8, '[{"t":"食","r":"た"},{"t":"べた"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-2', 4, '。', NULL, NULL, 8, 9, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-3', 0, '友だち', 'ともだち', '826a97e0-e8f0-4ae7-a4ce-c9899a7a3c6f', 0, 3, '[{"t":"友","r":"とも"},{"t":"だち"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-3', 1, 'に', NULL, '05bb22cc-d56f-436c-b3ba-710cb3e2e41a', 3, 4, '[{"t":"に"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-3', 2, '会った', 'あった', '887821df-833f-4aac-a413-7ae78d3cfe17', 4, 7, '[{"t":"会","r":"あ"},{"t":"った"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-3', 3, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-4', 0, '分かった', 'わかった', '3d9bdd1b-da65-41a9-8893-79f313127e27', 0, 4, '[{"t":"分","r":"わ"},{"t":"かった"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-ta-4', 1, '！', NULL, NULL, 4, 5, '[{"t":"！"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-1', 0, '今', 'いま', '211a9114-232d-4565-8f69-fdc19c1744c2', 0, 1, '[{"t":"今","r":"いま"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-1', 1, '、', NULL, NULL, 1, 2, '[{"t":"、"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-1', 2, '本', 'ほん', 'beca25ad-0afa-4c20-bb1f-06c53a60f4ad', 2, 3, '[{"t":"本","r":"ほん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-1', 3, 'を', 'お', NULL, 3, 4, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-1', 4, '読んで', 'よんで', '1c659ec9-be5a-4805-ab6c-51ceda5763fb', 4, 7, '[{"t":"読","r":"よ"},{"t":"んで"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-1', 5, 'いる', NULL, '8f76acbd-be42-4fdd-a77e-fa4cd0899a1b', 7, 9, '[{"t":"いる"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-1', 6, '。', NULL, NULL, 9, 10, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-2', 0, '雨', 'あめ', '754619f1-15a8-48dc-a8c0-81c74ea9a69a', 0, 1, '[{"t":"雨","r":"あめ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-2', 1, 'が', NULL, NULL, 1, 2, '[{"t":"が"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-2', 2, '降って', 'ふって', '5ace5ec6-4992-4ab8-abbb-6ee6dd197435', 2, 5, '[{"t":"降","r":"ふ"},{"t":"って"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-2', 3, 'いる', NULL, '8f76acbd-be42-4fdd-a77e-fa4cd0899a1b', 5, 7, '[{"t":"いる"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-2', 4, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-3', 0, '日本', 'にほん', '9de924d0-d7d7-4284-bbae-c05ecbef3e5e', 0, 2, '[{"t":"日本","r":"にほん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-3', 1, 'に', NULL, '05bb22cc-d56f-436c-b3ba-710cb3e2e41a', 2, 3, '[{"t":"に"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-3', 2, '住んで', 'すんで', '7922cfdf-4679-4114-8d6a-192b3ecb54b3', 3, 6, '[{"t":"住","r":"す"},{"t":"んで"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-3', 3, 'いる', NULL, '8f76acbd-be42-4fdd-a77e-fa4cd0899a1b', 6, 8, '[{"t":"いる"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-3', 4, '。', NULL, NULL, 8, 9, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-4', 0, '彼', 'かれ', 'b93da0ef-2b8a-4dad-b645-8b25ad756914', 0, 1, '[{"t":"彼","r":"かれ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-4', 1, 'は', 'わ', '0dacf911-48fa-4c5e-8d6f-d2b5cd33a0b6', 1, 2, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-4', 2, '結婚して', 'けっこんして', '0454357b-7542-44a9-b003-c9e3ecdaef90', 2, 6, '[{"t":"結婚","r":"けっこん"},{"t":"して"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-4', 3, 'いる', NULL, '8f76acbd-be42-4fdd-a77e-fa4cd0899a1b', 6, 8, '[{"t":"いる"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-teiru-4', 4, '。', NULL, NULL, 8, 9, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-1', 0, '今日', 'きょう', '3e025dc9-b02a-42a8-9558-47084b9e5e32', 0, 2, '[{"t":"今日","r":"きょう"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-1', 1, 'は', 'わ', '0dacf911-48fa-4c5e-8d6f-d2b5cd33a0b6', 2, 3, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-1', 2, '行かない', 'いかない', '6897cf00-2694-4be3-bbf5-0486e60dcdcb', 3, 7, '[{"t":"行","r":"い"},{"t":"かない"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-1', 3, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-2', 0, 'お酒', 'おさけ', 'd3b89b1f-f075-490d-9bec-295dda0ae069', 0, 2, '[{"t":"お"},{"t":"酒","r":"さけ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-2', 1, 'は', 'わ', '0dacf911-48fa-4c5e-8d6f-d2b5cd33a0b6', 2, 3, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-2', 2, '飲まない', 'のまない', '4ed30497-acb5-467e-ba5b-898fbc4c4c7c', 3, 7, '[{"t":"飲","r":"の"},{"t":"まない"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-2', 3, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-3', 0, '何', 'なに', '39226ec4-356a-41c4-a270-2d76dda6f89e', 0, 1, '[{"t":"何","r":"なに"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-3', 1, 'も', NULL, NULL, 1, 2, '[{"t":"も"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-3', 2, '食べない', 'たべない', '788557df-2bac-4ae7-a157-8a81fbe1da16', 2, 6, '[{"t":"食","r":"た"},{"t":"べない"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-3', 3, '。', NULL, NULL, 6, 7, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-4', 0, '分からない', 'わからない', '3d9bdd1b-da65-41a9-8893-79f313127e27', 0, 5, '[{"t":"分","r":"わ"},{"t":"からない"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-nai-4', 1, '。', NULL, NULL, 5, 6, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-3', 0, '母', 'はは', '85939c87-5d17-44b2-affc-26fb46091623', 0, 1, '[{"t":"母","r":"はは"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-3', 1, 'は', 'わ', '0dacf911-48fa-4c5e-8d6f-d2b5cd33a0b6', 1, 2, '[{"t":"は"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-3', 2, '先生', 'せんせい', 'f2bd1cf4-e22c-48f8-a563-771e2f0599a9', 2, 4, '[{"t":"先生","r":"せんせい"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-3', 3, 'で', NULL, '107c2108-67cd-4a47-b42b-0e4f19b2a745', 4, 5, '[{"t":"で"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-3', 4, 'す', NULL, NULL, 5, 6, '[{"t":"す"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-desu-3', 5, '。', NULL, NULL, 6, 7, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-1', 0, '毎朝', 'まいあさ', '8c5d3deb-3d5e-4808-9058-cb502a0aa843', 0, 2, '[{"t":"毎朝","r":"まいあさ"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-1', 1, '早く', NULL, '416d3a31-5940-475c-8c7f-d7997aff8665', 2, 4, '[{"t":"早く"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-1', 2, '起きる', 'おきる', '5fb365d9-60b4-4d75-a1c7-5170ce4bbcf5', 4, 7, '[{"t":"起","r":"お"},{"t":"きる"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-vclass-1', 3, '。', NULL, NULL, 7, 8, '[{"t":"。"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-2', 0, '朝ご飯', 'あさごはん', '57b8c859-cd68-40a7-932e-bc4f035e1454', 0, 3, '[{"t":"朝","r":"あさ"},{"t":"ご"},{"t":"飯","r":"はん"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-2', 1, 'を', 'お', NULL, 3, 4, '[{"t":"を"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-2', 2, '食べます', 'たべます', '788557df-2bac-4ae7-a157-8a81fbe1da16', 4, 8, '[{"t":"食","r":"た"},{"t":"べます"}]'::jsonb),
  (gen_random_uuid()::text, 'sent-ex-masu-2', 3, '。', NULL, NULL, 8, 9, '[{"t":"。"}]'::jsonb);
