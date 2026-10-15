-- No em dashes in the content.
--
-- The owner asked for no em dashes anywhere in the app. These are the 1168
-- distinct sentences in learning content that had one: conversation
-- explanations and translations, grammar glosses and notes, etymology, and the
-- quiz answers and options copied from them. Each was rewritten with a comma,
-- colon, full stop or brackets, and checked to differ from the original in
-- punctuation and capitals ONLY: no word, romaji or Japanese changed.
--
-- Matched by the old text, not by id, so it updates every copy of a sentence
-- wherever it appears, including inside JSON (quiz prompts, answers,
-- distractors) and the review queue's proposed/current/diff snapshots, so
-- pending corrections still apply cleanly. Re-running changes nothing: no row
-- holds the old text any more.
--
-- Left alone on purpose: enrichment grounding packets (source material that
-- citations must quote verbatim) and Speak lines (their audio is keyed by the
-- exact English text).

CREATE TEMP TABLE undash (old text PRIMARY KEY, new text NOT NULL) ON COMMIT DROP;
INSERT INTO undash (old, new) VALUES
  ('"Also / too" — and with a negative, "not either".', '"Also / too", and with a negative, "not either".'),
  ('"daitai de ii" fixes the manner — an estimate will do. ga just labels daitai as the subject and drops that meaning.', '"daitai de ii" fixes the manner: an estimate will do. ga just labels daitai as the subject and drops that meaning.'),
  ('(beep) Tap, go ahead. There — receipt?', '(beep) Tap, go ahead. There. Receipt?'),
  ('(beep) There we go — thank you for your purchase. Would you like the receipt?', '(beep) There we go, thank you for your purchase. Would you like the receipt?'),
  ('12:30 at a station convenience store — a long queue, and every question comes clipped to almost nothing.', '12:30 at a station convenience store: a long queue, and every question comes clipped to almost nothing.'),
  ('A bare quantity answering "how many" is stated with de, not left dangling on o with nothing for it to attach to — futatsu de is the clipped answer pattern.', 'A bare quantity answering "how many" is stated with de, not left dangling on o with nothing for it to attach to: futatsu de is the clipped answer pattern.'),
  ('A bento and a salad — two items, right?', 'A bento and a salad: two items, right?'),
  ('A bento to heat, plus ice cream and a salad — the bags need splitting, and the size needs choosing.', 'A bento to heat, plus ice cream and a salad: the bags need splitting, and the size needs choosing.'),
  ('A boundary line. に際して stands the sentence at the edge of an event, just as it begins.

It is the most formal of the occasion patterns for that reason: an edge is a precise place, and 際 belongs to ceremony and documents. The same noun gives この際 — "at this juncture" — and 際どい, right on the line.', 'A boundary line. に際して stands the sentence at the edge of an event, just as it begins.

It is the most formal of the occasion patterns for that reason: an edge is a precise place, and 際 belongs to ceremony and documents. The same noun gives この際, "at this juncture", and 際どい, right on the line.'),
  ('A classical pairing frozen into a handful of idioms. Not productive — the pairs must be learned whole.', 'A classical pairing frozen into a handful of idioms. Not productive: the pairs must be learned whole.'),
  ('A few items, no heating — paying by credit card and confirming a single payment.', 'A few items, no heating: paying by credit card and confirming a single payment.'),
  ('A friend is coming. (来る — irregular)', 'A friend is coming. (来る: irregular)'),
  ('A full trip through a supermarket till — the point card, your own bag, cash, and the bagging counter a konbini never has.', 'A full trip through a supermarket till: the point card, your own bag, cash, and the bagging counter a konbini never has.'),
  ('A noun meaning a time or an instance. 会うたびに is "on each occasion of meeting", with no idiom involved.

Because it is a noun it takes what all nouns take: a plain-form clause in front, 会うたびに, or another noun with の, 旅行のたびに. Being a counter has nothing to do with it — うち, まま and かぎり behave the same way.', 'A noun meaning a time or an instance. 会うたびに is "on each occasion of meeting", with no idiom involved.

Because it is a noun it takes what all nouns take: a plain-form clause in front, 会うたびに, or another noun with の, 旅行のたびに. Being a counter has nothing to do with it; うち, まま and かぎり behave the same way.'),
  ('A plain Sino-Japanese verb meaning to go against. に反して sets the outcome facing the wrong way from what was named.

It wants an expectation, a rule or a prediction to contradict — 予想に反して, 規則に反して — because only those are things a result can run counter to. A mere alternative gives it nothing to oppose.', 'A plain Sino-Japanese verb meaning to go against. に反して sets the outcome facing the wrong way from what was named.

It wants an expectation, a rule or a prediction to contradict (予想に反して, 規則に反して) because only those are things a result can run counter to. A mere alternative gives it nothing to oppose.'),
  ('A plain noun for something feared. 恐れがある is "there exists a fear of it", which is why the pattern only ever attaches to bad outcomes.

It is the stiff, official register — weather warnings, notices, reports — because naming a fear as a thing that exists is how documents talk. 危険性がある is its Sino-Japanese equivalent and behaves the same way.', 'A plain noun for something feared. 恐れがある is "there exists a fear of it", which is why the pattern only ever attaches to bad outcomes.

It is the stiff, official register (weather warnings, notices, reports), because naming a fear as a thing that exists is how documents talk. 危険性がある is its Sino-Japanese equivalent and behaves the same way.'),
  ('A plain noun, still written 為 in careful prose. 家族のために働く is "work for the family''s sake" with no idiom in it anywhere.

One noun covers both textbook meanings — purpose and benefit — because they were never separate. It also explains the cause reading, 雨のために中止, which is the same noun pointed backwards: on account of.', 'A plain noun, still written 為 in careful prose. 家族のために働く is "work for the family''s sake" with no idiom in it anywhere.

One noun covers both textbook meanings, purpose and benefit, because they were never separate. It also explains the cause reading, 雨のために中止, which is the same noun pointed backwards: on account of.'),
  ('A question mark is not required in Japanese — か already does that work — though modern casual writing often adds one anyway.', 'A question mark is not required in Japanese (か already does that work), though modern casual writing often adds one anyway.'),
  ('A question word can never take wa — you cannot make a topic of the thing you are asking about.', 'A question word can never take wa: you cannot make a topic of the thing you are asking about.'),
  ('A rough figure is fine — about how much per month?', 'A rough figure is fine: about how much per month?'),
  ('A self-checkout register — you scan everything alone, one barcode will not read, and you call staff over before paying.', 'A self-checkout register: you scan everything alone, one barcode will not read, and you call staff over before paying.'),
  ('A verb modifying a noun (koto) uses the plain dictionary form, not the polite -masu form — ukagau koto, not ukagaimasu koto.', 'A verb modifying a noun (koto) uses the plain dictionary form, not the polite -masu form: ukagau koto, not ukagaimasu koto.'),
  ('A 筈 is made to fit. Nock the arrow and it seats, because that is what it was shaped for.

So はず is not a guess. It is the expectation you have when the parts were made to go together — 彼は来るはずだ says the arrangement was made, not that you feel he probably will. That is the whole difference from かもしれない and でしょう, and why はずがない is a flat contradiction rather than a doubt.', 'A 筈 is made to fit. Nock the arrow and it seats, because that is what it was shaped for.

So はず is not a guess. It is the expectation you have when the parts were made to go together: 彼は来るはずだ says the arrangement was made, not that you feel he probably will. That is the whole difference from かもしれない and でしょう, and why はずがない is a flat contradiction rather than a doubt.'),
  ('A 通り is a street, a route, a way through. 言ったとおりに is going along the path the words laid down.

Because it is a noun it takes の after another noun — 予定のとおり — and voices to どおり when it is fixed to one: 予定どおり. That rendaku is the ordinary sound change any noun undergoes in second position, not a separate word.', 'A 通り is a street, a route, a way through. 言ったとおりに is going along the path the words laid down.

Because it is a noun it takes の after another noun (予定のとおり) and voices to どおり when it is fixed to one: 予定どおり. That rendaku is the ordinary sound change any noun undergoes in second position, not a separate word.'),
  ('A 通り is a street, a route, a way through. 言ったとおりに is going along the path the words laid down.

Because it is a noun it takes の after another noun — 予定のとおり — and voices to どおり when it is fixed to one: 予定どおり. That voicing is rendaku, the habit many native nouns show in second position — a tendency of compounds rather than a rule, since plenty of nouns resist it.', 'A 通り is a street, a route, a way through. 言ったとおりに is going along the path the words laid down.

Because it is a noun it takes の after another noun (予定のとおり) and voices to どおり when it is fixed to one: 予定どおり. That voicing is rendaku, the habit many native nouns show in second position, a tendency of compounds rather than a rule, since plenty of nouns resist it.'),
  ('A4 is here — put money in here and press the green button.', 'A4 is here: put money in here and press the green button.'),
  ('Adding ka turns this into a question asking whether THEY are fine — dropping ka is what makes it your own decline.', 'Adding ka turns this into a question asking whether THEY are fine; dropping ka is what makes it your own decline.'),
  ('Adding ka turns your own symptom into a question — you are telling them, not asking.', 'Adding ka turns your own symptom into a question; you are telling them, not asking.'),
  ('Admiring, and only about someone else — using it about yourself claims your own bravery. Reserved for genuine adversity.', 'Admiring, and only about someone else. Using it about yourself claims your own bravery. Reserved for genuine adversity.'),
  ('After all that — and it ended badly.', 'After all that, and it ended badly.'),
  ('After doing — and then.', 'After doing, and then.'),
  ('Afternoon is the time slot you are settling on, not a thing being handed over — that takes de, not o.', 'Afternoon is the time slot you are settling on, not a thing being handed over; that takes de, not o.'),
  ('Ah, sorry — can I charge it here?', 'Ah, sorry, can I charge it here?'),
  ('Also ambiguous — it can mean "no need". daijoubu desu with onegai shimasu is unambiguous.', 'Also ambiguous: it can mean "no need". daijoubu desu with onegai shimasu is unambiguous.'),
  ('Although I say — it''s less than it sounds.', 'Although I say, it''s less than it sounds.'),
  ('Although — the expectation went unmet.', 'Although: the expectation went unmet.'),
  ('An apology, not thanks — it suggests you did something wrong by asking.', 'An apology, not thanks; it suggests you did something wrong by asking.'),
  ('An evening konbini run — one bento, one tea, paying in cash.', 'An evening konbini run: one bento, one tea, paying in cash.'),
  ('And then — a sequence of actions.', 'And then: a sequence of actions.'),
  ('And what''s more — stacking reasons.', 'And what''s more: stacking reasons.'),
  ('And — joining adjectives.', 'And: joining adjectives.'),
  ('Announcing that YOU will do the shampooing takes over their job — onegai shimasu hands the action to them.', 'Announcing that YOU will do the shampooing takes over their job; onegai shimasu hands the action to them.'),
  ('Announcing that you personally will wait misses the point — onegai shimasu hands the action back to them.', 'Announcing that you personally will wait misses the point; onegai shimasu hands the action back to them.'),
  ('Announcing you will show it just restates their request back at them — doozo is what actually accompanies handing it over.', 'Announcing you will show it just restates their request back at them; doozo is what actually accompanies handing it over.'),
  ('As soon as — and unexpectedly.', 'As soon as, and unexpectedly.'),
  ('Asking a live question needs ka, and the present ii desu ka — not the past ii deshita with no question marker.', 'Asking a live question needs ka, and the present ii desu ka, not the past ii deshita with no question marker.'),
  ('At a time when — apologetically.', 'At a time when, apologetically.'),
  ('Because of — and it went badly.', 'Because of, and it went badly.'),
  ('Because — in writing.', 'Because, in writing.'),
  ('Because — offered as an excuse.', 'Because: offered as an excuse.'),
  ('Before が marked subjects it marked possession, which is why 我が国 still reads as "my country". がゆえに is "by reason OF", with が doing the joining.

So the difference from plain ゆえに is not emphasis but an older grammar preserved — classical の故に is equally good, and が and の differed by register rather than by force. The whole phrase is a fossil kept for formal writing.', 'Before が marked subjects it marked possession, which is why 我が国 still reads as "my country". がゆえに is "by reason OF", with が doing the joining.

So the difference from plain ゆえに is not emphasis but an older grammar preserved; classical の故に is equally good, and が and の differed by register rather than by force. The whole phrase is a fossil kept for formal writing.'),
  ('Boarding starts at 10. Here is your boarding pass — have a good trip.', 'Boarding starts at 10. Here is your boarding pass. Have a good trip.'),
  ('Both are formations on the old root 分く, and 分かる is the intransitive one. To understand something is to have it separated out from what it is not — the thing does the coming-apart, in your mind.

That is why it takes が rather than を. 日本語が分かる is "Japanese comes apart for me", with no object to mark. を分かる survives only in pleas about feelings — 気持ちを分かってほしい — where what is wanted is the effort, not the state.', 'Both are formations on the old root 分く, and 分かる is the intransitive one. To understand something is to have it separated out from what it is not: the thing does the coming-apart, in your mind.

That is why it takes が rather than を. 日本語が分かる is "Japanese comes apart for me", with no object to mark. を分かる survives only in pleas about feelings (気持ちを分かってほしい), where what is wanted is the effort, not the state.'),
  ('Both are so vague that they carry almost any meaning the situation supplies — どうも alone is a greeting, a thanks and an apology.', 'Both are so vague that they carry almost any meaning the situation supplies; どうも alone is a greeting, a thanks and an apology.'),
  ('Both halves are kun readings: ば is 場 read natively (its on-reading is ジョウ), and あい is from 合う. The situation where things come together, written in kanji but Japanese underneath.

It names a situation as a thing, which is why a clause in front modifies it as it would any noun and a noun needs の: 火事の場合. That noun-ness is the difference from たら — たら supposes an occasion, 場合 names one — and it is why it belongs to notices and rules.', 'Both halves are kun readings: ば is 場 read natively (its on-reading is ジョウ), and あい is from 合う. The situation where things come together, written in kanji but Japanese underneath.

It names a situation as a thing, which is why a clause in front modifies it as it would any noun and a noun needs の: 火事の場合. That noun-ness is the difference from たら (たら supposes an occasion, 場合 names one), and it is why it belongs to notices and rules.'),
  ('Both halves must lean the same way — two good things or two bad. Mixing them is what 反面 is for.', 'Both halves must lean the same way: two good things or two bad. Mixing them is what 反面 is for.'),
  ('Both kanji mean sequence. The noun names how matters are arranged, and every use follows from that.

着き次第 is "in the order following arrival", hence as soon as. 天気次第 is according to how things fall. And ご説明した次第です — the one that baffles people — is simply "such is the sequence of it", a formal way of closing an account.', 'Both kanji mean sequence. The noun names how matters are arranged, and every use follows from that.

着き次第 is "in the order following arrival", hence as soon as. 天気次第 is according to how things fall. And ご説明した次第です, the one that baffles people, is simply "such is the sequence of it", a formal way of closing an account.'),
  ('Both stand alone in older and formal Japanese, and both keep their own inflection in the compound — 読みやすかった, 読みにくくない — because an adjective is what they still are.

難い is worth following further. It survives in 有り難い, "difficult to exist", said of something so rare it is precious; and that word, worn down, is ありがとう. The word for thank you is an adjective meaning hard to come by.', 'Both stand alone in older and formal Japanese, and both keep their own inflection in the compound (読みやすかった, 読みにくくない), because an adjective is what they still are.

難い is worth following further. It survives in 有り難い, "difficult to exist", said of something so rare it is precious; and that word, worn down, is ありがとう. The word for thank you is an adjective meaning hard to come by.'),
  ('Both — or, with a negative, neither.', 'Both (or, with a negative, neither).'),
  ('Bulky trash needs advance booking — please call city hall.', 'Bulky trash needs advance booking: please call city hall.'),
  ('Busy, tired — he is full of excuses.', 'Busy, tired: he is full of excuses.'),
  ('Called, named — or "the fact that".', 'Called, named, or "the fact that".'),
  ('Calling your own gift "big" breaks the humble convention — the set phrase downplays it as small.', 'Calling your own gift "big" breaks the humble convention; the set phrase downplays it as small.'),
  ('Calling your own gift "wonderful" breaks the humble convention — the set phrase downplays it as nothing much.', 'Calling your own gift "wonderful" breaks the humble convention; the set phrase downplays it as nothing much.'),
  ('Can do — the formal way to say it.', 'Can do: the formal way to say it.'),
  ('Certainly. We have blue and black — which would you prefer?', 'Certainly. We have blue and black. Which would you prefer?'),
  ('Certainly. You paid by card, right — we will refund it to the same card.', 'Certainly. You paid by card, right? We will refund it to the same card.'),
  ('Check-in is still going — gozaimashita closes out something that has already finished.', 'Check-in is still going; gozaimashita closes out something that has already finished.'),
  ('Chinese 枚 was a near-general classifier, close in scope to 个. Japanese narrowed it to thin flat things, and the narrowing shows early — 上代 texts already read the character as ひら, the ひら of 花びら, and medieval documents use it mostly for boards.

The story that reads the flat sense off the 木 radical is folk etymology, and the specialisation is a Japanese development rather than an inherited one. What makes it worth learning first is the sound: unlike 本 and 匹 it takes no changes at all — いちまい through じゅうまい, every one regular.', 'Chinese 枚 was a near-general classifier, close in scope to 个. Japanese narrowed it to thin flat things, and the narrowing shows early: 上代 texts already read the character as ひら, the ひら of 花びら, and medieval documents use it mostly for boards.

The story that reads the flat sense off the 木 radical is folk etymology, and the specialisation is a Japanese development rather than an inherited one. What makes it worth learning first is the sound: unlike 本 and 匹 it takes no changes at all (いちまい through じゅうまい, every one regular).'),
  ('Choosing between options just offered takes de, marking the one selected out of the set — o would treat kuro as a direct object being acted on.', 'Choosing between options just offered takes de, marking the one selected out of the set; o would treat kuro as a direct object being acted on.'),
  ('Choosing between two named options uses de, marking the one selected out of the set just offered — o would treat it like a plain object.', 'Choosing between two named options uses de, marking the one selected out of the set just offered; o would treat it like a plain object.'),
  ('Choosing between two named routes takes de, marking the one you are going with — o would make the road itself a direct object being requested like an item.', 'Choosing between two named routes takes de, marking the one you are going with; o would make the road itself a direct object being requested like an item.'),
  ('Choosing when, among the offered timings, is marked with de, the same short pattern as hotto de — not o.', 'Choosing when, among the offered timings, is marked with de, the same short pattern as hotto de, not o.'),
  ('Classical Japanese had a 終止形 to end a sentence and a 連体形 to stand before a noun, and for most verbs they differed. They collapsed together, and the surviving shape is the one dictionaries list.

Japanese never needed a relative pronoun — even before the merger the 連体形 modified nouns directly. What the merger did was hand both jobs to one shape, so 食べる now ends a sentence and also sits straight in front of a noun: 食べる人.', 'Classical Japanese had a 終止形 to end a sentence and a 連体形 to stand before a noun, and for most verbs they differed. They collapsed together, and the surviving shape is the one dictionaries list.

Japanese never needed a relative pronoun: even before the merger the 連体形 modified nouns directly. What the merger did was hand both jobs to one shape, so 食べる now ends a sentence and also sits straight in front of a noun: 食べる人.'),
  ('Classical Japanese had a 終止形 to end a sentence and a 連体形 to stand before a noun, and for most verbs they differed. They collapsed together, and the surviving shape is the one dictionaries list.

That merger is why 食べる can end a sentence and also sit straight in front of a noun — 食べる人 — with nothing added. Japanese needs no relative pronoun because the form was already built to modify.', 'Classical Japanese had a 終止形 to end a sentence and a 連体形 to stand before a noun, and for most verbs they differed. They collapsed together, and the surviving shape is the one dictionaries list.

That merger is why 食べる can end a sentence and also sit straight in front of a noun (食べる人) with nothing added. Japanese needs no relative pronoun because the form was already built to modify.'),
  ('Classical Japanese had なる as an attributive copula — に plus あり — and 静かなる夜 was "a night that is quiet". な is what is left of it.

Everything odd about the class follows. They take だ and でした because nouns do; they take な before a noun because that is the copula''s modifying form; and 静かの has to be 静かな for the same reason. The class is noun-like and leans on the copula for everything, which is why it patterns with nouns nearly everywhere — and yet takes な where a true noun takes の.', 'Classical Japanese had なる as an attributive copula (に plus あり), and 静かなる夜 was "a night that is quiet". な is what is left of it.

Everything odd about the class follows. They take だ and でした because nouns do; they take な before a noun because that is the copula''s modifying form; and 静かの has to be 静かな for the same reason. The class is noun-like and leans on the copula for everything, which is why it patterns with nouns nearly everywhere, and yet takes な where a true noun takes の.'),
  ('Classical Japanese had なる as an attributive copula — に plus あり — and 静かなる夜 was "a night that is quiet". な is what is left of it.

Everything odd about the class follows. They take だ and でした because nouns do; they take な before a noun because that is the copula''s modifying form; and 静かの has to be 静かな for the same reason. The grammar is not a second kind of adjective but a noun with a copula attached.', 'Classical Japanese had なる as an attributive copula (に plus あり), and 静かなる夜 was "a night that is quiet". な is what is left of it.

Everything odd about the class follows. They take だ and でした because nouns do; they take な before a noun because that is the copula''s modifying form; and 静かの has to be 静かな for the same reason. The grammar is not a second kind of adjective but a noun with a copula attached.'),
  ('Classical Japanese had 係り結び: certain particles mid-sentence forced a particular ending on the final verb, and こそ demanded the 已然形. The agreement is gone; the particle stayed.

What it does now is what it always did — single one element out as the one that counts. That is why こそ replaces は and が rather than joining them, and why 今こそ and あなたこそ need no other emphasis around them.', 'Classical Japanese had 係り結び: certain particles mid-sentence forced a particular ending on the final verb, and こそ demanded the 已然形. The agreement is gone; the particle stayed.

What it does now is what it always did: single one element out as the one that counts. That is why こそ replaces は and が rather than joining them, and why 今こそ and あなたこそ need no other emphasis around them.'),
  ('Classical adjectives had a form used before verbs, and for い-adjectives it was く. For な-adjectives, which are nouns with a copula, it is に — the copula''s own connecting form.

So 早く and 静かに are the same grammatical thing produced by two different classes, and it is the same く and に you already meet in 早くない, 大きくなる and 静かになる. One form, several jobs.', 'Classical adjectives had a form used before verbs, and for い-adjectives it was く. For な-adjectives, which are nouns with a copula, it is に, the copula''s own connecting form.

So 早く and 静かに are the same grammatical thing produced by two different classes, and it is the same く and に you already meet in 早くない, 大きくなる and 静かになる. One form, several jobs.'),
  ('Confirming — this is for London, correct?', 'Confirming: this is for London, correct?'),
  ('Contrast 開いている, which merely reports the window is open. てある says a person did it on purpose — the intention survives in the state.', 'Contrast 開いている, which merely reports the window is open. てある says a person did it on purpose; the intention survives in the state.'),
  ('Conversation''s all-purpose quoting particle. It can also mark a topic — 日本語って難しい — which と cannot.', 'Conversation''s all-purpose quoting particle. It can also mark a topic (日本語って難しい), which と cannot.'),
  ('Correct Japanese, but flat — it is the tone of refusing a form you did not ask for. daijoubu desu softens it.', 'Correct Japanese, but flat: it is the tone of refusing a form you did not ask for. daijoubu desu softens it.'),
  ('Despite the ない it is emphatic, not negative — 極まる means to reach a limit, and 極まりない says the limit is nowhere in sight.', 'Despite the ない it is emphatic, not negative: 極まる means to reach a limit, and 極まりない says the limit is nowhere in sight.'),
  ('Dictionaries offer competing derivations and none has carried the field. What can be said is that it behaves as an i-adjective — 子供っぽくない, 忘れっぽかった — and attaches to nouns and stems alike.

What it reports is a resemblance or a tendency, usually unflattering: 子供っぽい is childish rather than childlike. Set beside 気味, a trace, and がち, what prevails, it is the one about seeming.', 'Dictionaries offer competing derivations and none has carried the field. What can be said is that it behaves as an i-adjective (子供っぽくない, 忘れっぽかった) and attaches to nouns and stems alike.

What it reports is a resemblance or a tendency, usually unflattering: 子供っぽい is childish rather than childlike. Set beside 気味, a trace, and がち, what prevails, it is the one about seeming.'),
  ('Do it — a gentle order.', 'Do it: a gentle order.'),
  ('Dropping da before to breaks the conditional — the plain copula has to be there: dake da to.', 'Dropping da before to breaks the conditional; the plain copula has to be there: dake da to.'),
  ('Dropping mo breaks the fixed permission pattern te mo ii desu ka — mo cannot be left out.', 'Dropping mo breaks the fixed permission pattern te mo ii desu ka; mo cannot be left out.'),
  ('Dropping no leaves 大きい and 小さい with nothing to modify — no stands in for koppu and has to stay.', 'Dropping no leaves 大きい and 小さい with nothing to modify; no stands in for koppu and has to stay.'),
  ('Either — or, whichever.', 'Either... or, whichever.'),
  ('Even though — said with contempt.', 'Even though: said with contempt.'),
  ('Even though — with the speaker put out by it.', 'Even though: with the speaker put out by it.'),
  ('Even while — despite.', 'Even while: despite.'),
  ('Even — and with ば, "if only".', 'Even, and with ば, "if only".'),
  ('Existence — "there is".', 'Existence: "there is".'),
  ('Experience — "have done X before".', 'Experience: "have done X before".'),
  ('Far from — quite the opposite.', 'Far from: quite the opposite.'),
  ('Finish completely — or do something regrettable.', 'Finish completely, or do something regrettable.'),
  ('For a rate — so many times PER week — the particle is ni.', 'For a rate, so many times PER week, the particle is ni.'),
  ('For extent — time, area, scope. It stresses how much ground was covered, which is why it takes plural or measured nouns.', 'For extent: time, area, scope. It stresses how much ground was covered, which is why it takes plural or measured nouns.'),
  ('Four textbook meanings — means, cause, agent, variation — and one verb behind all of them. Whatever the sentence is doing, によって names the thing the outcome hangs on.

The agent use in a passive is the same idea: この本は彼によって書かれた says the writing depended on him. And 人によって違う is variation because what differs is exactly what it depends on. The English translations diverge; the Japanese never did.', 'Four textbook meanings (means, cause, agent, variation) and one verb behind all of them. Whatever the sentence is doing, によって names the thing the outcome hangs on.

The agent use in a passive is the same idea: この本は彼によって書かれた says the writing depended on him. And 人によって違う is variation because what differs is exactly what it depends on. The English translations diverge; the Japanese never did.'),
  ('From — a starting point.', 'From: a starting point.'),
  ('From 仕方, "a way of doing" — there is no way to deal with it. Contracts to 〜てしょうがない in speech.', 'From 仕方, "a way of doing": there is no way to deal with it. Contracts to 〜てしょうがない in speech.'),
  ('From 済む, "to be settled" — the negative says the matter is not yet settled between us. That is why it thanks as well as apologises.', 'From 済む, "to be settled": the negative says the matter is not yet settled between us. That is why it thanks as well as apologises.'),
  ('From 置く, "to put". The action is placed somewhere ready — preparation whose result is meant to stay put until it is needed.', 'From 置く, "to put". The action is placed somewhere ready: preparation whose result is meant to stay put until it is needed.'),
  ('From 陰, "shadow" — the protection of standing in someone''s shade. おかげさまで has hardened into a set phrase that thanks nobody in particular.', 'From 陰, "shadow": the protection of standing in someone''s shade. おかげさまで has hardened into a set phrase that thanks nobody in particular.'),
  ('Genuinely harsh, and rare in ordinary speech. It survives in signs, sport, and set phrases — 頑張れ is a shout of support, not an order.', 'Genuinely harsh, and rare in ordinary speech. It survives in signs, sport, and set phrases: 頑張れ is a shout of support, not an order.'),
  ('Gives a reason — "because / so".', 'Gives a reason: "because / so".'),
  ('Glad to hear it. I gave out homework yesterday — did you hear about it?', 'Glad to hear it. I gave out homework yesterday. Did you hear about it?'),
  ('Gotta — casual obligation.', 'Gotta: casual obligation.'),
  ('Grammatical but abrupt over a counter — and vague about what you want done.', 'Grammatical but abrupt over a counter, and vague about what you want done.'),
  ('Grammatical but odd — announcing that you will wait. onegai shimasu is what is said.', 'Grammatical but odd: announcing that you will wait. onegai shimasu is what is said.'),
  ('Grammatical, but bare kore desu while holding something out is blunt at a counter — douzo is the polite way to offer it.', 'Grammatical, but bare kore desu while holding something out is blunt at a counter; douzo is the polite way to offer it.'),
  ('Grammatical, but kudasai to a close friend is stiff — it sounds like you are giving instructions.', 'Grammatical, but kudasai to a close friend is stiff; it sounds like you are giving instructions.'),
  ('Hey, about tonight — got a sec to talk?', 'Hey, about tonight. Got a sec to talk?'),
  ('I am off — excuse me for leaving first.', 'I am off. Excuse me for leaving first.'),
  ('I get up early every morning. (起きる — ichidan)', 'I get up early every morning. (起きる: ichidan)'),
  ('I phone every day. (電話する — irregular)', 'I phone every day. (電話する: irregular)'),
  ('I study every day. (勉強する — irregular)', 'I study every day. (勉強する: irregular)'),
  ('I will. Can I ask one more thing — is there a convenience store nearby?', 'I will. Can I ask one more thing? Is there a convenience store nearby?'),
  ('I write a letter. (書く — godan)', 'I write a letter. (書く: godan)'),
  ('I''m afraid this one is difficult — the egg is mixed right into the batter.', 'I''m afraid this one is difficult: the egg is mixed right into the batter.'),
  ('I''m terribly sorry — it looks like your balance is insufficient.', 'I''m terribly sorry. It looks like your balance is insufficient.'),
  ('If / when A happens, B — one specific occasion.', 'If / when A happens, B: one specific occasion.'),
  ('If / when — the general-purpose conditional.', 'If / when: the general-purpose conditional.'),
  ('If A, then B — a general condition.', 'If A, then B: a general condition.'),
  ('If only — but you didn''t.', 'If only, but you didn''t.'),
  ('If that''s the case — picking up what was just said.', 'If that''s the case: picking up what was just said.'),
  ('If you were to — and it would be bad.', 'If you were to, and it would be bad.'),
  ('In Old Japanese が marked possession, much as の does now. The fossil survives in fixed expressions: わが国 "my/our country", わが家 "my home".

It shifted to marking subjects inside subordinate clauses, then generalised. Knowing this makes the modern split-up of が and の feel less arbitrary — they were once doing the same job, and in some relative clauses either still works.', 'In Old Japanese が marked possession, much as の does now. The fossil survives in fixed expressions: わが国 "my/our country", わが家 "my home".

It shifted to marking subjects inside subordinate clauses, then generalised. Knowing this makes the modern split-up of が and の feel less arbitrary; they were once doing the same job, and in some relative clauses either still works.'),
  ('In an office ohayou gozaimasu is the arrival greeting whatever the hour — night staff say it too.', 'In an office ohayou gozaimasu is the arrival greeting whatever the hour; night staff say it too.'),
  ('In, at — formally.', 'In, at: formally.'),
  ('Intention — "I plan to".', 'Intention: "I plan to".'),
  ('Invitation — "won''t you…?"', 'Invitation: "won''t you…?"'),
  ('Is not — classically.', 'Is not: classically.'),
  ('It asks by what means something came about, and asking that is asking why. なぜ is the plainer native word with no such construction inside it — 何故 is a kanji spelling, not a Sino-Japanese reading.

The literal reading also survives: どうして生きていくのか can genuinely mean "how", not "why". And it is why どうして carries more feeling than なぜ, which merely asks.', 'It asks by what means something came about, and asking that is asking why. なぜ is the plainer native word with no such construction inside it: 何故 is a kanji spelling, not a Sino-Japanese reading.

The literal reading also survives: どうして生きていくのか can genuinely mean "how", not "why". And it is why どうして carries more feeling than なぜ, which merely asks.'),
  ('It attached to the 連用形, exactly as ながら does, and the two are near-synonyms because they were built the same way. つつ simply stayed in the written language while ながら moved into speech.

The repetition sense survives in つつある, which is not "while" at all but a change still under way — 増えつつある, going on increasing. That is the older meaning, preserved in the one place ながら never took over.', 'It attached to the 連用形, exactly as ながら does, and the two are near-synonyms because they were built the same way. つつ simply stayed in the written language while ながら moved into speech.

The repetition sense survives in つつある, which is not "while" at all but a change still under way: 増えつつある, going on increasing. That is the older meaning, preserved in the one place ながら never took over.'),
  ('It describes the THING, not the person. 読みやすい本 is a book that is easy to read for anyone — for your own ability the potential form is what you want.', 'It describes the THING, not the person. 読みやすい本 is a book that is easy to read for anyone; for your own ability the potential form is what you want.'),
  ('It dismisses an action as unnecessary rather than impossible — the thing is so obvious that doing it would be excessive.', 'It dismisses an action as unnecessary rather than impossible; the thing is so obvious that doing it would be excessive.'),
  ('It enters through kanbun, and に関して is the written register''s について — the difference being only that 関する is Sino-Japanese and 付く is native, so the first belongs to reports and the second to speech.

The 関 also used to write native かかわる is spelling, not kinship: かかわる is its own word, written 係わる and 拘わる just as readily. And neither carries the settled dispute of をめぐって.', 'It enters through kanbun, and に関して is the written register''s について, the difference being only that 関する is Sino-Japanese and 付く is native, so the first belongs to reports and the second to speech.

The 関 also used to write native かかわる is spelling, not kinship: かかわる is its own word, written 係わる and 拘わる just as readily. And neither carries the settled dispute of をめぐって.'),
  ('It inflects like an adjective: ごとく connects onward, ごとき stands before a noun, ごとし ends a sentence. 光陰矢のごとし — time flies like an arrow — is the phrase everybody knows.

Modern ようだ replaced it entirely, which is why ごとき now sounds either literary or contemptuous. 私ごとき is self-deprecation precisely because reaching for the archaic form makes a show of the comparison.', 'It inflects like an adjective: ごとく connects onward, ごとき stands before a noun, ごとし ends a sentence. 光陰矢のごとし, time flies like an arrow, is the phrase everybody knows.

Modern ようだ replaced it entirely, which is why ごとき now sounds either literary or contemptuous. 私ごとき is self-deprecation precisely because reaching for the archaic form makes a show of the comparison.'),
  ('It insists on the word it follows against some alternative — this year as opposed to the last few. こちらこそ returns thanks by insisting the debt runs the other way.', 'It insists on the word it follows against some alternative: this year as opposed to the last few. こちらこそ returns thanks by insisting the debt runs the other way.'),
  ('It is cognate with 崎 — the cape or headland that juts into the sea. The shared sense is a point that sticks out in front, which is why the one word covers the tip of a pen, the head of a queue and the place you are going next.', 'It is cognate with 崎: the cape or headland that juts into the sea. The shared sense is a point that sticks out in front, which is why the one word covers the tip of a pen, the head of a queue and the place you are going next.'),
  ('It is literally "even doing it, it is good" — て, も, and いい, each doing its usual job.', 'It is literally "even doing it, it is good": て, も, and いい, each doing its usual job.'),
  ('It is literally "yes or no" — や, 否, や — with no time left between them.', 'It is literally "yes or no" (や, 否, や), with no time left between them.'),
  ('It is not an express — it is a local, so please note that.', 'It is not an express: it is a local, so please note that.'),
  ('It is the opposite arrow from 上げる, and it is why くれる cannot be used for a gift between two other people that has nothing to do with you: the verb encodes arrival at your side.

Its honorific is 下さる — literally "to give downward" — which is the 下さい you have been saying since the first lesson. 買ってくれた and 買ってくださった are one verb at two heights.', 'It is the opposite arrow from 上げる, and it is why くれる cannot be used for a gift between two other people that has nothing to do with you: the verb encodes arrival at your side.

Its honorific is 下さる, literally "to give downward", which is the 下さい you have been saying since the first lesson. 買ってくれた and 買ってくださった are one verb at two heights.'),
  ('It is the opposite arrow from 上げる, and it is why くれる cannot be used for a gift between two other people that has nothing to do with you: the verb encodes arrival at your side. The spelling 呉れる is ateji — 呉 writes the sound and is not where the verb comes from, which is obscure.

Its honorific is 下さる — literally "to give downward" — which is the 下さい you have been saying since the first lesson. 買ってくれた and 買ってくださった are one verb at two heights.', 'It is the opposite arrow from 上げる, and it is why くれる cannot be used for a gift between two other people that has nothing to do with you: the verb encodes arrival at your side. The spelling 呉れる is ateji: 呉 writes the sound and is not where the verb comes from, which is obscure.

Its honorific is 下さる, literally "to give downward", which is the 下さい you have been saying since the first lesson. 買ってくれた and 買ってくださった are one verb at two heights.'),
  ('It is worth saying plainly rather than inventing a story from the kana. What is clear is its behaviour: it follows a noun and makes a na-adjective-like whole, 間違いだらけの手紙.

What separates it from まみれ and ずくめ is reach. まみれ needs something that could coat a surface, ずくめ a single quality filling a thing completely, while だらけ takes anything in unwelcome quantity — mud, mistakes, holes.', 'It is worth saying plainly rather than inventing a story from the kana. What is clear is its behaviour: it follows a noun and makes a na-adjective-like whole, 間違いだらけの手紙.

What separates it from まみれ and ずくめ is reach. まみれ needs something that could coat a surface, ずくめ a single quality filling a thing completely, while だらけ takes anything in unwelcome quantity: mud, mistakes, holes.'),
  ('It is written 下さい — the kanji 下 "below" is doing real work. 下さる is the honorific of くれる ("to give to me"), and it pictures the giving as coming DOWN from someone above you to you below.

So てください literally asks someone to bestow the action downward on you. That is why it stays polite but still directive: you are describing a gift from a superior, not making a tentative request.', 'It is written 下さい: the kanji 下 "below" is doing real work. 下さる is the honorific of くれる ("to give to me"), and it pictures the giving as coming DOWN from someone above you to you below.

So てください literally asks someone to bestow the action downward on you. That is why it stays polite but still directive: you are describing a gift from a superior, not making a tentative request.'),
  ('It is written 間, the same character read かん in 時間 and 人間 — but that is a Sino-Japanese morpheme and あいだ is the older native word underneath the shared spelling. 間に applies it to time: the stretch between one point and another.

The に is what makes it a window rather than a duration. 寝ている間 is the whole time; 寝ている間に is some moment inside it, which is why the second takes a one-off event and the first takes something lasting.', 'It is written 間, the same character read かん in 時間 and 人間, but that is a Sino-Japanese morpheme and あいだ is the older native word underneath the shared spelling. 間に applies it to time: the stretch between one point and another.

The に is what makes it a window rather than a duration. 寝ている間 is the whole time; 寝ている間に is some moment inside it, which is why the second takes a one-off event and the first takes something lasting.'),
  ('It is いる with the old ながら — remaining in the state of being where you are.', 'It is いる with the old ながら: remaining in the state of being where you are.'),
  ('It is とて plus も — even saying that. とても行けない, "there is no way I can go", is the original construction and is still perfectly current.

The positive とても寒い is a Meiji-era innovation that was criticised as slang when it appeared. The negative use has not gone anywhere, which is why とても〜ない reads as idiomatic rather than as a contradiction.', 'It is とて plus も: even saying that. とても行けない, "there is no way I can go", is the original construction and is still perfectly current.

The positive とても寒い is a Meiji-era innovation that was criticised as slang when it appeared. The negative use has not gone anywhere, which is why とても〜ない reads as idiomatic rather than as a contradiction.'),
  ('It looks like する and is not. す／さす attached to the 未然形 and meant to make or let happen; it survives as modern せる／させる.

Make and let are one form because the auxiliary never separated them — the difference is carried by the particle. 子供を行かせる compels; 子供に行かせる permits, because に marks someone with their own part in it while を marks something acted upon.', 'It looks like する and is not. す／さす attached to the 未然形 and meant to make or let happen; it survives as modern せる／させる.

Make and let are one form because the auxiliary never separated them; the difference is carried by the particle. 子供を行かせる compels; 子供に行かせる permits, because に marks someone with their own part in it while を marks something acted upon.'),
  ('It looks like する and is not. す／さす attached to the 未然形 and meant to make or let happen; it survives as modern せる／させる.

Make and let are one form because the auxiliary never separated them. With an intransitive verb the particle can tilt it — 子供を行かせる leans toward compelling, 子供に行かせる toward permitting — but with a transitive verb the causee takes に either way (子供にご飯を食べさせる), and context decides.', 'It looks like する and is not. す／さす attached to the 未然形 and meant to make or let happen; it survives as modern せる／させる.

Make and let are one form because the auxiliary never separated them. With an intransitive verb the particle can tilt it (子供を行かせる leans toward compelling, 子供に行かせる toward permitting), but with a transitive verb the causee takes に either way (子供にご飯を食べさせる), and context decides.'),
  ('It marks a state that persists when it should not have, which is why it so often reports carelessness — the light left on, the door left open.', 'It marks a state that persists when it should not have, which is why it so often reports carelessness: the light left on, the door left open.'),
  ('It marks the sentence as new information being given, which is why it can sound helpful — 落ちましたよ — and equally why it can sound like being told off.

The risk is telling somebody what they already know. 会議は三時ですよ to the person who scheduled it is grammatical and rude, because よ has claimed they needed telling.', 'It marks the sentence as new information being given, which is why it can sound helpful (落ちましたよ), and equally why it can sound like being told off.

The risk is telling somebody what they already know. 会議は三時ですよ to the person who scheduled it is grammatical and rude, because よ has claimed they needed telling.'),
  ('It modifies a noun bare — 同じ本 — where a な-adjective would need な and an i-adjective would end in い. Grammars class it as a 連体詞 for that reason.

But it takes だ and です like a な-adjective, and 同じで links like one. It is a word caught between two classes, and the irregularity is worth learning as a fact rather than a rule.', 'It modifies a noun bare, 同じ本, where a な-adjective would need な and an i-adjective would end in い. Grammars class it as a 連体詞 for that reason.

But it takes だ and です like a な-adjective, and 同じで links like one. It is a word caught between two classes, and the irregularity is worth learning as a fact rather than a rule.'),
  ('It nearly always carries reluctance. 待たされた does not just report that you waited — it complains about it.', 'It nearly always carries reluctance. 待たされた does not just report that you waited; it complains about it.'),
  ('It needs something that had been expected or asserted — a prediction, a rule, an intention. It cannot simply contrast two facts.', 'It needs something that had been expected or asserted: a prediction, a rule, an intention. It cannot simply contrast two facts.'),
  ('It pairs the words with the saying of them: 「はい」と言った. Nothing marks the quotation as speech; と simply joins the content to the verb.

That is why と works for thought as readily as speech — と思う, と考える — and why it needs the plain form in front. What is being paired is the thought itself, and politeness belongs to the sentence around it, not inside the quotation.', 'It pairs the words with the saying of them: 「はい」と言った. Nothing marks the quotation as speech; と simply joins the content to the verb.

That is why と works for thought as readily as speech (と思う, と考える), and why it needs the plain form in front. What is being paired is the thought itself, and politeness belongs to the sentence around it, not inside the quotation.'),
  ('It pairs the words with the saying of them: 「はい」と言った. Nothing marks the quotation as speech; と simply joins the content to the verb.

That is why と works for thought as readily as speech — と思う, と考える. It is also why INDIRECT quotation drops to the plain form: when you report the content rather than the words, politeness belongs to the sentence around it. A direct quote keeps whatever was actually said, 「はい、そうです」と言った included.', 'It pairs the words with the saying of them: 「はい」と言った. Nothing marks the quotation as speech; と simply joins the content to the verb.

That is why と works for thought as readily as speech: と思う, と考える. It is also why INDIRECT quotation drops to the plain form: when you report the content rather than the words, politeness belongs to the sentence around it. A direct quote keeps whatever was actually said, 「はい、そうです」と言った included.'),
  ('It rejects an inference, so the second half is nearly always negative — とは限らない, わけではない, ない.', 'It rejects an inference, so the second half is nearly always negative: とは限らない, わけではない, ない.'),
  ('It rules something out on grounds of circumstance, not preference — there are more pressing things.', 'It rules something out on grounds of circumstance, not preference: there are more pressing things.'),
  ('It seems — a conclusion from evidence.', 'It seems: a conclusion from evidence.'),
  ('It sets whose judgement is being reported. Almost always followed by an evaluation — important, difficult, unforgettable — because a standpoint needs something to judge.', 'It sets whose judgement is being reported. Almost always followed by an evaluation (important, difficult, unforgettable), because a standpoint needs something to judge.'),
  ('It''s Shibuya-ku, Tokyo — I''ll send the exact number later.', 'It''s Shibuya-ku, Tokyo. I''ll send the exact number later.'),
  ('It''s not that — a partial denial.', 'It''s not that: a partial denial.'),
  ('It''s on the app — is that all right?', 'It''s on the app. Is that all right?'),
  ('It''s two kilograms — that''ll be five thousand yen.', 'It''s two kilograms. That''ll be five thousand yen.'),
  ('Its positive twin かねる means "cannot bring oneself to", so かねない literally says "cannot NOT" — the double negative is why a bare-looking form carries a warning.', 'Its positive twin かねる means "cannot bring oneself to", so かねない literally says "cannot NOT"; the double negative is why a bare-looking form carries a warning.'),
  ('Japanese addresses use the counters choume, ban, gou for each part — not bare numbers.', 'Japanese addresses use the counters choume, ban, gou for each part, not bare numbers.'),
  ('Japanese also has the "suffering passive", which English cannot do: 雨に降られた, "I was rained on". The verb is intransitive, so there is no object to promote — the passive is marking that it happened TO you.', 'Japanese also has the "suffering passive", which English cannot do: 雨に降られた, "I was rained on". The verb is intransitive, so there is no object to promote; the passive is marking that it happened TO you.'),
  ('Japanese has no comparative or superlative endings; the work is done by separate words — 一番 for the top, もっと for more.', 'Japanese has no comparative or superlative endings; the work is done by separate words: 一番 for the top, もっと for more.'),
  ('Japanese has no verb "to have" — possession is existence. Whether it is ある or いる still follows animacy.', 'Japanese has no verb "to have": possession is existence. Whether it is ある or いる still follows animacy.'),
  ('Japanese has several なり and this is the one meaning "as soon as, and then". 帰るなり寝てしまった.

What separates it from や否や and が早いか is the surprise. なり reports that the second thing happened immediately and unexpectedly, which is why it so often introduces something out of character — and why the subject of both halves must be the same person.', 'Japanese has several なり and this is the one meaning "as soon as, and then". 帰るなり寝てしまった.

What separates it from や否や and が早いか is the surprise. なり reports that the second thing happened immediately and unexpectedly, which is why it so often introduces something out of character, and why the subject of both halves must be the same person.'),
  ('Japanese says having by saying existing — the thing exists to you.', 'Japanese says having by saying existing: the thing exists to you.'),
  ('Japanese splits existence in two: いる for what moves of itself, ある for what does not. 〜てある is built on the inanimate one, so what it asserts is that a thing exists in a done condition.

That explains the particle switch that makes the pattern look irregular. 窓を開けてある becomes 窓が開けてある because the sentence is no longer about anyone opening anything; it is about the window, and what is being said of it is that it stands opened. The person who did it has been left out on purpose, and ている differs exactly there — 開いている says the window is open, with nobody implied at all.', 'Japanese splits existence in two: いる for what moves of itself, ある for what does not. 〜てある is built on the inanimate one, so what it asserts is that a thing exists in a done condition.

That explains the particle switch that makes the pattern look irregular. 窓を開けてある becomes 窓が開けてある because the sentence is no longer about anyone opening anything; it is about the window, and what is being said of it is that it stands opened. The person who did it has been left out on purpose, and ている differs exactly there: 開いている says the window is open, with nobody implied at all.'),
  ('Japanese verbs do not each have their own endings to memorise. There are three groups, and once you know which group a verb is in, every form follows.

**Ichidan (一段)** — the easy ones. The dictionary form ends in 〜いる or 〜える, and you conjugate by dropping る and adding the ending. 食べる → 食べます, 食べて, 食べた, 食べない. Nothing else changes.

**Godan (五段)** — everything else ending in う, く, ぐ, す, つ, ぬ, ぶ, む, る. The final syllable shifts across the five vowel rows, which is what 五段, "five steps", means. 書く → 書きます, 書いて, 書いた, 書かない. The consonant stays, the vowel moves.

**Irregular** — there are only two: する (to do) and くる (to come). They are irregular in every form, and you learn them as they arrive. する is worth extra attention because it is how Japanese turns almost any noun into a verb: 勉強 → 勉強する, 電話 → 電話する.

ある is a fourth footnote: a godan verb in every form except the negative, where it becomes ない rather than あらない.', 'Japanese verbs do not each have their own endings to memorise. There are three groups, and once you know which group a verb is in, every form follows.

**Ichidan (一段)**: the easy ones. The dictionary form ends in 〜いる or 〜える, and you conjugate by dropping る and adding the ending. 食べる → 食べます, 食べて, 食べた, 食べない. Nothing else changes.

**Godan (五段)**: everything else ending in う, く, ぐ, す, つ, ぬ, ぶ, む, る. The final syllable shifts across the five vowel rows, which is what 五段, "five steps", means. 書く → 書きます, 書いて, 書いた, 書かない. The consonant stays, the vowel moves.

**Irregular**: there are only two, する (to do) and くる (to come). They are irregular in every form, and you learn them as they arrive. する is worth extra attention because it is how Japanese turns almost any noun into a verb: 勉強 → 勉強する, 電話 → 電話する.

ある is a fourth footnote: a godan verb in every form except the negative, where it becomes ない rather than あらない.'),
  ('Just because — that doesn''t follow.', 'Just because, that doesn''t follow.'),
  ('Let me think — how about the udon place on the other side of the station? That one is fine for me.', 'Let me think. How about the udon place on the other side of the station? That one is fine for me.'),
  ('Like です, ます is politeness toward the listener. A whole conversation in plain form is not rude between friends — it is simply a different register.', 'Like です, ます is politeness toward the listener. A whole conversation in plain form is not rude between friends; it is simply a different register.'),
  ('Links two nouns — possession, type, or origin.', 'Links two nouns: possession, type, or origin.'),
  ('Literally "even if you do X, it is good" — which is why it grants permission rather than encouraging.', 'Literally "even if you do X, it is good", which is why it grants permission rather than encouraging.'),
  ('Literally "if I do not go, it will not do" — a double negative. Japanese expresses obligation by ruling out the alternative rather than asserting the duty.', 'Literally "if I do not go, it will not do", a double negative. Japanese expresses obligation by ruling out the alternative rather than asserting the duty.'),
  ('Literally "one cannot know whether". It is genuinely uncertain — weaker than でしょう and far weaker than はず.', 'Literally "one cannot know whether". It is genuinely uncertain: weaker than でしょう and far weaker than はず.'),
  ('Literally "receive the favour of being allowed to". Very common in business Japanese, and easy to overdo — used for something nobody could object to, it sounds obsequious.', 'Literally "receive the favour of being allowed to". Very common in business Japanese, and easy to overdo; used for something nobody could object to, it sounds obsequious.'),
  ('Looks like — the casual ようだ.', 'Looks like: the casual ようだ.'),
  ('Marks the topic — "as for X".', 'Marks the topic: "as for X".'),
  ('Material is the same で again — what a thing was made out of is a circumstance of the making.', 'Material is the same で again: what a thing was made out of is a circumstance of the making.'),
  ('Meat and fish and the rest of it — I bought the lot.', 'Meat and fish and the rest of it: I bought the lot.'),
  ('Meat or fish — take whichever you like.', 'Meat or fish: take whichever you like.'),
  ('Might well — and that would be bad.', 'Might well, and that would be bad.'),
  ('Milk was just mentioned by the other person, so it is already the topic and takes wa — ga would treat it as brand-new information.', 'Milk was just mentioned by the other person, so it is already the topic and takes wa; ga would treat it as brand-new information.'),
  ('Mimetic pain words pair with suru, not iru — the phrase is zukizuki shimasu.', 'Mimetic pain words pair with suru, not iru: the phrase is zukizuki shimasu.'),
  ('Mixing plain gomen with polite shimasu in one breath is jarring — keep one register.', 'Mixing plain gomen with polite shimasu in one breath is jarring; keep one register.'),
  ('Mixing the polite arimasu with the plain nai desu mid-sentence — keep both clauses polite: arimasen.', 'Mixing the polite arimasu with the plain nai desu mid-sentence. Keep both clauses polite: arimasen.'),
  ('Must be — near certainty.', 'Must be: near certainty.'),
  ('Must not — on signs.', 'Must not: on signs.'),
  ('Na-adjectives like daijoubu do not take ni before desu ka — it is just daijoubu desu ka.', 'Na-adjectives like daijoubu do not take ni before desu ka; it is just daijoubu desu ka.'),
  ('Naming the dish you are settling on uses ni suru, to decide on it, not o suru — carbonara ni shimasu.', 'Naming the dish you are settling on uses ni suru, to decide on it, not o suru: carbonara ni shimasu.'),
  ('Narrower than だらけ: it needs something that actually clings — sweat, mud, blood, dust. 間違いまみれ is wrong; 間違いだらけ is right.', 'Narrower than だらけ: it needs something that actually clings (sweat, mud, blood, dust). 間違いまみれ is wrong; 間違いだらけ is right.'),
  ('Negating daijoubu says something is NOT fine — the opposite of agreeing to wait.', 'Negating daijoubu says something is NOT fine: the opposite of agreeing to wait.'),
  ('Negative masen ka is an invitation — "shall we make it together?" — not a question about quantity.', 'Negative masen ka is an invitation, "shall we make it together?", not a question about quantity.'),
  ('Never used about yourself — 上手です about your own Japanese sounds boastful. 得意 is the modest word for your own skill.', 'Never used about yourself: 上手です about your own Japanese sounds boastful. 得意 is the modest word for your own skill.'),
  ('No need — the caretaker can let them in with a key.', 'No need: the caretaker can let them in with a key.'),
  ('No trouble — ask away if there is anything else.', 'No trouble: ask away if there is anything else.'),
  ('No, no — let''s both do our best.', 'No, no, let''s both do our best.'),
  ('No, that is fine — just the card is enough.', 'No, that is fine. Just the card is enough.'),
  ('Not just children — adults can enjoy it too.', 'Not just children: adults can enjoy it too.'),
  ('Not only — but also.', 'Not only... but also.'),
  ('Not only — but even.', 'Not only... but even.'),
  ('Not so much as a reply — there was no word at all.', 'Not so much as a reply: there was no word at all.'),
  ('Not unwillingness but impossibility — no method exists. 〜られない would leave open that you simply cannot manage it.', 'Not unwillingness but impossibility: no method exists. 〜られない would leave open that you simply cannot manage it.'),
  ('Not wrong, but blunter — it states a fact rather than excusing yourself. shitsurei shimasu is the polite exit.', 'Not wrong, but blunter: it states a fact rather than excusing yourself. shitsurei shimasu is the polite exit.'),
  ('Not, and so — a negative reason.', 'Not, and so: a negative reason.'),
  ('Nothing but — or only just now.', 'Nothing but, or only just now.'),
  ('Nothing is being left out — Japanese never required it to be there.', 'Nothing is being left out: Japanese never required it to be there.'),
  ('Obligation — "must".', 'Obligation: "must".'),
  ('Oh — that machine there?', 'Oh, that machine there?'),
  ('Oh, I don''t have change — can I get some?', 'Oh, I don''t have change. Can I get some?'),
  ('Oh, I only have a bill — can that be used?', 'Oh, I only have a bill. Can that be used?'),
  ('Oh, also — are the materials ready yet?', 'Oh, also, are the materials ready yet?'),
  ('Oh, sorry — can I pay by card?', 'Oh, sorry, can I pay by card?'),
  ('Okaasan is who you are already talking to — established, so wa or mo (as used correctly here) fits. ga would introduce her as brand-new information.', 'Okaasan is who you are already talking to: established, so wa or mo (as used correctly here) fits. ga would introduce her as brand-new information.'),
  ('Old Japanese had both: ば on the 未然形 was hypothetical, ば on the 已然形 meant "when" or "because" — something taken as actually so. The 未然形 construction died out, and the surviving 已然形 one took over the hypothetical meaning. Modern grammar renames that stem 仮定形, "hypothetical form", which quietly records the swap.

The old realis sense has not entirely gone. It is why ば sits so comfortably in general truths — 春になれば暖かくなる — and why a command after an action-verb ば-clause sounds wrong where たら is fine. After a stative or adjectival condition it is unremarkable — 時間があれば来てください.', 'Old Japanese had both: ば on the 未然形 was hypothetical, ば on the 已然形 meant "when" or "because": something taken as actually so. The 未然形 construction died out, and the surviving 已然形 one took over the hypothetical meaning. Modern grammar renames that stem 仮定形, "hypothetical form", which quietly records the swap.

The old realis sense has not entirely gone. It is why ば sits so comfortably in general truths (春になれば暖かくなる), and why a command after an action-verb ば-clause sounds wrong where たら is fine. After a stative or adjectival condition it is unremarkable: 時間があれば来てください.'),
  ('Old Japanese had both: ば on the 未然形 was hypothetical, ば on the 已然形 meant "when" or "because" — something taken as actually so. The 未然形 construction died out, and the surviving 已然形 one took over the hypothetical meaning. Modern grammar renames that stem 仮定形, "hypothetical form", which quietly records the swap.

The old realis sense has not entirely gone. It is why ば sits so comfortably in general truths — 春になれば暖かくなる — and why a request or a command after it still reads as slightly stiff.', 'Old Japanese had both: ば on the 未然形 was hypothetical, ば on the 已然形 meant "when" or "because": something taken as actually so. The 未然形 construction died out, and the surviving 已然形 one took over the hypothetical meaning. Modern grammar renames that stem 仮定形, "hypothetical form", which quietly records the swap.

The old realis sense has not entirely gone. It is why ば sits so comfortably in general truths (春になれば暖かくなる), and why a request or a command after it still reads as slightly stiff.'),
  ('Old Japanese had one auxiliary, る／らる, carrying four senses at once: passive, potential, spontaneous and honorific. Modern れる／られる inherited all four, undivided.

Godan verbs escaped. Somewhere around the Edo period they grew a dedicated potential of their own — 書ける, 読める, the 可能動詞 — and stopped using 書かれる to mean "can write". Ichidan verbs and 来る never did, which is exactly why 食べられる still has to carry both jobs and 書ける does not.', 'Old Japanese had one auxiliary, る／らる, carrying four senses at once: passive, potential, spontaneous and honorific. Modern れる／られる inherited all four, undivided.

Godan verbs escaped. Somewhere around the Edo period they grew a dedicated potential of their own (書ける, 読める, the 可能動詞), and stopped using 書かれる to mean "can write". Ichidan verbs and 来る never did, which is exactly why 食べられる still has to carry both jobs and 書ける does not.'),
  ('Old Japanese verbs had a 命令形 among their six forms, and modern 行け and 食べろ come straight down from it. It is a conjugation, not something added to a verb.

There is nowhere in it to put politeness — that is what ください and なさい are for, and both are built from other verbs entirely. It is also why the imperative survives where bluntness is the point: signs, coaching, and 頑張れ.', 'Old Japanese verbs had a 命令形 among their six forms, and modern 行け and 食べろ come straight down from it. It is a conjugation, not something added to a verb.

There is nowhere in it to put politeness: that is what ください and なさい are for, and both are built from other verbs entirely. It is also why the imperative survives where bluntness is the point: signs, coaching, and 頑張れ.'),
  ('Old Japanese was verb-final and so is the modern language; nothing in twelve hundred years moved it. What comes before the verb is comparatively free, because the particles say what each phrase is doing rather than the position.

That is the trade: English fixes the order and drops the case marking, Japanese fixes the verb and marks everything else. It is why 私はパンを食べます and パンを私は食べます are both grammatical. In writing the particles are what cannot be spared; speech drops は and を freely — これ食べる？ — because the context is doing their work.', 'Old Japanese was verb-final and so is the modern language; nothing in twelve hundred years moved it. What comes before the verb is comparatively free, because the particles say what each phrase is doing rather than the position.

That is the trade: English fixes the order and drops the case marking, Japanese fixes the verb and marks everything else. It is why 私はパンを食べます and パンを私は食べます are both grammatical. In writing the particles are what cannot be spared; speech drops は and を freely (これ食べる？), because the context is doing their work.'),
  ('Old Japanese さへ added something on top of what was already there. The modern sense is that addition narrowed to its most surprising case — the one you would not have added.

The "if only" use came from elsewhere. In classical Japanese that job belonged to a different particle, だに — 命だに〜ば — and さえ took over だに''s territory in the medieval period, which is how one particle ended up carrying both "even" and "if only". Reading 来さえすればいい as "if only the coming is added" is a serviceable mnemonic but not the history.', 'Old Japanese さへ added something on top of what was already there. The modern sense is that addition narrowed to its most surprising case: the one you would not have added.

The "if only" use came from elsewhere. In classical Japanese that job belonged to a different particle (だに, 命だに〜ば), and さえ took over だに''s territory in the medieval period, which is how one particle ended up carrying both "even" and "if only". Reading 来さえすればいい as "if only the coming is added" is a serviceable mnemonic but not the history.'),
  ('Old Japanese さへ added something on top of what was already there. The modern sense is that addition narrowed to its most surprising case — the one you would not have added.

The older meaning explains the conditional use, which otherwise looks unrelated. 来さえすればいい is "if only the coming is added, it is fine": さえ names the one further thing needed, and ば supplies the condition. Addition, not emphasis, is what makes that sentence work.', 'Old Japanese さへ added something on top of what was already there. The modern sense is that addition narrowed to its most surprising case: the one you would not have added.

The older meaning explains the conditional use, which otherwise looks unrelated. 来さえすればいい is "if only the coming is added, it is fine": さえ names the one further thing needed, and ば supplies the condition. Addition, not emphasis, is what makes that sentence work.'),
  ('Old Japanese らし did mark inference from evidence, but it fell out of the spoken language by mid-Heian and was gone by Kamakura. Modern conjectural らしい arose in the Edo period out of the Late Middle Japanese SUFFIX らしい — the one in 男らしい and 学生らしい, "as one would expect of" — echoing the remembered classical auxiliary rather than continuing it.

The suffix is therefore the source and the conjecture the offshoot, which is the reverse of how the two are usually presented. Both are still one idea: judging something by the evidence of what it appears to be. That is the difference from ようだ, which rests on what the speaker makes of it.', 'Old Japanese らし did mark inference from evidence, but it fell out of the spoken language by mid-Heian and was gone by Kamakura. Modern conjectural らしい arose in the Edo period out of the Late Middle Japanese SUFFIX らしい, the one in 男らしい and 学生らしい, "as one would expect of", echoing the remembered classical auxiliary rather than continuing it.

The suffix is therefore the source and the conjecture the offshoot, which is the reverse of how the two are usually presented. Both are still one idea: judging something by the evidence of what it appears to be. That is the difference from ようだ, which rests on what the speaker makes of it.'),
  ('On a high number or a long span it means "only at": 六十にして始めた, not until sixty. On a small one it means "even at": 一瞬にして消えた, gone in a single instant.

Both are the same construction naming a point and remarking on it. What decides the reading is whether the point is surprisingly late or surprisingly small, and nothing in the grammar tells you which — the noun does.', 'On a high number or a long span it means "only at": 六十にして始めた, not until sixty. On a small one it means "even at": 一瞬にして消えた, gone in a single instant.

Both are the same construction naming a point and remarking on it. What decides the reading is whether the point is surprisingly late or surprisingly small, and nothing in the grammar tells you which; the noun does.'),
  ('One auxiliary, four senses, none of them lost. It is why 先生が来られる can mean the teacher was come to, can come, or — most likely — simply comes, spoken respectfully.

One influential account ties the suffering passive to the spontaneous sense rather than the passive one: 雨に降られた would then be the older idea of something happening of itself, to someone, which explains the grievance and the fact that an intransitive verb can be passivised at all. Others read it as a later stretch of the plain passive with an affected party added. The construction is certain; its route is not.', 'One auxiliary, four senses, none of them lost. It is why 先生が来られる can mean the teacher was come to, can come, or, most likely, simply comes, spoken respectfully.

One influential account ties the suffering passive to the spontaneous sense rather than the passive one: 雨に降られた would then be the older idea of something happening of itself, to someone, which explains the grievance and the fact that an intransitive verb can be passivised at all. Others read it as a later stretch of the plain passive with an affected party added. The construction is certain; its route is not.'),
  ('One auxiliary, four senses, none of them lost. It is why 先生が来られる can mean the teacher was come to, can come, or — most likely — simply comes, spoken respectfully.

The suffering passive follows from the spontaneous sense rather than the passive one. 雨に降られた is not "I was rained on" as a grammatical operation; it is the older idea of something happening of itself, to someone. That is where the grievance in the construction comes from, and why Japanese can put an intransitive verb in the passive at all.', 'One auxiliary, four senses, none of them lost. It is why 先生が来られる can mean the teacher was come to, can come, or, most likely, simply comes, spoken respectfully.

The suffering passive follows from the spontaneous sense rather than the passive one. 雨に降られた is not "I was rained on" as a grammatical operation; it is the older idea of something happening of itself, to someone. That is where the grievance in the construction comes from, and why Japanese can put an intransitive verb in the passive at all.'),
  ('One character, two on-readings, and they do not mean the same thing. 授業中 is during the lesson; 一日中 is all day long.

The split is not predictable from the character, so the reading has to be learned with each word. Roughly, ちゅう takes an activity you are in the middle of and じゅう a span or space filled completely — 世界中, 一年中.', 'One character, two on-readings, and they do not mean the same thing. 授業中 is during the lesson; 一日中 is all day long.

The split is not predictable from the character, so the reading has to be learned with each word. Roughly, ちゅう takes an activity you are in the middle of and じゅう a span or space filled completely: 世界中, 一年中.'),
  ('One kanji across three patterns at this level. As a Sino-Japanese suffix it means "on the plane of" — 法律上 is on the legal plane, 健康上 on the health one.

It favours compact, compound-ready nouns, overwhelmingly Sino-Japanese — though modern loans join freely enough, as セキュリティ上の理由 and ルール上 show.', 'One kanji across three patterns at this level. As a Sino-Japanese suffix it means "on the plane of": 法律上 is on the legal plane, 健康上 on the health one.

It favours compact, compound-ready nouns, overwhelmingly Sino-Japanese, though modern loans join freely enough, as セキュリティ上の理由 and ルール上 show.'),
  ('One kanji across three patterns at this level. As a Sino-Japanese suffix it means "on the plane of" — 法律上 is on the legal plane, 健康上 on the health one.

That is why 〜上 attaches only to Sino-Japanese nouns and never to native ones: it is a compound-forming suffix, and it takes the on-reading company it belongs to.', 'One kanji across three patterns at this level. As a Sino-Japanese suffix it means "on the plane of": 法律上 is on the legal plane, 健康上 on the health one.

That is why 〜上 attaches only to Sino-Japanese nouns and never to native ones: it is a compound-forming suffix, and it takes the on-reading company it belongs to.'),
  ('One more row of the こそあど grid: こちら, そちら, あちら, どちら. The ら is an old suffix of vagueness, which is what makes the series polite — pointing at a general direction rather than straight at a thing.

どっち is the same word contracted, and it is casual for exactly that reason: the politeness lived in the length.', 'One more row of the こそあど grid: こちら, そちら, あちら, どちら. The ら is an old suffix of vagueness, which is what makes the series polite: pointing at a general direction rather than straight at a thing.

どっち is the same word contracted, and it is casual for exactly that reason: the politeness lived in the length.'),
  ('One particle covers instrument, material and means of transport — all three answer "by what".', 'One particle covers instrument, material and means of transport; all three answer "by what".'),
  ('One particle sets the quantity: か is some, も with a negative is none, も with a positive is every — 何でも, anything at all.', 'One particle sets the quantity: か is some, も with a negative is none, も with a positive is every (何でも, anything at all).'),
  ('Only — and not enough.', 'Only, and not enough.'),
  ('Ought to be — expectation on grounds.', 'Ought to be: expectation on grounds.'),
  ('Ought to — a moral or logical should.', 'Ought to: a moral or logical should.'),
  ('Out of 1,000 yen — here''s 14 yen back and your receipt.', 'Out of 1,000 yen, here''s 14 yen back and your receipt.'),
  ('Out of 3,000 yen — here''s 500 yen back first.', 'Out of 3,000 yen, here''s 500 yen back first.'),
  ('Over — the thing being argued about.', 'Over: the thing being argued about.'),
  ('Past tense — that claims it is already done.', 'Past tense: that claims it is already done.'),
  ('Paying by PayPay — showing your barcode for the clerk to scan.', 'Paying by PayPay: showing your barcode for the clerk to scan.'),
  ('Per — how often.', 'Per: how often.'),
  ('Permission — "may I / it''s fine to".', 'Permission: "may I / it''s fine to".'),
  ('Phone numbers are read digit by digit, not as one big number — 090 is zero-kyuu-zero, not kyuujuu.', 'Phone numbers are read digit by digit, not as one big number: 090 is zero-kyuu-zero, not kyuujuu.'),
  ('Please — nice to meet you.', 'Please: nice to meet you.'),
  ('Polite negative request — "please don''t".', 'Polite negative request: "please don''t".'),
  ('Polite request — "please do X".', 'Polite request: "please do X".'),
  ('Praising your own gift is the opposite of the convention — you play it down, and they insist otherwise.', 'Praising your own gift is the opposite of the convention; you play it down, and they insist otherwise.'),
  ('Probably — a guess.', 'Probably: a guess.'),
  ('Read literally it points at something as a target: 高いのに買った sets the expensiveness up as the thing the buying was done against.

That is where the grievance lives. けれど merely joins two clauses, but のに names one as the mark the other failed to respect, so it always carries the speaker being put out. It is also why のに cannot be followed by a request or an intention — you cannot aim at an outcome and then propose one.', 'Read literally it points at something as a target: 高いのに買った sets the expensiveness up as the thing the buying was done against.

That is where the grievance lives. けれど merely joins two clauses, but のに names one as the mark the other failed to respect, so it always carries the speaker being put out. It is also why のに cannot be followed by a request or an intention: you cannot aim at an outcome and then propose one.'),
  ('Reported requests take ように, not と — 「来て」と言う quotes the words, 来るように言う reports the instruction without them.', 'Reported requests take ように, not と: 「来て」と言う quotes the words, 来るように言う reports the instruction without them.'),
  ('Reports without judging. The speaker takes no responsibility for whether it is true — which is exactly what distinguishes it from ようだ, where the speaker is drawing their own conclusion.', 'Reports without judging. The speaker takes no responsibility for whether it is true, which is exactly what distinguishes it from ようだ, where the speaker is drawing their own conclusion.'),
  ('Ring me or write to me — get in touch somehow.', 'Ring me or write to me: get in touch somehow.'),
  ('Room numbers are read digit by digit — san-zero-go, not the compound number sanbyakugo.', 'Room numbers are read digit by digit: san-zero-go, not the compound number sanbyakugo.'),
  ('Said to the person''s face it can sound condescending — it announces that you did them a favour. Japanese usually leaves the kindness unstated, or recasts it with もらう.', 'Said to the person''s face it can sound condescending; it announces that you did them a favour. Japanese usually leaves the kindness unstated, or recasts it with もらう.'),
  ('Same mistake on oishii — i-adjectives never take deshita.', 'Same mistake on oishii: i-adjectives never take deshita.'),
  ('Saying YOU will check takes over the job that is theirs to do — onegai shimasu leaves the action with them.', 'Saying YOU will check takes over the job that is theirs to do; onegai shimasu leaves the action with them.'),
  ('Seeking agreement — "isn''t it?"', 'Seeking agreement: "isn''t it?"'),
  ('Set phrases of formal speech: 光栄, 感激, 赤面. Not productive — the noun cannot be freely swapped.', 'Set phrases of formal speech: 光栄, 感激, 赤面. Not productive: the noun cannot be freely swapped.'),
  ('Six is a bit difficult — could you do between eight and nine instead?', 'Six is a bit difficult. Could you do between eight and nine instead?'),
  ('So that — for an outcome you cannot simply decide.', 'So that: for an outcome you cannot simply decide.'),
  ('Sorry, it''s come out a bit shorter than planned — is that alright?', 'Sorry, it''s come out a bit shorter than planned. Is that alright?'),
  ('Sorry, the train is delayed — I will be about twenty minutes late.', 'Sorry, the train is delayed. I will be about twenty minutes late.'),
  ('Stacking ni after made here is redundant — asking "until when" is itsu made desu ka.', 'Stacking ni after made here is redundant: asking "until when" is itsu made desu ka.'),
  ('Starting with — and then spreading.', 'Starting with, and then spreading.'),
  ('Starting with — as the leading example.', 'Starting with: as the leading example.'),
  ('Tacking kudasai onto a completed statement asks for nothing in particular — ijou de alone is the whole, standard closing answer.', 'Tacking kudasai onto a completed statement asks for nothing in particular; ijou de alone is the whole, standard closing answer.'),
  ('Taking your 1000 yen — first the larger amount, 300 yen back.', 'Taking your 1000 yen: first the larger amount, 300 yen back.'),
  ('Thanks. Oh, this has gone off a little — maybe we should throw it out.', 'Thanks. Oh, this has gone off a little. Maybe we should throw it out.'),
  ('That accepts the heating — but you don''t want it heated. Declining is exactly what iie, ii desu already does.', 'That accepts the heating, but you don''t want it heated. Declining is exactly what iie, ii desu already does.'),
  ('That answers thanks. Otsukaresama is a greeting, not thanks — it is returned, not accepted.', 'That answers thanks. Otsukaresama is a greeting, not thanks; it is returned, not accepted.'),
  ('That asks for it BEFORE seven — the opposite.', 'That asks for it BEFORE seven: the opposite.'),
  ('That asks them to help YOU — the opposite of an offer.', 'That asks them to help YOU: the opposite of an offer.'),
  ('That asks what rubbish IS. You want which category — nan-gomi.', 'That asks what rubbish IS. You want which category: nan-gomi.'),
  ('That asks where Kyoto goes. You want the platform, so ask about kyouto-yuki — the Kyoto-bound train.', 'That asks where Kyoto goes. You want the platform, so ask about kyouto-yuki, the Kyoto-bound train.'),
  ('That explains it — no wonder.', 'That explains it: no wonder.'),
  ('That is takeaway — the opposite of what you just agreed to.', 'That is takeaway: the opposite of what you just agreed to.'),
  ('That means "you are welcome" — it responds to thanks, it does not give thanks.', 'That means "you are welcome": it responds to thanks, it does not give thanks.'),
  ('That phrase is for leaving somewhere ahead of others — an office, a gathering. Not for the bath.', 'That phrase is for leaving somewhere ahead of others: an office, a gathering. Not for the bath.'),
  ('That says YOU will go in first, which you cannot — you are not there.', 'That says YOU will go in first, which you cannot; you are not there.'),
  ('That says the booking itself IS a mistake — the opposite of confirming it is right.', 'That says the booking itself IS a mistake: the opposite of confirming it is right.'),
  ('That says you are choosing not to go. ikenaku natta says something changed and now you cannot — which is what an apology needs.', 'That says you are choosing not to go. ikenaku natta says something changed and now you cannot, which is what an apology needs.'),
  ('That''s how it is — a general truth, or nostalgia.', 'That''s how it is: a general truth, or nostalgia.'),
  ('The "as soon as" use cannot take a past tense — it is always about something not yet done, which is why business Japanese uses it for promises.', 'The "as soon as" use cannot take a past tense; it is always about something not yet done, which is why business Japanese uses it for promises.'),
  ('The adjective carries the tense itself — 高かったです, never 高いでした. です adds politeness only.', 'The adjective carries the tense itself: 高かったです, never 高いでした. です adds politeness only.'),
  ('The basis must be something solid — data, law, evidence. For a mere starting point, 〜をもとに is the looser word.', 'The basis must be something solid: data, law, evidence. For a mere starting point, 〜をもとに is the looser word.'),
  ('The call is not over yet — the past arigatou gozaimashita belatedly closes it; arigatou gozaimasu fits mid-call thanks.', 'The call is not over yet. The past arigatou gozaimashita belatedly closes it; arigatou gozaimasu fits mid-call thanks.'),
  ('The card is not the thing being paid — the bill is. The card is the method, marked with de.', 'The card is not the thing being paid; the bill is. The card is the method, marked with de.'),
  ('The card is the means of paying, not the thing being paid — that takes de, not o.', 'The card is the means of paying, not the thing being paid; that takes de, not o.'),
  ('The card is the means of paying, not the thing being paid — the method takes de.', 'The card is the means of paying, not the thing being paid; the method takes de.'),
  ('The chain is けれども → けれど → けど. けれ is the old 已然形 ending of adjectives, the one in 寒けれ, and ども is an Old Japanese concessive meaning "even though"; the pair formed at the end of the Muromachi period and spread to other predicates, with けれど and けど following in Edo.

The length of the form tracks its formality precisely: けれども is the whole thing, けど is what survives casual speech. That is not an arbitrary register scale — it is literally how much of the original phrase you bothered to say.', 'The chain is けれども → けれど → けど. けれ is the old 已然形 ending of adjectives, the one in 寒けれ, and ども is an Old Japanese concessive meaning "even though"; the pair formed at the end of the Muromachi period and spread to other predicates, with けれど and けど following in Edo.

The length of the form tracks its formality precisely: けれども is the whole thing, けど is what survives casual speech. That is not an arbitrary register scale; it is literally how much of the original phrase you bothered to say.'),
  ('The chain is けれども → けれど → けど. けれ is the 已然形 (realis form) of the auxiliary けり, and ども is an Old Japanese concessive particle meaning "even though".

The length of the form tracks its formality precisely: けれども is the whole thing, けど is what survives casual speech. That is not an arbitrary register scale — it is literally how much of the original phrase you bothered to say.', 'The chain is けれども → けれど → けど. けれ is the 已然形 (realis form) of the auxiliary けり, and ども is an Old Japanese concessive particle meaning "even though".

The length of the form tracks its formality precisely: けれども is the whole thing, けど is what survives casual speech. That is not an arbitrary register scale; it is literally how much of the original phrase you bothered to say.'),
  ('The chain is て + あり → たり → た. It was originally a resultative — "having done X, and being in that state" — rather than a past tense.

That is why た still leans perfect in places where English would not use a past: 分かった for "I understand (now)", or the surprised あった when you find something. The form is telling you a state has been reached, not merely that time has passed.', 'The chain is て + あり → たり → た. It was originally a resultative ("having done X, and being in that state") rather than a past tense.

That is why た still leans perfect in places where English would not use a past: 分かった for "I understand (now)", or the surprised あった when you find something. The form is telling you a state has been reached, not merely that time has passed.'),
  ('The chain is です + う, spelled でせう before the kana reform. The plain だろう is the parallel formation on である — であらう — and the two are often run together, but they are built on different copulas.

The final う is the same volitional ending that gives 行こう, which is why でしょう guesses rather than states: the volitional was never about certainty. It marks the speaker projecting rather than reporting, covering both "probably" and the seeking-agreement 〜でしょう？ with no change of form.', 'The chain is です + う, spelled でせう before the kana reform. The plain だろう is the parallel formation on である (であらう), and the two are often run together, but they are built on different copulas.

The final う is the same volitional ending that gives 行こう, which is why でしょう guesses rather than states: the volitional was never about certainty. It marks the speaker projecting rather than reporting, covering both "probably" and the seeking-agreement 〜でしょう？ with no change of form.'),
  ('The character''s木 gives it away: it was used for thin pieces split from wood. Paper, plates, shirts and tickets are all the same flat shape.

Unlike 本 and 匹 it takes no sound changes at all — いちまい through じゅうまい, every one regular — which makes it the easiest counter in the language and the one worth learning first.', 'The character''s木 gives it away: it was used for thin pieces split from wood. Paper, plates, shirts and tickets are all the same flat shape.

Unlike 本 and 匹 it takes no sound changes at all (いちまい through じゅうまい, every one regular), which makes it the easiest counter in the language and the one worth learning first.'),
  ('The clause always comes BEFORE the noun and nothing marks the join — no "that", no "which". The subject inside it usually takes が rather than は.', 'The clause always comes BEFORE the noun and nothing marks the join: no "that", no "which". The subject inside it usually takes が rather than は.'),
  ('The clause before と stays plain even in a polite sentence — politeness belongs to the outer verb, not the quoted words.', 'The clause before と stays plain even in a polite sentence. Politeness belongs to the outer verb, not the quoted words.'),
  ('The comparison pattern is fixed as "no hou ga ii" — swapping in wa breaks the construction that means the ~ option is better.', 'The comparison pattern is fixed as "no hou ga ii". Swapping in wa breaks the construction that means the ~ option is better.'),
  ('The conditional -ba attaches to the e-row stem of a godan verb — oke-ba, not the plain dictionary form oku-ba.', 'The conditional -ba attaches to the e-row stem of a godan verb: oke-ba, not the plain dictionary form oku-ba.'),
  ('The conditional ba attaches to the e-stem, not the plain form — ikeba, not iku ba.', 'The conditional ba attaches to the e-stem, not the plain form: ikeba, not iku ba.'),
  ('The conversation is not over yet — gozaimashita closes something out, but you are still mid-visit here.', 'The conversation is not over yet; gozaimashita closes something out, but you are still mid-visit here.'),
  ('The copula chain runs にてあり → であり → である → だ. The polite です is generally derived from a contraction of であります or でございます, both of which are である plus a polite verb. This is why です behaves like a frozen block rather than a conjugating verb: it was already a contraction by the time it settled into the modern language.

The practical payoff: でした, ではありません and でございます stop looking like arbitrary forms and start looking like what they are — different points on the same chain.', 'The copula chain runs にてあり → であり → である → だ. The polite です is generally derived from a contraction of であります or でございます, both of which are である plus a polite verb. This is why です behaves like a frozen block rather than a conjugating verb: it was already a contraction by the time it settled into the modern language.

The practical payoff: でした, ではありません and でございます stop looking like arbitrary forms and start looking like what they are: different points on the same chain.'),
  ('The copula chain runs にてあり → であり → である → だ. The polite です is generally derived from a contraction of であります or でございます, both of which are である plus a polite verb. This is why です behaves like a frozen block rather than a conjugating verb: it was already a contraction by the time it settled into the modern language.

The practical payoff: でした, ではありません and でございます stop looking like arbitrary forms and start looking like what they are — different points on the same chain.

The chain is reconstructed rather than recorded, and specialists propose more than one route; treat it as the likeliest account rather than the settled one.', 'The copula chain runs にてあり → であり → である → だ. The polite です is generally derived from a contraction of であります or でございます, both of which are である plus a polite verb. This is why です behaves like a frozen block rather than a conjugating verb: it was already a contraction by the time it settled into the modern language.

The practical payoff: でした, ではありません and でございます stop looking like arbitrary forms and start looking like what they are: different points on the same chain.

The chain is reconstructed rather than recorded, and specialists propose more than one route; treat it as the likeliest account rather than the settled one.'),
  ('The decision is yours. ことになる is the passive twin: something was decided, possibly by you but reported as if not — which is why Japanese uses it for announcements even about one''s own choices.', 'The decision is yours. ことになる is the passive twin: something was decided, possibly by you but reported as if not, which is why Japanese uses it for announcements even about one''s own choices.'),
  ('The derivation is phonetic: なにと contracted to など. 等 is a kanji assigned to write the word later, not the morpheme it descends from — read as Sino-Japanese, 等 would be トウ.

What the original says is still what the particle does. A list trailing off into "and what else" is a list of samples, which is why など follows や so naturally. Worn down further it becomes なんか at N3, where the vagueness has curdled into dismissal.', 'The derivation is phonetic: なにと contracted to など. 等 is a kanji assigned to write the word later, not the morpheme it descends from; read as Sino-Japanese, 等 would be トウ.

What the original says is still what the particle does. A list trailing off into "and what else" is a list of samples, which is why など follows や so naturally. Worn down further it becomes なんか at N3, where the vagueness has curdled into dismissal.'),
  ('The dictionaries offer several accounts — an old noun of reason or interval, a formal noun, or the から of 人柄 and 家柄, a nature or stock. None has settled it.

What is not in doubt is that the two uses are one word. A journey from Tokyo and a decision from a reason are the same idea: the thing it started out of. That is why Japanese needs no separate word for "because" here, and why から sits after a noun or a whole clause without changing shape.', 'The dictionaries offer several accounts: an old noun of reason or interval, a formal noun, or the から of 人柄 and 家柄, a nature or stock. None has settled it.

What is not in doubt is that the two uses are one word. A journey from Tokyo and a decision from a reason are the same idea: the thing it started out of. That is why Japanese needs no separate word for "because" here, and why から sits after a noun or a whole clause without changing shape.'),
  ('The dictionary form (辞書形) is the verb as you would find it in a dictionary: 食べる, 書く, する. It always ends in a う-row syllable.

It is not only a citation form. It is a real, usable tense — the plain non-past — meaning both "eat" and "will eat" depending on context. 明日行く is a perfectly complete sentence meaning "I''ll go tomorrow"; it is simply casual where 行きます is polite.

Every drill in this app hands you the dictionary form and asks for something else, because that is the direction the language works in: 書く is the root, 書きます and 書いて and 書いた are all derived from it.', 'The dictionary form (辞書形) is the verb as you would find it in a dictionary: 食べる, 書く, する. It always ends in a う-row syllable.

It is not only a citation form. It is a real, usable tense (the plain non-past), meaning both "eat" and "will eat" depending on context. 明日行く is a perfectly complete sentence meaning "I''ll go tomorrow"; it is simply casual where 行きます is polite.

Every drill in this app hands you the dictionary form and asks for something else, because that is the direction the language works in: 書く is the root, 書きます and 書いて and 書いた are all derived from it.'),
  ('The four roots — こ (near speaker), そ (near listener), あ (distant from both), ど (interrogative) — are Old Japanese, and they take a small set of endings: -れ for a thing, -こ for a place, -の for a modifier, -んな for a kind.

Learning the grid is therefore not memorising sixteen words but four roots and four endings. The apparent irregularity of どれ/どこ/どの dissolves once the ど is recognised as the question root rather than a separate word.', 'The four roots, こ (near speaker), そ (near listener), あ (distant from both), ど (interrogative), are Old Japanese, and they take a small set of endings: -れ for a thing, -こ for a place, -の for a modifier, -んな for a kind.

Learning the grid is therefore not memorising sixteen words but four roots and four endings. The apparent irregularity of どれ/どこ/どの dissolves once the ど is recognised as the question root rather than a separate word.'),
  ('The full phrase means "whether thus or otherwise" — in any case, no matter what. Worn down to とても it kept that shrug, and とても行けない, "there is no way I can go", is the original construction and still current.

The positive とても寒い spread in Taishō and Shōwa. Akutagawa called it a 新流行 and said it was not Tokyo language; Tsubouchi called it 訛語. They lost, but the negative use never went anywhere, which is why とても〜ない reads as idiomatic rather than as a contradiction.', 'The full phrase means "whether thus or otherwise": in any case, no matter what. Worn down to とても it kept that shrug, and とても行けない, "there is no way I can go", is the original construction and still current.

The positive とても寒い spread in Taishō and Shōwa. Akutagawa called it a 新流行 and said it was not Tokyo language; Tsubouchi called it 訛語. They lost, but the negative use never went anywhere, which is why とても〜ない reads as idiomatic rather than as a contradiction.'),
  ('The habitual ている is the same form as the progressive — what differs is the verb and the sentence around it.', 'The habitual ている is the same form as the progressive; what differs is the verb and the sentence around it.'),
  ('The image is standing in the protection of a larger thing: originally a god or a benefactor, and the お is not decorative but part of the word.

That is why おかげで credits rather than merely explains, and why おかげさまで works as a set reply with nothing named at all — you are acknowledging shelter without saying whose. Its opposite せいで comes from a noun about blame, and the pair splits every cause in the language into helped and harmed.', 'The image is standing in the protection of a larger thing: originally a god or a benefactor, and the お is not decorative but part of the word.

That is why おかげで credits rather than merely explains, and why おかげさまで works as a set reply with nothing named at all; you are acknowledging shelter without saying whose. Its opposite せいで comes from a noun about blame, and the pair splits every cause in the language into helped and harmed.'),
  ('The independent verb still means combining — 大臣を兼ねる. The auxiliary shifted from juggling two things to failing to manage one, and it is already in the Man''yōshū: 忘れかねつ.

かねない is that auxiliary negated — not-unable — hence "might well". That is the whole reason two forms one syllable apart mean opposite things, and why you only say a bad thing is not impossible when you are worried about it.', 'The independent verb still means combining: 大臣を兼ねる. The auxiliary shifted from juggling two things to failing to manage one, and it is already in the Man''yōshū: 忘れかねつ.

かねない is that auxiliary negated (not-unable), hence "might well". That is the whole reason two forms one syllable apart mean opposite things, and why you only say a bad thing is not impossible when you are worried about it.'),
  ('The job has not changed in twelve hundred years: put の between two nouns and the first modifies the second. Old Japanese had other particles that did the same work — が among them, which is why 我が国 still reads as "my country" — and の is the one that stayed general.', 'The job has not changed in twelve hundred years: put の between two nouns and the first modifies the second. Old Japanese had other particles that did the same work (が among them, which is why 我が国 still reads as "my country"), and の is the one that stayed general.'),
  ('The kana is the clue. It is written ずくめ and not づくめ, which is itself a sign that lexicographers do not read it as a transparent 尽く; 三省堂国語辞典 derives it instead from 竦める, "to bind tight". Either way the sense is a thing filled out with one quality and no remainder.

Which is why it takes only a small set of nouns and describes a totality rather than a mess: 黒ずくめ, いいことずくめ, and 規則ずくめ — that last one showing the totality can oppress rather than please. だらけ is a scattering of something; ずくめ leaves no room for anything else.', 'The kana is the clue. It is written ずくめ and not づくめ, which is itself a sign that lexicographers do not read it as a transparent 尽く; 三省堂国語辞典 derives it instead from 竦める, "to bind tight". Either way the sense is a thing filled out with one quality and no remainder.

Which is why it takes only a small set of nouns and describes a totality rather than a mess: 黒ずくめ, いいことずくめ, and 規則ずくめ (that last one showing the totality can oppress rather than please). だらけ is a scattering of something; ずくめ leaves no room for anything else.'),
  ('The kanji spell out an act attributed to a source — one of the few cases at this level where the characters really are the origin. せい is the kanbun reading しょい worn down, in Early Modern speech, and naming a cause that way is naming who is answerable for it.

Which is why せいで is always blame and おかげで always credit, though both simply mean "because of". Japanese picks the noun according to how the outcome turned out, and using the wrong one is heard immediately.', 'The kanji spell out an act attributed to a source, one of the few cases at this level where the characters really are the origin. せい is the kanbun reading しょい worn down, in Early Modern speech, and naming a cause that way is naming who is answerable for it.

Which is why せいで is always blame and おかげで always credit, though both simply mean "because of". Japanese picks the noun according to how the outcome turned out, and using the wrong one is heard immediately.'),
  ('The light is the point where you turn, which pairs with o (magaru o) — ni would mark it as a destination you are heading toward instead.', 'The light is the point where you turn, which pairs with o (magaru o); ni would mark it as a destination you are heading toward instead.'),
  ('The list is representative, not exhaustive — it means "among other things". て-form chaining lists everything in order; たり deliberately does not.', 'The list is representative, not exhaustive; it means "among other things". て-form chaining lists everything in order; たり deliberately does not.'),
  ('The literal verb is still in use: 片付けて仕舞う, to tidy things away. It carries finishing and shutting in one action.

Both senses of the compound come straight out of that, and they are not two meanings but one. 食べてしまった is finished off completely; 忘れてしまった is regrettable — because a thing that has been put away and the shutters brought down is a thing you cannot get back at. The casual 〜ちゃう is a contraction of 〜てしまう, and 〜じゃう of 〜でしまう.', 'The literal verb is still in use: 片付けて仕舞う, to tidy things away. It carries finishing and shutting in one action.

Both senses of the compound come straight out of that, and they are not two meanings but one. 食べてしまった is finished off completely; 忘れてしまった is regrettable, because a thing that has been put away and the shutters brought down is a thing you cannot get back at. The casual 〜ちゃう is a contraction of 〜てしまう, and 〜じゃう of 〜でしまう.'),
  ('The meeting is still going — gozaimashita closes out something already finished.', 'The meeting is still going; gozaimashita closes out something already finished.'),
  ('The method you are paying with takes de. You are not handing the card over as a direct object here — o would need a verb like dasu.', 'The method you are paying with takes de. You are not handing the card over as a direct object here; o would need a verb like dasu.'),
  ('The mirror of お〜になる. Your act stays an act — nothing is softened about the doing — and the humility comes from the お, which frames the action as offered toward the person it touches.

That direction is the rule the pattern lives by: it only works for something done to or for somebody else. お待ちします is waiting for you; there is no honest お〜する for eating your own lunch, because there is nobody for the act to be pointed at.', 'The mirror of お〜になる. Your act stays an act (nothing is softened about the doing), and the humility comes from the お, which frames the action as offered toward the person it touches.

That direction is the rule the pattern lives by: it only works for something done to or for somebody else. お待ちします is waiting for you; there is no honest お〜する for eating your own lunch, because there is nobody for the act to be pointed at.'),
  ('The negative te-form of suru is shinai, and its te-form is shinaide, not shinaite — ki ni shinaide kudasai.', 'The negative te-form of suru is shinai, and its te-form is shinaide, not shinaite: ki ni shinaide kudasai.'),
  ('The noun survives in わがまま, "one''s own way", and in 気の向くまま. It names a condition nobody has altered.

That is why the resultative use takes た — 開けたまま names a state produced by a finished act, where English says "with the window open". The noun itself takes other states just as happily: 知らないまま, and the 気の向くまま above.', 'The noun survives in わがまま, "one''s own way", and in 気の向くまま. It names a condition nobody has altered.

That is why the resultative use takes た: 開けたまま names a state produced by a finished act, where English says "with the window open". The noun itself takes other states just as happily: 知らないまま, and the 気の向くまま above.'),
  ('The noun survives in わがまま, "one''s own way", and in 気の向くまま. It names a condition nobody has altered.

That is why まま takes the past tense in front of it — 窓を開けたまま — although English says "with the window open". Japanese names the state as something that was done and then left, so the verb has to be finished before the leaving can begin.', 'The noun survives in わがまま, "one''s own way", and in 気の向くまま. It names a condition nobody has altered.

That is why まま takes the past tense in front of it (窓を開けたまま), although English says "with the window open". Japanese names the state as something that was done and then left, so the verb has to be finished before the leaving can begin.'),
  ('The particle attaches to a plain clause and adds it to a case being built. 安いし、近いし says two things in support of a conclusion the speaker may never reach out loud.

That is why a single し sounds unfinished — one reason offered as though there were others — and why し so often ends a sentence with the rest left hanging. Its origin is not settled, but its job in the modern language is.', 'The particle attaches to a plain clause and adds it to a case being built. 安いし、近いし says two things in support of a conclusion the speaker may never reach out loud.

That is why a single し sounds unfinished (one reason offered as though there were others) and why し so often ends a sentence with the rest left hanging. Its origin is not settled, but its job in the modern language is.'),
  ('The particle is the same one in 私も and 一度も. It adds the sense of even, and nothing else has been added anywhere.

雨が降っても行く is therefore "even with it raining, I go" — the te-form supplies the linking, も supplies the concession. It also explains the question-word pattern 何を食べても, where も keeps its sweeping sense and takes the whole range at once.', 'The particle is the same one in 私も and 一度も. It adds the sense of even, and nothing else has been added anywhere.

雨が降っても行く is therefore "even with it raining, I go"; the te-form supplies the linking, も supplies the concession. It also explains the question-word pattern 何を食べても, where も keeps its sweeping sense and takes the whole range at once.'),
  ('The particle pairs the thought with the thinking of it. Japanese does not distinguish saying from thinking at the level of grammar — both take と and both take the plain form in front.

That is why politeness belongs outside: 行くと思います, never 行きますと思います. What you are reporting is the thought itself, and the thought was not phrased politely to yourself.', 'The particle pairs the thought with the thinking of it. Japanese does not distinguish saying from thinking at the level of grammar; both take と and both take the plain form in front.

That is why politeness belongs outside: 行くと思います, never 行きますと思います. What you are reporting is the thought itself, and the thought was not phrased politely to yourself.'),
  ('The past is already in yokatta — adding deshita doubles it.', 'The past is already in yokatta. Adding deshita doubles it.'),
  ('The past tense treats the exchange as already over, but the clerk is still bagging the item — the present arigatou gozaimasu fits an interaction still in progress.', 'The past tense treats the exchange as already over, but the clerk is still bagging the item. The present arigatou gozaimasu fits an interaction still in progress.'),
  ('The period comes first and the count second — isshuukan ni nankai, which is the reverse of English.', 'The period comes first and the count second: isshuukan ni nankai, which is the reverse of English.'),
  ('The plain noun for an upper surface. よく考えた上で is deciding while standing on the thinking already done.

Which is why the "after doing" sense takes た: you cannot stand on something not yet there. The dictionary form is a separate use — 日本語を学ぶ上で大切なこと is "in the course of", not "after".', 'The plain noun for an upper surface. よく考えた上で is deciding while standing on the thinking already done.

Which is why the "after doing" sense takes た: you cannot stand on something not yet there. The dictionary form is a separate use: 日本語を学ぶ上で大切なこと is "in the course of", not "after".'),
  ('The plain past だった came from であった. でした did not: it is built directly on です, which is why the two look less alike than their present forms do.

It is also the form ませんでした borrows, since ません cannot take a past itself — one small irregularity supplying another.', 'The plain past だった came from であった. でした did not: it is built directly on です, which is why the two look less alike than their present forms do.

It is also the form ませんでした borrows, since ません cannot take a past itself, one small irregularity supplying another.'),
  ('The polite copula — "is / am / are".', 'The polite copula: "is / am / are".'),
  ('The possessive "the water''s temperature" needs no linking the two nouns — stacking ga then wa without it breaks the sentence.', 'The possessive "the water''s temperature" needs no linking the two nouns; stacking ga then wa without it breaks the sentence.'),
  ('The prohibitive な is Old Japanese and attaches to the plain present: 行くな, "do not go". The gentle な is a contraction of なさい and attaches to the ます stem: 行きな, "go on then".

So 食べるな and 食べな are opposites separated by one syllable, and the syllable is not the な — it is what the な is stuck to. Reading the stem tells you which one you are looking at, and nothing else will.', 'The prohibitive な is Old Japanese and attaches to the plain present: 行くな, "do not go". The gentle な is a contraction of なさい and attaches to the ます stem: 行きな, "go on then".

So 食べるな and 食べな are opposites separated by one syllable, and the syllable is not the な; it is what the な is stuck to. Reading the stem tells you which one you are looking at, and nothing else will.'),
  ('The same adjective behind ない, なしに and なしには. なくして is the adverbial なく with the classical connective して — the same して as in にして, since なく plus て would only give なくて.

努力なくして成功はない demands the negative after it for the same reason なしには does: the absence has been set up as the thing the sentence is about, and only a denial completes it.', 'The same adjective behind ない, なしに and なしには. なくして is the adverbial なく with the classical connective して (the same して as in にして), since なく plus て would only give なくて.

努力なくして成功はない demands the negative after it for the same reason なしには does: the absence has been set up as the thing the sentence is about, and only a denial completes it.'),
  ('The same construction as といっても with the verb of saying left out entirely. What remains concedes a point and then declines to be moved by it.

子供とて許されない: even granting it is a child. It is worth keeping apart from とても, which is a different word entirely and far commoner — the resemblance is accidental and catches readers out.', 'The same construction as といっても with the verb of saying left out entirely. What remains concedes a point and then declines to be moved by it.

子供とて許されない: even granting it is a child. It is worth keeping apart from とても, which is a different word entirely and far commoner; the resemblance is accidental and catches readers out.'),
  ('The same construction as といっても with the verb of saying left out entirely. What remains concedes a point and then declines to be moved by it.

子供とて許されない: even granting it is a child. とても is the same とて with も — 「とてもかくても」, "whichever way", which is why it began life carrying negatives. The kinship is real, but the modern meaning has drifted so far that it is invisible.', 'The same construction as といっても with the verb of saying left out entirely. What remains concedes a point and then declines to be moved by it.

子供とて許されない: even granting it is a child. とても is the same とて with も: 「とてもかくても」, "whichever way", which is why it began life carrying negatives. The kinship is real, but the modern meaning has drifted so far that it is invisible.'),
  ('The same verb as in 食べかけ and 言いかける. Here what is suspended is a stretch: 月曜から水曜にかけて hangs the period between the two days named.

Unlike から〜まで, which draws hard edges, にかけて never did — its boundaries are approximate, which is why it suits weather, seasons and regions rather than timetables.', 'The same verb as in 食べかけ and 言いかける. Here what is suspended is a stretch: 月曜から水曜にかけて hangs the period between the two days named.

Unlike から〜まで, which draws hard edges, にかけて never did; its boundaries are approximate, which is why it suits weather, seasons and regions rather than timetables.'),
  ('The same する that pairs with なる everywhere else in Japanese, here acting on こと, "a matter". You make the matter the case, so the decision is yours.

Set against ことになる it is the whole grammar of agency in two verbs, exactly as ようにする sits against ようになる. And ことにしている — the ている that holds a state in force, not the progressive one — is a decision kept up, which is how Japanese says "I make a policy of".', 'The same する that pairs with なる everywhere else in Japanese, here acting on こと, "a matter". You make the matter the case, so the decision is yours.

Set against ことになる it is the whole grammar of agency in two verbs, exactly as ようにする sits against ようになる. And ことにしている (the ている that holds a state in force, not the progressive one) is a decision kept up, which is how Japanese says "I make a policy of".'),
  ('The same する that pairs with なる everywhere else in Japanese, here acting on こと, "a matter". You make the matter the case, so the decision is yours.

Set against ことになる it is the whole grammar of agency in two verbs, exactly as ようにする sits against ようになる. And ことにしている, the progressive, is a decision kept up — which is how Japanese says "I make a policy of".', 'The same する that pairs with なる everywhere else in Japanese, here acting on こと, "a matter". You make the matter the case, so the decision is yours.

Set against ことになる it is the whole grammar of agency in two verbs, exactly as ようにする sits against ようになる. And ことにしている, the progressive, is a decision kept up, which is how Japanese says "I make a policy of".'),
  ('The same そ as それ and そこ, in an adverbial form: そう means "like that". そうです is "it is that way", and そうですか asks whether it is.

The same 然 gives 然し, "but", and the そう of そうだ hearsay. What varies is only what is being called that way — a fact, a report, or an appearance.', 'The same そ as それ and そこ, in an adverbial form: そう means "like that". そうです is "it is that way", and そうですか asks whether it is.

The same 然 gives 然し, "but", and the そう of そうだ hearsay. What varies is only what is being called that way: a fact, a report, or an appearance.'),
  ('The same なう as in 損なう and 商う. 伴 is a kanji fitted to it afterwards; the ハン of 同伴 and 伴奏 is the unrelated Chinese reading of that character.

に伴って sets two changes travelling in company. It sits with につれて and にしたがって as three ways of pairing change, each from a different image — 連れる leads along, 従う follows, 伴う merely accompanies — and 伴う is the most neutral, which is why it suits reports and statistics.', 'The same なう as in 損なう and 商う. 伴 is a kanji fitted to it afterwards; the ハン of 同伴 and 伴奏 is the unrelated Chinese reading of that character.

に伴って sets two changes travelling in company. It sits with につれて and にしたがって as three ways of pairing change, each from a different image (連れる leads along, 従う follows, 伴う merely accompanies), and 伴う is the most neutral, which is why it suits reports and statistics.'),
  ('The same なる as in なければならない at N5, and the same construction seen from the other end. There the negative was on the condition; here it is on the act.

ては sets the doing up as a topic and なる refuses it. That is why the pattern is impersonal and heavy — it says the thing does not work rather than that you are forbidden — and why it belongs to rules and notices.', 'The same なる as in なければならない at N5, and the same construction seen from the other end. There the negative was on the condition; here it is on the act.

ては sets the doing up as a topic and なる refuses it. That is why the pattern is impersonal and heavy (it says the thing does not work rather than that you are forbidden) and why it belongs to rules and notices.'),
  ('The same 予 as in 予約 and 予習. What makes 予定 different from つもり is in those characters: something has been fixed, by a timetable or by someone else, rather than intended by you.

Which is why 予定 takes の after a noun and behaves as the plain noun it is — 会議の予定 — and why it sounds odd for a private wish that nobody has arranged.', 'The same 予 as in 予約 and 予習. What makes 予定 different from つもり is in those characters: something has been fixed, by a timetable or by someone else, rather than intended by you.

Which is why 予定 takes の after a noun and behaves as the plain noun it is (会議の予定), and why it sounds odd for a private wish that nobody has arranged.'),
  ('The same 分 as 分ける and 部分. To understand something is to have it separated out from what it is not, which is why the verb is intransitive: the thing does the separating, in your mind.

And that is why it takes が rather than を. 日本語が分かる is "Japanese comes apart for me" — there is no object to mark, and 日本語を分かる is wrong for a structural reason rather than a stylistic one.', 'The same 分 as 分ける and 部分. To understand something is to have it separated out from what it is not, which is why the verb is intransitive: the thing does the separating, in your mind.

And that is why it takes が rather than を. 日本語が分かる is "Japanese comes apart for me"; there is no object to mark, and 日本語を分かる is wrong for a structural reason rather than a stylistic one.'),
  ('The same 限る. 本日に限り says today is the edge and nothing outside it counts.

That is why it belongs to notices and offers — 学生に限り半額 — where the point is exactly where the line falls. 〜に限る, the other form, means something else entirely: 夏はビールに限る, "nothing beats", which is the limit read as the only thing worth having.', 'The same 限る. 本日に限り says today is the edge and nothing outside it counts.

That is why it belongs to notices and offers (学生に限り半額), where the point is exactly where the line falls. 〜に限る, the other form, means something else entirely: 夏はビールに限る, "nothing beats", which is the limit read as the only thing worth having.'),
  ('The second Saturday — what date would that be next month?', 'The second Saturday. What date would that be next month?'),
  ('The set phrase is ki o tsukeru — ki ga tsuku means to notice something, a different idiom entirely.', 'The set phrase is ki o tsukeru; ki ga tsuku means to notice something, a different idiom entirely.'),
  ('The shared kanji 難 is spelling, not shared origin. がたし meant difficult; the suffix にくい comes from 憎い, "disagreeable", extended to "hard to" — dictionaries gloss it 《難い・悪い》 and trace it to 憎む.

The division of labour follows: にくい is physical awkwardness (読みにくい字), がたい is difficulty in bringing yourself to it (信じがたい, 忘れがたい), and がたい keeps to written and emotional contexts because 難し is the older, stiffer word. 難い in ありがたい — hard to exist, therefore precious — is where ありがとう comes from.', 'The shared kanji 難 is spelling, not shared origin. がたし meant difficult; the suffix にくい comes from 憎い, "disagreeable", extended to "hard to"; dictionaries gloss it 《難い・悪い》 and trace it to 憎む.

The division of labour follows: にくい is physical awkwardness (読みにくい字), がたい is difficulty in bringing yourself to it (信じがたい, 忘れがたい), and がたい keeps to written and emotional contexts because 難し is the older, stiffer word. 難い in ありがたい (hard to exist, therefore precious) is where ありがとう comes from.'),
  ('The stiff shape is what marks the register: いえ is not modern Japanese, which is why とはいえ belongs to writing and speeches where といっても would do in conversation.

The は is the same topic-marking は that softens everywhere else. It takes the said thing, sets it up as the topic, and then concedes it — that said.', 'The stiff shape is what marks the register: いえ is not modern Japanese, which is why とはいえ belongs to writing and speeches where といっても would do in conversation.

The は is the same topic-marking は that softens everywhere else. It takes the said thing, sets it up as the topic, and then concedes it: that said.'),
  ('The thing that tends to happen is the thing that wins out. 病気がち is illness prevailing more often than not.

The negative colouring follows from that: what prevails over you is not usually welcome, which is why 忘れがち and 遅れがち are natural and 元気がち is not. Compare 気味, which is a touch of something, and っぽい, which is a resemblance — three suffixes, three quite different pictures.', 'The thing that tends to happen is the thing that wins out. 病気がち is illness prevailing more often than not.

The negative colouring follows from that: what prevails over you is not usually welcome, which is why 忘れがち and 遅れがち are natural and 元気がち is not. Compare 気味, which is a touch of something, and っぽい, which is a resemblance: three suffixes, three quite different pictures.'),
  ('The time frame "per month" is a ni-marked adverbial, not the subject — tsuki ni, not tsuki ga.', 'The time frame "per month" is a ni-marked adverbial, not the subject: tsuki ni, not tsuki ga.'),
  ('The topic of discussion. に関して is its formal twin and slightly broader — について narrows to the subject itself, に関して admits anything related.', 'The topic of discussion. に関して is its formal twin and slightly broader; について narrows to the subject itself, に関して admits anything related.'),
  ('The trap is that 〜いる and 〜える do not guarantee ichidan. 帰る, 入る, 走る and 切る all look ichidan and are godan. There is no rule that catches them — they are a short list you meet one at a time, and every learner conjugates 帰る wrongly at least once.', 'The trap is that 〜いる and 〜える do not guarantee ichidan. 帰る, 入る, 走る and 切る all look ichidan and are godan. There is no rule that catches them; they are a short list you meet one at a time, and every learner conjugates 帰る wrongly at least once.'),
  ('The two verbs of motion, doing in time what they do in space. 来る arrives where the speaker is; 行く departs from there.

Set the anchor at the present moment and the whole pattern falls out. 増えてきた is an increase that has travelled up to now, so it looks back; 増えていく carries on past now, so it looks forward. It is also why 〜てくる so often covers a beginning — the movement had to start somewhere behind you to have reached here.', 'The two verbs of motion, doing in time what they do in space. 来る arrives where the speaker is; 行く departs from there.

Set the anchor at the present moment and the whole pattern falls out. 増えてきた is an increase that has travelled up to now, so it looks back; 増えていく carries on past now, so it looks forward. It is also why 〜てくる so often covers a beginning; the movement had to start somewhere behind you to have reached here.'),
  ('The unconjugated verb — how it is listed, and the base every other form is built from.', 'The unconjugated verb: how it is listed, and the base every other form is built from.'),
  ('The verb in 当たり前 and くじに当たる. に当たって marks the point of impact between a person and an occasion.

That is why it takes significant beginnings — 開会に当たって, 就職に当たって — and not routine ones. Something has to be substantial enough to strike against.', 'The verb in 当たり前 and くじに当たる. に当たって marks the point of impact between a person and an occasion.

That is why it takes significant beginnings (開会に当たって, 就職に当たって) and not routine ones. Something has to be substantial enough to strike against.'),
  ('The verb is kin to 塗る, to paint or spread. What is まみれ has had something spread over its surface.

Which is why it takes only liquids, dust and grime — 血まみれ, 泥まみれ — and always on the outside. だらけ can hold anything and anywhere, including mistakes; まみれ needs something that could actually coat a thing.', 'The verb is kin to 塗る, to paint or spread. What is まみれ has had something spread over its surface.

Which is why it takes only liquids, dust and grime (血まみれ, 泥まみれ), and always on the outside. だらけ can hold anything and anywhere, including mistakes; まみれ needs something that could actually coat a thing.'),
  ('The か of a question, attached to 何 rather than to a sentence: the "what" is left open, so it names something without knowing it. 誰か, どこか and いつか are the same move.

With も instead, the range is swept rather than left open — 何も with a negative gives "nothing". か opens one slot; も takes them all.', 'The か of a question, attached to 何 rather than to a sentence: the "what" is left open, so it names something without knowing it. 誰か, どこか and いつか are the same move.

With も instead, the range is swept rather than left open; 何も with a negative gives "nothing". か opens one slot; も takes them all.'),
  ('The が in がゆえに is the classical GENITIVE — the が taught at N5 as an old "of".', 'The が in がゆえに is the classical GENITIVE: the が taught at N5 as an old "of".'),
  ('The が is a classical genitive, not the modern subject marker — which is why it can sit where modern grammar would not allow it.', 'The が is a classical genitive, not the modern subject marker, which is why it can sit where modern grammar would not allow it.'),
  ('The けれ is the one in 寒けれ, not the auxiliary けり. It joined ども — Old Japanese for "even though" — at the end of the Muromachi period and then generalised to other predicates; けれど and けど follow in the Edo period.

That ども is the same particle inside といえども at N1. The length tracks the formality exactly: けれども is the whole phrase, けど is what survives casual speech, which is a measure of how much of it you bothered to say.', 'The けれ is the one in 寒けれ, not the auxiliary けり. It joined ども, Old Japanese for "even though", at the end of the Muromachi period and then generalised to other predicates; けれど and けど follow in the Edo period.

That ども is the same particle inside といえども at N1. The length tracks the formality exactly: けれども is the whole phrase, けど is what survives casual speech, which is a measure of how much of it you bothered to say.'),
  ('The で of means is the same で as the で of place — one particle, not two.', 'The で of means is the same で as the で of place: one particle, not two.'),
  ('The でした is doing the past, not ません — which is why the plain equivalent is なかった and not ないでした.', 'The でした is doing the past, not ません, which is why the plain equivalent is なかった and not ないでした.'),
  ('The なら is the 未然形 of the copula なり, not the verb なる. Classical ほかならず said outright "is nothing other than", which is exactly the modern meaning — nothing has shifted.

Which is why it is emphatic identification rather than a hedge: 努力の結果にほかならない insists there is no other account. It is worth keeping apart from なければならない, whose ならない really is なる.', 'The なら is the 未然形 of the copula なり, not the verb なる. Classical ほかならず said outright "is nothing other than", which is exactly the modern meaning; nothing has shifted.

Which is why it is emphatic identification rather than a hedge: 努力の結果にほかならない insists there is no other account. It is worth keeping apart from なければならない, whose ならない really is なる.'),
  ('The に of 週に三回 is the same に that marks a point — it names the frame the count sits in.', 'The に of 週に三回 is the same に that marks a point: it names the frame the count sits in.'),
  ('The の is the listing の of 行くの行かないの, holding each item at arm''s length rather than saying it straight. 暑いだの寒いだの quotes the complaints instead of making them.

That distance is the irritation, and it need not be aimed outward — 掃除だの洗濯だので一日つぶれた grumbles about your own day. What だの will not do is sit in a neutral list where と or や would serve.', 'The の is the listing の of 行くの行かないの, holding each item at arm''s length rather than saying it straight. 暑いだの寒いだの quotes the complaints instead of making them.

That distance is the irritation, and it need not be aimed outward: 掃除だの洗濯だので一日つぶれた grumbles about your own day. What だの will not do is sit in a neutral list where と or や would serve.'),
  ('The は-row was pronounced with /p/ in Old Japanese, weakened to /ɸ/, and then to /h/ — except word-internally and for this particle, where it became /w/. The spelling was fixed by tradition and never caught up.

So は-as-wa is not an exception invented to confuse learners. It is a fossil: the writing preserves an older pronunciation, and the same shift explains why the particle へ is pronounced え.', 'The は-row was pronounced with /p/ in Old Japanese, weakened to /ɸ/, and then to /h/, except word-internally and for this particle, where it became /w/. The spelling was fixed by tradition and never caught up.

So は-as-wa is not an exception invented to confuse learners. It is a fossil: the writing preserves an older pronunciation, and the same shift explains why the particle へ is pronounced え.'),
  ('The 位 of 一位 and 位置 — a place on a scale. Put after a quantity it gives the approximate reading, because naming a grade is vaguer than naming a number.

The belittling use is the same scale pointed downward. 掃除くらいしなさい says cleaning ranks that low, so there is no excuse — the dismissiveness is the noun doing its ordinary job.', 'The 位 of 一位 and 位置: a place on a scale. Put after a quantity it gives the approximate reading, because naming a grade is vaguer than naming a number.

The belittling use is the same scale pointed downward. 掃除くらいしなさい says cleaning ranks that low, so there is no excuse: the dismissiveness is the noun doing its ordinary job.'),
  ('The 位 of 一位 and 位置. Naming a grade rather than a figure is what makes 三時間ぐらい approximate.

It is the same word that grows into the belittling くらい at N3 — 掃除くらいしなさい, ranking the chore that low. And it differs from ごろ, which is 頃, a point in time: ぐらい measures a quantity, ごろ locates a moment.', 'The 位 of 一位 and 位置. Naming a grade rather than a figure is what makes 三時間ぐらい approximate.

It is the same word that grows into the belittling くらい at N3: 掃除くらいしなさい, ranking the chore that low. And it differs from ごろ, which is 頃, a point in time: ぐらい measures a quantity, ごろ locates a moment.'),
  ('The 基 of 基本 and 基礎, with the 付く of について. Something is fastened to a footing.

That is why に基づいて demands a real authority to rest on — 法律, データ, 事実 — and sounds wrong on a vague impression. The base has to be solid enough to attach to.', 'The 基 of 基本 and 基礎, with the 付く of について. Something is fastened to a footing.

That is why に基づいて demands a real authority to rest on (法律, データ, 事実) and sounds wrong on a vague impression. The base has to be solid enough to attach to.'),
  ('The 基 of 基本 and 基礎, with the 付く of について. Something is fastened to a footing.

に基づいて belongs to formal writing and typically cites something firm as its footing — 法律, データ, 事実 — though 経験に基づく勘 shows the base need not be documentary.', 'The 基 of 基本 and 基礎, with the 付く of について. Something is fastened to a footing.

に基づいて belongs to formal writing and typically cites something firm as its footing (法律, データ, 事実), though 経験に基づく勘 shows the base need not be documentary.'),
  ('The 本 of 日本 and 本当 is a root or a foundation, not a book. A trunk is the base a tree grows from, and the counter spread from trunks to everything long and slender.

Which is why it now counts pens, bottles, umbrellas and roads, and then stretches to telephone calls, films and home runs — things with length in time rather than space. The sound changes are worth learning as a set: いっぽん, さんぼん, ろっぽん.', 'The 本 of 日本 and 本当 is a root or a foundation, not a book. A trunk is the base a tree grows from, and the counter spread from trunks to everything long and slender.

Which is why it now counts pens, bottles, umbrellas and roads, and then stretches to telephone calls, films and home runs, things with length in time rather than space. The sound changes are worth learning as a set: いっぽん, さんぼん, ろっぽん.'),
  ('The 様 of ようだ with に and a verb of saying. What is quoted is not the sentence spoken but the way things were to be — which is why the verb in front stays plain and no quotation marks are implied.

It is how Japanese gives indirect commands without the imperative: 静かにするように言った reports that quiet was asked for, without repeating however bluntly it was put.', 'The 様 of ようだ with に and a verb of saying. What is quoted is not the sentence spoken but the way things were to be, which is why the verb in front stays plain and no quotation marks are implied.

It is how Japanese gives indirect commands without the imperative: 静かにするように言った reports that quiet was asked for, without repeating however bluntly it was put.'),
  ('The 連体形 was the classical form for standing before a noun, and when it merged with the sentence-ending form the modifying ability came along. 昨日買った本 is "yesterday-bought book" with no "that" or "which" anywhere.

The clause comes before the noun because every modifier in Japanese does — the same order as 赤い本 and 私の本. And が rather than は marks the subject inside it: は belongs to the sentence as a whole, and a modifying clause is not one.', 'The 連体形 was the classical form for standing before a noun, and when it merged with the sentence-ending form the modifying ability came along. 昨日買った本 is "yesterday-bought book" with no "that" or "which" anywhere.

The clause comes before the noun because every modifier in Japanese does, the same order as 赤い本 and 私の本. And が rather than は marks the subject inside it: は belongs to the sentence as a whole, and a modifying clause is not one.'),
  ('There are times when — occasional occurrence.', 'There are times when, occasional occurrence.'),
  ('There is no verb here for o to attach to — asking whether something IS straight ahead needs wa, marking sonoato as the topic.', 'There is no verb here for o to attach to; asking whether something IS straight ahead needs wa, marking sonoato as the topic.'),
  ('These are compound verbs, not auxiliaries — the pair behaves as a single verb and conjugates on the second half. 出す is a fourth: 降り出す, rain starting suddenly.', 'These are compound verbs, not auxiliaries: the pair behaves as a single verb and conjugates on the second half. 出す is a fourth: 降り出す, rain starting suddenly.'),
  ('These demand a negative verb. か is some, も is none — one particle decides the quantity.', 'These demand a negative verb. か is some, も is none; one particle decides the quantity.'),
  ('They are two registers of one copula, so only one can appear. Plain だ or polite です — never both.', 'They are two registers of one copula, so only one can appear. Plain だ or polite です, never both.'),
  ('They are 今日は and 今晩は — "as for today", "as for this evening" — with the rest dropped. The full form ran on to ask after the person''s day.

That is why they are spelled with は and said with わ: it is the topic particle, frozen mid-sentence. おはよう is the same kind of fragment, from お早く, "it is early of you", which is why the polite ございます can still be added.', 'They are 今日は and 今晩は ("as for today", "as for this evening") with the rest dropped. The full form ran on to ask after the person''s day.

That is why they are spelled with は and said with わ: it is the topic particle, frozen mid-sentence. おはよう is the same kind of fragment, from お早く, "it is early of you", which is why the polite ございます can still be added.'),
  ('They pair by tense: もう with the past for "already", まだ with ていません for "not yet". まだ食べません means something else entirely — a refusal.', 'They pair by tense: もう with the past for "already", まだ with ていません for "not yet". まだ食べません means something else entirely: a refusal.'),
  ('Things like — a casual list.', 'Things like, a casual list.'),
  ('Things like — usually dismissive.', 'Things like, usually dismissive.'),
  ('This and that — with irritation.', 'This and that, with irritation.'),
  ('This drops the conditional entirely — "if split in half" needs da to, not a bare wa.', 'This drops the conditional entirely; "if split in half" needs da to, not a bare wa.'),
  ('This one — the barcode won''t scan.', 'This one. The barcode won''t scan.'),
  ('This つ is the Old Japanese perfective auxiliary — the same つ that became the て of the te-form.', 'This つ is the Old Japanese perfective auxiliary: the same つ that became the て of the te-form.'),
  ('This なり is the classical particle of selection — take this one or that one.', 'This なり is the classical particle of selection: take this one or that one.'),
  ('This なり is the copula used disjunctively — "be it this, be it that".', 'This なり is the copula used disjunctively: "be it this, be it that".'),
  ('To Tokyo Station — about thirty minutes.', 'To Tokyo Station, about thirty minutes.'),
  ('To the extent that — or the more, the more.', 'To the extent that, or the more, the more.'),
  ('To think that — surprise or indignation.', 'To think that, surprise or indignation.'),
  ('Too hot, too cold — nothing but complaints.', 'Too hot, too cold: nothing but complaints.'),
  ('Too plain a greeting for entering a doctor''s exam room — shitsurei shimasu is the set phrase.', 'Too plain a greeting for entering a doctor''s exam room: shitsurei shimasu is the set phrase.'),
  ('True but unhelpful — it states a problem without asking for anything.', 'True but unhelpful: it states a problem without asking for anything.'),
  ('Two different routes to the same shrug. なんか reaches for "what" instead of naming the thing; なんて comes from など plus と, so it reaches for "or some such" — the belittling in it is the など of N5, not the question word.

Either way the tone is built in rather than added, which is why neither can be used politely about a listener''s things. 私なんか, turned on yourself, is self-deprecation for exactly the same reason.', 'Two different routes to the same shrug. なんか reaches for "what" instead of naming the thing; なんて comes from など plus と, so it reaches for "or some such": the belittling in it is the など of N5, not the question word.

Either way the tone is built in rather than added, which is why neither can be used politely about a listener''s things. 私なんか, turned on yourself, is self-deprecation for exactly the same reason.'),
  ('Um, excuse me — I want to get to City Hall. Is this the right stop?', 'Um, excuse me. I want to get to City Hall. Is this the right stop?'),
  ('Understandable, but de marks the means — sending BY air. o would make the airmail itself the thing you are requesting.', 'Understandable, but de marks the means: sending BY air. o would make the airmail itself the thing you are requesting.'),
  ('Understandable, but declining an extra service and settling on the base one is de ii or de daijoubu — ga loses that "this is enough" nuance.', 'Understandable, but declining an extra service and settling on the base one is de ii or de daijoubu; ga loses that "this is enough" nuance.'),
  ('Understandable, but kudasai asks for an object handed over. For a service — settling up — onegaishimasu is what is said.', 'Understandable, but kudasai asks for an object handed over. For a service (settling up), onegaishimasu is what is said.'),
  ('Understandable, but te-okimasu is the form for doing something now for later — which is exactly what putting food away is.', 'Understandable, but te-okimasu is the form for doing something now for later, which is exactly what putting food away is.'),
  ('Understood. I can arrange 8:30 — does that work?', 'Understood. I can arrange 8:30. Does that work?'),
  ('Unlike だらけ it is not negative — it simply says everything was of one kind, and often that is a good thing.', 'Unlike だらけ it is not negative; it simply says everything was of one kind, and often that is a good thing.'),
  ('What about the fringe — leave it as is?', 'What about the fringe? Leave it as is?'),
  ('What you are asking about — the date — is the topic here, so it takes wa: raigetsu wa.', 'What you are asking about, the date, is the topic here, so it takes wa: raigetsu wa.'),
  ('When — the time at which something happens.', 'When: the time at which something happens.'),
  ('Whenever A, B follows — an automatic result.', 'Whenever A, B follows: an automatic result.'),
  ('Where と pairs exhaustively, や names examples and leaves the rest unsaid. 本や雑誌 is books, magazines, and whatever else.

The openness is why や attracts など at the end, and why it grows into やら at N2 — a doubly vague list for a mess nobody is counting. Choosing between と and や is choosing whether the list is complete.', 'Where と pairs exhaustively, や names examples and leaves the rest unsaid. 本や雑誌 is books, magazines, and whatever else.

The openness is why や attracts など at the end, and why it grows into やら at N2: a doubly vague list for a mess nobody is counting. Choosing between と and や is choosing whether the list is complete.'),
  ('Where どころか rejects a description, どころではない rejects the occasion. 勉強どころではない says circumstances leave no space for studying.

Both are the noun 所 doing what it does at N4 — locating a moment as a place — and the negation lands differently only because of what is being denied a location.', 'Where どころか rejects a description, どころではない rejects the occasion. 勉強どころではない says circumstances leave no space for studying.

Both are the noun 所 doing what it does at N4, locating a moment as a place, and the negation lands differently only because of what is being denied a location.'),
  ('Whether that け is the Chinese loan 気 or a native noun the character was fitted to is not settled. What it does is not in doubt: it reports an appearance, and 悲しげ is a sad air about someone. The げ-adjectives are characteristic of Heian prose — うつくしげ, 心細げ.

So げ, 気味 and そう all describe outward signs, differing in register and reach. げ is literary and works on emotions; 気味 is a trace, usually unwelcome; そう is the plain spoken one. All three exist because Japanese will not let you assert another person''s feelings flatly.', 'Whether that け is the Chinese loan 気 or a native noun the character was fitted to is not settled. What it does is not in doubt: it reports an appearance, and 悲しげ is a sad air about someone. The げ-adjectives are characteristic of Heian prose: うつくしげ, 心細げ.

So げ, 気味 and そう all describe outward signs, differing in register and reach. げ is literary and works on emotions; 気味 is a trace, usually unwelcome; そう is the plain spoken one. All three exist because Japanese will not let you assert another person''s feelings flatly.'),
  ('Whether — or.', 'Whether... or.'),
  ('Which reading you get depends on the verb, not on ている. This is the single most common source of confusion at N5 — 知っている means "know", never "am knowing".', 'Which reading you get depends on the verb, not on ている. This is the single most common source of confusion at N5: 知っている means "know", never "am knowing".'),
  ('While — during a window.', 'While: during a window.'),
  ('While — the written ながら.', 'While: the written ながら.'),
  ('Written in kana rather than as 見る precisely because it has stopped being about the eyes, but the meaning is unchanged: perform the action and then look at the result.

Hence the limit that catches people out. 〜てみる needs an action you could choose to take and then inspect, so 食べてみる and 聞いてみる work while 分かってみる does not — there is nothing to look at afterwards that you decided to do.', 'Written in kana rather than as 見る precisely because it has stopped being about the eyes, but the meaning is unchanged: perform the action and then look at the result.

Hence the limit that catches people out. 〜てみる needs an action you could choose to take and then inspect, so 食べてみる and 聞いてみる work while 分かってみる does not; there is nothing to look at afterwards that you decided to do.'),
  ('Yes please — a small one is fine.', 'Yes please, a small one is fine.'),
  ('Yes — hold this receipt''s barcode up to it, then choose your payment method.', 'Yes. Hold this receipt''s barcode up to it, then choose your payment method.'),
  ('Yes, 200 yen a time. There is also a trial lesson available — would you like one?', 'Yes, 200 yen a time. There is also a trial lesson available. Would you like one?'),
  ('Yes. (scans it — "PayPay!") Payment complete.', 'Yes. (scans it: "PayPay!") Payment complete.'),
  ('Yes. You don''t need the seal today though — a signature is fine.', 'Yes. You don''t need the seal today though. A signature is fine.'),
  ('You are agreeing to a way of proceeding, not asking for "that" as a thing — the basis you are agreeing on takes de.', 'You are agreeing to a way of proceeding, not asking for "that" as a thing; the basis you are agreeing on takes de.'),
  ('You are asking about right now, so the present daijoubu desu ka — deshita puts the question in the past.', 'You are asking about right now, so the present daijoubu desu ka; deshita puts the question in the past.'),
  ('You are linking the room and your name — the connector is no, not ga.', 'You are linking the room and your name: the connector is no, not ga.'),
  ('You are listing your own details in turn — each one is a topic marked by wa, not ga.', 'You are listing your own details in turn: each one is a topic marked by wa, not ga.'),
  ('You are standing here right now on your first visit — deshita puts it in the past as though it already ended.', 'You are standing here right now on your first visit; deshita puts it in the past as though it already ended.'),
  ('You are stating your own address as the requested info — topic marker wa fits, not ga.', 'You are stating your own address as the requested info: topic marker wa fits, not ga.'),
  ('You do not add san to your own colleague when speaking to an outsider — inside the company they are just Sato.', 'You do not add san to your own colleague when speaking to an outsider; inside the company they are just Sato.'),
  ('You have not been there — deshita asks about a past experience. Proposing it now is dou desu ka.', 'You have not been there; deshita asks about a past experience. Proposing it now is dou desu ka.'),
  ('You have not tasted it yet — this is the moment for itadakimasu.', 'You have not tasted it yet; this is the moment for itadakimasu.'),
  ('You still do not know right now — that is present tense wakarimasen, not the past wakarimasendeshita.', 'You still do not know right now; that is present tense wakarimasen, not the past wakarimasendeshita.'),
  ('abunai is an i-adjective — its past is abunakatta, not abunai + datta.', 'abunai is an i-adjective: its past is abunakatta, not abunai + datta.'),
  ('ageru is for giving something to someone else. You bought the tofu for the meal — kaimashita, not agemashita.', 'ageru is for giving something to someone else. You bought the tofu for the meal: kaimashita, not agemashita.'),
  ('aku is intransitive — the door opens by itself. You are opening it: akeru.', 'aku is intransitive: the door opens by itself. You are opening it: akeru.'),
  ('amari needs a negative verb to attach to; desu alone leaves it dangling — state it as arimasen.', 'amari needs a negative verb to attach to; desu alone leaves it dangling. State it as arimasen.'),
  ('anata directly at someone you cannot see comes across as confrontational — just dochira-sama de shou ka.', 'anata directly at someone you cannot see comes across as confrontational: just dochira-sama de shou ka.'),
  ('arimasu asks whether a duration exists, not how much time a process consumes — dono kurai kakarimasu ka is how you ask that.', 'arimasu asks whether a duration exists, not how much time a process consumes; dono kurai kakarimasu ka is how you ask that.'),
  ('arimasu is an existence verb and takes no direct object — existence is marked with wa or ga, not o.', 'arimasu is an existence verb and takes no direct object; existence is marked with wa or ga, not o.'),
  ('arimasu is an existence verb, not one that takes a direct object — o has nothing to attach to. Existence is marked with wa or ga.', 'arimasu is an existence verb, not one that takes a direct object; o has nothing to attach to. Existence is marked with wa or ga.'),
  ('arimasu is an intransitive existence verb — its subject takes ga, not o.', 'arimasu is an intransitive existence verb; its subject takes ga, not o.'),
  ('aru is intransitive existence — what exists takes ga, not o.', 'aru is intransitive existence; what exists takes ga, not o.'),
  ('aru is intransitive — existence takes ga, not o.', 'aru is intransitive; existence takes ga, not o.'),
  ('aru is intransitive — nothing acts on the eggs. The thing that exists takes ga.', 'aru is intransitive; nothing acts on the eggs. The thing that exists takes ga.'),
  ('aru is intransitive — nothing acts on the soy sauce.', 'aru is intransitive; nothing acts on the soy sauce.'),
  ('aru is intransitive — the card takes ga.', 'aru is intransitive; the card takes ga.'),
  ('aru is intransitive — what exists takes ga or, as the new topic here, wa, not o.', 'aru is intransitive; what exists takes ga or, as the new topic here, wa, not o.'),
  ('aru is intransitive — what exists takes ga, not the object marker o.', 'aru is intransitive; what exists takes ga, not the object marker o.'),
  ('aru is intransitive — what exists takes wa or ga, never o.', 'aru is intransitive; what exists takes wa or ga, never o.'),
  ('ato is after — that puts it in the future.', 'ato is after. That puts it in the future.'),
  ('ato means afterward — that puts the start in the future, not last night.', 'ato means afterward. That puts the start in the future, not last night.'),
  ('azukeru is to hand something over for safekeeping — that is what YOU do. Them holding it is azukaru.', 'azukeru is to hand something over for safekeeping; that is what YOU do. Them holding it is azukaru.'),
  ('baibai is casual, for friends — far too informal for hanging up on a clinic.', 'baibai is casual, for friends: far too informal for hanging up on a clinic.'),
  ('baibai is casual, for friends — too informal for a call with the management company.', 'baibai is casual, for friends: too informal for a call with the management company.'),
  ('boku is casual and masculine — too informal a register for confirming your name to delivery staff.', 'boku is casual and masculine: too informal a register for confirming your name to delivery staff.'),
  ('buchou is already a title; adding san to a job title doubles the honorific and sounds off — the title alone is respectful enough.', 'buchou is already a title; adding san to a job title doubles the honorific and sounds off. The title alone is respectful enough.'),
  ('but about making the path you chose right —', 'but about making the path you chose right,'),
  ('chiisai is an adjective and cannot stand as a noun. The idiom is hitotsu shita — one below.', 'chiisai is an adjective and cannot stand as a noun. The idiom is hitotsu shita: one below.'),
  ('daijoubu answers a question about your condition or an offer of help with a slightly different nuance — among close friends turning down a small offer like this, ii yo is the natural, casual line.', 'daijoubu answers a question about your condition or an offer of help with a slightly different nuance; among close friends turning down a small offer like this, ii yo is the natural, casual line.'),
  ('daijoubu describes a state, not a destination — demo (even/also) is what links it to iro, not ni.', 'daijoubu describes a state, not a destination: demo (even/also) is what links it to iro, not ni.'),
  ('daijoubu desu here would decline the offer — the opposite of what you mean. Accepting it is onegaishimasu.', 'daijoubu desu here would decline the offer, the opposite of what you mean. Accepting it is onegaishimasu.'),
  ('daijoubu desu is how you decline something offered. Pairing hai with it muddies whether you want the bag — onegaishimasu accepts cleanly.', 'daijoubu desu is how you decline something offered. Pairing hai with it muddies whether you want the bag; onegaishimasu accepts cleanly.'),
  ('daijoubu desu is itself a decline — hai in front of it contradicts your own refusal.', 'daijoubu desu is itself a decline; hai in front of it contradicts your own refusal.'),
  ('daijoubu is a na-adjective describing a state, not a thing to be handed over — it cannot take o with kudasai.', 'daijoubu is a na-adjective describing a state, not a thing to be handed over; it cannot take o with kudasai.'),
  ('daijoubu is a na-adjective describing a state, not an object — it cannot take the object marker o.', 'daijoubu is a na-adjective describing a state, not an object; it cannot take the object marker o.'),
  ('daijoubu is a na-adjective describing the temperature itself, which needs wa or ga — ni would mark a location or target, not the thing being described.', 'daijoubu is a na-adjective describing the temperature itself, which needs wa or ga; ni would mark a location or target, not the thing being described.'),
  ('daijoubu is a na-adjective, not a verb — it pairs with desu, never with suru.', 'daijoubu is a na-adjective, not a verb; it pairs with desu, never with suru.'),
  ('daijoubu is a na-adjective, not a verb — it pairs with desu, not suru.', 'daijoubu is a na-adjective, not a verb; it pairs with desu, not suru.'),
  ('daijoubu is a na-adjective, not a verb — pair it with desu, not suru.', 'daijoubu is a na-adjective, not a verb; pair it with desu, not suru.'),
  ('daijoubu is an adjective and cannot take a direct object — accepting an option this way needs de.', 'daijoubu is an adjective and cannot take a direct object; accepting an option this way needs de.'),
  ('daijoubu is an adjective, not a verb that takes an object — the measurement takes de, not o.', 'daijoubu is an adjective, not a verb that takes an object; the measurement takes de, not o.'),
  ('daisuki is a na-adjective, not a verb — it never takes suru. It pairs with desu.', 'daisuki is a na-adjective, not a verb; it never takes suru. It pairs with desu.'),
  ('dake already narrows it to milk alone. Adding de on top of dake is not how this request is built — the item simply takes o or is left bare before onegaishimasu.', 'dake already narrows it to milk alone. Adding de on top of dake is not how this request is built; the item simply takes o or is left bare before onegaishimasu.'),
  ('dare is blunt for a stranger at the door — donata or dochira-sama is the polite way to ask.', 'dare is blunt for a stranger at the door; donata or dochira-sama is the polite way to ask.'),
  ('de ii desu means "air will do," a weaker claim than actually preferring it — the comparison needs no hou ga.', 'de ii desu means "air will do," a weaker claim than actually preferring it; the comparison needs no hou ga.'),
  ('de is where the sending happens — that says you post it while in the UK.', 'de is where the sending happens. That says you post it while in the UK.'),
  ('de marks a means or a location — the thing purchased needs o, and the actual request is kudasai, not a statement of your own want.', 'de marks a means or a location; the thing purchased needs o, and the actual request is kudasai, not a statement of your own want.'),
  ('de marks means or location, not the resulting amount — the amount something comes to takes ni: ikura ni narimasu ka.', 'de marks means or location, not the resulting amount; the amount something comes to takes ni: ikura ni narimasu ka.'),
  ('de marks the manner of payment — paying AS one group. o would treat issho as an object being handed to you, and nothing called that is.', 'de marks the manner of payment: paying AS one group. o would treat issho as an object being handed to you, and nothing called that is.'),
  ('de marks where an action happens, not a point being passed through — sugiru needs o for the thing passed.', 'de marks where an action happens, not a point being passed through; sugiru needs o for the thing passed.'),
  ('de marks where an action takes place, not a starting point — walking FROM here needs kara.', 'de marks where an action takes place, not a starting point; walking FROM here needs kara.'),
  ('dekimasu is present/future — "will be ready." The food is done now, so the past dekimashita is needed.', 'dekimasu is present/future: "will be ready." The food is done now, so the past dekimashita is needed.'),
  ('deru is intransitive — the card comes out by itself, so ga.', 'deru is intransitive; the card comes out by itself, so ga.'),
  ('deru is intransitive — the error appeared on its own, nothing produced it deliberately, so it takes ga, not o.', 'deru is intransitive; the error appeared on its own, nothing produced it deliberately, so it takes ga, not o.'),
  ('deshita is past tense — you are asking about now, not reporting something already settled.', 'deshita is past tense; you are asking about now, not reporting something already settled.'),
  ('deshita is past — you are deciding now, so desu.', 'deshita is past; you are deciding now, so desu.'),
  ('deshita is past — you are declining right now, so desu.', 'deshita is past; you are declining right now, so desu.'),
  ('dochira desu ka already asks the question. The thing you are asking about — platform three — takes wa, and ga here would clash with it.', 'dochira desu ka already asks the question. The thing you are asking about, platform three, takes wa, and ga here would clash with it.'),
  ('doko is the question word, so ga belongs with it — doko desu ka already asks. The thing you are asking about takes wa.', 'doko is the question word, so ga belongs with it; doko desu ka already asks. The thing you are asking about takes wa.'),
  ('doko ni desu ka is not a complete question — ni needs a verb to attach to. Asking "which way" pairs dochira directly with desu ka, no ni needed.', 'doko ni desu ka is not a complete question; ni needs a verb to attach to. Asking "which way" pairs dochira directly with desu ka, no ni needed.'),
  ('douitashimashite means "you are welcome" — it is what THEY would say back to your thanks, not something you say after receiving the bento.', 'douitashimashite means "you are welcome"; it is what THEY would say back to your thanks, not something you say after receiving the bento.'),
  ('doumo already stands complete as a closing word on its own — deshita cannot attach onto it.', 'doumo already stands complete as a closing word on its own; deshita cannot attach onto it.'),
  ('doushite mo ii desu ka asks permission to do whatever you like — it turns the question into a blanket request, not a request for advice, which is dou sureba ii desu ka.', 'doushite mo ii desu ka asks permission to do whatever you like; it turns the question into a blanket request, not a request for advice, which is dou sureba ii desu ka.'),
  ('e marks a direction of movement — a payment method is not a destination. The means of the refund takes de.', 'e marks a direction of movement; a payment method is not a destination. The means of the refund takes de.'),
  ('e marks a direction of movement; a request does not have a destination like that — onegaishimasu just takes de for the method.', 'e marks a direction of movement; a request does not have a destination like that: onegaishimasu just takes de for the method.'),
  ('ga marks a subject performing an action — onegai shimasu is your own request, not the room''s.', 'ga marks a subject performing an action; onegai shimasu is your own request, not the room''s.'),
  ('ganbaremasu is the potential form, a claim about being ABLE to try hard — a plain statement of intent is ganbarimasu, not a statement about capability.', 'ganbaremasu is the potential form, a claim about being ABLE to try hard; a plain statement of intent is ganbarimasu, not a statement about capability.'),
  ('gochisousama is said after eating — irrelevant to a driver who waited for you.', 'gochisousama is said after eating, irrelevant to a driver who waited for you.'),
  ('gochisousama is said after eating — irrelevant to paying a taxi fare.', 'gochisousama is said after eating, irrelevant to paying a taxi fare.'),
  ('gochisousama is said after eating — irrelevant to receiving a package.', 'gochisousama is said after eating, irrelevant to receiving a package.'),
  ('gochisousama is said after eating — irrelevant to thanking a pharmacist.', 'gochisousama is said after eating, irrelevant to thanking a pharmacist.'),
  ('gomennasai apologizes for a fault. You have done nothing wrong — shitsurei shimasu is the polite acknowledgement here.', 'gomennasai apologizes for a fault. You have done nothing wrong; shitsurei shimasu is the polite acknowledgement here.'),
  ('goro is for a point in time — three o''clock-ish. For a duration it is gurai.', 'goro is for a point in time: three o''clock-ish. For a duration it is gurai.'),
  ('hai answers yes, but daijoubu desu here is turning down more food — pairing hai with a decline phrase contradicts your own answer.', 'hai answers yes, but daijoubu desu here is turning down more food; pairing hai with a decline phrase contradicts your own answer.'),
  ('hai here reads as accepting the offer, but daijoubu desu on its own already declines it — pairing them contradicts itself.', 'hai here reads as accepting the offer, but daijoubu desu on its own already declines it; pairing them contradicts itself.'),
  ('hai says yes, but daijoubu desu here declines the extra warming — pairing hai with a decline phrase contradicts your own answer.', 'hai says yes, but daijoubu desu here declines the extra warming; pairing hai with a decline phrase contradicts your own answer.'),
  ('hai says yes, but daijoubu desu here is declining the receipt — pairing hai with a decline phrase sends the opposite message from what you mean.', 'hai says yes, but daijoubu desu here is declining the receipt; pairing hai with a decline phrase sends the opposite message from what you mean.'),
  ('hai says yes, but daijoubu desu here is turning the spoon down — pairing them contradicts your own answer.', 'hai says yes, but daijoubu desu here is turning the spoon down; pairing them contradicts your own answer.'),
  ('hai signals yes, but ii desu right after it already declines — say hai, onegaishimasu to actually accept.', 'hai signals yes, but ii desu right after it already declines; say hai, onegaishimasu to actually accept.'),
  ('hai signals yes, but ii desu right after it already declines — the two contradict each other. A clean decline is iie, ii desu.', 'hai signals yes, but ii desu right after it already declines; the two contradict each other. A clean decline is iie, ii desu.'),
  ('hai signals yes. Pairing it with a decline sends a contradictory answer — a decline opens with iie, not hai.', 'hai signals yes. Pairing it with a decline sends a contradictory answer; a decline opens with iie, not hai.'),
  ('hai then a refusal contradicts itself — they will reach for a bag.', 'hai then a refusal contradicts itself. They will reach for a bag.'),
  ('hairu is a motion verb — the place you enter takes ni, not o.', 'hairu is a motion verb; the place you enter takes ni, not o.'),
  ('hairu is intransitive — it goes in by itself. Adding salt is something you do, which needs the transitive ireru.', 'hairu is intransitive; it goes in by itself. Adding salt is something you do, which needs the transitive ireru.'),
  ('hairu is intransitive — what is inside takes ga or, as here, the topic wa.', 'hairu is intransitive; what is inside takes ga or, as here, the topic wa.'),
  ('hairu is intransitive — what is inside takes ga, never o.', 'hairu is intransitive; what is inside takes ga, never o.'),
  ('hairu is intransitive — work coming up by itself takes ga, not o.', 'hairu is intransitive; work coming up by itself takes ga, not o.'),
  ('hajimaru is intransitive — it begins by itself. You are the one starting the cooking, which needs the transitive hajimeru.', 'hajimaru is intransitive; it begins by itself. You are the one starting the cooking, which needs the transitive hajimeru.'),
  ('hanaseba is advice — "you should talk." You are asking whether THEY are free right now, which is the potential hanaseru?', 'hanaseba is advice: "you should talk." You are asking whether THEY are free right now, which is the potential hanaseru?'),
  ('haraimasu ka asks whether the DRIVER will pay — dropping the potential -emasu changes whose ability is being asked about.', 'haraimasu ka asks whether the DRIVER will pay; dropping the potential -emasu changes whose ability is being asked about.'),
  ('harau needs the means marked with de, not ni — de shows what you are paying WITH.', 'harau needs the means marked with de, not ni; de shows what you are paying WITH.'),
  ('harau takes the amount owed as its object, not the method of payment — o cannot attach to kaado here.', 'harau takes the amount owed as its object, not the method of payment; o cannot attach to kaado here.'),
  ('hayai is an i-adjective — and tomorrow has not happened, so the past makes no sense either.', 'hayai is an i-adjective, and tomorrow has not happened, so the past makes no sense either.'),
  ('hieru is intransitive — nothing is acting on the feet, so they take ga, not o.', 'hieru is intransitive; nothing is acting on the feet, so they take ga, not o.'),
  ('hitsuyou ga arimasu is the fixed pattern for "there is a need" — hitsuyou is what exists, so it takes ga, not o.', 'hitsuyou ga arimasu is the fixed pattern for "there is a need"; hitsuyou is what exists, so it takes ga, not o.'),
  ('hitsuyou is a na-adjective; predicating it needs desu, not arimasu — hitsuyou desu ka.', 'hitsuyou is a na-adjective; predicating it needs desu, not arimasu: hitsuyou desu ka.'),
  ('hon counts long thin objects like bottles or pencils — a length is counted with senchi, not hon.', 'hon counts long thin objects like bottles or pencils; a length is counted with senchi, not hon.'),
  ('ii desu alone can be heard as declining — "no, I''m fine as is." Naming what you want, jenerikku de onegai shimasu, avoids the ambiguity.', 'ii desu alone can be heard as declining: "no, I''m fine as is." Naming what you want, jenerikku de onegai shimasu, avoids the ambiguity.'),
  ('ii desu alone here reads as "no need" (declining) rather than reassurance — daijoubu desu reads as fine either way.', 'ii desu alone here reads as "no need" (declining) rather than reassurance; daijoubu desu reads as fine either way.'),
  ('ii desu declines here — the single biggest trap in this whole exchange. Accepting an offer is hai, onegaishimasu.', 'ii desu declines here: the single biggest trap in this whole exchange. Accepting an offer is hai, onegaishimasu.'),
  ('ii desu declines the bag — the same trap as the heating question. Accepting is hai, onegaishimasu.', 'ii desu declines the bag: the same trap as the heating question. Accepting is hai, onegaishimasu.'),
  ('ii desu declines the offer — pairing it with hai contradicts your own answer.', 'ii desu declines the offer; pairing it with hai contradicts your own answer.'),
  ('ii desu here declines the offer — following it with onegaishimasu asks for the very thing you just turned down.', 'ii desu here declines the offer; following it with onegaishimasu asks for the very thing you just turned down.'),
  ('ii desu here leans toward "no need," an odd signal when you actually want to get out here — daijoubu desu reads as clear confirmation.', 'ii desu here leans toward "no need," an odd signal when you actually want to get out here; daijoubu desu reads as clear confirmation.'),
  ('ii desu here reads as a mild preference, not a request — the standard way to ask for service is onegaishimasu.', 'ii desu here reads as a mild preference, not a request; the standard way to ask for service is onegaishimasu.'),
  ('ii desu here reads as a polite decline ("I''m fine, thanks"), not an acceptance — to say yes you need onegaishimasu, not ii desu.', 'ii desu here reads as a polite decline ("I''m fine, thanks"), not an acceptance; to say yes you need onegaishimasu, not ii desu.'),
  ('ii desu here reads as ambiguous — it could sound like a refusal rather than handing the passport over.', 'ii desu here reads as ambiguous; it could sound like a refusal rather than handing the passport over.'),
  ('ii desu here reads as declining, not agreeing — it leaves the clerk unsure whether you actually want to wait.', 'ii desu here reads as declining, not agreeing; it leaves the clerk unsure whether you actually want to wait.'),
  ('ii desu is ambiguous at a till — it can mean yes or no. And motsu says you WILL hold one; having one already is motte imasu.', 'ii desu is ambiguous at a till; it can mean yes or no. And motsu says you WILL hold one; having one already is motte imasu.'),
  ('ii desu is ambiguous between accepting and declining — the clerk cannot tell which you mean.', 'ii desu is ambiguous between accepting and declining; the clerk cannot tell which you mean.'),
  ('ii desu is ambiguous between accepting and declining — the desk clerk cannot tell which you mean.', 'ii desu is ambiguous between accepting and declining; the desk clerk cannot tell which you mean.'),
  ('ii desu is an adjective, not a verb that takes an object — o cannot attach here.', 'ii desu is an adjective, not a verb that takes an object; o cannot attach here.'),
  ('ii desu is genuinely ambiguous — it can mean "yes, good" or "no thanks" — and shop staff often have to ask again.', 'ii desu is genuinely ambiguous (it can mean "yes, good" or "no thanks"), and shop staff often have to ask again.'),
  ('ii desu ne agrees enthusiastically — it does not fit right after chotto, which is already signalling a decline.', 'ii desu ne agrees enthusiastically; it does not fit right after chotto, which is already signalling a decline.'),
  ('ii desu ne enthusiastically agrees — it does not fit turning the offer down.', 'ii desu ne enthusiastically agrees; it does not fit turning the offer down.'),
  ('ii desu on its own leans toward "no need" — pair acceptance with onegaishimasu to be unambiguous.', 'ii desu on its own leans toward "no need"; pair acceptance with onegaishimasu to be unambiguous.'),
  ('ii desu on its own reads as a polite decline — "I''m fine, no thank you" — the opposite of accepting the fever reducer you actually want.', 'ii desu on its own reads as a polite decline ("I''m fine, no thank you"), the opposite of accepting the fever reducer you actually want.'),
  ('ii desu reads as ambiguous here too — it could mean "that''s fine" or "no need," leaving the stylist unsure whether to proceed.', 'ii desu reads as ambiguous here too; it could mean "that''s fine" or "no need," leaving the stylist unsure whether to proceed.'),
  ('ii desu yo here sounds like accepting their offer to help — the opposite of declining. daijoubu desu is what says "no need."', 'ii desu yo here sounds like accepting their offer to help, the opposite of declining. daijoubu desu is what says "no need."'),
  ('ii is an adjective, not a verb, so it takes no object. de marks the means — paying BY card.', 'ii is an adjective, not a verb, so it takes no object. de marks the means: paying BY card.'),
  ('ii is irregular: as an adverb before naru it becomes yoku — yoku narimashita.', 'ii is irregular: as an adverb before naru it becomes yoku (yoku narimashita).'),
  ('iie iie brushes off their thanks as unnecessary, which undercuts the courtesy exchange — kochira koso ("likewise") is what matches and returns it.', 'iie iie brushes off their thanks as unnecessary, which undercuts the courtesy exchange; kochira koso ("likewise") is what matches and returns it.'),
  ('iimashita is past tense — you are stating your name right now, so it stays present: to moushimasu.', 'iimashita is past tense; you are stating your name right now, so it stays present: to moushimasu.'),
  ('ijou is not something being acted on here — it is the state you are affirming, marked with de like other short customer answers, not o.', 'ijou is not something being acted on here; it is the state you are affirming, marked with de like other short customer answers, not o.'),
  ('ikura desu ka is not a verb taking a direct object — there is nothing here for o to attach to.', 'ikura desu ka is not a verb taking a direct object; there is nothing here for o to attach to.'),
  ('ikutsu asks how MANY. Price is ikura — the two look alike and mean quite different things.', 'ikutsu asks how MANY. Price is ikura; the two look alike and mean quite different things.'),
  ('imashita is past — you are describing your situation right now, so imasen.', 'imashita is past; you are describing your situation right now, so imasen.'),
  ('imasu is present tense — a previous address needs the past, sunde imashita.', 'imasu is present tense; a previous address needs the past, sunde imashita.'),
  ('inakutemo ii would mean "even without being there is fine" — the opposite. You are asking if you MUST be there: inai to ikemasen.', 'inakutemo ii would mean "even without being there is fine", the opposite. You are asking if you MUST be there: inai to ikemasen.'),
  ('ireru is transitive — putting something IN. A person entering the bath themselves is the intransitive hairu.', 'ireru is transitive: putting something IN. A person entering the bath themselves is the intransitive hairu.'),
  ('ireru is transitive — putting something IN. A person getting into the bath themselves is the intransitive hairu.', 'ireru is transitive: putting something IN. A person getting into the bath themselves is the intransitive hairu.'),
  ('irimasu means "I need it". Pairing iie (no) with a phrase that means "I need it" contradicts itself — the decline here is irimasen or daijoubu desu.', 'irimasu means "I need it". Pairing iie (no) with a phrase that means "I need it" contradicts itself; the decline here is irimasen or daijoubu desu.'),
  ('iru is for animate things — a handout takes aru.', 'iru is for animate things; a handout takes aru.'),
  ('iru is for animate things — a rental service takes aru.', 'iru is for animate things; a rental service takes aru.'),
  ('iru is for animate things — and doko desu ka is the ordinary way to ask.', 'iru is for animate things, and doko desu ka is the ordinary way to ask.'),
  ('iru marks the thing needed with ga, not wo — wo is for the object of a transitive action, and needing is not one.', 'iru marks the thing needed with ga, not wo; wo is for the object of a transitive action, and needing is not one.'),
  ('issho is together — the opposite of what you want.', 'issho is together, the opposite of what you want.'),
  ('itadakimasu is said before eating or receiving something — not when following an instruction to sit down.', 'itadakimasu is said before eating or receiving something, not when following an instruction to sit down.'),
  ('itadakimasu precedes eating or receiving something as a gift — not fitting for a delivered parcel.', 'itadakimasu precedes eating or receiving something as a gift, not fitting for a delivered parcel.'),
  ('itadakimasu precedes eating or receiving something — not fitting here.', 'itadakimasu precedes eating or receiving something, not fitting here.'),
  ('itadaku means to receive, not to say — asking them to speak up needs ossharu or itte kudasai.', 'itadaku means to receive, not to say; asking them to speak up needs ossharu or itte kudasai.'),
  ('itai is an adjective, not a verb — nothing is acted on, so the location takes ga, not o.', 'itai is an adjective, not a verb; nothing is acted on, so the location takes ga, not o.'),
  ('itai is an adjective, not a verb — nothing is acted on, so the tooth takes ga.', 'itai is an adjective, not a verb; nothing is acted on, so the tooth takes ga.'),
  ('itai is an adjective, not a verb — the part that hurts takes ga, not o.', 'itai is an adjective, not a verb; the part that hurts takes ga, not o.'),
  ('itai is an adjective, not a verb — what hurts takes ga.', 'itai is an adjective, not a verb; what hurts takes ga.'),
  ('itameru is transitive — it would mean you injure something. The tooth hurting on its own is itamu, intransitive.', 'itameru is transitive; it would mean you injure something. The tooth hurting on its own is itamu, intransitive.'),
  ('itameru is transitive — someone spoils something. Food going bad by itself is the intransitive itamu: itande imasu.', 'itameru is transitive: someone spoils something. Food going bad by itself is the intransitive itamu: itande imasu.'),
  ('itte imasu describes being in a state of having gone — currently away. Leaving with the intent to return is itte kimasu.', 'itte imasu describes being in a state of having gone, currently away. Leaving with the intent to return is itte kimasu.'),
  ('itte kimasu is said when leaving home — irrelevant here.', 'itte kimasu is said when leaving home. Irrelevant here.'),
  ('ittekudasai orders the other person to go — you are the one leaving, so ittekimasu.', 'ittekudasai orders the other person to go; you are the one leaving, so ittekimasu.'),
  ('jaa ne is casual, for friends — too familiar for someone delivering a parcel to your door.', 'jaa ne is casual, for friends: too familiar for someone delivering a parcel to your door.'),
  ('janai negates nouns and na-adjectives. itai is an i-adjective — its negative is itakunai.', 'janai negates nouns and na-adjectives. itai is an i-adjective; its negative is itakunai.'),
  ('ka turns this into a question asking THEM whether it is good — ne here is you commenting on what you see.', 'ka turns this into a question asking THEM whether it is good; ne here is you commenting on what you see.'),
  ('kakaru is intransitive — time simply takes, it is not acted on — so the thing it takes for is marked with ni, not o.', 'kakaru is intransitive (time simply takes, it is not acted on), so the thing it takes for is marked with ni, not o.'),
  ('kakaru, plain affirmative, says it should cover your eyebrows — the opposite of what you want. You need the negative: kakaranai.', 'kakaru, plain affirmative, says it should cover your eyebrows, the opposite of what you want. You need the negative: kakaranai.'),
  ('kakeru, plain non-past potential, says you are able to write it. kaketa, past, reports you actually have — which is what is true now.', 'kakeru, plain non-past potential, says you are able to write it. kaketa, past, reports you actually have, which is what is true now.'),
  ('kara already marks the starting point by itself; stacking ni in front of it is redundant — just kuji kara desu.', 'kara already marks the starting point by itself; stacking ni in front of it is redundant: just kuji kara desu.'),
  ('kariru is to borrow — that asks them to borrow one. You want them to lend: kasu.', 'kariru is to borrow; that asks them to borrow one. You want them to lend: kasu.'),
  ('kasu is to lend — that is what THEY would do. Borrowing it yourself is kariru.', 'kasu is to lend; that is what THEY would do. Borrowing it yourself is kariru.'),
  ('kawakasemasu is causative — making or letting something dry. Drying your own hair is just the plain kawakashimasu.', 'kawakasemasu is causative: making or letting something dry. Drying your own hair is just the plain kawakashimasu.'),
  ('kawaku is intransitive — it dries by itself. You are the one drying your hair, which needs the transitive kawakasu.', 'kawaku is intransitive; it dries by itself. You are the one drying your hair, which needs the transitive kawakasu.'),
  ('kekkou desu at a counter usually REFUSES — "no thank you". Dangerous word.', 'kekkou desu at a counter usually REFUSES: "no thank you". Dangerous word.'),
  ('kekkou desu here reads as "no, that''s fine as is" — a polite decline, not confirmation you want it.', 'kekkou desu here reads as "no, that''s fine as is", a polite decline, not confirmation you want it.'),
  ('kekkou desu here usually REFUSES — "no thank you". Dangerous word to say to your dentist mid-treatment.', 'kekkou desu here usually REFUSES: "no thank you". Dangerous word to say to your dentist mid-treatment.'),
  ('kekkou desu leans toward "no thanks" in this context — the wrong signal to give your driver.', 'kekkou desu leans toward "no thanks" in this context, the wrong signal to give your driver.'),
  ('ki o tsukeru is a fixed phrase — ki is the object of tsukeru and takes o, not ga.', 'ki o tsukeru is a fixed phrase; ki is the object of tsukeru and takes o, not ga.'),
  ('ki o tsukeru is a set phrase — the object ki takes o, not ga.', 'ki o tsukeru is a set phrase; the object ki takes o, not ga.'),
  ('kieru is intransitive — a light going out on its own. Switching it off yourself needs the transitive kesu.', 'kieru is intransitive: a light going out on its own. Switching it off yourself needs the transitive kesu.'),
  ('kimashita is past tense — you have not come back yet. Planning to is kimasu.', 'kimashita is past tense; you have not come back yet. Planning to is kimasu.'),
  ('ko is the generic counter for small objects, not drinks ordered by the glass — mittsu is the natural count here.', 'ko is the generic counter for small objects, not drinks ordered by the glass; mittsu is the natural count here.'),
  ('koboreru is intransitive — coffee spilling by itself does not take an object. Saying YOU spilled it needs the transitive kobosu.', 'koboreru is intransitive; coffee spilling by itself does not take an object. Saying YOU spilled it needs the transitive kobosu.'),
  ('konnichiwa is not used on a business call — the greeting is osewa ni natte orimasu once you know who it is.', 'konnichiwa is not used on a business call; the greeting is osewa ni natte orimasu once you know who it is.'),
  ('kudasai asks for a specific object to be handed over — the thing wanted takes o, not wa.', 'kudasai asks for a specific object to be handed over; the thing wanted takes o, not wa.'),
  ('kudasai asks for an object to be handed over. Booking is a service — onegai shimasu.', 'kudasai asks for an object to be handed over. Booking is a service: onegai shimasu.'),
  ('kudasai is a direct order — fine in some contexts, but onegai shimasu is the softer reply to a clerk already offering to help.', 'kudasai is a direct order: fine in some contexts, but onegai shimasu is the softer reply to a clerk already offering to help.'),
  ('kudasai orders the OTHER person to wait — you are the one waiting, so the humble omachi shite imasu fits, not an order back at them.', 'kudasai orders the OTHER person to wait; you are the one waiting, so the humble omachi shite imasu fits, not an order back at them.'),
  ('kudasai would be asking THEM to show something to YOU — the reverse of what is happening.', 'kudasai would be asking THEM to show something to YOU, the reverse of what is happening.'),
  ('kuremasu describes someone else giving to you — it cannot describe your own act of eating or receiving here.', 'kuremasu describes someone else giving to you; it cannot describe your own act of eating or receiving here.'),
  ('kuru is intransitive — the bus takes wa or ga, not o.', 'kuru is intransitive; the bus takes wa or ga, not o.'),
  ('machigaeru is transitive — YOU mistook it, so the file takes o.', 'machigaeru is transitive; YOU mistook it, so the file takes o.'),
  ('machimasen is negative — it says you will NOT wait, the opposite of what is meant.', 'machimasen is negative; it says you will NOT wait, the opposite of what is meant.'),
  ('machimasen is negative — it says you will NOT wait, which contradicts agreeing to the delay.', 'machimasen is negative; it says you will NOT wait, which contradicts agreeing to the delay.'),
  ('machimasen is the negative — "I will not wait" — flatly reversing the meaning you intend while still starting with hai.', 'machimasen is the negative: "I will not wait", flatly reversing the meaning you intend while still starting with hai.'),
  ('mada already leans negative — "not yet". Adding janai negates that again and flips the meaning to "it is already done".', 'mada already leans negative: "not yet". Adding janai negates that again and flips the meaning to "it is already done".'),
  ('made alone is continuous — up TO 9:30. A one-time deadline for showing them needs made ni, not made by itself.', 'made alone is continuous, up TO 9:30. A one-time deadline for showing them needs made ni, not made by itself.'),
  ('made is continuous — up TO Tuesday. A deadline is made ni.', 'made is continuous, up TO Tuesday. A deadline is made ni.'),
  ('made is the far end of a span — that says it stopped three days ago.', 'made is the far end of a span; that says it stopped three days ago.'),
  ('made is up until — that says it worked from last night onward.', 'made is up until: that says it worked from last night onward.'),
  ('mairu is humble language for your OWN actions; used about Tanaka''s action it lowers him instead of respecting him — his action needs the respectful irassharu, not the humble mairu.', 'mairu is humble language for your OWN actions; used about Tanaka''s action it lowers him instead of respecting him. His action needs the respectful irassharu, not the humble mairu.'),
  ('masen ka invites the driver to use the road together with you as an equal choice — but this is your instruction to them, so onegai shimasu.', 'masen ka invites the driver to use the road together with you as an equal choice, but this is your instruction to them, so onegai shimasu.'),
  ('masen ka invites the other person to try it on together with you — you want permission to try it yourself, not a joint invitation.', 'masen ka invites the other person to try it on together with you; you want permission to try it yourself, not a joint invitation.'),
  ('mashou assumes agreement — it decides for both of you. An invitation that leaves room to decline is masen ka.', 'mashou assumes agreement; it decides for both of you. An invitation that leaves room to decline is masen ka.'),
  ('mashou proposes doing something together, as if the clerk were putting the jacket on too — accepting an offer just needs onegai shimasu.', 'mashou proposes doing something together, as if the clerk were putting the jacket on too; accepting an offer just needs onegai shimasu.'),
  ('mata ne is casual, used with friends expecting to meet again soon — too familiar for a delivery company.', 'mata ne is casual, used with friends expecting to meet again soon, too familiar for a delivery company.'),
  ('matemasu is the potential form — "I am able to wait". Answering a statement about wait time that way misses the mark; machimasu simply states that you will wait.', 'matemasu is the potential form: "I am able to wait". Answering a statement about wait time that way misses the mark; machimasu simply states that you will wait.'),
  ('mieru is intransitive — what comes into view takes ga, never o.', 'mieru is intransitive; what comes into view takes ga, never o.'),
  ('misete agemasu frames showing your manager the materials as a favor granted to them, which is backwards for someone senior — the humble o-mise shimasu is what fits.', 'misete agemasu frames showing your manager the materials as a favor granted to them, which is backwards for someone senior; the humble o-mise shimasu is what fits.'),
  ('mochimasu describes the act of picking something up, not the ongoing state of having it — that is motte imasu.', 'mochimasu describes the act of picking something up, not the ongoing state of having it; that is motte imasu.'),
  ('morai is the bare stem, not a valid predicate on its own — the polite potential moraemasu ka is what you need.', 'morai is the bare stem, not a valid predicate on its own; the polite potential moraemasu ka is what you need.'),
  ('morau and ageru point in opposite directions — you received the favor (morau) from your manager; ageru would mean doing HIM a favor, which reverses who benefits.', 'morau and ageru point in opposite directions: you received the favor (morau) from your manager; ageru would mean doing HIM a favor, which reverses who benefits.'),
  ('motanai states a general habit — that you never carry one, as a rule. Not having it on you right now is the te-form negative, motte nai.', 'motanai states a general habit: that you never carry one, as a rule. Not having it on you right now is the te-form negative, motte nai.'),
  ('moushiageru is a humble form for YOUR OWN actions toward someone above you — asking them to speak needs the respectful ossharu.', 'moushiageru is a humble form for YOUR OWN actions toward someone above you; asking them to speak needs the respectful ossharu.'),
  ('moushimashita is past tense — introducing yourself right now needs the present mousu.', 'moushimashita is past tense; introducing yourself right now needs the present mousu.'),
  ('nai is the negative of aru, an existence verb — it cannot take a direct object marked with o.', 'nai is the negative of aru, an existence verb; it cannot take a direct object marked with o.'),
  ('nai, "there isn''t", is intransitive — what is absent takes ga, not o.', 'nai, "there isn''t", is intransitive; what is absent takes ga, not o.'),
  ('nan desu ka already asks the question. The thing you are asking about — osusume — takes wa, and ga here would clash with it.', 'nan desu ka already asks the question. The thing you are asking about, osusume, takes wa, and ga here would clash with it.'),
  ('naru does not take a direct object — "in total" as the scope takes de: zenbu de.', 'naru does not take a direct object; "in total" as the scope takes de: zenbu de.'),
  ('naru is to become by itself — that asks the barber to get shorter.', 'naru is to become by itself; that asks the barber to get shorter.'),
  ('naruhodo desu ne is not standard — naruhodo stands alone.', 'naruhodo desu ne is not standard; naruhodo stands alone.'),
  ('natte iru describes a change already complete and in effect now. The day hasn''t changed yet — it needs the plain future naru.', 'natte iru describes a change already complete and in effect now. The day hasn''t changed yet; it needs the plain future naru.'),
  ('ni does not mark the thing you are asking about — the fare is the topic, wa, not ni.', 'ni does not mark the thing you are asking about; the fare is the topic, wa, not ni.'),
  ('ni marks a destination or a choice-target with suru — with onegai the means is de.', 'ni marks a destination or a choice-target with suru; with onegai the means is de.'),
  ('ni marks a destination point, like an address itself; the medium you send THROUGH takes de — meeru de okuru.', 'ni marks a destination point, like an address itself; the medium you send THROUGH takes de: meeru de okuru.'),
  ('ni marks a destination you arrive at — going TO the shinkansen makes no sense. de marks the means of travel, going BY shinkansen.', 'ni marks a destination you arrive at; going TO the shinkansen makes no sense. de marks the means of travel, going BY shinkansen.'),
  ('ni marks a destination you arrive at. A fare covers the distance travelled, so it takes made — as far as Kyoto.', 'ni marks a destination you arrive at. A fare covers the distance travelled, so it takes made, as far as Kyoto.'),
  ('ni would mark a recipient being informed, not the means of alerting you — the sound as method takes de.', 'ni would mark a recipient being informed, not the means of alerting you; the sound as method takes de.'),
  ('ni would mark the box as where the contents are going, but you are stating what already IS inside — ga marks the thing that exists there.', 'ni would mark the box as where the contents are going, but you are stating what already IS inside; ga marks the thing that exists there.'),
  ('ni would mark the card as a recipient or target, not the thing being tried — the card itself takes o.', 'ni would mark the card as a recipient or target, not the thing being tried; the card itself takes o.'),
  ('nin counts people. A bento takes tsu — Japanese counters classify by what is being counted.', 'nin counts people. A bento takes tsu. Japanese counters classify by what is being counted.'),
  ('no makes this "my head of household" — a different person. Answering who it is, about yourself, takes ga.', 'no makes this "my head of household", a different person. Answering who it is, about yourself, takes ga.'),
  ('node needs a reason clause to attach to — wakarimashita alone is already a complete sentence, not a reason for what follows.', 'node needs a reason clause to attach to; wakarimashita alone is already a complete sentence, not a reason for what follows.'),
  ('nomu takes an object — the thing you drink is marked by o, not ga.', 'nomu takes an object; the thing you drink is marked by o, not ga.'),
  ('noru takes ni for the vehicle you get onto — you move ONTO it. o is for things acted on directly, not the vehicle you board.', 'noru takes ni for the vehicle you get onto; you move ONTO it. o is for things acted on directly, not the vehicle you board.'),
  ('odaiji ni is said BY the medical staff TO the patient — not the other way around.', 'odaiji ni is said BY the medical staff TO the patient, not the other way around.'),
  ('ogoraseru is causative, "I''ll make [someone] treat" — you mean YOU will do the treating, which is just the plain ogoru.', 'ogoraseru is causative, "I''ll make [someone] treat"; you mean YOU will do the treating, which is just the plain ogoru.'),
  ('okane is money itself — this asks them to give you some. The bill is okaikei.', 'okane is money itself; this asks them to give you some. The bill is okaikei.'),
  ('okureru is intransitive — the homework is late by itself.', 'okureru is intransitive; the homework is late by itself.'),
  ('okureru is intransitive — the train is doing the being-late, so ga.', 'okureru is intransitive; the train is doing the being-late, so ga.'),
  ('okuru takes an object — the parcel is what you are sending, so o.', 'okuru takes an object; the parcel is what you are sending, so o.'),
  ('onegai shimashita puts the set greeting in the past — the fixed phrase stays present tense: onegai shimasu.', 'onegai shimashita puts the set greeting in the past; the fixed phrase stays present tense: onegai shimasu.'),
  ('onegai shimasu accepts the offer — the opposite of the polite decline meant here.', 'onegai shimasu accepts the offer, the opposite of the polite decline meant here.'),
  ('onegaishimasu asks for a favour. Nothing is being requested here — you are simply offering the money.', 'onegaishimasu asks for a favour. Nothing is being requested here; you are simply offering the money.'),
  ('onegaishimasu comes from negau, so the stem is negai — onegaimasu drops the i and is not a word.', 'onegaishimasu comes from negau, so the stem is negai; onegaimasu drops the i and is not a word.'),
  ('onegaishimasu does not take a ga-marked subject here — the amount you are paying with is marked with de.', 'onegaishimasu does not take a ga-marked subject here; the amount you are paying with is marked with de.'),
  ('ookii is an i-adjective and never takes deshita — and it is big now, so the present is right.', 'ookii is an i-adjective and never takes deshita, and it is big now, so the present is right.'),
  ('osewa sama desu is casual, used among close coworkers or shopkeepers — a call with an outside business contact needs the fuller osewa ni natte orimasu.', 'osewa sama desu is casual, used among close coworkers or shopkeepers; a call with an outside business contact needs the fuller osewa ni natte orimasu.'),
  ('oshiesasete is causative — "let me teach" — the opposite of thanking someone who taught you.', 'oshiesasete is causative ("let me teach"), the opposite of thanking someone who taught you.'),
  ('otsukaresama acknowledges a colleague''s effort as an equal — not how a customer thanks pharmacy staff.', 'otsukaresama acknowledges a colleague''s effort as an equal, not how a customer thanks pharmacy staff.'),
  ('otsukaresama acknowledges a colleague''s effort — not how a patient thanks a doctor.', 'otsukaresama acknowledges a colleague''s effort, not how a patient thanks a doctor.'),
  ('otsukaresama acknowledges someone''s work effort, like to a colleague — a neighbourly chat is not work.', 'otsukaresama acknowledges someone''s work effort, like to a colleague; a neighbourly chat is not work.'),
  ('otsukaresama treats the driver as a peer acknowledging shared work — as a customer, gokurousama or a plain thank-you fits better.', 'otsukaresama treats the driver as a peer acknowledging shared work; as a customer, gokurousama or a plain thank-you fits better.'),
  ('owaraseru alone just says you will finish it; adding oku (owarasete oku) signals you are doing it in advance for their benefit — dropping oku loses that "taken care of" nuance.', 'owaraseru alone just says you will finish it; adding oku (owarasete oku) signals you are doing it in advance for their benefit (dropping oku loses that "taken care of" nuance).'),
  ('owaru is intransitive — the work finishes by itself; since YOU are the one finishing it, the transitive owaraseru is needed, not owaru.', 'owaru is intransitive: the work finishes by itself; since YOU are the one finishing it, the transitive owaraseru is needed, not owaru.'),
  ('owatte imasu describes an ongoing state of already being finished. You mean the plain future owarimasu — it WILL be done soon.', 'owatte imasu describes an ongoing state of already being finished. You mean the plain future owarimasu: it WILL be done soon.'),
  ('oyasumi as a parting phrase is fixed — adding deshita turns it into a statement about a day off, not a goodnight.', 'oyasumi as a parting phrase is fixed; adding deshita turns it into a statement about a day off, not a goodnight.'),
  ('past tense treats the courtesy as already finished, which is slightly off right as you hang up — the sign-off said in the moment is the non-past shitsurei itashimasu.', 'past tense treats the courtesy as already finished, which is slightly off right as you hang up; the sign-off said in the moment is the non-past shitsurei itashimasu.'),
  ('ryou desu ka needs no linking particle here — no connects "how much" to "amount" as a modifier, not o.', 'ryou desu ka needs no linking particle here; no connects "how much" to "amount" as a modifier, not o.'),
  ('ryoukai desu is a casual, workplace-style acknowledgment — too informal for a hotel receptionist using keigo.', 'ryoukai desu is a casual, workplace-style acknowledgment, too informal for a hotel receptionist using keigo.'),
  ('sasete kudasai means "please let ME sit" — asking permission for yourself. Telling THEM to sit is the plain te-kudasai.', 'sasete kudasai means "please let ME sit", asking permission for yourself. Telling THEM to sit is the plain te-kudasai.'),
  ('sayounara is a final, formal farewell — too heavy for a quick chat with a neighbour you will see again.', 'sayounara is a final, formal farewell, too heavy for a quick chat with a neighbour you will see again.'),
  ('sayounara is a real parting — it carries the sense of not meeting again soon. Leaving your own house for the day does not.', 'sayounara is a real parting; it carries the sense of not meeting again soon. Leaving your own house for the day does not.'),
  ('sayounara sounds like a final farewell to a person you know — for a brief exchange at the door, shitsurei shimasu fits better.', 'sayounara sounds like a final farewell to a person you know; for a brief exchange at the door, shitsurei shimasu fits better.'),
  ('sayounara sounds like a final farewell to a person, not how a phone call with a business ends — shitsurei shimasu is the norm.', 'sayounara sounds like a final farewell to a person, not how a phone call with a business ends; shitsurei shimasu is the norm.'),
  ('sayounara sounds like a final farewell, as though you will not see them again — for a colleague you will see later the same day, mata ato de is what is said.', 'sayounara sounds like a final farewell, as though you will not see them again; for a colleague you will see later the same day, mata ato de is what is said.'),
  ('sayounara suits a final goodbye to a person face to face — a phone call like this ends with shitsurei shimasu.', 'sayounara suits a final goodbye to a person face to face; a phone call like this ends with shitsurei shimasu.'),
  ('shichaku suru takes a direct object — the thing you try on is marked with o, not ni.', 'shichaku suru takes a direct object; the thing you try on is marked with o, not ni.'),
  ('shimaru is intransitive — a door closing on its own. Locking it yourself is an action you do, which needs the transitive shimeru.', 'shimaru is intransitive: a door closing on its own. Locking it yourself is an action you do, which needs the transitive shimeru.'),
  ('shio is what gets put in — the object of ireru, marked wo (here mo replacing it), not ga.', 'shio is what gets put in: the object of ireru, marked wo (here mo replacing it), not ga.'),
  ('shitte imasu claims prior knowledge — unrelated to acknowledging what was just said.', 'shitte imasu claims prior knowledge, unrelated to acknowledging what was just said.'),
  ('shuugou suru needs a time particle to attach the "when" to — that is ni. ga would try to make "what time" the subject, which does not fit an action verb like this.', 'shuugou suru needs a time particle to attach the "when" to; that is ni. ga would try to make "what time" the subject, which does not fit an action verb like this.'),
  ('sochira is the polite/formal way to say "you/that side" — with a close friend the plain socchi fits, sochira sounds stiffly formal here.', 'sochira is the polite/formal way to say "you/that side"; with a close friend the plain socchi fits, sochira sounds stiffly formal here.'),
  ('sonomama is a state, not an object — it takes de, the particle of manner.', 'sonomama is a state, not an object; it takes de, the particle of manner.'),
  ('sou desu confirms a fact you already knew, but they just told you something new — a plain hai fits better than affirming it as known.', 'sou desu confirms a fact you already knew, but they just told you something new; a plain hai fits better than affirming it as known.'),
  ('sou desu confirms a fact you were told. This was an instruction, not something to affirm — a plain hai fits better.', 'sou desu confirms a fact you were told. This was an instruction, not something to affirm; a plain hai fits better.'),
  ('sugiru describes passing a point, which takes o, not ni — ni would mark the light as a destination you stop at.', 'sugiru describes passing a point, which takes o, not ni; ni would mark the light as a destination you stop at.'),
  ('suki is an adjective — what you like takes ga.', 'suki is an adjective; what you like takes ga.'),
  ('sumimasen apologises for a bother. They have just served you politely — plain thanks fits, not an apology.', 'sumimasen apologises for a bother. They have just served you politely; plain thanks fits, not an apology.'),
  ('sumimasen apologises for causing trouble. Being seated is not an inconvenience to apologise for — plain thanks fits: arigatou gozaimasu.', 'sumimasen apologises for causing trouble. Being seated is not an inconvenience to apologise for; plain thanks fits: arigatou gozaimasu.'),
  ('sumimasen deshita apologises for a finished inconvenience. You have nothing to apologise for — you are thanking them for the change.', 'sumimasen deshita apologises for a finished inconvenience. You have nothing to apologise for; you are thanking them for the change.'),
  ('suru for choosing an option takes ni, marking what you are settling on — sore ni shimasu.', 'suru for choosing an option takes ni, marking what you are settling on: sore ni shimasu.'),
  ('suru is plain present or future "do" — it does not convey "not yet done". The pending-state explanation is mada na n desu.', 'suru is plain present or future "do"; it does not convey "not yet done". The pending-state explanation is mada na n desu.'),
  ('suru means "to decide on" or "to make into" — it cannot attach to a plain location like "right there" as a reason.', 'suru means "to decide on" or "to make into"; it cannot attach to a plain location like "right there" as a reason.'),
  ('suru takes an object — the sound is what is being made smaller, so o.', 'suru takes an object; the sound is what is being made smaller, so o.'),
  ('suterareru is the potential/passive form — "can be thrown away" or "gets thrown away." Stating what YOU will do is the plain sutemasu.', 'suterareru is the potential/passive form: "can be thrown away" or "gets thrown away." Stating what YOU will do is the plain sutemasu.'),
  ('sutesaseta is causative — having someone else throw it away. You mean simply throwing it away, not making someone do it.', 'sutesaseta is causative: having someone else throw it away. You mean simply throwing it away, not making someone do it.'),
  ('tabun ("maybe") undercuts a fact you actually know for certain — you know you have no card, so state it plainly as arimasen.', 'tabun ("maybe") undercuts a fact you actually know for certain; you know you have no card, so state it plainly as arimasen.'),
  ('tadaima announces a RETURN home — you are heading off on a trip, the opposite direction.', 'tadaima announces a RETURN home; you are heading off on a trip, the opposite direction.'),
  ('tadaima announces arriving home — it has nothing to do with ending a phone call, which is shitsurei shimasu.', 'tadaima announces arriving home; it has nothing to do with ending a phone call, which is shitsurei shimasu.'),
  ('tai desu states a want — saying you want it contradicts turning the colour down.', 'tai desu states a want; saying you want it contradicts turning the colour down.'),
  ('tai desu states your own desire, but the clerk already made the offer — accepting it directly is onegai shimasu.', 'tai desu states your own desire, but the clerk already made the offer; accepting it directly is onegai shimasu.'),
  ('tanonde moratte would mean having someone else order on your friend''s behalf — you are asking your friend directly to order and have it ready, which is te oite.', 'tanonde moratte would mean having someone else order on your friend''s behalf; you are asking your friend directly to order and have it ready, which is te oite.'),
  ('tariru is intransitive — what is insufficient takes ga.', 'tariru is intransitive; what is insufficient takes ga.'),
  ('tasukaru is already the intransitive "be helped" — adding the passive -rareru on top is redundant and ungrammatical.', 'tasukaru is already the intransitive "be helped"; adding the passive -rareru on top is redundant and ungrammatical.'),
  ('tasukemasu is a future/volitional statement, "I will help/rescue" — describing the relief you feel from their favor needs the stative tasukarimasu, not tasukemasu.', 'tasukemasu is a future/volitional statement, "I will help/rescue"; describing the relief you feel from their favor needs the stative tasukarimasu, not tasukemasu.'),
  ('tasukemasu means "I will help someone" — it says YOU will do the helping. tasukarimasu is the form for something helping or benefiting YOU, which is what you mean.', 'tasukemasu means "I will help someone"; it says YOU will do the helping. tasukarimasu is the form for something helping or benefiting YOU, which is what you mean.'),
  ('tasukeru means "I will rescue/help" — you mean the opposite, that YOU are being helped: tasukaru.', 'tasukeru means "I will rescue/help"; you mean the opposite, that YOU are being helped: tasukaru.'),
  ('te ageru frames finishing your own assigned work as a favor granted to your manager, which sounds presumptuous — plain tsukurimasu is enough.', 'te ageru frames finishing your own assigned work as a favor granted to your manager, which sounds presumptuous; plain tsukurimasu is enough.'),
  ('te ageru would frame Sato''s return as a favor done for the caller, which does not fit a plain prediction — modoru alone is what is needed.', 'te ageru would frame Sato''s return as a favor done for the caller, which does not fit a plain prediction; modoru alone is what is needed.'),
  ('te mo ii ka asks blanket permission — "is it okay anywhere." Asking WHERE specifically needs the doko + ba-form + ii desu ka pattern.', 'te mo ii ka asks blanket permission: "is it okay anywhere." Asking WHERE specifically needs the doko + ba-form + ii desu ka pattern.'),
  ('te-agemasu frames simply staying home as a favor granted to someone. There''s no one being done a favor here — it''s just your own arrangement.', 'te-agemasu frames simply staying home as a favor granted to someone. There''s no one being done a favor here; it''s just your own arrangement.'),
  ('te-imasu describes an action already in progress. You have not started yet — plain shimemasu.', 'te-imasu describes an action already in progress. You have not started yet: plain shimemasu.'),
  ('te-itadaku is receiving a favour — that says they will send it for you.', 'te-itadaku is receiving a favour; that says they will send it for you.'),
  ('that asks permission to send "an email" as the object, not the report via email — the report is what is sent (repooto o), the email is the means (meeru de).', 'that asks permission to send "an email" as the object, not the report via email; the report is what is sent (repooto o), the email is the means (meeru de).'),
  ('the explanatory form needs n before desu — aru n desu, not aru desu. Dropping the n loses the explanatory nuance and sounds broken.', 'the explanatory form needs n before desu: aru n desu, not aru desu. Dropping the n loses the explanatory nuance and sounds broken.'),
  ('the plain casual ii? to your department head is far too familiar — yoroshii desu ka is the polite register for approaching a superior.', 'the plain casual ii? to your department head is far too familiar; yoroshii desu ka is the polite register for approaching a superior.'),
  ('to ii ka is not how you check whether something suffices — the conditional ba plus ii ka is the pattern: motte kureba ii desu ka.', 'to ii ka is not how you check whether something suffices; the conditional ba plus ii ka is the pattern: motte kureba ii desu ka.'),
  ('tomaru is intransitive — the car stops by itself. Asking the driver to STOP the car needs the transitive tomeru.', 'tomaru is intransitive; the car stops by itself. Asking the driver to STOP the car needs the transitive tomeru.'),
  ('tomesaseru is causative ("make/let someone stop") — asking a favor for yourself needs the potential moraeru, not the causative.', 'tomesaseru is causative ("make/let someone stop"); asking a favor for yourself needs the potential moraeru, not the causative.'),
  ('tsu is the general counter. A ticket is flat, and flat things take mai — nimai.', 'tsu is the general counter. A ticket is flat, and flat things take mai: nimai.'),
  ('tsukau takes an object with o — the thing being used, nani, needs o here, and ajitsuke becomes the topic with wa.', 'tsukau takes an object with o; the thing being used, nani, needs o here, and ajitsuke becomes the topic with wa.'),
  ('tsukero is the bare imperative — blunt enough to sound like an order. Asking a housemate for a small favor needs the te-form request tsukete moraemasu ka, not a command.', 'tsukero is the bare imperative, blunt enough to sound like an order. Asking a housemate for a small favor needs the te-form request tsukete moraemasu ka, not a command.'),
  ('tsumaru is intransitive, "to get jammed" — what jams takes ga, not o.', 'tsumaru is intransitive, "to get jammed"; what jams takes ga, not o.'),
  ('ugoku is intransitive — the train moves by itself.', 'ugoku is intransitive; the train moves by itself.'),
  ('ukagau is humble language for asking someone senior; inviting a fellow new colleague to ask casually just needs kiku — ukagau would oddly lower Tanaka instead of you.', 'ukagau is humble language for asking someone senior; inviting a fellow new colleague to ask casually just needs kiku (ukagau would oddly lower Tanaka instead of you).'),
  ('urikiru is transitive — the shop sells something out. The eggs being unavailable is the intransitive urikireru, and da cannot attach to the plain past uritta anyway.', 'urikiru is transitive; the shop sells something out. The eggs being unavailable is the intransitive urikireru, and da cannot attach to the plain past uritta anyway.'),
  ('wa here reads as contrasting the counter against something else, and daijoubu desu alone usually means no thank you — together it sounds like you are turning the counter down, not taking it.', 'wa here reads as contrasting the counter against something else, and daijoubu desu alone usually means no thank you; together it sounds like you are turning the counter down, not taking it.'),
  ('wa makes kore the topic — "as for this one" — which sets up a contrast you never finish. Ordering takes o.', 'wa makes kore the topic ("as for this one"), which sets up a contrast you never finish. Ordering takes o.'),
  ('wakarimasen says you do NOT understand — the opposite of confirming you got it.', 'wakarimasen says you do NOT understand, the opposite of confirming you got it.'),
  ('wakarimasen says you do NOT understand — the opposite of what you mean here.', 'wakarimasen says you do NOT understand, the opposite of what you mean here.'),
  ('wakarimashita politely closes the sentence, but the casual ne right after snaps back — mixing keigo and casual sentence-final particles in one line reads as inconsistent with a friend.', 'wakarimashita politely closes the sentence, but the casual ne right after snaps back; mixing keigo and casual sentence-final particles in one line reads as inconsistent with a friend.'),
  ('wakarimasu is a general ability, not an acknowledgement of a specific instruction just given — that is wakarimashita.', 'wakarimasu is a general ability, not an acknowledgement of a specific instruction just given; that is wakarimashita.'),
  ('wakaru is "to understand" — a different verb entirely. Separating things into two bags is wakeru.', 'wakaru is "to understand", a different verb entirely. Separating things into two bags is wakeru.'),
  ('wakaru is intransitive — it is closer to "becomes clear to me". What you understand takes ga.', 'wakaru is intransitive; it is closer to "becomes clear to me". What you understand takes ga.'),
  ('wakaru takes ga, not o — what is understood is the subject.', 'wakaru takes ga, not o; what is understood is the subject.'),
  ('watasu, to hand over, takes ni for the receiver, not o — that would make YOU the thing being handed over.', 'watasu, to hand over, takes ni for the receiver, not o; that would make YOU the thing being handed over.'),
  ('with the person in front of you — let''s treasure that too.', 'with the person in front of you, let''s treasure that too.'),
  ('yo tells THEM — it contradicts the person who just informed you.', 'yo tells THEM; it contradicts the person who just informed you.'),
  ('yo tells them something they did not know — but they just told you. ne confirms.', 'yo tells them something they did not know, but they just told you. ne confirms.'),
  ('yokunai negates it — that says you do not like it, the opposite of thanking them for a good cut.', 'yokunai negates it; that says you do not like it, the opposite of thanking them for a good cut.'),
  ('yomitoreru is a potential form — the barcode that fails to be picked up is the subject, so ga.', 'yomitoreru is a potential form; the barcode that fails to be picked up is the subject, so ga.'),
  ('you do not add san to your own colleague''s name when speaking with an outside caller — inside the company they are referred to with no honorific at all.', 'you do not add san to your own colleague''s name when speaking with an outside caller; inside the company they are referred to with no honorific at all.'),
  ('「行く」と言っていた compressed to 行くって. The verb of saying dropped out and left the particle to do the whole job.

That is why って can stand where と cannot — 田中さんって人, 明日って本当？ — and why it needs no verb after it. The saying is already implied by the particle that used to mark it.', '「行く」と言っていた compressed to 行くって. The verb of saying dropped out and left the particle to do the whole job.

That is why って can stand where と cannot (田中さんって人, 明日って本当？), and why it needs no verb after it. The saying is already implied by the particle that used to mark it.'),
  ('「行く」と言っていた compressed to 行くって. Which route it took is disputed — a gemination of classical とて, or a contraction of と言って, or of という, which is the account usually given for the topic use.

That is why って can stand where と cannot — 田中さんって人, 明日って本当？ — and why it needs no verb after it. The saying is already implied by the particle that used to mark it.', '「行く」と言っていた compressed to 行くって. Which route it took is disputed: a gemination of classical とて, or a contraction of と言って, or of という, which is the account usually given for the topic use.

That is why って can stand where と cannot (田中さんって人, 明日って本当？), and why it needs no verb after it. The saying is already implied by the particle that used to mark it.'),
  ('〜ても is "even if"; いい is the plain adjective. 食べてもいい says that even in the case of eating, things are fine.

Nothing has been idiomatised, which is why the negative works by the ordinary rules: 食べなくてもいい is "even not eating, it is fine" — you do not have to. And 食べてはいけない, the refusal, swaps two things: いい for いけない, "it will not go", and も for は, because it singles the case out rather than conceding it.', '〜ても is "even if"; いい is the plain adjective. 食べてもいい says that even in the case of eating, things are fine.

Nothing has been idiomatised, which is why the negative works by the ordinary rules: 食べなくてもいい is "even not eating, it is fine"; you do not have to. And 食べてはいけない, the refusal, swaps two things: いい for いけない, "it will not go", and も for は, because it singles the case out rather than conceding it.'),
  ('〜ても is "even if"; いい is the plain adjective. 食べてもいい says that even in the case of eating, things are fine.

Nothing has been idiomatised, which is why the negative works by the ordinary rules: 食べなくてもいい is "even not eating, it is fine" — you do not have to. And 食べてはいけない, the refusal, swaps いい for いけない, "it will not go".', '〜ても is "even if"; いい is the plain adjective. 食べてもいい says that even in the case of eating, things are fine.

Nothing has been idiomatised, which is why the negative works by the ordinary rules: 食べなくてもいい is "even not eating, it is fine"; you do not have to. And 食べてはいけない, the refusal, swaps いい for いけない, "it will not go".'),
  ('あげく is 挙句 — the closing verse of a linked-verse poem.', 'あげく is 挙句, the closing verse of a linked-verse poem.'),
  ('あげる is 上げる, "to raise" — and the upward hand-off was originally deferential.', 'あげる is 上げる, "to raise", and the upward hand-off was originally deferential.'),
  ('あげる is 上げる, "to raise" — giving is pictured as handing upward.', 'あげる is 上げる, "to raise"; giving is pictured as handing upward.'),
  ('あらず is あり with the classical negative ず — the ancestor of ではない.', 'あらず is あり with the classical negative ず, the ancestor of ではない.'),
  ('あり was the Old Japanese existence verb, ancestor of ある. にあらず is the classical way of denying identity.

It survives in mottoes and set phrases — 人にあらず — for the same reason べからず survives on signs. The modern ではない descends from the same construction with で in place of に.', 'あり was the Old Japanese existence verb, ancestor of ある. にあらず is the classical way of denying identity.

It survives in mottoes and set phrases (人にあらず) for the same reason べからず survives on signs. The modern ではない descends from the same construction with で in place of に.'),
  ('あり was the Old Japanese existence verb, ancestor of ある. にあらず is the classical way of denying identity.

It survives in mottoes and set phrases — 人にあらず — for the same reason べからず survives on signs. The modern ではない descends from the very same construction: its で is にて worn down, so the に never actually left.', 'あり was the Old Japanese existence verb, ancestor of ある. にあらず is the classical way of denying identity.

It survives in mottoes and set phrases (人にあらず) for the same reason べからず survives on signs. The modern ではない descends from the very same construction: its で is にて worn down, so the に never actually left.'),
  ('ある is for what does not — objects, buildings, plans. いる is for what does: people and animals. The division is animacy, not size or importance — and it is younger than it looks. Classical Japanese used あり of people freely: 昔、男ありけり.

It reaches much further than this lesson. ている is built on いる and describes something in progress; てある is built on ある and describes a thing left in a state. The split you learn here is the one those two patterns rest on.', 'ある is for what does not: objects, buildings, plans. いる is for what does: people and animals. The division is animacy, not size or importance. And it is younger than it looks. Classical Japanese used あり of people freely: 昔、男ありけり.

It reaches much further than this lesson. ている is built on いる and describes something in progress; てある is built on ある and describes a thing left in a state. The split you learn here is the one those two patterns rest on.'),
  ('ある is for what does not — objects, buildings, plans. いる is for what does: people and animals. The division is animacy, not size or importance.

It reaches much further than this lesson. ている is built on いる and describes something in progress; てある is built on ある and describes a thing left in a state. The split you learn here is the one those two patterns rest on.', 'ある is for what does not: objects, buildings, plans. いる is for what does: people and animals. The division is animacy, not size or importance.

It reaches much further than this lesson. ている is built on いる and describes something in progress; てある is built on ある and describes a thing left in a state. The split you learn here is the one those two patterns rest on.'),
  ('あれ is the classical imperative of あり. Telling a hypothetical to be whatever it likes is a way of saying it changes nothing.

子供であれ大人であれ: be it a child, be it an adult. English does the same with "be it" — a fossil imperative in both languages, doing concession rather than command.', 'あれ is the classical imperative of あり. Telling a hypothetical to be whatever it likes is a way of saying it changes nothing.

子供であれ大人であれ: be it a child, be it an adult. English does the same with "be it", a fossil imperative in both languages, doing concession rather than command.'),
  ('い-adjectives carry their own tense, so 高いでした is wrong — です adds politeness, never past. The adjective has already done that job.', 'い-adjectives carry their own tense, so 高いでした is wrong; です adds politeness, never past. The adjective has already done that job.'),
  ('い-adjectives conjugate because they are verbs of a kind — they carry their own tense.', 'い-adjectives conjugate because they are verbs of a kind; they carry their own tense.'),
  ('いえ is the 已然形 of 言う; ども is Old Japanese for "even though". The whole is "even though one says".

And it is the identical ども taught at N5 inside けれども — the ancestor of けれど and けど. One particle, one meaning, at the two ends of the syllabus: the casual けど and the lofty といえども are the same word wearing different amounts of its original self.', 'いえ is the 已然形 of 言う; ども is Old Japanese for "even though". The whole is "even though one says".

And it is the identical ども taught at N5 inside けれども, the ancestor of けれど and けど. One particle, one meaning, at the two ends of the syllabus: the casual けど and the lofty といえども are the same word wearing different amounts of its original self.'),
  ('いけません is 行く — it will not go, so it will not do.', 'いけません is 行く: it will not go, so it will not do.'),
  ('いただく is 頂く — 頂 is the crown of the head, and the word means to raise something above it.', 'いただく is 頂く: 頂 is the crown of the head, and the word means to raise something above it.'),
  ('いつも is the question word いつ swept by も into "always", the same も that makes 誰も into "nobody"; 何時 is only how it is spelled. たま is a native noun for something rare — dictionaries connect it to 玉 — and 偶 is a character laid on it afterwards. 時々 is the repetition mark doing what it looks like.

よく is the odd one out and the only transparent one: it is the adverbial form of 良い. That an adverb meaning "well" also means "often" is simply a sense the dictionaries list, not a route anyone can trace.', 'いつも is the question word いつ swept by も into "always", the same も that makes 誰も into "nobody"; 何時 is only how it is spelled. たま is a native noun for something rare (dictionaries connect it to 玉) and 偶 is a character laid on it afterwards. 時々 is the repetition mark doing what it looks like.

よく is the odd one out and the only transparent one: it is the adverbial form of 良い. That an adverb meaning "well" also means "often" is simply a sense the dictionaries list, not a route anyone can trace.'),
  ('いつも is いつ with も; たまに is the old noun たま — the kanji on both were fitted later.', 'いつも is いつ with も; たまに is the old noun たま. The kanji on both were fitted later.'),
  ('いつも is 何時も — "whenever" swept by も into "always", the same も that makes 誰も into "nobody". 時々 is the repetition mark doing what it looks like. たまに is 偶に, from 偶, "by chance".

よく is the odd one out: it is the adverbial form of 良い, so "often" is literally "well". The frequency sense grew out of doing something thoroughly.', 'いつも is 何時も: "whenever" swept by も into "always", the same も that makes 誰も into "nobody". 時々 is the repetition mark doing what it looks like. たまに is 偶に, from 偶, "by chance".

よく is the odd one out: it is the adverbial form of 良い, so "often" is literally "well". The frequency sense grew out of doing something thoroughly.'),
  ('うち is 内, "the inside" — inside a stretch of time, before it closes.', 'うち is 内, "the inside": inside a stretch of time, before it closes.'),
  ('おかげ is お陰 — the honourable shade, the shadow of something you shelter under.', 'おかげ is お陰, the honourable shade, the shadow of something you shelter under.'),
  ('おそれ is 恐れ, the noun from 恐れる — a fear.', 'おそれ is 恐れ, the noun from 恐れる (a fear).'),
  ('お願いします is the humble お〜する form of that verb: I respectfully do the wishing. The construction is the one taught at N4.

So it is not a fixed phrase but ordinary grammar, which is why it scales — お願いいたします is humbler still, and よろしくお願いします adds "favourably" to the wish. The 願 is doing real work every time.', 'お願いします is the humble お〜する form of that verb: I respectfully do the wishing. The construction is the one taught at N4.

So it is not a fixed phrase but ordinary grammar, which is why it scales: お願いいたします is humbler still, and よろしくお願いします adds "favourably" to the wish. The 願 is doing real work every time.'),
  ('か is the question particle, も is "even", and 知れない is the negative potential of 知れる, "to become known". Nothing in it has been idiomatised away.

Read that way the low confidence is not a fact to memorise, it is the sentence. かもしれない claims only that the question is open — which is why it sits below でしょう and far below はず, and why the polite かもしれません keeps the same shape rather than becoming a different word.', 'か is the question particle, も is "even", and 知れない is the negative potential of 知れる, "to become known". Nothing in it has been idiomatised away.

Read that way the low confidence is not a fact to memorise, it is the sentence. かもしれない claims only that the question is open, which is why it sits below でしょう and far below はず, and why the polite かもしれません keeps the same shape rather than becoming a different word.'),
  ('かお already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — かお does not, so it voices. Once you can spot that, readings like えがお stop needing to be memorised one at a time.', 'かお already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; かお does not, so it voices. Once you can spot that, readings like えがお stop needing to be memorised one at a time.'),
  ('かぎり is 限り, the 連用形 of 限る — "to set a boundary".', 'かぎり is 限り, the 連用形 of 限る: "to set a boundary".'),
  ('かけ is 掛け, from 掛ける — "to hang".', 'かけ is 掛け, from 掛ける: "to hang".'),
  ('かた already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — かた does not, so it voices. Once you can spot that, readings like ひとがた stop needing to be memorised one at a time.', 'かた already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; かた does not, so it voices. Once you can spot that, readings like ひとがた stop needing to be memorised one at a time.'),
  ('かた already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — かた does not, so it voices. Once you can spot that, readings like ゆうがた stop needing to be memorised one at a time.', 'かた already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; かた does not, so it voices. Once you can spot that, readings like ゆうがた stop needing to be memorised one at a time.'),
  ('かた is 方 — the same 方 as in ほうが, meaning a direction or a way.', 'かた is 方, the same 方 as in ほうが, meaning a direction or a way.'),
  ('かた is 方, a direction or way — the native reading of the character read ほう in ほうが.', 'かた is 方, a direction or way, the native reading of the character read ほう in ほうが.'),
  ('かった is the adverbial く with あった, contracted — the adjective borrowing a verb''s past.', 'かった is the adverbial く with あった, contracted: the adjective borrowing a verb''s past.'),
  ('かどうか is literally "whether — how — whether": a question left standing inside a sentence.', 'かどうか is literally "whether, how, whether": a question left standing inside a sentence.'),
  ('かね already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — かね does not, so it voices. Once you can spot that, readings like くろがね stop needing to be memorised one at a time.', 'かね already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; かね does not, so it voices. Once you can spot that, readings like くろがね stop needing to be memorised one at a time.'),
  ('かね already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — かね does not, so it voices. Once you can spot that, readings like こがね stop needing to be memorised one at a time.', 'かね already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; かね does not, so it voices. Once you can spot that, readings like こがね stop needing to be memorised one at a time.'),
  ('かね already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — かね does not, so it voices. Once you can spot that, readings like はりがね stop needing to be memorised one at a time.', 'かね already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; かね does not, so it voices. Once you can spot that, readings like はりがね stop needing to be memorised one at a time.'),
  ('かねる means to be unable to bring oneself to do something — 分かりかねます, "I am not in a position to know". Negate it and you get "it is not that this could not happen".

That is the whole reason かねない means "might well" while かねる means "cannot", two opposite-looking forms one syllable apart. And it explains the tone: you only bother saying a bad thing is not impossible when you are worried about it.', 'かねる means to be unable to bring oneself to do something: 分かりかねます, "I am not in a position to know". Negate it and you get "it is not that this could not happen".

That is the whole reason かねない means "might well" while かねる means "cannot", two opposite-looking forms one syllable apart. And it explains the tone: you only bother saying a bad thing is not impossible when you are worried about it.'),
  ('かみ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — かみ does not, so it voices. Once you can spot that, readings like てがみ stop needing to be memorised one at a time.', 'かみ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; かみ does not, so it voices. Once you can spot that, readings like てがみ stop needing to be memorised one at a time.'),
  ('から already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — から does not, so it voices. Once you can spot that, readings like かいがら stop needing to be memorised one at a time.', 'から already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; から does not, so it voices. Once you can spot that, readings like かいがら stop needing to be memorised one at a time.'),
  ('から is a subjective reason — your judgement. ので is softer and more objective, which is why requests and excuses often prefer ので.', 'から is a subjective reason, your judgement. ので is softer and more objective, which is why requests and excuses often prefer ので.'),
  ('から is the 柄 taught at N5 for reasons — an origin or source. まで marks a limit reached and not passed. Put them together and you have a span with both ends named.

The pair works for time, place and quantity alike because neither particle was ever specialised: 九時から五時まで, 東京から大阪まで, 一から十まで.', 'から is the 柄 taught at N5 for reasons: an origin or source. まで marks a limit reached and not passed. Put them together and you have a span with both ends named.

The pair works for time, place and quantity alike because neither particle was ever specialised: 九時から五時まで, 東京から大阪まで, 一から十まで.'),
  ('から states your reasoning; ので presents a circumstance. That is why excuses and requests reach for ので — it sounds less like an argument.', 'から states your reasoning; ので presents a circumstance. That is why excuses and requests reach for ので; it sounds less like an argument.'),
  ('からといって is "just because one says から" — the reason quoted rather than accepted.', 'からといって is "just because one says から", the reason quoted rather than accepted.'),
  ('かる already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — かる does not, so it voices. Once you can spot that, readings like きがる stop needing to be memorised one at a time.', 'かる already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; かる does not, so it voices. Once you can spot that, readings like きがる stop needing to be memorised one at a time.'),
  ('かる already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — かる does not, so it voices. Once you can spot that, readings like てがる stop needing to be memorised one at a time.', 'かる already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; かる does not, so it voices. Once you can spot that, readings like てがる stop needing to be memorised one at a time.'),
  ('かわ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — かわ does not, so it voices. Once you can spot that, readings like けがわ stop needing to be memorised one at a time.', 'かわ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; かわ does not, so it voices. Once you can spot that, readings like けがわ stop needing to be memorised one at a time.'),
  ('かわり is 代わり, from 代わる — "to take the place of".', 'かわり is 代わり, from 代わる: "to take the place of".'),
  ('がたい is 難い — the same 難 as にくい, in its other reading.', 'がたい is 難い, the same 難 as にくい, in its other reading.'),
  ('がち is 勝ち, from 勝つ — "to win, to prevail".', 'がち is 勝ち, from 勝つ: "to win, to prevail".'),
  ('き already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — き does not, so it voices. Once you can spot that, readings like うわぎ stop needing to be memorised one at a time.', 'き already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; き does not, so it voices. Once you can spot that, readings like うわぎ stop needing to be memorised one at a time.'),
  ('き already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — き does not, so it voices. Once you can spot that, readings like したぎ stop needing to be memorised one at a time.', 'き already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; き does not, so it voices. Once you can spot that, readings like したぎ stop needing to be memorised one at a time.'),
  ('き already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — き does not, so it voices. Once you can spot that, readings like はだぎ stop needing to be memorised one at a time.', 'き already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; き does not, so it voices. Once you can spot that, readings like はだぎ stop needing to be memorised one at a time.'),
  ('き already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — き does not, so it voices. Once you can spot that, readings like みずぎ stop needing to be memorised one at a time.', 'き already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; き does not, so it voices. Once you can spot that, readings like みずぎ stop needing to be memorised one at a time.'),
  ('き was the Old Japanese past tense, and や asked. 思いきや is "one thought, did one?" — a question that answers itself in the negative.

That is why the pattern always overturns what precedes it. 簡単だと思いきや難しかった: the thinking is raised as a question in order to be dismissed, and the surprise is built into the classical grammar rather than added by tone.', 'き was the Old Japanese past tense, and や asked. 思いきや is "one thought, did one?", a question that answers itself in the negative.

That is why the pattern always overturns what precedes it. 簡単だと思いきや難しかった: the thinking is raised as a question in order to be dismissed, and the surprise is built into the classical grammar rather than added by tone.'),
  ('きや is the classical past き with the question particle や — "did one think?"', 'きや is the classical past き with the question particle や: "did one think?"'),
  ('きり is 切り, from 切る — "to cut". Something has been cut off.', 'きり is 切り, from 切る: "to cut". Something has been cut off.'),
  ('きわ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — きわ does not, so it voices. Once you can spot that, readings like てぎわ stop needing to be memorised one at a time.', 'きわ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; きわ does not, so it voices. Once you can spot that, readings like てぎわ stop needing to be memorised one at a time.'),
  ('く and に are not adverb endings bolted on — they are the 連用形 of the two adjective classes.', 'く and に are not adverb endings bolted on; they are the 連用形 of the two adjective classes.'),
  ('くせ is 癖, a habit — and usually a bad one.', 'くせ is 癖, a habit, and usually a bad one.'),
  ('くち already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — くち does not, so it voices. Once you can spot that, readings like うらぐち stop needing to be memorised one at a time.', 'くち already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; くち does not, so it voices. Once you can spot that, readings like うらぐち stop needing to be memorised one at a time.'),
  ('くち already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — くち does not, so it voices. Once you can spot that, readings like でぐち stop needing to be memorised one at a time.', 'くち already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; くち does not, so it voices. Once you can spot that, readings like でぐち stop needing to be memorised one at a time.'),
  ('くち already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — くち does not, so it voices. Once you can spot that, readings like ひぐち stop needing to be memorised one at a time.', 'くち already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; くち does not, so it voices. Once you can spot that, readings like ひぐち stop needing to be memorised one at a time.'),
  ('くち already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — くち does not, so it voices. Once you can spot that, readings like まどぐち stop needing to be memorised one at a time.', 'くち already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; くち does not, so it voices. Once you can spot that, readings like まどぐち stop needing to be memorised one at a time.'),
  ('くち already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — くち does not, so it voices. Once you can spot that, readings like わるぐち stop needing to be memorised one at a time.', 'くち already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; くち does not, so it voices. Once you can spot that, readings like わるぐち stop needing to be memorised one at a time.'),
  ('くない is the adverbial く with ない — an adjective modified by another adjective.', 'くない is the adverbial く with ない, an adjective modified by another adjective.'),
  ('くら already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — くら does not, so it voices. Once you can spot that, readings like かねぐら stop needing to be memorised one at a time.', 'くら already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; くら does not, so it voices. Once you can spot that, readings like かねぐら stop needing to be memorised one at a time.'),
  ('くるま already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — くるま does not, so it voices. Once you can spot that, readings like はぐるま stop needing to be memorised one at a time.', 'くるま already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; くるま does not, so it voices. Once you can spot that, readings like はぐるま stop needing to be memorised one at a time.'),
  ('ぐらい is 位, a rank on a scale — which is why it is vaguer than a number.', 'ぐらい is 位, a rank on a scale, which is why it is vaguer than a number.'),
  ('け already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — け does not, so it voices. Once you can spot that, readings like ひるげ stop needing to be memorised one at a time.', 'け already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; け does not, so it voices. Once you can spot that, readings like ひるげ stop needing to be memorised one at a time.'),
  ('けど is the worn-down end of けれども — the adjective ending けれ plus the concessive ども.', 'けど is the worn-down end of けれども: the adjective ending けれ plus the concessive ども.'),
  ('けり marked something recalled or newly noticed rather than plainly reported. Worn down through け, it survives only in this small casual ending.

The old meaning is intact. っけ never asks a fresh question — it asks you to help retrieve something the speaker feels they already knew, which is why 何だっけ is natural and asking a stranger 名前は何だっけ is not.', 'けり marked something recalled or newly noticed rather than plainly reported. Worn down through け, it survives only in this small casual ending.

The old meaning is intact. っけ never asks a fresh question; it asks you to help retrieve something the speaker feels they already knew, which is why 何だっけ is natural and asking a stranger 名前は何だっけ is not.'),
  ('げ is け, "air, appearance" — conventionally written 気.', 'げ is け, "air, appearance", conventionally written 気.'),
  ('こ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — こ does not, so it voices. Once you can spot that, readings like おさなご stop needing to be memorised one at a time.', 'こ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; こ does not, so it voices. Once you can spot that, readings like おさなご stop needing to be memorised one at a time.'),
  ('こ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — こ does not, so it voices. Once you can spot that, readings like なかご stop needing to be memorised one at a time.', 'こ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; こ does not, so it voices. Once you can spot that, readings like なかご stop needing to be memorised one at a time.'),
  ('こ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — こ does not, so it voices. Once you can spot that, readings like ふたご stop needing to be memorised one at a time.', 'こ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; こ does not, so it voices. Once you can spot that, readings like ふたご stop needing to be memorised one at a time.'),
  ('こ, そ, あ and ど are the demonstrative roots taught with これ・それ・あれ・どれ, and ど is the interrogative one — hence どこ, どれ, どの, どちら and どう, which fills the こう・そう・ああ・どう row.

なに, だれ and いつ belong to no such series, which is why none of them takes a ど. Knowing which questions come out of the demonstrative grid and which stand alone saves trying to force all of them into one table.', 'こ, そ, あ and ど are the demonstrative roots taught with これ・それ・あれ・どれ, and ど is the interrogative one, hence どこ, どれ, どの, どちら and どう, which fills the こう・そう・ああ・どう row.

なに, だれ and いつ belong to no such series, which is why none of them takes a ど. Knowing which questions come out of the demonstrative grid and which stand alone saves trying to force all of them into one table.'),
  ('こ, そ, あ and ど are the demonstrative roots taught with これ・それ・あれ・どれ, and ど is the interrogative one — hence どこ, どれ, どの, どちら.

But なに, だれ and いつ stand outside that grid entirely, which is why they take no ど. Recognising which questions come from the demonstrative series and which do not saves trying to force all of them into one table.', 'こ, そ, あ and ど are the demonstrative roots taught with これ・それ・あれ・どれ, and ど is the interrogative one, hence どこ, どれ, どの, どちら.

But なに, だれ and いつ stand outside that grid entirely, which is why they take no ど. Recognising which questions come from the demonstrative series and which do not saves trying to force all of them into one table.'),
  ('こso singles one thing out as the one that counts, and in classical Japanese it forced a particular ending on the sentence — 係り結び. Attached to a condition, it insists that this and no other is the reason.

愛すればこそ叱る: precisely because there is love. The ば supplies the cause, こそ refuses every competing one, and neither part means "precisely" on its own.', 'こso singles one thing out as the one that counts, and in classical Japanese it forced a particular ending on the sentence: 係り結び. Attached to a condition, it insists that this and no other is the reason.

愛すればこそ叱る: precisely because there is love. The ば supplies the cause, こそ refuses every competing one, and neither part means "precisely" on its own.'),
  ('こころ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — こころ does not, so it voices. Once you can spot that, readings like したごころ stop needing to be memorised one at a time.', 'こころ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; こころ does not, so it voices. Once you can spot that, readings like したごころ stop needing to be memorised one at a time.'),
  ('こころ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — こころ does not, so it voices. Once you can spot that, readings like まごころ stop needing to be memorised one at a time.', 'こころ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; こころ does not, so it voices. Once you can spot that, readings like まごころ stop needing to be memorised one at a time.'),
  ('こと already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — こと does not, so it voices. Once you can spot that, readings like おおごと stop needing to be memorised one at a time.', 'こと already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; こと does not, so it voices. Once you can spot that, readings like おおごと stop needing to be memorised one at a time.'),
  ('こと already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — こと does not, so it voices. Once you can spot that, readings like ひとごと stop needing to be memorised one at a time.', 'こと already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; こと does not, so it voices. Once you can spot that, readings like ひとごと stop needing to be memorised one at a time.'),
  ('こと already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — こと does not, so it voices. Once you can spot that, readings like みごと stop needing to be memorised one at a time.', 'こと already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; こと does not, so it voices. Once you can spot that, readings like みごと stop needing to be memorised one at a time.'),
  ('こと already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — こと does not, so it voices. Once you can spot that, readings like ものごと stop needing to be memorised one at a time.', 'こと already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; こと does not, so it voices. Once you can spot that, readings like ものごと stop needing to be memorised one at a time.'),
  ('こと is a real noun meaning a fact or an affair, and it makes a clause into one of those. の is the nominalising particle, and what it makes is nearer to hand.

The rule everyone eventually learns follows from that difference rather than sitting on top of it. Verbs of perceiving take の — 彼が来るのを見た, because you watched the arriving, not the fact of it — while 約束する, 決める and できる take こと, because what you promise or decide is a matter, never a sight. Where either is possible, the sentence really is saying two slightly different things.', 'こと is a real noun meaning a fact or an affair, and it makes a clause into one of those. の is the nominalising particle, and what it makes is nearer to hand.

The rule everyone eventually learns follows from that difference rather than sitting on top of it. Verbs of perceiving take の (彼が来るのを見た, because you watched the arriving, not the fact of it), while 約束する, 決める and できる take こと, because what you promise or decide is a matter, never a sight. Where either is possible, the sentence really is saying two slightly different things.'),
  ('ことなく is こと with the classical なく — the matter does not occur.', 'ことなく is こと with the classical なく: the matter does not occur.'),
  ('ことにする is the noun こと with する — making a matter be so.', 'ことにする is the noun こと with する, making a matter be so.'),
  ('ことになる is こと with なる — a matter that comes to be so, with nobody named.', 'ことになる is こと with なる, a matter that comes to be so, with nobody named.'),
  ('これから marks a turning point rather than a time — it is "starting now", with the implication that things were different before.', 'これから marks a turning point rather than a time; it is "starting now", with the implication that things were different before.'),
  ('ころ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — ころ does not, so it voices. Once you can spot that, readings like ちかごろ stop needing to be memorised one at a time.', 'ころ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; ころ does not, so it voices. Once you can spot that, readings like ちかごろ stop needing to be memorised one at a time.'),
  ('ころ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — ころ does not, so it voices. Once you can spot that, readings like としごろ stop needing to be memorised one at a time.', 'ころ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; ころ does not, so it voices. Once you can spot that, readings like としごろ stop needing to be memorised one at a time.'),
  ('ころ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — ころ does not, so it voices. Once you can spot that, readings like ひごろ stop needing to be memorised one at a time.', 'ころ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; ころ does not, so it voices. Once you can spot that, readings like ひごろ stop needing to be memorised one at a time.'),
  ('こんにちは and こんばんは end in は because they are the topic particle — each is half of a dropped sentence about today or tonight.', 'こんにちは and こんばんは end in は because they are the topic particle; each is half of a dropped sentence about today or tonight.'),
  ('ごろ is 頃, a noun meaning a time or a season — a point, not a quantity.', 'ごろ is 頃, a noun meaning a time or a season, a point, not a quantity.'),
  ('さま already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — さま does not, so it voices. Once you can spot that, readings like とざま stop needing to be memorised one at a time.', 'さま already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; さま does not, so it voices. Once you can spot that, readings like とざま stop needing to be memorised one at a time.'),
  ('さら already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — さら does not, so it voices. Once you can spot that, readings like はいざら stop needing to be memorised one at a time.', 'さら already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; さら does not, so it voices. Once you can spot that, readings like はいざら stop needing to be memorised one at a time.'),
  ('さる is 然る — "such, that being so" — the same 然 as in そう and 然し.', 'さる is 然る ("such, that being so"), the same 然 as in そう and 然し.'),
  ('しな already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — しな does not, so it voices. Once you can spot that, readings like てじな stop needing to be memorised one at a time.', 'しな already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; しな does not, so it voices. Once you can spot that, readings like てじな stop needing to be memorised one at a time.'),
  ('しまう is 仕舞う — to put away, to close up a shop for the night.', 'しまう is 仕舞う, to put away, to close up a shop for the night.'),
  ('しるし already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — しるし does not, so it voices. Once you can spot that, readings like めじるし stop needing to be memorised one at a time.', 'しるし already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; しるし does not, so it voices. Once you can spot that, readings like めじるし stop needing to be memorised one at a time.'),
  ('しるし already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — しるし does not, so it voices. Once you can spot that, readings like やじるし stop needing to be memorised one at a time.', 'しるし already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; しるし does not, so it voices. Once you can spot that, readings like やじるし stop needing to be memorised one at a time.'),
  ('しろ is the imperative of する — telling the alternative to be so, and conceding it.', 'しろ is the imperative of する, telling the alternative to be so, and conceding it.'),
  ('じょうず is a genuine Sino-Japanese compound — the upper hand. へた is not its mirror: it is a native word, most likely 端 (はた), the shallow edge rather than the deep part, and 下手 was written onto it later to make the pair look symmetrical.

Both behave as な-adjectives, which is why the thing you are good at takes が. 日本語が上手です has no verb of ability in it, so there is nothing for を to mark, and 得意 and 苦手 take が for the same reason.', 'じょうず is a genuine Sino-Japanese compound, the upper hand. へた is not its mirror: it is a native word, most likely 端 (はた), the shallow edge rather than the deep part, and 下手 was written onto it later to make the pair look symmetrical.

Both behave as な-adjectives, which is why the thing you are good at takes が. 日本語が上手です has no verb of ability in it, so there is nothing for を to mark, and 得意 and 苦手 take が for the same reason.'),
  ('すぎない is 過ぎる negated — it does not go beyond.', 'すぎない is 過ぎる negated: it does not go beyond.'),
  ('すみません is 済む negated — "this is not settled".', 'すみません is 済む negated: "this is not settled".'),
  ('ずくめ has a contested origin — 尽く and 竦める both have backers.', 'ずくめ has a contested origin: 尽く and 竦める both have backers.'),
  ('ずくめ is 尽くめ, from 尽くす — "to exhaust, to use up entirely".', 'ずくめ is 尽くめ, from 尽くす: "to exhaust, to use up entirely".'),
  ('せい is 所為 — literally "the thing done", a doing that something is charged with.', 'せい is 所為, literally "the thing done", a doing that something is charged with.'),
  ('せる／させる makes someone do it; れる／られる then makes them the one it was done to. 食べさせられた parses as "was made to eat", each piece doing its own job.

The unwillingness is not an extra meaning anyone added. It falls out of the passive, which in Japanese carries the sense of something befalling you. Godan verbs also contract it — 行かせられる becomes 行かされる — which is worth recognising, because the short form is what people actually say.', 'せる／させる makes someone do it; れる／られる then makes them the one it was done to. 食べさせられた parses as "was made to eat", each piece doing its own job.

The unwillingness is not an extra meaning anyone added. It falls out of the passive, which in Japanese carries the sense of something befalling you. Godan verbs also contract it (行かせられる becomes 行かされる), which is worth recognising, because the short form is what people actually say.'),
  ('そうもない is the appearance そう with も and ない — not even looking like it.', 'そうもない is the appearance そう with も and ない, not even looking like it.'),
  ('そこねる is 損ねる, from 損なう — "to damage, to spoil".', 'そこねる is 損ねる, from 損なう: "to damage, to spoil".'),
  ('そら already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — そら does not, so it voices. Once you can spot that, readings like おおぞら stop needing to be memorised one at a time.', 'そら already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; そら does not, so it voices. Once you can spot that, readings like おおぞら stop needing to be memorised one at a time.'),
  ('たい continues the Old Japanese auxiliary adjective たし. It was an adjective from the start, so 食べたい is grammatically an adjective phrase, not a verb.

That is the whole explanation for its behaviour: たかった, たくない and たければ are ordinary i-adjective forms, and the が-marked object appears because adjectives take が for what they are about — the same reason 水が好き uses が.', 'たい continues the Old Japanese auxiliary adjective たし. It was an adjective from the start, so 食べたい is grammatically an adjective phrase, not a verb.

That is the whole explanation for its behaviour: たかった, たくない and たければ are ordinary i-adjective forms, and the が-marked object appears because adjectives take が for what they are about, the same reason 水が好き uses が.'),
  ('たい is a wish; つもり is a settled plan. つもり comes from 積もる, "to pile up" — something that accumulated.', 'たい is a wish; つもり is a settled plan. つもり comes from 積もる, "to pile up", something that accumulated.'),
  ('たい is an auxiliary ADJECTIVE, not a verb ending — which is why it inflects like one.', 'たい is an auxiliary ADJECTIVE, not a verb ending, which is why it inflects like one.'),
  ('たち already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — たち does not, so it voices. Once you can spot that, readings like ともだち stop needing to be memorised one at a time.', 'たち already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; たち does not, so it voices. Once you can spot that, readings like ともだち stop needing to be memorised one at a time.'),
  ('たって is not ても worn down — it is longer, so the ちゃ-from-ては analogy fails. It grew instead out of classical とて, with a doubled consonant, and it is a sibling of ても rather than a reduction of it.

So としたって matches としても in sense while arriving by a different road. That it appears at N1 at all is because recognising the shape is the hard part, not the grammar.', 'たって is not ても worn down; it is longer, so the ちゃ-from-ては analogy fails. It grew instead out of classical とて, with a doubled consonant, and it is a sibling of ても rather than a reduction of it.

So としたって matches としても in sense while arriving by a different road. That it appears at N1 at all is because recognising the shape is the hard part, not the grammar.'),
  ('たところで is the 所 of N4 with で — at that point, and no further.', 'たところで is the 所 of N4 with で: at that point, and no further.'),
  ('たな already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — たな does not, so it voices. Once you can spot that, readings like とだな stop needing to be memorised one at a time.', 'たな already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; たな does not, so it voices. Once you can spot that, readings like とだな stop needing to be memorised one at a time.'),
  ('たび is 度, an occasion — the same 度 counted in 一度 and 何度.', 'たび is 度, an occasion, the same 度 counted in 一度 and 何度.'),
  ('たまらない is 堪る negated — one cannot bear it.', 'たまらない is 堪る negated: one cannot bear it.'),
  ('ため is the noun 為 again — the same one that gives purpose.', 'ため is the noun 為 again, the same one that gives purpose.'),
  ('ために names a purpose you intend. ように names a manner you hope things fall into, and the difference is doing real work in the grammar.

It is why ように takes the verbs you cannot simply decide — potentials, negatives, things happening to other people — while ために takes the ones you can. 聞こえるように大きな声で話す, because being audible is not something you do; 勉強するために, because studying is. Same speaker, same intention, two constructions, and the verb decides which.', 'ために names a purpose you intend. ように names a manner you hope things fall into, and the difference is doing real work in the grammar.

It is why ように takes the verbs you cannot simply decide (potentials, negatives, things happening to other people), while ために takes the ones you can. 聞こえるように大きな声で話す, because being audible is not something you do; 勉強するために, because studying is. Same speaker, same intention, two constructions, and the verb decides which.'),
  ('ために needs the same person to control both halves and needs the verb to be volitional. For something you cannot directly will — being able to, not forgetting — ように is the pattern.', 'ために needs the same person to control both halves and needs the verb to be volitional. For something you cannot directly will (being able to, not forgetting), ように is the pattern.'),
  ('たり here is the classical copula, not the past — "even were it one".', 'たり here is the classical copula, not the past: "even were it one".'),
  ('たり — itself て + あり — had a full set of forms, and たら is its 未然形. So 〜たら is not the past tense plus a conditional; both た and たら descend from the one auxiliary.

This explains why たら feels like "once X has happened" rather than a bare hypothetical: the completive sense of たり is still inside it. It is also why たら, alone among the conditionals, comfortably takes a request or a command afterwards.', 'たり, itself て + あり, had a full set of forms, and たら is its 未然形. So 〜たら is not the past tense plus a conditional; both た and たら descend from the one auxiliary.

This explains why たら feels like "once X has happened" rather than a bare hypothetical: the completive sense of たり is still inside it. It is also why たら, alone among the conditionals, comfortably takes a request or a command afterwards.'),
  ('たり — itself て plus あり — could be repeated across a series, and that repeating use is what survives here while the single one narrowed into た.

It explains the one thing learners get wrong about the construction: 〜たり〜たり does not list everything you did. It names two of them as specimens, which is why the list is left open and why a single たり still sounds like there was more.', 'たり, itself て plus あり, could be repeated across a series, and that repeating use is what survives here while the single one narrowed into た.

It explains the one thing learners get wrong about the construction: 〜たり〜たり does not list everything you did. It names two of them as specimens, which is why the list is left open and why a single たり still sounds like there was more.'),
  ('だけでなく is the だけ of N5 with the negative copula — "not only that".', 'だけでなく is the だけ of N5 with the negative copula: "not only that".'),
  ('だろう is である plus the volitional う — and it is NOT where でしょう comes from.', 'だろう is である plus the volitional う, and it is NOT where でしょう comes from.'),
  ('ちか already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — ちか does not, so it voices. Once you can spot that, readings like てぢか stop needing to be memorised one at a time.', 'ちか already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; ちか does not, so it voices. Once you can spot that, readings like てぢか stop needing to be memorised one at a time.'),
  ('ちか already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — ちか does not, so it voices. Once you can spot that, readings like みぢか stop needing to be memorised one at a time.', 'ちか already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; ちか does not, so it voices. Once you can spot that, readings like みぢか stop needing to be memorised one at a time.'),
  ('ついで is つぎて, from 次ぐ "to come next" — the thing that follows on.', 'ついで is つぎて, from 次ぐ "to come next", the thing that follows on.'),
  ('ついで is 序で, from 序 — an order or a sequence of events.', 'ついで is 序で, from 序, an order or a sequence of events.'),
  ('つか already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — つか does not, so it voices. Once you can spot that, readings like こづか stop needing to be memorised one at a time.', 'つか already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; つか does not, so it voices. Once you can spot that, readings like こづか stop needing to be memorised one at a time.'),
  ('つち already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — つち does not, so it voices. Once you can spot that, readings like かなづち stop needing to be memorised one at a time.', 'つち already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; つち does not, so it voices. Once you can spot that, readings like かなづち stop needing to be memorised one at a time.'),
  ('つな already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — つな does not, so it voices. Once you can spot that, readings like よこづな stop needing to be memorised one at a time.', 'つな already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; つな does not, so it voices. Once you can spot that, readings like よこづな stop needing to be memorised one at a time.'),
  ('つもり is 積もり — the 連用形 of 積もる, the verb used for snow accumulating. An intention is something that has piled up in the mind.

This is why つもり means a settled plan rather than a passing wish. Something that has accumulated took time to get there. たい, which is a desire, carries no such weight.', 'つもり is 積もり, the 連用形 of 積もる, the verb used for snow accumulating. An intention is something that has piled up in the mind.

This is why つもり means a settled plan rather than a passing wish. Something that has accumulated took time to get there. たい, which is a desire, carries no such weight.'),
  ('て already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — て does not, so it voices. Once you can spot that, readings like かしわで stop needing to be memorised one at a time.', 'て already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; て does not, so it voices. Once you can spot that, readings like かしわで stop needing to be memorised one at a time.'),
  ('て is the 連用形 of the perfective auxiliary つ. So the te-form is literally a stem plus a completion marker — "having done X".

That original sense of completion is still doing work in the modern language. It is why て naturally means "and then" rather than plain "and", why 〜てから means "after doing", and why the past tense た is built from the same material (て + あり → たり → た). One morpheme, and it explains a whole family of forms.', 'て is the 連用形 of the perfective auxiliary つ. So the te-form is literally a stem plus a completion marker: "having done X".

That original sense of completion is still doing work in the modern language. It is why て naturally means "and then" rather than plain "and", why 〜てから means "after doing", and why the past tense た is built from the same material (て + あり → たり → た). One morpheme, and it explains a whole family of forms.'),
  ('ている is the te-form plus the existential verb いる — literally "exists having done".', 'ている is the te-form plus the existential verb いる, literally "exists having done".'),
  ('てから is the te-form with から, "from" — starting from the point the first act ends.', 'てから is the te-form with から, "from": starting from the point the first act ends.'),
  ('てばかりいる is the 計り of N3 — a measure — applied to how someone spends their time.', 'てばかりいる is the 計り of N3, a measure, applied to how someone spends their time.'),
  ('で is にて worn down — に plus a linking て.', 'で is にて worn down: に plus a linking て.'),
  ('で is にて worn down — に plus the て of the te-form.', 'で is にて worn down: に plus the て of the te-form.'),
  ('であった shortened to だった, the same wearing-down that turned である into だ. The polite でした is です with た, formed separately.

Because な-adjectives are noun-like and lean on the copula, they take the copula''s past rather than having one. 静かだった is the copula changing tense, with 静か untouched — the opposite of what an i-adjective does.', 'であった shortened to だった, the same wearing-down that turned である into だ. The polite でした is です with た, formed separately.

Because な-adjectives are noun-like and lean on the copula, they take the copula''s past rather than having one. 静かだった is the copula changing tense, with 静か untouched, the opposite of what an i-adjective does.'),
  ('であれ is the imperative of である — a command shape used to concede.', 'であれ is the imperative of である, a command shape used to concede.'),
  ('です marks politeness toward the listener, not respect for the subject. Using it does not make a sentence formal on its own — it makes it *polite*.', 'です marks politeness toward the listener, not respect for the subject. Using it does not make a sentence formal on its own; it makes it *polite*.'),
  ('ではありません contracted to じゃありません, the same shortening that gives ちゃ from ては. The written and formal registers keep では; speech takes じゃ.

So there is no separate negative copula to learn. It is the で of です — itself にて worn down — plus the topic は, plus ありません, and every piece is doing its ordinary job.', 'ではありません contracted to じゃありません, the same shortening that gives ちゃ from ては. The written and formal registers keep では; speech takes じゃ.

So there is no separate negative copula to learn. It is the で of です (itself にて worn down), plus the topic は, plus ありません, and every piece is doing its ordinary job.'),
  ('と already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — と does not, so it voices. Once you can spot that, readings like あまど stop needing to be memorised one at a time.', 'と already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; と does not, so it voices. Once you can spot that, readings like あまど stop needing to be memorised one at a time.'),
  ('と already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — と does not, so it voices. Once you can spot that, readings like いど stop needing to be memorised one at a time.', 'と already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; と does not, so it voices. Once you can spot that, readings like いど stop needing to be memorised one at a time.'),
  ('と is exhaustive between nouns — りんごとみかん is those two and nothing else. や leaves the list open.', 'と is exhaustive between nouns: りんごとみかん is those two and nothing else. や leaves the list open.'),
  ('と lists completely; か marks something unsettled. Together they list without committing, which is why とか is the casual spoken cousin of や.

The modern habit of ending a sentence on a dangling とか is the same uncertainty applied to the whole utterance — a way of leaving what you said slightly unsettled, which is precisely what the particle has always done.', 'と lists completely; か marks something unsettled. Together they list without committing, which is why とか is the casual spoken cousin of や.

The modern habit of ending a sentence on a dangling とか is the same uncertainty applied to the whole utterance, a way of leaving what you said slightly unsettled, which is precisely what the particle has always done.'),
  ('と pairs two things and asserts they go together — every use follows from that.', 'と pairs two things and asserts they go together; every use follows from that.'),
  ('といっても is the quotative と with 言う and も — "even saying that".', 'といっても is the quotative と with 言う and も: "even saying that".'),
  ('とおり is 通り, from 通る — "to pass along".', 'とおり is 通り, from 通る: "to pass along".'),
  ('とか is と with か — the exhaustive lister made uncertain.', 'とか is と with か, the exhaustive lister made uncertain.'),
  ('とき is 時, an ordinary noun — which is why a whole clause can sit in front of it.', 'とき is 時, an ordinary noun, which is why a whole clause can sit in front of it.'),
  ('ところ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — ところ does not, so it voices. Once you can spot that, readings like などころ stop needing to be memorised one at a time.', 'ところ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; ところ does not, so it voices. Once you can spot that, readings like などころ stop needing to be memorised one at a time.'),
  ('ところ is 所, a place — Japanese locating a moment in time as a spot.', 'ところ is 所, a place, Japanese locating a moment in time as a spot.'),
  ('ところを is the 所 of N4 with を — the moment is the thing being cut into.', 'ところを is the 所 of N4 with を: the moment is the thing being cut into.'),
  ('として is the quotative と with する — treating something AS something.', 'として is the quotative と with する, treating something AS something.'),
  ('とって is the te-form of 取る, "to take" — taking something as your position.', 'とって is the te-form of 取る, "to take", taking something as your position.'),
  ('とて is the quotative と with て — "even saying that".', 'とて is the quotative と with て: "even saying that".'),
  ('とも already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — とも does not, so it voices. Once you can spot that, readings like こども stop needing to be memorised one at a time.', 'とも already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; とも does not, so it voices. Once you can spot that, readings like こども stop needing to be memorised one at a time.'),
  ('ともに is 共に, "together with" — the 共 of 共通 and 共に働く.', 'ともに is 共に, "together with", the 共 of 共通 and 共に働く.'),
  ('どう asks in what way; に makes it a means; も sweeps every one of them in. With a negative it takes the whole range of methods and rules them out together.

The ど- series itself is not ancient — Old Japanese asked with いか- and いづ-, giving いかにも — but the sweep is the same one that makes 誰も into "nobody" at N4. Sweeping a question word with も and then negating is one of the language''s standard moves, and どうにも is it applied to method.', 'どう asks in what way; に makes it a means; も sweeps every one of them in. With a negative it takes the whole range of methods and rules them out together.

The ど- series itself is not ancient (Old Japanese asked with いか- and いづ-, giving いかにも), but the sweep is the same one that makes 誰も into "nobody" at N4. Sweeping a question word with も and then negating is one of the language''s standard moves, and どうにも is it applied to method.'),
  ('どうして is "doing how" — どう plus the te-form of する.', 'どうして is "doing how": どう plus the te-form of する.'),
  ('どうにも is "how" with に and も — by no manner of means.', 'どうにも is "how" with に and も: by no manner of means.'),
  ('どころ is ところ, 所 — a place — voiced in second position.', 'どころ is ところ, 所, a place, voiced in second position.'),
  ('どち took ら to give どちら, and a doubled consonant to give どっち — parallel formations rather than one contracted out of the other. こちら, そちら and あちら fill the rest of the row.

The ら version is the polite one, and the ら is an old suffix of vagueness: pointing at a general direction rather than straight at a thing. Whether the politeness follows from that vagueness is a reasonable reading rather than a documented one.', 'どち took ら to give どちら, and a doubled consonant to give どっち: parallel formations rather than one contracted out of the other. こちら, そちら and あちら fill the rest of the row.

The ら version is the polite one, and the ら is an old suffix of vagueness: pointing at a general direction rather than straight at a thing. Whether the politeness follows from that vagueness is a reasonable reading rather than a documented one.'),
  ('どんな is どのような worn down — the 様 of ようだ inside it.', 'どんな is どのような worn down, the 様 of ようだ inside it.'),
  ('ない continues the Old Japanese adjective なし, meaning "nonexistent, not there". It was never a verb ending — it was a real adjective that came to be used as a negative auxiliary.

That single fact explains its whole conjugation. なかった, なくて, なければ are not irregular verb endings to memorise; they are ordinary i-adjective forms, because ない is an adjective wearing a verb ending''s job.', 'ない continues the Old Japanese adjective なし, meaning "nonexistent, not there". It was never a verb ending; it was a real adjective that came to be used as a negative auxiliary.

That single fact explains its whole conjugation. なかった, なくて, なければ are not irregular verb endings to memorise; they are ordinary i-adjective forms, because ない is an adjective wearing a verb ending''s job.'),
  ('ない inflects like an い-adjective — 寒い gives 寒くて, ない gives なくて. There is nothing special about the negative here beyond its class.

That is why なくて links reasons the way 寒くて does: an adjective in て-form gives grounds for what follows. And it is why the obligation forms build on it — なくてはいけない, なくてもいい — since every one of them needs that adjective link.', 'ない inflects like an い-adjective: 寒い gives 寒くて, ない gives なくて. There is nothing special about the negative here beyond its class.

That is why なくて links reasons the way 寒くて does: an adjective in て-form gives grounds for what follows. And it is why the obligation forms build on it (なくてはいけない, なくてもいい), since every one of them needs that adjective link.'),
  ('ない is an adjective, so its past is formed like 寒い''s: the adverbial なく plus the past of ある, contracted to なかった. 寒くあった gave 寒かった by the same route.

So the plain negative past is not a special ending but two ordinary steps, and it is why the polite ませんでした has to do something quite different — ん is not an adjective and has nothing to contract with.', 'ない is an adjective, so its past is formed like 寒い''s: the adverbial なく plus the past of ある, contracted to なかった. 寒くあった gave 寒かった by the same route.

So the plain negative past is not a special ending but two ordinary steps, and it is why the polite ませんでした has to do something quite different: ん is not an adjective and has nothing to contract with.'),
  ('ないで is the negative with the で of manner — 傘を持たないで出かけた, going out in the circumstance of not having one. なくて is the adjective negative ない in its て-form, which links a cause: 分からなくて困った.

So ないで attaches to how something was done and なくて to why. The pieces are both ordinary, and the distinction that looks arbitrary is the same で and て doing what they do everywhere else.', 'ないで is the negative with the で of manner: 傘を持たないで出かけた, going out in the circumstance of not having one. なくて is the adjective negative ない in its て-form, which links a cause: 分からなくて困った.

So ないで attaches to how something was done and なくて to why. The pieces are both ordinary, and the distinction that looks arbitrary is the same で and て doing what they do everywhere else.'),
  ('ないで is the negative with で — 傘を持たないで出かけた, going out in the circumstance of not having one. なくて is the adjective negative ない in its て-form, which links a cause: 分からなくて困った.

Which で this is has no settled account: it is read as a particle by some and as the 連用形 of だ by others, and the particle itself is traced back either to にて or to ずて, the classical negative plus て. What is not in doubt is the division of labour — ないで attaches to how something was done, なくて to why.', 'ないで is the negative with で: 傘を持たないで出かけた, going out in the circumstance of not having one. なくて is the adjective negative ない in its て-form, which links a cause: 分からなくて困った.

Which で this is has no settled account: it is read as a particle by some and as the 連用形 of だ by others, and the particle itself is traced back either to にて or to ずて, the classical negative plus て. What is not in doubt is the division of labour: ないで attaches to how something was done, なくて to why.'),
  ('ないで is the negative with で, describing how something is done — or not done. ください is the imperative of 下さる, "to give downward".

So the request is literally "give me it, in the manner of not doing that". Nothing is special about the negative request beyond stacking two things the lesson before it already covered.', 'ないで is the negative with で, describing how something is done, or not done. ください is the imperative of 下さる, "to give downward".

So the request is literally "give me it, in the manner of not doing that". Nothing is special about the negative request beyond stacking two things the lesson before it already covered.'),
  ('なかった is ない doing what every i-adjective does — く plus あった, contracted.', 'なかった is ない doing what every i-adjective does: く plus あった, contracted.'),
  ('ながら first marked a state persisting unchanged rather than two things at once — the sense preserved in 昔ながら and, at N1, in 生まれながらに. も adds "even".

So 知っていながらも is "even while remaining in the state of knowing". The concession comes from も; ながら supplies the unchanged state that the second clause then contradicts.', 'ながら first marked a state persisting unchanged rather than two things at once, the sense preserved in 昔ながら and, at N1, in 生まれながらに. も adds "even".

So 知っていながらも is "even while remaining in the state of knowing". The concession comes from も; ながら supplies the unchanged state that the second clause then contradicts.'),
  ('なくて is ない in its te-form, the same shape as 寒くて. ても adds "even", and いい judges it fine. Nothing is idiomatic: "even not doing it, it is good".

So the permission and the exemption are one construction seen from two sides — 食べてもいい allows the act, 食べなくてもいい allows its absence.', 'なくて is ない in its te-form, the same shape as 寒くて. ても adds "even", and いい judges it fine. Nothing is idiomatic: "even not doing it, it is good".

So the permission and the exemption are one construction seen from two sides: 食べてもいい allows the act, 食べなくてもいい allows its absence.'),
  ('なくては becomes なくちゃ; なければ becomes なきゃ. Both are the front half of the double negative taught earlier — なければならない, "if not, it will not do" — with ならない simply dropped.

So the obligation is not in the words at all. It is in the missing ones, which is why these feel casual and why the ending sounds unfinished: it is unfinished. The same shortening gives ちゃ and じゃ from ては and では.', 'なくては becomes なくちゃ; なければ becomes なきゃ. Both are the front half of the double negative taught earlier (なければならない, "if not, it will not do"), with ならない simply dropped.

So the obligation is not in the words at all. It is in the missing ones, which is why these feel casual and why the ending sounds unfinished: it is unfinished. The same shortening gives ちゃ and じゃ from ては and では.'),
  ('なくてもいい is the negative te-form with てもいい — "even not doing it, it is fine".', 'なくてもいい is the negative te-form with てもいい: "even not doing it, it is fine".'),
  ('なければ is the conditional of ない ("if not"), and なりません is the negative of なる ("to become / to do"). Together: "if you do not do it, it will not do".

Japanese has no direct "must". Obligation is built by eliminating the alternative, which is why every obligation form at this level — なければならない, なくてはいけない, ないとだめ — is some negative plus another negative. Once you see the shape, the whole family stops needing memorisation.', 'なければ is the conditional of ない ("if not"), and なりません is the negative of なる ("to become / to do"). Together: "if you do not do it, it will not do".

Japanese has no direct "must". Obligation is built by eliminating the alternative, which is why every obligation form at this level (なければならない, なくてはいけない, ないとだめ) is some negative plus another negative. Once you see the shape, the whole family stops needing memorisation.'),
  ('なし meant "nonexistent" and inflected as an adjective — the same word behind the negative taught at N5. なしに keeps the old form untouched.

That is the whole difference from ないで: なしに is frozen classical Japanese, so it belongs to writing and set phrases, and it attaches to a noun rather than a verb. 許可なしに, never 許可ないに.', 'なし meant "nonexistent" and inflected as an adjective, the same word behind the negative taught at N5. なしに keeps the old form untouched.

That is the whole difference from ないで: なしに is frozen classical Japanese, so it belongs to writing and set phrases, and it attaches to a noun rather than a verb. 許可なしに, never 許可ないに.'),
  ('なし meant "nonexistent" and inflected as an adjective — the same word behind the negative taught at N5. なしに keeps the old form untouched.

That is the whole difference from ないで: なしに is frozen classical Japanese, so it belongs to writing and set phrases, and it attaches to a noun — 許可なしに, never 許可ないに. A verb gets in through こと: 誰にも知られることなしに.', 'なし meant "nonexistent" and inflected as an adjective, the same word behind the negative taught at N5. なしに keeps the old form untouched.

That is the whole difference from ないで: なしに is frozen classical Japanese, so it belongs to writing and set phrases, and it attaches to a noun: 許可なしに, never 許可ないに. A verb gets in through こと: 誰にも知られることなしに.'),
  ('など is worn-down なにと — "what and…" — with 等 fitted to it afterwards as a spelling.', 'など is worn-down なにと, "what and…", with 等 fitted to it afterwards as a spelling.'),
  ('など is 等 — the same 等 as in 等しい, "equal", and in 平等.', 'など is 等, the same 等 as in 等しい, "equal", and in 平等.'),
  ('ならでは is the classical negative ならで with は — "not being that, it is not".', 'ならでは is the classical negative ならで with は: "not being that, it is not".'),
  ('ならない is なる negated — it will not do, it does not turn out.', 'ならない is なる negated: it will not do, it does not turn out.'),
  ('なり asserted that something was so, and its 未然形 なら took ば — later dropped — to give a plain hypothetical: "if it be so".

Modern なら has specialised away from that, toward picking up something already in play: 京都なら電車が早い answers a Kyoto somebody has put on the table rather than raising one. The copula''s asserting nature made that natural, though the history alone does not dictate it. It is also why なら, alone among the four, attaches straight to a bare noun.', 'なり asserted that something was so, and its 未然形 なら took ば, later dropped, to give a plain hypothetical: "if it be so".

Modern なら has specialised away from that, toward picking up something already in play: 京都なら電車が早い answers a Kyoto somebody has put on the table rather than raising one. The copula''s asserting nature made that natural, though the history alone does not dictate it. It is also why なら, alone among the four, attaches straight to a bare noun.'),
  ('なる is change of state, 様 is the way a thing is. Put together they describe arriving at a condition rather than performing an act.

That is why it pairs so naturally with the potential — 泳げるようになった, "reached the state of being able to swim" — and why it needs a plain form in front rather than a stem. What comes to be the case is a whole situation, not a bare verb.', 'なる is change of state, 様 is the way a thing is. Put together they describe arriving at a condition rather than performing an act.

That is why it pairs so naturally with the potential (泳げるようになった, "reached the state of being able to swim"), and why it needs a plain form in front rather than a stem. What comes to be the case is a whole situation, not a bare verb.'),
  ('なる is the verb of becoming. Respect in Japanese works by not pointing directly at what the honoured person did, and putting their action inside なる is one way of looking away from it.

The honorific お is the same one on お名前 and お茶. Set beside the humble お〜する, the pair is exactly なる against する — what comes about for them, what is done by you — which is the whole system in two verbs.', 'なる is the verb of becoming. Respect in Japanese works by not pointing directly at what the honoured person did, and putting their action inside なる is one way of looking away from it.

The honorific お is the same one on お名前 and お茶. Set beside the humble お〜する, the pair is exactly なる against する (what comes about for them, what is done by you), which is the whole system in two verbs.'),
  ('なんか is 何か worn down, and なんて is 何と — the question word doing the belittling.', 'なんか is 何か worn down, and なんて is 何と, the question word doing the belittling.'),
  ('において is 置く — the same verb as 〜ておく at N4.', 'において is 置く, the same verb as 〜ておく at N4.'),
  ('にかかわらず and にもかかわらず share every other syllable. も means "even", and adding it says that even this — which plainly should have been concerned in the matter — was not.

That is why にかかわらず takes neutral alternatives (晴雨にかかわらず) and にもかかわらず takes a real obstacle (努力したにもかかわらず). One is indifference, the other is a complaint, and も is doing all of it.', 'にかかわらず and にもかかわらず share every other syllable. も means "even", and adding it says that even this (which plainly should have been concerned in the matter) was not.

That is why にかかわらず takes neutral alternatives (晴雨にかかわらず) and にもかかわらず takes a real obstacle (努力したにもかかわらず). One is indifference, the other is a complaint, and も is doing all of it.'),
  ('にかけて is 掛ける again — the span is hung between two points.', 'にかけて is 掛ける again: the span is hung between two points.'),
  ('にして is に with the て of する — and it means two opposite things depending on what it lands on.', 'にして is に with the て of する, and it means two opposite things depending on what it lands on.'),
  ('にて is still written in formal notices. The に named a point and a linking て carried it onward; the pair contracted into で by the Muromachi period and was normal by Edo.

That single origin explains the four separate で lessons. Place of action, means, material and cause are all one particle naming the circumstance an action is carried out in. 公園で遊ぶ, ペンで書く, 木で作る, 風邪で休む — the English needs four prepositions and the Japanese never split.', 'にて is still written in formal notices. The に named a point and a linking て carried it onward; the pair contracted into で by the Muromachi period and was normal by Edo.

That single origin explains the four separate で lessons. Place of action, means, material and cause are all one particle naming the circumstance an action is carried out in. 公園で遊ぶ, ペンで書く, 木で作る, 風邪で休む: the English needs four prepositions and the Japanese never split.'),
  ('にて is still written in formal notices. The に named a point and the て linked it onward, and the pair contracted into で.

That single origin explains the four separate で lessons. Place of action, means, material and cause are all one particle naming the circumstance an action is carried out in. 公園で遊ぶ, ペンで書く, 木で作る, 風邪で休む — the English needs four prepositions and the Japanese never split.', 'にて is still written in formal notices. The に named a point and the て linked it onward, and the pair contracted into で.

That single origin explains the four separate で lessons. Place of action, means, material and cause are all one particle naming the circumstance an action is carried out in. 公園で遊ぶ, ペンで書く, 木で作る, 風邪で休む: the English needs four prepositions and the Japanese never split.'),
  ('に限らず is 限る with the classical negative — the boundary is not drawn.', 'に限らず is 限る with the classical negative: the boundary is not drawn.'),
  ('ね assumes the listener shares the view. Used about something only you could know — 私は学生ですね — it sounds strange, because there is nothing to agree with.', 'ね assumes the listener shares the view. Used about something only you could know (私は学生ですね), it sounds strange, because there is nothing to agree with.'),
  ('の is for something perceived directly — seeing, hearing, waiting. こと is for the abstract fact. 見る takes の because you watch an event, not a proposition.', 'の is for something perceived directly: seeing, hearing, waiting. こと is for the abstract fact. 見る takes の because you watch an event, not a proposition.'),
  ('のに is the nominaliser の with the particle に — "for the case that", aimed at an outcome.', 'のに is the nominaliser の with the particle に: "for the case that", aimed at an outcome.'),
  ('は already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — は does not, so it voices. Once you can spot that, readings like ことば stop needing to be memorised one at a time.', 'は already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; は does not, so it voices. Once you can spot that, readings like ことば stop needing to be memorised one at a time.'),
  ('は already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — は does not, so it voices. Once you can spot that, readings like むしば stop needing to be memorised one at a time.', 'は already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; は does not, so it voices. Once you can spot that, readings like むしば stop needing to be memorised one at a time.'),
  ('は marks the topic of a whole sentence, and a clause describing a noun is not a whole sentence. So 私が買った本 uses が, and 私は buys nothing inside a clause.

The older genitive が is still visible in the alternative 私の買った本, which is equally correct and slightly more formal — the same が-and-の overlap preserved in 我が国.', 'は marks the topic of a whole sentence, and a clause describing a noun is not a whole sentence. So 私が買った本 uses が, and 私は buys nothing inside a clause.

The older genitive が is still visible in the alternative 私の買った本, which is equally correct and slightly more formal, the same が-and-の overlap preserved in 我が国.'),
  ('は sets what the sentence is about. It contrasts with が, which marks the grammatical subject and introduces new information. 私は学生です — "as for me, student".', 'は sets what the sentence is about. It contrasts with が, which marks the grammatical subject and introduces new information. 私は学生です: "as for me, student".'),
  ('はず is 筈, the nock cut into an arrow to sit on the bowstring — a thing made to fit. はずがない says no such fit exists.

Which is why it is a flat contradiction rather than a doubt. かもしれない leaves a question open and でしょう guesses; はずがない says the arrangement rules it out, and that is a claim about the grounds rather than about your confidence.', 'はず is 筈, the nock cut into an arrow to sit on the bowstring, a thing made to fit. はずがない says no such fit exists.

Which is why it is a flat contradiction rather than a doubt. かもしれない leaves a question open and でしょう guesses; はずがない says the arrangement rules it out, and that is a claim about the grounds rather than about your confidence.'),
  ('はずみ is 弾み, from 弾む — "to bounce".', 'はずみ is 弾み, from 弾む: "to bounce".'),
  ('はな already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — はな does not, so it voices. Once you can spot that, readings like ひばな stop needing to be memorised one at a time.', 'はな already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; はな does not, so it voices. Once you can spot that, readings like ひばな stop needing to be memorised one at a time.'),
  ('ばかり is 計り, from 計る — "to measure".', 'ばかり is 計り, from 計る: "to measure".'),
  ('ばかり is 計り, from 計る, "to measure": an amount, narrowed to "that amount and no more". With a te-form and いる it measures the whole of someone''s activity as one thing.

遊んでばかりいる is nothing but playing, and the いる matters — it makes it a state they are in rather than an act they performed, which is where the disapproval sits.', 'ばかり is 計り, from 計る, "to measure": an amount, narrowed to "that amount and no more". With a te-form and いる it measures the whole of someone''s activity as one thing.

遊んでばかりいる is nothing but playing, and the いる matters; it makes it a state they are in rather than an act they performed, which is where the disapproval sits.'),
  ('ばかり measures a thing tightly — nothing but. Adding か reopens the bound and lets more in: not merely this, but even that.

So the pattern reads as "is it only that?", and the answer supplied is no. It is why ばかりか needs a second, stronger clause after it, and why さえ or まで so often turns up there.', 'ばかり measures a thing tightly: nothing but. Adding か reopens the bound and lets more in: not merely this, but even that.

So the pattern reads as "is it only that?", and the answer supplied is no. It is why ばかりか needs a second, stronger clause after it, and why さえ or まで so often turns up there.'),
  ('ひ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — ひ does not, so it voices. Once you can spot that, readings like したび stop needing to be memorised one at a time.', 'ひ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; ひ does not, so it voices. Once you can spot that, readings like したび stop needing to be memorised one at a time.'),
  ('ひ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — ひ does not, so it voices. Once you can spot that, readings like にしび stop needing to be memorised one at a time.', 'ひ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; ひ does not, so it voices. Once you can spot that, readings like にしび stop needing to be memorised one at a time.'),
  ('ひ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — ひ does not, so it voices. Once you can spot that, readings like はなび stop needing to be memorised one at a time.', 'ひ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; ひ does not, so it voices. Once you can spot that, readings like はなび stop needing to be memorised one at a time.'),
  ('ひかり already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — ひかり does not, so it voices. Once you can spot that, readings like いなびかり stop needing to be memorised one at a time.', 'ひかり already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; ひかり does not, so it voices. Once you can spot that, readings like いなびかり stop needing to be memorised one at a time.'),
  ('ひと already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — ひと does not, so it voices. Once you can spot that, readings like おおびと stop needing to be memorised one at a time.', 'ひと already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; ひと does not, so it voices. Once you can spot that, readings like おおびと stop needing to be memorised one at a time.'),
  ('ひと already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — ひと does not, so it voices. Once you can spot that, readings like こいびと stop needing to be memorised one at a time.', 'ひと already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; ひと does not, so it voices. Once you can spot that, readings like こいびと stop needing to be memorised one at a time.'),
  ('ひと already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — ひと does not, so it voices. Once you can spot that, readings like なかびと stop needing to be memorised one at a time.', 'ひと already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; ひと does not, so it voices. Once you can spot that, readings like なかびと stop needing to be memorised one at a time.'),
  ('ひとつ, ふたつ, みっつ — one, two, three in the words Japanese used before it borrowed いち, に, さん from Chinese. The native series survives only up to nine, and ten is とお.

That is why つ is the counter you fall back on when no other fits: it is older than the borrowed system that produced the specialised counters. ひとり and ふたり are the same native numbers, which is why they break the pattern that 三人 follows.', 'ひとつ, ふたつ, みっつ: one, two, three in the words Japanese used before it borrowed いち, に, さん from Chinese. The native series survives only up to nine, and ten is とお.

That is why つ is the counter you fall back on when no other fits: it is older than the borrowed system that produced the specialised counters. ひとり and ふたり are the same native numbers, which is why they break the pattern that 三人 follows.'),
  ('ひろ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — ひろ does not, so it voices. Once you can spot that, readings like せびろ stop needing to be memorised one at a time.', 'ひろ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; ひろ does not, so it voices. Once you can spot that, readings like せびろ stop needing to be memorised one at a time.'),
  ('ふくろ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound — ふくろ does not, so it voices. Once you can spot that, readings like てぶくろ stop needing to be memorised one at a time.', 'ふくろ already begins a word cleanly, so nothing blocks the change. Lyman''s Law says rendaku is blocked when the second element already contains a voiced sound; ふくろ does not, so it voices. Once you can spot that, readings like てぶくろ stop needing to be memorised one at a time.'),
  ('へ began as 辺 (he), a noun meaning the area around something — a shore, a border, a general vicinity. "Go to the vicinity of Tokyo" became, over time, simply "go toward Tokyo".

That origin is still doing work. It is exactly why へ points at a heading rather than an arrival: a vicinity is an approximate place, so the particle built from it never promised you got there. に, which came from a different source, does.', 'へ began as 辺 (he), a noun meaning the area around something: a shore, a border, a general vicinity. "Go to the vicinity of Tokyo" became, over time, simply "go toward Tokyo".

That origin is still doing work. It is exactly why へ points at a heading rather than an arrival: a vicinity is an approximate place, so the particle built from it never promised you got there. に, which came from a different source, does.'),
  ('へ came from 辺, a vicinity — historically a heading rather than a point. The two overlap for destinations in modern Japanese, and 東京へ着く is perfectly ordinary; what に keeps to itself is every other kind of point.

One idea covers every use the textbook lists separately. 三時に is a point in time; 東京に着く is a point in space; 友達に渡す is the point the thing lands on. If the sentence has a target, it is に.', 'へ came from 辺, a vicinity, historically a heading rather than a point. The two overlap for destinations in modern Japanese, and 東京へ着く is perfectly ordinary; what に keeps to itself is every other kind of point.

One idea covers every use the textbook lists separately. 三時に is a point in time; 東京に着く is a point in space; 友達に渡す is the point the thing lands on. If the sentence has a target, it is に.'),
  ('へ came from 辺, a vicinity, so it never promised you got there. に has always named a point exactly — a place, an instant, a recipient.

One idea covers every use the textbook lists separately. 三時に is a point in time; 東京に着く is a point in space; 友達に渡す is the point the thing lands on. If the sentence has a target, it is に.', 'へ came from 辺, a vicinity, so it never promised you got there. に has always named a point exactly: a place, an instant, a recipient.

One idea covers every use the textbook lists separately. 三時に is a point in time; 東京に着く is a point in space; 友達に渡す is the point the thing lands on. If the sentence has a target, it is に.'),
  ('へ emphasises the heading; に emphasises arrival. 東京に行く says you got there, 東京へ行く says you set off that way — a difference English does not mark at all.', 'へ emphasises the heading; に emphasises arrival. 東京に行く says you got there, 東京へ行く says you set off that way, a difference English does not mark at all.'),
  ('へ points the way without promising you got there — it came from 辺, "vicinity".', 'へ points the way without promising you got there; it came from 辺, "vicinity".'),
  ('べからず is べし plus the classical negative ず — the prohibition on old signs.', 'べからず is べし plus the classical negative ず, the prohibition on old signs.'),
  ('べく is the 連用形 of べし — the form that connects onward to a verb.', 'べく is the 連用形 of べし, the form that connects onward to a verb.'),
  ('べく plus あら plus ず, contracted. It is the negative branch of the same auxiliary that gives べき and べく.

It survives almost entirely on signage — 立入るべからず — because that is where classical Japanese survives generally: notices, mottoes and set phrases keep old grammar long after speech has let it go.', 'べく plus あら plus ず, contracted. It is the negative branch of the same auxiliary that gives べき and べく.

It survives almost entirely on signage (立入るべからず), because that is where classical Japanese survives generally: notices, mottoes and set phrases keep old grammar long after speech has let it go.'),
  ('べし had a full set of forms, and べき is the one that stood before a noun. That is why the modern pattern is べき and never べし except in set phrases — you are using a form that was built to modify something.

It also explains the する oddity. Classical べし attached to the 終止形, and する in classical Japanese was す, so both するべき and すべき are alive: one follows the modern verb, the other the classical one. The negative べからず on old signs is the same auxiliary, still forbidding things.', 'べし had a full set of forms, and べき is the one that stood before a noun. That is why the modern pattern is べき and never べし except in set phrases; you are using a form that was built to modify something.

It also explains the する oddity. Classical べし attached to the 終止形, and する in classical Japanese was す, so both するべき and すべき are alive: one follows the modern verb, the other the classical one. The negative べからず on old signs is the same auxiliary, still forbidding things.'),
  ('ほか is 外 — outside. There is nothing outside this option.', 'ほか is 外: outside. There is nothing outside this option.'),
  ('ほかならない is 他 plus ならない — "it does not become anything other".', 'ほかならない is 他 plus ならない: "it does not become anything other".'),
  ('ほかならない is 他 with the classical copula なり negated — "is not anything other".', 'ほかならない is 他 with the classical copula なり negated: "is not anything other".'),
  ('ほしい is an adjective, not a verb — which is why what you want takes が.', 'ほしい is an adjective, not a verb, which is why what you want takes が.'),
  ('まさか彼が来るとは — and then nothing. What would complete it (思わなかった, 驚いた) has been dropped, and the surprise lives in the gap.

That is why とは carries feeling rather than content. It marks a thing as quoted and topicalised, then stops before saying anything about it, leaving the listener to supply what the speaker cannot.', 'まさか彼が来るとは, and then nothing. What would complete it (思わなかった, 驚いた) has been dropped, and the surprise lives in the gap.

That is why とは carries feeling rather than content. It marks a thing as quoted and topicalised, then stops before saying anything about it, leaving the listener to supply what the speaker cannot.'),
  ('ましょう assumes agreement. To ask whether someone wants to, use ませんか — 行きませんか is a genuine invitation, 行きましょう is closer to a decision.', 'ましょう assumes agreement. To ask whether someone wants to, use ませんか: 行きませんか is a genuine invitation, 行きましょう is closer to a decision.'),
  ('まじ negated べし. Where べし said something should or would be, まじ said it should not or would not, and まい is what survives of it.

It kept both of べし''s senses. 雨は降るまい is conjecture — surely not; 二度と行くまい is resolve — I will not. The two readings textbooks list separately are the one auxiliary. Which you get depends on the subject and on whether the verb names something one can will: 私はもう長くは生きられまい is first person and still pure conjecture.', 'まじ negated べし. Where べし said something should or would be, まじ said it should not or would not, and まい is what survives of it.

It kept both of べし''s senses. 雨は降るまい is conjecture (surely not); 二度と行くまい is resolve (I will not). The two readings textbooks list separately are the one auxiliary. Which you get depends on the subject and on whether the verb names something one can will: 私はもう長くは生きられまい is first person and still pure conjecture.'),
  ('まじ negated べし. Where べし said something should or would be, まじ said it should not or would not, and まい is what survives of it.

It kept both of べし''s senses. 雨は降るまい is conjecture — surely not; 二度と行くまい is resolve — I will not. The two readings that textbooks list separately are the one auxiliary, and which you get depends only on the person of the subject.', 'まじ negated べし. Where べし said something should or would be, まじ said it should not or would not, and まい is what survives of it.

It kept both of べし''s senses. 雨は降るまい is conjecture (surely not); 二度と行くまい is resolve (I will not). The two readings that textbooks list separately are the one auxiliary, and which you get depends only on the person of the subject.'),
  ('ません ends in the fossilised negative ん, which does not inflect. So the polite negative past cannot be built the way ました is; it borrows でした, the past of です, and puts it after.

That is why this form is two words long where every other polite ending is one — though it was settled by competition rather than by logic: Edo speech said ませなんだ, and 幕末 had ませんかった and ませんだった before ませんでした won in the Meiji years. The plain equivalent なかった has no such trouble, because ない is an adjective and can simply become かった.', 'ません ends in the fossilised negative ん, which does not inflect. So the polite negative past cannot be built the way ました is; it borrows でした, the past of です, and puts it after.

That is why this form is two words long where every other polite ending is one, though it was settled by competition rather than by logic: Edo speech said ませなんだ, and 幕末 had ませんかった and ませんだった before ませんでした won in the Meiji years. The plain equivalent なかった has no such trouble, because ない is an adjective and can simply become かった.'),
  ('ません is also how a polite invitation begins — 行きませんか is an offer, not a statement that you are not going.', 'ません is also how a polite invitation begins: 行きませんか is an offer, not a statement that you are not going.'),
  ('まだ says the change has not come — まだ食べていません — and もう says it has: もう食べました. They are not opposites of degree but of whether a threshold has been crossed.

That is why まだ pairs so naturally with the negative and もう with the past, and why もう with a negative (もう食べません) means the change went the other way: no longer.', 'まだ says the change has not come (まだ食べていません), and もう says it has: もう食べました. They are not opposites of degree but of whether a threshold has been crossed.

That is why まだ pairs so naturally with the negative and もう with the past, and why もう with a negative (もう食べません) means the change went the other way: no longer.'),
  ('まで is continuous — something goes on up to that point. までに is a deadline. Waiting takes まで; arriving takes までに.', 'まで is continuous: something goes on up to that point. までに is a deadline. Waiting takes まで; arriving takes までに.'),
  ('まで is inclusive — it means "up to and including". For a deadline meaning "by", use までに, which is a different pattern learners routinely conflate.', 'まで is inclusive: it means "up to and including". For a deadline meaning "by", use までに, which is a different pattern learners routinely conflate.'),
  ('まで sets a limit; も says even. So the sentence denies that matters need to be taken as far as the thing named.

言うまでもない is "there is no need to go so far as saying" — which is exactly what English does with "it goes without saying". Both languages picture the unnecessary act as a distance not worth travelling.', 'まで sets a limit; も says even. So the sentence denies that matters need to be taken as far as the thing named.

言うまでもない is "there is no need to go so far as saying", which is exactly what English does with "it goes without saying". Both languages picture the unnecessary act as a distance not worth travelling.'),
  ('までだ is the ordinary particle まで — and nothing beyond that point.', 'までだ is the ordinary particle まで, and nothing beyond that point.'),
  ('までもない is the same まで with も — not even as far as that.', 'までもない is the same まで with も: not even as far as that.'),
  ('まみれ is 塗れ, from 塗れる — "to be smeared".', 'まみれ is 塗れ, from 塗れる: "to be smeared".'),
  ('みたい is worn down from 見た様 — "the way it looked".', 'みたい is worn down from 見た様: "the way it looked".'),
  ('みる is 見る, "to look" — do it and see what happens.', 'みる is 見る, "to look": do it and see what happens.'),
  ('む was the auxiliary of intention and conjecture. Its consonant nasalised and then dropped, leaving the う you now write on 行こう.

It is still visible in forms taught much earlier: ましょう is ます plus this same う, でしょう is です plus it, and だろう is である plus it. That is why the volitional covers both "let us" and "probably" with no change of shape — む never distinguished them either.', 'む was the auxiliary of intention and conjecture. Its consonant nasalised and then dropped, leaving the う you now write on 行こう.

It is still visible in forms taught much earlier: ましょう is ます plus this same う, でしょう is です plus it, and だろう is である plus it. That is why the volitional covers both "let us" and "probably" with no change of shape: む never distinguished them either.'),
  ('む was the auxiliary of intention and conjecture. Its consonant nasalised and then dropped, leaving the う you now write on 行こう.

It is still visible in two forms taught much earlier: ましょう is ます plus this same う, and でしょう is である plus it. That is why the volitional covers both "let us" and "probably" with no change of shape — む never distinguished them either.', 'む was the auxiliary of intention and conjecture. Its consonant nasalised and then dropped, leaving the う you now write on 行こう.

It is still visible in two forms taught much earlier: ましょう is ます plus this same う, and でしょう is である plus it. That is why the volitional covers both "let us" and "probably" with no change of shape: む never distinguished them either.'),
  ('も adds everything in, so 何も takes all the possible whats at once. Follow it with a negative and every one of them is ruled out.

That is a standard move rather than a set of vocabulary: 誰も, どこも, いつも are the same sweep. And with か instead — 何か, 誰か — the question is left open rather than swept, giving "something" and "someone".', 'も adds everything in, so 何も takes all the possible whats at once. Follow it with a negative and every one of them is ruled out.

That is a standard move rather than a set of vocabulary: 誰も, どこも, いつも are the same sweep. And with か instead (何か, 誰か), the question is left open rather than swept, giving "something" and "someone".'),
  ('もうすぐ is the もう of "already" with すぐ, "immediately" — already close.', 'もうすぐ is the もう of "already" with すぐ, "immediately": already close.'),
  ('もしない puts も between the stem and する — "does not even do it".', 'もしない puts も between the stem and する: "does not even do it".'),
  ('もと is 元 or 基 — the source or the material a thing is made from.', 'もと is 元 or 基, the source or the material a thing is made from.'),
  ('もの is 物, a thing — and naming something as a thing is what makes it general.', 'もの is 物, a thing, and naming something as a thing is what makes it general.'),
  ('もの names the situation as a thing; なら supposes it. Together they suppose a thing that the speaker doubts.

That doubt is why the potential goes in front — 帰れるものなら帰りたい — and why the sentence is wistful rather than planning. You do not put a real possibility into ものなら; the construction exists to mark one as out of reach.', 'もの names the situation as a thing; なら supposes it. Together they suppose a thing that the speaker doubts.

That doubt is why the potential goes in front (帰れるものなら帰りたい), and why the sentence is wistful rather than planning. You do not put a real possibility into ものなら; the construction exists to mark one as out of reach.'),
  ('ものだから is the noun 物 with だから — naming the reason as a plain thing.', 'ものだから is the noun 物 with だから, naming the reason as a plain thing.'),
  ('ものなら is the noun もの with the conditional なら — "if it were a thing that could happen".', 'ものなら is the noun もの with the conditional なら: "if it were a thing that could happen".'),
  ('ものの is the noun 物 with の — the same 物 as ものだ.', 'ものの is the noun 物 with の, the same 物 as ものだ.'),
  ('もらう is 貰う, "to receive" — the same event as くれる, told from the other end.', 'もらう is 貰う, "to receive", the same event as くれる, told from the other end.'),
  ('や already lists loosely — 本や鉛筆 names a couple of examples rather than everything. ら adds vagueness on top, the same ら as in 彼ら and これら.

So やら is a doubly open list, which is why it suits complaint and fluster: 雨やら風やら names two out of a mess nobody is trying to count. The question use, 何やら, is the same vagueness with nothing listed.', 'や already lists loosely: 本や鉛筆 names a couple of examples rather than everything. ら adds vagueness on top, the same ら as in 彼ら and これら.

So やら is a doubly open list, which is why it suits complaint and fluster: 雨やら風やら names two out of a mess nobody is trying to count. The question use, 何やら, is the same vagueness with nothing listed.'),
  ('やら is the worn-down remainder of classical にやあらむ — "might it be that…?"', 'やら is the worn-down remainder of classical にやあらむ: "might it be that…?"'),
  ('ようとする is the volitional with と and する — treating the intention as the thing you do.', 'ようとする is the volitional with と and する, treating the intention as the thing you do.'),
  ('ように is the noun 様 with に — "in such a way that it comes about".', 'ように is the noun 様 with に: "in such a way that it comes about".'),
  ('ようにも is the volitional with にも — even setting out to, the ability is not there.', 'ようにも is the volitional with にも: even setting out to, the ability is not there.'),
  ('よそ is 余所 — somewhere else, another place entirely.', 'よそ is 余所, somewhere else, another place entirely.'),
  ('より marks the thing compared AGAINST — the loser. ほうが marks the winner. They pair up: BよりAのほうが高い.', 'より marks the thing compared AGAINST, the loser. ほうが marks the winner. They pair up: BよりAのほうが高い.'),
  ('らし meant a conclusion reached on grounds outside the speaker. That is the whole difference between 雨らしい and 雨のようだ: らしい leans on what was reported or observed, ようだ on what the speaker makes of it.

The same root gives the suffix in 男らしい and 学生らしい, "as one would expect of". Both uses are one idea — judging something by the evidence of what it appears to be.', 'らし meant a conclusion reached on grounds outside the speaker. That is the whole difference between 雨らしい and 雨のようだ: らしい leans on what was reported or observed, ようだ on what the speaker makes of it.

The same root gives the suffix in 男らしい and 学生らしい, "as one would expect of". Both uses are one idea: judging something by the evidence of what it appears to be.'),
  ('わけ is the noun 訳 — a reason, or the sense a thing makes.', 'わけ is the noun 訳, a reason, or the sense a thing makes.'),
  ('わけ is 分け, from 分ける "to divide" — a distinction drawn, hence the sense a thing makes.', 'わけ is 分け, from 分ける "to divide", a distinction drawn, hence the sense a thing makes.'),
  ('わけがない flatly denies that any reason exists. わけではない uses では — the topic-marked negative — and topic-marking is what makes it partial: it denies this particular account while leaving others standing.

So 嫌いなわけではない says not that liking is untrue but that dislike is not the explanation. The same では does the same softening everywhere else in the language, which is why the pattern feels hedged without anything hedging having been added.', 'わけがない flatly denies that any reason exists. わけではない uses では (the topic-marked negative), and topic-marking is what makes it partial: it denies this particular account while leaving others standing.

So 嫌いなわけではない says not that liking is untrue but that dislike is not the explanation. The same では does the same softening everywhere else in the language, which is why the pattern feels hedged without anything hedging having been added.'),
  ('を was once /wo/, distinct from お /o/. The /w/ dropped before all vowels except /a/, so を and お merged in speech.

The 1946 orthography reforms removed を from ordinary words but kept it for the object particle, precisely because that one job is frequent and unambiguous. So を is a character preserved for a single grammatical function — which is why you never see it inside a word.', 'を was once /wo/, distinct from お /o/. The /w/ dropped before all vowels except /a/, so を and お merged in speech.

The 1946 orthography reforms removed を from ordinary words but kept it for the object particle, precisely because that one job is frequent and unambiguous. So を is a character preserved for a single grammatical function, which is why you never see it inside a word.'),
  ('をはじめ is 始め, the noun from 始める — the head of a list, not merely its first item.', 'をはじめ is 始め, the noun from 始める, the head of a list, not merely its first item.'),
  ('をものともせず is "not even making a thing of it" — もの, とも, and せず.', 'をものともせず is "not even making a thing of it": もの, とも, and せず.'),
  ('んです is the nominaliser の with です — "it is the case that".', 'んです is the nominaliser の with です: "it is the case that".'),
  ('ボールが弾む is a ball bouncing; 話が弾む is a conversation that takes off. The noun is momentum.

So 転んだはずみに is on the bounce of falling — the accident carried on into something else by its own momentum. That is why the pattern always describes something unintended: a bounce is not aimed.', 'ボールが弾む is a ball bouncing; 話が弾む is a conversation that takes off. The noun is momentum.

So 転んだはずみに is on the bounce of falling, the accident carried on into something else by its own momentum. That is why the pattern always describes something unintended: a bounce is not aimed.'),
  ('一つ, 二つ … 十つ does not exist — ten is 十.', '一つ, 二つ … 十つ does not exist; ten is 十.'),
  ('一分 is いっぷん, 二分 is にふん, 三分 is さんぷん — three consonants across three consecutive numbers. 時 is steadier but still gives よじ and くじ rather than しじ and きゅうじ.

These are ordinary sound changes at a boundary, the same ones that give いっぽん and さんぼん. They are not learnable by rule in any form shorter than the list, which is why the list is what to learn.', '一分 is いっぷん, 二分 is にふん, 三分 is さんぷん: three consonants across three consecutive numbers. 時 is steadier but still gives よじ and くじ rather than しじ and きゅうじ.

These are ordinary sound changes at a boundary, the same ones that give いっぽん and さんぼん. They are not learnable by rule in any form shorter than the list, which is why the list is what to learn.'),
  ('一方 is "one side" — one of the two directions a thing can be looked at from.', '一方 is "one side": one of the two directions a thing can be looked at from.'),
  ('一番 is "number one" — a plain ordinal doing the work of a superlative.', '一番 is "number one", a plain ordinal doing the work of a superlative.'),
  ('三人 is さんにん, borrowed Chinese number plus borrowed reading, entirely regular. 一人 and 二人 are ひと and ふた — the native numbers behind ひとつ and ふたつ — with a native ending.

So the exception is not an exception but a survival: the two commonest counts kept the old words while everything above three went over to the borrowed system. The same native numbers survive in the date series — 二日, 三日, 四日 — which stayed native all the way to 十日.', '三人 is さんにん, borrowed Chinese number plus borrowed reading, entirely regular. 一人 and 二人 are ひと and ふた (the native numbers behind ひとつ and ふたつ), with a native ending.

So the exception is not an exception but a survival: the two commonest counts kept the old words while everything above three went over to the borrowed system. The same native numbers survive in the date series (二日, 三日, 四日), which stayed native all the way to 十日.'),
  ('三人 is さんにん, borrowed Chinese number plus borrowed reading, entirely regular. 一人 and 二人 are ひと and ふた — the native numbers behind ひとつ and ふたつ — with a native ending.

So the exception is not an exception but a survival: the two commonest counts kept the old words while everything above three went over to the borrowed system. The same pattern shows in 一日 and 二日 against 三日.', '三人 is さんにん, borrowed Chinese number plus borrowed reading, entirely regular. 一人 and 二人 are ひと and ふた (the native numbers behind ひとつ and ふたつ), with a native ending.

So the exception is not an exception but a survival: the two commonest counts kept the old words while everything above three went over to the borrowed system. The same pattern shows in 一日 and 二日 against 三日.'),
  ('上 is "on top of" — and doing something on top of another thing means doing it afterwards, on that footing.', '上 is "on top of", and doing something on top of another thing means doing it afterwards, on that footing.'),
  ('上, 下, 中, 前 and 後ろ are nouns, not prepositions — which is why they take の.', '上, 下, 中, 前 and 後ろ are nouns, not prepositions, which is why they take の.'),
  ('上手 and 下手 are 上 and 下 with 手 — the upper hand and the lower.', '上手 and 下手 are 上 and 下 with 手: the upper hand and the lower.'),
  ('予定 is 予 ("beforehand") plus 定 ("fixed") — settled in advance.', '予定 is 予 ("beforehand") plus 定 ("fixed"), settled in advance.'),
  ('仕方 is し, the stem of する, plus 方 — a way of doing.', '仕方 is し, the stem of する, plus 方, a way of doing.'),
  ('仕方 is 仕 plus 方 — a way of doing. There is no way to do anything about it.', '仕方 is 仕 plus 方, a way of doing. There is no way to do anything about it.'),
  ('伴う is "to accompany" — the 伴 of 同伴 and 伴奏.', '伴う is "to accompany", the 伴 of 同伴 and 伴奏.'),
  ('伴う is native とも — the とも of 友 and お供 — with the old verb-making なう.', '伴う is native とも, the とも of 友 and お供, with the old verb-making なう.'),
  ('余儀 is "another way" — and 余儀なく is having none.', '余儀 is "another way", and 余儀なく is having none.'),
  ('全然 means "wholly, entirely", and in Meiji writing — Sōseki among others — it modifies positives freely. The rule tying it to negatives is younger than the word.

So 全然大丈夫, which is corrected as sloppy, is closer to the original than the rule that forbids it. Worth knowing because it will be corrected anyway: the prescription is real even though the history is not on its side.', '全然 means "wholly, entirely", and in Meiji writing (Sōseki among others), it modifies positives freely. The rule tying it to negatives is younger than the word.

So 全然大丈夫, which is corrected as sloppy, is closer to the original than the rule that forbids it. Worth knowing because it will be corrected anyway: the prescription is real even though the history is not on its side.'),
  ('兼ねる is to be unable to bring oneself to something. わかりかねます is a refusal dressed as inability, which is why it is the polite way to say no in business.

かねない is that verb negated — not-unable — hence "might well". Two forms one syllable apart, opposite in meaning, and the double negative is the whole explanation.', '兼ねる is to be unable to bring oneself to something. わかりかねます is a refusal dressed as inability, which is why it is the polite way to say no in business.

かねない is that verb negated (not-unable), hence "might well". Two forms one syllable apart, opposite in meaning, and the double negative is the whole explanation.'),
  ('出かけるところ is the place in events where leaving is about to occur. The metaphor is so ordinary in English too — "at the point of leaving" — that it usually passes unnoticed.

Seeing it as a place explains why the tense in front does all the work and ところ itself never changes: 出かけるところ is the spot before, 出かけているところ the spot during, 出かけたところ the spot just after. It also explains the particle, since ところ is a noun and takes を, に and で like any other.', '出かけるところ is the place in events where leaving is about to occur. The metaphor is so ordinary in English too ("at the point of leaving") that it usually passes unnoticed.

Seeing it as a place explains why the tense in front does all the work and ところ itself never changes: 出かけるところ is the spot before, 出かけているところ the spot during, 出かけたところ the spot just after. It also explains the particle, since ところ is a noun and takes を, に and で like any other.'),
  ('出来る is literally "to come out" — to come into being.', '出来る is literally "to come out": to come into being.'),
  ('出来る is 出る plus 来る — literally "to come out".', '出来る is 出る plus 来る, literally "to come out".'),
  ('分かる is 分ける, "to divide" — understanding is telling things apart.', '分かる is 分ける, "to divide": understanding is telling things apart.'),
  ('分かる shares its root with 分ける, "to divide" — understanding is telling things apart.', '分かる shares its root with 分ける, "to divide": understanding is telling things apart.'),
  ('医者になる arrives at the point "doctor". The particle is the same one in 東京に着く.

With an adjective the point is expressed adverbially instead: 大きくなる, 静かになる, using く and に, the two adverb endings. And なる pairs with する throughout the language — ことになる against ことにする, ようになる against ようにする — as what happens against what you bring about.', '医者になる arrives at the point "doctor". The particle is the same one in 東京に着く.

With an adjective the point is expressed adverbially instead: 大きくなる, 静かになる, using く and に, the two adverb endings. And なる pairs with する throughout the language (ことになる against ことにする, ようになる against ようにする) as what happens against what you bring about.'),
  ('千円しかない is "apart from a thousand yen, there is not". しか sets the thing aside and the negative rules out the rest.

It is a late arrival — it spread in the Edo period and is essentially absent from Heian prose, which used 〜より外…ず instead. The pieces are usually read as the particle し plus the particle か. That the negative is required is not a rule to remember but the other half of the sentence, and it is why しか carries a shortfall where だけ, which merely limits, does not.', '千円しかない is "apart from a thousand yen, there is not". しか sets the thing aside and the negative rules out the rest.

It is a late arrival; it spread in the Edo period and is essentially absent from Heian prose, which used 〜より外…ず instead. The pieces are usually read as the particle し plus the particle か. That the negative is required is not a rule to remember but the other half of the sentence, and it is why しか carries a shortfall where だけ, which merely limits, does not.'),
  ('友達と行く pairs you with a companion exactly as 本と鉛筆 pairs two things. Nothing distinguishes them but what is on either side.

It is why と cannot be used for a one-sided action — 先生と話す is a conversation, 先生に話す is telling — since pairing implies both parties are in it.', '友達と行く pairs you with a companion exactly as 本と鉛筆 pairs two things. Nothing distinguishes them but what is on either side.

It is why と cannot be used for a one-sided action: 先生と話す is a conversation, 先生に話す is telling, since pairing implies both parties are in it.'),
  ('反する is "to run counter to" — the 反 of 反対 and 反面.', '反する is "to run counter to", the 反 of 反対 and 反面.'),
  ('反面 is literally "the opposite face" — 反 as in 反対, 面 as a surface.', '反面 is literally "the opposite face": 反 as in 反対, 面 as a surface.'),
  ('向け is intent — it was made for them. 向き is fit — it happens to suit them. A textbook can be 子ども向け without being 子ども向き.', '向け is intent: it was made for them. 向き is fit: it happens to suit them. A textbook can be 子ども向け without being 子ども向き.'),
  ('向ける is to aim something; 向く is to face. 子供向け is aimed at children by whoever made it; 子供向き is suited to children by its own nature.

So the distinction textbooks state as a rule is the ordinary transitive-intransitive pair that runs through the whole language — 開ける and 開く, 集める and 集まる. Somebody points the one; the other simply faces.', '向ける is to aim something; 向く is to face. 子供向け is aimed at children by whoever made it; 子供向き is suited to children by its own nature.

So the distinction textbooks state as a rule is the ordinary transitive-intransitive pair that runs through the whole language: 開ける and 開く, 集める and 集まる. Somebody points the one; the other simply faces.'),
  ('否 is the classical word for "no" — the pattern is literally "whether or no".', '否 is the classical word for "no"; the pattern is literally "whether or no".'),
  ('否 survives in 安否, 否定 and in 否 read いな. かどうか says "whether — how — whether"; か否か says "whether or not", with the actual word for no in the middle.

The two are the same question, one modern and one classical, and that is the only difference between them: か否か is what かどうか wears to a formal occasion.', '否 survives in 安否, 否定 and in 否 read いな. かどうか says "whether, how, whether"; か否か says "whether or not", with the actual word for no in the middle.

The two are the same question, one modern and one classical, and that is the only difference between them: か否か is what かどうか wears to a formal occasion.'),
  ('問わず is 問う, "to ask", with the classical negative ず — "without asking".', '問わず is 問う, "to ask", with the classical negative ず: "without asking".'),
  ('基づく is 基 ("foundation") plus 付く ("to attach") — fixed onto a base.', '基づく is 基 ("foundation") plus 付く ("to attach"), fixed onto a base.'),
  ('堪える is the endure of たまらない — but 堪 has two readings and they point opposite ways.', '堪える is the endure of たまらない, but 堪 has two readings and they point opposite ways.'),
  ('堪る is an ordinary verb of enduring, close kin to 耐える. 暑くてたまらない is heat that cannot be borne.

Because the verb is about the speaker''s own endurance, the pattern only works on your own sensations and feelings. Another person''s unbearable heat needs たまらないらしい or 暑がっている — the same restriction that gives がる its job at N4.', '堪る is an ordinary verb of enduring, close kin to 耐える. 暑くてたまらない is heat that cannot be borne.

Because the verb is about the speaker''s own endurance, the pattern only works on your own sensations and feelings. Another person''s unbearable heat needs たまらないらしい or 暑がっている, the same restriction that gives がる its job at N4.'),
  ('場合 is a native compound — ば, a place, with あい, a meeting.', '場合 is a native compound: ば, a place, with あい, a meeting.'),
  ('場合 is 場 ("place") plus 合 ("occasion, fitting") — the case in which something applies.', '場合 is 場 ("place") plus 合 ("occasion, fitting"), the case in which something applies.'),
  ('塗 is a shared spelling, not shared ancestry — まみれる is not kin to 塗る. It is attested from the Heian period, in 大和物語 among others.

What is まみれ has had something spread over it, typically things that genuinely coat: 血まみれ, 泥まみれ, 汗まみれ. The conventional extension is to clinging abstractions — 借金まみれ — where だらけ, which can hold anything anywhere including mistakes, is the broader word.', '塗 is a shared spelling, not shared ancestry: まみれる is not kin to 塗る. It is attested from the Heian period, in 大和物語 among others.

What is まみれ has had something spread over it, typically things that genuinely coat: 血まみれ, 泥まみれ, 汗まみれ. The conventional extension is to clinging abstractions (借金まみれ), where だらけ, which can hold anything anywhere including mistakes, is the broader word.'),
  ('大言海 takes it that way: a mimetic for liquid running everywhere, plus the suffix that gives 塩気 and 嫌気. It is not certain, but it is a real account rather than a blank, and the word is attested from the Muromachi period for blood, sweat and mud.

What separates it from まみれ and ずくめ is reach. まみれ needs something that could coat a surface, ずくめ a single quality filling a thing completely, while だらけ takes anything in unwelcome quantity — mud, mistakes, holes.', '大言海 takes it that way: a mimetic for liquid running everywhere, plus the suffix that gives 塩気 and 嫌気. It is not certain, but it is a real account rather than a blank, and the word is attested from the Muromachi period for blood, sweat and mud.

What separates it from まみれ and ずくめ is reach. まみれ needs something that could coat a surface, ずくめ a single quality filling a thing completely, while だらけ takes anything in unwelcome quantity: mud, mistakes, holes.'),
  ('始める, 終わる and 続ける are full verbs. Attached to a stem they say when the action starts, stops or carries on, and nothing is idiomatic about the join.

始める is the transitive member and 始まる never compounds this way, so it is 降り始める and never 降り始まる. 終わる does not follow that rule — it compounds as it stands, 読み終わる, with 読み終える alongside it. The pairing has to be learned verb by verb.', '始める, 終わる and 続ける are full verbs. Attached to a stem they say when the action starts, stops or carries on, and nothing is idiomatic about the join.

始める is the transitive member and 始まる never compounds this way, so it is 降り始める and never 降り始まる. 終わる does not follow that rule; it compounds as it stands, 読み終わる, with 読み終える alongside it. The pairing has to be learned verb by verb.'),
  ('始末 is 始 plus 末 — the beginning and the end, the whole course of a thing.', '始末 is 始 plus 末: the beginning and the end, the whole course of a thing.'),
  ('子供のとき and 東京に行くとき are the same construction as 赤い本: something describing a noun, with nothing added to join them.

So the tense inside the clause is doing real work. 行くとき is on the way there, 行ったとき is after arriving — because the verb describes the state of the 時 rather than the state of the main sentence.', '子供のとき and 東京に行くとき are the same construction as 赤い本: something describing a noun, with nothing added to join them.

So the tense inside the clause is doing real work. 行くとき is on the way there, 行ったとき is after arriving, because the verb describes the state of the 時 rather than the state of the main sentence.'),
  ('子供を連れて行く is taking a child along. につれて keeps that image exactly: one thing moves and drags the other after it.

Hence the constraint that catches people out — につれて needs gradual, continuous change on both sides. A single step cannot lead anything along, so 春になるにつれて works and 駅に着くにつれて does not.', '子供を連れて行く is taking a child along. につれて keeps that image exactly: one thing moves and drags the other after it.

Hence the constraint that catches people out: につれて needs gradual, continuous change on both sides. A single step cannot lead anything along, so 春になるにつれて works and 駅に着くにつれて does not.'),
  ('學 and 学 are one character. 學 is what you meet in anything printed before the postwar reforms, and in Chinese outside the mainland; 学 is the shinjitai. The bottom 子 is untouched — the whole change is in the upper element.', '學 and 学 are one character. 學 is what you meet in anything printed before the postwar reforms, and in Chinese outside the mainland; 学 is the shinjitai. The bottom 子 is untouched; the whole change is in the upper element.'),
  ('寒くない is literally "not existing coldly": く turns 寒い into an adverb and ない denies it. Both halves are ordinary.

Which is why the negative then inflects again — 寒くなかった, 寒くなくて — with all the tense living in the ない rather than in 寒い. The adjective hands the work to the negative and stops changing.', '寒くない is literally "not existing coldly": く turns 寒い into an adverb and ない denies it. Both halves are ordinary.

Which is why the negative then inflects again (寒くなかった, 寒くなくて), with all the tense living in the ない rather than in 寒い. The adjective hands the work to the negative and stops changing.'),
  ('寝る前に uses the dictionary form because the sleeping has not happened yet at the point being named. 寝た後で uses the past because it has.

The tense is not agreeing with the main clause; it is describing the state of affairs at the moment 前 or 後 picks out. Both are ordinary nouns of position — the same 前 as 駅の前 — and they behave as position nouns should.', '寝る前に uses the dictionary form because the sleeping has not happened yet at the point being named. 寝た後で uses the past because it has.

The tense is not agreeing with the main clause; it is describing the state of affairs at the moment 前 or 後 picks out. Both are ordinary nouns of position (the same 前 as 駅の前), and they behave as position nouns should.'),
  ('対 is the 対 of 反対 and 対立 — one thing set facing another. に対して puts the sentence in that posture.

Both senses follow from the picture. Facing someone is directing something at them (私に対して失礼だ); facing something is being set against it, which gives the contrastive reading (兄に対して弟は静かだ). Same stance, read forwards or sideways.', '対 is the 対 of 反対 and 対立: one thing set facing another. に対して puts the sentence in that posture.

Both senses follow from the picture. Facing someone is directing something at them (私に対して失礼だ); facing something is being set against it, which gives the contrastive reading (兄に対して弟は静かだ). Same stance, read forwards or sideways.'),
  ('尽くす is the verb in 力を尽くす. What is ずくめ has been filled to the point where nothing else is left.

That totality is why the pattern takes only a small set of nouns and always positively or completely — 黒ずくめ, いいことずくめ. だらけ is a mess of something; ずくめ is a thing complete in one quality with no remainder.', '尽くす is the verb in 力を尽くす. What is ずくめ has been filled to the point where nothing else is left.

That totality is why the pattern takes only a small set of nouns and always positively or completely: 黒ずくめ, いいことずくめ. だらけ is a mess of something; ずくめ is a thing complete in one quality with no remainder.'),
  ('巡る is the verb in 巡り会う and お遍路が巡る. をめぐって puts the sentence in orbit around a thing.

It puts several parties around one contested thing, and in practice it has settled into dispute contexts — 対立, 議論, 争い — where について, which merely attaches, stays neutral. That is a habit the phrase has acquired rather than anything the verb spells out.', '巡る is the verb in 巡り会う and お遍路が巡る. をめぐって puts the sentence in orbit around a thing.

It puts several parties around one contested thing, and in practice it has settled into dispute contexts (対立, 議論, 争い), where について, which merely attaches, stays neutral. That is a habit the phrase has acquired rather than anything the verb spells out.'),
  ('巡る is the verb in 巡り会う and お遍路が巡る. をめぐって puts the sentence in orbit around a thing.

That is where the argument comes from, and it is not stated anywhere in the words. People circling a topic are people disputing it, so をめぐって attracts 対立, 議論 and 争い, while について — which merely attaches — stays neutral.', '巡る is the verb in 巡り会う and お遍路が巡る. をめぐって puts the sentence in orbit around a thing.

That is where the argument comes from, and it is not stated anywhere in the words. People circling a topic are people disputing it, so をめぐって attracts 対立, 議論 and 争い, while について, which merely attaches, stays neutral.'),
  ('帰れるものなら supposes an ability. 帰ろうものなら supposes an attempt — the volitional is intention, not capacity.

So the wistfulness inverts into a warning: 遅れようものなら大変だ says that should you so much as try it, the consequences follow. One form is longing for what cannot be done, the other is a threat about what might be, and only the stem in front tells them apart.', '帰れるものなら supposes an ability. 帰ろうものなら supposes an attempt: the volitional is intention, not capacity.

So the wistfulness inverts into a warning: 遅れようものなら大変だ says that should you so much as try it, the consequences follow. One form is longing for what cannot be done, the other is a threat about what might be, and only the stem in front tells them apart.'),
  ('弾を込める is loading a round. 心を込めて is loading the feeling in, and the metaphor is as physical in Japanese as it sounds.

Which is why を込めて only takes feelings and intentions, never facts or objects: what you load a thing with is something that fills it. The related 込む as a suffix — 詰め込む, 話し込む — is the same verb doing the same work.', '弾を込める is loading a round. 心を込めて is loading the feeling in, and the metaphor is as physical in Japanese as it sounds.

Which is why を込めて only takes feelings and intentions, never facts or objects: what you load a thing with is something that fills it. The related 込む as a suffix (詰め込む, 話し込む) is the same verb doing the same work.'),
  ('当たる is "to strike, to hit" — the moment something lands.', '当たる is "to strike, to hit", the moment something lands.'),
  ('彼は寒い is not merely unusual, it is ungrammatical for most speakers. You may report your own inner state flatly and nobody else''s, and がる is the repair: 彼は寒がっている says he is showing every sign of cold.

It is also why がる produces a verb rather than an adjective. Signs are things somebody does — hence 寒がっている in the progressive, and 欲しがる taking を where 欲しい takes が, because wanting-behaviour has an object in a way that wanting does not.', '彼は寒い is not merely unusual, it is ungrammatical for most speakers. You may report your own inner state flatly and nobody else''s, and がる is the repair: 彼は寒がっている says he is showing every sign of cold.

It is also why がる produces a verb rather than an adjective. Signs are things somebody does, hence 寒がっている in the progressive, and 欲しがる taking を where 欲しい takes が, because wanting-behaviour has an object in a way that wanting does not.'),
  ('彼は寒い, as a flat present-tense assertion about someone else''s inner state, is rejected by most speakers: you may report your own feelings directly and not another''s. がる is one standard repair — 彼は寒がっている asserts the visible signs instead — alongside ようだ, そうだ and 〜と言っている. Narrative past and quoted speech lift the restriction entirely, which is why 彼は寒かった is ordinary.

It is also why がる produces a verb rather than an adjective. Signs are things somebody does — hence 寒がっている in the progressive, and 欲しがる taking を where 欲しい takes が, because wanting-behaviour has an object in a way that wanting does not.', '彼は寒い, as a flat present-tense assertion about someone else''s inner state, is rejected by most speakers: you may report your own feelings directly and not another''s. がる is one standard repair (彼は寒がっている asserts the visible signs instead) alongside ようだ, そうだ and 〜と言っている. Narrative past and quoted speech lift the restriction entirely, which is why 彼は寒かった is ordinary.

It is also why がる produces a verb rather than an adjective. Signs are things somebody does, hence 寒がっている in the progressive, and 欲しがる taking を where 欲しい takes が, because wanting-behaviour has an object in a way that wanting does not.'),
  ('応じる is "to respond, to answer" — the 応 of 応答 and 反応.', '応じる is "to respond, to answer", the 応 of 応答 and 反応.'),
  ('戰 is the pre-reform form, 戦 the shinjitai. The right-hand 戈 — the halberd that carries the meaning — is unchanged; the simplification is entirely on the left, where 單 became 単.', '戰 is the pre-reform form, 戦 the shinjitai. The right-hand 戈 (the halberd that carries the meaning) is unchanged; the simplification is entirely on the left, where 單 became 単.'),
  ('所 is an ordinary noun. 出かけるところ is the spot just before leaving, 出かけているところ the spot during, 出かけたところ the spot immediately after.

Worth holding apart from たところで at N1, which looks almost identical and is not: たところで is hypothetical — even supposing you had — while たところだ reports something that genuinely just happened. The で and the だ carry the whole difference.', '所 is an ordinary noun. 出かけるところ is the spot just before leaving, 出かけているところ the spot during, 出かけたところ the spot immediately after.

Worth holding apart from たところで at N1, which looks almost identical and is not: たところで is hypothetical (even supposing you had), while たところだ reports something that genuinely just happened. The で and the だ carry the whole difference.'),
  ('所 locates a moment as a place. The を marks that moment as what the speaker''s intrusion acts upon.

お忙しいところをすみません apologises for the busy moment itself, not for anything done in it. That is why the pattern lives in apology and thanks — it names someone''s time as a thing you have taken — and equally in being caught or rescued mid-moment: 寝ているところを起こされた is the same intrusion from the other side.', '所 locates a moment as a place. The を marks that moment as what the speaker''s intrusion acts upon.

お忙しいところをすみません apologises for the busy moment itself, not for anything done in it. That is why the pattern lives in apology and thanks (it names someone''s time as a thing you have taken), and equally in being caught or rescued mid-moment: 寝ているところを起こされた is the same intrusion from the other side.'),
  ('所 locates a moment. The past tense puts it after the act, and で marks it as where matters stand.

So 謝ったところで許されない pictures the apology as already made inside a supposition — even granting it done, nothing follows. The た is perfective inside an irrealis rather than a report of something that happened, which is why 今から謝ったところで works. What comes after must be negative in import, though 無駄だ and 同じことだ serve as well as ない.', '所 locates a moment. The past tense puts it after the act, and で marks it as where matters stand.

So 謝ったところで許されない pictures the apology as already made inside a supposition: even granting it done, nothing follows. The た is perfective inside an irrealis rather than a report of something that happened, which is why 今から謝ったところで works. What comes after must be negative in import, though 無駄だ and 同じことだ serve as well as ない.'),
  ('抜き is 抜く, "to pull out" — the thing is extracted, not merely absent.', '抜き is 抜く, "to pull out": the thing is extracted, not merely absent.'),
  ('抜く is to pull out, so it removes something that would normally be included — which is why it works both for formalities and for wasabi.', '抜く is to pull out, so it removes something that would normally be included, which is why it works both for formalities and for wasabi.'),
  ('敵ながらあっぱれ, 残念ながら, 知りながら黙っていた — none of these needs a も, and all of them concede. The concession is ながら''s own, inherited from its older sense of a state persisting unchanged, the one preserved in 昔ながら and 生まれながらに.

So も is not supplying the concession but sharpening it. 知っていながらも simply presses harder on a contrast ながら was already making.', '敵ながらあっぱれ, 残念ながら, 知りながら黙っていた: none of these needs a も, and all of them concede. The concession is ながら''s own, inherited from its older sense of a state persisting unchanged, the one preserved in 昔ながら and 生まれながらに.

So も is not supplying the concession but sharpening it. 知っていながらも simply presses harder on a contrast ながら was already making.'),
  ('方 is an ordinary noun meaning a side, a direction, or one of several alternatives. 電車のほうが速い is literally "the train side is faster".

Japanese has no comparative inflection — no -er ending. It compares by naming a side and saying something about it, which is why the construction needs a noun at all.', '方 is an ordinary noun meaning a side, a direction, or one of several alternatives. 電車のほうが速い is literally "the train side is faster".

Japanese has no comparative inflection, no -er ending. It compares by naming a side and saying something about it, which is why the construction needs a noun at all.'),
  ('方 is the same 方 as ほうが and 〜方: a side or direction. 一方 names one of them and leaves the other implied.

That is why 一方で can set two quite separate matters beside each other while 反面 cannot — sides do not have to belong to the same object. And 一方 alone at the head of a sentence works as "meanwhile", the other side of the story.', '方 is the same 方 as ほうが and 〜方: a side or direction. 一方 names one of them and leaves the other implied.

That is why 一方で can set two quite separate matters beside each other while 反面 cannot; sides do not have to belong to the same object. And 一方 alone at the head of a sentence works as "meanwhile", the other side of the story.'),
  ('方 literally means "side" or "direction", so the phrase is "the train side is faster" — Japanese compares by pointing at a side rather than inflecting the adjective.', '方 literally means "side" or "direction", so the phrase is "the train side is faster"; Japanese compares by pointing at a side rather than inflecting the adjective.'),
  ('早い is the ordinary adjective, か the question particle. 座るが早いか眠った asks whether the sitting was quicker — and by asking, says the two were level.

The が is the classical subject marker on a plain verb, which is why the construction takes the dictionary form and not a past. It is a question in shape and a statement of simultaneity in use.', '早い is the ordinary adjective, か the question particle. 座るが早いか眠った asks whether the sitting was quicker, and by asking, says the two were level.

The が is the classical subject marker on a plain verb, which is why the construction takes the dictionary form and not a past. It is a question in shape and a statement of simultaneity in use.'),
  ('早い is the ordinary adjective, か the question particle. 座るが早いか眠った asks whether the sitting was quicker — and by asking, says the two were level.

The が is the classical subject marker on a plain verb. The dictionary form is required by the construction itself, which views the event at its onset — classical が took past forms happily enough, so the particle is not what rules them out here. It is a question in shape and a statement of simultaneity in use.', '早い is the ordinary adjective, か the question particle. 座るが早いか眠った asks whether the sitting was quicker, and by asking, says the two were level.

The が is the classical subject marker on a plain verb. The dictionary form is required by the construction itself, which views the event at its onset; classical が took past forms happily enough, so the particle is not what rules them out here. It is a question in shape and a statement of simultaneity in use.'),
  ('書く runs across か・き・く・け・こ — five steps, 五段. 食べる never leaves the え row: 食べない, 食べます, 食べる, 食べれば. One step, 一段.

So the classification is not a list to memorise but a description of the stem you can watch happening. It also explains why only 五段 verbs have a て-form worth learning rules for: a stem that moves has consonants colliding with the ending, and a stem that stays put does not.', '書く runs across か・き・く・け・こ: five steps, 五段. 食べる never leaves the え row: 食べない, 食べます, 食べる, 食べれば. One step, 一段.

So the classification is not a list to memorise but a description of the stem you can watch happening. It also explains why only 五段 verbs have a て-form worth learning rules for: a stem that moves has consonants colliding with the ending, and a stem that stays put does not.'),
  ('書く runs across か・き・く・け・こ — five steps, 五段. 食べる never leaves the え row: 食べない, 食べます, 食べる, 食べれば. One step, 一段. The fifth step is newer than it looks: the class was called 四段 until the 1946 kana reform respelled 書かう as 書こう and added the お row.

So the classification is not a list to memorise but a description of the stem you can watch happening. It also explains why only 五段 verbs have a て-form worth learning rules for: a stem that moves has consonants colliding with the ending, and a stem that stays put does not.', '書く runs across か・き・く・け・こ: five steps, 五段. 食べる never leaves the え row: 食べない, 食べます, 食べる, 食べれば. One step, 一段. The fifth step is newer than it looks: the class was called 四段 until the 1946 kana reform respelled 書かう as 書こう and added the お row.

So the classification is not a list to memorise but a description of the stem you can watch happening. It also explains why only 五段 verbs have a て-form worth learning rules for: a stem that moves has consonants colliding with the ending, and a stem that stays put does not.'),
  ('末 is the tip or far end of something — the thin end of a branch.', '末 is the tip or far end of something, the thin end of a branch.'),
  ('本 means "origin, base" — and long thin things are counted by it because a tree trunk is one.', '本 means "origin, base", and long thin things are counted by it because a tree trunk is one.'),
  ('本か雑誌 leaves both open rather than choosing. It is the same か that turns 誰 into 誰か and a statement into a question.

So Japanese does not have a word for "or" so much as a way of marking alternatives as undecided — which is why か can attach to each item and why かどうか embeds a whole undecided question.', '本か雑誌 leaves both open rather than choosing. It is the same か that turns 誰 into 誰か and a statement into a question.

So Japanese does not have a word for "or" so much as a way of marking alternatives as undecided, which is why か can attach to each item and why かどうか embeds a whole undecided question.'),
  ('本とノート "a book and a notebook" — and nothing else. 友だちと行きます "go with a friend".', '本とノート "a book and a notebook", and nothing else. 友だちと行きます "go with a friend".'),
  ('本と鉛筆 pairs two nouns exhaustively. 友達と行く pairs you with a companion. 「はい」と言った pairs an utterance with the saying of it, and that quotative use does come straight from this particle.

The conditional と of N4 is a separate thread — it is usually traced through とも rather than directly from the pairing use — so the family is not quite as tidy as it looks. What holds across all of these is that と joins two things and claims they belong together, which is why と lists completely where や lists loosely.', '本と鉛筆 pairs two nouns exhaustively. 友達と行く pairs you with a companion. 「はい」と言った pairs an utterance with the saying of it, and that quotative use does come straight from this particle.

The conditional と of N4 is a separate thread (it is usually traced through とも rather than directly from the pairing use), so the family is not quite as tidy as it looks. What holds across all of these is that と joins two things and claims they belong together, which is why と lists completely where や lists loosely.'),
  ('本と鉛筆 pairs two nouns exhaustively. 友達と行く pairs you with a companion. 「はい」と言った pairs an utterance with the saying of it.

And 押すと開く pairs pushing with opening, which is where the conditional と comes from at N4. One particle, always joining two things and claiming they belong together — which is why と lists completely while や lists loosely.', '本と鉛筆 pairs two nouns exhaustively. 友達と行く pairs you with a companion. 「はい」と言った pairs an utterance with the saying of it.

And 押すと開く pairs pushing with opening, which is where the conditional と comes from at N4. One particle, always joining two things and claiming they belong together, which is why と lists completely while や lists loosely.'),
  ('枚 named a small piece of wood in Chinese, and in Japan was matched to the native ひら — a flat thin thing.', '枚 named a small piece of wood in Chinese, and in Japan was matched to the native ひら, a flat thin thing.'),
  ('極まりない is the noun 極まり — a stopping place — plus 無い.', '極まりない is the noun 極まり (a stopping place) plus 無い.'),
  ('極まる is "to reach the furthest point" — the 極 of 北極 and 極端.', '極まる is "to reach the furthest point", the 極 of 北極 and 極端.'),
  ('極まる is "to reach the furthest point", the 極 of 北極 and 極端, and 極まり is the point reached. 失礼極まりない says the rudeness has no such point, so it goes on without bound.

Read that way the puzzle disappears: the ない is doing ordinary negative work on a noun, not bleached negation on a verb. It is also why 失礼極まる means much the same thing rather than the opposite — one says the extreme is reached, the other that no bound exists.', '極まる is "to reach the furthest point", the 極 of 北極 and 極端, and 極まり is the point reached. 失礼極まりない says the rudeness has no such point, so it goes on without bound.

Read that way the puzzle disappears: the ない is doing ordinary negative work on a noun, not bleached negation on a verb. It is also why 失礼極まる means much the same thing rather than the opposite; one says the extreme is reached, the other that no bound exists.'),
  ('極み is the noun from the 極まる of 極まりない — the summit itself.', '極み is the noun from the 極まる of 極まりない, the summit itself.'),
  ('様 is an ordinary noun — the 様 of 様子 and of 皆様. 雨のようだ is literally "it has the appearance of rain".

Recognising it as a noun explains an entire family at once. ように is that noun with に, "in the manner that"; ようになる is coming to be that way; ようにする is making it that way; みたい is the casual stand-in for the same thing. Five patterns, one word — and it is why よう takes の after a noun, 学生のよう, exactly as any other noun would. みたい, worn down further, attaches directly instead: 学生みたい.', '様 is an ordinary noun, the 様 of 様子 and of 皆様. 雨のようだ is literally "it has the appearance of rain".

Recognising it as a noun explains an entire family at once. ように is that noun with に, "in the manner that"; ようになる is coming to be that way; ようにする is making it that way; みたい is the casual stand-in for the same thing. Five patterns, one word, and it is why よう takes の after a noun: 学生のよう, exactly as any other noun would. みたい, worn down further, attaches directly instead: 学生みたい.'),
  ('様 is an ordinary noun — the 様 of 様子 and of 皆様. 雨のようだ is literally "it has the appearance of rain".

Recognising it as a noun explains an entire family at once. ように is that noun with に, "in the manner that"; ようになる is coming to be that way; ようにする is making it that way; みたい is the casual stand-in for the same thing. Five patterns, one word, and it is why every one of them takes の after a noun — 学生のよう — exactly as any other noun would.', '様 is an ordinary noun, the 様 of 様子 and of 皆様. 雨のようだ is literally "it has the appearance of rain".

Recognising it as a noun explains an entire family at once. ように is that noun with に, "in the manner that"; ようになる is coming to be that way; ようにする is making it that way; みたい is the casual stand-in for the same thing. Five patterns, one word, and it is why every one of them takes の after a noun: 学生のよう, exactly as any other noun would.'),
  ('次第 is 次 plus 第 — order, sequence, the way things fall out.', '次第 is 次 plus 第: order, sequence, the way things fall out.'),
  ('気味 is 気 plus 味 — the feel and the flavour of a thing.', '気味 is 気 plus 味: the feel and the flavour of a thing.'),
  ('沿う is "to run alongside" — a road following a river.', '沿う is "to run alongside": a road following a river.'),
  ('済む means to be finished or squared away. すみません says the matter is not concluded: something remains owed.

Which is why one word covers apology, attention-getting and thanks. All three are the same admission that a debt is outstanding, and it explains why すみません can be a warmer thank-you than ありがとう — it acknowledges the trouble rather than only the result. The formal 済みません is the same word spelled out.', '済む means to be finished or squared away. すみません says the matter is not concluded: something remains owed.

Which is why one word covers apology, attention-getting and thanks. All three are the same admission that a debt is outstanding, and it explains why すみません can be a warmer thank-you than ありがとう; it acknowledges the trouble rather than only the result. The formal 済みません is the same word spelled out.'),
  ('渡る is "to cross over" — the verb for getting from one side to the other.', '渡る is "to cross over", the verb for getting from one side to the other.'),
  ('田中という人 is "a person one says 田中 of". The naming use is the plain literal reading, and it is why the thing named goes in front with no particle of its own.

The abstract use follows the same path. 彼が来るということ is "the saying that he comes" — と marks the quoted content, 言う makes it a stated thing, and こと turns that into a noun you can put a particle on.', '田中という人 is "a person one says 田中 of". The naming use is the plain literal reading, and it is why the thing named goes in front with no particle of its own.

The abstract use follows the same path. 彼が来るということ is "the saying that he comes": と marks the quoted content, 言う makes it a stated thing, and こと turns that into a noun you can put a particle on.'),
  ('番 is a turn or a position in a sequence, the 番 of 番号 and 交番. 一番 is simply first place.

Japanese has no superlative inflection, so it names a rank instead — exactly as it has no comparative and uses ほうが, "the side", instead. The で in クラスで一番 marks the field the ranking is taken within.', '番 is a turn or a position in a sequence, the 番 of 番号 and 交番. 一番 is simply first place.

Japanese has no superlative inflection, so it names a rank instead, exactly as it has no comparative and uses ほうが, "the side", instead. The で in クラスで一番 marks the field the ranking is taken within.'),
  ('皮切り is the first burn in a course of moxibustion — the one that cuts the skin.', '皮切り is the first burn in a course of moxibustion, the one that cuts the skin.'),
  ('相 is the prefix in 相手 and 相談, marking something done between parties. The verb is 俟つ, "to await, to rely on" — not the plain 待つ it is often written as — so the image is two things each counting on the other.

That mutual sense is why と相まって needs both halves to contribute. It is not "along with" but "each amplified by the other", which is why the result named afterwards is always more than either alone.', '相 is the prefix in 相手 and 相談, marking something done between parties. The verb is 俟つ, "to await, to rely on" (not the plain 待つ it is often written as), so the image is two things each counting on the other.

That mutual sense is why と相まって needs both halves to contribute. It is not "along with" but "each amplified by the other", which is why the result named afterwards is always more than either alone.'),
  ('相まって is 相 ("mutually") with 俟つ — two things relying on each other.', '相まって is 相 ("mutually") with 俟つ, two things relying on each other.'),
  ('相まって is 相 ("mutually") with 待つ — two things waiting on each other.', '相まって is 相 ("mutually") with 待つ, two things waiting on each other.'),
  ('私にとって is standing where I stand and looking from there. The verb is the everyday 取る, doing the work English does with "from the standpoint of".

That is why にとって wants a person or a group and sounds wrong on an inanimate thing with no vantage of its own, and why it pairs with judgements — 大切, 難しい, 必要 — rather than with plain descriptions of fact.', '私にとって is standing where I stand and looking from there. The verb is the everyday 取る, doing the work English does with "from the standpoint of".

That is why にとって wants a person or a group and sounds wrong on an inanimate thing with no vantage of its own, and why it pairs with judgements (大切, 難しい, 必要) rather than with plain descriptions of fact.'),
  ('私にとって is standing where I stand and looking from there. The verb is the everyday 取る, doing the work English does with "from the standpoint of".

That is why にとって wants something whose interests or standpoint can be at stake — a person, a group, a country, even a body, since 日本にとって and 体にとって are perfectly ordinary — and why it pairs with judgements like 大切, 難しい and 必要 rather than with plain descriptions of fact.', '私にとって is standing where I stand and looking from there. The verb is the everyday 取る, doing the work English does with "from the standpoint of".

That is why にとって wants something whose interests or standpoint can be at stake (a person, a group, a country, even a body, since 日本にとって and 体にとって are perfectly ordinary), and why it pairs with judgements like 大切, 難しい and 必要 rather than with plain descriptions of fact.'),
  ('経験を問わず on a job advertisement says nobody will be asking about experience. The verb is the ordinary one in 問題 and 質問.

It sits alongside にかかわらず and に限らず as three ways of saying the same indifference, each built from a different verb: not asking, not being concerned, not limiting. The register differs because the verbs do — を問わず belongs to notices and forms.', '経験を問わず on a job advertisement says nobody will be asking about experience. The verb is the ordinary one in 問題 and 質問.

It sits alongside にかかわらず and に限らず as three ways of saying the same indifference, each built from a different verb: not asking, not being concerned, not limiting. The register differs because the verbs do: を問わず belongs to notices and forms.'),
  ('置く is a full verb — 机に本を置く. Attached to a te-form it keeps both halves of its meaning: the doing, and the leaving in place afterwards.

So 〜ておく is never just "do in advance". It is doing something and leaving the result standing for later, which is why it fits preparation (予約しておく) and equally fits deliberately not undoing something (そのままにしておく). The contraction 〜とく is the same word said faster.', '置く is a full verb: 机に本を置く. Attached to a te-form it keeps both halves of its meaning: the doing, and the leaving in place afterwards.

So 〜ておく is never just "do in advance". It is doing something and leaving the result standing for later, which is why it fits preparation (予約しておく) and equally fits deliberately not undoing something (そのままにしておく). The contraction 〜とく is the same word said faster.'),
  ('置く is to put something down and leave it. において sets the matter down in a place and discusses it there — a job it grew into through kanbun reading, where 於 was rendered with this verb, which is how a verb of placing came to do locative work at all.

So the formality is not in the meaning but in the register: において is the written language''s で, and it is doing the same locating job with a heavier verb. That it shares a root with the everyday 〜ておく is easy to miss because one is written in kanji and the other never is.', '置く is to put something down and leave it. において sets the matter down in a place and discusses it there, a job it grew into through kanbun reading, where 於 was rendered with this verb, which is how a verb of placing came to do locative work at all.

So the formality is not in the meaning but in the register: において is the written language''s で, and it is doing the same locating job with a heavier verb. That it shares a root with the everyday 〜ておく is easy to miss because one is written in kanji and the other never is.'),
  ('至り is from 至る, "to arrive" — the point a thing has arrived at.', '至り is from 至る, "to arrive", the point a thing has arrived at.'),
  ('若い頃はよく遊んだものだ and 人は死ぬものだ look unrelated until you read もの literally. Both say "that is a thing" — the second about how the world reliably is, the first about how life reliably was.

Generality is the common element, and it is why ものだ cannot be used for a single occurrence. 昨日遊んだものだ is wrong: one afternoon is an event, not a thing that holds.', '若い頃はよく遊んだものだ and 人は死ぬものだ look unrelated until you read もの literally. Both say "that is a thing": the second about how the world reliably is, the first about how life reliably was.

Generality is the common element, and it is why ものだ cannot be used for a single occurrence. 昨日遊んだものだ is wrong: one afternoon is an event, not a thing that holds.'),
  ('行ったことがある is "there exists a having-gone". The past tense is inside the noun, not on ある.

That is why the present-tense version means something entirely different. 行くことがある has an instance of going that is not past, so it means "there are times when" — the same construction with the tense moved, and the difference is not idiomatic but grammatical.', '行ったことがある is "there exists a having-gone". The past tense is inside the noun, not on ある.

That is why the present-tense version means something entirely different. 行くことがある has an instance of going that is not past, so it means "there are times when", the same construction with the tense moved, and the difference is not idiomatic but grammatical.'),
  ('見える is "to be visible, to appear" — intransitive, so what appears takes が. The 様 supplies the manner, and the whole says something presents the appearance of being so.

It is more cautious than ようだ alone. ようだ is the speaker''s conclusion; ように見える reports only what is visible and leaves the conclusion unmade.', '見える is "to be visible, to appear": intransitive, so what appears takes が. The 様 supplies the manner, and the whole says something presents the appearance of being so.

It is more cautious than ようだ alone. ようだ is the speaker''s conclusion; ように見える reports only what is visible and leaves the conclusion unmade.'),
  ('見た, the past of 見る, plus the same 様 that gives ようだ. The origin says outright what the grammar books say: it is ようだ for casual speech.

And it explains the conjugation, which otherwise looks arbitrary. みたい inflects as a na-adjective — みたいな人, みたいに — because 様 is a noun and always was.', '見た, the past of 見る, plus the same 様 that gives ようだ. The origin says outright what the grammar books say: it is ようだ for casual speech.

And it explains the conjugation, which otherwise looks arbitrary. みたい inflects as a na-adjective (みたいな人, みたいに), because 様 is a noun and always was.'),
  ('言ってくれればよかったものを — the regret is in what is not said afterwards. Classical ものを was a conjunction of grievance, and the modern use keeps it stranded at the end.

The を is the old adversative one, not the object marker, though they are written alike. It is the same construction as とは: something set up, and then a silence doing the work.', '言ってくれればよかったものを: the regret is in what is not said afterwards. Classical ものを was a conjunction of grievance, and the modern use keeps it stranded at the end.

The を is the old adversative one, not the object marker, though they are written alike. It is the same construction as とは: something set up, and then a silence doing the work.'),
  ('訳 is only its customary spelling — the on-reading やく, "translate", has nothing to do with it. The word is the nominalised 分け, and it shares its root with 分かる: something divided off is something told apart, and what you can tell apart makes sense. 訳が分からない contains the same idea twice.

わけだ says a reason for this exists and has just become apparent, which is why it lands as "no wonder" rather than as a fresh claim.

The whole family is that noun with different endings attached. わけがない denies the reason exists at all; わけではない denies only that this is the reason; わけにはいかない says the reason cannot be made to go anywhere. Learn the noun and the three patterns stop being separate items.', '訳 is only its customary spelling; the on-reading やく, "translate", has nothing to do with it. The word is the nominalised 分け, and it shares its root with 分かる: something divided off is something told apart, and what you can tell apart makes sense. 訳が分からない contains the same idea twice.

わけだ says a reason for this exists and has just become apparent, which is why it lands as "no wonder" rather than as a fresh claim.

The whole family is that noun with different endings attached. わけがない denies the reason exists at all; わけではない denies only that this is the reason; わけにはいかない says the reason cannot be made to go anywhere. Learn the noun and the three patterns stop being separate items.'),
  ('説明させていただきます parses as "I receive your letting me explain". Every piece is literal — させ is the causative, いただく the humble もらう.

That is why it implies permission was granted, and why it grates when nobody granted anything. Used for something entirely your own — 閉店させていただきます — it asks the listener to supply a consent they were never asked for, which is the exact reason the form is criticised in Japanese as much as it is taught.', '説明させていただきます parses as "I receive your letting me explain". Every piece is literal: させ is the causative, いただく the humble もらう.

That is why it implies permission was granted, and why it grates when nobody granted anything. Used for something entirely your own (閉店させていただきます), it asks the listener to supply a consent they were never asked for, which is the exact reason the form is criticised in Japanese as much as it is taught.'),
  ('誰か is literally "who?" left standing — the question mark folded into the word, so it names the answer without knowing it.

That is why the series is so regular once you see it: 何か, どこか, いつか, all one particle on the ordinary interrogatives. And it is why 誰も with a negative sweeps the whole range into "nobody" — while affirmative "anyone" takes 誰でも and "everyone" 誰もが, since bare 誰も no longer stands without a negative.', '誰か is literally "who?" left standing, the question mark folded into the word, so it names the answer without knowing it.

That is why the series is so regular once you see it: 何か, どこか, いつか, all one particle on the ordinary interrogatives. And it is why 誰も with a negative sweeps the whole range into "nobody", while affirmative "anyone" takes 誰でも and "everyone" 誰もが, since bare 誰も no longer stands without a negative.'),
  ('誰か is literally "who?" left standing — the question mark folded into the word, so it names the answer without knowing it.

That is why the series is so regular once you see it: 何か, どこか, いつか, all one particle on the ordinary interrogatives. And it is why 誰も, with も instead, sweeps the other way into "anyone at all" and then, with a negative, "nobody".', '誰か is literally "who?" left standing, the question mark folded into the word, so it names the answer without knowing it.

That is why the series is so regular once you see it: 何か, どこか, いつか, all one particle on the ordinary interrogatives. And it is why 誰も, with も instead, sweeps the other way into "anyone at all" and then, with a negative, "nobody".'),
  ('込める is "to put into, to load" — the verb for charging something with contents.', '込める is "to put into, to load", the verb for charging something with contents.'),
  ('通じる is "to pass through" — the same 通 as the とおり of N3.', '通じる is "to pass through", the same 通 as the とおり of N3.'),
  ('通じる is the Chinese loan 通 made into a verb — a different word from the native とおる.', '通じる is the Chinese loan 通 made into a verb, a different word from the native とおる.'),
  ('連歌 was composed in sequence by several poets, and the 挙句 was the last verse, the one everything before had been building toward. The phrase 挙句の果て still carries that finality.

The modern sense keeps the long build-up and adds a verdict on it. あげく always follows a drawn-out process and always ends badly — 待たされたあげく断られた — which is why it cannot be used for a good outcome however long the wait.', '連歌 was composed in sequence by several poets, and the 挙句 was the last verse, the one everything before had been building toward. The phrase 挙句の果て still carries that finality.

The modern sense keeps the long build-up and adds a verdict on it. あげく always follows a drawn-out process and always ends badly (待たされたあげく断られた), which is why it cannot be used for a good outcome however long the wait.'),
  ('過ぎる is a full verb: 時間が過ぎる, "time passes". Attached to a stem it keeps that meaning exactly — 食べすぎる is "eating passes [the proper point]".

Which explains the tone. すぎる is never neutral praise, because passing the proper point is a complaint in any language. It cannot be used for "very".', '過ぎる is a full verb: 時間が過ぎる, "time passes". Attached to a stem it keeps that meaning exactly: 食べすぎる is "eating passes [the proper point]".

Which explains the tone. すぎる is never neutral praise, because passing the proper point is a complaint in any language. It cannot be used for "very".'),
  ('違いない is literally "there is no discrepancy" — from 違う, to differ.', '違いない is literally "there is no discrepancy", from 違う, to differ.'),
  ('関する is "to relate to" — the same 関 as in にかかわらず.', '関する is "to relate to", the same 関 as in にかかわらず.'),
  ('関わる is an everyday verb — 事件に関わる, to be mixed up in something. にかかわらず says the outcome is not concerned with the thing named.

The ず is the Old Japanese negative, the same one in 知らず and ざるを得ない, and it is why the attachment is to the ない stem rather than to a te-form. 天候にかかわらず: the weather does not come into it.', '関わる is an everyday verb: 事件に関わる, to be mixed up in something. にかかわらず says the outcome is not concerned with the thing named.

The ず is the Old Japanese negative, the same one in 知らず and ざるを得ない, and it is why the attachment is to the ない stem rather than to a te-form. 天候にかかわらず: the weather does not come into it.'),
  ('降るそうだ takes the plain form whole — tense, negation and all — because what is being passed on is somebody else''s statement, and a statement needs all of it.

That single fact separates it from the そうだ of appearance, which takes a bare stem. 降りそうだ and 降るそうだ differ by one syllable and mean entirely different things: one is the sky, the other is the forecast. The attachment point is the whole distinction, and it is more reliable to lean on than the meaning.', '降るそうだ takes the plain form whole (tense, negation and all), because what is being passed on is somebody else''s statement, and a statement needs all of it.

That single fact separates it from the そうだ of appearance, which takes a bare stem. 降りそうだ and 降るそうだ differ by one syllable and mean entirely different things: one is the sky, the other is the forecast. The attachment point is the whole distinction, and it is more reliable to lean on than the meaning.'),
  ('際 is an edge or a verge — the 際 of 国際 and 窓際.', '際 is an edge or a verge, the 際 of 国際 and 窓際.'),
  ('難 is read both かた and にく. がたい is the older, stiffer reading, which is why it keeps to written and emotional contexts.

The division of labour follows the register rather than a rule about meaning: にくい is physical difficulty (読みにくい字), がたい is difficulty in bringing yourself to it (信じがたい, 忘れがたい). And 難い in ありがたい — hard to exist, therefore precious — is where ありがとう comes from.', '難 is read both かた and にく. がたい is the older, stiffer reading, which is why it keeps to written and emotional contexts.

The division of labour follows the register rather than a rule about meaning: にくい is physical difficulty (読みにくい字), がたい is difficulty in bringing yourself to it (信じがたい, 忘れがたい). And 難い in ありがたい (hard to exist, therefore precious) is where ありがとう comes from.'),
  ('難い is the かたい of がたい — the same word voiced — and here it is negated.', '難い is the かたい of がたい (the same word voiced), and here it is negated.'),
  ('難い is the 難 of がたい, in its other reading — and here it is negated.', '難い is the 難 of がたい, in its other reading, and here it is negated.'),
  ('音楽が好きです says the music is likeable-to-me. There is no verb "to like" in the sentence, so there is no object, so を would have nothing to mark.

The same holds for 嫌い, 上手, 下手, ほしい and 分かる — every one of them an adjective or an intransitive verb, every one taking が. Learn the class and the particle stops being a rule about feelings and becomes ordinary grammar.', '音楽が好きです says the music is likeable-to-me. There is no verb "to like" in the sentence, so there is no object, so を would have nothing to mark.

The same holds for 嫌い, 上手, 下手, ほしい and 分かる: every one of them an adjective or an intransitive verb, every one taking が. Learn the class and the particle stops being a rule about feelings and becomes ordinary grammar.'),
  ('願う is "to wish, to pray" — the same 願 as in 願書 and お願い事.', '願う is "to wish, to pray", the same 願 as in 願書 and お願い事.'),
  ('食べたい "I want to eat". Conjugates as an i-adjective: 食べたかった, 食べたくない. Only for your own desire — for a third party use 〜たがる.', '食べたい "I want to eat". Conjugates as an i-adjective: 食べたかった, 食べたくない. Only for your own desire; for a third party use 〜たがる.'),
  ('食べてみてください. Written in kana — the 見 is no longer literal.', '食べてみてください. Written in kana, the 見 is no longer literal.'),
  ('駅の後ろ uses the same character for physical behind. 後で puts the sentence at a point after the thing named — a position noun with the で of circumstance.

It takes the past tense in front for the reason 前に takes the plain form: the verb describes the state of affairs at the moment being pointed at, and by then the act is done.', '駅の後ろ uses the same character for physical behind. 後で puts the sentence at a point after the thing named, a position noun with the で of circumstance.

It takes the past tense in front for the reason 前に takes the plain form: the verb describes the state of affairs at the moment being pointed at, and by then the act is done.');

UPDATE dialogue_replies SET why_wrong = u.new FROM undash u WHERE dialogue_replies.why_wrong = u.old;
UPDATE dialogue_replies SET translation = u.new FROM undash u WHERE dialogue_replies.translation = u.old;
UPDATE etymology_entries SET body = u.new FROM undash u WHERE etymology_entries.body = u.old;
UPDATE etymology_entries SET claim = u.new FROM undash u WHERE etymology_entries.claim = u.old;
UPDATE grammar_points SET meaning_short = u.new FROM undash u WHERE grammar_points.meaning_short = u.old;
UPDATE grammar_points SET nuance = u.new FROM undash u WHERE grammar_points.nuance = u.old;
UPDATE grammar_points SET meaning_long = u.new FROM undash u WHERE grammar_points.meaning_long = u.old;
UPDATE dialogue_turns SET translation = u.new FROM undash u WHERE dialogue_turns.translation = u.old;
UPDATE sentence_translations SET text = u.new FROM undash u WHERE sentence_translations.text = u.old;
UPDATE dialogues SET situation = u.new FROM undash u WHERE dialogues.situation = u.old;
UPDATE grammar_relations SET note = u.new FROM undash u WHERE grammar_relations.note = u.old;
UPDATE reading_lines SET translation = u.new FROM undash u WHERE reading_lines.translation = u.old;
UPDATE grammar_mistakes SET explanation = u.new FROM undash u WHERE grammar_mistakes.explanation = u.old;

DO $$
DECLARE
  r record;
  u record;
BEGIN
  FOR r IN SELECT id, prompt::text AS v FROM exercise_prompts WHERE prompt::text LIKE '%—%' LOOP
    FOR u IN SELECT to_jsonb(old)::text AS o, to_jsonb(new)::text AS n FROM undash WHERE position(to_jsonb(old)::text IN r.v) > 0 LOOP
      r.v := replace(r.v, u.o, u.n);
    END LOOP;
    UPDATE exercise_prompts SET prompt = r.v::jsonb WHERE id = r.id;
  END LOOP;
  FOR r IN SELECT id, answer::text AS v FROM exercise_prompts WHERE answer::text LIKE '%—%' LOOP
    FOR u IN SELECT to_jsonb(old)::text AS o, to_jsonb(new)::text AS n FROM undash WHERE position(to_jsonb(old)::text IN r.v) > 0 LOOP
      r.v := replace(r.v, u.o, u.n);
    END LOOP;
    UPDATE exercise_prompts SET answer = r.v::jsonb WHERE id = r.id;
  END LOOP;
  FOR r IN SELECT id, distractors::text AS v FROM exercise_prompts WHERE distractors::text LIKE '%—%' LOOP
    FOR u IN SELECT to_jsonb(old)::text AS o, to_jsonb(new)::text AS n FROM undash WHERE position(to_jsonb(old)::text IN r.v) > 0 LOOP
      r.v := replace(r.v, u.o, u.n);
    END LOOP;
    UPDATE exercise_prompts SET distractors = r.v::jsonb WHERE id = r.id;
  END LOOP;
  FOR r IN SELECT id, proposed::text AS v FROM content_review_queue WHERE proposed::text LIKE '%—%' LOOP
    FOR u IN SELECT to_jsonb(old)::text AS o, to_jsonb(new)::text AS n FROM undash WHERE position(to_jsonb(old)::text IN r.v) > 0 LOOP
      r.v := replace(r.v, u.o, u.n);
    END LOOP;
    UPDATE content_review_queue SET proposed = r.v::jsonb WHERE id = r.id;
  END LOOP;
  FOR r IN SELECT id, current::text AS v FROM content_review_queue WHERE current::text LIKE '%—%' LOOP
    FOR u IN SELECT to_jsonb(old)::text AS o, to_jsonb(new)::text AS n FROM undash WHERE position(to_jsonb(old)::text IN r.v) > 0 LOOP
      r.v := replace(r.v, u.o, u.n);
    END LOOP;
    UPDATE content_review_queue SET current = r.v::jsonb WHERE id = r.id;
  END LOOP;
  FOR r IN SELECT id, diff::text AS v FROM content_review_queue WHERE diff::text LIKE '%—%' LOOP
    FOR u IN SELECT to_jsonb(old)::text AS o, to_jsonb(new)::text AS n FROM undash WHERE position(to_jsonb(old)::text IN r.v) > 0 LOOP
      r.v := replace(r.v, u.o, u.n);
    END LOOP;
    UPDATE content_review_queue SET diff = r.v::jsonb WHERE id = r.id;
  END LOOP;
END $$;

