-- Put word breaks into the dialogue readings.
--
-- The romaji surface transliterates `reading_kana` directly, and Japanese is
-- written without spaces, so "すみませんメニューおください" came out as
-- "sumimasenmenyuuokudasai" — the correct reading and unreadable.
--
-- Splitting kana into words needs part-of-speech, and the tokeniser left that
-- empty on every row. So the break points are authored, the same way the
-- spoken particles are. A space here means a space in the romaji; the kana
-- rendering strips them, so nothing else changes.

UPDATE dialogue_turns SET reading_kana = v.reading FROM (VALUES
  ('dt-rest-order-0', 'いらっしゃいませ。'),
  ('dt-rest-order-1', 'すみません、メニュー お ください。'),
  ('dt-rest-order-2', 'はい、どうぞ。'),
  ('dt-rest-order-3', 'これ お おねがいします。'),
  ('dt-rest-order-4', 'おのみもの わ。'),
  ('dt-rest-order-5', 'おみず お おねがいします。'),
  ('dt-rest-pay-0', 'すみません、おかいけい お おねがいします。'),
  ('dt-rest-pay-1', 'せん にひゃく えん です。'),
  ('dt-rest-pay-2', 'カード で いい です か。'),
  ('dt-rest-pay-3', 'はい、だいじょうぶ です。'),
  ('dt-rest-pay-4', 'ごちそうさま でした。'),
  ('dt-konbini-buy-0', 'いらっしゃいませ。'),
  ('dt-konbini-buy-1', 'おべんとう わ ひとつ です か。'),
  ('dt-konbini-buy-2', 'はい、ひとつ です。'),
  ('dt-konbini-buy-3', 'ごひゃく えん です。'),
  ('dt-konbini-buy-4', 'はい、どうぞ。'),
  ('dt-konbini-warm-0', 'おべんとう わ あたためます か。'),
  ('dt-konbini-warm-1', 'はい、おねがいします。'),
  ('dt-konbini-warm-2', 'おはし わ いります か。'),
  ('dt-konbini-warm-3', 'いいえ、だいじょうぶ です。'),
  ('dt-station-ticket-0', 'すみません、きょうと まで いくら です か。'),
  ('dt-station-ticket-1', 'せん よんひゃく えん です。'),
  ('dt-station-ticket-2', 'きっぷ お にまい ください。'),
  ('dt-station-ticket-3', 'はい、にせん はっぴゃく えん です。'),
  ('dt-station-lost-0', 'すみません、きょうとゆき わ どこ です か。'),
  ('dt-station-lost-1', 'さんばんせん です。'),
  ('dt-station-lost-2', 'なんじ に でます か。'),
  ('dt-station-lost-3', 'じゅうじはん です。'),
  ('dt-station-lost-4', 'ありがとうございます。')
) AS v(id, reading) WHERE dialogue_turns.id = v.id;

UPDATE dialogue_replies SET reading_kana = v.reading FROM (VALUES
  ('dr-rest-order-1a', 'すみません、メニュー お ください。'),
  ('dr-rest-order-1b', 'すみません、メニュー が ください。'),
  ('dr-rest-order-1c', 'すみません、メニュー お くれ。'),
  ('dr-rest-order-3a', 'これ お おねがいします。'),
  ('dr-rest-order-3b', 'それ お おねがいします。'),
  ('dr-rest-order-3c', 'これ わ おねがいします。'),
  ('dr-rest-order-5a', 'おみず お おねがいします。'),
  ('dr-rest-order-5b', 'おみず が ほしい です。'),
  ('dr-rest-order-5c', 'おみず お おねがいます。'),
  ('dr-rest-pay-0a', 'すみません、おかいけい お おねがいします。'),
  ('dr-rest-pay-0b', 'すみません、おかね お おねがいします。'),
  ('dr-rest-pay-0c', 'すみません、おかいけい お ください。'),
  ('dr-rest-pay-2a', 'カード で いい です か。'),
  ('dr-rest-pay-2b', 'カード お いい です か。'),
  ('dr-rest-pay-2c', 'カード が いい です か。'),
  ('dr-rest-pay-4a', 'ごちそうさま でした。'),
  ('dr-rest-pay-4b', 'いただきます。'),
  ('dr-rest-pay-4c', 'おいしい でした。'),
  ('dr-konbini-buy-2a', 'はい、ひとつ です。'),
  ('dr-konbini-buy-2b', 'はい、いっこ です。'),
  ('dr-konbini-buy-2c', 'はい、ひとり です。'),
  ('dr-konbini-buy-4a', 'はい、どうぞ。'),
  ('dr-konbini-buy-4b', 'はい、ください。'),
  ('dr-konbini-buy-4c', 'はい、おねがいします。'),
  ('dr-konbini-warm-1a', 'はい、おねがいします。'),
  ('dr-konbini-warm-1b', 'はい、あたためます。'),
  ('dr-konbini-warm-1c', 'はい、ありがとう。'),
  ('dr-konbini-warm-3a', 'いいえ、だいじょうぶ です。'),
  ('dr-konbini-warm-3b', 'いいえ、いりません。'),
  ('dr-konbini-warm-3c', 'いいえ、いい です。'),
  ('dr-station-ticket-0a', 'すみません、きょうと まで いくら です か。'),
  ('dr-station-ticket-0b', 'すみません、きょうと に いくら です か。'),
  ('dr-station-ticket-0c', 'すみません、きょうと まで いくつ です か。'),
  ('dr-station-ticket-2a', 'きっぷ お にまい ください。'),
  ('dr-station-ticket-2b', 'きっぷ お ふたつ ください。'),
  ('dr-station-ticket-2c', 'にまい きっぷ お ください。'),
  ('dr-station-lost-0a', 'すみません、きょうとゆき わ どこ です か。'),
  ('dr-station-lost-0b', 'すみません、きょうとゆき が どこ です か。'),
  ('dr-station-lost-0c', 'すみません、きょうと わ どこ に いきます か。'),
  ('dr-station-lost-2a', 'なんじ に でます か。'),
  ('dr-station-lost-2b', 'なんじ わ でます か。'),
  ('dr-station-lost-2c', 'いつ に でます か。'),
  ('dr-station-lost-4a', 'ありがとうございます。'),
  ('dr-station-lost-4b', 'ありがとうございました。'),
  ('dr-station-lost-4c', 'すみません。')
) AS v(id, reading) WHERE dialogue_replies.id = v.id;
