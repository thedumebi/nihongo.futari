-- Conversation lines whose reading does not say what the line says, for review.
--
-- The reading checker (pipeline/check-line-readings.ts) found five lines whose
-- kana leave out or change words in the text: お使いください read as つかって
-- ください, お置き as おき, a reply missing ごめん, another missing でしょう,
-- and a stray よ. With a reading that does not fit, no word of the line can be
-- given its own reading. The authored data is already fixed; nothing changes
-- here: each line becomes a proposal in the admin review queue (Corrections),
-- and approving it applies the new reading to the line and to the study
-- queue's copy of its conversation.
--
-- Lines are found by their text and current reading, so a line already fixed
-- or already awaiting review is skipped.


INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, current, origin, priority, status)
SELECT 'crq-line-44a61091541065f0', d.language_id, 'dialogue_turns', t.id, 'update',
  jsonb_build_object('type', 'line', 'text', t.text, 'translation', t.translation, 'dialogue', d.title, 'from', t.reading_kana, 'to', 'ほけんしょう わ ごじつ、ゆうそう で おとどけ します。それ まで わ この しかく かくにんしょ お おつかい ください。', 'why', 'The text says お使いください; the reading said つかって ください.'),
  jsonb_build_object('reading', t.reading_kana), 'ai', 899, 'pending'
FROM dialogue_turns t JOIN dialogues d ON d.id = t.dialogue_id
WHERE t.text = '保険証は後日、郵送でお届けします。それまではこの資格確認書をお使いください。' AND t.reading_kana = 'ほけんしょう わ ごじつ、ゆうそう で おとどけ します。それ まで わ この しかく かくにんしょ お つかって ください。'
  AND NOT EXISTS (SELECT 1 FROM content_review_queue c WHERE c.target_table = 'dialogue_turns' AND c.target_id = t.id AND c.status = 'pending')
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, current, origin, priority, status)
SELECT 'crq-line-44a61091541065f0', d.language_id, 'dialogue_replies', t.id, 'update',
  jsonb_build_object('type', 'line', 'text', t.text, 'translation', t.translation, 'dialogue', d.title, 'from', t.reading_kana, 'to', 'ほけんしょう わ ごじつ、ゆうそう で おとどけ します。それ まで わ この しかく かくにんしょ お おつかい ください。', 'why', 'The text says お使いください; the reading said つかって ください.'),
  jsonb_build_object('reading', t.reading_kana), 'ai', 899, 'pending'
FROM dialogue_replies t JOIN dialogues d ON d.id = (SELECT dt.dialogue_id FROM dialogue_turns dt WHERE dt.id = t.turn_id)
WHERE t.text = '保険証は後日、郵送でお届けします。それまではこの資格確認書をお使いください。' AND t.reading_kana = 'ほけんしょう わ ごじつ、ゆうそう で おとどけ します。それ まで わ この しかく かくにんしょ お つかって ください。'
  AND NOT EXISTS (SELECT 1 FROM content_review_queue c WHERE c.target_table = 'dialogue_replies' AND c.target_id = t.id AND c.status = 'pending')
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, current, origin, priority, status)
SELECT 'crq-line-e4d3e4cb504a9a20', d.language_id, 'dialogue_turns', t.id, 'update',
  jsonb_build_object('type', 'line', 'text', t.text, 'translation', t.translation, 'dialogue', d.title, 'from', t.reading_kana, 'to', 'あちら に りょうがえき が あります よ。せんえんさつ が つかえます。', 'why', 'The reading ended with a よ the text does not have.'),
  jsonb_build_object('reading', t.reading_kana), 'ai', 899, 'pending'
