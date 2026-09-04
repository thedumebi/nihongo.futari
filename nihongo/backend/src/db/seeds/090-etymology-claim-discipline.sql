-- Stop six entries asserting more than their source says.
--
-- Review triage flagged these: the citation is real and the claim follows from
-- it, but the BODY then adds something the passage never granted. That is the
-- failure mode verbatim quoting cannot catch — a draft can quote correctly and
-- still overreach in the sentence after.
--
-- Each rewrite says less, and what is left is checkable against the same
-- source. Where a fact is genuinely useful and genuinely uncited it is gone,
-- not hedged into vagueness.

-- 学 and 戦: the passages say "simplified from 學/戰" and nothing about typing.
-- "Fewer strokes, easier to type" is also weak on its own terms — kanji are
-- typed by reading through an IME, where stroke count costs nothing.
UPDATE etymology_entries SET body =
  '學 and 学 are one character. 學 is what you meet in anything printed before the postwar reforms, and in Chinese outside the mainland; 学 is the shinjitai. The bottom 子 is untouched — the whole change is in the upper element.',
  updated_at = now()
WHERE id = 'e35f95c9-c888-4018-b794-4934242588db';

UPDATE etymology_entries SET body =
  '戰 is the pre-reform form, 戦 the shinjitai. The right-hand 戈 — the halberd that carries the meaning — is unchanged; the simplification is entirely on the left, where 單 became 単.',
  updated_at = now()
WHERE id = '929a8edb-8b99-4237-9439-a4a1760e0fcb';

-- イクラ: the date and the displaced word are cited. "Luxury food" was not.
UPDATE etymology_entries SET body =
  'First cited in Japanese in 1928, displacing the older 鮞 (hararago). Russian икра́ covers roe of any fish; Japanese narrowed it to salmon roe alone, which is why イクラ names the loose eggs and 筋子 the same roe still in its membrane.',
  updated_at = now()
WHERE id = '61a0b6d1-df9a-4df0-aea5-3fcb05f9ccfc';

-- 先: the cognate with 崎 is cited. The bridge to さっき was invented to tidy
-- the paragraph, and さっき is a different word with its own history.
UPDATE etymology_entries SET body =
  'It is cognate with 崎 — the cape or headland that juts into the sea. The shared sense is a point that sticks out in front, which is why the one word covers the tip of a pen, the head of a queue and the place you are going next.',
  updated_at = now()
WHERE id = 'ac60a582-4b1c-4c50-abda-3941cc471f65';

-- の: "one of three particles" and "primary" were not in the passage. What is
-- supported is that it linked noun to noun in Old Japanese and still does.
UPDATE etymology_entries SET body =
  'The job has not changed in twelve hundred years: put の between two nouns and the first modifies the second. Old Japanese had other particles that did the same work — が among them, which is why 我が国 still reads as "my country" — and の is the one that stayed general.',
  updated_at = now()
WHERE id = '70a69d3f-c35b-4660-b2dd-874f53ea46e3';

-- ええ: the body restated the claim and stopped. A sound shift is worth
-- explaining or worth cutting.
UPDATE etymology_entries SET body =
  'よい lost its consonant and became いい in the east and ええ in the west, which is why Kansai says ええ where Tokyo says いい and both mean the same thing. The written form stayed 良い for all of them, so the spelling gives no hint which one a speaker will say.',
  updated_at = now()
WHERE id = '6424ff28-f23d-478e-8a14-ab05408aa1b8';

-- The three hand-authored derivations are stated as settled where specialists
-- offer competing chains. Marked disputed and hedged in the text, which is what
-- "attested" was already trying to say for でしょう and was not saying for the
-- other two.
UPDATE etymology_entries SET confidence = 'probable', is_disputed = true, updated_at = now()
WHERE id IN ('ety-desu', 'ety-masu', 'ety-deshou');

UPDATE etymology_entries SET body = coalesce(body, '') ||
  E'\n\nThe chain is reconstructed rather than recorded, and specialists propose more than one route; treat it as the likeliest account rather than the settled one.',
  updated_at = now()
WHERE id IN ('ety-desu', 'ety-masu', 'ety-deshou')
  AND coalesce(body, '') !~ 'reconstructed rather than recorded';
