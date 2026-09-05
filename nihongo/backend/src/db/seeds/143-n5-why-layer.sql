-- The why-layer for N5: 65 more topics, taking the level from 27 to 92 of 129.
--
-- N5 was the only level with any why-layer at all and it still had the worst
-- coverage of the five once N4 to N1 landed. It is also the level a beginner is
-- actually on, which makes it the one worth finishing.
--
-- The entries that pay for the batch are the ones where a beginner is being
-- asked to memorise something arbitrary that is not:
--
--   五段 and 一段 are descriptions, not labels. 書く runs across か・き・く・け・こ,
--   five steps; 食べる never leaves the え row.
--
--   The four separate で lessons are ONE particle. で is にて worn down, and what
--   it names is the circumstance an action happens in — place, means, material
--   and cause alike. English needs four prepositions; Japanese never split.
--
--   な-adjectives are nouns and な is the copula, which is why they take だ and
--   でした and why 静かの has to be 静かな.
--
--   好き, ほしい, 上手 and 分かる take が because not one of them is a transitive
--   verb. There is no rule about feelings; there is no object to mark.
--
--   こんにちは is 今日は with the rest of the sentence dropped, which is why it is
--   spelled with は and said with わ.
--
--   すみません is 済む negated — this is not settled, something is still owed —
--   which is why one word does apology, attention and thanks.
--
--   とても was negative-only until the Meiji period, and ぜんぜん took positives
--   freely in Sōseki. The rule that forbids 全然大丈夫 is younger than the word.
--
-- Thirty-seven topics have no entry: counters and question words already
-- covered by a sibling entry, forms whose parent carries the explanation
-- (〜ました on ます, 〜でした on です, できます on ことができる), and the ones that are
-- word order and omission rather than anything with a history.
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
  ('ety-n5-verb-classes', 'verb-classes', 'historical-grammar',
   'The names 五段 and 一段 say exactly what the verbs do: move through five vowel rows, or stay on one.',
   '書く runs across か・き・く・け・こ — five steps, 五段. 食べる never leaves the え row: 食べない, 食べます, 食べる, 食べれば. One step, 一段.

So the classification is not a list to memorise but a description of the stem you can watch happening. It also explains why only 五段 verbs have a て-form worth learning rules for: a stem that moves has consonants colliding with the ending, and a stem that stays put does not.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-dictionary-form', 'dictionary-form', 'historical-grammar',
   'The dictionary form does two jobs today because two separate classical forms merged into it.',
   'Classical Japanese had a 終止形 to end a sentence and a 連体形 to stand before a noun, and for most verbs they differed. They collapsed together, and the surviving shape is the one dictionaries list.

That merger is why 食べる can end a sentence and also sit straight in front of a noun — 食べる人 — with nothing added. Japanese needs no relative pronoun because the form was already built to modify.',
   'Heian', 'well-supported'),

  ('ety-n5-ni-direction', 'ni-direction', 'historical-grammar',
   'に marks a point, which is why it means arrival where へ means heading.',
   'へ came from 辺, a vicinity, so it never promised you got there. に has always named a point exactly — a place, an instant, a recipient.

One idea covers every use the textbook lists separately. 三時に is a point in time; 東京に着く is a point in space; 友達に渡す is the point the thing lands on. If the sentence has a target, it is に.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-mo-particle', 'mo-particle', 'historical-grammar',
   'も adds a thing to what is already there, and that one job produces every use.',
   '私も is me in addition. With a negative it becomes "not either", because adding to nothing leaves nothing.

The same particle is doing the work far beyond this lesson. 誰も sweeps a question word into "anyone at all"; 〜ても is "even if"; にもかかわらず is "even that did not come into it". One particle, always adding.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-arimasu-imasu', 'arimasu-imasu', 'historical-grammar',
   'Japanese splits existence by whether a thing moves of itself.',
   'ある is for what does not — objects, buildings, plans. いる is for what does: people and animals. The division is animacy, not size or importance.

It reaches much further than this lesson. ている is built on いる and describes something in progress; てある is built on ある and describes a thing left in a state. The split you learn here is the one those two patterns rest on.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-ka-question', 'ka-question', 'historical-grammar',
   'か marks something as unsettled, and a whole sentence left unsettled is a question.',
   'That is the same か in 誰か. Attach it to "who" and the answer becomes unknown, giving "someone"; attach it to a sentence and the whole thing becomes unknown, giving a question.

So か is not a spoken question mark but a particle of uncertainty. It is why かどうか embeds a question inside a sentence, why かもしれない is uncertain, and why 本か雑誌 means "or".',
   'Old Japanese', 'well-supported'),

  ('ety-n5-te-mo-ii', 'te-mo-ii', 'historical-grammar',
   'It is literally "even doing it, it is good" — て, も, and いい, each doing its usual job.',
   '〜ても is "even if"; いい is the plain adjective. 食べてもいい says that even in the case of eating, things are fine.

Nothing has been idiomatised, which is why the negative works by the ordinary rules: 食べなくてもいい is "even not eating, it is fine" — you do not have to. And 食べてはいけない, the refusal, swaps いい for いけない, "it will not go".',
   'Old Japanese', 'well-supported'),

  ('ety-n5-de-location', 'de-location', 'historical-grammar',
   'で is にて worn down — に plus the て of the te-form.',
   'にて is still written in formal notices. The に named a point and the て linked it onward, and the pair contracted into で.

That single origin explains the four separate で lessons. Place of action, means, material and cause are all one particle naming the circumstance an action is carried out in. 公園で遊ぶ, ペンで書く, 木で作る, 風邪で休む — the English needs four prepositions and the Japanese never split.',
   'Heian', 'well-supported'),

  ('ety-n5-de-means', 'de-means', 'historical-grammar',
   'The で of means is the same で as the で of place — one particle, not two.',
   'Both come from にて. What で names is the circumstance the action is done in, and a tool is a circumstance as much as a place is.

So there is no rule to pick between them and never a need for one. バスで行く does not have to be resolved into place-で or means-で; it is simply the particle saying by what circumstance the going happened.',
   'Heian', 'well-supported'),

  ('ety-n5-de-tool', 'de-tool', 'historical-grammar',
   'Material is the same で again — what a thing was made out of is a circumstance of the making.',
   '木で作る is building in the circumstance of wood. There is no separate material particle in Japanese.

Where で will not go is a change so complete the original is gone: 米から酒を作る takes から, because the rice is a starting point that has been left behind rather than a circumstance the making happened in.',
   'Heian', 'well-supported'),

  ('ety-n5-de-reason', 'de-reason', 'historical-grammar',
   'Cause is で once more: the circumstance something happened under.',
   '病気で休む is resting in the circumstance of illness. Nothing has been added to make it causal.

That is why で takes only a noun and never a clause, and why から and ので exist. で names a circumstance; a reason with a verb in it needs a particle that can take a whole sentence.',
   'Heian', 'well-supported'),

  ('ety-n5-to-with', 'to-with', 'historical-grammar',
   'と pairs two things and asserts they go together — every use follows from that.',
   '本と鉛筆 pairs two nouns exhaustively. 友達と行く pairs you with a companion. 「はい」と言った pairs an utterance with the saying of it.

And 押すと開く pairs pushing with opening, which is where the conditional と comes from at N4. One particle, always joining two things and claiming they belong together — which is why と lists completely while や lists loosely.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-ya-particle', 'ya-particle', 'historical-grammar',
   'や lists loosely because it never claimed to be finished.',
   'Where と pairs exhaustively, や names examples and leaves the rest unsaid. 本や雑誌 is books, magazines, and whatever else.

The openness is why や attracts など at the end, and why it grows into やら at N2 — a doubly vague list for a mess nobody is counting. Choosing between と and や is choosing whether the list is complete.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-ga-but', 'ga-but', 'historical-grammar',
   'The が that means "but" is the same が taught as the subject marker.',
   'が began as a genitive "of", became a subject marker, and also came to join clauses. All three are alive: 我が国 is the oldest, 雨が降る the commonest, 高いが買う this one.

The contrast in it is faint precisely because が does not mean "but". It joins two clauses and lets the mismatch speak, which is why が is so much milder than のに, where the grammar names one clause as a target the other failed.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-i-adjective', 'i-adjective', 'historical-grammar',
   'い-adjectives conjugate because they are verbs of a kind — they carry their own tense.',
   '寒かった needs no copula. The adjective inflects for past by itself, which is something English adjectives cannot do and Japanese ones have always done.

That is why です after an い-adjective adds politeness and nothing else: 寒いです is not the copula doing grammatical work, and 寒いでした is wrong, because the tense already lives in the adjective. Compare な-adjectives, which cannot inflect and need だ to do it for them.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-na-adjective', 'na-adjective', 'historical-grammar',
   'な-adjectives are nouns, and the な is the copula.',
   'Classical Japanese had なる as an attributive copula — に plus あり — and 静かなる夜 was "a night that is quiet". な is what is left of it.

Everything odd about the class follows. They take だ and でした because nouns do; they take な before a noun because that is the copula''s modifying form; and 静かの has to be 静かな for the same reason. The grammar is not a second kind of adjective but a noun with a copula attached.',
   'Heian', 'well-supported'),

  ('ety-n5-masen-ka', 'masen-ka', 'historical-grammar',
   'The invitation is a negative question, and it is polite for the same reason English "won''t you" is.',
   '一緒に行きませんか literally asks whether you will not go. Framing it negatively leaves the refusal already on the table, so declining costs nothing.

That is why ませんか is softer than ましょう, which proposes and assumes. Japanese and English arrived at the same politeness trick independently, and it is the clearest case of the two languages agreeing about how to be tactful.',
   'Edo', 'attested'),

  ('ety-n5-mae-ni', 'mae-ni', 'historical-grammar',
   '前 and 後 take different tenses, and the reason is what the noun means.',
   '寝る前に uses the dictionary form because the sleeping has not happened yet at the point being named. 寝た後で uses the past because it has.

The tense is not agreeing with the main clause; it is describing the state of affairs at the moment 前 or 後 picks out. Both are ordinary nouns of position — the same 前 as 駅の前 — and they behave as position nouns should.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-toki', 'toki', 'word-origin',
   'とき is 時, an ordinary noun — which is why a whole clause can sit in front of it.',
   '子供のとき and 東京に行くとき are the same construction as 赤い本: something describing a noun, with nothing added to join them.

So the tense inside the clause is doing real work. 行くとき is on the way there, 行ったとき is after arriving — because the verb describes the state of the 時 rather than the state of the main sentence.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-naru', 'naru', 'word-origin',
   'なる is the verb of a thing coming to be, and it takes に because に marks a point arrived at.',
   '医者になる arrives at the point "doctor". The particle is the same one in 東京に着く.

With an adjective the point is expressed adverbially instead: 大きくなる, 静かになる, using く and に, the two adverb endings. And なる pairs with する throughout the language — ことになる against ことにする, ようになる against ようにする — as what happens against what you bring about.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-suki', 'suki', 'historical-grammar',
   '好き is not a verb. It is a な-adjective, and that is why the thing liked takes が.',
   '音楽が好きです says the music is likeable-to-me. There is no verb "to like" in the sentence, so there is no object, so を would have nothing to mark.

The same holds for 嫌い, 上手, 下手, ほしい and 分かる — every one of them an adjective or an intransitive verb, every one taking が. Learn the class and the particle stops being a rule about feelings and becomes ordinary grammar.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-te-kara', 'te-kara', 'historical-grammar',
   'てから is the te-form with から, "from" — starting from the point the first act ends.',
   'から marks a starting point, in space, time or reason. Put it after a te-form and the completed action becomes the point everything after starts from.

That is the difference from a bare te-form chain. 食べて出かけた merely lists two acts in order; 食べてから出かけた insists the first was finished before the second began.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-adverb-ku', 'adverb-ku', 'historical-grammar',
   'く and に are not adverb endings bolted on — they are the 連用形 of the two adjective classes.',
   'Classical adjectives had a form used before verbs, and for い-adjectives it was く. For な-adjectives, which are nouns with a copula, it is に — the copula''s own connecting form.

So 早く and 静かに are the same grammatical thing produced by two different classes, and it is the same く and に you already meet in 早くない, 大きくなる and 静かになる. One form, several jobs.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-ne-particle', 'ne-particle', 'historical-grammar',
   'ね turns a statement toward the listener and asks them to come with you.',
   'It seeks agreement about something you assume is shared. That is why 今日は暑いですね is natural to someone standing in the same heat and odd to someone on the telephone in another country.

Set against よ the pair is a map of who knows what: ね assumes the listener already agrees, よ assumes they do not yet know. Getting them backwards is the commonest way a grammatically perfect Japanese sentence still lands wrong.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-yo-particle', 'yo-particle', 'historical-grammar',
   'よ hands the listener something they did not have.',
   'It marks the sentence as new information being given, which is why it can sound helpful — 落ちましたよ — and equally why it can sound like being told off.

The risk is telling somebody what they already know. 会議は三時ですよ to the person who scheduled it is grammatical and rude, because よ has claimed they needed telling.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-no-explanatory', 'no-explanatory', 'historical-grammar',
   'んです is the nominaliser の with です — "it is the case that".',
   'の turns the clause into a noun and です asserts it. 遅れたんです is literally "it is a fact of my being late", offering the whole situation rather than the bare event.

That is why んです explains. It presents the sentence as an account of circumstances already in the air, which is also why using it for plain new information sounds like answering a question nobody asked.',
   'Edo', 'well-supported'),

  ('ety-n5-made-time', 'made-time', 'historical-grammar',
   'まで marks a limit, and everything reaches up to it without passing.',
   '五時まで is up to five and not beyond; 駅まで is as far as the station. One particle, distance or duration alike.

Adding に changes it entirely: 五時までに is a deadline, because に names a single point and まで the span before it. That one syllable is the whole difference between working until five and finishing by five.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-gurai', 'gurai', 'word-origin',
   'ぐらい is 位, a rank on a scale — which is why it is vaguer than a number.',
   'The 位 of 一位 and 位置. Naming a grade rather than a figure is what makes 三時間ぐらい approximate.

It is the same word that grows into the belittling くらい at N3 — 掃除くらいしなさい, ranking the chore that low. And it differs from ごろ, which is 頃, a point in time: ぐらい measures a quantity, ごろ locates a moment.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-goro', 'goro', 'word-origin',
   'ごろ is 頃, a noun meaning a time or a season — a point, not a quantity.',
   '若い頃 is one''s youth; 三時ごろ is around three. What ごろ makes vague is where a moment falls.

That is exactly why the two cannot be swapped. 三時ごろ is around three o''clock, a point; 三時間ぐらい is about three hours, an amount. Ask whether the number is a place on the clock or a length, and the particle chooses itself.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-nado', 'nado', 'word-origin',
   'など is 等 — the same 等 as in 等しい, "equal", and in 平等.',
   'It names things of that sort, so the list is samples rather than a total. It naturally follows や, which lists loosely for the same reason.

Worn down it becomes なんか at N3, where the vagueness has curdled into dismissal. など itself stays neutral, but the family resemblance is why it can sound slighting in the wrong sentence.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-toka', 'toka', 'historical-grammar',
   'とか is と with か — the exhaustive lister made uncertain.',
   'と lists completely; か marks something unsettled. Together they list without committing, which is why とか is the casual spoken cousin of や.

The modern habit of ending a sentence on a dangling とか is the same uncertainty applied to the whole utterance — a way of leaving what you said slightly unsettled, which is precisely what the particle has always done.',
   'Edo', 'attested'),

  ('ety-n5-doushite', 'doushite', 'historical-grammar',
   'どうして is "doing how" — どう plus the te-form of する.',
   'It asks by what means something came about, and asking that is asking why. なぜ is the plainer Sino-Japanese equivalent with no such construction inside it.

The literal reading also survives: どうして生きていくのか can genuinely mean "how", not "why". And it is why どうして carries more feeling than なぜ, which merely asks.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-counter-tsu', 'counter-tsu', 'historical-grammar',
   'The つ counter is what is left of the native Japanese number system.',
   'ひとつ, ふたつ, みっつ — one, two, three in the words Japanese used before it borrowed いち, に, さん from Chinese. The native series survives only up to nine, and ten is とお.

That is why つ is the counter you fall back on when no other fits: it is older than the borrowed system that produced the specialised counters. ひとり and ふたり are the same native numbers, which is why they break the pattern that 三人 follows.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-counter-nin', 'counter-nin', 'historical-grammar',
   'ひとり and ふたり are irregular because they are older than the counter they attach to.',
   '三人 is さんにん, borrowed Chinese number plus borrowed reading, entirely regular. 一人 and 二人 are ひと and ふた — the native numbers behind ひとつ and ふたつ — with a native ending.

So the exception is not an exception but a survival: the two commonest counts kept the old words while everything above three went over to the borrowed system. The same pattern shows in 一日 and 二日 against 三日.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-counter-hon', 'counter-hon', 'word-origin',
   '本 means "origin, base" — and long thin things are counted by it because a tree trunk is one.',
   'The 本 of 日本 and 本当 is a root or a foundation, not a book. A trunk is the base a tree grows from, and the counter spread from trunks to everything long and slender.

Which is why it now counts pens, bottles, umbrellas and roads, and then stretches to telephone calls, films and home runs — things with length in time rather than space. The sound changes are worth learning as a set: いっぽん, さんぼん, ろっぽん.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-counter-mai', 'counter-mai', 'word-origin',
   '枚 counted thin flat things before it counted paper.',
   'The character''s木 gives it away: it was used for thin pieces split from wood. Paper, plates, shirts and tickets are all the same flat shape.

Unlike 本 and 匹 it takes no sound changes at all — いちまい through じゅうまい, every one regular — which makes it the easiest counter in the language and the one worth learning first.',
   'Old Japanese', 'attested'),

  ('ety-n5-counter-ji-fun', 'counter-ji-fun', 'historical-grammar',
   '時 and 分 change their sound with the number in front, and the number changes back.',
   '一分 is いっぷん, 二分 is にふん, 三分 is さんぷん — three consonants across three consecutive numbers. 時 is steadier but still gives よじ and くじ rather than しじ and きゅうじ.

These are ordinary sound changes at a boundary, the same ones that give いっぽん and さんぼん. They are not learnable by rule in any form shorter than the list, which is why the list is what to learn.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-counter-sai', 'counter-sai', 'word-origin',
   '二十歳 is はたち, a word with no 二十 and no 歳 audible in it at all.',
   'はた is an old native word for twenty and ち is a native counter suffix. The kanji were fitted to the word afterwards, which is why nothing in the reading matches the characters.

It survives because coming of age at twenty mattered enough to keep its own word. 才 is commonly written for 歳 because it is simpler and sounds the same; the meaning "years old" belongs to 歳 alone.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-totemo', 'totemo', 'historical-grammar',
   'とても meant "no matter how" and was used ONLY with negatives until about a century ago.',
   'It is とて plus も — even saying that. とても行けない, "there is no way I can go", is the original construction and is still perfectly current.

The positive とても寒い is a Meiji-era innovation that was criticised as slang when it appeared. The negative use has not gone anywhere, which is why とても〜ない reads as idiomatic rather than as a contradiction.',
   'Meiji', 'well-supported'),

  ('ety-n5-zenzen', 'zenzen', 'historical-grammar',
   'ぜんぜん was used with positives long before it was restricted to negatives.',
   '全然 means "wholly, entirely", and in Meiji writing — Sōseki among others — it modifies positives freely. The rule tying it to negatives is younger than the word.

So 全然大丈夫, which is corrected as sloppy, is closer to the original than the rule that forbids it. Worth knowing because it will be corrected anyway: the prescription is real even though the history is not on its side.',
   'Meiji', 'well-supported'),

  ('ety-n5-te-wa-ikemasen', 'te-wa-ikemasen', 'word-origin',
   'いけません is 行く — it will not go, so it will not do.',
   'The potential negative of 行く, used exactly as English uses "that won''t do". 食べてはいけません says that eating, as a proposition, does not go anywhere.

It is the same 行く behind なくてはいけない and the casual いけない. And it pairs with てもいい, its opposite: one says it is good, the other that it will not go.',
   'Edo', 'well-supported'),

  ('ety-n5-hoshii', 'hoshii', 'historical-grammar',
   'ほしい is an adjective, not a verb — which is why what you want takes が.',
   '水がほしい says the water is wanted, with no verb of wanting in the sentence at all. There is no object, so を has nothing to do.

And because adjectives describe what the speaker can feel, ほしい cannot be used flatly about another person: 彼は水がほしい is wrong, and ほしがっている is the repair. The same restriction governs たい and 寒い.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-ni-frequency', 'ni-frequency', 'historical-grammar',
   'The に of 週に三回 is the same に that marks a point — it names the frame the count sits in.',
   '週に三回 sets "week" as the unit and puts three occurrences inside it. に is doing what it always does: naming the place something lands.

So there is no separate "per" particle to learn. It is the same に as 三時に and 東京に, and the English "per" is what has no counterpart, not the Japanese.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-ichiban', 'ichiban', 'word-origin',
   '一番 is "number one" — a plain ordinal doing the work of a superlative.',
   '番 is a turn or a position in a sequence, the 番 of 番号 and 交番. 一番 is simply first place.

Japanese has no superlative inflection, so it names a rank instead — exactly as it has no comparative and uses ほうが, "the side", instead. The で in クラスで一番 marks the field the ranking is taken within.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-no-pronoun', 'no-pronoun', 'historical-grammar',
   'The の that stands for a noun is the nominaliser, doing its ordinary job.',
   '赤いのをください is "give me the red one", where の is the thing itself. It is the same の that turns clauses into nouns in んです and ので.

Which is why it cannot be used where こと would be needed, and why 私の alone means "mine". One particle: it makes whatever precedes it into a noun, and sometimes that noun is all you needed.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-modifying-clause', 'modifying-clause', 'historical-grammar',
   'Japanese needs no relative pronoun because the verb form was already built to modify nouns.',
   'The 連体形 was the classical form for standing before a noun, and when it merged with the sentence-ending form the modifying ability came along. 昨日買った本 is "yesterday-bought book" with no "that" or "which" anywhere.

That is also why the clause comes before the noun rather than after it, and why が rather than は marks the subject inside it: は belongs to the sentence as a whole, and a modifying clause is not one.',
   'Heian', 'well-supported'),

  ('ety-n5-te-negative', 'te-negative', 'historical-grammar',
   'ないで and なくて are both negatives, and the で and て are what separate them.',
   'ないで is the negative with the で of manner — 傘を持たないで出かけた, going out in the circumstance of not having one. なくて is the adjective negative ない in its て-form, which links a cause: 分からなくて困った.

So ないで attaches to how something was done and なくて to why. The pieces are both ordinary, and the distinction that looks arbitrary is the same で and て doing what they do everywhere else.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-nakute', 'nakute', 'historical-grammar',
   'なくて is ない treated as the adjective it is, in the て-form.',
   'ない inflects like an い-adjective — 寒い gives 寒くて, ない gives なくて. There is nothing special about the negative here beyond its class.

That is why なくて links reasons the way 寒くて does: an adjective in て-form gives grounds for what follows. And it is why the obligation forms build on it — なくてはいけない, なくてもいい — since every one of them needs that adjective link.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-te-adjective', 'te-adjective', 'historical-grammar',
   'くて and で are the two adjective classes linking, each with its own class''s form.',
   '安くて美味しい uses く, the い-adjective connecting form. 静かできれい uses で, because な-adjectives are nouns and で is what the copula does when it links onward.

So there is one rule, not two: each class connects with the form it has always used. It is the same く as 早く走る and the same で as 学生で、二十歳です.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-ga-desire', 'ga-desire', 'historical-grammar',
   'が marks what the feeling is ABOUT because none of these words is a transitive verb.',
   '好き, 嫌い, 上手, 下手 and ほしい are adjectives; 分かる, できる and いる are intransitive verbs. Not one of them can take an object, so not one of them can take を.

What が marks is simply the subject: in 日本語が分かる, the Japanese is the thing that is understood. Read that way the "rule about feelings" disappears and leaves ordinary grammar behind.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-wakaru', 'wakaru', 'word-origin',
   '分かる is 分ける, "to divide" — understanding is telling things apart.',
   'The same 分 as 分ける and 部分. To understand something is to have it separated out from what it is not, which is why the verb is intransitive: the thing does the separating, in your mind.

And that is why it takes が rather than を. 日本語が分かる is "Japanese comes apart for me" — there is no object to mark, and 日本語を分かる is wrong for a structural reason rather than a stylistic one.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-nasai', 'nasai', 'word-origin',
   'なさい is the imperative of なさる, the honorific "to do".',
   'なさる is the respectful form of する, and its imperative is なさい. So the form is polite in origin, which is why it lands as firm rather than rude.

It is also why it belongs to parents and teachers: an honorific imperative is what someone entitled to give the order uses. The casual 〜な in 食べな is this word worn down, and it is a different word from the 〜な that forbids.',
   'Edo', 'well-supported'),

  ('ety-n5-greetings', 'greetings', 'historical-grammar',
   'こんにちは and こんばんは are sentences that were never finished.',
   'They are 今日は and 今晩は — "as for today", "as for this evening" — with the rest dropped. The full form ran on to ask after the person''s day.

That is why they are spelled with は and said with わ: it is the topic particle, frozen mid-sentence. おはよう is the same kind of fragment, from お早く, "it is early of you", which is why the polite ございます can still be added.',
   'Edo', 'well-supported'),

  ('ety-n5-itadakimasu', 'itadakimasu', 'word-origin',
   'いただく is 頂く — 頂 is the crown of the head, and the word means to raise something above it.',
   'Receiving a gift by lifting it above your own head is the gesture the word records. It is the humble counterpart of もらう for that reason: you are placed beneath what you receive.

So いただきます before a meal is not "thank you" but an acknowledgement of receiving. And the 〜ていただく of business Japanese is the same verb doing the same lowering, which is why it is the politest of the giving-and-receiving forms.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-sumimasen', 'sumimasen', 'word-origin',
   'すみません is 済む negated — "this is not settled".',
   '済む means to be finished or squared away. すみません says the matter is not concluded: something remains owed.

Which is why one word covers apology, attention-getting and thanks. All three are the same admission that a debt is outstanding, and it explains why すみません can be a warmer thank-you than ありがとう — it acknowledges the trouble rather than only the result. The formal 済みません is the same word spelled out.',
   'Edo', 'well-supported'),

  ('ety-n5-onegaishimasu', 'onegaishimasu', 'word-origin',
   '願う is "to wish, to pray" — the same 願 as in 願書 and お願い事.',
   'お願いします is the humble お〜する form of that verb: I respectfully do the wishing. The construction is the one taught at N4.

So it is not a fixed phrase but ordinary grammar, which is why it scales — お願いいたします is humbler still, and よろしくお願いします adds "favourably" to the wish. The 願 is doing real work every time.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-douzo-doumo', 'douzo-doumo', 'historical-grammar',
   'どうも is "in any way at all", and like the greetings it is a sentence left unfinished.',
   'どうも ありがとう is "thank you in every way"; どうも すみません the same with the apology. Alone, どうも leaves the rest to be guessed, which is why it works as hello, thanks and sorry at once.

The negative use is the older one and still current: どうも分からない, cannot make it out by any means. It is the same construction as どうにも at N1.',
   'Edo', 'well-supported'),

  ('ety-n5-nani-mo', 'nani-mo', 'historical-grammar',
   '何も is the question word swept up by も, and the negative is what turns it into "nothing".',
   'も adds everything in, so 何も takes all the possible whats at once. Follow it with a negative and every one of them is ruled out.

That is a standard move rather than a set of vocabulary: 誰も, どこも, いつも are the same sweep. And with か instead — 何か, 誰か — the question is left open rather than swept, giving "something" and "someone".',
   'Old Japanese', 'well-supported'),

  ('ety-n5-ni-purpose', 'ni-purpose', 'historical-grammar',
   'The に of 買いに行く marks the purpose as a point aimed at, exactly as it marks a destination.',
   '東京に行く goes to a place; 買いに行く goes to an act. In both, に names the target of the going.

Which is why the verb has to be a stem rather than a dictionary form: に takes a noun-like thing, and the ます stem is the closest a verb comes to being one. It is the same reason 買い物に行く works with a plain noun.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-toki-doki-place', 'toki-doki-place', 'word-origin',
   '上, 下, 中, 前 and 後ろ are nouns, not prepositions — which is why they take の.',
   '机の上 is literally "the table''s top". Japanese has no prepositions at all; it names a part of the thing and possesses it.

So 上に is a noun with に, exactly like 東京に, and the whole system works by ordinary grammar. It is also why the position word comes after the thing it belongs to, which is the reverse of English and consistent with everything else in the language.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-to-quotation', 'to-quotation', 'historical-grammar',
   'The quotative と is the same と that pairs two things.',
   'It pairs the words with the saying of them: 「はい」と言った. Nothing marks the quotation as speech; と simply joins the content to the verb.

That is why と works for thought as readily as speech — と思う, と考える — and why it needs the plain form in front. What is being paired is the thought itself, and politeness belongs to the sentence around it, not inside the quotation.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-ka-or', 'ka-or', 'historical-grammar',
   'The か that means "or" is the question particle marking each option as unsettled.',
   '本か雑誌 leaves both open rather than choosing. It is the same か that turns 誰 into 誰か and a statement into a question.

So Japanese does not have a word for "or" so much as a way of marking alternatives as undecided — which is why か can attach to each item and why かどうか embeds a whole undecided question.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-ga-in-clause', 'ga-in-clause', 'historical-grammar',
   'が marks the subject inside a modifying clause because は cannot go there.',
   'は marks the topic of a whole sentence, and a clause describing a noun is not a whole sentence. So 私が買った本 uses が, and 私は buys nothing inside a clause.

The older genitive が is still visible in the alternative 私の買った本, which is equally correct and slightly more formal — the same が-and-の overlap preserved in 我が国.',
   'Heian', 'well-supported'),

  ('ety-n5-ta-koto-ga-aru', 'ta-koto-ga-aru', 'historical-grammar',
   'It says an instance exists: こと makes the act a thing, and ある says there is one.',
   '行ったことがある is "there exists a having-gone". The past tense is inside the noun, not on ある.

That is why the present-tense version means something entirely different. 行くことがある has an instance of going that is not past, so it means "there are times when" — the same construction with the tense moved, and the difference is not idiomatic but grammatical.',
   'Old Japanese', 'well-supported'),

  ('ety-n5-shika-nai', 'shika-nai', 'historical-grammar',
   'しか requires a negative because it excludes everything and then needs the exclusion stated.',
   '千円しかない is "apart from a thousand yen, there is not". しか sets the thing aside and the negative rules out the rest.

So the negative is not a rule to remember but the other half of the sentence. That is also why しか carries a shortfall where だけ does not: だけ merely limits, while しか has actively denied everything else.',
   'Old Japanese', 'well-supported')
) AS v(id, slug, aspect, claim, body, period, confidence)
JOIN grammar_points g ON g.slug = v.slug AND g.language_id = 'lang-ja'
ON CONFLICT (id) DO NOTHING;