FROM dialogue_turns t JOIN dialogues d ON d.id = t.dialogue_id
WHERE t.text = 'あちらに両替機がありますよ。1000円札が使えます。' AND t.reading_kana = 'あちら に りょうがえき が あります よ。せんえんさつ が つかえます よ。'
  AND NOT EXISTS (SELECT 1 FROM content_review_queue c WHERE c.target_table = 'dialogue_turns' AND c.target_id = t.id AND c.status = 'pending')
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, current, origin, priority, status)
SELECT 'crq-line-e4d3e4cb504a9a20', d.language_id, 'dialogue_replies', t.id, 'update',
  jsonb_build_object('type', 'line', 'text', t.text, 'translation', t.translation, 'dialogue', d.title, 'from', t.reading_kana, 'to', 'あちら に りょうがえき が あります よ。せんえんさつ が つかえます。', 'why', 'The reading ended with a よ the text does not have.'),
  jsonb_build_object('reading', t.reading_kana), 'ai', 899, 'pending'
FROM dialogue_replies t JOIN dialogues d ON d.id = (SELECT dt.dialogue_id FROM dialogue_turns dt WHERE dt.id = t.turn_id)
WHERE t.text = 'あちらに両替機がありますよ。1000円札が使えます。' AND t.reading_kana = 'あちら に りょうがえき が あります よ。せんえんさつ が つかえます よ。'
  AND NOT EXISTS (SELECT 1 FROM content_review_queue c WHERE c.target_table = 'dialogue_replies' AND c.target_id = t.id AND c.status = 'pending')
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, current, origin, priority, status)
SELECT 'crq-line-53f1b1b262e63f22', d.language_id, 'dialogue_turns', t.id, 'update',
  jsonb_build_object('type', 'line', 'text', t.text, 'translation', t.translation, 'dialogue', d.title, 'from', t.reading_kana, 'to', 'サンドイッチ わ おせき まで おもち します ので、こちら の ばんごうふだ お みえる ところ に おおき ください。', 'why', 'The text says お置きください; the reading said おき ください.'),
  jsonb_build_object('reading', t.reading_kana), 'ai', 899, 'pending'
FROM dialogue_turns t JOIN dialogues d ON d.id = t.dialogue_id
WHERE t.text = 'サンドイッチはお席までお持ちしますので、こちらの番号札を見えるところにお置きください。' AND t.reading_kana = 'サンドイッチ わ おせき まで おもち します ので、こちら の ばんごうふだ お みえる ところ に おき ください。'
  AND NOT EXISTS (SELECT 1 FROM content_review_queue c WHERE c.target_table = 'dialogue_turns' AND c.target_id = t.id AND c.status = 'pending')
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, current, origin, priority, status)
SELECT 'crq-line-53f1b1b262e63f22', d.language_id, 'dialogue_replies', t.id, 'update',
  jsonb_build_object('type', 'line', 'text', t.text, 'translation', t.translation, 'dialogue', d.title, 'from', t.reading_kana, 'to', 'サンドイッチ わ おせき まで おもち します ので、こちら の ばんごうふだ お みえる ところ に おおき ください。', 'why', 'The text says お置きください; the reading said おき ください.'),
  jsonb_build_object('reading', t.reading_kana), 'ai', 899, 'pending'
FROM dialogue_replies t JOIN dialogues d ON d.id = (SELECT dt.dialogue_id FROM dialogue_turns dt WHERE dt.id = t.turn_id)
WHERE t.text = 'サンドイッチはお席までお持ちしますので、こちらの番号札を見えるところにお置きください。' AND t.reading_kana = 'サンドイッチ わ おせき まで おもち します ので、こちら の ばんごうふだ お みえる ところ に おき ください。'
  AND NOT EXISTS (SELECT 1 FROM content_review_queue c WHERE c.target_table = 'dialogue_replies' AND c.target_id = t.id AND c.status = 'pending')
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, current, origin, priority, status)
SELECT 'crq-line-7b0c0044047a538e', d.language_id, 'dialogue_turns', t.id, 'update',
  jsonb_build_object('type', 'line', 'text', t.text, 'translation', t.translation, 'dialogue', d.title, 'from', t.reading_kana, 'to', 'ほんとうに ごめん。うめあわせ します。', 'why', 'The reading left out ごめん。'),
  jsonb_build_object('reading', t.reading_kana), 'ai', 899, 'pending'
