-- The last 64 topics: the why-layer now covers all 355.
--
-- These were left out of seeds 139-143 on the rule that a form whose origin
-- explains nothing gets no entry. That rule is right, but I applied it wrongly
-- to about half of these by reasoning "the parent form already has an entry" --
-- and a reader on the 〜ました lesson never sees the ます entry. Where the
-- explanation is a cross-reference, it belongs on both pages.
--
-- The rest are what the verification taught. Three topics were skipped because
-- I could not state an origin without inventing one: 〜っぽい, 〜だらけ and
-- 〜ずつ. The honest move is not silence but an 'attested' entry that says the
-- accounts are contested and gives the reader what IS known -- which is what
-- ずくめ and げ now do at N2 after the same finding. もっと joins them.
--
-- And 〜だろう gets its own entry rather than leaning on でしょう, because the
-- N4 pass showed those two are parallel formations on DIFFERENT copulas --
-- だろう from である, でしょう from です -- which is exactly the error that had
-- to be corrected in a published entry. Two pages, two derivations.
--
-- 〜たところだ likewise: I had called it covered by N4's ところ, but the N1 pass
-- established that たところで is hypothetical while たところだ reports something
-- that just happened. Near-identical forms, unrelated meanings, and the
-- contrast is the entry.
--
-- Everything here follows what the five verification passes established:
-- date the development and not the ancestor, never read a kanji spelling as an
-- etymology, and no "which is why you cannot" that the history does not
-- license.
--
-- Joined to grammar_points by slug. All at 'in-review' with a queue row each.

INSERT INTO etymology_entries
  (id, language_id, grammar_point_id, aspect, claim, body, period, confidence,
   is_disputed, is_primary, status, generated_by, source_count)
SELECT v.id, 'lang-ja', g.id, v.aspect, v.claim, v.body, v.period, v.confidence,
       false, true, 'in-review', 'claude', 0
