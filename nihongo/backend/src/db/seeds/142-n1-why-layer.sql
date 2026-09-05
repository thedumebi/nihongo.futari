-- The why-layer for N1: all 55 topics.
--
-- N1 is largely classical grammar surviving inside fixed modern phrases, which
-- is what makes these forms learnable rather than memorisable — and it is why
-- this is the only level with no skips. Every pattern here has a real origin
-- and most of them reach back into something already taught.
--
-- The chains worth following: ども in といえども is the same ども inside けれども
-- at N5, so the loftiest concessive and the most casual けど are one word at two
-- lengths. べし gives べき at N3, べく and べからず here — one auxiliary, three
-- surviving forms. つ in 〜つ〜つ is the perfective auxiliary that became the て
-- of the te-form, preserved whole in a handful of frozen pairs. において is 置く,
-- the same verb as 〜ておく. And the が of がゆえに is the classical genitive, the
-- old "of" that still shows in 我が国.
--
-- Two pairs that answer each other: かねる here is the positive of the かねない
-- at N3, which is why two forms one syllable apart mean opposite things; and
-- 極まりない denies a peak exists while の極み names it.
--
-- Nothing here has a source row: `source_count` is 0 rather than a number with
-- nothing behind it, and every entry lands at 'in-review'.
--
-- Additive, idempotent, safe on a live database.

-- Joined to grammar_points by SLUG, not by a guessed id. Most ids are
-- gp-<slug> and 49 are not — gp-owari-ni carries the slug kawari-ni — so
-- building the id by hand fails the foreign key on exactly those rows.
INSERT INTO etymology_entries
  (id, language_id, grammar_point_id, aspect, claim, body, period, confidence,
   is_disputed, is_primary, status, generated_by, source_count)
SELECT v.id, 'lang-ja', g.id, v.aspect, v.claim, v.body, v.period, v.confidence,
       false, true, 'in-review', 'claude', 0
