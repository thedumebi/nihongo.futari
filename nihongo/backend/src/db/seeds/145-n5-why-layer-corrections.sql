-- Fable's N5 verification: 23 of 65 entries corrected.
--
-- A Fable subagent checked every N5 why-layer entry with instructions to
-- falsify rather than confirm. It found 23 faults and every one is fixed here.
-- (It worked from its own knowledge -- web search was declined in its session
-- -- and flagged the two places that left it unsure; both are downgraded to
-- 'attested' rather than left asserting.)
--
-- The two systematic ones, which are worth stating because they will recur:
--
--   PERIOD was dated to when the ANCESTOR existed rather than when the change
--   happened. にて is Heian, but its contraction to で is Muromachi -- so all
--   four で entries moved. 五段 was dated Old Japanese although the NAME is
--   20th-century school grammar: the class was 四段 until the 1946 kana reform
--   respelled 書かう as 書こう and gave it a fifth row. The 〜時〜分 clock is
--   Meiji, not ancient. あり was used of people freely in classical Japanese
--   (昔、男ありけり), so the あり/いる animacy split is Edo at the earliest.
--
--   ETYMOLOGICAL FALLACY: deriving a form correctly and then asserting a
--   modern restriction the history does not license. へ was said never to
--   promise arrival (東京へ着く is ordinary); 日本語を分かる was called
--   structurally impossible (気持ちを分かってほしい is ordinary); と-quotation
--   was said to force the plain form (a direct quote keeps its politeness).
--
-- Three were plain false. など is not 等 -- it is worn-down なにと, and the
-- kanji was fitted afterwards; the entry had read the spelling backwards as
-- the etymology. なぜ is native, not Sino-Japanese. And the 一日/二日 parallel
-- in the counter entry was wrong: 三日 is みっか, native like the rest of the
-- date series, so there is no native-then-borrowed split there to point at.
--
-- Seeds 139-143 have run and are left alone; corrections ship as a new seed.


UPDATE etymology_entries SET body = 'ある is for what does not — objects, buildings, plans. いる is for what does: people and animals. The division is animacy, not size or importance — and it is younger than it looks. Classical Japanese used あり of people freely: 昔、男ありけり.

It reaches much further than this lesson. ている is built on いる and describes something in progress; てある is built on ある and describes a thing left in a state. The split you learn here is the one those two patterns rest on.',
    period = 'Edo', updated_at = now()
WHERE id = 'ety-n5-arimasu-imasu';

UPDATE etymology_entries SET period = 'Meiji', updated_at = now()
WHERE id = 'ety-n5-counter-ji-fun';

UPDATE etymology_entries SET claim = '枚 named a small piece of wood in Chinese, and in Japan was matched to the native ひら — a flat thin thing.',
    body = 'The ひら of 花びら, a petal. In early Chinese 枚 was a broad classifier for almost anything rather than specifically a flat one, and the flat-thing sense is largely a Japanese development. The story that reads it off the 木 radical is folk etymology.

What makes it worth learning first is the sound: unlike 本 and 匹 it takes no changes at all — いちまい through じゅうまい, every one regular.', updated_at = now()
WHERE id = 'ety-n5-counter-mai';

UPDATE etymology_entries SET body = '三人 is さんにん, borrowed Chinese number plus borrowed reading, entirely regular. 一人 and 二人 are ひと and ふた — the native numbers behind ひとつ and ふたつ — with a native ending.

So the exception is not an exception but a survival: the two commonest counts kept the old words while everything above three went over to the borrowed system. The same native numbers survive in the date series — 二日, 三日, 四日 — which stayed native all the way to 十日.', updated_at = now()
WHERE id = 'ety-n5-counter-nin';

UPDATE etymology_entries SET claim = 'で is にて worn down — に plus a linking て.',
    body = 'にて is still written in formal notices. The に named a point and a linking て carried it onward; the pair contracted into で by the Muromachi period and was normal by Edo.