FROM dialogue_turns t JOIN dialogues d ON d.id = t.dialogue_id
WHERE t.text = '本当にごめん。埋め合わせします。' AND t.reading_kana = 'ほんとうに うめあわせ します。'
  AND NOT EXISTS (SELECT 1 FROM content_review_queue c WHERE c.target_table = 'dialogue_turns' AND c.target_id = t.id AND c.status = 'pending')
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, current, origin, priority, status)
SELECT 'crq-line-7b0c0044047a538e', d.language_id, 'dialogue_replies', t.id, 'update',
  jsonb_build_object('type', 'line', 'text', t.text, 'translation', t.translation, 'dialogue', d.title, 'from', t.reading_kana, 'to', 'ほんとうに ごめん。うめあわせ します。', 'why', 'The reading left out ごめん。'),
  jsonb_build_object('reading', t.reading_kana), 'ai', 899, 'pending'
FROM dialogue_replies t JOIN dialogues d ON d.id = (SELECT dt.dialogue_id FROM dialogue_turns dt WHERE dt.id = t.turn_id)
WHERE t.text = '本当にごめん。埋め合わせします。' AND t.reading_kana = 'ほんとうに うめあわせ します。'
  AND NOT EXISTS (SELECT 1 FROM content_review_queue c WHERE c.target_table = 'dialogue_replies' AND c.target_id = t.id AND c.status = 'pending')
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, current, origin, priority, status)
SELECT 'crq-line-131fdcffa275e823', d.language_id, 'dialogue_turns', t.id, 'update',
  jsonb_build_object('type', 'line', 'text', t.text, 'translation', t.translation, 'dialogue', d.title, 'from', t.reading_kana, 'to', 'いま、ただしい ファイル お おおくり して もらいました。ごかくにん いただけます でしょう か。', 'why', 'The reading left out でしょう.'),
  jsonb_build_object('reading', t.reading_kana), 'ai', 899, 'pending'
FROM dialogue_turns t JOIN dialogues d ON d.id = t.dialogue_id
WHERE t.text = '今、正しいファイルをお送りしてもらいました。ご確認いただけますでしょうか。' AND t.reading_kana = 'いま、ただしい ファイル お おおくり して もらいました。ごかくにん いただけます か。'
  AND NOT EXISTS (SELECT 1 FROM content_review_queue c WHERE c.target_table = 'dialogue_turns' AND c.target_id = t.id AND c.status = 'pending')
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO content_review_queue (id, language_id, target_table, target_id, change_type, proposed, current, origin, priority, status)
SELECT 'crq-line-131fdcffa275e823', d.language_id, 'dialogue_replies', t.id, 'update',
  jsonb_build_object('type', 'line', 'text', t.text, 'translation', t.translation, 'dialogue', d.title, 'from', t.reading_kana, 'to', 'いま、ただしい ファイル お おおくり して もらいました。ごかくにん いただけます でしょう か。', 'why', 'The reading left out でしょう.'),
  jsonb_build_object('reading', t.reading_kana), 'ai', 899, 'pending'
FROM dialogue_replies t JOIN dialogues d ON d.id = (SELECT dt.dialogue_id FROM dialogue_turns dt WHERE dt.id = t.turn_id)
WHERE t.text = '今、正しいファイルをお送りしてもらいました。ご確認いただけますでしょうか。' AND t.reading_kana = 'いま、ただしい ファイル お おおくり して もらいました。ごかくにん いただけます か。'
  AND NOT EXISTS (SELECT 1 FROM content_review_queue c WHERE c.target_table = 'dialogue_replies' AND c.target_id = t.id AND c.status = 'pending')
LIMIT 1
ON CONFLICT DO NOTHING;