FROM (VALUES
  ('ety-n1-nashi-ni-wa', 'nashi-ni-wa', 'historical-grammar',
   'なしには is the classical なし with は, and the は is what forces the negative ending.',
   'なし is the Old Japanese adjective behind modern ない. なしに alone simply means without; adding は marks that absence as the topic and sets up a denial about it.

So なしには must be answered by a negative: 君の助けなしにはできなかった. The は has raised the without-ness as the thing being discussed, and the sentence exists to say what it ruled out.',
   'Heian', 'well-supported'),

  ('ety-n1-taritomo', 'taritomo', 'historical-grammar',
   'たり here is the classical copula, not the past — "even were it one".',
   'Classical たり asserted identity, as なり did. とも is the concessive "even if". 一円たりとも is "even were it one yen".

That is why the pattern demands a number and a negative afterwards: it concedes the smallest possible case and then refuses even that. 一日たりとも忘れない.',
   'Heian', 'well-supported'),

  ('ety-n1-to-iedomo', 'to-iedomo', 'historical-grammar',
   'ども is the same concessive particle that sits inside けれども.',
   'いえ is the 已然形 of 言う; ども is Old Japanese for "even though". The whole is "even though one says".

And it is the identical ども taught at N5 inside けれども — the ancestor of けれど and けど. One particle, one meaning, at the two ends of the syllabus: the casual けど and the lofty といえども are the same word wearing different amounts of its original self.',
   'Heian', 'well-supported'),

  ('ety-n1-towa', 'towa', 'historical-grammar',
   'とは is the quotative と with は, and the sentence it belongs to has been left unfinished.',
   'まさか彼が来るとは — and then nothing. What would complete it (思わなかった, 驚いた) has been dropped, and the surprise lives in the gap.

That is why とは carries feeling rather than content. It marks a thing as quoted and topicalised, then stops before saying anything about it, leaving the listener to supply what the speaker cannot.',
   'Heian', 'well-supported'),

  ('ety-n1-mono-wo', 'mono-wo', 'historical-grammar',
   'ものを is the noun もの with を, and it too breaks off before the main clause.',
   '言ってくれればよかったものを — the regret is in what is not said afterwards. Classical ものを was a conjunction of grievance, and the modern use keeps it stranded at the end.

The を is the old adversative one, not the object marker, though they are written alike. It is the same construction as とは: something set up, and then a silence doing the work.',
   'Heian', 'attested'),

  ('ety-n1-beku', 'beku', 'historical-grammar',
   'べく is the 連用形 of べし — the form that connects onward to a verb.',
   'べし had a full classical paradigm. べき modified nouns, べく linked to what followed, and べからず negated it. All three survive, each in its own modern niche.

So 成功すべく努力する is "making effort in order that it should succeed". Once べし is recognised as one word with several forms, べき, べく and べからず stop being three patterns and become one.',
   'Heian', 'well-supported'),

  ('ety-n1-bekarazu', 'bekarazu', 'historical-grammar',
   'べからず is べし plus the classical negative ず — the prohibition on old signs.',
   'べく plus あら plus ず, contracted. It is the negative branch of the same auxiliary that gives べき and べく.

It survives almost entirely on signage — 立入るべからず — because that is where classical Japanese survives generally: notices, mottoes and set phrases keep old grammar long after speech has let it go.',
   'Heian', 'well-supported'),

  ('ety-n1-nagara-ni', 'nagara-ni', 'historical-grammar',
   'ながらに preserves the ORIGINAL meaning of ながら, which was not "while".',
   'ながら first marked a state persisting unchanged, and only later came to mean two things at once. 生まれながらに is "in the state one was born in", 涙ながらに is "remaining in tears".

So this N1 pattern is older than the N5 one it looks like a variant of. 昔ながら, still current, is the same survival: as it always was.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-ya-ina-ya', 'ya-ina-ya', 'historical-grammar',
   'It is literally "yes or no" — や, 否, や — with no time left between them.',
   '否 is the classical word for no, the same one in か否か at N2. Asking whether a thing has happened or not, at the instant of asking, gives the sense of immediacy.

That is why や否や is the tightest of the three N1 immediacy patterns. There is no interval in it at all, whereas が早いか compares speeds and なり merely reports what came next.',
   'Heian', 'well-supported'),

  ('ety-n1-ga-hayai-ka', 'ga-hayai-ka', 'historical-grammar',
   'It compares two speeds: was the one faster, or the other?',
   '早い is the ordinary adjective, か the question particle. 座るが早いか眠った asks whether the sitting was quicker — and by asking, says the two were level.

The が is the classical subject marker on a plain verb, which is why the construction takes the dictionary form and not a past. It is a question in shape and a statement of simultaneity in use.',
   'Heian', 'well-supported'),

  ('ety-n1-nari-immediately', 'nari-immediately', 'historical-grammar',
   'This なり is the classical particle of a thing done straight off, unrelated to the copula なり.',
   'Japanese has several なり and this is the one meaning "as soon as, and then". 帰るなり寝てしまった.

What separates it from や否や and が早いか is the surprise. なり reports that the second thing happened immediately and unexpectedly, which is why it so often introduces something out of character — and why the subject of both halves must be the same person.',
   'Heian', 'attested'),

  ('ety-n1-sokoneru', 'sokoneru', 'word-origin',
   'そこねる is 損ねる, from 損なう — "to damage, to spoil".',
   '機嫌を損ねる is putting someone out of temper. As a suffix it spoils the action itself.

That is the difference from 忘れる or できない: 食べそこねた is not merely a meal missed but an attempt that went wrong. The verb carries fault, so the pattern always implies the chance was there and was botched.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-kaneru', 'kaneru', 'word-origin',
   'かねる is the positive of the かねない taught at N3, and it means the opposite.',
   '兼ねる is to be unable to bring oneself to something. わかりかねます is a refusal dressed as inability, which is why it is the polite way to say no in business.

かねない is that verb negated — not-unable — hence "might well". Two forms one syllable apart, opposite in meaning, and the double negative is the whole explanation.',
   'Heian', 'well-supported'),

  ('ety-n1-made-da', 'made-da', 'word-origin',
   'までだ is the ordinary particle まで — and nothing beyond that point.',
   'まで marks a limit. 断られたら諦めるまでだ says the giving up is where the matter stops, with nothing further to it.

The flatness is the particle. It is not resolve or defiance but a boundary drawn: that is as far as this goes. までのことだ is the same thing with こと inserted to make it a stated matter.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-made-mo-nai', 'made-mo-nai', 'word-origin',
   'までもない is the same まで with も — not even as far as that.',
   'まで sets a limit; も says even. So the sentence denies that matters need to be taken as far as the thing named.

言うまでもない is "there is no need to go so far as saying" — which is exactly what English does with "it goes without saying". Both languages picture the unnecessary act as a distance not worth travelling.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-ni-taenai', 'ni-taenai', 'word-origin',
   '堪える is the endure of たまらない — but 堪 has two readings and they point opposite ways.',
   '見るに堪えない is unbearable to watch. 感謝に堪えない is being unable to contain gratitude. The verb is the same and so is the negation; what differs is whether what cannot be borne is bad or overwhelming.

The pair is worth holding together with たまらない at N2, which is the same 堪 in its native reading. One kanji, three patterns, all about the limits of what a person can hold.',
   'Old Japanese', 'attested'),

  ('ety-n1-wo-yoginaku-sareru', 'wo-yoginaku-sareru', 'word-origin',
   '余儀 is "another way" — and 余儀なく is having none.',
   '余 is the 余 of 余る, what is left over; 儀 is a matter or a manner. 余儀 is the other course available, and 余儀ない says there is not one.

The passive then supplies who was left without it: 中止を余儀なくされた is being put in a position where no other course remained. Nobody in the sentence chose anything, which is why the construction is the language of disasters and closures.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-ni-katakunai', 'ni-katakunai', 'word-origin',
   '難い is the 難 of がたい, in its other reading — and here it is negated.',
   'がたい at N3 says hard to bring oneself to. かたくない says the opposite: not hard at all.

想像に難くない is "it is not difficult to imagine", a formal way of saying anyone can see it. Same kanji, same meaning, and the whole pattern is the negative doing its ordinary work.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-kiwamarinai', 'kiwamarinai', 'word-origin',
   '極まる is "to reach the furthest point" — the 極 of 北極 and 極端.',
   'A verb of arriving at an extreme. 極まりない negates it, and that is the puzzle: how does "does not reach the extreme" mean "utterly"?

Because what is denied is a stopping place. 失礼極まりない says the rudeness has no furthest point to arrive at, so it goes on without bound. 極まる without the negative means the same thing, which is the clearest sign the ない stopped doing negative work here long ago.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-no-itari', 'no-itari', 'word-origin',
   '至り is from 至る, "to arrive" — the point a thing has arrived at.',
   '至る is the verb on road signs, 東京に至る. 光栄の至り is honour arrived at its furthest.

It pairs with の極み as the two formal superlatives, and they differ by image rather than degree: 至り is where something got to, 極み is the top of it. Both belong to speeches and letters, and both take only abstract nouns.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-no-kiwami', 'no-kiwami', 'word-origin',
   '極み is the noun from the 極まる of 極まりない — the summit itself.',
   'Where 極まりない denies that a peak exists, の極み names it and puts the thing on top of it. 贅沢の極み is the very peak of luxury.

One kanji, two patterns, opposite constructions: the negated verb says there is no limit, the plain noun says here is the limit and this is it.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-to-aimatte', 'to-aimatte', 'word-origin',
   '相まって is 相 ("mutually") with 待つ — two things waiting on each other.',
   '相 is the prefix in 相手 and 相談, marking something done between parties. 相まつ is an old verb for two things meeting and reinforcing.

That mutual sense is why と相まって needs both halves to contribute. It is not "along with" but "each amplified by the other", which is why the result named afterwards is always more than either alone.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-hazumi-ni', 'hazumi-ni', 'word-origin',
   'はずみ is 弾み, from 弾む — "to bounce".',
   'ボールが弾む is a ball bouncing; 話が弾む is a conversation that takes off. The noun is momentum.

So 転んだはずみに is on the bounce of falling — the accident carried on into something else by its own momentum. That is why the pattern always describes something unintended: a bounce is not aimed.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-kirai-ga-aru', 'kirai-ga-aru', 'word-origin',
   'きらい is 嫌い, the ordinary word for dislike, used as a noun for an unwelcome leaning.',
   '嫌いがある names a tendency as something disliked, and that judgement is built into the pattern before any adjective is added.

Which is why it never takes a good habit. 早合点するきらいがある works; a tendency to be kind does not, and would have to be 傾向 instead. The word for distaste is doing the evaluating.',
   'Edo', 'attested'),

  ('ety-n1-ni-tomonatte', 'ni-tomonatte', 'word-origin',
   '伴う is "to accompany" — the 伴 of 同伴 and 伴奏.',
   'A companion verb. に伴って sets two changes travelling together.

It sits with につれて and にしたがって from N3 as three ways of pairing change, each from a different image: 連れる leads along, 従う follows, 伴う merely accompanies. 伴う is the most neutral of the three, which is why it suits reports and statistics.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-wo-yoso-ni', 'wo-yoso-ni', 'word-origin',
   'よそ is 余所 — somewhere else, another place entirely.',
   'よそ見 is looking away; よその人 is an outsider. をよそに puts the thing named somewhere other than where the actor is attending.

So the disregard is spatial before it is moral. 親の心配をよそに says the worry was left in another place and walked away from, which is why the pattern always carries a hint of reproach.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-to-wa-ie-mono-no', 'to-wa-ie-mono-no', 'historical-grammar',
   'ならでは is the classical negative ならで with は — "not being that, it is not".',
   'ならで is なり plus the で of negation, an older way of saying without being. Adding は makes it a topic and demands the denial that follows.

日本ならではの味 is a taste that, absent Japan, does not occur. The construction is a double denial that lands as exclusivity, which is why it reads as praise rather than as a limit.',
   'Heian', 'attested'),

  ('ety-n1-inagara-ni-shite', 'inagara-ni-shite', 'historical-grammar',
   'It is いる with the old ながら — remaining in the state of being where you are.',
   'The same ながら as 生まれながらに, meaning a state that persists rather than two things at once. いながら is staying put.

家にいながらにして世界中と話せる says the whole thing without moving: the state of being at home is unbroken while the rest happens. The pattern is a small monument to what ながら used to mean.',
   'Heian', 'well-supported'),

  ('ety-n1-gotoki', 'gotoki', 'historical-grammar',
   'ごとし is the classical auxiliary of comparison, and ごとき is its noun-modifying form.',
   'It inflects like an adjective: ごとく connects onward, ごとき stands before a noun, ごとし ends a sentence. 光陰矢のごとし — time flies like an arrow — is the phrase everybody knows.

Modern ようだ replaced it entirely, which is why ごとき now sounds either literary or contemptuous. 私ごとき is self-deprecation precisely because reaching for the archaic form makes a show of the comparison.',
   'Heian', 'well-supported'),

  ('ety-n1-to-ittatte', 'to-ittatte', 'historical-grammar',
   'としたって is としても worn down in speech.',
   'とする plus ても, contracted through としても to としたって. The same shortening that gives ちゃ from ては and じゃ from では.

So the meaning is unchanged and only the register moved: it is the casual spoken form of a written concessive. That it appears at N1 at all is because recognising the contraction is the hard part, not the grammar.',
   'Modern', 'attested'),

  ('ety-n1-nakushite', 'nakushite', 'historical-grammar',
   'なくして is the classical なし again, in a form that connects onward.',
   'The same adjective behind ない, なしに and なしには. なくして is its 連用形 with て, so it links to what follows.

努力なくして成功はない demands the negative after it for the same reason なしには does: the absence has been set up as the thing the sentence is about, and only a denial completes it.',
   'Heian', 'well-supported'),

  ('ety-n1-mo-sarukoto-nagara', 'mo-sarukoto-nagara', 'historical-grammar',
   'さる is 然る — "such, that being so" — the same 然 as in そう and 然し.',
   '然る is a classical modifier meaning of that kind. さることながら is "that being such a matter, and yet".

So the pattern grants the first thing fully before raising the second, which is why it cannot be used to dismiss. 味もさることながらサービスがいい praises the food and then says the service is more remarkable still.',
   'Heian', 'attested'),

  ('ety-n1-ni-shite', 'ni-shite', 'historical-grammar',
   'にして is に with the て of する — and it means two opposite things depending on what it lands on.',
   'On a high number or a long span it means "only at": 六十にして始めた, not until sixty. On a small one it means "even at": 一瞬にして消えた, gone in a single instant.

Both are the same construction naming a point and remarking on it. What decides the reading is whether the point is surprisingly late or surprisingly small, and nothing in the grammar tells you which — the noun does.',
   'Heian', 'attested'),

  ('ety-n1-to-omoikiya', 'to-omoikiya', 'historical-grammar',
   'きや is the classical past き with the question particle や — "did one think?"',
   'き was the Old Japanese past tense, and や asked. 思いきや is "one thought, did one?" — a question that answers itself in the negative.

That is why the pattern always overturns what precedes it. 簡単だと思いきや難しかった: the thinking is raised as a question in order to be dismissed, and the surprise is built into the classical grammar rather than added by tone.',
   'Heian', 'well-supported'),

  ('ety-n1-tokoro-wo', 'tokoro-wo', 'word-origin',
   'ところを is the 所 of N4 with を — the moment is the thing being cut into.',
   '所 locates a moment as a place. The を marks that moment as what the speaker''s intrusion acts upon.

お忙しいところをすみません apologises for the busy moment itself, not for anything done in it. That is why the pattern is fixed to apology and thanks: it names someone''s time as a thing you have taken.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-ni-arazu', 'ni-arazu', 'historical-grammar',
   'あらず is あり with the classical negative ず — the ancestor of ではない.',
   'あり was the Old Japanese existence verb, ancestor of ある. にあらず is the classical way of denying identity.

It survives in mottoes and set phrases — 人にあらず — for the same reason べからず survives on signs. The modern ではない descends from the same construction with で in place of に.',
   'Heian', 'well-supported'),

  ('ety-n1-ba-koso', 'ba-koso', 'historical-grammar',
   'ばこそ is the conditional ば with the focus particle こそ from N3.',
   'こso singles one thing out as the one that counts, and in classical Japanese it forced a particular ending on the sentence — 係り結び. Attached to a condition, it insists that this and no other is the reason.

愛すればこそ叱る: precisely because there is love. The ば supplies the cause, こそ refuses every competing one, and neither part means "precisely" on its own.',
   'Heian', 'well-supported'),

  ('ety-n1-de-are', 'de-are', 'historical-grammar',
   'であれ is the imperative of である — a command shape used to concede.',
   'あれ is the classical imperative of あり. Telling a hypothetical to be whatever it likes is a way of saying it changes nothing.

子供であれ大人であれ: be it a child, be it an adult. English does the same with "be it" — a fossil imperative in both languages, doing concession rather than command.',
   'Heian', 'well-supported'),

  ('ety-n1-you-ga-you-ga', 'you-ga-you-ga', 'historical-grammar',
   'It pairs the volitional with まい, its negative counterpart, and puts が on both.',
   'う／よう is intention; まい is the negative of it. 行こうが行くまいが lines the two up and marks each with が so that neither is preferred.

That is why the construction covers the whole field: it names the only two possibilities and then declines to choose. The same shape with にしろ or であれ does the same work with different words.',
   'Heian', 'well-supported'),

  ('ety-n1-mai', 'mai', 'historical-grammar',
   'まい descends from まじ, the Old Japanese auxiliary of negative conjecture and intention.',
   'まじ negated べし. Where べし said something should or would be, まじ said it should not or would not, and まい is what survives of it.

It kept both of べし''s senses. 雨は降るまい is conjecture — surely not; 二度と行くまい is resolve — I will not. The two readings that textbooks list separately are the one auxiliary, and which you get depends only on the person of the subject.',
   'Heian', 'well-supported'),

  ('ety-n1-nari-nari', 'nari-nari', 'historical-grammar',
   'This なり is the classical particle of selection — take this one or that one.',
   'Another of the several なり in the language, this one offering alternatives rather than asserting identity. 電話なりメールなり: by phone or by mail, as you please.

Because it offers rather than lists, it belongs with suggestions and permissions and takes a verb of choosing or doing afterwards. That distinguishes it from やら, which lists a mess, and from だの, which lists with irritation.',
   'Heian', 'attested'),

  ('ety-n1-dano', 'dano', 'historical-grammar',
   'だの is the copula だ with の, listing things at arm''s length.',
   'The の nominalises each item, so the speaker names them as things rather than saying them straight. 暑いだの寒いだの quotes the complaints instead of making them.

That distance is the irritation. It is why だの is always used about someone else''s grumbling, and why it will not sit in a neutral list where と or や would do.',
   'Edo', 'attested'),

  ('ety-n1-tsu-tsu', 'tsu-tsu', 'historical-grammar',
   'This つ is the Old Japanese perfective auxiliary — the same つ that became the て of the te-form.',
   'つ marked a completed action. Doubled and alternated, it gives 行きつ戻りつ: going and returning, each completed in turn.

So the pattern is a direct survival of the auxiliary taught at N5 as the origin of て. The te-form is つ worn into a connector; 〜つ〜つ is つ preserved whole in a handful of frozen pairs, and no new ones are being made.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-koto-naku', 'koto-naku', 'historical-grammar',
   'ことなく is こと with the classical なく — the matter does not occur.',
   'The nominaliser from N4 and the adverbial form of なし. 休むことなく働いた names resting as a matter and says there was none of it.

It is the written counterpart of ないで, and the difference is exactly that ことなく makes the absent thing a noun first. That is why it takes only verbs describing a whole activity, and why it sounds wrong in speech.',
   'Heian', 'well-supported'),

  ('ety-n1-ni-oite', 'ni-oite', 'word-origin',
   'において is 置く — the same verb as 〜ておく at N4.',
   '置く is to put something down and leave it. において sets the matter down in a place and discusses it there.

So the formality is not in the meaning but in the register: において is the written language''s で, and it is doing the same locating job with a heavier verb. That it shares a root with the everyday 〜ておく is easy to miss because one is written in kanji and the other never is.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-wo-tsuujite', 'wo-tsuujite', 'word-origin',
   '通じる is "to pass through" — the same 通 as the とおり of N3.',
   '通る is to pass along, 通じる to get through. を通じて sends the sentence through the thing named.

Both textbook senses are that passage. A medium is 友人を通じて, passing through a person; a duration is 一年を通じて, passing through a year. を通して is the same verb in its other form and is very nearly interchangeable.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-yue-ni', 'yue-ni', 'word-origin',
   'ゆえ is 故, a noun meaning a reason or a cause.',
   'The 故 of 事故 and 故に. It is an ordinary noun, which is why it takes の after another noun: 病気ゆえに, 貧しさの故に.

It is the most formal of the reason words, above ため and から, because 故 belongs to classical and written Japanese. Descartes in Japanese is 我思う、ゆえに我あり, and the register is exactly right for it.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-tote', 'tote', 'historical-grammar',
   'とて is the quotative と with て — "even saying that".',
   'The same construction as といっても with the verb of saying left out entirely. What remains concedes a point and then declines to be moved by it.

子供とて許されない: even granting it is a child. It is worth keeping apart from とても, which is a different word entirely and far commoner — the resemblance is accidental and catches readers out.',
   'Heian', 'well-supported'),

  ('ety-n1-yori-hoka-nai', 'yori-hoka-nai', 'word-origin',
   'ほか is 外 — outside. There is nothing outside this option.',
   'より marks comparison, 外 is the outside of a thing. 諦めるよりほかない says that beyond giving up there is nothing.

It is the formal twin of しかない, and both draw the same picture: everything else has been excluded and one course is left standing. ほかならない at N2 is the same 外, denying that anything outside applies.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-dou-ni-mo', 'dou-ni-mo', 'historical-grammar',
   'どうにも is "how" with に and も — by no manner of means.',
   'どう asks in what way; に makes it a means; も sweeps every one of them in. With a negative it takes the whole range of methods and rules them out together.

That is the same も that makes 誰も into "nobody" at N4. Sweeping a question word with も and then negating is one of the language''s standard moves, and どうにも is it applied to method.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-ni-shiro', 'ni-shiro', 'historical-grammar',
   'しろ is the imperative of する — telling the alternative to be so, and conceding it.',
   'The same fossil-imperative trick as であれ. 行くにしろ行かないにしろ commands each possibility to stand and then says neither matters.

にせよ is the same verb in its classical imperative, which is why the two are interchangeable and にせよ is the stiffer. Japanese builds concession out of commands more than once, and this is the clearest case.',
   'Heian', 'well-supported'),

  ('ety-n1-hitotsu-de', 'hitotsu-de', 'word-origin',
   'ひとつ is the plain counter 一つ, and で is the で of means.',
   'Nothing classical in it at all. 考えひとつで人生は変わる is "by one thought, life changes".

What makes it a pattern is the で doing instrumental work on a bare count: one of the thing named is the whole of what it takes. The rhetorical weight comes from how little is being claimed as sufficient.',
   'Old Japanese', 'well-supported'),

  ('ety-n1-ga-yue-ni', 'ga-yue-ni', 'historical-grammar',
   'The が in がゆえに is the classical GENITIVE — the が taught at N5 as an old "of".',
   'Before が marked subjects it marked possession, which is why 我が国 still reads as "my country". がゆえに is "by reason OF", with が doing the joining.

So the difference from plain ゆえに is not emphasis added but an older grammar preserved: が binds the reason to what precedes it more tightly than の would, and the whole phrase is a classical fossil kept for formal writing.',
   'Heian', 'well-supported'),

  ('ety-n1-shimatsu-da', 'shimatsu-da', 'word-origin',
   '始末 is 始 plus 末 — the beginning and the end, the whole course of a thing.',
   'The noun means how something turned out, and it survives in 始末書, the written account of an incident you are answerable for.

Because it names the entire course, 始末だ always follows a stated sequence of events and delivers the verdict on it. And because you only write a 始末書 when things went wrong, the verdict is always bad.',
   'Edo', 'well-supported'),

  ('ety-n1-ta-tokoro-de', 'ta-tokoro-de', 'word-origin',
   'たところで is the 所 of N4 with で — at that point, and no further.',
   '所 locates a moment. The past tense puts it after the act, and で marks it as where matters stand.

So 謝ったところで許されない is "at the point of having apologised, still not forgiven": the concession is that the act was completed and got you nowhere. That is why the pattern needs the past in front and a negative behind.',
   'Old Japanese', 'well-supported')
) AS v(id, slug, aspect, claim, body, period, confidence)
JOIN grammar_points g ON g.slug = v.slug AND g.language_id = 'lang-ja'
ON CONFLICT (id) DO NOTHING;

