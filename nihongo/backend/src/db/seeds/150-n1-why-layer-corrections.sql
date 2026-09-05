-- Fable's N1 verification: 39 of 55 entries corrected — the worst level.
--
-- Which fits. N1 is nearly all classical grammar, so it is where confident
-- morphology was easiest to get subtly wrong, and 71% of it needed work.
--
-- Eleven were false. Six are the kanji-as-etymology fault again: たえる and
-- たまる are different verbs sharing 堪; ともなう is native とも plus the なう of
-- 損なう, not the ハン of 同伴; ゆゑ is a native noun and the こ of 事故 is that
-- character's unrelated Chinese reading; 通じる is the Chinese loan and shares
-- only the character with native とおる.
--
-- The other five are morphology stated backwards:
--
--   Both なり entries claimed a particle unrelated to the copula. The
--   dictionaries derive both FROM the assertive なり, made a particle in the
--   early modern period — so they are one word, not three.
--
--   兼ねる was glossed as "unable to bring oneself to". As an independent verb
--   it means to hold two things at once; the inability belongs to the
--   auxiliary, and it is already in the Man'yōshū.
--
--   なくして was parsed as 連用形 + て, which would give なくて. It is なく plus
--   the classical connective して — the same して the file's own にして entry
--   describes.
--
--   にあらず said ではない replaced に with で. で IS に, worn down from にて,
--   so the に never left.
--
--   And the とて entry called its resemblance to とても accidental. It is not:
--   とても is とて + も, from とてもかくても — which the N5 pass had already
--   established while correcting とても itself. Two entries, opposite claims,
--   and this file settles them the same way.
--
-- Twenty periods were wrong, mostly ancestor-dated: 余儀 is Sino-Japanese so
-- cannot be Old Japanese; はずむ, そこねる and the ど- interrogatives are all
-- early modern (Old Japanese asked with いか-); にしろ needs the eastern
-- imperative しろ, which is Edo, while the body correctly notes the classical
-- form was せよ. Three went the other way — べく, ごとし and ばこそ are all
-- abundantly Old Japanese, the same fault already fixed for べき and こそ.
--
-- Six overreaches, all invented causation or invented ranking: たところで
-- described as reporting a completed act when it is hypothetical (今から謝った
-- ところで); や否や, が早いか and なり ranked by "tightness of interval", a scale
-- no source uses; が in がゆえに said to bind more tightly than の, when the two
-- differed by register; ところを called fixed to apology, though 寝ているところを
-- 起こされた is the same pattern; だの called always about someone else, though
-- 掃除だの洗濯だの grumbles about your own day; まい's two readings said to turn
-- only on person, when verb volitionality decides too.
--
-- One thing NOT changed: ety-n1-to-wa-ie-mono-no carries a topic about ならでは.
-- The id follows the grammar point's own slug in the database, which is itself
-- misleading — renaming it would break the row's identity for no reader-visible
-- gain. Recorded here instead.
--
-- Seeds 139-149 have run and are left alone; corrections ship as a new seed.


UPDATE etymology_entries SET period = 'Old Japanese', updated_at = now()
WHERE id = 'ety-n1-ba-koso';

UPDATE etymology_entries SET period = 'Old Japanese', updated_at = now()
WHERE id = 'ety-n1-beku';

UPDATE etymology_entries SET body = 'The の is the listing の of 行くの行かないの, holding each item at arm''s length rather than saying it straight. 暑いだの寒いだの quotes the complaints instead of making them.

That distance is the irritation, and it need not be aimed outward — 掃除だの洗濯だので一日つぶれた grumbles about your own day. What だの will not do is sit in a neutral list where と or や would serve.', updated_at = now()
WHERE id = 'ety-n1-dano';

UPDATE etymology_entries SET period = 'Muromachi', updated_at = now()
WHERE id = 'ety-n1-de-are';

UPDATE etymology_entries SET body = 'どう asks in what way; に makes it a means; も sweeps every one of them in. With a negative it takes the whole range of methods and rules them out together.

