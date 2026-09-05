-- Fable's verification of the last 64: 28 corrected.
--
-- These were written after the five level passes and were meant to apply their
-- lessons. They applied some and repeated others.
--
-- Repeated: KANJI-SPELLING-AS-ETYMOLOGY, five more times. たま is a native
-- noun and 偶 was laid on it; いつ likewise under 何時. あいだ is native and the
-- かん of 時間 is a different morpheme sharing the character. ため is native
-- with 為 as its spelling. And へた is not the mirror of 上手 at all — 上手 is a
-- real Sino-Japanese compound, but へた is native, most likely 端, with 下手
-- fitted afterwards to make the pair look symmetrical.
--
-- Repeated: ANCESTOR-DATING, twelve more times. だけ is an Edo particle though
-- the noun 丈 is old; ない is a late Muromachi Eastern form that won in Edo, so
-- everything built on it moves; はず's "expected outcome" sense is Muromachi
-- though the arrow-nock noun is ancient; 予定 and 〜中 are Sino-Japanese and
-- cannot be Old Japanese.
--
-- New, and worth recording. そうですか's second paragraph tied the そう of
-- そうだ to the demonstrative そ through the shared character 然. They are
-- different words: the dictionaries derive the auxiliary from 様 or from 相.
-- しかし is not from 然 either. One character, three morphemes, no kinship.
--
-- Two of the four entries that DECLINED to give an etymology were overstating
-- the uncertainty — the dodge the verifier was asked to look for. ずつ has a
-- hedged but standard account (the counting つ doubled) and だらけ has one too
-- (the だら of だらだら with the け of 塩気, per 大言海), and both are now given
-- rather than withheld. っぽい and もっと genuinely have none, and stay as they
-- were.
--
-- Three overstatements of the kind the batch was told to avoid: 始める and
-- 終わる do NOT both take the transitive member — 読み終わる is the standard
-- form and 終わる is intransitive; particles are not indispensable, since
-- speech drops them constantly (これ食べる？); and どう IS in the こそあど grid,
-- which the entry teaching どう denied.
--
-- One fake causality: ながら was concessive long before も joined it —
-- 敵ながらあっぱれ needs no も — so も sharpens the concession rather than
-- supplying it.
--
-- And the けれども finding reaches a PUBLISHED entry, the second time this
-- verification has done that. It is corrected at the bottom.


UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n3-chuu';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n3-dake-de-naku';

UPDATE etymology_entries SET claim = 'だらけ probably comes from the だら of だらだら, with the け of 塩気.',
    body = '大言海 takes it that way: a mimetic for liquid running everywhere, plus the suffix that gives 塩気 and 嫌気. It is not certain, but it is a real account rather than a blank, and the word is attested from the Muromachi period for blood, sweat and mud.

What separates it from まみれ and ずくめ is reach. まみれ needs something that could coat a surface, ずくめ a single quality filling a thing completely, while だらけ takes anything in unwelcome quantity — mud, mistakes, holes.',
    period = 'Muromachi', updated_at = now()
WHERE id = 'ety-n3-darake';

UPDATE etymology_entries SET period = 'Muromachi', updated_at = now()
WHERE id = 'ety-n3-hazu-ga-nai';

UPDATE etymology_entries SET claim = 'ながら was concessive on its own long before も was added to it.',
    body = '敵ながらあっぱれ, 残念ながら, 知りながら黙っていた — none of these needs a も, and all of them concede. The concession is ながら''s own, inherited from its older sense of a state persisting unchanged, the one preserved in 昔ながら and 生まれながらに.

So も is not supplying the concession but sharpening it. 知っていながらも simply presses harder on a contrast ながら was already making.', updated_at = now()
WHERE id = 'ety-n3-nagara-mo';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n3-o-kudasai';

UPDATE etymology_entries SET body = 'It is a native noun meaning a benefit or an account, with 為 as its spelling. Pointed forward it gives purpose, 勉強するために; pointed backward it gives cause, 雨のために中止.

One noun, and which reading you get depends on whether what follows was aimed at or merely resulted. That is why the cause use belongs to written notices, where から and ので would be too conversational.', updated_at = now()
WHERE id = 'ety-n3-tame-cause';

UPDATE etymology_entries SET claim = 'あいだ is a native noun for the space between two things.',
    body = 'It is written 間, the same character read かん in 時間 and 人間 — but that is a Sino-Japanese morpheme and あいだ is the older native word underneath the shared spelling. 間に applies it to time: the stretch between one point and another.

