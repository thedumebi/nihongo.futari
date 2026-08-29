-- Rewrite the dialogue explanations without Japanese script.
--
-- "ください takes を, not が" is exactly the sentence a reader who asked for no
-- characters cannot read — and this feature exists for that reader. The terms
-- go into romaji, which both audiences can follow: someone reading kana still
-- understands "kudasai takes o, not ga".
--
-- The alternative was a per-term markup so each explanation could render in
-- either script. That is a format to invent, parse and maintain for a handful
-- of sentences, and it would still leave the kana reader reading romaji terms
-- half the time.

UPDATE dialogue_replies SET why_wrong = v.reason FROM (VALUES
  ('dr-rest-order-1b', 'kudasai takes o, not ga. ga marks the thing doing something; you are asking FOR the menu, not saying the menu acts.'),
  ('dr-rest-order-1c', 'kure is the bare command form of kureru. It is what you say to a younger brother, not to someone serving you.'),
  ('dr-rest-order-3b', 'sore is "that one, near you". The menu is in your hands, so kore is the one you want.'),
  ('dr-rest-order-3c', 'wa makes kore the topic — "as for this one" — which sets up a contrast you never finish. Ordering takes o.'),
  ('dr-rest-order-5b', 'hoshii states your own desire and is blunt to a stranger. onegaishimasu asks, which is what you want with someone serving you.'),
  ('dr-rest-order-5c', 'onegaishimasu comes from negau, so the stem is negai — onegaimasu drops the i and is not a word.'),
  ('dr-rest-pay-0b', 'okane is money itself — this asks them to give you some. The bill is okaikei.'),
  ('dr-rest-pay-0c', 'Understandable, but kudasai asks for an object handed over. For a service — settling up — onegaishimasu is what is said.'),
  ('dr-rest-pay-2b', 'ii is an adjective, not a verb, so it takes no object. de marks the means — paying BY card.'),
  ('dr-rest-pay-2c', 'ga here asks which THEY would prefer, as if offering them a choice. de asks whether your card is acceptable.'),
  ('dr-rest-pay-4b', 'itadakimasu is said BEFORE eating. Afterwards it is gochisousama deshita.'),
  ('dr-rest-pay-4c', 'oishii is an i-adjective and carries its own past: oishikatta desu. i-adjectives never take deshita.'),
  ('dr-konbini-buy-2b', 'Not wrong exactly, but they asked with hitotsu. Answering with the counter they used is what a native does.'),
  ('dr-konbini-buy-2c', 'nin counts people. A bento takes tsu — Japanese counters classify by what is being counted.'),
  ('dr-konbini-buy-4b', 'kudasai asks THEM to give you something. You are the one handing money over, so douzo.'),
  ('dr-konbini-buy-4c', 'onegaishimasu asks for a favour. Nothing is being requested here — you are simply offering the money.'),
  ('dr-konbini-warm-1b', 'That says YOU will warm it. They offered to do it, so you accept rather than announce.'),
  ('dr-konbini-warm-1c', 'Thanking them before they have done it is odd, and plain arigatou is too casual for a shop.'),
  ('dr-konbini-warm-3b', 'Correct Japanese, but flat — it is the tone of refusing a form you did not ask for. daijoubu desu softens it.'),
  ('dr-konbini-warm-3c', 'ii desu is genuinely ambiguous — it can mean "yes, good" or "no thanks" — and shop staff often have to ask again.'),
  ('dr-station-ticket-0b', 'ni marks a destination you arrive at. A fare covers the distance travelled, so it takes made — as far as Kyoto.'),
  ('dr-station-ticket-0c', 'ikutsu asks how MANY. Price is ikura — the two look alike and mean quite different things.'),
  ('dr-station-ticket-2b', 'tsu is the general counter. A ticket is flat, and flat things take mai — nimai.'),
  ('dr-station-ticket-2c', 'The counter goes after the thing it counts: kippu o nimai, not nimai kippu o.'),
  ('dr-station-lost-0b', 'doko is the question word, so ga belongs with it — doko desu ka already asks. The thing you are asking about takes wa.'),
  ('dr-station-lost-0c', 'That asks where Kyoto goes. You want the platform, so ask about kyouto-yuki — the Kyoto-bound train.'),
  ('dr-station-lost-2b', 'A question word can never take wa — you cannot make a topic of the thing you are asking about.'),
  ('dr-station-lost-2c', 'itsu takes no ni, and it asks "when" in general. For a clock time the word is nanji.'),
  ('dr-station-lost-4b', 'The past form closes something finished. They have just told you the time and you are about to walk to the platform, so the present fits.'),
  ('dr-station-lost-4c', 'sumimasen does double duty as thanks, but after someone has actually helped you it reads as another apology rather than gratitude.')
) AS v(id, reason) WHERE dialogue_replies.id = v.id;