The ど- series itself is not ancient — Old Japanese asked with いか- and いづ-, giving いかにも — but the sweep is the same one that makes 誰も into "nobody" at N4. Sweeping a question word with も and then negating is one of the language''s standard moves, and どうにも is it applied to method.',
    period = 'Edo', updated_at = now()
WHERE id = 'ety-n1-dou-ni-mo';

UPDATE etymology_entries SET body = '早い is the ordinary adjective, か the question particle. 座るが早いか眠った asks whether the sitting was quicker — and by asking, says the two were level.

The が is the classical subject marker on a plain verb. The dictionary form is required by the construction itself, which views the event at its onset — classical が took past forms happily enough, so the particle is not what rules them out here. It is a question in shape and a statement of simultaneity in use.',
    period = 'Meiji', updated_at = now()
WHERE id = 'ety-n1-ga-hayai-ka';

UPDATE etymology_entries SET body = 'Before が marked subjects it marked possession, which is why 我が国 still reads as "my country". がゆえに is "by reason OF", with が doing the joining.

So the difference from plain ゆえに is not emphasis but an older grammar preserved — classical の故に is equally good, and が and の differed by register rather than by force. The whole phrase is a fossil kept for formal writing.', updated_at = now()
WHERE id = 'ety-n1-ga-yue-ni';

UPDATE etymology_entries SET period = 'Old Japanese', updated_at = now()
WHERE id = 'ety-n1-gotoki';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n1-hazumi-ni';

UPDATE etymology_entries SET period = 'Modern', updated_at = now()
WHERE id = 'ety-n1-hitotsu-de';

UPDATE etymology_entries SET claim = '兼ねる is "to hold two things at once"; strapped to a verb it became "cannot quite manage it".',
    body = 'The independent verb still means combining — 大臣を兼ねる. The auxiliary shifted from juggling two things to failing to manage one, and it is already in the Man''yōshū: 忘れかねつ.

かねない is that auxiliary negated — not-unable — hence "might well". That is the whole reason two forms one syllable apart mean opposite things, and why you only say a bad thing is not impossible when you are worried about it.',
    period = 'Old Japanese', updated_at = now()
WHERE id = 'ety-n1-kaneru';

UPDATE etymology_entries SET claim = '極まりない is the noun 極まり — a stopping place — plus 無い.',
    body = '極まる is "to reach the furthest point", the 極 of 北極 and 極端, and 極まり is the point reached. 失礼極まりない says the rudeness has no such point, so it goes on without bound.

Read that way the puzzle disappears: the ない is doing ordinary negative work on a noun, not bleached negation on a verb. It is also why 失礼極まる means much the same thing rather than the opposite — one says the extreme is reached, the other that no bound exists.', updated_at = now()
WHERE id = 'ety-n1-kiwamarinai';

UPDATE etymology_entries SET period = 'Modern', updated_at = now()
WHERE id = 'ety-n1-made-da';

UPDATE etymology_entries SET period = 'Edo',
    confidence = 'attested', updated_at = now()
WHERE id = 'ety-n1-made-mo-nai';

UPDATE etymology_entries SET body = 'まじ negated べし. Where べし said something should or would be, まじ said it should not or would not, and まい is what survives of it.

It kept both of べし''s senses. 雨は降るまい is conjecture — surely not; 二度と行くまい is resolve — I will not. The two readings textbooks list separately are the one auxiliary. Which you get depends on the subject and on whether the verb names something one can will: 私はもう長くは生きられまい is first person and still pure conjecture.',
    period = 'Muromachi', updated_at = now()
WHERE id = 'ety-n1-mai';

UPDATE etymology_entries SET body = 'The same adjective behind ない, なしに and なしには. なくして is the adverbial なく with the classical connective して — the same して as in にして, since なく plus て would only give なくて.

努力なくして成功はない demands the negative after it for the same reason なしには does: the absence has been set up as the thing the sentence is about, and only a denial completes it.', updated_at = now()
WHERE id = 'ety-n1-nakushite';

