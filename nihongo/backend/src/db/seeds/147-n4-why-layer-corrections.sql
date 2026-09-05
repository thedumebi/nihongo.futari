-- Fable's N4 verification: 22 of 47 entries corrected, plus one published entry.
--
-- Same two systematic faults as N5, and a third the N5 pass did not reach.
--
--   PERIOD, in both directions. 様/やう is a Middle Chinese loan, so nothing
--   built on it can be Old Japanese — ようだ, ように, ようになる and ようにする all
--   move to Heian. Nominalising の is Late Middle Japanese, so のに and the
--   こと/の split are Edo. お〜になる and お〜する are late Edo to Meiji, not
--   Heian; Heian honorification ran on 給ふ and 奉る. And one was too LATE:
--   ばかり is already frequent in the Man'yōshū.
--
--   ETYMOLOGICAL FALLACY. 彼は寒い was called flatly ungrammatical, but the
--   restriction is on flat present-tense assertion — 彼は寒かった is ordinary in
--   narrative, and がる is one repair among several. 誰も was taught as
--   affirmative "anyone at all" when it is a negative-polarity item. たら was
--   called the only conditional taking a command, but なら takes one happily.
--   And 読み方 was said to voice to よみがた, which it does not — a learner
--   following that would mispronounce every 〜方 word at N4.
--
--   KANJI-SPELLING-AS-ETYMOLOGY, the fault なにと/等 exposed at N5. 呉 in
--   呉れる is ateji: it writes the sound and is not where くれる comes from,
--   which is obscure. The inward direction is a fact of usage, not derivation.
--
-- Two claims stated as settled that are contested go to 'attested': whether
-- the suffering passive descends from the spontaneous sense, and whether
-- modern らしい continues Old Japanese らし at all — the dominant account has
-- らし dead by Kamakura and the modern word growing out of the 男らしい suffix
-- in Edo, which makes the entry's derivation run backwards.
--
-- One outright FALSE: でしょう is not である + う. That is だろう. でしょう is
-- です + う, でせう before the kana reform. The same error sits in a PUBLISHED
-- entry from seed 012, and is corrected at the bottom of this file — the first
-- fault this verification has found in content a reader can already see.
--
-- Seeds 139-146 have run and are left alone; corrections ship as a new seed.


UPDATE etymology_entries SET body = 'Old Japanese had both: ば on the 未然形 was hypothetical, ば on the 已然形 meant "when" or "because" — something taken as actually so. The 未然形 construction died out, and the surviving 已然形 one took over the hypothetical meaning. Modern grammar renames that stem 仮定形, "hypothetical form", which quietly records the swap.

The old realis sense has not entirely gone. It is why ば sits so comfortably in general truths — 春になれば暖かくなる — and why a command after an action-verb ば-clause sounds wrong where たら is fine. After a stative or adjectival condition it is unremarkable — 時間があれば来てください.',
    period = 'Edo', updated_at = now()
WHERE id = 'ety-n4-ba-conditional';

UPDATE etymology_entries SET period = 'Old Japanese', updated_at = now()
WHERE id = 'ety-n4-bakari';

UPDATE etymology_entries SET body = 'It looks like する and is not. す／さす attached to the 未然形 and meant to make or let happen; it survives as modern せる／させる.

Make and let are one form because the auxiliary never separated them. With an intransitive verb the particle can tilt it — 子供を行かせる leans toward compelling, 子供に行かせる toward permitting — but with a transitive verb the causee takes に either way (子供にご飯を食べさせる), and context decides.', updated_at = now()
WHERE id = 'ety-n4-causative';

UPDATE etymology_entries SET body = '彼は寒い, as a flat present-tense assertion about someone else''s inner state, is rejected by most speakers: you may report your own feelings directly and not another''s. がる is one standard repair — 彼は寒がっている asserts the visible signs instead — alongside ようだ, そうだ and 〜と言っている. Narrative past and quoted speech lift the restriction entirely, which is why 彼は寒かった is ordinary.

It is also why がる produces a verb rather than an adjective. Signs are things somebody does — hence 寒がっている in the progressive, and 欲しがる taking を where 欲しい takes が, because wanting-behaviour has an object in a way that wanting does not.', updated_at = now()
WHERE id = 'ety-n4-garu';

UPDATE etymology_entries SET body = '誰か is literally "who?" left standing — the question mark folded into the word, so it names the answer without knowing it.

That is why the series is so regular once you see it: 何か, どこか, いつか, all one particle on the ordinary interrogatives. And it is why 誰も with a negative sweeps the whole range into "nobody" — while affirmative "anyone" takes 誰でも and "everyone" 誰もが, since bare 誰も no longer stands without a negative.', updated_at = now()
WHERE id = 'ety-n4-gimonshi-ka';

UPDATE etymology_entries SET claim = 'かた is 方, a direction or way — the native reading of the character read ほう in ほうが.',
    body = '書き方 is the way of writing, 行き方 the way of going. The noun is doing its ordinary job.

Because it is a noun the whole phrase is a noun, which is why 使い方が分からない takes が and why the thing acted on switches to の: 漢字を書く but 漢字の書き方.', updated_at = now()
WHERE id = 'ety-n4-kata';

UPDATE etymology_entries SET body = 'なり asserted that something was so, and its 未然形 なら took ば — later dropped — to give a plain hypothetical: "if it be so".

Modern なら has specialised away from that, toward picking up something already in play: 京都なら電車が早い answers a Kyoto somebody has put on the table rather than raising one. The copula''s asserting nature made that natural, though the history alone does not dictate it. It is also why なら, alone among the four, attaches straight to a bare noun.', updated_at = now()
WHERE id = 'ety-n4-nara-conditional';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n4-nominalise';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n4-noni-although';