-- One review-queue row per entry, so they surface where the others did.
INSERT INTO content_review_queue
  (id, language_id, target_table, target_id, change_type, proposed, origin, priority, status)
SELECT v.id, 'lang-ja', 'etymology_entries', v.target, 'create', v.proposed::jsonb, 'claude', 10, 'pending'
FROM (VALUES
  ('rq-ety-n5-verb-classes', 'ety-n5-verb-classes', '{"claim": "The names 五段 and 一段 say exactly what the verbs do: move through five vowel rows, or stay on one.", "body": "書く runs across か・き・く・け・こ — five steps, 五段. 食べる never leaves the え row: 食べない, 食べます, 食べる, 食べれば. One step, 一段.\n\nSo the classification is not a list to memorise but a description of the stem you can watch happening. It also explains why only 五段 verbs have a て-form worth learning rules for: a stem that moves has consonants colliding with the ending, and a stem that stays put does not.", "confidence": "well-supported"}'),
  ('rq-ety-n5-dictionary-form', 'ety-n5-dictionary-form', '{"claim": "The dictionary form does two jobs today because two separate classical forms merged into it.", "body": "Classical Japanese had a 終止形 to end a sentence and a 連体形 to stand before a noun, and for most verbs they differed. They collapsed together, and the surviving shape is the one dictionaries list.\n\nThat merger is why 食べる can end a sentence and also sit straight in front of a noun — 食べる人 — with nothing added. Japanese needs no relative pronoun because the form was already built to modify.", "confidence": "well-supported"}'),
  ('rq-ety-n5-ni-direction', 'ety-n5-ni-direction', '{"claim": "に marks a point, which is why it means arrival where へ means heading.", "body": "へ came from 辺, a vicinity, so it never promised you got there. に has always named a point exactly — a place, an instant, a recipient.\n\nOne idea covers every use the textbook lists separately. 三時に is a point in time; 東京に着く is a point in space; 友達に渡す is the point the thing lands on. If the sentence has a target, it is に.", "confidence": "well-supported"}'),
  ('rq-ety-n5-mo-particle', 'ety-n5-mo-particle', '{"claim": "も adds a thing to what is already there, and that one job produces every use.", "body": "私も is me in addition. With a negative it becomes \"not either\", because adding to nothing leaves nothing.\n\nThe same particle is doing the work far beyond this lesson. 誰も sweeps a question word into \"anyone at all\"; 〜ても is \"even if\"; にもかかわらず is \"even that did not come into it\". One particle, always adding.", "confidence": "well-supported"}'),
  ('rq-ety-n5-arimasu-imasu', 'ety-n5-arimasu-imasu', '{"claim": "Japanese splits existence by whether a thing moves of itself.", "body": "ある is for what does not — objects, buildings, plans. いる is for what does: people and animals. The division is animacy, not size or importance.\n\nIt reaches much further than this lesson. ている is built on いる and describes something in progress; てある is built on ある and describes a thing left in a state. The split you learn here is the one those two patterns rest on.", "confidence": "well-supported"}'),
  ('rq-ety-n5-ka-question', 'ety-n5-ka-question', '{"claim": "か marks something as unsettled, and a whole sentence left unsettled is a question.", "body": "That is the same か in 誰か. Attach it to \"who\" and the answer becomes unknown, giving \"someone\"; attach it to a sentence and the whole thing becomes unknown, giving a question.\n\nSo か is not a spoken question mark but a particle of uncertainty. It is why かどうか embeds a question inside a sentence, why かもしれない is uncertain, and why 本か雑誌 means \"or\".", "confidence": "well-supported"}'),
  ('rq-ety-n5-te-mo-ii', 'ety-n5-te-mo-ii', '{"claim": "It is literally \"even doing it, it is good\" — て, も, and いい, each doing its usual job.", "body": "〜ても is \"even if\"; いい is the plain adjective. 食べてもいい says that even in the case of eating, things are fine.\n\nNothing has been idiomatised, which is why the negative works by the ordinary rules: 食べなくてもいい is \"even not eating, it is fine\" — you do not have to. And 食べてはいけない, the refusal, swaps いい for いけない, \"it will not go\".", "confidence": "well-supported"}'),
  ('rq-ety-n5-de-location', 'ety-n5-de-location', '{"claim": "で is にて worn down — に plus the て of the te-form.", "body": "にて is still written in formal notices. The に named a point and the て linked it onward, and the pair contracted into で.\n\nThat single origin explains the four separate で lessons. Place of action, means, material and cause are all one particle naming the circumstance an action is carried out in. 公園で遊ぶ, ペンで書く, 木で作る, 風邪で休む — the English needs four prepositions and the Japanese never split.", "confidence": "well-supported"}'),
  ('rq-ety-n5-de-means', 'ety-n5-de-means', '{"claim": "The で of means is the same で as the で of place — one particle, not two.", "body": "Both come from にて. What で names is the circumstance the action is done in, and a tool is a circumstance as much as a place is.\n\nSo there is no rule to pick between them and never a need for one. バスで行く does not have to be resolved into place-で or means-で; it is simply the particle saying by what circumstance the going happened.", "confidence": "well-supported"}'),
  ('rq-ety-n5-de-tool', 'ety-n5-de-tool', '{"claim": "Material is the same で again — what a thing was made out of is a circumstance of the making.", "body": "木で作る is building in the circumstance of wood. There is no separate material particle in Japanese.\n\nWhere で will not go is a change so complete the original is gone: 米から酒を作る takes から, because the rice is a starting point that has been left behind rather than a circumstance the making happened in.", "confidence": "well-supported"}'),
  ('rq-ety-n5-de-reason', 'ety-n5-de-reason', '{"claim": "Cause is で once more: the circumstance something happened under.", "body": "病気で休む is resting in the circumstance of illness. Nothing has been added to make it causal.\n\nThat is why で takes only a noun and never a clause, and why から and ので exist. で names a circumstance; a reason with a verb in it needs a particle that can take a whole sentence.", "confidence": "well-supported"}'),
  ('rq-ety-n5-to-with', 'ety-n5-to-with', '{"claim": "と pairs two things and asserts they go together — every use follows from that.", "body": "本と鉛筆 pairs two nouns exhaustively. 友達と行く pairs you with a companion. 「はい」と言った pairs an utterance with the saying of it.\n\nAnd 押すと開く pairs pushing with opening, which is where the conditional と comes from at N4. One particle, always joining two things and claiming they belong together — which is why と lists completely while や lists loosely.", "confidence": "well-supported"}'),
  ('rq-ety-n5-ya-particle', 'ety-n5-ya-particle', '{"claim": "や lists loosely because it never claimed to be finished.", "body": "Where と pairs exhaustively, や names examples and leaves the rest unsaid. 本や雑誌 is books, magazines, and whatever else.\n\nThe openness is why や attracts など at the end, and why it grows into やら at N2 — a doubly vague list for a mess nobody is counting. Choosing between と and や is choosing whether the list is complete.", "confidence": "well-supported"}'),
  ('rq-ety-n5-ga-but', 'ety-n5-ga-but', '{"claim": "The が that means \"but\" is the same が taught as the subject marker.", "body": "が began as a genitive \"of\", became a subject marker, and also came to join clauses. All three are alive: 我が国 is the oldest, 雨が降る the commonest, 高いが買う this one.\n\nThe contrast in it is faint precisely because が does not mean \"but\". It joins two clauses and lets the mismatch speak, which is why が is so much milder than のに, where the grammar names one clause as a target the other failed.", "confidence": "well-supported"}'),
  ('rq-ety-n5-i-adjective', 'ety-n5-i-adjective', '{"claim": "い-adjectives conjugate because they are verbs of a kind — they carry their own tense.", "body": "寒かった needs no copula. The adjective inflects for past by itself, which is something English adjectives cannot do and Japanese ones have always done.\n\nThat is why です after an い-adjective adds politeness and nothing else: 寒いです is not the copula doing grammatical work, and 寒いでした is wrong, because the tense already lives in the adjective. Compare な-adjectives, which cannot inflect and need だ to do it for them.", "confidence": "well-supported"}'),
  ('rq-ety-n5-na-adjective', 'ety-n5-na-adjective', '{"claim": "な-adjectives are nouns, and the な is the copula.", "body": "Classical Japanese had なる as an attributive copula — に plus あり — and 静かなる夜 was \"a night that is quiet\". な is what is left of it.\n\nEverything odd about the class follows. They take だ and でした because nouns do; they take な before a noun because that is the copula''s modifying form; and 静かの has to be 静かな for the same reason. The grammar is not a second kind of adjective but a noun with a copula attached.", "confidence": "well-supported"}'),
  ('rq-ety-n5-masen-ka', 'ety-n5-masen-ka', '{"claim": "The invitation is a negative question, and it is polite for the same reason English \"won''t you\" is.", "body": "一緒に行きませんか literally asks whether you will not go. Framing it negatively leaves the refusal already on the table, so declining costs nothing.\n\nThat is why ませんか is softer than ましょう, which proposes and assumes. Japanese and English arrived at the same politeness trick independently, and it is the clearest case of the two languages agreeing about how to be tactful.", "confidence": "attested"}'),
  ('rq-ety-n5-mae-ni', 'ety-n5-mae-ni', '{"claim": "前 and 後 take different tenses, and the reason is what the noun means.", "body": "寝る前に uses the dictionary form because the sleeping has not happened yet at the point being named. 寝た後で uses the past because it has.\n\nThe tense is not agreeing with the main clause; it is describing the state of affairs at the moment 前 or 後 picks out. Both are ordinary nouns of position — the same 前 as 駅の前 — and they behave as position nouns should.", "confidence": "well-supported"}'),
  ('rq-ety-n5-toki', 'ety-n5-toki', '{"claim": "とき is 時, an ordinary noun — which is why a whole clause can sit in front of it.", "body": "子供のとき and 東京に行くとき are the same construction as 赤い本: something describing a noun, with nothing added to join them.\n\nSo the tense inside the clause is doing real work. 行くとき is on the way there, 行ったとき is after arriving — because the verb describes the state of the 時 rather than the state of the main sentence.", "confidence": "well-supported"}'),
  ('rq-ety-n5-naru', 'ety-n5-naru', '{"claim": "なる is the verb of a thing coming to be, and it takes に because に marks a point arrived at.", "body": "医者になる arrives at the point \"doctor\". The particle is the same one in 東京に着く.\n\nWith an adjective the point is expressed adverbially instead: 大きくなる, 静かになる, using く and に, the two adverb endings. And なる pairs with する throughout the language — ことになる against ことにする, ようになる against ようにする — as what happens against what you bring about.", "confidence": "well-supported"}'),
  ('rq-ety-n5-suki', 'ety-n5-suki', '{"claim": "好き is not a verb. It is a な-adjective, and that is why the thing liked takes が.", "body": "音楽が好きです says the music is likeable-to-me. There is no verb \"to like\" in the sentence, so there is no object, so を would have nothing to mark.\n\nThe same holds for 嫌い, 上手, 下手, ほしい and 分かる — every one of them an adjective or an intransitive verb, every one taking が. Learn the class and the particle stops being a rule about feelings and becomes ordinary grammar.", "confidence": "well-supported"}'),
  ('rq-ety-n5-te-kara', 'ety-n5-te-kara', '{"claim": "てから is the te-form with から, \"from\" — starting from the point the first act ends.", "body": "から marks a starting point, in space, time or reason. Put it after a te-form and the completed action becomes the point everything after starts from.\n\nThat is the difference from a bare te-form chain. 食べて出かけた merely lists two acts in order; 食べてから出かけた insists the first was finished before the second began.", "confidence": "well-supported"}'),
  ('rq-ety-n5-adverb-ku', 'ety-n5-adverb-ku', '{"claim": "く and に are not adverb endings bolted on — they are the 連用形 of the two adjective classes.", "body": "Classical adjectives had a form used before verbs, and for い-adjectives it was く. For な-adjectives, which are nouns with a copula, it is に — the copula''s own connecting form.\n\nSo 早く and 静かに are the same grammatical thing produced by two different classes, and it is the same く and に you already meet in 早くない, 大きくなる and 静かになる. One form, several jobs.", "confidence": "well-supported"}'),
  ('rq-ety-n5-ne-particle', 'ety-n5-ne-particle', '{"claim": "ね turns a statement toward the listener and asks them to come with you.", "body": "It seeks agreement about something you assume is shared. That is why 今日は暑いですね is natural to someone standing in the same heat and odd to someone on the telephone in another country.\n\nSet against よ the pair is a map of who knows what: ね assumes the listener already agrees, よ assumes they do not yet know. Getting them backwards is the commonest way a grammatically perfect Japanese sentence still lands wrong.", "confidence": "well-supported"}'),
  ('rq-ety-n5-yo-particle', 'ety-n5-yo-particle', '{"claim": "よ hands the listener something they did not have.", "body": "It marks the sentence as new information being given, which is why it can sound helpful — 落ちましたよ — and equally why it can sound like being told off.\n\nThe risk is telling somebody what they already know. 会議は三時ですよ to the person who scheduled it is grammatical and rude, because よ has claimed they needed telling.", "confidence": "well-supported"}'),
  ('rq-ety-n5-no-explanatory', 'ety-n5-no-explanatory', '{"claim": "んです is the nominaliser の with です — \"it is the case that\".", "body": "の turns the clause into a noun and です asserts it. 遅れたんです is literally \"it is a fact of my being late\", offering the whole situation rather than the bare event.\n\nThat is why んです explains. It presents the sentence as an account of circumstances already in the air, which is also why using it for plain new information sounds like answering a question nobody asked.", "confidence": "well-supported"}'),
  ('rq-ety-n5-made-time', 'ety-n5-made-time', '{"claim": "まで marks a limit, and everything reaches up to it without passing.", "body": "五時まで is up to five and not beyond; 駅まで is as far as the station. One particle, distance or duration alike.\n\nAdding に changes it entirely: 五時までに is a deadline, because に names a single point and まで the span before it. That one syllable is the whole difference between working until five and finishing by five.", "confidence": "well-supported"}'),
  ('rq-ety-n5-gurai', 'ety-n5-gurai', '{"claim": "ぐらい is 位, a rank on a scale — which is why it is vaguer than a number.", "body": "The 位 of 一位 and 位置. Naming a grade rather than a figure is what makes 三時間ぐらい approximate.\n\nIt is the same word that grows into the belittling くらい at N3 — 掃除くらいしなさい, ranking the chore that low. And it differs from ごろ, which is 頃, a point in time: ぐらい measures a quantity, ごろ locates a moment.", "confidence": "well-supported"}'),
  ('rq-ety-n5-goro', 'ety-n5-goro', '{"claim": "ごろ is 頃, a noun meaning a time or a season — a point, not a quantity.", "body": "若い頃 is one''s youth; 三時ごろ is around three. What ごろ makes vague is where a moment falls.\n\nThat is exactly why the two cannot be swapped. 三時ごろ is around three o''clock, a point; 三時間ぐらい is about three hours, an amount. Ask whether the number is a place on the clock or a length, and the particle chooses itself.", "confidence": "well-supported"}'),
  ('rq-ety-n5-nado', 'ety-n5-nado', '{"claim": "など is 等 — the same 等 as in 等しい, \"equal\", and in 平等.", "body": "It names things of that sort, so the list is samples rather than a total. It naturally follows や, which lists loosely for the same reason.\n\nWorn down it becomes なんか at N3, where the vagueness has curdled into dismissal. など itself stays neutral, but the family resemblance is why it can sound slighting in the wrong sentence.", "confidence": "well-supported"}'),
  ('rq-ety-n5-toka', 'ety-n5-toka', '{"claim": "とか is と with か — the exhaustive lister made uncertain.", "body": "と lists completely; か marks something unsettled. Together they list without committing, which is why とか is the casual spoken cousin of や.\n\nThe modern habit of ending a sentence on a dangling とか is the same uncertainty applied to the whole utterance — a way of leaving what you said slightly unsettled, which is precisely what the particle has always done.", "confidence": "attested"}'),
  ('rq-ety-n5-doushite', 'ety-n5-doushite', '{"claim": "どうして is \"doing how\" — どう plus the te-form of する.", "body": "It asks by what means something came about, and asking that is asking why. なぜ is the plainer Sino-Japanese equivalent with no such construction inside it.\n\nThe literal reading also survives: どうして生きていくのか can genuinely mean \"how\", not \"why\". And it is why どうして carries more feeling than なぜ, which merely asks.", "confidence": "well-supported"}'),
  ('rq-ety-n5-counter-tsu', 'ety-n5-counter-tsu', '{"claim": "The つ counter is what is left of the native Japanese number system.", "body": "ひとつ, ふたつ, みっつ — one, two, three in the words Japanese used before it borrowed いち, に, さん from Chinese. The native series survives only up to nine, and ten is とお.\n\nThat is why つ is the counter you fall back on when no other fits: it is older than the borrowed system that produced the specialised counters. ひとり and ふたり are the same native numbers, which is why they break the pattern that 三人 follows.", "confidence": "well-supported"}'),
  ('rq-ety-n5-counter-nin', 'ety-n5-counter-nin', '{"claim": "ひとり and ふたり are irregular because they are older than the counter they attach to.", "body": "三人 is さんにん, borrowed Chinese number plus borrowed reading, entirely regular. 一人 and 二人 are ひと and ふた — the native numbers behind ひとつ and ふたつ — with a native ending.\n\nSo the exception is not an exception but a survival: the two commonest counts kept the old words while everything above three went over to the borrowed system. The same pattern shows in 一日 and 二日 against 三日.", "confidence": "well-supported"}'),
  ('rq-ety-n5-counter-hon', 'ety-n5-counter-hon', '{"claim": "本 means \"origin, base\" — and long thin things are counted by it because a tree trunk is one.", "body": "The 本 of 日本 and 本当 is a root or a foundation, not a book. A trunk is the base a tree grows from, and the counter spread from trunks to everything long and slender.\n\nWhich is why it now counts pens, bottles, umbrellas and roads, and then stretches to telephone calls, films and home runs — things with length in time rather than space. The sound changes are worth learning as a set: いっぽん, さんぼん, ろっぽん.", "confidence": "well-supported"}'),
  ('rq-ety-n5-counter-mai', 'ety-n5-counter-mai', '{"claim": "枚 counted thin flat things before it counted paper.", "body": "The character''s木 gives it away: it was used for thin pieces split from wood. Paper, plates, shirts and tickets are all the same flat shape.\n\nUnlike 本 and 匹 it takes no sound changes at all — いちまい through じゅうまい, every one regular — which makes it the easiest counter in the language and the one worth learning first.", "confidence": "attested"}'),
  ('rq-ety-n5-counter-ji-fun', 'ety-n5-counter-ji-fun', '{"claim": "時 and 分 change their sound with the number in front, and the number changes back.", "body": "一分 is いっぷん, 二分 is にふん, 三分 is さんぷん — three consonants across three consecutive numbers. 時 is steadier but still gives よじ and くじ rather than しじ and きゅうじ.\n\nThese are ordinary sound changes at a boundary, the same ones that give いっぽん and さんぼん. They are not learnable by rule in any form shorter than the list, which is why the list is what to learn.", "confidence": "well-supported"}'),
  ('rq-ety-n5-counter-sai', 'ety-n5-counter-sai', '{"claim": "二十歳 is はたち, a word with no 二十 and no 歳 audible in it at all.", "body": "はた is an old native word for twenty and ち is a native counter suffix. The kanji were fitted to the word afterwards, which is why nothing in the reading matches the characters.\n\nIt survives because coming of age at twenty mattered enough to keep its own word. 才 is commonly written for 歳 because it is simpler and sounds the same; the meaning \"years old\" belongs to 歳 alone.", "confidence": "well-supported"}'),
  ('rq-ety-n5-totemo', 'ety-n5-totemo', '{"claim": "とても meant \"no matter how\" and was used ONLY with negatives until about a century ago.", "body": "It is とて plus も — even saying that. とても行けない, \"there is no way I can go\", is the original construction and is still perfectly current.\n\nThe positive とても寒い is a Meiji-era innovation that was criticised as slang when it appeared. The negative use has not gone anywhere, which is why とても〜ない reads as idiomatic rather than as a contradiction.", "confidence": "well-supported"}'),
  ('rq-ety-n5-zenzen', 'ety-n5-zenzen', '{"claim": "ぜんぜん was used with positives long before it was restricted to negatives.", "body": "全然 means \"wholly, entirely\", and in Meiji writing — Sōseki among others — it modifies positives freely. The rule tying it to negatives is younger than the word.\n\nSo 全然大丈夫, which is corrected as sloppy, is closer to the original than the rule that forbids it. Worth knowing because it will be corrected anyway: the prescription is real even though the history is not on its side.", "confidence": "well-supported"}'),
  ('rq-ety-n5-te-wa-ikemasen', 'ety-n5-te-wa-ikemasen', '{"claim": "いけません is 行く — it will not go, so it will not do.", "body": "The potential negative of 行く, used exactly as English uses \"that won''t do\". 食べてはいけません says that eating, as a proposition, does not go anywhere.\n\nIt is the same 行く behind なくてはいけない and the casual いけない. And it pairs with てもいい, its opposite: one says it is good, the other that it will not go.", "confidence": "well-supported"}'),
  ('rq-ety-n5-hoshii', 'ety-n5-hoshii', '{"claim": "ほしい is an adjective, not a verb — which is why what you want takes が.", "body": "水がほしい says the water is wanted, with no verb of wanting in the sentence at all. There is no object, so を has nothing to do.\n\nAnd because adjectives describe what the speaker can feel, ほしい cannot be used flatly about another person: 彼は水がほしい is wrong, and ほしがっている is the repair. The same restriction governs たい and 寒い.", "confidence": "well-supported"}'),
  ('rq-ety-n5-ni-frequency', 'ety-n5-ni-frequency', '{"claim": "The に of 週に三回 is the same に that marks a point — it names the frame the count sits in.", "body": "週に三回 sets \"week\" as the unit and puts three occurrences inside it. に is doing what it always does: naming the place something lands.\n\nSo there is no separate \"per\" particle to learn. It is the same に as 三時に and 東京に, and the English \"per\" is what has no counterpart, not the Japanese.", "confidence": "well-supported"}'),
  ('rq-ety-n5-ichiban', 'ety-n5-ichiban', '{"claim": "一番 is \"number one\" — a plain ordinal doing the work of a superlative.", "body": "番 is a turn or a position in a sequence, the 番 of 番号 and 交番. 一番 is simply first place.\n\nJapanese has no superlative inflection, so it names a rank instead — exactly as it has no comparative and uses ほうが, \"the side\", instead. The で in クラスで一番 marks the field the ranking is taken within.", "confidence": "well-supported"}'),
  ('rq-ety-n5-no-pronoun', 'ety-n5-no-pronoun', '{"claim": "The の that stands for a noun is the nominaliser, doing its ordinary job.", "body": "赤いのをください is \"give me the red one\", where の is the thing itself. It is the same の that turns clauses into nouns in んです and ので.\n\nWhich is why it cannot be used where こと would be needed, and why 私の alone means \"mine\". One particle: it makes whatever precedes it into a noun, and sometimes that noun is all you needed.", "confidence": "well-supported"}'),
  ('rq-ety-n5-modifying-clause', 'ety-n5-modifying-clause', '{"claim": "Japanese needs no relative pronoun because the verb form was already built to modify nouns.", "body": "The 連体形 was the classical form for standing before a noun, and when it merged with the sentence-ending form the modifying ability came along. 昨日買った本 is \"yesterday-bought book\" with no \"that\" or \"which\" anywhere.\n\nThat is also why the clause comes before the noun rather than after it, and why が rather than は marks the subject inside it: は belongs to the sentence as a whole, and a modifying clause is not one.", "confidence": "well-supported"}'),
  ('rq-ety-n5-te-negative', 'ety-n5-te-negative', '{"claim": "ないで and なくて are both negatives, and the で and て are what separate them.", "body": "ないで is the negative with the で of manner — 傘を持たないで出かけた, going out in the circumstance of not having one. なくて is the adjective negative ない in its て-form, which links a cause: 分からなくて困った.\n\nSo ないで attaches to how something was done and なくて to why. The pieces are both ordinary, and the distinction that looks arbitrary is the same で and て doing what they do everywhere else.", "confidence": "well-supported"}'),
  ('rq-ety-n5-nakute', 'ety-n5-nakute', '{"claim": "なくて is ない treated as the adjective it is, in the て-form.", "body": "ない inflects like an い-adjective — 寒い gives 寒くて, ない gives なくて. There is nothing special about the negative here beyond its class.\n\nThat is why なくて links reasons the way 寒くて does: an adjective in て-form gives grounds for what follows. And it is why the obligation forms build on it — なくてはいけない, なくてもいい — since every one of them needs that adjective link.", "confidence": "well-supported"}'),
  ('rq-ety-n5-te-adjective', 'ety-n5-te-adjective', '{"claim": "くて and で are the two adjective classes linking, each with its own class''s form.", "body": "安くて美味しい uses く, the い-adjective connecting form. 静かできれい uses で, because な-adjectives are nouns and で is what the copula does when it links onward.\n\nSo there is one rule, not two: each class connects with the form it has always used. It is the same く as 早く走る and the same で as 学生で、二十歳です.", "confidence": "well-supported"}'),
  ('rq-ety-n5-ga-desire', 'ety-n5-ga-desire', '{"claim": "が marks what the feeling is ABOUT because none of these words is a transitive verb.", "body": "好き, 嫌い, 上手, 下手 and ほしい are adjectives; 分かる, できる and いる are intransitive verbs. Not one of them can take an object, so not one of them can take を.\n\nWhat が marks is simply the subject: in 日本語が分かる, the Japanese is the thing that is understood. Read that way the \"rule about feelings\" disappears and leaves ordinary grammar behind.", "confidence": "well-supported"}'),
  ('rq-ety-n5-wakaru', 'ety-n5-wakaru', '{"claim": "分かる is 分ける, \"to divide\" — understanding is telling things apart.", "body": "The same 分 as 分ける and 部分. To understand something is to have it separated out from what it is not, which is why the verb is intransitive: the thing does the separating, in your mind.\n\nAnd that is why it takes が rather than を. 日本語が分かる is \"Japanese comes apart for me\" — there is no object to mark, and 日本語を分かる is wrong for a structural reason rather than a stylistic one.", "confidence": "well-supported"}'),
  ('rq-ety-n5-nasai', 'ety-n5-nasai', '{"claim": "なさい is the imperative of なさる, the honorific \"to do\".", "body": "なさる is the respectful form of する, and its imperative is なさい. So the form is polite in origin, which is why it lands as firm rather than rude.\n\nIt is also why it belongs to parents and teachers: an honorific imperative is what someone entitled to give the order uses. The casual 〜な in 食べな is this word worn down, and it is a different word from the 〜な that forbids.", "confidence": "well-supported"}'),
  ('rq-ety-n5-greetings', 'ety-n5-greetings', '{"claim": "こんにちは and こんばんは are sentences that were never finished.", "body": "They are 今日は and 今晩は — \"as for today\", \"as for this evening\" — with the rest dropped. The full form ran on to ask after the person''s day.\n\nThat is why they are spelled with は and said with わ: it is the topic particle, frozen mid-sentence. おはよう is the same kind of fragment, from お早く, \"it is early of you\", which is why the polite ございます can still be added.", "confidence": "well-supported"}'),
  ('rq-ety-n5-itadakimasu', 'ety-n5-itadakimasu', '{"claim": "いただく is 頂く — 頂 is the crown of the head, and the word means to raise something above it.", "body": "Receiving a gift by lifting it above your own head is the gesture the word records. It is the humble counterpart of もらう for that reason: you are placed beneath what you receive.\n\nSo いただきます before a meal is not \"thank you\" but an acknowledgement of receiving. And the 〜ていただく of business Japanese is the same verb doing the same lowering, which is why it is the politest of the giving-and-receiving forms.", "confidence": "well-supported"}'),
  ('rq-ety-n5-sumimasen', 'ety-n5-sumimasen', '{"claim": "すみません is 済む negated — \"this is not settled\".", "body": "済む means to be finished or squared away. すみません says the matter is not concluded: something remains owed.\n\nWhich is why one word covers apology, attention-getting and thanks. All three are the same admission that a debt is outstanding, and it explains why すみません can be a warmer thank-you than ありがとう — it acknowledges the trouble rather than only the result. The formal 済みません is the same word spelled out.", "confidence": "well-supported"}'),
  ('rq-ety-n5-onegaishimasu', 'ety-n5-onegaishimasu', '{"claim": "願う is \"to wish, to pray\" — the same 願 as in 願書 and お願い事.", "body": "お願いします is the humble お〜する form of that verb: I respectfully do the wishing. The construction is the one taught at N4.\n\nSo it is not a fixed phrase but ordinary grammar, which is why it scales — お願いいたします is humbler still, and よろしくお願いします adds \"favourably\" to the wish. The 願 is doing real work every time.", "confidence": "well-supported"}'),
  ('rq-ety-n5-douzo-doumo', 'ety-n5-douzo-doumo', '{"claim": "どうも is \"in any way at all\", and like the greetings it is a sentence left unfinished.", "body": "どうも ありがとう is \"thank you in every way\"; どうも すみません the same with the apology. Alone, どうも leaves the rest to be guessed, which is why it works as hello, thanks and sorry at once.\n\nThe negative use is the older one and still current: どうも分からない, cannot make it out by any means. It is the same construction as どうにも at N1.", "confidence": "well-supported"}'),
  ('rq-ety-n5-nani-mo', 'ety-n5-nani-mo', '{"claim": "何も is the question word swept up by も, and the negative is what turns it into \"nothing\".", "body": "も adds everything in, so 何も takes all the possible whats at once. Follow it with a negative and every one of them is ruled out.\n\nThat is a standard move rather than a set of vocabulary: 誰も, どこも, いつも are the same sweep. And with か instead — 何か, 誰か — the question is left open rather than swept, giving \"something\" and \"someone\".", "confidence": "well-supported"}'),
  ('rq-ety-n5-ni-purpose', 'ety-n5-ni-purpose', '{"claim": "The に of 買いに行く marks the purpose as a point aimed at, exactly as it marks a destination.", "body": "東京に行く goes to a place; 買いに行く goes to an act. In both, に names the target of the going.\n\nWhich is why the verb has to be a stem rather than a dictionary form: に takes a noun-like thing, and the ます stem is the closest a verb comes to being one. It is the same reason 買い物に行く works with a plain noun.", "confidence": "well-supported"}'),
  ('rq-ety-n5-toki-doki-place', 'ety-n5-toki-doki-place', '{"claim": "上, 下, 中, 前 and 後ろ are nouns, not prepositions — which is why they take の.", "body": "机の上 is literally \"the table''s top\". Japanese has no prepositions at all; it names a part of the thing and possesses it.\n\nSo 上に is a noun with に, exactly like 東京に, and the whole system works by ordinary grammar. It is also why the position word comes after the thing it belongs to, which is the reverse of English and consistent with everything else in the language.", "confidence": "well-supported"}'),
  ('rq-ety-n5-to-quotation', 'ety-n5-to-quotation', '{"claim": "The quotative と is the same と that pairs two things.", "body": "It pairs the words with the saying of them: 「はい」と言った. Nothing marks the quotation as speech; と simply joins the content to the verb.\n\nThat is why と works for thought as readily as speech — と思う, と考える — and why it needs the plain form in front. What is being paired is the thought itself, and politeness belongs to the sentence around it, not inside the quotation.", "confidence": "well-supported"}'),
  ('rq-ety-n5-ka-or', 'ety-n5-ka-or', '{"claim": "The か that means \"or\" is the question particle marking each option as unsettled.", "body": "本か雑誌 leaves both open rather than choosing. It is the same か that turns 誰 into 誰か and a statement into a question.\n\nSo Japanese does not have a word for \"or\" so much as a way of marking alternatives as undecided — which is why か can attach to each item and why かどうか embeds a whole undecided question.", "confidence": "well-supported"}'),
  ('rq-ety-n5-ga-in-clause', 'ety-n5-ga-in-clause', '{"claim": "が marks the subject inside a modifying clause because は cannot go there.", "body": "は marks the topic of a whole sentence, and a clause describing a noun is not a whole sentence. So 私が買った本 uses が, and 私は buys nothing inside a clause.\n\nThe older genitive が is still visible in the alternative 私の買った本, which is equally correct and slightly more formal — the same が-and-の overlap preserved in 我が国.", "confidence": "well-supported"}'),
  ('rq-ety-n5-ta-koto-ga-aru', 'ety-n5-ta-koto-ga-aru', '{"claim": "It says an instance exists: こと makes the act a thing, and ある says there is one.", "body": "行ったことがある is \"there exists a having-gone\". The past tense is inside the noun, not on ある.\n\nThat is why the present-tense version means something entirely different. 行くことがある has an instance of going that is not past, so it means \"there are times when\" — the same construction with the tense moved, and the difference is not idiomatic but grammatical.", "confidence": "well-supported"}'),
  ('rq-ety-n5-shika-nai', 'ety-n5-shika-nai', '{"claim": "しか requires a negative because it excludes everything and then needs the exclusion stated.", "body": "千円しかない is \"apart from a thousand yen, there is not\". しか sets the thing aside and the negative rules out the rest.\n\nSo the negative is not a rule to remember but the other half of the sentence. That is also why しか carries a shortfall where だけ does not: だけ merely limits, while しか has actively denied everything else.", "confidence": "well-supported"}')
) AS v(id, target, proposed)
JOIN etymology_entries e ON e.id = v.target
ON CONFLICT (id) DO NOTHING;