That single origin explains the four separate で lessons. Place of action, means, material and cause are all one particle naming the circumstance an action is carried out in. 公園で遊ぶ, ペンで書く, 木で作る, 風邪で休む — the English needs four prepositions and the Japanese never split.',
    period = 'Muromachi', updated_at = now()
WHERE id = 'ety-n5-de-location';

UPDATE etymology_entries SET period = 'Muromachi', updated_at = now()
WHERE id = 'ety-n5-de-means';

UPDATE etymology_entries SET period = 'Muromachi', updated_at = now()
WHERE id = 'ety-n5-de-reason';

UPDATE etymology_entries SET period = 'Muromachi', updated_at = now()
WHERE id = 'ety-n5-de-tool';

UPDATE etymology_entries SET body = 'Classical Japanese had a 終止形 to end a sentence and a 連体形 to stand before a noun, and for most verbs they differed. They collapsed together, and the surviving shape is the one dictionaries list.

Japanese never needed a relative pronoun — even before the merger the 連体形 modified nouns directly. What the merger did was hand both jobs to one shape, so 食べる now ends a sentence and also sits straight in front of a noun: 食べる人.',
    period = 'Muromachi', updated_at = now()
WHERE id = 'ety-n5-dictionary-form';

UPDATE etymology_entries SET body = 'It asks by what means something came about, and asking that is asking why. なぜ is the plainer native word with no such construction inside it — 何故 is a kanji spelling, not a Sino-Japanese reading.

The literal reading also survives: どうして生きていくのか can genuinely mean "how", not "why". And it is why どうして carries more feeling than なぜ, which merely asks.', updated_at = now()
WHERE id = 'ety-n5-doushite';

UPDATE etymology_entries SET body = 'The 連体形 was the classical form for standing before a noun, and when it merged with the sentence-ending form the modifying ability came along. 昨日買った本 is "yesterday-bought book" with no "that" or "which" anywhere.

The clause comes before the noun because every modifier in Japanese does — the same order as 赤い本 and 私の本. And が rather than は marks the subject inside it: は belongs to the sentence as a whole, and a modifying clause is not one.', updated_at = now()
WHERE id = 'ety-n5-modifying-clause';

UPDATE etymology_entries SET body = 'Classical Japanese had なる as an attributive copula — に plus あり — and 静かなる夜 was "a night that is quiet". な is what is left of it.

Everything odd about the class follows. They take だ and でした because nouns do; they take な before a noun because that is the copula''s modifying form; and 静かの has to be 静かな for the same reason. The class is noun-like and leans on the copula for everything, which is why it patterns with nouns nearly everywhere — and yet takes な where a true noun takes の.', updated_at = now()
WHERE id = 'ety-n5-na-adjective';

UPDATE etymology_entries SET claim = 'など is worn-down なにと — "what and…" — with 等 fitted to it afterwards as a spelling.',
    body = 'The derivation is phonetic: なにと contracted to など. 等 is a kanji assigned to write the word later, not the morpheme it descends from — read as Sino-Japanese, 等 would be トウ.

What the original says is still what the particle does. A list trailing off into "and what else" is a list of samples, which is why など follows や so naturally. Worn down further it becomes なんか at N3, where the vagueness has curdled into dismissal.', updated_at = now()
WHERE id = 'ety-n5-nado';

UPDATE etymology_entries SET body = 'へ came from 辺, a vicinity — historically a heading rather than a point. The two overlap for destinations in modern Japanese, and 東京へ着く is perfectly ordinary; what に keeps to itself is every other kind of point.

One idea covers every use the textbook lists separately. 三時に is a point in time; 東京に着く is a point in space; 友達に渡す is the point the thing lands on. If the sentence has a target, it is に.', updated_at = now()
WHERE id = 'ety-n5-ni-direction';

UPDATE etymology_entries SET period = 'Edo',
    confidence = 'attested', updated_at = now()
WHERE id = 'ety-n5-shika-nai';

UPDATE etymology_entries SET body = '〜ても is "even if"; いい is the plain adjective. 食べてもいい says that even in the case of eating, things are fine.