-- One review-queue row per entry, so they surface where the others did.
INSERT INTO content_review_queue
  (id, language_id, target_table, target_id, change_type, proposed, origin, priority, status)
SELECT v.id, 'lang-ja', 'etymology_entries', v.target, 'create', v.proposed::jsonb, 'claude', 10, 'pending'
FROM (VALUES
  ('rq-ety-n1-nashi-ni-wa', 'ety-n1-nashi-ni-wa', '{"claim": "なしには is the classical なし with は, and the は is what forces the negative ending.", "body": "なし is the Old Japanese adjective behind modern ない. なしに alone simply means without; adding は marks that absence as the topic and sets up a denial about it.\n\nSo なしには must be answered by a negative: 君の助けなしにはできなかった. The は has raised the without-ness as the thing being discussed, and the sentence exists to say what it ruled out.", "confidence": "well-supported"}'),
  ('rq-ety-n1-taritomo', 'ety-n1-taritomo', '{"claim": "たり here is the classical copula, not the past — \"even were it one\".", "body": "Classical たり asserted identity, as なり did. とも is the concessive \"even if\". 一円たりとも is \"even were it one yen\".\n\nThat is why the pattern demands a number and a negative afterwards: it concedes the smallest possible case and then refuses even that. 一日たりとも忘れない.", "confidence": "well-supported"}'),
  ('rq-ety-n1-to-iedomo', 'ety-n1-to-iedomo', '{"claim": "ども is the same concessive particle that sits inside けれども.", "body": "いえ is the 已然形 of 言う; ども is Old Japanese for \"even though\". The whole is \"even though one says\".\n\nAnd it is the identical ども taught at N5 inside けれども — the ancestor of けれど and けど. One particle, one meaning, at the two ends of the syllabus: the casual けど and the lofty といえども are the same word wearing different amounts of its original self.", "confidence": "well-supported"}'),
  ('rq-ety-n1-towa', 'ety-n1-towa', '{"claim": "とは is the quotative と with は, and the sentence it belongs to has been left unfinished.", "body": "まさか彼が来るとは — and then nothing. What would complete it (思わなかった, 驚いた) has been dropped, and the surprise lives in the gap.\n\nThat is why とは carries feeling rather than content. It marks a thing as quoted and topicalised, then stops before saying anything about it, leaving the listener to supply what the speaker cannot.", "confidence": "well-supported"}'),
  ('rq-ety-n1-mono-wo', 'ety-n1-mono-wo', '{"claim": "ものを is the noun もの with を, and it too breaks off before the main clause.", "body": "言ってくれればよかったものを — the regret is in what is not said afterwards. Classical ものを was a conjunction of grievance, and the modern use keeps it stranded at the end.\n\nThe を is the old adversative one, not the object marker, though they are written alike. It is the same construction as とは: something set up, and then a silence doing the work.", "confidence": "attested"}'),
  ('rq-ety-n1-beku', 'ety-n1-beku', '{"claim": "べく is the 連用形 of べし — the form that connects onward to a verb.", "body": "べし had a full classical paradigm. べき modified nouns, べく linked to what followed, and べからず negated it. All three survive, each in its own modern niche.\n\nSo 成功すべく努力する is \"making effort in order that it should succeed\". Once べし is recognised as one word with several forms, べき, べく and べからず stop being three patterns and become one.", "confidence": "well-supported"}'),
  ('rq-ety-n1-bekarazu', 'ety-n1-bekarazu', '{"claim": "べからず is べし plus the classical negative ず — the prohibition on old signs.", "body": "べく plus あら plus ず, contracted. It is the negative branch of the same auxiliary that gives べき and べく.\n\nIt survives almost entirely on signage — 立入るべからず — because that is where classical Japanese survives generally: notices, mottoes and set phrases keep old grammar long after speech has let it go.", "confidence": "well-supported"}'),
  ('rq-ety-n1-nagara-ni', 'ety-n1-nagara-ni', '{"claim": "ながらに preserves the ORIGINAL meaning of ながら, which was not \"while\".", "body": "ながら first marked a state persisting unchanged, and only later came to mean two things at once. 生まれながらに is \"in the state one was born in\", 涙ながらに is \"remaining in tears\".\n\nSo this N1 pattern is older than the N5 one it looks like a variant of. 昔ながら, still current, is the same survival: as it always was.", "confidence": "well-supported"}'),
  ('rq-ety-n1-ya-ina-ya', 'ety-n1-ya-ina-ya', '{"claim": "It is literally \"yes or no\" — や, 否, や — with no time left between them.", "body": "否 is the classical word for no, the same one in か否か at N2. Asking whether a thing has happened or not, at the instant of asking, gives the sense of immediacy.\n\nThat is why や否や is the tightest of the three N1 immediacy patterns. There is no interval in it at all, whereas が早いか compares speeds and なり merely reports what came next.", "confidence": "well-supported"}'),
  ('rq-ety-n1-ga-hayai-ka', 'ety-n1-ga-hayai-ka', '{"claim": "It compares two speeds: was the one faster, or the other?", "body": "早い is the ordinary adjective, か the question particle. 座るが早いか眠った asks whether the sitting was quicker — and by asking, says the two were level.\n\nThe が is the classical subject marker on a plain verb, which is why the construction takes the dictionary form and not a past. It is a question in shape and a statement of simultaneity in use.", "confidence": "well-supported"}'),
  ('rq-ety-n1-nari-immediately', 'ety-n1-nari-immediately', '{"claim": "This なり is the classical particle of a thing done straight off, unrelated to the copula なり.", "body": "Japanese has several なり and this is the one meaning \"as soon as, and then\". 帰るなり寝てしまった.\n\nWhat separates it from や否や and が早いか is the surprise. なり reports that the second thing happened immediately and unexpectedly, which is why it so often introduces something out of character — and why the subject of both halves must be the same person.", "confidence": "attested"}'),
  ('rq-ety-n1-sokoneru', 'ety-n1-sokoneru', '{"claim": "そこねる is 損ねる, from 損なう — \"to damage, to spoil\".", "body": "機嫌を損ねる is putting someone out of temper. As a suffix it spoils the action itself.\n\nThat is the difference from 忘れる or できない: 食べそこねた is not merely a meal missed but an attempt that went wrong. The verb carries fault, so the pattern always implies the chance was there and was botched.", "confidence": "well-supported"}'),
  ('rq-ety-n1-kaneru', 'ety-n1-kaneru', '{"claim": "かねる is the positive of the かねない taught at N3, and it means the opposite.", "body": "兼ねる is to be unable to bring oneself to something. わかりかねます is a refusal dressed as inability, which is why it is the polite way to say no in business.\n\nかねない is that verb negated — not-unable — hence \"might well\". Two forms one syllable apart, opposite in meaning, and the double negative is the whole explanation.", "confidence": "well-supported"}'),
  ('rq-ety-n1-made-da', 'ety-n1-made-da', '{"claim": "までだ is the ordinary particle まで — and nothing beyond that point.", "body": "まで marks a limit. 断られたら諦めるまでだ says the giving up is where the matter stops, with nothing further to it.\n\nThe flatness is the particle. It is not resolve or defiance but a boundary drawn: that is as far as this goes. までのことだ is the same thing with こと inserted to make it a stated matter.", "confidence": "well-supported"}'),
  ('rq-ety-n1-made-mo-nai', 'ety-n1-made-mo-nai', '{"claim": "までもない is the same まで with も — not even as far as that.", "body": "まで sets a limit; も says even. So the sentence denies that matters need to be taken as far as the thing named.\n\n言うまでもない is \"there is no need to go so far as saying\" — which is exactly what English does with \"it goes without saying\". Both languages picture the unnecessary act as a distance not worth travelling.", "confidence": "well-supported"}'),
  ('rq-ety-n1-ni-taenai', 'ety-n1-ni-taenai', '{"claim": "堪える is the endure of たまらない — but 堪 has two readings and they point opposite ways.", "body": "見るに堪えない is unbearable to watch. 感謝に堪えない is being unable to contain gratitude. The verb is the same and so is the negation; what differs is whether what cannot be borne is bad or overwhelming.\n\nThe pair is worth holding together with たまらない at N2, which is the same 堪 in its native reading. One kanji, three patterns, all about the limits of what a person can hold.", "confidence": "attested"}'),
  ('rq-ety-n1-wo-yoginaku-sareru', 'ety-n1-wo-yoginaku-sareru', '{"claim": "余儀 is \"another way\" — and 余儀なく is having none.", "body": "余 is the 余 of 余る, what is left over; 儀 is a matter or a manner. 余儀 is the other course available, and 余儀ない says there is not one.\n\nThe passive then supplies who was left without it: 中止を余儀なくされた is being put in a position where no other course remained. Nobody in the sentence chose anything, which is why the construction is the language of disasters and closures.", "confidence": "well-supported"}'),
  ('rq-ety-n1-ni-katakunai', 'ety-n1-ni-katakunai', '{"claim": "難い is the 難 of がたい, in its other reading — and here it is negated.", "body": "がたい at N3 says hard to bring oneself to. かたくない says the opposite: not hard at all.\n\n想像に難くない is \"it is not difficult to imagine\", a formal way of saying anyone can see it. Same kanji, same meaning, and the whole pattern is the negative doing its ordinary work.", "confidence": "well-supported"}'),
  ('rq-ety-n1-kiwamarinai', 'ety-n1-kiwamarinai', '{"claim": "極まる is \"to reach the furthest point\" — the 極 of 北極 and 極端.", "body": "A verb of arriving at an extreme. 極まりない negates it, and that is the puzzle: how does \"does not reach the extreme\" mean \"utterly\"?\n\nBecause what is denied is a stopping place. 失礼極まりない says the rudeness has no furthest point to arrive at, so it goes on without bound. 極まる without the negative means the same thing, which is the clearest sign the ない stopped doing negative work here long ago.", "confidence": "well-supported"}'),
  ('rq-ety-n1-no-itari', 'ety-n1-no-itari', '{"claim": "至り is from 至る, \"to arrive\" — the point a thing has arrived at.", "body": "至る is the verb on road signs, 東京に至る. 光栄の至り is honour arrived at its furthest.\n\nIt pairs with の極み as the two formal superlatives, and they differ by image rather than degree: 至り is where something got to, 極み is the top of it. Both belong to speeches and letters, and both take only abstract nouns.", "confidence": "well-supported"}'),
  ('rq-ety-n1-no-kiwami', 'ety-n1-no-kiwami', '{"claim": "極み is the noun from the 極まる of 極まりない — the summit itself.", "body": "Where 極まりない denies that a peak exists, の極み names it and puts the thing on top of it. 贅沢の極み is the very peak of luxury.\n\nOne kanji, two patterns, opposite constructions: the negated verb says there is no limit, the plain noun says here is the limit and this is it.", "confidence": "well-supported"}'),
  ('rq-ety-n1-to-aimatte', 'ety-n1-to-aimatte', '{"claim": "相まって is 相 (\"mutually\") with 待つ — two things waiting on each other.", "body": "相 is the prefix in 相手 and 相談, marking something done between parties. 相まつ is an old verb for two things meeting and reinforcing.\n\nThat mutual sense is why と相まって needs both halves to contribute. It is not \"along with\" but \"each amplified by the other\", which is why the result named afterwards is always more than either alone.", "confidence": "well-supported"}'),
  ('rq-ety-n1-hazumi-ni', 'ety-n1-hazumi-ni', '{"claim": "はずみ is 弾み, from 弾む — \"to bounce\".", "body": "ボールが弾む is a ball bouncing; 話が弾む is a conversation that takes off. The noun is momentum.\n\nSo 転んだはずみに is on the bounce of falling — the accident carried on into something else by its own momentum. That is why the pattern always describes something unintended: a bounce is not aimed.", "confidence": "well-supported"}'),
  ('rq-ety-n1-kirai-ga-aru', 'ety-n1-kirai-ga-aru', '{"claim": "きらい is 嫌い, the ordinary word for dislike, used as a noun for an unwelcome leaning.", "body": "嫌いがある names a tendency as something disliked, and that judgement is built into the pattern before any adjective is added.\n\nWhich is why it never takes a good habit. 早合点するきらいがある works; a tendency to be kind does not, and would have to be 傾向 instead. The word for distaste is doing the evaluating.", "confidence": "attested"}'),
  ('rq-ety-n1-ni-tomonatte', 'ety-n1-ni-tomonatte', '{"claim": "伴う is \"to accompany\" — the 伴 of 同伴 and 伴奏.", "body": "A companion verb. に伴って sets two changes travelling together.\n\nIt sits with につれて and にしたがって from N3 as three ways of pairing change, each from a different image: 連れる leads along, 従う follows, 伴う merely accompanies. 伴う is the most neutral of the three, which is why it suits reports and statistics.", "confidence": "well-supported"}'),
  ('rq-ety-n1-wo-yoso-ni', 'ety-n1-wo-yoso-ni', '{"claim": "よそ is 余所 — somewhere else, another place entirely.", "body": "よそ見 is looking away; よその人 is an outsider. をよそに puts the thing named somewhere other than where the actor is attending.\n\nSo the disregard is spatial before it is moral. 親の心配をよそに says the worry was left in another place and walked away from, which is why the pattern always carries a hint of reproach.", "confidence": "well-supported"}'),
  ('rq-ety-n1-to-wa-ie-mono-no', 'ety-n1-to-wa-ie-mono-no', '{"claim": "ならでは is the classical negative ならで with は — \"not being that, it is not\".", "body": "ならで is なり plus the で of negation, an older way of saying without being. Adding は makes it a topic and demands the denial that follows.\n\n日本ならではの味 is a taste that, absent Japan, does not occur. The construction is a double denial that lands as exclusivity, which is why it reads as praise rather than as a limit.", "confidence": "attested"}'),
  ('rq-ety-n1-inagara-ni-shite', 'ety-n1-inagara-ni-shite', '{"claim": "It is いる with the old ながら — remaining in the state of being where you are.", "body": "The same ながら as 生まれながらに, meaning a state that persists rather than two things at once. いながら is staying put.\n\n家にいながらにして世界中と話せる says the whole thing without moving: the state of being at home is unbroken while the rest happens. The pattern is a small monument to what ながら used to mean.", "confidence": "well-supported"}'),
  ('rq-ety-n1-gotoki', 'ety-n1-gotoki', '{"claim": "ごとし is the classical auxiliary of comparison, and ごとき is its noun-modifying form.", "body": "It inflects like an adjective: ごとく connects onward, ごとき stands before a noun, ごとし ends a sentence. 光陰矢のごとし — time flies like an arrow — is the phrase everybody knows.\n\nModern ようだ replaced it entirely, which is why ごとき now sounds either literary or contemptuous. 私ごとき is self-deprecation precisely because reaching for the archaic form makes a show of the comparison.", "confidence": "well-supported"}'),
  ('rq-ety-n1-to-ittatte', 'ety-n1-to-ittatte', '{"claim": "としたって is としても worn down in speech.", "body": "とする plus ても, contracted through としても to としたって. The same shortening that gives ちゃ from ては and じゃ from では.\n\nSo the meaning is unchanged and only the register moved: it is the casual spoken form of a written concessive. That it appears at N1 at all is because recognising the contraction is the hard part, not the grammar.", "confidence": "attested"}'),
  ('rq-ety-n1-nakushite', 'ety-n1-nakushite', '{"claim": "なくして is the classical なし again, in a form that connects onward.", "body": "The same adjective behind ない, なしに and なしには. なくして is its 連用形 with て, so it links to what follows.\n\n努力なくして成功はない demands the negative after it for the same reason なしには does: the absence has been set up as the thing the sentence is about, and only a denial completes it.", "confidence": "well-supported"}'),
  ('rq-ety-n1-mo-sarukoto-nagara', 'ety-n1-mo-sarukoto-nagara', '{"claim": "さる is 然る — \"such, that being so\" — the same 然 as in そう and 然し.", "body": "然る is a classical modifier meaning of that kind. さることながら is \"that being such a matter, and yet\".\n\nSo the pattern grants the first thing fully before raising the second, which is why it cannot be used to dismiss. 味もさることながらサービスがいい praises the food and then says the service is more remarkable still.", "confidence": "attested"}'),
  ('rq-ety-n1-ni-shite', 'ety-n1-ni-shite', '{"claim": "にして is に with the て of する — and it means two opposite things depending on what it lands on.", "body": "On a high number or a long span it means \"only at\": 六十にして始めた, not until sixty. On a small one it means \"even at\": 一瞬にして消えた, gone in a single instant.\n\nBoth are the same construction naming a point and remarking on it. What decides the reading is whether the point is surprisingly late or surprisingly small, and nothing in the grammar tells you which — the noun does.", "confidence": "attested"}'),
  ('rq-ety-n1-to-omoikiya', 'ety-n1-to-omoikiya', '{"claim": "きや is the classical past き with the question particle や — \"did one think?\"", "body": "き was the Old Japanese past tense, and や asked. 思いきや is \"one thought, did one?\" — a question that answers itself in the negative.\n\nThat is why the pattern always overturns what precedes it. 簡単だと思いきや難しかった: the thinking is raised as a question in order to be dismissed, and the surprise is built into the classical grammar rather than added by tone.", "confidence": "well-supported"}'),
  ('rq-ety-n1-tokoro-wo', 'ety-n1-tokoro-wo', '{"claim": "ところを is the 所 of N4 with を — the moment is the thing being cut into.", "body": "所 locates a moment as a place. The を marks that moment as what the speaker''s intrusion acts upon.\n\nお忙しいところをすみません apologises for the busy moment itself, not for anything done in it. That is why the pattern is fixed to apology and thanks: it names someone''s time as a thing you have taken.", "confidence": "well-supported"}'),
  ('rq-ety-n1-ni-arazu', 'ety-n1-ni-arazu', '{"claim": "あらず is あり with the classical negative ず — the ancestor of ではない.", "body": "あり was the Old Japanese existence verb, ancestor of ある. にあらず is the classical way of denying identity.\n\nIt survives in mottoes and set phrases — 人にあらず — for the same reason べからず survives on signs. The modern ではない descends from the same construction with で in place of に.", "confidence": "well-supported"}'),
  ('rq-ety-n1-ba-koso', 'ety-n1-ba-koso', '{"claim": "ばこそ is the conditional ば with the focus particle こそ from N3.", "body": "こso singles one thing out as the one that counts, and in classical Japanese it forced a particular ending on the sentence — 係り結び. Attached to a condition, it insists that this and no other is the reason.\n\n愛すればこそ叱る: precisely because there is love. The ば supplies the cause, こそ refuses every competing one, and neither part means \"precisely\" on its own.", "confidence": "well-supported"}'),
  ('rq-ety-n1-de-are', 'ety-n1-de-are', '{"claim": "であれ is the imperative of である — a command shape used to concede.", "body": "あれ is the classical imperative of あり. Telling a hypothetical to be whatever it likes is a way of saying it changes nothing.\n\n子供であれ大人であれ: be it a child, be it an adult. English does the same with \"be it\" — a fossil imperative in both languages, doing concession rather than command.", "confidence": "well-supported"}'),
  ('rq-ety-n1-you-ga-you-ga', 'ety-n1-you-ga-you-ga', '{"claim": "It pairs the volitional with まい, its negative counterpart, and puts が on both.", "body": "う／よう is intention; まい is the negative of it. 行こうが行くまいが lines the two up and marks each with が so that neither is preferred.\n\nThat is why the construction covers the whole field: it names the only two possibilities and then declines to choose. The same shape with にしろ or であれ does the same work with different words.", "confidence": "well-supported"}'),
  ('rq-ety-n1-mai', 'ety-n1-mai', '{"claim": "まい descends from まじ, the Old Japanese auxiliary of negative conjecture and intention.", "body": "まじ negated べし. Where べし said something should or would be, まじ said it should not or would not, and まい is what survives of it.\n\nIt kept both of べし''s senses. 雨は降るまい is conjecture — surely not; 二度と行くまい is resolve — I will not. The two readings that textbooks list separately are the one auxiliary, and which you get depends only on the person of the subject.", "confidence": "well-supported"}'),
  ('rq-ety-n1-nari-nari', 'ety-n1-nari-nari', '{"claim": "This なり is the classical particle of selection — take this one or that one.", "body": "Another of the several なり in the language, this one offering alternatives rather than asserting identity. 電話なりメールなり: by phone or by mail, as you please.\n\nBecause it offers rather than lists, it belongs with suggestions and permissions and takes a verb of choosing or doing afterwards. That distinguishes it from やら, which lists a mess, and from だの, which lists with irritation.", "confidence": "attested"}'),
  ('rq-ety-n1-dano', 'ety-n1-dano', '{"claim": "だの is the copula だ with の, listing things at arm''s length.", "body": "The の nominalises each item, so the speaker names them as things rather than saying them straight. 暑いだの寒いだの quotes the complaints instead of making them.\n\nThat distance is the irritation. It is why だの is always used about someone else''s grumbling, and why it will not sit in a neutral list where と or や would do.", "confidence": "attested"}'),
  ('rq-ety-n1-tsu-tsu', 'ety-n1-tsu-tsu', '{"claim": "This つ is the Old Japanese perfective auxiliary — the same つ that became the て of the te-form.", "body": "つ marked a completed action. Doubled and alternated, it gives 行きつ戻りつ: going and returning, each completed in turn.\n\nSo the pattern is a direct survival of the auxiliary taught at N5 as the origin of て. The te-form is つ worn into a connector; 〜つ〜つ is つ preserved whole in a handful of frozen pairs, and no new ones are being made.", "confidence": "well-supported"}'),
  ('rq-ety-n1-koto-naku', 'ety-n1-koto-naku', '{"claim": "ことなく is こと with the classical なく — the matter does not occur.", "body": "The nominaliser from N4 and the adverbial form of なし. 休むことなく働いた names resting as a matter and says there was none of it.\n\nIt is the written counterpart of ないで, and the difference is exactly that ことなく makes the absent thing a noun first. That is why it takes only verbs describing a whole activity, and why it sounds wrong in speech.", "confidence": "well-supported"}'),
  ('rq-ety-n1-ni-oite', 'ety-n1-ni-oite', '{"claim": "において is 置く — the same verb as 〜ておく at N4.", "body": "置く is to put something down and leave it. において sets the matter down in a place and discusses it there.\n\nSo the formality is not in the meaning but in the register: において is the written language''s で, and it is doing the same locating job with a heavier verb. That it shares a root with the everyday 〜ておく is easy to miss because one is written in kanji and the other never is.", "confidence": "well-supported"}'),
  ('rq-ety-n1-wo-tsuujite', 'ety-n1-wo-tsuujite', '{"claim": "通じる is \"to pass through\" — the same 通 as the とおり of N3.", "body": "通る is to pass along, 通じる to get through. を通じて sends the sentence through the thing named.\n\nBoth textbook senses are that passage. A medium is 友人を通じて, passing through a person; a duration is 一年を通じて, passing through a year. を通して is the same verb in its other form and is very nearly interchangeable.", "confidence": "well-supported"}'),
  ('rq-ety-n1-yue-ni', 'ety-n1-yue-ni', '{"claim": "ゆえ is 故, a noun meaning a reason or a cause.", "body": "The 故 of 事故 and 故に. It is an ordinary noun, which is why it takes の after another noun: 病気ゆえに, 貧しさの故に.\n\nIt is the most formal of the reason words, above ため and から, because 故 belongs to classical and written Japanese. Descartes in Japanese is 我思う、ゆえに我あり, and the register is exactly right for it.", "confidence": "well-supported"}'),
  ('rq-ety-n1-tote', 'ety-n1-tote', '{"claim": "とて is the quotative と with て — \"even saying that\".", "body": "The same construction as といっても with the verb of saying left out entirely. What remains concedes a point and then declines to be moved by it.\n\n子供とて許されない: even granting it is a child. It is worth keeping apart from とても, which is a different word entirely and far commoner — the resemblance is accidental and catches readers out.", "confidence": "well-supported"}'),
  ('rq-ety-n1-yori-hoka-nai', 'ety-n1-yori-hoka-nai', '{"claim": "ほか is 外 — outside. There is nothing outside this option.", "body": "より marks comparison, 外 is the outside of a thing. 諦めるよりほかない says that beyond giving up there is nothing.\n\nIt is the formal twin of しかない, and both draw the same picture: everything else has been excluded and one course is left standing. ほかならない at N2 is the same 外, denying that anything outside applies.", "confidence": "well-supported"}'),
  ('rq-ety-n1-dou-ni-mo', 'ety-n1-dou-ni-mo', '{"claim": "どうにも is \"how\" with に and も — by no manner of means.", "body": "どう asks in what way; に makes it a means; も sweeps every one of them in. With a negative it takes the whole range of methods and rules them out together.\n\nThat is the same も that makes 誰も into \"nobody\" at N4. Sweeping a question word with も and then negating is one of the language''s standard moves, and どうにも is it applied to method.", "confidence": "well-supported"}'),
  ('rq-ety-n1-ni-shiro', 'ety-n1-ni-shiro', '{"claim": "しろ is the imperative of する — telling the alternative to be so, and conceding it.", "body": "The same fossil-imperative trick as であれ. 行くにしろ行かないにしろ commands each possibility to stand and then says neither matters.\n\nにせよ is the same verb in its classical imperative, which is why the two are interchangeable and にせよ is the stiffer. Japanese builds concession out of commands more than once, and this is the clearest case.", "confidence": "well-supported"}'),
  ('rq-ety-n1-hitotsu-de', 'ety-n1-hitotsu-de', '{"claim": "ひとつ is the plain counter 一つ, and で is the で of means.", "body": "Nothing classical in it at all. 考えひとつで人生は変わる is \"by one thought, life changes\".\n\nWhat makes it a pattern is the で doing instrumental work on a bare count: one of the thing named is the whole of what it takes. The rhetorical weight comes from how little is being claimed as sufficient.", "confidence": "well-supported"}'),
  ('rq-ety-n1-ga-yue-ni', 'ety-n1-ga-yue-ni', '{"claim": "The が in がゆえに is the classical GENITIVE — the が taught at N5 as an old \"of\".", "body": "Before が marked subjects it marked possession, which is why 我が国 still reads as \"my country\". がゆえに is \"by reason OF\", with が doing the joining.\n\nSo the difference from plain ゆえに is not emphasis added but an older grammar preserved: が binds the reason to what precedes it more tightly than の would, and the whole phrase is a classical fossil kept for formal writing.", "confidence": "well-supported"}'),
  ('rq-ety-n1-shimatsu-da', 'ety-n1-shimatsu-da', '{"claim": "始末 is 始 plus 末 — the beginning and the end, the whole course of a thing.", "body": "The noun means how something turned out, and it survives in 始末書, the written account of an incident you are answerable for.\n\nBecause it names the entire course, 始末だ always follows a stated sequence of events and delivers the verdict on it. And because you only write a 始末書 when things went wrong, the verdict is always bad.", "confidence": "well-supported"}'),
  ('rq-ety-n1-ta-tokoro-de', 'ety-n1-ta-tokoro-de', '{"claim": "たところで is the 所 of N4 with で — at that point, and no further.", "body": "所 locates a moment. The past tense puts it after the act, and で marks it as where matters stand.\n\nSo 謝ったところで許されない is \"at the point of having apologised, still not forgiven\": the concession is that the act was completed and got you nowhere. That is why the pattern needs the past in front and a negative behind.", "confidence": "well-supported"}')
) AS v(id, target, proposed)
JOIN etymology_entries e ON e.id = v.target
ON CONFLICT (id) DO NOTHING;