UPDATE etymology_entries SET claim = 'This なり grew out of the classical copula なり, repurposed as a particle of immediate succession.',
    body = 'Not a separate word after all: the dictionaries derive it from the assertive なり, turned into a conjunctive particle in the early modern period. 帰るなり寝てしまった.

What separates it from や否や and が早いか is the surprise. なり reports the second thing as immediate and out of character, which is why the subject of both halves must be the same person.',
    period = 'Edo', updated_at = now()
WHERE id = 'ety-n1-nari-immediately';

UPDATE etymology_entries SET claim = 'This なり is the copula used disjunctively — "be it this, be it that".',
    body = 'The same assertive なり, offered twice as alternatives rather than once as a fact: 電話なりメールなり is "be it the phone, be it mail". It settled into a particle in the early modern period, the same trick であれ…であれ plays with the other copula.

Because it offers rather than lists, it belongs with suggestions and permissions and takes a verb of choosing afterwards. That distinguishes it from やら, which lists a mess, and from だの, which lists with irritation.',
    period = 'Edo', updated_at = now()
WHERE id = 'ety-n1-nari-nari';

UPDATE etymology_entries SET period = 'Modern', updated_at = now()
WHERE id = 'ety-n1-nashi-ni-wa';

UPDATE etymology_entries SET body = 'あり was the Old Japanese existence verb, ancestor of ある. にあらず is the classical way of denying identity.

It survives in mottoes and set phrases — 人にあらず — for the same reason べからず survives on signs. The modern ではない descends from the very same construction: its で is にて worn down, so the に never actually left.', updated_at = now()
WHERE id = 'ety-n1-ni-arazu';

UPDATE etymology_entries SET claim = '難い is the かたい of がたい — the same word voiced — and here it is negated.',
    period = 'Meiji', updated_at = now()
WHERE id = 'ety-n1-ni-katakunai';

UPDATE etymology_entries SET body = '置く is to put something down and leave it. において sets the matter down in a place and discusses it there — a job it grew into through kanbun reading, where 於 was rendered with this verb, which is how a verb of placing came to do locative work at all.

So the formality is not in the meaning but in the register: において is the written language''s で, and it is doing the same locating job with a heavier verb. That it shares a root with the everyday 〜ておく is easy to miss because one is written in kanji and the other never is.',
    period = 'Heian', updated_at = now()
WHERE id = 'ety-n1-ni-oite';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n1-ni-shiro';

UPDATE etymology_entries SET claim = '堪える yields both readings of the pattern: unbearable to, and unable to contain.',
    body = '見るに堪えない is unbearable to watch; 感謝に堪えない is being unable to contain gratitude. One verb, and what decides which you get is the noun in front rather than anything in the ending.

It is worth keeping apart from たまらない at N2. たまる and たえる are different native verbs that merely share the character 堪 as a spelling, so the two patterns are neighbours by convention and not by descent.', updated_at = now()
WHERE id = 'ety-n1-ni-taenai';

UPDATE etymology_entries SET claim = '伴う is native とも — the とも of 友 and お供 — with the old verb-making なう.',
    body = 'The same なう as in 損なう and 商う. 伴 is a kanji fitted to it afterwards; the ハン of 同伴 and 伴奏 is the unrelated Chinese reading of that character.

に伴って sets two changes travelling in company. It sits with につれて and にしたがって as three ways of pairing change, each from a different image — 連れる leads along, 従う follows, 伴う merely accompanies — and 伴う is the most neutral, which is why it suits reports and statistics.',
    period = 'Heian', updated_at = now()
WHERE id = 'ety-n1-ni-tomonatte';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n1-sokoneru';

UPDATE etymology_entries SET body = '所 locates a moment. The past tense puts it after the act, and で marks it as where matters stand.

So 謝ったところで許されない pictures the apology as already made inside a supposition — even granting it done, nothing follows. The た is perfective inside an irrealis rather than a report of something that happened, which is why 今から謝ったところで works. What comes after must be negative in import, though 無駄だ and 同じことだ serve as well as ない.', updated_at = now()
WHERE id = 'ety-n1-ta-tokoro-de';