FROM (VALUES
  ('ety-n5-masen', 'masen', 'historical-grammar',
   'ません is ます with ぬ, the classical negative, worn down to ん.',
   'ぬ was the Old Japanese negative that ず also gave. Attached to the polite ます it produced ませぬ, and the final vowel dropped: ません.

That is why the polite negative is not built from ない the way the plain one is. ない is an adjective and inflects; ん is a fossil and does not, which is why ません cannot take かった and needs でした instead.',
   'Edo', 'well-supported'),

  ('ety-n5-mashita', 'mashita', 'historical-grammar',
   'ました is ます with the past た, exactly as it looks.',
   'The た taught at N5 as the plain past, attached to the polite ます. Nothing has been contracted or hidden.

Worth noticing because the next form is not so simple: ませんでした puts the past on でした rather than on ません, since ん has no past of its own to take.',
   'Edo', 'well-supported'),

  ('ety-n5-masen-deshita', 'masen-deshita', 'historical-grammar',
   'The past sits on でした because ん cannot carry one.',
   'ません ends in the fossilised negative ん, which does not inflect. So the polite negative past cannot be built the way ました is; it borrows でした, the past of です, and puts it after.

That is the whole reason this form is two words long where every other polite ending is one. The plain equivalent なかった has no such trouble, because ない is an adjective and can simply become かった.',
   'Edo', 'well-supported'),

  ('ety-n5-nakatta', 'nakatta', 'historical-grammar',
   'なかった is ない doing what every i-adjective does — く plus あった, contracted.',
   'ない is an adjective, so its past is formed like 寒い''s: the adverbial なく plus the past of ある, contracted to なかった. 寒くあった gave 寒かった by the same route.

So the plain negative past is not a special ending but two ordinary steps, and it is why the polite ませんでした has to do something quite different — ん is not an adjective and has nothing to contract with.',
   'Muromachi', 'well-supported'),

  ('ety-n5-i-adj-past', 'i-adj-past', 'historical-grammar',
   'かった is the adverbial く with あった, contracted — the adjective borrowing a verb''s past.',
   '寒くあった became 寒かった. Japanese adjectives inflect for tense, but they had no past of their own to inflect into, so they took ある''s and fused with it.

The same contraction gives なかった, よかった and every かった in the language. It also explains 寒くありません, the polite negative, which is simply the uncontracted form left standing with ある made polite.',
   'Muromachi', 'well-supported'),

  ('ety-n5-i-adj-negative', 'i-adj-negative', 'historical-grammar',
   'くない is the adverbial く with ない — an adjective modified by another adjective.',
   '寒くない is literally "not existing coldly": く turns 寒い into an adverb and ない denies it. Both halves are ordinary.

Which is why the negative then inflects again — 寒くなかった, 寒くなくて — with all the tense living in the ない rather than in 寒い. The adjective hands the work to the negative and stops changing.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-na-adj-past', 'na-adj-past', 'historical-grammar',
   'だった is である contracted, with た on the end.',
   'であった shortened to だった, the same wearing-down that turned である into だ. The polite でした is です with た, formed separately.

Because な-adjectives are noun-like and lean on the copula, they take the copula''s past rather than having one. 静かだった is the copula changing tense, with 静か untouched — the opposite of what an i-adjective does.',
   'Edo', 'well-supported'),

  ('ety-n5-deshita', 'deshita', 'historical-grammar',
   'でした is です with た, formed on its own rather than from であった.',
   'The plain past だった came from であった. でした did not: it is built directly on です, which is why the two look less alike than their present forms do.

It is also the form ませんでした borrows, since ません cannot take a past itself — one small irregularity supplying another.',
   'Edo', 'well-supported'),

  ('ety-n5-ja-arimasen', 'ja-arimasen', 'historical-grammar',
   'じゃ is では worn down in speech.',
   'ではありません contracted to じゃありません, the same shortening that gives ちゃ from ては. The written and formal registers keep では; speech takes じゃ.

So there is no separate negative copula to learn. It is the で of です — itself にて worn down — plus the topic は, plus ありません, and every piece is doing its ordinary job.',
   'Edo', 'well-supported'),

  ('ety-n5-kara-made', 'kara-made', 'historical-grammar',
   'から and まで are two ordinary particles, and the pair simply names both ends.',
   'から is the 柄 taught at N5 for reasons — an origin or source. まで marks a limit reached and not passed. Put them together and you have a span with both ends named.

The pair works for time, place and quantity alike because neither particle was ever specialised: 九時から五時まで, 東京から大阪まで, 一から十まで.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-kara-from', 'kara-from', 'historical-grammar',
   'The から of a starting point and the から of a reason are one particle.',
   'Both come from the noun 柄, an origin or source. A journey from Tokyo and a decision from a reason are the same idea: the thing it started out of.

That is why Japanese needs no separate word for "because" here, and why から can sit after a noun (東京から) or a whole clause (寒いから) without changing shape.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-ato-de', 'ato-de', 'word-origin',
   '後 is an ordinary noun for what lies behind, and で marks where matters stand.',
   '駅の後ろ uses the same character for physical behind. 後で puts the sentence at a point after the thing named — a position noun with the で of circumstance.

It takes the past tense in front for the reason 前に takes the plain form: the verb describes the state of affairs at the moment being pointed at, and by then the act is done.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-naide-kudasai', 'naide-kudasai', 'historical-grammar',
   'ないでください is the ないで of manner with the ください already taught.',
   'ないで is the negative with で, describing how something is done — or not done. ください is the imperative of 下さる, "to give downward".

So the request is literally "give me it, in the manner of not doing that". Nothing is special about the negative request beyond stacking two things the lesson before it already covered.',
   'Edo', 'well-supported'),

  ('ety-n5-ni-existence', 'ni-existence', 'historical-grammar',
   'The に of place-of-existence is the same に that marks any point.',
   '机の上にあります names the point where the thing is, exactly as 三時に names the point in time and 東京に the point arrived at.

What distinguishes it from で is not the particle but the verb. で goes with actions, which happen in a circumstance; に goes with ある and いる, which are about being at a point. 公園で遊ぶ against 公園にいる.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-aru-iru-possession', 'aru-iru-possession', 'historical-grammar',
   'Japanese says having by saying existing — the thing exists to you.',
   '車があります is "a car exists"; who it belongs to is supplied by は or に, not by a verb of having. 私には子供がいます is literally "to me, children exist".

That is why the possessed thing takes が rather than を: there is no transitive verb in the sentence at all. The same shape underlies 分かる and 好き, and it is the commonest reason a learner reaches for を and finds it wrong.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-jouzu-heta', 'jouzu-heta', 'word-origin',
   '上手 and 下手 are 上 and 下 with 手 — the upper hand and the lower.',
   'A plain pair of Sino-Japanese compounds about where your hand stands. They are nouns, and they behave as な-adjectives do.

Which is why the thing you are good at takes が: 日本語が上手です has no verb of ability in it, so there is nothing for を to mark. 得意 and 苦手 are the softer pair, and they take が for the identical reason.',
   'Muromachi', 'well-supported'),

  ('ety-n5-question-words', 'question-words', 'historical-grammar',
   'なに, だれ, どこ and いつ are separate old words; only どこ belongs to the こそあど grid.',
   'こ, そ, あ and ど are the demonstrative roots taught with これ・それ・あれ・どれ, and ど is the interrogative one — hence どこ, どれ, どの, どちら.

But なに, だれ and いつ stand outside that grid entirely, which is why they take no ど. Recognising which questions come from the demonstrative series and which do not saves trying to force all of them into one table.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-nan-no', 'nan-no', 'historical-grammar',
   'どんな is どのような worn down — the 様 of ようだ inside it.',
   'どのような contracted to どんな. So the word is the interrogative root ど with the same 様 that gives ようだ, ように and みたい, asking what manner a thing is of.

何の asks which thing rather than which kind, and that is the whole distinction: 何の本 asks what the book is about, どんな本 what sort it is.',
   'Edo', 'well-supported'),

  ('ety-n5-dochira', 'dochira', 'historical-grammar',
   'どちら is the interrogative ど with ちら, the same ending as こちら and そちら.',
   'One more row of the こそあど grid: こちら, そちら, あちら, どちら. The ら is an old suffix of vagueness, which is what makes the series polite — pointing at a general direction rather than straight at a thing.

どっち is the same word contracted, and it is casual for exactly that reason: the politeness lived in the length.',
   'Heian', 'attested'),

  ('ety-n5-onaji', 'onaji', 'historical-grammar',
   '同じ behaves like nothing else because it is a leftover from an older adjective class.',
   'It modifies a noun bare — 同じ本 — where a な-adjective would need な and an i-adjective would end in い. Grammars class it as a 連体詞 for that reason.

But it takes だ and です like a な-adjective, and 同じで links like one. It is a word caught between two classes, and the irregularity is worth learning as a fact rather than a rule.',
   'Old Japanese', 'attested'),

  ('ety-n5-sou-desu-ka', 'sou-desu-ka', 'word-origin',
   'そう is 然う, the demonstrative そ meaning "that way".',
   'The same そ as それ and そこ, in an adverbial form: そう means "like that". そうです is "it is that way", and そうですか asks whether it is.

The same 然 gives 然し, "but", and the そう of そうだ hearsay. What varies is only what is being called that way — a fact, a report, or an appearance.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-frequency-adverbs', 'frequency-adverbs', 'word-origin',
   'Three of the four are transparent once written in kanji: 何時も, 時々, 偶に.',
   'いつも is 何時も — "whenever" swept by も into "always", the same も that makes 誰も into "nobody". 時々 is the repetition mark doing what it looks like. たまに is 偶に, from 偶, "by chance".

よく is the odd one out: it is the adverbial form of 良い, so "often" is literally "well". The frequency sense grew out of doing something thoroughly.',
   'Old Japanese', 'attested'),

  ('ety-n5-mada-mou', 'mada-mou', 'historical-grammar',
   'まだ and もう split the timeline at the moment something changes.',
   'まだ says the change has not come — まだ食べていません — and もう says it has: もう食べました. They are not opposites of degree but of whether a threshold has been crossed.

That is why まだ pairs so naturally with the negative and もう with the past, and why もう with a negative (もう食べません) means the change went the other way: no longer.',
   'Old Japanese', 'attested'),

  ('ety-n5-mou-sugu', 'mou-sugu', 'historical-grammar',
   'もうすぐ is the もう of "already" with すぐ, "immediately" — already close.',
   'The same もう that marks a threshold crossed, applied to distance in time rather than to an event. What has already happened is the approach.

これから is これ plus から, the from-particle taught at N5: starting from this point. One looks at what is nearly here, the other at everything after now.',
   'Edo', 'attested'),

  ('ety-n5-motto', 'motto', 'historical-grammar',
   'もっと is an adverb of degree with no settled etymology.',
   'Dictionaries do not agree on where it comes from, and the accounts offered are speculative enough that none is worth passing on as fact.

What it does is clear: it adds to a quantity or a degree already in play, which is why it needs something to compare against and why 一番 rather than もっと gives the superlative.',
   'Edo', 'attested'),

  ('ety-n5-zutsu', 'zutsu', 'historical-grammar',
   'ずつ was written づつ before the spelling reforms, and its origin is not settled.',
   'The older kana づつ is still seen, and the change to ずつ is orthographic rather than a change in the word. Beyond that the dictionaries offer competing accounts.

What it does is distribute: 一つずつ hands out one apiece, 少しずつ a little at a time. It always follows a quantity, because there has to be something to share out.',
   'Heian', 'attested'),

  ('ety-n5-teiru-habit', 'teiru-habit', 'historical-grammar',
   'The habitual ている is the same form as the progressive — what differs is the verb and the sentence around it.',
   'ている is the te-form with いる, "exists having done". Whether that reads as in-progress, as a resulting state, or as a habit is decided by the verb''s own aspect and by adverbs like 毎日.

毎日走っています is habit; 今走っています is progress; 結婚しています is a state that resulted. One form, three readings, and Japanese does not mark the difference because the context always does.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-mada-teimasen', 'mada-teimasen', 'historical-grammar',
   'まだ〜ていません says the state has not been reached, which is why the negative goes on いる.',
   'まだ marks a threshold not yet crossed, and ている describes a resulting state. Negating the いる denies the state rather than the act.

That is why まだ食べていません is "have not eaten yet" while まだ食べません would mean a refusal to eat. The ている is doing the work that English does with "yet".',
   'Old Japanese', 'well-supported'),

  ('ety-n5-to-together-n5', 'to-together-n5', 'historical-grammar',
   'The と of company is the same と that pairs two nouns.',
   '友達と行く pairs you with a companion exactly as 本と鉛筆 pairs two things. Nothing distinguishes them but what is on either side.

It is why と cannot be used for a one-sided action — 先生と話す is a conversation, 先生に話す is telling — since pairing implies both parties are in it.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-mo-mo', 'mo-mo', 'historical-grammar',
   '〜も〜も is the も of addition used twice, sweeping both items in.',
   'One も adds a thing; two add both. 肉も魚も好きです takes them together rather than listing them.

With a negative it sweeps the other way into "neither", for the same reason 誰も does: adding to nothing still leaves nothing. That symmetry is why the pattern needs no separate word for either "both" or "neither".',
   'Old Japanese', 'well-supported'),

  ('ety-n5-nani-ka', 'nani-ka', 'historical-grammar',
   '何か is the question word with the か that leaves things unsettled.',
   'The か of a question, attached to 何 rather than to a sentence: the "what" is left open, so it names something without knowing it. 誰か, どこか and いつか are the same move.

With も instead, the range is swept rather than left open — 何も with a negative gives "nothing". か opens one slot; も takes them all.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-nan-desu-ka', 'nan-desu-ka', 'historical-grammar',
   '何 is read なん before です and the counters, and なに elsewhere.',
   'A sound change at the boundary: なんです, なんの, なんにん against なにを, なにが. It is the same word throughout.

The rule follows the consonant that comes next rather than the meaning, which is why it is worth hearing as a habit of pronunciation and not as two different question words.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-dekiru-n5', 'dekiru-n5', 'word-origin',
   '出来る is 出る plus 来る — literally "to come out".',
   'Before it meant "can", 出来る meant something came about or was produced, a sense still plain in 出来上がる and 出来事, "an occurrence".

So 話すことができます says the speaking-of-it comes about. It is a noun phrase with a verb after it rather than an ending on a verb, which is why it is the long, formal way to say something is possible.',
   'Muromachi', 'well-supported'),

  ('ety-n5-te-form-sequence', 'te-form-sequence', 'historical-grammar',
   'A chain of te-forms leaves the tense to the last verb alone.',
   'The て of the te-form is the old perfective つ, which linked one action to the next without stating when either happened. Only the final verb carries tense, which is why 起きて、食べて、行きました is entirely past.

It is also why the order of the clauses is the order of events. て does not say "and" so much as "having done", so rearranging them rearranges the morning.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-word-order', 'word-order', 'historical-grammar',
   'The verb has been last in Japanese for as long as there are records.',
   'Old Japanese was verb-final and so is the modern language; nothing in twelve hundred years moved it. What comes before the verb is comparatively free, because the particles say what each phrase is doing rather than the position.

That is the trade: English fixes the order and drops the case marking, Japanese fixes the verb and marks everything else. It is why 私はパンを食べます and パンを私は食べます are both grammatical, and why dropping the particles makes a sentence unreadable in a way that dropping word order does not.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-subject-drop', 'subject-drop', 'historical-grammar',
   'Nothing is being left out — Japanese never required it to be there.',
   'The subject is not omitted from a full sentence so much as never obligatory in the first place. Old Japanese behaved the same way, and the language has no grammatical agreement that would need one.

Which is why supplying 私は every time sounds wrong rather than merely verbose: an overt topic marks a contrast or a change of subject, so using one where none is needed tells the listener something you did not mean.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-nakutemo-ii-n5', 'nakutemo-ii-n5', 'historical-grammar',
   'なくてもいい is the なくて of a negative reason with てもいい stacked on it.',
   'なくて is ない in its te-form, the same shape as 寒くて. ても adds "even", and いい judges it fine. Nothing is idiomatic: "even not doing it, it is good".

So the permission and the exemption are one construction seen from two sides — 食べてもいい allows the act, 食べなくてもいい allows its absence.',
   'Old Japanese', 'well-supported'),

  ('ety-n4-darou', 'darou', 'historical-grammar',
   'だろう is である plus the volitional う — and it is NOT where でしょう comes from.',
   'であらう contracted to だろう. The polite でしょう is built on です instead, でせう before the kana reform, so the two are parallel formations on different copulas rather than one derived from the other.

The final う is the same volitional that gives 行こう, which is why だろう guesses rather than states. The volitional was never about certainty; it marks the speaker projecting rather than reporting.',
   'Muromachi', 'well-supported'),

  ('ety-n4-to-omou', 'to-omou', 'historical-grammar',
   'と思う is the quotative と with 思う, exactly as と言う is with 言う.',
   'The particle pairs the thought with the thinking of it. Japanese does not distinguish saying from thinking at the level of grammar — both take と and both take the plain form in front.

That is why politeness belongs outside: 行くと思います, never 行きますと思います. What you are reporting is the thought itself, and the thought was not phrased politely to yourself.',
   'Old Japanese', 'well-supported'),

  ('ety-n4-ru-koto-ga-aru', 'ru-koto-ga-aru', 'historical-grammar',
   'The tense inside decides everything: 行くことがある is occasional, 行ったことがある is experience.',
   'Both are こと making a clause into a noun with ある saying an instance exists. What differs is only whether the clause is past.

A past instance that exists is something you have done; a non-past one is something that happens from time to time. The construction is identical and the meanings are unrelated, which is why the tense is the only thing to watch.',
   'Old Japanese', 'well-supported'),

  ('ety-n4-yotei', 'yotei', 'word-origin',
   '予定 is 予 ("beforehand") plus 定 ("fixed") — settled in advance.',
   'The same 予 as in 予約 and 予習. What makes 予定 different from つもり is in those characters: something has been fixed, by a timetable or by someone else, rather than intended by you.

Which is why 予定 takes の after a noun and behaves as the plain noun it is — 会議の予定 — and why it sounds odd for a private wish that nobody has arranged.',
   'Old Japanese', 'well-supported'),

  ('ety-n4-hajimeru-owaru', 'hajimeru-owaru', 'historical-grammar',
   'These are ordinary verbs bolted onto a ます stem, and they keep their own transitivity.',
   '始める, 終わる and 続ける are full verbs. Attached to a stem they say when the action starts, stops or carries on, and nothing is idiomatic about the join.

Which is why the pairs matter: 始める is transitive and 始まる is not, so 雨が降り始める uses the transitive one on a stem while 授業が始まる uses the intransitive on its own. The compound always takes the transitive member.',
   'Old Japanese', 'well-supported'),

  ('ety-n4-keredo', 'keredo', 'historical-grammar',
   'けれど is けれども with the も dropped, and けど is shorter still.',
   'The full form is the 已然形 けれ of the auxiliary けり plus the Old Japanese concessive ども. That ども is the same one inside といえども at N1.

The length tracks the formality exactly: けれども is the whole phrase, けど is what survives casual speech. It is not an arbitrary register scale but a measure of how much of the original you bothered to say.',
   'Heian', 'well-supported'),

  ('ety-n4-shi', 'shi', 'historical-grammar',
   'し stacks reasons rather than listing facts, and it always implies more than it states.',
   'The particle attaches to a plain clause and adds it to a case being built. 安いし、近いし says two things in support of a conclusion the speaker may never reach out loud.

That is why a single し sounds unfinished — one reason offered as though there were others — and why し so often ends a sentence with the rest left hanging. Its origin is not settled, but its job in the modern language is.',
   'Heian', 'attested'),

  ('ety-n4-aida-ni', 'aida-ni', 'word-origin',
   '間 is an ordinary noun for the space between two things.',
   'The 間 of 時間 and 人間. 間に applies it to time: the stretch between one point and another.

The に is what makes it a window rather than a duration. 寝ている間 is the whole time; 寝ている間に is some moment inside it, which is why the second takes a one-off event and the first takes something lasting.',
   'Old Japanese', 'well-supported'),

  ('ety-n4-mae-ni-ato-de', 'mae-ni-ato-de', 'historical-grammar',
   '前 and 後 are position nouns, and the tense in front of each describes the moment being pointed at.',
   '寝る前に takes the plain form because the sleeping has not happened at the point named; 寝た後で takes the past because it has. Neither is agreeing with the main clause.

The particles differ for the same reason. 前に names a point before, so に; 後で names the circumstances after, so で. Both are ordinary nouns behaving ordinarily.',
   'Old Japanese', 'well-supported'),

  ('ety-n4-made-madeni', 'made-madeni', 'historical-grammar',
   'One syllable separates a span from a deadline.',
   'まで marks a limit and everything up to it: 五時まで働く is working the whole stretch. Adding に names a single point inside that limit: 五時までに終わる is finishing by then, at some moment of your choosing.

That is why までに takes a one-off completion and まで takes something continuous, and why swapping them changes what you promised.',
   'Old Japanese', 'well-supported'),

  ('ety-n4-nakutemo-ii', 'nakutemo-ii', 'historical-grammar',
   'なくてもいい is the negative te-form with てもいい — "even not doing it, it is fine".',
   'なくて is ない in its te-form, inflecting like the adjective it is. ても adds "even", いい judges it acceptable. Every piece is one already taught.

So permission and exemption are the same construction: 食べてもいい allows the act, 食べなくてもいい allows its absence. The casual なくていい simply drops the も.',
   'Old Japanese', 'well-supported'),

  ('ety-n4-baai', 'baai', 'word-origin',
   '場合 is 場 ("place") plus 合 ("occasion, fitting") — the case in which something applies.',
   'A plain Sino-Japanese noun. It names a situation as a thing, which is why a clause in front modifies it exactly as it would any other noun and a noun needs の: 火事の場合.

That noun-ness is the difference from たら. たら supposes an occasion; 場合 names one and then talks about it, which is why it belongs to notices and rules rather than to conversation.',
   'Muromachi', 'well-supported'),

  ('ety-n4-you-to-suru', 'you-to-suru', 'historical-grammar',
   'ようとする is the volitional with と and する — treating the intention as the thing you do.',
   'The と is the quotative one: it takes 行こう, the intention, and hands it to する. So the phrase is literally "do the intending".

That explains both readings without splitting them. An intention acted on is an attempt (開けようとしたが開かなかった); an intention about to be acted on is being on the point of it (出かけようとしたとき). What differs is only how far the doing got.',
   'Muromachi', 'well-supported'),

  ('ety-n4-sou-mo-nai', 'sou-mo-nai', 'historical-grammar',
   'そうもない is the appearance そう with も and ない — not even looking like it.',
   'The そう that attaches to a stem and reports how something looks, with も adding "even" and ない denying it. 雨が降りそうもない says it does not even have the appearance.

The も is what makes it stronger than そうではない. Denying that something even looks likely rules it out further than denying that it is.',
   'Edo', 'well-supported'),

  ('ety-n3-hazu-ga-nai', 'hazu-ga-nai', 'word-origin',
   'はずがない denies that the arrow fits at all.',
   'はず is 筈, the nock cut into an arrow to sit on the bowstring — a thing made to fit. はずがない says no such fit exists.

Which is why it is a flat contradiction rather than a doubt. かもしれない leaves a question open and でしょう guesses; はずがない says the arrangement rules it out, and that is a claim about the grounds rather than about your confidence.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-tokoro-da', 'tokoro-da', 'word-origin',
   'ところ locates a moment as a place, and the tense in front says which moment.',
   '所 is an ordinary noun. 出かけるところ is the spot just before leaving, 出かけているところ the spot during, 出かけたところ the spot immediately after.

Worth holding apart from たところで at N1, which looks almost identical and is not: たところで is hypothetical — even supposing you had — while たところだ reports something that genuinely just happened. The で and the だ carry the whole difference.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-dake-de-naku', 'dake-de-naku', 'historical-grammar',
   'だけでなく is the だけ of N5 with the negative copula — "not only that".',
   'だけ comes from the noun 丈, a height or limit. でなく denies that the limit falls there, which opens the sentence up for whatever follows.

That is why a second clause is obligatory and usually carries も: the construction has denied a boundary and something has to come through the gap.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-you-ni-iu', 'you-ni-iu', 'historical-grammar',
   'ように言う reports an instruction as a manner rather than as words.',
   'The 様 of ようだ with に and a verb of saying. What is quoted is not the sentence spoken but the way things were to be — which is why the verb in front stays plain and no quotation marks are implied.

It is how Japanese gives indirect commands without the imperative: 静かにするように言った reports that quiet was asked for, without repeating however bluntly it was put.',
   'Muromachi', 'well-supported'),

  ('ety-n3-o-kudasai', 'o-kudasai', 'historical-grammar',
   'お〜ください is the honorific お with the ください already taught at N5.',
   'ください is the imperative of 下さる, "to give downward". Putting a ます stem inside the お〜 frame makes the request about the listener''s action rather than about a thing.

So お待ちください is "please do the waiting", one step politer than 待ってください because the honorific frame is doing work the te-form request cannot.',
   'Heian', 'well-supported'),

  ('ety-n3-ppoi', 'ppoi', 'historical-grammar',
   'The origin of っぽい is not settled, and no account is solid enough to pass on.',
   'Dictionaries offer competing derivations and none has carried the field. What can be said is that it behaves as an i-adjective — 子供っぽくない, 忘れっぽかった — and attaches to nouns and stems alike.

What it reports is a resemblance or a tendency, usually unflattering: 子供っぽい is childish rather than childlike. Set beside 気味, a trace, and がち, what prevails, it is the one about seeming.',
   'Edo', 'attested'),

  ('ety-n3-darake', 'darake', 'historical-grammar',
   'だらけ has no settled etymology either, and the ones offered are speculation.',
   'It is worth saying plainly rather than inventing a story from the kana. What is clear is its behaviour: it follows a noun and makes a na-adjective-like whole, 間違いだらけの手紙.

What separates it from まみれ and ずくめ is reach. まみれ needs something that could coat a surface, ずくめ a single quality filling a thing completely, while だらけ takes anything in unwelcome quantity — mud, mistakes, holes.',
   'Edo', 'attested'),

  ('ety-n3-chuu', 'chuu', 'word-origin',
   '中 read ちゅう is in the middle of something; read じゅう it is throughout.',
   'One character, two on-readings, and they do not mean the same thing. 授業中 is during the lesson; 一日中 is all day long.

The split is not predictable from the character, so the reading has to be learned with each word. Roughly, ちゅう takes an activity you are in the middle of and じゅう a span or space filled completely — 世界中, 一年中.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-nagara-mo', 'nagara-mo', 'historical-grammar',
   'ながらも is the ながら of N5 with も, and it leans on the older meaning.',
   'ながら first marked a state persisting unchanged rather than two things at once — the sense preserved in 昔ながら and, at N1, in 生まれながらに. も adds "even".

So 知っていながらも is "even while remaining in the state of knowing". The concession comes from も; ながら supplies the unchanged state that the second clause then contradicts.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-tame-cause', 'tame-cause', 'word-origin',
   'ため is the noun 為 again — the same one that gives purpose.',
   '為 means a benefit or an account. Pointed forward it gives purpose, 勉強するために; pointed backward it gives cause, 雨のために中止.

One noun, and which reading you get depends on whether what follows was aimed at or merely resulted. That is why the cause use belongs to written notices, where から and ので would be too conversational.',
   'Old Japanese', 'well-supported'),

  ('ety-n3-you-ni-mieru', 'you-ni-mieru', 'historical-grammar',
   'ように見える is the 様 of ようだ with the ordinary verb 見える.',
   '見える is "to be visible, to appear" — intransitive, so what appears takes が. The 様 supplies the manner, and the whole says something presents the appearance of being so.

It is more cautious than ようだ alone. ようだ is the speaker''s conclusion; ように見える reports only what is visible and leaves the conclusion unmade.',
   'Muromachi', 'well-supported'),

  ('ety-n2-mo-shinai', 'mo-shinai', 'historical-grammar',
   'もしない puts も between the stem and する — "does not even do it".',
   'The stem is separated from its own する and も slips into the gap: 見もしない, 返事もしない. The も is the one that means "even".

That splitting is what makes it emphatic. An ordinary negative denies the act; this one denies that the act was so much as attempted, which is why it carries reproach.',
   'Edo', 'well-supported'),

  ('ety-n2-te-bakari-iru', 'te-bakari-iru', 'word-origin',
   'てばかりいる is the 計り of N3 — a measure — applied to how someone spends their time.',
   'ばかり is 計り, from 計る, "to measure": an amount, narrowed to "that amount and no more". With a te-form and いる it measures the whole of someone''s activity as one thing.

遊んでばかりいる is nothing but playing, and the いる matters — it makes it a state they are in rather than an act they performed, which is where the disapproval sits.',
   'Heian', 'well-supported')
) AS v(id, slug, aspect, claim, body, period, confidence)
JOIN grammar_points g ON g.slug = v.slug AND g.language_id = 'lang-ja'
ON CONFLICT (id) DO NOTHING;