Nothing has been idiomatised, which is why the negative works by the ordinary rules: 食べなくてもいい is "even not eating, it is fine" — you do not have to. And 食べてはいけない, the refusal, swaps two things: いい for いけない, "it will not go", and も for は, because it singles the case out rather than conceding it.', updated_at = now()
WHERE id = 'ety-n5-te-mo-ii';

UPDATE etymology_entries SET body = 'ないで is the negative with で — 傘を持たないで出かけた, going out in the circumstance of not having one. Which で is a live question: one account makes it the で of manner, another continues the classical negative で of 知らで. なくて is the adjective negative ない in its て-form, which links a cause: 分からなくて困った.

So ないで attaches to how something was done and なくて to why. The pieces are both ordinary, and the distinction that looks arbitrary is the same で and て doing what they do everywhere else.',
    confidence = 'attested', updated_at = now()
WHERE id = 'ety-n5-te-negative';

UPDATE etymology_entries SET body = 'It pairs the words with the saying of them: 「はい」と言った. Nothing marks the quotation as speech; と simply joins the content to the verb.

That is why と works for thought as readily as speech — と思う, と考える. It is also why INDIRECT quotation drops to the plain form: when you report the content rather than the words, politeness belongs to the sentence around it. A direct quote keeps whatever was actually said, 「はい、そうです」と言った included.', updated_at = now()
WHERE id = 'ety-n5-to-quotation';

UPDATE etymology_entries SET body = '本と鉛筆 pairs two nouns exhaustively. 友達と行く pairs you with a companion. 「はい」と言った pairs an utterance with the saying of it.

And 押すと開く pairs pushing with opening; the conditional と of N4 is usually traced to the same joining particle. One particle, always joining two things and claiming they belong together — which is why と lists completely while や lists loosely.',
    confidence = 'attested', updated_at = now()
WHERE id = 'ety-n5-to-with';

UPDATE etymology_entries SET claim = 'とても meant "no matter how" and lived almost exclusively with negatives until about a century ago.',
    body = 'It is とて plus も — even saying that. とても行けない, "there is no way I can go", is the original construction and is still perfectly current.

The positive とても寒い spread in late Meiji and Taishō and was criticised as slang — Akutagawa complained about it — though scattered earlier affirmative examples exist. The negative use has not gone anywhere, which is why とても〜ない reads as idiomatic rather than as a contradiction.',
    confidence = 'attested', updated_at = now()
WHERE id = 'ety-n5-totemo';

UPDATE etymology_entries SET body = '書く runs across か・き・く・け・こ — five steps, 五段. 食べる never leaves the え row: 食べない, 食べます, 食べる, 食べれば. One step, 一段. The fifth step is newer than it looks: the class was called 四段 until the 1946 kana reform respelled 書かう as 書こう and added the お row.

So the classification is not a list to memorise but a description of the stem you can watch happening. It also explains why only 五段 verbs have a て-form worth learning rules for: a stem that moves has consonants colliding with the ending, and a stem that stays put does not.',
    period = 'Modern', updated_at = now()
WHERE id = 'ety-n5-verb-classes';

UPDATE etymology_entries SET claim = '分かる shares its root with 分ける, "to divide" — understanding is telling things apart.',
    body = 'Both are formations on the old root 分く, and 分かる is the intransitive one. To understand something is to have it separated out from what it is not — the thing does the coming-apart, in your mind.

That is why it takes が rather than を. 日本語が分かる is "Japanese comes apart for me", with no object to mark. を分かる survives only in pleas about feelings — 気持ちを分かってほしい — where what is wanted is the effort, not the state.', updated_at = now()
WHERE id = 'ety-n5-wakaru';

UPDATE etymology_entries SET body = 'Where と pairs exhaustively, や names examples and leaves the rest unsaid. 本や雑誌 is books, magazines, and whatever else.

The openness is why や attracts など at the end. Choosing between と and や is choosing whether the list is complete.', updated_at = now()
WHERE id = 'ety-n5-ya-particle';
