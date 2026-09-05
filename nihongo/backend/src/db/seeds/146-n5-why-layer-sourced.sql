-- What the web checks settled, now that the verifiers can reach sources.
--
-- The N5 pass ran without web search — it was declined, because a background
-- agent has no way to ask for permission and WebSearch was not on an allow
-- list. It flagged what it could not settle rather than guessing, and five of
-- those are resolved here. Three go back to 'well-supported'; two stay
-- 'attested' because the sources say plainly that no account is settled.
--
-- One is a fault nobody had caught. とても is not とて + も. It is 
-- とてもかくても — "whether thus or otherwise" — abbreviated, which is a
-- different word and a better story: the negative was in it from the start.
--
-- Sources consulted: 国立国語研究所 ことば研究館 on とても; コトバンク／日国 on
-- しか, ないで and 接続助詞と; 愛知大学『日中語彙研究』9 (2019) on 枚.

-- とても. NINJAL: in Meiji Tokyo speech the word carried ONLY negatives, and
-- the positive spread in Taishō/Shōwa — Akutagawa called it 新流行 and "not
-- Tokyo language" in 澄江堂雑記. So the strong claim holds once it is scoped to
-- 東京語, and the derivation is corrected.
UPDATE etymology_entries SET
  claim = 'とても is 「とてもかくても」 abbreviated, and in Meiji Tokyo speech it took only negatives.',
  body = 'The full phrase means "whether thus or otherwise" — in any case, no matter what. Worn down to とても it kept that shrug, and とても行けない, "there is no way I can go", is the original construction and still current.

The positive とても寒い spread in Taishō and Shōwa. Akutagawa called it a 新流行 and said it was not Tokyo language; Tsubouchi called it 訛語. They lost, but the negative use never went anywhere, which is why とても〜ない reads as idiomatic rather than as a contradiction.',
  confidence = 'well-supported', period = 'Meiji', updated_at = now()
WHERE id = 'ety-n5-totemo';

-- しか. Confirmed 近世 and essentially absent before it; the older analysis is
-- 副助詞し + 係助詞か. Dating is solid, so the hedge comes off.
UPDATE etymology_entries SET
  body = '千円しかない is "apart from a thousand yen, there is not". しか sets the thing aside and the negative rules out the rest.

It is a late arrival — it spread in the Edo period and is essentially absent from Heian prose, which used 〜より外…ず instead. The pieces are usually read as the particle し plus the particle か. That the negative is required is not a rule to remember but the other half of the sentence, and it is why しか carries a shortfall where だけ, which merely limits, does not.',
  confidence = 'well-supported', updated_at = now()
WHERE id = 'ety-n5-shika-nai';

-- 枚. 愛知大学『日中語彙研究』: Japanese 枚 descends from the Chinese 量詞 枚,
-- which was near-general in scope (close to 个), and Japanese narrowed it to
-- thin flat things; 上代 already had the kun ひら.
UPDATE etymology_entries SET
  body = 'Chinese 枚 was a near-general classifier, close in scope to 个. Japanese narrowed it to thin flat things, and the narrowing shows early — 上代 texts already read the character as ひら, the ひら of 花びら, and medieval documents use it mostly for boards.

The story that reads the flat sense off the 木 radical is folk etymology, and the specialisation is a Japanese development rather than an inherited one. What makes it worth learning first is the sound: unlike 本 and 匹 it takes no changes at all — いちまい through じゅうまい, every one regular.',
  confidence = 'well-supported', updated_at = now()
WHERE id = 'ety-n5-counter-mai';

-- ないで. 日国 says outright that no account is settled: the で may be a
-- particle or the 連用形 of だ, and で itself is traced to にて or to ずて. The
-- honest thing is to say so, so the hedge stays and gets sharper.
UPDATE etymology_entries SET
  body = 'ないで is the negative with で — 傘を持たないで出かけた, going out in the circumstance of not having one. なくて is the adjective negative ない in its て-form, which links a cause: 分からなくて困った.

Which で this is has no settled account: it is read as a particle by some and as the 連用形 of だ by others, and the particle itself is traced back either to にて or to ずて, the classical negative plus て. What is not in doubt is the division of labour — ないで attaches to how something was done, なくて to why.',
  updated_at = now()
WHERE id = 'ety-n5-te-negative';

-- 接続助詞と. 日国 derives the conditional/concessive と from とも rather than
-- straight from the pairing particle, and only the QUOTATIVE と from 格助詞と.
-- The unified story was too tidy, so the sentence goes.
UPDATE etymology_entries SET
  body = '本と鉛筆 pairs two nouns exhaustively. 友達と行く pairs you with a companion. 「はい」と言った pairs an utterance with the saying of it, and that quotative use does come straight from this particle.

The conditional と of N4 is a separate thread — it is usually traced through とも rather than directly from the pairing use — so the family is not quite as tidy as it looks. What holds across all of these is that と joins two things and claims they belong together, which is why と lists completely where や lists loosely.',
  updated_at = now()
WHERE id = 'ety-n5-to-with';