The に is what makes it a window rather than a duration. 寝ている間 is the whole time; 寝ている間に is some moment inside it, which is why the second takes a one-off event and the first takes something lasting.', updated_at = now()
WHERE id = 'ety-n4-aida-ni';

UPDATE etymology_entries SET claim = '場合 is a native compound — ば, a place, with あい, a meeting.',
    body = 'Both halves are kun readings: ば is 場 read natively (its on-reading is ジョウ), and あい is from 合う. The situation where things come together, written in kanji but Japanese underneath.

It names a situation as a thing, which is why a clause in front modifies it as it would any noun and a noun needs の: 火事の場合. That noun-ness is the difference from たら — たら supposes an occasion, 場合 names one — and it is why it belongs to notices and rules.', updated_at = now()
WHERE id = 'ety-n4-baai';

UPDATE etymology_entries SET body = '始める, 終わる and 続ける are full verbs. Attached to a stem they say when the action starts, stops or carries on, and nothing is idiomatic about the join.

始める is the transitive member and 始まる never compounds this way, so it is 降り始める and never 降り始まる. 終わる does not follow that rule — it compounds as it stands, 読み終わる, with 読み終える alongside it. The pairing has to be learned verb by verb.', updated_at = now()
WHERE id = 'ety-n4-hajimeru-owaru';

UPDATE etymology_entries SET claim = 'けれども is the adjective''s old 已然形 ending けれ with the concessive ども.',
    body = 'The けれ is the one in 寒けれ, not the auxiliary けり. It joined ども — Old Japanese for "even though" — at the end of the Muromachi period and then generalised to other predicates; けれど and けど follow in the Edo period.

That ども is the same particle inside といえども at N1. The length tracks the formality exactly: けれども is the whole phrase, けど is what survives casual speech, which is a measure of how much of it you bothered to say.',
    period = 'Muromachi', updated_at = now()
WHERE id = 'ety-n4-keredo';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n4-nakutemo-ii';

UPDATE etymology_entries SET body = 'Both are こと making a clause into a noun with ある saying an instance exists. What differs is only whether the clause is past.

A past instance that exists is something you have done; a non-past one is something that happens from time to time. The construction is identical and both meanings fall out of the tense alone, which is why the tense is the only thing to watch.', updated_at = now()
WHERE id = 'ety-n4-ru-koto-ga-aru';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n4-shi';

UPDATE etymology_entries SET period = 'Meiji', updated_at = now()
WHERE id = 'ety-n4-yotei';

UPDATE etymology_entries SET claim = 'どちら and どっち are both built on the older direction word どち.',
    body = 'どち took ら to give どちら, and a doubled consonant to give どっち — parallel formations rather than one contracted out of the other. こちら, そちら and あちら fill the rest of the row.

The ら version is the polite one, and the ら is an old suffix of vagueness: pointing at a general direction rather than straight at a thing. Whether the politeness follows from that vagueness is a reasonable reading rather than a documented one.', updated_at = now()
WHERE id = 'ety-n5-dochira';

UPDATE etymology_entries SET claim = 'いつも is いつ with も; たまに is the old noun たま — the kanji on both were fitted later.',
    body = 'いつも is the question word いつ swept by も into "always", the same も that makes 誰も into "nobody"; 何時 is only how it is spelled. たま is a native noun for something rare — dictionaries connect it to 玉 — and 偶 is a character laid on it afterwards. 時々 is the repetition mark doing what it looks like.

よく is the odd one out and the only transparent one: it is the adverbial form of 良い. That an adverb meaning "well" also means "often" is simply a sense the dictionaries list, not a route anyone can trace.', updated_at = now()
WHERE id = 'ety-n5-frequency-adverbs';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n5-i-adj-negative';

UPDATE etymology_entries SET claim = '上手 really is 上 plus 手; へた is a native word and 下手 is kanji fitted to it.',
    body = 'じょうず is a genuine Sino-Japanese compound — the upper hand. へた is not its mirror: it is a native word, most likely 端 (はた), the shallow edge rather than the deep part, and 下手 was written onto it later to make the pair look symmetrical.

Both behave as な-adjectives, which is why the thing you are good at takes が. 日本語が上手です has no verb of ability in it, so there is nothing for を to mark, and 得意 and 苦手 take が for the same reason.', updated_at = now()
WHERE id = 'ety-n5-jouzu-heta';

UPDATE etymology_entries SET claim = 'The から of a starting point and the から of a reason are one particle, though where it came from is argued over.',
    body = 'The dictionaries offer several accounts — an old noun of reason or interval, a formal noun, or the から of 人柄 and 家柄, a nature or stock. None has settled it.

