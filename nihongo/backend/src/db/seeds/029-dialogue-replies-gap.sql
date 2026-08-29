-- Three learner turns in 028 shipped with no reply options, which makes them
-- unanswerable — the card would offer nothing to choose. Found by asserting
-- that every learner turn has exactly one correct reply and at least one
-- wrong one; the "exactly one correct" half passed because zero rows trivially
-- satisfies it, and the "at least one" half is what caught them.

INSERT INTO dialogue_replies (id, turn_id, text, reading_kana, translation, is_correct, why_wrong, sort_index) VALUES
  -- "Excuse me, how much is it to Kyoto?"
  ('dr-station-ticket-0a', 'dt-station-ticket-0', 'すみません、京都までいくらですか。', 'すみません、きょうとまでいくらですか。', 'Excuse me, how much is it to Kyoto?', true, null, 0),
  ('dr-station-ticket-0b', 'dt-station-ticket-0', 'すみません、京都にいくらですか。', 'すみません、きょうとにいくらですか。', null, false,
   'に marks a destination you arrive at. A fare covers the distance travelled, so it takes まで — as far as Kyoto.', 1),
  ('dr-station-ticket-0c', 'dt-station-ticket-0', 'すみません、京都までいくつですか。', 'すみません、きょうとまでいくつですか。', null, false,
   'いくつ asks how MANY. Price is いくら — the two look alike and mean quite different things.', 2),

  -- "Here you go." (handing over money)
  ('dr-konbini-buy-4a', 'dt-konbini-buy-4', 'はい、どうぞ。', 'はい、どうぞ。', 'Here you go.', true, null, 0),
  ('dr-konbini-buy-4b', 'dt-konbini-buy-4', 'はい、ください。', 'はい、ください。', null, false,
   'ください asks THEM to give you something. You are the one handing money over, so どうぞ.', 1),
  ('dr-konbini-buy-4c', 'dt-konbini-buy-4', 'はい、お願いします。', 'はい、おねがいします。', null, false,
   'お願いします asks for a favour. Nothing is being requested here — you are simply offering the money.', 2),

  -- "Thank you very much."
  ('dr-station-lost-4a', 'dt-station-lost-4', 'ありがとうございます。', 'ありがとうございます。', 'Thank you very much.', true, null, 0),
  ('dr-station-lost-4b', 'dt-station-lost-4', 'ありがとうございました。', 'ありがとうございました。', null, false,
   'The past form closes something finished. They have just told you the time and you are about to walk to the platform, so the present fits.', 1),
  ('dr-station-lost-4c', 'dt-station-lost-4', 'すみません。', 'すみません。', null, false,
   'すみません does double duty as thanks, but after someone has actually helped you it reads as another apology rather than gratitude.', 2)
ON CONFLICT (id) DO NOTHING;