UPDATE etymology_entries SET period = 'Meiji', updated_at = now()
WHERE id = 'ety-n4-o-ni-naru';

UPDATE etymology_entries SET period = 'Meiji', updated_at = now()
WHERE id = 'ety-n4-o-suru';

UPDATE etymology_entries SET body = 'One auxiliary, four senses, none of them lost. It is why 先生が来られる can mean the teacher was come to, can come, or — most likely — simply comes, spoken respectfully.

One influential account ties the suffering passive to the spontaneous sense rather than the passive one: 雨に降られた would then be the older idea of something happening of itself, to someone, which explains the grievance and the fact that an intransitive verb can be passivised at all. Others read it as a later stretch of the plain passive with an affected party added. The construction is certain; its route is not.',
    confidence = 'attested', updated_at = now()
WHERE id = 'ety-n4-passive';

UPDATE etymology_entries SET claim = 'らしい grew out of the adjectival suffix of 男らしい, not directly from the Old Japanese auxiliary らし.',
    body = 'Old Japanese らし did mark inference from evidence, but it fell out of the spoken language by mid-Heian and was gone by Kamakura. Modern conjectural らしい arose in the Edo period out of the Late Middle Japanese SUFFIX らしい — the one in 男らしい and 学生らしい, "as one would expect of" — echoing the remembered classical auxiliary rather than continuing it.

The suffix is therefore the source and the conjecture the offshoot, which is the reverse of how the two are usually presented. Both are still one idea: judging something by the evidence of what it appears to be. That is the difference from ようだ, which rests on what the speaker makes of it.',
    period = 'Edo',
    confidence = 'attested', updated_at = now()
WHERE id = 'ety-n4-rashii';

UPDATE etymology_entries SET body = 'と, ば and なら descend from particles and a copula. たら descends from たり, the same auxiliary that gave the past tense た, and it is たり in its 未然形.

That completive sense is still inside it, which is why たら means "once X has happened" rather than a bare hypothesis, and why it takes a request or a command after an action verb where ば cannot: 駅に着いたら電話して is natural, 着けば電話して is not.',
    period = 'Edo', updated_at = now()
WHERE id = 'ety-n4-tara-conditional';

UPDATE etymology_entries SET claim = 'あげる is 上げる, "to raise" — and the upward hand-off was originally deferential.',
    body = 'Japanese sorts giving by direction rather than by who owns what, and 上げる sends the thing up toward the recipient. That was politeness: あげる rose as the courteous replacement for やる, and handing something up puts the receiver above you, not below.

Which is why the trouble with 〜てあげる is not the direction but the announcement. Saying it labels your act as a favour conferred, and that is what lands badly on a superior however deferential the verb once was. 〜ましょうか offers the same help without claiming the credit.',
    period = 'Edo', updated_at = now()
WHERE id = 'ety-n4-te-ageru';

UPDATE etymology_entries SET claim = 'くれる is the giving verb whose arrow points inward, toward the speaker.',
    body = 'It is the opposite arrow from 上げる, and it is why くれる cannot be used for a gift between two other people that has nothing to do with you: the verb encodes arrival at your side. The spelling 呉れる is ateji — 呉 writes the sound and is not where the verb comes from, which is obscure.

Its honorific is 下さる — literally "to give downward" — which is the 下さい you have been saying since the first lesson. 買ってくれた and 買ってくださった are one verb at two heights.',
    confidence = 'attested', updated_at = now()
WHERE id = 'ety-n4-te-kureru';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n4-to-conditional';

UPDATE etymology_entries SET body = 'む was the auxiliary of intention and conjecture. Its consonant nasalised and then dropped, leaving the う you now write on 行こう.

It is still visible in forms taught much earlier: ましょう is ます plus this same う, でしょう is です plus it, and だろう is である plus it. That is why the volitional covers both "let us" and "probably" with no change of shape — む never distinguished them either.',
    period = 'Heian', updated_at = now()
WHERE id = 'ety-n4-volitional';

UPDATE etymology_entries SET body = '様 is an ordinary noun — the 様 of 様子 and of 皆様. 雨のようだ is literally "it has the appearance of rain".

Recognising it as a noun explains an entire family at once. ように is that noun with に, "in the manner that"; ようになる is coming to be that way; ようにする is making it that way; みたい is the casual stand-in for the same thing. Five patterns, one word — and it is why よう takes の after a noun, 学生のよう, exactly as any other noun would. みたい, worn down further, attaches directly instead: 学生みたい.',
    period = 'Heian', updated_at = now()
WHERE id = 'ety-n4-you-da';

UPDATE etymology_entries SET period = 'Heian', updated_at = now()
WHERE id = 'ety-n4-you-ni-naru';

UPDATE etymology_entries SET period = 'Heian', updated_at = now()
WHERE id = 'ety-n4-you-ni-purpose';

UPDATE etymology_entries SET period = 'Heian', updated_at = now()
WHERE id = 'ety-n4-you-ni-suru';

-- Found while fixing the volitional entry: a PUBLISHED entry has the same
-- error. Seed 012's ety-deshou gives でしょう the derivation that belongs to
-- だろう. でしょう is です + う (でせう); だろう is である + う (であらう).
UPDATE etymology_entries SET
  claim = 'でしょう is the polite copula です plus the volitional う, from でせう.',
  body = 'The chain is です + う, spelled でせう before the kana reform. The plain だろう is the parallel formation on である — であらう — and the two are often run together, but they are built on different copulas.

The final う is the same volitional ending that gives 行こう, which is why でしょう guesses rather than states: the volitional was never about certainty. It marks the speaker projecting rather than reporting, covering both "probably" and the seeking-agreement 〜でしょう？ with no change of form.',
  updated_at = now()
WHERE id = 'ety-deshou';