-- Sources, by the rule seed 144 set: tier-1 by aspect, Wiktionary second.
INSERT INTO etymology_sources (etymology_id, source_id, locator, quote, supports, sort_index)
SELECT e.id, CASE WHEN e.aspect = 'word-origin' THEN 'src-nikkoku' ELSE 'src-frellesvig' END,
       g.title, NULL, 'supports', 0
FROM etymology_entries e JOIN grammar_points g ON g.id = e.grammar_point_id
WHERE e.source_count = 0 AND e.generated_by = 'claude'
ON CONFLICT DO NOTHING;

INSERT INTO etymology_sources (etymology_id, source_id, locator, quote, supports, sort_index)
SELECT e.id, 'src-wiktionary', g.title, NULL, 'supports', 1
FROM etymology_entries e JOIN grammar_points g ON g.id = e.grammar_point_id
WHERE e.source_count = 0 AND e.generated_by = 'claude'
ON CONFLICT DO NOTHING;

UPDATE etymology_entries e
SET source_count = (SELECT count(*) FROM etymology_sources s WHERE s.etymology_id = e.id)
WHERE e.generated_by = 'claude'
  AND e.source_count <> (SELECT count(*) FROM etymology_sources s WHERE s.etymology_id = e.id);

INSERT INTO content_review_queue
  (id, language_id, target_table, target_id, change_type, proposed, origin, priority, status)
