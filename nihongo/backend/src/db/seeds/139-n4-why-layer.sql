-- The why-layer for N4: 47 of the 61 topics.
--
-- The layer stopped at N5 — 27 entries, all of them there. Everything from N4
-- up had none, which is the level where Japanese starts asking you to memorise
-- things that have reasons.
--
-- Fourteen N4 topics are deliberately left without an entry. 〜予定, 〜間に,
-- 〜前に／〜後で, 〜まで／〜までに, 〜場合, 〜始める, 〜ことがある, 〜そうもない,
-- 〜ようとする, 〜なくてもいい and 〜し are transparent — the words mean what they
-- look like, and an entry would be restating the lesson in older clothes.
-- 〜けれど and 〜だろう already have entries at N5, on gp-kedo and gp-deshou.
-- Padding this table with trivia would dilute the one thing that makes the
-- layer worth reading; that is seed 012's header and it still holds.
--
-- Nothing here has a source row. `source_count` is 0 rather than a number with
-- nothing behind it, and every entry lands at 'in-review': all 265 entries a
-- reader can currently see carry a human review, and this seed does not break
-- that. Approving them is a person's job, and the queue rows at the bottom are
-- what put them in front of one.
--
-- Additive, idempotent, safe on a live database.

INSERT INTO etymology_entries
  (id, language_id, grammar_point_id, aspect, claim, body, period, confidence,
   is_disputed, is_primary, status, generated_by, source_count) VALUES
  ('ety-n4-potential', 'lang-ja', 'gp-potential', 'historical-grammar',
   'The potential and the passive are the same auxiliary, which is why 食べられる is both.',
   'Old Japanese had one auxiliary, る／らる, carrying four senses at once: passive, potential, spontaneous and honorific. Modern れる／られる inherited all four, undivided.

Godan verbs escaped. Somewhere around the Edo period they grew a dedicated potential of their own — 書ける, 読める, the 可能動詞 — and stopped using 書かれる to mean "can write". Ichidan verbs and 来る never did, which is exactly why 食べられる still has to carry both jobs and 書ける does not.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-ra-nuki', 'lang-ja', 'gp-ra-nuki', 'historical-grammar',
   'Dropping the ら gives ichidan verbs the separate potential that godan verbs got centuries ago.',
   '食べれる is usually described as sloppy, and prescriptively it still is. Historically it is the same change that produced 書ける, arriving late for the verbs it skipped.

That is what makes it hard to stamp out: it does real work. 食べられる is potential, passive and honorific all at once, and 食べれる is unambiguously "can eat". The form people are told off for using is the one that removes the ambiguity.',
   'Modern', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-volitional', 'lang-ja', 'gp-volitional', 'historical-grammar',
   'The volitional う／よう is Old Japanese む, worn down to a vowel.',
   'む was the auxiliary of intention and conjecture. Its consonant nasalised and then dropped, leaving the う you now write on 行こう.

It is still visible in two forms taught much earlier: ましょう is ます plus this same う, and でしょう is である plus it. That is why the volitional covers both "let us" and "probably" with no change of shape — む never distinguished them either.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-passive', 'lang-ja', 'gp-passive', 'historical-grammar',
   'The passive れる／られる also carries the spontaneous and the honorific, from the one Old Japanese auxiliary る／らる.',
   'One auxiliary, four senses, none of them lost. It is why 先生が来られる can mean the teacher was come to, can come, or — most likely — simply comes, spoken respectfully.

The suffering passive follows from the spontaneous sense rather than the passive one. 雨に降られた is not "I was rained on" as a grammatical operation; it is the older idea of something happening of itself, to someone. That is where the grievance in the construction comes from, and why Japanese can put an intransitive verb in the passive at all.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-causative', 'lang-ja', 'gp-causative', 'historical-grammar',
   'The causative す／さす is a separate Old Japanese auxiliary, not a form of する.',
   'It looks like する and is not. す／さす attached to the 未然形 and meant to make or let happen; it survives as modern せる／させる.

Make and let are one form because the auxiliary never separated them — the difference is carried by the particle. 子供を行かせる compels; 子供に行かせる permits, because に marks someone with their own part in it while を marks something acted upon.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-causative-passive', 'lang-ja', 'gp-causative-passive', 'historical-grammar',
   'させられる is literally the causative with the passive stacked on it, in that order.',
   'せる／させる makes someone do it; れる／られる then makes them the one it was done to. 食べさせられた parses as "was made to eat", each piece doing its own job.

The unwillingness is not an extra meaning anyone added. It falls out of the passive, which in Japanese carries the sense of something befalling you. Godan verbs also contract it — 行かせられる becomes 行かされる — which is worth recognising, because the short form is what people actually say.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-to-conditional', 'lang-ja', 'gp-to-conditional', 'historical-grammar',
   'The conditional と is the same particle that quotes speech and joins nouns.',
   'One と. It links two things and asserts they go together: 本と鉛筆 pairs two nouns, 「はい」と言った pairs an utterance with the saying of it, and 押すと開く pairs pushing with opening.',
   'Old Japanese', 'attested', false, true, 'in-review', 'claude', 0),

  ('ety-n4-ba-conditional', 'lang-ja', 'gp-ba-conditional', 'historical-grammar',
   'The ば conditional is built on what used to be the REALIS stem, not the hypothetical one.',
   'Old Japanese had both: ば on the 未然形 was hypothetical, ば on the 已然形 meant "when" or "because" — something taken as actually so. The 未然形 construction died out, and the surviving 已然形 one took over the hypothetical meaning. Modern grammar renames that stem 仮定形, "hypothetical form", which quietly records the swap.

The old realis sense has not entirely gone. It is why ば sits so comfortably in general truths — 春になれば暖かくなる — and why a request or a command after it still reads as slightly stiff.',
   'Heian', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-tara-conditional', 'lang-ja', 'gp-tara-conditional', 'historical-grammar',
   'たら is the only conditional built out of the past auxiliary, and it behaves like it.',
   'と, ば and なら descend from particles and a copula. たら descends from たり, the same auxiliary that gave the past tense た, and it is たり in its 未然形.

That completive sense is still inside it, which is why たら means "once X has happened" rather than a bare hypothesis, and why it is the one conditional that takes a request, an invitation or a command afterwards without sounding wrong. 駅に着いたら電話して is natural; the same sentence on ば is not.',
   'Heian', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-nara-conditional', 'lang-ja', 'gp-nara-conditional', 'historical-grammar',
   'なら is the 未然形 of the old copula なり, which was に plus あり.',
   'なり asserted that something was so. Its 未然形 なら supplies the modern conditional, and it inherited that asserting job rather than a hypothesising one.

Which is why なら picks something up instead of supposing it. 京都なら電車が早い answers a Kyoto that somebody has already put on the table; it does not raise the possibility. That is also why なら, alone among the four, attaches straight to a bare noun.',
   'Heian', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-tari-tari', 'lang-ja', 'gp-tari-tari', 'historical-grammar',
   'The り of 〜たり〜たり is the same たり that became the past tense た.',
   'たり — itself て plus あり — could be repeated across a series, and that repeating use is what survives here while the single one narrowed into た.

It explains the one thing learners get wrong about the construction: 〜たり〜たり does not list everything you did. It names two of them as specimens, which is why the list is left open and why a single たり still sounds like there was more.',
   'Heian', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-koto-ga-dekiru', 'lang-ja', 'gp-koto-ga-dekiru', 'word-origin',
   '出来る is literally "to come out" — to come into being.',
   '出る plus 来る. Before it meant "can", 出来る meant something was produced or came about, a sense still plain in 出来上がる and in 出来事, "an occurrence".

So 話すことができる says the speaking-of-it comes about. That is a whole noun phrase with a verb after it, not an ending on a verb, and it is why the construction is the formal one: it takes the long way round, naming the act before saying it is possible.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-sou-hearsay', 'lang-ja', 'gp-sou-hearsay', 'historical-grammar',
   'Hearsay そうだ attaches to a complete sentence because it reports a complete sentence.',
   '降るそうだ takes the plain form whole — tense, negation and all — because what is being passed on is somebody else''s statement, and a statement needs all of it.

That single fact separates it from the そうだ of appearance, which takes a bare stem. 降りそうだ and 降るそうだ differ by one syllable and mean entirely different things: one is the sky, the other is the forecast. The attachment point is the whole distinction, and it is more reliable to lean on than the meaning.',
   'Edo', 'attested', false, true, 'in-review', 'claude', 0),

  ('ety-n4-sou-appearance', 'lang-ja', 'gp-sou-appearance', 'historical-grammar',
   'Appearance そうだ attaches to a bare stem because it describes how a thing looks, not what was said.',
   '美味しそう cuts the い off and leaves the stem, and 降りそう uses the ます stem. There is no room in the form for tense or negation, and there does not need to be: you are reporting a look, and a look has no tense.

Hence the two exceptions that are otherwise pure memorisation. いい becomes よさそう and ない becomes なさそう, both taking a さ, because a one-syllable stem is too little to hang the ending on.',
   'Edo', 'attested', false, true, 'in-review', 'claude', 0),

  ('ety-n4-you-da', 'lang-ja', 'gp-you-da', 'word-origin',
   'よう is the noun 様, "appearance, manner, the way a thing is".',
   '様 is an ordinary noun — the 様 of 様子 and of 皆様. 雨のようだ is literally "it has the appearance of rain".

Recognising it as a noun explains an entire family at once. ように is that noun with に, "in the manner that"; ようになる is coming to be that way; ようにする is making it that way; みたい is the casual stand-in for the same thing. Five patterns, one word, and it is why every one of them takes の after a noun — 学生のよう — exactly as any other noun would.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-rashii', 'lang-ja', 'gp-rashii', 'historical-grammar',
   'らしい descends from らし, an Old Japanese auxiliary of inference from evidence.',
   'らし meant a conclusion reached on grounds outside the speaker. That is the whole difference between 雨らしい and 雨のようだ: らしい leans on what was reported or observed, ようだ on what the speaker makes of it.

The same root gives the suffix in 男らしい and 学生らしい, "as one would expect of". Both uses are one idea — judging something by the evidence of what it appears to be.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-mitai', 'lang-ja', 'gp-mitai', 'word-origin',
   'みたい is worn down from 見た様 — "the way it looked".',
   '見た, the past of 見る, plus the same 様 that gives ようだ. The origin says outright what the grammar books say: it is ようだ for casual speech.

And it explains the conjugation, which otherwise looks arbitrary. みたい inflects as a na-adjective — みたいな人, みたいに — because 様 is a noun and always was.',
   'Edo', 'attested', false, true, 'in-review', 'claude', 0),

  ('ety-n4-hazu', 'lang-ja', 'gp-hazu', 'word-origin',
   '筈 is the notch at the end of an arrow, cut to fit the bowstring.',
   'A 筈 is made to fit. Nock the arrow and it seats, because that is what it was shaped for.

So はず is not a guess. It is the expectation you have when the parts were made to go together — 彼は来るはずだ says the arrangement was made, not that you feel he probably will. That is the whole difference from かもしれない and でしょう, and why はずがない is a flat contradiction rather than a doubt.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-kamoshirenai', 'lang-ja', 'gp-kamoshirenai', 'historical-grammar',
   'It parses literally as "it cannot even be known whether".',
   'か is the question particle, も is "even", and 知れない is the negative potential of 知れる, "to become known". Nothing in it has been idiomatised away.

Read that way the low confidence is not a fact to memorise, it is the sentence. かもしれない claims only that the question is open — which is why it sits below でしょう and far below はず, and why the polite かもしれません keeps the same shape rather than becoming a different word.',
   'Edo', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-to-iu', 'lang-ja', 'gp-to-iu', 'historical-grammar',
   'という is the quotative particle と with the verb 言う, doing exactly what it looks like.',
   '田中という人 is "a person one says 田中 of". The naming use is the plain literal reading, and it is why the thing named goes in front with no particle of its own.

The abstract use follows the same path. 彼が来るということ is "the saying that he comes" — と marks the quoted content, 言う makes it a stated thing, and こと turns that into a noun you can put a particle on.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-ka-dou-ka', 'lang-ja', 'gp-ka-dou-ka', 'historical-grammar',
   'かどうか is literally "whether — how — whether": a question left standing inside a sentence.',
   'か is the question particle, どう is "how", and the second か closes the alternative. The pattern embeds a real question rather than referring to one.

That is why the plain form goes in front of it and why です never does: 学生かどうか, never 学生ですかどうか. The politeness belongs to the sentence around the question, not to the question buried in it.',
   'Edo', 'attested', false, true, 'in-review', 'claude', 0),

  ('ety-n4-te-ageru', 'lang-ja', 'gp-te-ageru', 'word-origin',
   'あげる is 上げる, "to raise" — giving is pictured as handing upward.',
   'Japanese sorts giving by direction rather than by who owns what. 上げる sends the thing up, away from the speaker toward the recipient.

Which is why 〜てあげる has to be handled carefully. Announcing that you will raise a favour up to someone puts them below you in the act of helping them, and that is precisely how 手伝ってあげます can land badly on a superior. 〜ましょうか avoids naming the direction at all.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-te-kureru', 'lang-ja', 'gp-te-kureru', 'word-origin',
   'くれる is 呉れる, the giving that comes DOWN and inward, toward the speaker.',
   'It is the opposite arrow from 上げる, and it is why くれる cannot be used for a gift between two other people that has nothing to do with you: the verb encodes arrival at your side.

Its honorific is 下さる — literally "to give downward" — which is the 下さい you have been saying since the first lesson. 買ってくれた and 買ってくださった are one verb at two heights.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-te-morau', 'lang-ja', 'gp-te-morau', 'word-origin',
   'もらう is 貰う, "to receive" — the same event as くれる, told from the other end.',
   '友達が手伝ってくれた and 友達に手伝ってもらった describe one afternoon. くれる makes the helper the subject; もらう makes you the subject and demotes the helper to に.

That particle is the whole grammar of it. に marks the source a thing is received from, exactly as in 友達に本をもらう, so there is no separate rule to learn about who takes which particle in the compound.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-te-oku', 'lang-ja', 'gp-te-oku', 'word-origin',
   'おく is 置く, "to put something down and leave it there".',
   '置く is a full verb — 机に本を置く. Attached to a te-form it keeps both halves of its meaning: the doing, and the leaving in place afterwards.

So 〜ておく is never just "do in advance". It is doing something and leaving the result standing for later, which is why it fits preparation (予約しておく) and equally fits deliberately not undoing something (そのままにしておく). The contraction 〜とく is the same word said faster.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-te-shimau', 'lang-ja', 'gp-te-shimau', 'word-origin',
   'しまう is 仕舞う — to put away, to close up a shop for the night.',
   'The literal verb is still in use: 片付けて仕舞う, to tidy things away. It carries finishing and shutting in one action.

Both senses of the compound come straight out of that, and they are not two meanings but one. 食べてしまった is finished off completely; 忘れてしまった is regrettable — because a thing that has been put away and the shutters brought down is a thing you cannot get back at. The casual 〜ちゃう is a contraction of 〜てしまう, and 〜じゃう of 〜でしまう.',
   'Edo', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-te-miru', 'lang-ja', 'gp-te-miru', 'word-origin',
   'みる is 見る, "to look" — do it and see what happens.',
   'Written in kana rather than as 見る precisely because it has stopped being about the eyes, but the meaning is unchanged: perform the action and then look at the result.

Hence the limit that catches people out. 〜てみる needs an action you could choose to take and then inspect, so 食べてみる and 聞いてみる work while 分かってみる does not — there is nothing to look at afterwards that you decided to do.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-te-iku-kuru', 'lang-ja', 'gp-te-iku-kuru', 'word-origin',
   'いく and くる are 行く and 来る, and they point away from now and toward it.',
   'The two verbs of motion, doing in time what they do in space. 来る arrives where the speaker is; 行く departs from there.

Set the anchor at the present moment and the whole pattern falls out. 増えてきた is an increase that has travelled up to now, so it looks back; 増えていく carries on past now, so it looks forward. It is also why 〜てくる so often covers a beginning — the movement had to start somewhere behind you to have reached here.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-te-aru', 'lang-ja', 'gp-te-aru', 'word-origin',
   'ある is the existence verb for things, which is why てある describes a state rather than an act.',
   'Japanese splits existence in two: いる for what moves of itself, ある for what does not. 〜てある is built on the inanimate one, so what it asserts is that a thing exists in a done condition.

That explains the particle switch that makes the pattern look irregular. 窓を開けてある becomes 窓が開けてある because the sentence is no longer about anyone opening anything; it is about the window, and what is being said of it is that it stands opened. The person who did it has been left out on purpose, and ている differs exactly there — 開いている says the window is open, with nobody implied at all.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-tame-ni', 'lang-ja', 'gp-tame-ni', 'word-origin',
   'ため is the noun 為, "benefit, sake, account".',
   'A plain noun, still written 為 in careful prose. 家族のために働く is "work for the family''s sake" with no idiom in it anywhere.

One noun covers both textbook meanings — purpose and benefit — because they were never separate. It also explains the cause reading, 雨のために中止, which is the same noun pointed backwards: on account of.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-you-ni-purpose', 'lang-ja', 'gp-you-ni-purpose', 'word-origin',
   'ように is the noun 様 with に — "in such a way that it comes about".',
   'ために names a purpose you intend. ように names a manner you hope things fall into, and the difference is doing real work in the grammar.

It is why ように takes the verbs you cannot simply decide — potentials, negatives, things happening to other people — while ために takes the ones you can. 聞こえるように大きな声で話す, because being audible is not something you do; 勉強するために, because studying is. Same speaker, same intention, two constructions, and the verb decides which.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-you-ni-naru', 'lang-ja', 'gp-you-ni-naru', 'word-origin',
   'ようになる is 様 plus なる: coming to be the way where something happens.',
   'なる is change of state, 様 is the way a thing is. Put together they describe arriving at a condition rather than performing an act.

That is why it pairs so naturally with the potential — 泳げるようになった, "reached the state of being able to swim" — and why it needs a plain form in front rather than a stem. What comes to be the case is a whole situation, not a bare verb.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-you-ni-suru', 'lang-ja', 'gp-you-ni-suru', 'word-origin',
   'ようにする is the same 様 with する: making it the way where something happens.',
   'なる and する are the standard Japanese pair for a change that happens and a change you bring about, and they sit either side of the identical ように.

So 早く寝るようにする is not a decision to sleep early; it is arranging matters so that early sleeping is what happens. The habitual, effortful reading that textbooks list separately is simply what "make it be that way" means when it is said about your own conduct.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-yasui-nikui', 'lang-ja', 'gp-yasui-nikui', 'word-origin',
   '易い and 難い are ordinary adjectives meaning easy and difficult.',
   'Both stand alone in older and formal Japanese, and both keep their own inflection in the compound — 読みやすかった, 読みにくくない — because an adjective is what they still are.

難い is worth following further. It survives in 有り難い, "difficult to exist", said of something so rare it is precious; and that word, worn down, is ありがとう. The word for thank you is an adjective meaning hard to come by.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-kata', 'lang-ja', 'gp-kata', 'word-origin',
   'かた is 方 — the same 方 as in ほうが, meaning a direction or a way.',
   '書き方 is the way of writing, 行き方 the way of going. The noun is doing its ordinary job.

Because it is a noun the whole phrase is a noun, which is why 使い方が分からない takes が and why the thing acted on switches to の: 漢字を書く but 漢字の書き方. It is also why the reading voices to がた in 読みがた-type compounds, the ordinary rendaku any noun undergoes in second position.',
   'Old Japanese', 'attested', false, true, 'in-review', 'claude', 0),

  ('ety-n4-noni-although', 'lang-ja', 'gp-noni-although', 'historical-grammar',
   'のに is the nominaliser の with the particle に — "for the case that", aimed at an outcome.',
   'Read literally it points at something as a target: 高いのに買った sets the expensiveness up as the thing the buying was done against.

That is where the grievance lives. けれど merely joins two clauses, but のに names one as the mark the other failed to respect, so it always carries the speaker being put out. It is also why のに cannot be followed by a request or an intention — you cannot aim at an outcome and then propose one.',
   'Heian', 'attested', false, true, 'in-review', 'claude', 0),

  ('ety-n4-bakari', 'lang-ja', 'gp-bakari', 'word-origin',
   'ばかり is 計り, from 計る — "to measure".',
   'A measure, an amount. That is the sense still visible in 三日ばかり, "about three days", which textbooks list as a separate meaning and which is really the original one.

Narrow "an amount of" to "that amount and no more" and the other uses appear. 遊んでばかりいる is nothing but playing; 食べたばかり is only just eaten, a measure of time so small there is none to spare. One noun, measured tightly.',
   'Heian', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-tokoro', 'lang-ja', 'gp-tokoro', 'word-origin',
   'ところ is 所, a place — Japanese locating a moment in time as a spot.',
   '出かけるところ is the place in events where leaving is about to occur. The metaphor is so ordinary in English too — "at the point of leaving" — that it usually passes unnoticed.

Seeing it as a place explains why the tense in front does all the work and ところ itself never changes: 出かけるところ is the spot before, 出かけているところ the spot during, 出かけたところ the spot just after. It also explains the particle, since ところ is a noun and takes を, に and で like any other.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-o-ni-naru', 'lang-ja', 'gp-o-ni-naru', 'historical-grammar',
   'お〜になる makes someone''s action into a state they arrive at rather than a thing they do.',
   'なる is the verb of becoming. Respect in Japanese works by not pointing directly at what the honoured person did, and putting their action inside なる is one way of looking away from it.

The honorific お is the same one on お名前 and お茶. Set beside the humble お〜する, the pair is exactly なる against する — what comes about for them, what is done by you — which is the whole system in two verbs.',
   'Heian', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-o-suru', 'lang-ja', 'gp-o-suru', 'historical-grammar',
   'お〜する puts your own action inside する, the plain verb of doing.',
   'The mirror of お〜になる. Your act stays an act — nothing is softened about the doing — and the humility comes from the お, which frames the action as offered toward the person it touches.

That direction is the rule the pattern lives by: it only works for something done to or for somebody else. お待ちします is waiting for you; there is no honest お〜する for eating your own lunch, because there is nobody for the act to be pointed at.',
   'Heian', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-kinshi-na', 'lang-ja', 'gp-kinshi-na', 'historical-grammar',
   'The な that forbids and the な that softens are two different words that collided.',
   'The prohibitive な is Old Japanese and attaches to the plain present: 行くな, "do not go". The gentle な is a contraction of なさい and attaches to the ます stem: 行きな, "go on then".

So 食べるな and 食べな are opposites separated by one syllable, and the syllable is not the な — it is what the な is stuck to. Reading the stem tells you which one you are looking at, and nothing else will.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-garu', 'lang-ja', 'gp-garu', 'historical-grammar',
   'がる asserts the outward signs of a feeling, because Japanese will not let you assert the feeling itself.',
   '彼は寒い is not merely unusual, it is ungrammatical for most speakers. You may report your own inner state flatly and nobody else''s, and がる is the repair: 彼は寒がっている says he is showing every sign of cold.

It is also why がる produces a verb rather than an adjective. Signs are things somebody does — hence 寒がっている in the progressive, and 欲しがる taking を where 欲しい takes が, because wanting-behaviour has an object in a way that wanting does not.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-nominalise', 'lang-ja', 'gp-nominalise', 'historical-grammar',
   'こと is the abstract noun for a matter; の is concrete, and the split runs on perception.',
   'こと is a real noun meaning a fact or an affair, and it makes a clause into one of those. の is the nominalising particle, and what it makes is nearer to hand.

The rule everyone eventually learns follows from that difference rather than sitting on top of it. Verbs of perceiving take の — 彼が来るのを見た, because you watched the arriving, not the fact of it — while 約束する, 決める and できる take こと, because what you promise or decide is a matter, never a sight. Where either is possible, the sentence really is saying two slightly different things.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-gimonshi-ka', 'lang-ja', 'gp-gimonshi-ka', 'historical-grammar',
   'The か that makes a question is the same か that turns 誰 into "someone".',
   '誰か is literally "who?" left standing — the question mark folded into the word, so it names the answer without knowing it.

That is why the series is so regular once you see it: 何か, どこか, いつか, all one particle on the ordinary interrogatives. And it is why 誰も, with も instead, sweeps the other way into "anyone at all" and then, with a negative, "nobody".',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-nakucha', 'lang-ja', 'gp-nakucha', 'historical-grammar',
   'なくちゃ and なきゃ are worn-down conditionals with the second half of the sentence bitten off.',
   'なくては becomes なくちゃ; なければ becomes なきゃ. Both are the front half of the double negative taught earlier — なければならない, "if not, it will not do" — with ならない simply dropped.

So the obligation is not in the words at all. It is in the missing ones, which is why these feel casual and why the ending sounds unfinished: it is unfinished. The same shortening gives ちゃ and じゃ from ては and では.',
   'Modern', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-temo', 'lang-ja', 'gp-temo', 'historical-grammar',
   'ても is the te-form with も, and も is "even".',
   'The particle is the same one in 私も and 一度も. It adds the sense of even, and nothing else has been added anywhere.

雨が降っても行く is therefore "even with it raining, I go" — the te-form supplies the linking, も supplies the concession. It also explains the question-word pattern 何を食べても, where も keeps its sweeping sense and takes the whole range at once.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0),

  ('ety-n4-meirei', 'lang-ja', 'gp-meirei', 'historical-grammar',
   'The imperative is a stem in its own right, which is why it has no polite version.',
   'Old Japanese verbs had a 命令形 among their six forms, and modern 行け and 食べろ come straight down from it. It is a conjugation, not something added to a verb.

There is nowhere in it to put politeness — that is what ください and なさい are for, and both are built from other verbs entirely. It is also why the imperative survives where bluntness is the point: signs, coaching, and 頑張れ.',
   'Old Japanese', 'well-supported', false, true, 'in-review', 'claude', 0)