UPDATE etymology_entries SET claim = '相まって is 相 ("mutually") with 俟つ — two things relying on each other.',
    body = '相 is the prefix in 相手 and 相談, marking something done between parties. The verb is 俟つ, "to await, to rely on" — not the plain 待つ it is often written as — so the image is two things each counting on the other.

That mutual sense is why と相まって needs both halves to contribute. It is not "along with" but "each amplified by the other", which is why the result named afterwards is always more than either alone.',
    period = 'Meiji', updated_at = now()
WHERE id = 'ety-n1-to-aimatte';

UPDATE etymology_entries SET claim = 'としたって is とする with たって, the colloquial counterpart of ても.',
    body = 'たって is not ても worn down — it is longer, so the ちゃ-from-ては analogy fails. It grew instead out of classical とて, with a doubled consonant, and it is a sibling of ても rather than a reduction of it.

So としたって matches としても in sense while arriving by a different road. That it appears at N1 at all is because recognising the shape is the hard part, not the grammar.',
    period = 'Edo', updated_at = now()
WHERE id = 'ety-n1-to-ittatte';

UPDATE etymology_entries SET body = '所 locates a moment as a place. The を marks that moment as what the speaker''s intrusion acts upon.

お忙しいところをすみません apologises for the busy moment itself, not for anything done in it. That is why the pattern lives in apology and thanks — it names someone''s time as a thing you have taken — and equally in being caught or rescued mid-moment: 寝ているところを起こされた is the same intrusion from the other side.', updated_at = now()
WHERE id = 'ety-n1-tokoro-wo';

UPDATE etymology_entries SET body = 'The same construction as といっても with the verb of saying left out entirely. What remains concedes a point and then declines to be moved by it.

子供とて許されない: even granting it is a child. とても is the same とて with も — 「とてもかくても」, "whichever way", which is why it began life carrying negatives. The kinship is real, but the modern meaning has drifted so far that it is invisible.', updated_at = now()
WHERE id = 'ety-n1-tote';

UPDATE etymology_entries SET period = 'Modern', updated_at = now()
WHERE id = 'ety-n1-towa';

UPDATE etymology_entries SET claim = '通じる is the Chinese loan 通 made into a verb — a different word from the native とおる.',
    body = '通ず, ツウ plus the ancestor of する. とおる and とおり share only the character with it, which is why the two belong to different registers.

Both textbook senses are the one passage. A medium is 友人を通じて, passing through a person; a duration is 一年を通じて, passing through a year. を通して is the native verb doing nearly the same work.',
    period = 'Meiji', updated_at = now()
WHERE id = 'ety-n1-wo-tsuujite';

UPDATE etymology_entries SET period = 'Meiji', updated_at = now()
WHERE id = 'ety-n1-wo-yoginaku-sareru';

UPDATE etymology_entries SET body = '否 is the classical word for no, the same one in か否か at N2. Asking whether a thing has happened or not, at the instant of asking, gives the sense of immediacy.

The three N1 immediacy patterns differ by nuance rather than by how tight the interval is: や否や belongs to written style and general statements, なり adds unexpectedness and holds the subject fixed, が早いか dramatises the onset.', updated_at = now()
WHERE id = 'ety-n1-ya-ina-ya';

UPDATE etymology_entries SET period = 'Meiji', updated_at = now()
WHERE id = 'ety-n1-yori-hoka-nai';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n1-you-ga-you-ga';

UPDATE etymology_entries SET claim = 'ゆゑ is a native noun for a cause, already in the Man''yōshū.',
    body = '故 is the kanji assigned to it; the こ of 事故 is that character''s unrelated Chinese reading. It is an ordinary noun, which is why it takes の after another noun: 病気ゆえに, 貧しさの故に.

It is the most formal of the reason words, above ため and から, because it survives mainly in classical and written registers. Descartes in Japanese is 我思う、ゆえに我あり, and the register is exactly right for it.', updated_at = now()
WHERE id = 'ety-n1-yue-ni';