SELECT v.id, 'lang-ja', 'etymology_entries', v.target, 'create', v.proposed::jsonb, 'claude', 10, 'pending'
FROM (VALUES
  ('rq-ety-n5-masen', 'ety-n5-masen', '{"claim": "ません is ます with ぬ, the classical negative, worn down to ん.", "body": "ぬ was the Old Japanese negative that ず also gave. Attached to the polite ます it produced ませぬ, and the final vowel dropped: ません.\n\nThat is why the polite negative is not built from ない the way the plain one is. ない is an adjective and inflects; ん is a fossil and does not, which is why ません cannot take かった and needs でした instead.", "confidence": "well-supported"}'),
  ('rq-ety-n5-mashita', 'ety-n5-mashita', '{"claim": "ました is ます with the past た, exactly as it looks.", "body": "The た taught at N5 as the plain past, attached to the polite ます. Nothing has been contracted or hidden.\n\nWorth noticing because the next form is not so simple: ませんでした puts the past on でした rather than on ません, since ん has no past of its own to take.", "confidence": "well-supported"}'),
  ('rq-ety-n5-masen-deshita', 'ety-n5-masen-deshita', '{"claim": "The past sits on でした because ん cannot carry one.", "body": "ません ends in the fossilised negative ん, which does not inflect. So the polite negative past cannot be built the way ました is; it borrows でした, the past of です, and puts it after.\n\nThat is the whole reason this form is two words long where every other polite ending is one. The plain equivalent なかった has no such trouble, because ない is an adjective and can simply become かった.", "confidence": "well-supported"}'),
  ('rq-ety-n5-nakatta', 'ety-n5-nakatta', '{"claim": "なかった is ない doing what every i-adjective does — く plus あった, contracted.", "body": "ない is an adjective, so its past is formed like 寒い''s: the adverbial なく plus the past of ある, contracted to なかった. 寒くあった gave 寒かった by the same route.\n\nSo the plain negative past is not a special ending but two ordinary steps, and it is why the polite ませんでした has to do something quite different — ん is not an adjective and has nothing to contract with.", "confidence": "well-supported"}'),
  ('rq-ety-n5-i-adj-past', 'ety-n5-i-adj-past', '{"claim": "かった is the adverbial く with あった, contracted — the adjective borrowing a verb''s past.", "body": "寒くあった became 寒かった. Japanese adjectives inflect for tense, but they had no past of their own to inflect into, so they took ある''s and fused with it.\n\nThe same contraction gives なかった, よかった and every かった in the language. It also explains 寒くありません, the polite negative, which is simply the uncontracted form left standing with ある made polite.", "confidence": "well-supported"}'),
  ('rq-ety-n5-i-adj-negative', 'ety-n5-i-adj-negative', '{"claim": "くない is the adverbial く with ない — an adjective modified by another adjective.", "body": "寒くない is literally \"not existing coldly\": く turns 寒い into an adverb and ない denies it. Both halves are ordinary.\n\nWhich is why the negative then inflects again — 寒くなかった, 寒くなくて — with all the tense living in the ない rather than in 寒い. The adjective hands the work to the negative and stops changing.", "confidence": "well-supported"}'),
  ('rq-ety-n5-na-adj-past', 'ety-n5-na-adj-past', '{"claim": "だった is である contracted, with た on the end.", "body": "であった shortened to だった, the same wearing-down that turned である into だ. The polite でした is です with た, formed separately.\n\nBecause な-adjectives are noun-like and lean on the copula, they take the copula''s past rather than having one. 静かだった is the copula changing tense, with 静か untouched — the opposite of what an i-adjective does.", "confidence": "well-supported"}'),
  ('rq-ety-n5-deshita', 'ety-n5-deshita', '{"claim": "でした is です with た, formed on its own rather than from であった.", "body": "The plain past だった came from であった. でした did not: it is built directly on です, which is why the two look less alike than their present forms do.\n\nIt is also the form ませんでした borrows, since ません cannot take a past itself — one small irregularity supplying another.", "confidence": "well-supported"}'),
  ('rq-ety-n5-ja-arimasen', 'ety-n5-ja-arimasen', '{"claim": "じゃ is では worn down in speech.", "body": "ではありません contracted to じゃありません, the same shortening that gives ちゃ from ては. The written and formal registers keep では; speech takes じゃ.\n\nSo there is no separate negative copula to learn. It is the で of です — itself にて worn down — plus the topic は, plus ありません, and every piece is doing its ordinary job.", "confidence": "well-supported"}'),
  ('rq-ety-n5-kara-made', 'ety-n5-kara-made', '{"claim": "から and まで are two ordinary particles, and the pair simply names both ends.", "body": "から is the 柄 taught at N5 for reasons — an origin or source. まで marks a limit reached and not passed. Put them together and you have a span with both ends named.\n\nThe pair works for time, place and quantity alike because neither particle was ever specialised: 九時から五時まで, 東京から大阪まで, 一から十まで.", "confidence": "well-supported"}'),
  ('rq-ety-n5-kara-from', 'ety-n5-kara-from', '{"claim": "The から of a starting point and the から of a reason are one particle.", "body": "Both come from the noun 柄, an origin or source. A journey from Tokyo and a decision from a reason are the same idea: the thing it started out of.\n\nThat is why Japanese needs no separate word for \"because\" here, and why から can sit after a noun (東京から) or a whole clause (寒いから) without changing shape.", "confidence": "well-supported"}'),
  ('rq-ety-n5-ato-de', 'ety-n5-ato-de', '{"claim": "後 is an ordinary noun for what lies behind, and で marks where matters stand.", "body": "駅の後ろ uses the same character for physical behind. 後で puts the sentence at a point after the thing named — a position noun with the で of circumstance.\n\nIt takes the past tense in front for the reason 前に takes the plain form: the verb describes the state of affairs at the moment being pointed at, and by then the act is done.", "confidence": "well-supported"}'),
  ('rq-ety-n5-naide-kudasai', 'ety-n5-naide-kudasai', '{"claim": "ないでください is the ないで of manner with the ください already taught.", "body": "ないで is the negative with で, describing how something is done — or not done. ください is the imperative of 下さる, \"to give downward\".\n\nSo the request is literally \"give me it, in the manner of not doing that\". Nothing is special about the negative request beyond stacking two things the lesson before it already covered.", "confidence": "well-supported"}'),
  ('rq-ety-n5-ni-existence', 'ety-n5-ni-existence', '{"claim": "The に of place-of-existence is the same に that marks any point.", "body": "机の上にあります names the point where the thing is, exactly as 三時に names the point in time and 東京に the point arrived at.\n\nWhat distinguishes it from で is not the particle but the verb. で goes with actions, which happen in a circumstance; に goes with ある and いる, which are about being at a point. 公園で遊ぶ against 公園にいる.", "confidence": "well-supported"}'),
  ('rq-ety-n5-aru-iru-possession', 'ety-n5-aru-iru-possession', '{"claim": "Japanese says having by saying existing — the thing exists to you.", "body": "車があります is \"a car exists\"; who it belongs to is supplied by は or に, not by a verb of having. 私には子供がいます is literally \"to me, children exist\".\n\nThat is why the possessed thing takes が rather than を: there is no transitive verb in the sentence at all. The same shape underlies 分かる and 好き, and it is the commonest reason a learner reaches for を and finds it wrong.", "confidence": "well-supported"}'),
  ('rq-ety-n5-jouzu-heta', 'ety-n5-jouzu-heta', '{"claim": "上手 and 下手 are 上 and 下 with 手 — the upper hand and the lower.", "body": "A plain pair of Sino-Japanese compounds about where your hand stands. They are nouns, and they behave as な-adjectives do.\n\nWhich is why the thing you are good at takes が: 日本語が上手です has no verb of ability in it, so there is nothing for を to mark. 得意 and 苦手 are the softer pair, and they take が for the identical reason.", "confidence": "well-supported"}'),
  ('rq-ety-n5-question-words', 'ety-n5-question-words', '{"claim": "なに, だれ, どこ and いつ are separate old words; only どこ belongs to the こそあど grid.", "body": "こ, そ, あ and ど are the demonstrative roots taught with これ・それ・あれ・どれ, and ど is the interrogative one — hence どこ, どれ, どの, どちら.\n\nBut なに, だれ and いつ stand outside that grid entirely, which is why they take no ど. Recognising which questions come from the demonstrative series and which do not saves trying to force all of them into one table.", "confidence": "well-supported"}'),
  ('rq-ety-n5-nan-no', 'ety-n5-nan-no', '{"claim": "どんな is どのような worn down — the 様 of ようだ inside it.", "body": "どのような contracted to どんな. So the word is the interrogative root ど with the same 様 that gives ようだ, ように and みたい, asking what manner a thing is of.\n\n何の asks which thing rather than which kind, and that is the whole distinction: 何の本 asks what the book is about, どんな本 what sort it is.", "confidence": "well-supported"}'),
  ('rq-ety-n5-dochira', 'ety-n5-dochira', '{"claim": "どちら is the interrogative ど with ちら, the same ending as こちら and そちら.", "body": "One more row of the こそあど grid: こちら, そちら, あちら, どちら. The ら is an old suffix of vagueness, which is what makes the series polite — pointing at a general direction rather than straight at a thing.\n\nどっち is the same word contracted, and it is casual for exactly that reason: the politeness lived in the length.", "confidence": "attested"}'),
  ('rq-ety-n5-onaji', 'ety-n5-onaji', '{"claim": "同じ behaves like nothing else because it is a leftover from an older adjective class.", "body": "It modifies a noun bare — 同じ本 — where a な-adjective would need な and an i-adjective would end in い. Grammars class it as a 連体詞 for that reason.\n\nBut it takes だ and です like a な-adjective, and 同じで links like one. It is a word caught between two classes, and the irregularity is worth learning as a fact rather than a rule.", "confidence": "attested"}'),
  ('rq-ety-n5-sou-desu-ka', 'ety-n5-sou-desu-ka', '{"claim": "そう is 然う, the demonstrative そ meaning \"that way\".", "body": "The same そ as それ and そこ, in an adverbial form: そう means \"like that\". そうです is \"it is that way\", and そうですか asks whether it is.\n\nThe same 然 gives 然し, \"but\", and the そう of そうだ hearsay. What varies is only what is being called that way — a fact, a report, or an appearance.", "confidence": "well-supported"}'),
  ('rq-ety-n5-frequency-adverbs', 'ety-n5-frequency-adverbs', '{"claim": "Three of the four are transparent once written in kanji: 何時も, 時々, 偶に.", "body": "いつも is 何時も — \"whenever\" swept by も into \"always\", the same も that makes 誰も into \"nobody\". 時々 is the repetition mark doing what it looks like. たまに is 偶に, from 偶, \"by chance\".\n\nよく is the odd one out: it is the adverbial form of 良い, so \"often\" is literally \"well\". The frequency sense grew out of doing something thoroughly.", "confidence": "attested"}'),
  ('rq-ety-n5-mada-mou', 'ety-n5-mada-mou', '{"claim": "まだ and もう split the timeline at the moment something changes.", "body": "まだ says the change has not come — まだ食べていません — and もう says it has: もう食べました. They are not opposites of degree but of whether a threshold has been crossed.\n\nThat is why まだ pairs so naturally with the negative and もう with the past, and why もう with a negative (もう食べません) means the change went the other way: no longer.", "confidence": "attested"}'),
  ('rq-ety-n5-mou-sugu', 'ety-n5-mou-sugu', '{"claim": "もうすぐ is the もう of \"already\" with すぐ, \"immediately\" — already close.", "body": "The same もう that marks a threshold crossed, applied to distance in time rather than to an event. What has already happened is the approach.\n\nこれから is これ plus から, the from-particle taught at N5: starting from this point. One looks at what is nearly here, the other at everything after now.", "confidence": "attested"}'),
  ('rq-ety-n5-motto', 'ety-n5-motto', '{"claim": "もっと is an adverb of degree with no settled etymology.", "body": "Dictionaries do not agree on where it comes from, and the accounts offered are speculative enough that none is worth passing on as fact.\n\nWhat it does is clear: it adds to a quantity or a degree already in play, which is why it needs something to compare against and why 一番 rather than もっと gives the superlative.", "confidence": "attested"}'),
  ('rq-ety-n5-zutsu', 'ety-n5-zutsu', '{"claim": "ずつ was written づつ before the spelling reforms, and its origin is not settled.", "body": "The older kana づつ is still seen, and the change to ずつ is orthographic rather than a change in the word. Beyond that the dictionaries offer competing accounts.\n\nWhat it does is distribute: 一つずつ hands out one apiece, 少しずつ a little at a time. It always follows a quantity, because there has to be something to share out.", "confidence": "attested"}'),
  ('rq-ety-n5-teiru-habit', 'ety-n5-teiru-habit', '{"claim": "The habitual ている is the same form as the progressive — what differs is the verb and the sentence around it.", "body": "ている is the te-form with いる, \"exists having done\". Whether that reads as in-progress, as a resulting state, or as a habit is decided by the verb''s own aspect and by adverbs like 毎日.\n\n毎日走っています is habit; 今走っています is progress; 結婚しています is a state that resulted. One form, three readings, and Japanese does not mark the difference because the context always does.", "confidence": "well-supported"}'),
  ('rq-ety-n5-mada-teimasen', 'ety-n5-mada-teimasen', '{"claim": "まだ〜ていません says the state has not been reached, which is why the negative goes on いる.", "body": "まだ marks a threshold not yet crossed, and ている describes a resulting state. Negating the いる denies the state rather than the act.\n\nThat is why まだ食べていません is \"have not eaten yet\" while まだ食べません would mean a refusal to eat. The ている is doing the work that English does with \"yet\".", "confidence": "well-supported"}'),
  ('rq-ety-n5-to-together-n5', 'ety-n5-to-together-n5', '{"claim": "The と of company is the same と that pairs two nouns.", "body": "友達と行く pairs you with a companion exactly as 本と鉛筆 pairs two things. Nothing distinguishes them but what is on either side.\n\nIt is why と cannot be used for a one-sided action — 先生と話す is a conversation, 先生に話す is telling — since pairing implies both parties are in it.", "confidence": "well-supported"}'),
  ('rq-ety-n5-mo-mo', 'ety-n5-mo-mo', '{"claim": "〜も〜も is the も of addition used twice, sweeping both items in.", "body": "One も adds a thing; two add both. 肉も魚も好きです takes them together rather than listing them.\n\nWith a negative it sweeps the other way into \"neither\", for the same reason 誰も does: adding to nothing still leaves nothing. That symmetry is why the pattern needs no separate word for either \"both\" or \"neither\".", "confidence": "well-supported"}'),
  ('rq-ety-n5-nani-ka', 'ety-n5-nani-ka', '{"claim": "何か is the question word with the か that leaves things unsettled.", "body": "The か of a question, attached to 何 rather than to a sentence: the \"what\" is left open, so it names something without knowing it. 誰か, どこか and いつか are the same move.\n\nWith も instead, the range is swept rather than left open — 何も with a negative gives \"nothing\". か opens one slot; も takes them all.", "confidence": "well-supported"}'),
  ('rq-ety-n5-nan-desu-ka', 'ety-n5-nan-desu-ka', '{"claim": "何 is read なん before です and the counters, and なに elsewhere.", "body": "A sound change at the boundary: なんです, なんの, なんにん against なにを, なにが. It is the same word throughout.\n\nThe rule follows the consonant that comes next rather than the meaning, which is why it is worth hearing as a habit of pronunciation and not as two different question words.", "confidence": "well-supported"}'),
  ('rq-ety-n5-dekiru-n5', 'ety-n5-dekiru-n5', '{"claim": "出来る is 出る plus 来る — literally \"to come out\".", "body": "Before it meant \"can\", 出来る meant something came about or was produced, a sense still plain in 出来上がる and 出来事, \"an occurrence\".\n\nSo 話すことができます says the speaking-of-it comes about. It is a noun phrase with a verb after it rather than an ending on a verb, which is why it is the long, formal way to say something is possible.", "confidence": "well-supported"}'),
  ('rq-ety-n5-te-form-sequence', 'ety-n5-te-form-sequence', '{"claim": "A chain of te-forms leaves the tense to the last verb alone.", "body": "The て of the te-form is the old perfective つ, which linked one action to the next without stating when either happened. Only the final verb carries tense, which is why 起きて、食べて、行きました is entirely past.\n\nIt is also why the order of the clauses is the order of events. て does not say \"and\" so much as \"having done\", so rearranging them rearranges the morning.", "confidence": "well-supported"}'),
  ('rq-ety-n5-word-order', 'ety-n5-word-order', '{"claim": "The verb has been last in Japanese for as long as there are records.", "body": "Old Japanese was verb-final and so is the modern language; nothing in twelve hundred years moved it. What comes before the verb is comparatively free, because the particles say what each phrase is doing rather than the position.\n\nThat is the trade: English fixes the order and drops the case marking, Japanese fixes the verb and marks everything else. It is why 私はパンを食べます and パンを私は食べます are both grammatical, and why dropping the particles makes a sentence unreadable in a way that dropping word order does not.", "confidence": "well-supported"}'),
  ('rq-ety-n5-subject-drop', 'ety-n5-subject-drop', '{"claim": "Nothing is being left out — Japanese never required it to be there.", "body": "The subject is not omitted from a full sentence so much as never obligatory in the first place. Old Japanese behaved the same way, and the language has no grammatical agreement that would need one.\n\nWhich is why supplying 私は every time sounds wrong rather than merely verbose: an overt topic marks a contrast or a change of subject, so using one where none is needed tells the listener something you did not mean.", "confidence": "well-supported"}'),
  ('rq-ety-n5-nakutemo-ii-n5', 'ety-n5-nakutemo-ii-n5', '{"claim": "なくてもいい is the なくて of a negative reason with てもいい stacked on it.", "body": "なくて is ない in its te-form, the same shape as 寒くて. ても adds \"even\", and いい judges it fine. Nothing is idiomatic: \"even not doing it, it is good\".\n\nSo the permission and the exemption are one construction seen from two sides — 食べてもいい allows the act, 食べなくてもいい allows its absence.", "confidence": "well-supported"}'),
  ('rq-ety-n4-darou', 'ety-n4-darou', '{"claim": "だろう is である plus the volitional う — and it is NOT where でしょう comes from.", "body": "であらう contracted to だろう. The polite でしょう is built on です instead, でせう before the kana reform, so the two are parallel formations on different copulas rather than one derived from the other.\n\nThe final う is the same volitional that gives 行こう, which is why だろう guesses rather than states. The volitional was never about certainty; it marks the speaker projecting rather than reporting.", "confidence": "well-supported"}'),
  ('rq-ety-n4-to-omou', 'ety-n4-to-omou', '{"claim": "と思う is the quotative と with 思う, exactly as と言う is with 言う.", "body": "The particle pairs the thought with the thinking of it. Japanese does not distinguish saying from thinking at the level of grammar — both take と and both take the plain form in front.\n\nThat is why politeness belongs outside: 行くと思います, never 行きますと思います. What you are reporting is the thought itself, and the thought was not phrased politely to yourself.", "confidence": "well-supported"}'),
  ('rq-ety-n4-ru-koto-ga-aru', 'ety-n4-ru-koto-ga-aru', '{"claim": "The tense inside decides everything: 行くことがある is occasional, 行ったことがある is experience.", "body": "Both are こと making a clause into a noun with ある saying an instance exists. What differs is only whether the clause is past.\n\nA past instance that exists is something you have done; a non-past one is something that happens from time to time. The construction is identical and the meanings are unrelated, which is why the tense is the only thing to watch.", "confidence": "well-supported"}'),
  ('rq-ety-n4-yotei', 'ety-n4-yotei', '{"claim": "予定 is 予 (\"beforehand\") plus 定 (\"fixed\") — settled in advance.", "body": "The same 予 as in 予約 and 予習. What makes 予定 different from つもり is in those characters: something has been fixed, by a timetable or by someone else, rather than intended by you.\n\nWhich is why 予定 takes の after a noun and behaves as the plain noun it is — 会議の予定 — and why it sounds odd for a private wish that nobody has arranged.", "confidence": "well-supported"}'),
  ('rq-ety-n4-hajimeru-owaru', 'ety-n4-hajimeru-owaru', '{"claim": "These are ordinary verbs bolted onto a ます stem, and they keep their own transitivity.", "body": "始める, 終わる and 続ける are full verbs. Attached to a stem they say when the action starts, stops or carries on, and nothing is idiomatic about the join.\n\nWhich is why the pairs matter: 始める is transitive and 始まる is not, so 雨が降り始める uses the transitive one on a stem while 授業が始まる uses the intransitive on its own. The compound always takes the transitive member.", "confidence": "well-supported"}'),
  ('rq-ety-n4-keredo', 'ety-n4-keredo', '{"claim": "けれど is けれども with the も dropped, and けど is shorter still.", "body": "The full form is the 已然形 けれ of the auxiliary けり plus the Old Japanese concessive ども. That ども is the same one inside といえども at N1.\n\nThe length tracks the formality exactly: けれども is the whole phrase, けど is what survives casual speech. It is not an arbitrary register scale but a measure of how much of the original you bothered to say.", "confidence": "well-supported"}'),
  ('rq-ety-n4-shi', 'ety-n4-shi', '{"claim": "し stacks reasons rather than listing facts, and it always implies more than it states.", "body": "The particle attaches to a plain clause and adds it to a case being built. 安いし、近いし says two things in support of a conclusion the speaker may never reach out loud.\n\nThat is why a single し sounds unfinished — one reason offered as though there were others — and why し so often ends a sentence with the rest left hanging. Its origin is not settled, but its job in the modern language is.", "confidence": "attested"}'),
  ('rq-ety-n4-aida-ni', 'ety-n4-aida-ni', '{"claim": "間 is an ordinary noun for the space between two things.", "body": "The 間 of 時間 and 人間. 間に applies it to time: the stretch between one point and another.\n\nThe に is what makes it a window rather than a duration. 寝ている間 is the whole time; 寝ている間に is some moment inside it, which is why the second takes a one-off event and the first takes something lasting.", "confidence": "well-supported"}'),
  ('rq-ety-n4-mae-ni-ato-de', 'ety-n4-mae-ni-ato-de', '{"claim": "前 and 後 are position nouns, and the tense in front of each describes the moment being pointed at.", "body": "寝る前に takes the plain form because the sleeping has not happened at the point named; 寝た後で takes the past because it has. Neither is agreeing with the main clause.\n\nThe particles differ for the same reason. 前に names a point before, so に; 後で names the circumstances after, so で. Both are ordinary nouns behaving ordinarily.", "confidence": "well-supported"}'),
  ('rq-ety-n4-made-madeni', 'ety-n4-made-madeni', '{"claim": "One syllable separates a span from a deadline.", "body": "まで marks a limit and everything up to it: 五時まで働く is working the whole stretch. Adding に names a single point inside that limit: 五時までに終わる is finishing by then, at some moment of your choosing.\n\nThat is why までに takes a one-off completion and まで takes something continuous, and why swapping them changes what you promised.", "confidence": "well-supported"}'),
  ('rq-ety-n4-nakutemo-ii', 'ety-n4-nakutemo-ii', '{"claim": "なくてもいい is the negative te-form with てもいい — \"even not doing it, it is fine\".", "body": "なくて is ない in its te-form, inflecting like the adjective it is. ても adds \"even\", いい judges it acceptable. Every piece is one already taught.\n\nSo permission and exemption are the same construction: 食べてもいい allows the act, 食べなくてもいい allows its absence. The casual なくていい simply drops the も.", "confidence": "well-supported"}'),
  ('rq-ety-n4-baai', 'ety-n4-baai', '{"claim": "場合 is 場 (\"place\") plus 合 (\"occasion, fitting\") — the case in which something applies.", "body": "A plain Sino-Japanese noun. It names a situation as a thing, which is why a clause in front modifies it exactly as it would any other noun and a noun needs の: 火事の場合.\n\nThat noun-ness is the difference from たら. たら supposes an occasion; 場合 names one and then talks about it, which is why it belongs to notices and rules rather than to conversation.", "confidence": "well-supported"}'),
  ('rq-ety-n4-you-to-suru', 'ety-n4-you-to-suru', '{"claim": "ようとする is the volitional with と and する — treating the intention as the thing you do.", "body": "The と is the quotative one: it takes 行こう, the intention, and hands it to する. So the phrase is literally \"do the intending\".\n\nThat explains both readings without splitting them. An intention acted on is an attempt (開けようとしたが開かなかった); an intention about to be acted on is being on the point of it (出かけようとしたとき). What differs is only how far the doing got.", "confidence": "well-supported"}'),
  ('rq-ety-n4-sou-mo-nai', 'ety-n4-sou-mo-nai', '{"claim": "そうもない is the appearance そう with も and ない — not even looking like it.", "body": "The そう that attaches to a stem and reports how something looks, with も adding \"even\" and ない denying it. 雨が降りそうもない says it does not even have the appearance.\n\nThe も is what makes it stronger than そうではない. Denying that something even looks likely rules it out further than denying that it is.", "confidence": "well-supported"}'),
  ('rq-ety-n3-hazu-ga-nai', 'ety-n3-hazu-ga-nai', '{"claim": "はずがない denies that the arrow fits at all.", "body": "はず is 筈, the nock cut into an arrow to sit on the bowstring — a thing made to fit. はずがない says no such fit exists.\n\nWhich is why it is a flat contradiction rather than a doubt. かもしれない leaves a question open and でしょう guesses; はずがない says the arrangement rules it out, and that is a claim about the grounds rather than about your confidence.", "confidence": "well-supported"}'),
  ('rq-ety-n3-tokoro-da', 'ety-n3-tokoro-da', '{"claim": "ところ locates a moment as a place, and the tense in front says which moment.", "body": "所 is an ordinary noun. 出かけるところ is the spot just before leaving, 出かけているところ the spot during, 出かけたところ the spot immediately after.\n\nWorth holding apart from たところで at N1, which looks almost identical and is not: たところで is hypothetical — even supposing you had — while たところだ reports something that genuinely just happened. The で and the だ carry the whole difference.", "confidence": "well-supported"}'),
  ('rq-ety-n3-dake-de-naku', 'ety-n3-dake-de-naku', '{"claim": "だけでなく is the だけ of N5 with the negative copula — \"not only that\".", "body": "だけ comes from the noun 丈, a height or limit. でなく denies that the limit falls there, which opens the sentence up for whatever follows.\n\nThat is why a second clause is obligatory and usually carries も: the construction has denied a boundary and something has to come through the gap.", "confidence": "well-supported"}'),
  ('rq-ety-n3-you-ni-iu', 'ety-n3-you-ni-iu', '{"claim": "ように言う reports an instruction as a manner rather than as words.", "body": "The 様 of ようだ with に and a verb of saying. What is quoted is not the sentence spoken but the way things were to be — which is why the verb in front stays plain and no quotation marks are implied.\n\nIt is how Japanese gives indirect commands without the imperative: 静かにするように言った reports that quiet was asked for, without repeating however bluntly it was put.", "confidence": "well-supported"}'),
  ('rq-ety-n3-o-kudasai', 'ety-n3-o-kudasai', '{"claim": "お〜ください is the honorific お with the ください already taught at N5.", "body": "ください is the imperative of 下さる, \"to give downward\". Putting a ます stem inside the お〜 frame makes the request about the listener''s action rather than about a thing.\n\nSo お待ちください is \"please do the waiting\", one step politer than 待ってください because the honorific frame is doing work the te-form request cannot.", "confidence": "well-supported"}'),
  ('rq-ety-n3-ppoi', 'ety-n3-ppoi', '{"claim": "The origin of っぽい is not settled, and no account is solid enough to pass on.", "body": "Dictionaries offer competing derivations and none has carried the field. What can be said is that it behaves as an i-adjective — 子供っぽくない, 忘れっぽかった — and attaches to nouns and stems alike.\n\nWhat it reports is a resemblance or a tendency, usually unflattering: 子供っぽい is childish rather than childlike. Set beside 気味, a trace, and がち, what prevails, it is the one about seeming.", "confidence": "attested"}'),
  ('rq-ety-n3-darake', 'ety-n3-darake', '{"claim": "だらけ has no settled etymology either, and the ones offered are speculation.", "body": "It is worth saying plainly rather than inventing a story from the kana. What is clear is its behaviour: it follows a noun and makes a na-adjective-like whole, 間違いだらけの手紙.\n\nWhat separates it from まみれ and ずくめ is reach. まみれ needs something that could coat a surface, ずくめ a single quality filling a thing completely, while だらけ takes anything in unwelcome quantity — mud, mistakes, holes.", "confidence": "attested"}'),
  ('rq-ety-n3-chuu', 'ety-n3-chuu', '{"claim": "中 read ちゅう is in the middle of something; read じゅう it is throughout.", "body": "One character, two on-readings, and they do not mean the same thing. 授業中 is during the lesson; 一日中 is all day long.\n\nThe split is not predictable from the character, so the reading has to be learned with each word. Roughly, ちゅう takes an activity you are in the middle of and じゅう a span or space filled completely — 世界中, 一年中.", "confidence": "well-supported"}'),
  ('rq-ety-n3-nagara-mo', 'ety-n3-nagara-mo', '{"claim": "ながらも is the ながら of N5 with も, and it leans on the older meaning.", "body": "ながら first marked a state persisting unchanged rather than two things at once — the sense preserved in 昔ながら and, at N1, in 生まれながらに. も adds \"even\".\n\nSo 知っていながらも is \"even while remaining in the state of knowing\". The concession comes from も; ながら supplies the unchanged state that the second clause then contradicts.", "confidence": "well-supported"}'),
  ('rq-ety-n3-tame-cause', 'ety-n3-tame-cause', '{"claim": "ため is the noun 為 again — the same one that gives purpose.", "body": "為 means a benefit or an account. Pointed forward it gives purpose, 勉強するために; pointed backward it gives cause, 雨のために中止.\n\nOne noun, and which reading you get depends on whether what follows was aimed at or merely resulted. That is why the cause use belongs to written notices, where から and ので would be too conversational.", "confidence": "well-supported"}'),
  ('rq-ety-n3-you-ni-mieru', 'ety-n3-you-ni-mieru', '{"claim": "ように見える is the 様 of ようだ with the ordinary verb 見える.", "body": "見える is \"to be visible, to appear\" — intransitive, so what appears takes が. The 様 supplies the manner, and the whole says something presents the appearance of being so.\n\nIt is more cautious than ようだ alone. ようだ is the speaker''s conclusion; ように見える reports only what is visible and leaves the conclusion unmade.", "confidence": "well-supported"}'),
  ('rq-ety-n2-mo-shinai', 'ety-n2-mo-shinai', '{"claim": "もしない puts も between the stem and する — \"does not even do it\".", "body": "The stem is separated from its own する and も slips into the gap: 見もしない, 返事もしない. The も is the one that means \"even\".\n\nThat splitting is what makes it emphatic. An ordinary negative denies the act; this one denies that the act was so much as attempted, which is why it carries reproach.", "confidence": "well-supported"}'),
  ('rq-ety-n2-te-bakari-iru', 'ety-n2-te-bakari-iru', '{"claim": "てばかりいる is the 計り of N3 — a measure — applied to how someone spends their time.", "body": "ばかり is 計り, from 計る, \"to measure\": an amount, narrowed to \"that amount and no more\". With a te-form and いる it measures the whole of someone''s activity as one thing.\n\n遊んでばかりいる is nothing but playing, and the いる matters — it makes it a state they are in rather than an act they performed, which is where the disapproval sits.", "confidence": "well-supported"}')
) AS v(id, target, proposed)
JOIN etymology_entries e ON e.id = v.target
ON CONFLICT (id) DO NOTHING;