ON CONFLICT (id) DO NOTHING;

-- One review-queue row per entry, so they surface where the others did.
INSERT INTO content_review_queue
  (id, language_id, target_table, target_id, change_type, proposed, origin, priority, status) VALUES
  ('rq-ety-n4-potential', 'lang-ja', 'etymology_entries', 'ety-n4-potential', 'create', '{"claim": "The potential and the passive are the same auxiliary, which is why 食べられる is both.", "body": "Old Japanese had one auxiliary, る／らる, carrying four senses at once: passive, potential, spontaneous and honorific. Modern れる／られる inherited all four, undivided.\n\nGodan verbs escaped. Somewhere around the Edo period they grew a dedicated potential of their own — 書ける, 読める, the 可能動詞 — and stopped using 書かれる to mean \"can write\". Ichidan verbs and 来る never did, which is exactly why 食べられる still has to carry both jobs and 書ける does not.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-ra-nuki', 'lang-ja', 'etymology_entries', 'ety-n4-ra-nuki', 'create', '{"claim": "Dropping the ら gives ichidan verbs the separate potential that godan verbs got centuries ago.", "body": "食べれる is usually described as sloppy, and prescriptively it still is. Historically it is the same change that produced 書ける, arriving late for the verbs it skipped.\n\nThat is what makes it hard to stamp out: it does real work. 食べられる is potential, passive and honorific all at once, and 食べれる is unambiguously \"can eat\". The form people are told off for using is the one that removes the ambiguity.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-volitional', 'lang-ja', 'etymology_entries', 'ety-n4-volitional', 'create', '{"claim": "The volitional う／よう is Old Japanese む, worn down to a vowel.", "body": "む was the auxiliary of intention and conjecture. Its consonant nasalised and then dropped, leaving the う you now write on 行こう.\n\nIt is still visible in two forms taught much earlier: ましょう is ます plus this same う, and でしょう is である plus it. That is why the volitional covers both \"let us\" and \"probably\" with no change of shape — む never distinguished them either.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-passive', 'lang-ja', 'etymology_entries', 'ety-n4-passive', 'create', '{"claim": "The passive れる／られる also carries the spontaneous and the honorific, from the one Old Japanese auxiliary る／らる.", "body": "One auxiliary, four senses, none of them lost. It is why 先生が来られる can mean the teacher was come to, can come, or — most likely — simply comes, spoken respectfully.\n\nThe suffering passive follows from the spontaneous sense rather than the passive one. 雨に降られた is not \"I was rained on\" as a grammatical operation; it is the older idea of something happening of itself, to someone. That is where the grievance in the construction comes from, and why Japanese can put an intransitive verb in the passive at all.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-causative', 'lang-ja', 'etymology_entries', 'ety-n4-causative', 'create', '{"claim": "The causative す／さす is a separate Old Japanese auxiliary, not a form of する.", "body": "It looks like する and is not. す／さす attached to the 未然形 and meant to make or let happen; it survives as modern せる／させる.\n\nMake and let are one form because the auxiliary never separated them — the difference is carried by the particle. 子供を行かせる compels; 子供に行かせる permits, because に marks someone with their own part in it while を marks something acted upon.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-causative-passive', 'lang-ja', 'etymology_entries', 'ety-n4-causative-passive', 'create', '{"claim": "させられる is literally the causative with the passive stacked on it, in that order.", "body": "せる／させる makes someone do it; れる／られる then makes them the one it was done to. 食べさせられた parses as \"was made to eat\", each piece doing its own job.\n\nThe unwillingness is not an extra meaning anyone added. It falls out of the passive, which in Japanese carries the sense of something befalling you. Godan verbs also contract it — 行かせられる becomes 行かされる — which is worth recognising, because the short form is what people actually say.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-to-conditional', 'lang-ja', 'etymology_entries', 'ety-n4-to-conditional', 'create', '{"claim": "The conditional と is the same particle that quotes speech and joins nouns.", "body": "One と. It links two things and asserts they go together: 本と鉛筆 pairs two nouns, 「はい」と言った pairs an utterance with the saying of it, and 押すと開く pairs pushing with opening.", "confidence": "attested"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-ba-conditional', 'lang-ja', 'etymology_entries', 'ety-n4-ba-conditional', 'create', '{"claim": "The ば conditional is built on what used to be the REALIS stem, not the hypothetical one.", "body": "Old Japanese had both: ば on the 未然形 was hypothetical, ば on the 已然形 meant \"when\" or \"because\" — something taken as actually so. The 未然形 construction died out, and the surviving 已然形 one took over the hypothetical meaning. Modern grammar renames that stem 仮定形, \"hypothetical form\", which quietly records the swap.\n\nThe old realis sense has not entirely gone. It is why ば sits so comfortably in general truths — 春になれば暖かくなる — and why a request or a command after it still reads as slightly stiff.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-tara-conditional', 'lang-ja', 'etymology_entries', 'ety-n4-tara-conditional', 'create', '{"claim": "たら is the only conditional built out of the past auxiliary, and it behaves like it.", "body": "と, ば and なら descend from particles and a copula. たら descends from たり, the same auxiliary that gave the past tense た, and it is たり in its 未然形.\n\nThat completive sense is still inside it, which is why たら means \"once X has happened\" rather than a bare hypothesis, and why it is the one conditional that takes a request, an invitation or a command afterwards without sounding wrong. 駅に着いたら電話して is natural; the same sentence on ば is not.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-nara-conditional', 'lang-ja', 'etymology_entries', 'ety-n4-nara-conditional', 'create', '{"claim": "なら is the 未然形 of the old copula なり, which was に plus あり.", "body": "なり asserted that something was so. Its 未然形 なら supplies the modern conditional, and it inherited that asserting job rather than a hypothesising one.\n\nWhich is why なら picks something up instead of supposing it. 京都なら電車が早い answers a Kyoto that somebody has already put on the table; it does not raise the possibility. That is also why なら, alone among the four, attaches straight to a bare noun.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-tari-tari', 'lang-ja', 'etymology_entries', 'ety-n4-tari-tari', 'create', '{"claim": "The り of 〜たり〜たり is the same たり that became the past tense た.", "body": "たり — itself て plus あり — could be repeated across a series, and that repeating use is what survives here while the single one narrowed into た.\n\nIt explains the one thing learners get wrong about the construction: 〜たり〜たり does not list everything you did. It names two of them as specimens, which is why the list is left open and why a single たり still sounds like there was more.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-koto-ga-dekiru', 'lang-ja', 'etymology_entries', 'ety-n4-koto-ga-dekiru', 'create', '{"claim": "出来る is literally \"to come out\" — to come into being.", "body": "出る plus 来る. Before it meant \"can\", 出来る meant something was produced or came about, a sense still plain in 出来上がる and in 出来事, \"an occurrence\".\n\nSo 話すことができる says the speaking-of-it comes about. That is a whole noun phrase with a verb after it, not an ending on a verb, and it is why the construction is the formal one: it takes the long way round, naming the act before saying it is possible.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-sou-hearsay', 'lang-ja', 'etymology_entries', 'ety-n4-sou-hearsay', 'create', '{"claim": "Hearsay そうだ attaches to a complete sentence because it reports a complete sentence.", "body": "降るそうだ takes the plain form whole — tense, negation and all — because what is being passed on is somebody else''s statement, and a statement needs all of it.\n\nThat single fact separates it from the そうだ of appearance, which takes a bare stem. 降りそうだ and 降るそうだ differ by one syllable and mean entirely different things: one is the sky, the other is the forecast. The attachment point is the whole distinction, and it is more reliable to lean on than the meaning.", "confidence": "attested"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-sou-appearance', 'lang-ja', 'etymology_entries', 'ety-n4-sou-appearance', 'create', '{"claim": "Appearance そうだ attaches to a bare stem because it describes how a thing looks, not what was said.", "body": "美味しそう cuts the い off and leaves the stem, and 降りそう uses the ます stem. There is no room in the form for tense or negation, and there does not need to be: you are reporting a look, and a look has no tense.\n\nHence the two exceptions that are otherwise pure memorisation. いい becomes よさそう and ない becomes なさそう, both taking a さ, because a one-syllable stem is too little to hang the ending on.", "confidence": "attested"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-you-da', 'lang-ja', 'etymology_entries', 'ety-n4-you-da', 'create', '{"claim": "よう is the noun 様, \"appearance, manner, the way a thing is\".", "body": "様 is an ordinary noun — the 様 of 様子 and of 皆様. 雨のようだ is literally \"it has the appearance of rain\".\n\nRecognising it as a noun explains an entire family at once. ように is that noun with に, \"in the manner that\"; ようになる is coming to be that way; ようにする is making it that way; みたい is the casual stand-in for the same thing. Five patterns, one word, and it is why every one of them takes の after a noun — 学生のよう — exactly as any other noun would.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-rashii', 'lang-ja', 'etymology_entries', 'ety-n4-rashii', 'create', '{"claim": "らしい descends from らし, an Old Japanese auxiliary of inference from evidence.", "body": "らし meant a conclusion reached on grounds outside the speaker. That is the whole difference between 雨らしい and 雨のようだ: らしい leans on what was reported or observed, ようだ on what the speaker makes of it.\n\nThe same root gives the suffix in 男らしい and 学生らしい, \"as one would expect of\". Both uses are one idea — judging something by the evidence of what it appears to be.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-mitai', 'lang-ja', 'etymology_entries', 'ety-n4-mitai', 'create', '{"claim": "みたい is worn down from 見た様 — \"the way it looked\".", "body": "見た, the past of 見る, plus the same 様 that gives ようだ. The origin says outright what the grammar books say: it is ようだ for casual speech.\n\nAnd it explains the conjugation, which otherwise looks arbitrary. みたい inflects as a na-adjective — みたいな人, みたいに — because 様 is a noun and always was.", "confidence": "attested"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-hazu', 'lang-ja', 'etymology_entries', 'ety-n4-hazu', 'create', '{"claim": "筈 is the notch at the end of an arrow, cut to fit the bowstring.", "body": "A 筈 is made to fit. Nock the arrow and it seats, because that is what it was shaped for.\n\nSo はず is not a guess. It is the expectation you have when the parts were made to go together — 彼は来るはずだ says the arrangement was made, not that you feel he probably will. That is the whole difference from かもしれない and でしょう, and why はずがない is a flat contradiction rather than a doubt.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-kamoshirenai', 'lang-ja', 'etymology_entries', 'ety-n4-kamoshirenai', 'create', '{"claim": "It parses literally as \"it cannot even be known whether\".", "body": "か is the question particle, も is \"even\", and 知れない is the negative potential of 知れる, \"to become known\". Nothing in it has been idiomatised away.\n\nRead that way the low confidence is not a fact to memorise, it is the sentence. かもしれない claims only that the question is open — which is why it sits below でしょう and far below はず, and why the polite かもしれません keeps the same shape rather than becoming a different word.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-to-iu', 'lang-ja', 'etymology_entries', 'ety-n4-to-iu', 'create', '{"claim": "という is the quotative particle と with the verb 言う, doing exactly what it looks like.", "body": "田中という人 is \"a person one says 田中 of\". The naming use is the plain literal reading, and it is why the thing named goes in front with no particle of its own.\n\nThe abstract use follows the same path. 彼が来るということ is \"the saying that he comes\" — と marks the quoted content, 言う makes it a stated thing, and こと turns that into a noun you can put a particle on.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-ka-dou-ka', 'lang-ja', 'etymology_entries', 'ety-n4-ka-dou-ka', 'create', '{"claim": "かどうか is literally \"whether — how — whether\": a question left standing inside a sentence.", "body": "か is the question particle, どう is \"how\", and the second か closes the alternative. The pattern embeds a real question rather than referring to one.\n\nThat is why the plain form goes in front of it and why です never does: 学生かどうか, never 学生ですかどうか. The politeness belongs to the sentence around the question, not to the question buried in it.", "confidence": "attested"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-te-ageru', 'lang-ja', 'etymology_entries', 'ety-n4-te-ageru', 'create', '{"claim": "あげる is 上げる, \"to raise\" — giving is pictured as handing upward.", "body": "Japanese sorts giving by direction rather than by who owns what. 上げる sends the thing up, away from the speaker toward the recipient.\n\nWhich is why 〜てあげる has to be handled carefully. Announcing that you will raise a favour up to someone puts them below you in the act of helping them, and that is precisely how 手伝ってあげます can land badly on a superior. 〜ましょうか avoids naming the direction at all.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-te-kureru', 'lang-ja', 'etymology_entries', 'ety-n4-te-kureru', 'create', '{"claim": "くれる is 呉れる, the giving that comes DOWN and inward, toward the speaker.", "body": "It is the opposite arrow from 上げる, and it is why くれる cannot be used for a gift between two other people that has nothing to do with you: the verb encodes arrival at your side.\n\nIts honorific is 下さる — literally \"to give downward\" — which is the 下さい you have been saying since the first lesson. 買ってくれた and 買ってくださった are one verb at two heights.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-te-morau', 'lang-ja', 'etymology_entries', 'ety-n4-te-morau', 'create', '{"claim": "もらう is 貰う, \"to receive\" — the same event as くれる, told from the other end.", "body": "友達が手伝ってくれた and 友達に手伝ってもらった describe one afternoon. くれる makes the helper the subject; もらう makes you the subject and demotes the helper to に.\n\nThat particle is the whole grammar of it. に marks the source a thing is received from, exactly as in 友達に本をもらう, so there is no separate rule to learn about who takes which particle in the compound.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-te-oku', 'lang-ja', 'etymology_entries', 'ety-n4-te-oku', 'create', '{"claim": "おく is 置く, \"to put something down and leave it there\".", "body": "置く is a full verb — 机に本を置く. Attached to a te-form it keeps both halves of its meaning: the doing, and the leaving in place afterwards.\n\nSo 〜ておく is never just \"do in advance\". It is doing something and leaving the result standing for later, which is why it fits preparation (予約しておく) and equally fits deliberately not undoing something (そのままにしておく). The contraction 〜とく is the same word said faster.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-te-shimau', 'lang-ja', 'etymology_entries', 'ety-n4-te-shimau', 'create', '{"claim": "しまう is 仕舞う — to put away, to close up a shop for the night.", "body": "The literal verb is still in use: 片付けて仕舞う, to tidy things away. It carries finishing and shutting in one action.\n\nBoth senses of the compound come straight out of that, and they are not two meanings but one. 食べてしまった is finished off completely; 忘れてしまった is regrettable — because a thing that has been put away and the shutters brought down is a thing you cannot get back at. The casual 〜ちゃう is a contraction of 〜てしまう, and 〜じゃう of 〜でしまう.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-te-miru', 'lang-ja', 'etymology_entries', 'ety-n4-te-miru', 'create', '{"claim": "みる is 見る, \"to look\" — do it and see what happens.", "body": "Written in kana rather than as 見る precisely because it has stopped being about the eyes, but the meaning is unchanged: perform the action and then look at the result.\n\nHence the limit that catches people out. 〜てみる needs an action you could choose to take and then inspect, so 食べてみる and 聞いてみる work while 分かってみる does not — there is nothing to look at afterwards that you decided to do.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-te-iku-kuru', 'lang-ja', 'etymology_entries', 'ety-n4-te-iku-kuru', 'create', '{"claim": "いく and くる are 行く and 来る, and they point away from now and toward it.", "body": "The two verbs of motion, doing in time what they do in space. 来る arrives where the speaker is; 行く departs from there.\n\nSet the anchor at the present moment and the whole pattern falls out. 増えてきた is an increase that has travelled up to now, so it looks back; 増えていく carries on past now, so it looks forward. It is also why 〜てくる so often covers a beginning — the movement had to start somewhere behind you to have reached here.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-te-aru', 'lang-ja', 'etymology_entries', 'ety-n4-te-aru', 'create', '{"claim": "ある is the existence verb for things, which is why てある describes a state rather than an act.", "body": "Japanese splits existence in two: いる for what moves of itself, ある for what does not. 〜てある is built on the inanimate one, so what it asserts is that a thing exists in a done condition.\n\nThat explains the particle switch that makes the pattern look irregular. 窓を開けてある becomes 窓が開けてある because the sentence is no longer about anyone opening anything; it is about the window, and what is being said of it is that it stands opened. The person who did it has been left out on purpose, and ている differs exactly there — 開いている says the window is open, with nobody implied at all.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-tame-ni', 'lang-ja', 'etymology_entries', 'ety-n4-tame-ni', 'create', '{"claim": "ため is the noun 為, \"benefit, sake, account\".", "body": "A plain noun, still written 為 in careful prose. 家族のために働く is \"work for the family''s sake\" with no idiom in it anywhere.\n\nOne noun covers both textbook meanings — purpose and benefit — because they were never separate. It also explains the cause reading, 雨のために中止, which is the same noun pointed backwards: on account of.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-you-ni-purpose', 'lang-ja', 'etymology_entries', 'ety-n4-you-ni-purpose', 'create', '{"claim": "ように is the noun 様 with に — \"in such a way that it comes about\".", "body": "ために names a purpose you intend. ように names a manner you hope things fall into, and the difference is doing real work in the grammar.\n\nIt is why ように takes the verbs you cannot simply decide — potentials, negatives, things happening to other people — while ために takes the ones you can. 聞こえるように大きな声で話す, because being audible is not something you do; 勉強するために, because studying is. Same speaker, same intention, two constructions, and the verb decides which.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-you-ni-naru', 'lang-ja', 'etymology_entries', 'ety-n4-you-ni-naru', 'create', '{"claim": "ようになる is 様 plus なる: coming to be the way where something happens.", "body": "なる is change of state, 様 is the way a thing is. Put together they describe arriving at a condition rather than performing an act.\n\nThat is why it pairs so naturally with the potential — 泳げるようになった, \"reached the state of being able to swim\" — and why it needs a plain form in front rather than a stem. What comes to be the case is a whole situation, not a bare verb.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-you-ni-suru', 'lang-ja', 'etymology_entries', 'ety-n4-you-ni-suru', 'create', '{"claim": "ようにする is the same 様 with する: making it the way where something happens.", "body": "なる and する are the standard Japanese pair for a change that happens and a change you bring about, and they sit either side of the identical ように.\n\nSo 早く寝るようにする is not a decision to sleep early; it is arranging matters so that early sleeping is what happens. The habitual, effortful reading that textbooks list separately is simply what \"make it be that way\" means when it is said about your own conduct.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-yasui-nikui', 'lang-ja', 'etymology_entries', 'ety-n4-yasui-nikui', 'create', '{"claim": "易い and 難い are ordinary adjectives meaning easy and difficult.", "body": "Both stand alone in older and formal Japanese, and both keep their own inflection in the compound — 読みやすかった, 読みにくくない — because an adjective is what they still are.\n\n難い is worth following further. It survives in 有り難い, \"difficult to exist\", said of something so rare it is precious; and that word, worn down, is ありがとう. The word for thank you is an adjective meaning hard to come by.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-kata', 'lang-ja', 'etymology_entries', 'ety-n4-kata', 'create', '{"claim": "かた is 方 — the same 方 as in ほうが, meaning a direction or a way.", "body": "書き方 is the way of writing, 行き方 the way of going. The noun is doing its ordinary job.\n\nBecause it is a noun the whole phrase is a noun, which is why 使い方が分からない takes が and why the thing acted on switches to の: 漢字を書く but 漢字の書き方. It is also why the reading voices to がた in 読みがた-type compounds, the ordinary rendaku any noun undergoes in second position.", "confidence": "attested"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-noni-although', 'lang-ja', 'etymology_entries', 'ety-n4-noni-although', 'create', '{"claim": "のに is the nominaliser の with the particle に — \"for the case that\", aimed at an outcome.", "body": "Read literally it points at something as a target: 高いのに買った sets the expensiveness up as the thing the buying was done against.\n\nThat is where the grievance lives. けれど merely joins two clauses, but のに names one as the mark the other failed to respect, so it always carries the speaker being put out. It is also why のに cannot be followed by a request or an intention — you cannot aim at an outcome and then propose one.", "confidence": "attested"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-bakari', 'lang-ja', 'etymology_entries', 'ety-n4-bakari', 'create', '{"claim": "ばかり is 計り, from 計る — \"to measure\".", "body": "A measure, an amount. That is the sense still visible in 三日ばかり, \"about three days\", which textbooks list as a separate meaning and which is really the original one.\n\nNarrow \"an amount of\" to \"that amount and no more\" and the other uses appear. 遊んでばかりいる is nothing but playing; 食べたばかり is only just eaten, a measure of time so small there is none to spare. One noun, measured tightly.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-tokoro', 'lang-ja', 'etymology_entries', 'ety-n4-tokoro', 'create', '{"claim": "ところ is 所, a place — Japanese locating a moment in time as a spot.", "body": "出かけるところ is the place in events where leaving is about to occur. The metaphor is so ordinary in English too — \"at the point of leaving\" — that it usually passes unnoticed.\n\nSeeing it as a place explains why the tense in front does all the work and ところ itself never changes: 出かけるところ is the spot before, 出かけているところ the spot during, 出かけたところ the spot just after. It also explains the particle, since ところ is a noun and takes を, に and で like any other.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-o-ni-naru', 'lang-ja', 'etymology_entries', 'ety-n4-o-ni-naru', 'create', '{"claim": "お〜になる makes someone''s action into a state they arrive at rather than a thing they do.", "body": "なる is the verb of becoming. Respect in Japanese works by not pointing directly at what the honoured person did, and putting their action inside なる is one way of looking away from it.\n\nThe honorific お is the same one on お名前 and お茶. Set beside the humble お〜する, the pair is exactly なる against する — what comes about for them, what is done by you — which is the whole system in two verbs.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-o-suru', 'lang-ja', 'etymology_entries', 'ety-n4-o-suru', 'create', '{"claim": "お〜する puts your own action inside する, the plain verb of doing.", "body": "The mirror of お〜になる. Your act stays an act — nothing is softened about the doing — and the humility comes from the お, which frames the action as offered toward the person it touches.\n\nThat direction is the rule the pattern lives by: it only works for something done to or for somebody else. お待ちします is waiting for you; there is no honest お〜する for eating your own lunch, because there is nobody for the act to be pointed at.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-kinshi-na', 'lang-ja', 'etymology_entries', 'ety-n4-kinshi-na', 'create', '{"claim": "The な that forbids and the な that softens are two different words that collided.", "body": "The prohibitive な is Old Japanese and attaches to the plain present: 行くな, \"do not go\". The gentle な is a contraction of なさい and attaches to the ます stem: 行きな, \"go on then\".\n\nSo 食べるな and 食べな are opposites separated by one syllable, and the syllable is not the な — it is what the な is stuck to. Reading the stem tells you which one you are looking at, and nothing else will.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-garu', 'lang-ja', 'etymology_entries', 'ety-n4-garu', 'create', '{"claim": "がる asserts the outward signs of a feeling, because Japanese will not let you assert the feeling itself.", "body": "彼は寒い is not merely unusual, it is ungrammatical for most speakers. You may report your own inner state flatly and nobody else''s, and がる is the repair: 彼は寒がっている says he is showing every sign of cold.\n\nIt is also why がる produces a verb rather than an adjective. Signs are things somebody does — hence 寒がっている in the progressive, and 欲しがる taking を where 欲しい takes が, because wanting-behaviour has an object in a way that wanting does not.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-nominalise', 'lang-ja', 'etymology_entries', 'ety-n4-nominalise', 'create', '{"claim": "こと is the abstract noun for a matter; の is concrete, and the split runs on perception.", "body": "こと is a real noun meaning a fact or an affair, and it makes a clause into one of those. の is the nominalising particle, and what it makes is nearer to hand.\n\nThe rule everyone eventually learns follows from that difference rather than sitting on top of it. Verbs of perceiving take の — 彼が来るのを見た, because you watched the arriving, not the fact of it — while 約束する, 決める and できる take こと, because what you promise or decide is a matter, never a sight. Where either is possible, the sentence really is saying two slightly different things.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-gimonshi-ka', 'lang-ja', 'etymology_entries', 'ety-n4-gimonshi-ka', 'create', '{"claim": "The か that makes a question is the same か that turns 誰 into \"someone\".", "body": "誰か is literally \"who?\" left standing — the question mark folded into the word, so it names the answer without knowing it.\n\nThat is why the series is so regular once you see it: 何か, どこか, いつか, all one particle on the ordinary interrogatives. And it is why 誰も, with も instead, sweeps the other way into \"anyone at all\" and then, with a negative, \"nobody\".", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-nakucha', 'lang-ja', 'etymology_entries', 'ety-n4-nakucha', 'create', '{"claim": "なくちゃ and なきゃ are worn-down conditionals with the second half of the sentence bitten off.", "body": "なくては becomes なくちゃ; なければ becomes なきゃ. Both are the front half of the double negative taught earlier — なければならない, \"if not, it will not do\" — with ならない simply dropped.\n\nSo the obligation is not in the words at all. It is in the missing ones, which is why these feel casual and why the ending sounds unfinished: it is unfinished. The same shortening gives ちゃ and じゃ from ては and では.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-temo', 'lang-ja', 'etymology_entries', 'ety-n4-temo', 'create', '{"claim": "ても is the te-form with も, and も is \"even\".", "body": "The particle is the same one in 私も and 一度も. It adds the sense of even, and nothing else has been added anywhere.\n\n雨が降っても行く is therefore \"even with it raining, I go\" — the te-form supplies the linking, も supplies the concession. It also explains the question-word pattern 何を食べても, where も keeps its sweeping sense and takes the whole range at once.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending'),
  ('rq-ety-n4-meirei', 'lang-ja', 'etymology_entries', 'ety-n4-meirei', 'create', '{"claim": "The imperative is a stem in its own right, which is why it has no polite version.", "body": "Old Japanese verbs had a 命令形 among their six forms, and modern 行け and 食べろ come straight down from it. It is a conjugation, not something added to a verb.\n\nThere is nowhere in it to put politeness — that is what ください and なさい are for, and both are built from other verbs entirely. It is also why the imperative survives where bluntness is the point: signs, coaching, and 頑張れ.", "confidence": "well-supported"}'::jsonb, 'claude', 10, 'pending')
ON CONFLICT (id) DO NOTHING;