What is not in doubt is that the two uses are one word. A journey from Tokyo and a decision from a reason are the same idea: the thing it started out of. That is why Japanese needs no separate word for "because" here, and why から sits after a noun or a whole clause without changing shape.',
    confidence = 'attested', updated_at = now()
WHERE id = 'ety-n5-kara-from';

UPDATE etymology_entries SET body = 'から marks an origin, the same particle that gives reasons, and まで a limit reached and not passed. Put them together and you have a span with both ends named.

The pair works for time, place and quantity alike because neither particle was ever specialised: 九時から五時まで, 東京から大阪まで, 一から十まで.', updated_at = now()
WHERE id = 'ety-n5-kara-made';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n5-mada-mou';

UPDATE etymology_entries SET body = 'ません ends in the fossilised negative ん, which does not inflect. So the polite negative past cannot be built the way ました is; it borrows でした, the past of です, and puts it after.

That is why this form is two words long where every other polite ending is one — though it was settled by competition rather than by logic: Edo speech said ませなんだ, and 幕末 had ませんかった and ませんだった before ませんでした won in the Meiji years. The plain equivalent なかった has no such trouble, because ない is an adjective and can simply become かった.',
    period = 'Meiji', updated_at = now()
WHERE id = 'ety-n5-masen-deshita';

UPDATE etymology_entries SET period = 'Edo', updated_at = now()
WHERE id = 'ety-n5-nakutemo-ii-n5';

UPDATE etymology_entries SET claim = 'なに, だれ and いつ stand outside the こそあど grid; どこ and どう are inside it.',
    body = 'こ, そ, あ and ど are the demonstrative roots taught with これ・それ・あれ・どれ, and ど is the interrogative one — hence どこ, どれ, どの, どちら and どう, which fills the こう・そう・ああ・どう row.

なに, だれ and いつ belong to no such series, which is why none of them takes a ど. Knowing which questions come out of the demonstrative grid and which stand alone saves trying to force all of them into one table.', updated_at = now()
WHERE id = 'ety-n5-question-words';

UPDATE etymology_entries SET body = 'The same そ as それ and そこ, in an adverbial form: そう means "like that". そうです is "it is that way", and そうですか asks whether it is.

Worth keeping apart from the そう of そうだ, which is a different word: the dictionaries derive that one from 様 or from the character 相, not from the demonstrative. The shared spelling 然 covers several morphemes and is not evidence of kinship.', updated_at = now()
WHERE id = 'ety-n5-sou-desu-ka';

UPDATE etymology_entries SET body = 'Old Japanese was verb-final and so is the modern language; nothing in twelve hundred years moved it. What comes before the verb is comparatively free, because the particles say what each phrase is doing rather than the position.

That is the trade: English fixes the order and drops the case marking, Japanese fixes the verb and marks everything else. It is why 私はパンを食べます and パンを私は食べます are both grammatical. In writing the particles are what cannot be spared; speech drops は and を freely — これ食べる？ — because the context is doing their work.', updated_at = now()
WHERE id = 'ety-n5-word-order';

UPDATE etymology_entries SET claim = 'ずつ is probably the counting つ of 一つ and 二つ, doubled.',
    body = '日国 offers that account with a hedge, and the word has been in use since the Heian period. The older kana was づつ, still seen; the change to ずつ is orthographic rather than a change in the word.

What it does is distribute: 一つずつ hands out one apiece, 少しずつ a little at a time. It always follows a quantity, because there has to be something to share out.', updated_at = now()
WHERE id = 'ety-n5-zutsu';

-- The けれども finding reaches a PUBLISHED entry. Seed 012's ety-kedo derives
-- けれ from the auxiliary けり; it is the adjective's 已然形 ending, as in 寒けれ,
-- and the form is Muromachi rather than Heian.
UPDATE etymology_entries SET
  claim = 'けど is the worn-down end of けれども — the adjective ending けれ plus the concessive ども.',
  body = 'The chain is けれども → けれど → けど. けれ is the old 已然形 ending of adjectives, the one in 寒けれ, and ども is an Old Japanese concessive meaning "even though"; the pair formed at the end of the Muromachi period and spread to other predicates, with けれど and けど following in Edo.

The length of the form tracks its formality precisely: けれども is the whole thing, けど is what survives casual speech. That is not an arbitrary register scale — it is literally how much of the original phrase you bothered to say.',
  period = 'Muromachi', updated_at = now()
WHERE id = 'ety-kedo';
