## Conversations

- [x] **Scripted dialogue practice.** A target user asked for conversations and
      for a way to know their answer was right; those pull against each other,
      so the script is fixed and the reply options known. A wrong pick names
      the mistake — the why-layer applied to conversation, and the thing a
      chatbot cannot reliably do.
- [x] **A seventh arm on `study_items`**, not a jsonb payload: `dialogues`,
      `dialogue_turns`, `dialogue_replies`, with a CHECK that a wrong reply
      cannot exist without a reason. Both constraints verified by trying to
      violate them.
- [x] **Its own menu.** A conversation is not a flashcard, so waiting for the
      review queue to offer one was the wrong front door. `/conversations`
      lists them by scenario; the queue still brings them back.
- [x] **Romaji replaces the script, not annotates it.** `furigana-text.vue`
      renders romaji as ruby ABOVE the glyphs, which helps nobody who cannot
      read the glyphs. `kanaLineToRomaji` produces the line itself.
- [x] **Word breaks and particles are authored, not guessed.** Splitting kana
      into words needs part-of-speech and `sentence_tokens.pos` is empty on all
      8,613 rows; は→わ and を→お need the same. Both live in the content.
- [x] **`mode=new` excluded due cards.** Found while testing this: `due` mode
      excluded new cards from the start but `new` never excluded due ones, so
      "Learning new cards" quietly served reviews.
- [x] **Audio on dialogue turns.** `generate-audio.ts` gained a `dialogues`
      branch: 927 clips covering every turn and every reply, in two voices
      (Kyoko for the other party, Reed for the learner's lines).
- [x] **A hundred conversations**, across eighteen scenario units — house,
      comings and goings, cooking, bath, health, shopping, work, school,
      travel, social, phone and errands, plus the original four. Authored in
      `pipeline/data/dialogues/`, imported by `import:dialogues`.
- [x] **A drawing per conversation.** One per conversation, not per unit: unit
      art repeated the group heading and said nothing about which moment it is.
      See `.claude/rules/media.md`.
- [ ] **Vocabulary illustrations: 59 of 8,240.** The remaining ~8,200 are the
      largest content gap left. Style and process are documented; it is volume,
      and worth deciding how many are actually worth having before drawing —
      8,240 hand-drawn SVGs is not obviously the right target.

## Asset hosting

- [x] **R2, not ImageKit.** ImageKit's free tier would hold this (27 MB today,
      98 MB at full coverage against 3 GB), but it *stops serving* at its 20
      GB/month cap rather than billing overage, its value is image
      transformation that hand-drawn SVGs and .m4a files do not need, and its
      upload path is a browser push for an admin pasting one file. R2 has free
      egress and the account already exists for backups.
- [x] **`R2_*` was dead config** — declared in the env schema, read by nothing.
      `upload:assets` now syncs both trees, skipping objects already present at
      the same size.
- [x] **Paths in the database, host at the edge.** `assetUrl` prefixes
      `R2_PUBLIC_BASE_URL` when serving, so moving buckets is an env change
      rather than a migration across four importers and a seed.
- [x] **SW audio cache raised to 12,000 entries.** It was 3,200 — above today's
      2,829 and below the 10,208 at full coverage, so it would have started
      evicting silently, worst for the heaviest user.
- [x] **The audio generator no longer breaks concurrent builds.** Its
      intermediate AIFF was written next to the output inside
      `public/audio/`, which the frontend build copies wholesale into `dist`
      — so a build running during generation died with ENOENT on a temp file
      that had already been converted and deleted. It goes to the system temp
      directory now.
- [x] **76% of referenced clips did not exist.** Importers wrote a URL for
      every published word across N5–N1 but `audio:words` had only run for N5.
      All 1,730 listening prompts were fine — the gap was the optional "Hear it"
      button on reading and meaning cards. Generation finished: all 10,490
      referenced clips resolve to a key in the bucket, checked by listing
      `audio/words/`, `audio/sentences/` and `audio/kana/` and matching every
      `assets.audio` and `assets.wordAudio` against them.

## Deployment

- [x] **`.data` excluded from the Docker build context.** 575 MB of corpora
      never reached an image, but Docker uploaded the whole context to the
      daemon before the first instruction ran. Effective context is now 31 MB,
      almost all of it the audio.
- [x] **DEPLOY.md said `docker compose up` where it needs `dotenvx run`.**
      `VITE_API_URL` is a build argument substituted by Compose, so the plain
      command would bake in the default and the SPA would call the wrong
      origin — surfacing much later as a CORS failure. The CI workflow already
      did it correctly; the hand-written runbook did not.
- [x] **DEPLOY.md documents what ships**: 33 MB of audio and 252 KB of SVG in
      the frontend, seeds/migrations/email templates in the backend, and what
      deliberately is not (the corpus, GeoLite2, fonts).
- [ ] **The audio is 33 MB of the 31 MB context and every image build.**
      Moving it to R2 is still open.

- [x] **A gated deck reads "later", not "done".** Both report 0 due and 0
      unseen, so the picker was telling the reader they had completed 127
      grammar cards they had never seen. Decks now carry a `locked` count.
- [x] **The wordmark carries its kanji.** 語 is read "go" and means "language";
      the name came from it and the connection lived only in a code comment.
      Header, home, tab title, manifest and email chrome.

## Accounts

- [x] **Only invited people can get an account — verified, not assumed.**
      Probed every path against the running server: an uninvited address asking
      for a code gets one issued but redeeming it returns 403 and creates
      nothing; password sign-up now returns 400 outright. No user, account or
      session row for either probe, and signing in with the "created" password
      fails 401. The gate is a `user.create.before` hook, so every path funnels
      through it.
- [x] **Password self-signup is off unless signups are open.** better-auth
      answered an uninvited sign-up with 200 and a full user object while the
      hook silently rolled it back — the caller was told it had worked and only
      found out at the next sign-in.
- [x] **The OTP endpoint no longer mails arbitrary addresses.** It is
      unauthenticated, so anyone knowing the URL could make the app send email
      anywhere. A code is now only sent to an address with an account or a live
      invite reservation. (The plugin still writes its verification row before
      the sender runs; harmless, since redeeming it 403s.)
- [x] **`SIGNUP_MODE=closed` disables invites too.** `assertMayCreateAccount`
      throws for `closed` before it looks for a reservation, so invite-only is
      `invite`, not `closed`. Kept as behaviour — "closed" meaning closed to
      everyone is defensible — and the ambiguity moved out of the reader's head
      into the schema docstring, which now says plainly that an outstanding
      invite stops working the moment it is set.

- [x] **The invite link carries the email.** The invite already knows the
      address; making the invitee type it back was asking them to guess which
      of their addresses was used, and getting it wrong failed with "you need a
      valid invite code".
- [x] **The name is saved.** The sign-up form collected a name and dropped it —
      nothing ever wrote it, because the OTP sign-in has no name field. Both
      accounts in the database had an empty name, which is why the nav fell
      back to an email address.
- [x] **Settings has an Account section** — change your name, and set a
      password. Neither existed; `/users/me` was declared in the endpoint
      constants and never implemented.
- [x] **An invited account can get a password.** Signing in by code never sets
      one, so the password field on the login page could not work for anybody:
      zero accounts had a password row. Settings now sends a code and sets one
      through better-auth's email-OTP reset flow, which needs no current
      password.
- [x] **Production defaults to invite-only.** The template said
      `SIGNUP_MODE=open` while development used `invite` — deploying as-is
      would have opened registration to anyone.

## Progression

- [x] **There is a curriculum.** There was none: `sort_index` was set per kind
      with colliding ranges, `study_item_prerequisites` had 0 rows, and 11,735
      of ~12,000 items belonged to no unit. A beginner's first cards were ああ,
      一, あっ, うろうろ and a full sentence. `build:curriculum` now rewrites
      sort_index as a position within a level: every kind advances at the same
      relative pace, and each occupies a slice — kana 0–6% (all 142 first),
      grammar and words from 5%, kanji from 12% (so the first kanji you meet
      are ones already seen inside a word), sentences from 35% (rebuilding a
      sentence is pointless without vocabulary). N5 now opens あいうえお…, です
      is the first grammar point, kanji start at 211.
- [x] **Vocabulary has a sourced frequency order.** All 8,240 words had a null
      `frequency_rank`; the JMdict importer parsed the priority tags and threw
      them away. nf01–nf48 bands (500 words each) now give a real rank to 7,066
      of them. The other 1,174 carry no tag at all and stay null — inventing a
      number would sort them against measured ones as if it meant something.
- [x] **New material is gated by stage.** 50 items per stage, next opens at 80%
      retained. Reviews are never gated. Applied to the queue, the new-count
      and the deck counts together, so no number promises cards the queue will
      refuse.
- [x] **A course view.** "I don't know where to start, I am just seeing a bunch
      of categories" was a fair description of the study page, which is a deck
      picker over a corpus. `/course` shows the route instead: where you are,
      what the next stage contains, and every stage with a preview of its
      material and a padlock on what has not opened. Nav leads with it.
- [x] **"Everything due" renamed to "Everything."** It collided with the
      "Reviewing what's due" session and contradicted its own tooltip, which
      read "0 due · 6082 not yet seen".
- [x] **An empty gated deck says why.** It said "Nothing due right now" and
      offered Refresh — wrong twice over when the material exists and
      refreshing will never produce it. It now names the stage that opens it.
- [x] **A silent cache fallback is visible.** The client served its offline
      bundle on any queue error without saying so, which hid a 500 and made the
      whole gate look like it had no effect. It now says when the cache is
      standing in while the network is fine.

# Backlog

What the plan called for and the code does not yet do. Verified against the
repository, not from memory — re-verify before trusting any line here.

Last audited: 2026-08-26

## In progress

- [x] **AI enrichment pipeline** — BUILT, dry-run verified, not yet executed.
      `pnpm -C nihongo/backend enrich --limit N [--execute]`.
      Grounding packets are built from wiktextract `etymology_text`; words with
      no passage are dropped before the model sees them. `validateDraft` checks
      every quote is a literal substring of the passage it cites and every
      sourceId was in the packet. 12 tests, including the fabricated-quote and
      unseen-source cases.
- [x] **First run done** — 12 packets drafted by a Haiku subagent (no API
      spend), validated, 11 queued for review. 1 correctly declined. Zero
      fabricated quotes: 11/11 verified verbatim independently of the validator.
- [x] **Prose quality — largely solved by the prompt, not the model.** The word
      run (loose instruction) declined 1 of 12 and padded several; the grammar
      run, told explicitly to decline when a passage gives only a sound-change
      chain, declined 7 of 11 and the 4 survivors all carry a real payoff.
      Telling the model WHEN TO REFUSE improved what it produced when it did
      not. No larger model needed so far.
- [ ] **Re-draft the weak word-origin bodies** (ええ especially) under the
      tightened instruction, or cut them at review.
- [x] **Grammar packets** — `enrich --kind grammar`. Includes a POS filter
      (`pickGrammarEntry`) that rejects Wiktionary's `syllable` entries: they
      describe the descent of the KANA GLYPH, so grounding は there would yield
      a well-cited, entirely wrong explanation. 11 tests.
- [x] **Kanji glyph origins** — `enrich --kind kanji`, grounded in the
      TRANSLINGUAL wiktextract extract (the Japanese one carries etymologies of
      the WORDS written with a kanji, a different question). `pickGlyphEntry`
      requires a `character` entry, the exact inverse of the grammar filter.
      COVERAGE IS THIN: only 29 of 4,000 Translingual kanji entries carry
      `etymology_text`, so 6 packets came from 84 candidate kanji. This is the
      source-availability risk the plan named, not a code problem.
- [x] **Phonetic-series reading logic** — `enrich --kind phonetic`. The one
      "why" that needs no external scholarship: the passage is a faithful
      rendering of KANJIDIC readings plus the derived series, so quoting it is
      quoting the data, and the substring check stops the model inflating the
      counts.
- [x] **Rendaku** — DONE. `analyseRendaku` + Lyman's Law as a tested library
      (13 tests, including that ん is a nasal and does NOT block). `find:rendaku`
      detects it from KANJIDIC kun-readings over two-kanji compounds: 66 found,
      88 blocked exactly as the law predicts, and 0 violations across 8,240
      words. Entries written DIRECTLY, not via a model — every claim is pure
      computation, so a model could only add risk.
- [ ] **Glyph origins need a better source.** wiktextract covers ~7%. The plan
      budgeted for reference works (白川静, 日本国語大辞典) and hand-entering
      `sources` + `quote` rows for high-traffic kanji.

## From the review triage (130 items, 7 flagged)

- [x] **〜が好き had an English word in its Japanese example** — `music が好きです`.
      Fixed in the seed and the database to 音楽が好きです.
- [x] **Reading-logic could mislead on secondary readings.** 情 matches 青 via
      セイ, but ジョウ is what a learner actually meets (情報, 情熱). The passage
      now names the dominant reading when the matching one is not it — 14 of 120
      packets carry that caveat. The 情 entry was deleted for redrafting.
- [x] **5 items assert things their passage does not say.** Redrafted in seed
      090 to say less: 学/戦 describe which element actually changed instead of
      claiming typing is easier (kanji are typed by reading through an IME,
      where stroke count costs nothing); イクラ keeps the 1928 citation and the
      displaced 鮞 and drops "luxury food"; の keeps the noun-linking role and
      drops "primary"; 先 keeps the 崎 cognate and drops the invented bridge to
      さっき, which is a different word with its own history.
- [x] **ええ is empty padding** — rewritten to say what the sound shift was:
      よい lost its consonant and became いい in the east and ええ in the west,
      which is why Kansai and Tokyo differ while both write 良い.
- [x] **Consider hedging a few hand-authored derivations.** です, ます and
      でしょう are marked disputed with confidence `probable`, and each body now
      ends by saying the chain is reconstructed rather than recorded and that
      specialists propose more than one route.

## Known limit of the safeguard

- [ ] **Verbatim quoting proves the CITATION is real, not that the CLAIM
      follows from it.** A draft can quote correctly and still assert more than
      the passage says. Observed: 憎's passage states readings ゾウ and ソウ and
      says it follows the series; the draft added "related through voicing",
      which is true but unstated. 学's passage says "Simplified from 學"; the
      draft added "uses fewer strokes, making it easier to write and type".
      Both are correct, neither is sourced. This is what human review is for,
      and why nothing publishes without a reviewer.
      MITIGATED for the one case that is machine-checkable: numeric claims must
      appear in a passage (a wrong count is wrong in a way that does not look
      wrong). Audited all 36 Claude entries — 0 violations.

## Blocking the differentiator

- [x] **Fabricated quotes removed.** All 21 human-authored quotes nulled in the
      database AND stripped from `009-grammar.sql`, so a fresh install no longer
      reproduces them (verified: 0 quotes of 21 citations on a clean database).
      Locators kept so a reviewer knows where to check. To restore a quote,
      transcribe it from the source in hand.
- [x] **wiktextract imported** — 314 MB, streamed, `etymology_text` only.
- [x] **Romaji answers are accepted.** The card rendered ご飯 as "gohan" and
      then marked "gohan" wrong — the app showing a script and refusing it back
      is the app contradicting itself. `normaliseJapanese` now converts romaji
      to kana, but only when the input contains no Japanese at all, so a kana
      answer is never put through a romaji converter (かんい must not become
      かに). It also removes the need for a Japanese keyboard, which decides
      whether the app is usable on a phone.
- [x] **Grammar filters by why note.** A dropdown beside search and level;
      276 patterns down to the 27 that carry a sourced note.
- [x] **Romaji is unconditional.** It was fading as characters were learned;
      a page where some words carry a reading and others do not is harder to
      read than either extreme. Selected means everywhere.
- [x] **Grammar pages carry readings.** Every explanation is mixed English and
      Japanese, and the Japanese half had none — the pages that explain the
      language were the least readable thing in the app. There is no tokenizer
      to reach for (the sentence corpus arrived pre-tokenised), so
      `lib/ja/annotate` does longest-match over the 8,240-word dictionary and
      derives per-kanji readings from it via the furigana aligner, which covers
      the inflected forms the dictionary does not list. Titles, patterns,
      explanations, formations, mistakes and etymology, on both the list and
      the detail page.
- [x] **The fallback prefers the word sharing the most text.** A plain
      frequency count read 食べて as くべて, because 食う is commoner than
      食べる. Matching on the longest shared prefix picks 食べる and reads た.
- [x] **Ruby never lands on English.** `annotate` was merging Japanese into a
      run of English, so "…required base for ている" romanised as one string and
      the ruby sat over the English too. Segments no longer merge across
      scripts, and the renderer refuses romaji on a segment with no Japanese.
- [ ] **Annotation is a heuristic and will be wrong on homographs.** It is
      grounded in the dictionary and leaves an unattested kanji bare rather
      than guessing, but 生 and 行 in unusual contexts will read wrong. It is a
      reading aid, never a source of truth.
- [ ] **A reading card still shows no romaji before the reveal**, on purpose:
      on `facet = reading` the reading IS the answer. It appears after.
- [x] **Reading aids on the study card, including romaji.** `kanaToRomaji` in
      shared (inverted from the existing romaji table so the two directions
      cannot drift, 8 tests), a fourth `romaji` furigana mode, and a Readings
      picker beside the deck and level ones — it was only in Settings, which is
      the wrong place for a decision the card in front of you makes.
- [x] **Word-order tiles carry furigana.** They were bare strings, so a tile
      reading 静か offered no way in — and unlike a cloze there is no blank
      whose reading could be hinted. `sentence_tokens.furigana` existed all
      along and simply was not carried through; 1,294 prompts now ship it.
- [x] **Particles read as they are spoken.** は→わ, へ→え, を→お on the tiles.
      Romaji mode was about to teach "ha" and "wo" to exactly the reader who
      cannot yet correct for it. The tokenizer left `pos` empty on all 8,613
      rows, so this keys on the token being that character alone — reliable at
      token granularity, since the syllable inside a word is not tokenised
      separately.
- [x] **`sentence_tokens.pos` is empty for every row.** Filled without rerunning
      the tokenizer: the token already links to a word and the word's first
      sense already carries JMdict's codes, so seed 089 derives it. All 6,544
      linked tokens now carry codes rather than a label — は is `prt`, 行く is
      `v5k-s,vi` — because a drill needs the codes and a rendered "godan verb"
      throws away the half that matters. Unlinked tokens keep an empty pos;
      guessing one would be worse than the gap.
- [x] **Word-order tiles drop numerals.** Measured rather than eyeballed this
      time: across all 1,687 word-order prompts, the chips spell their own
      answer exactly — numerals included (`６つ`, `１日`, `１つ`). Whatever
      dropped them was fixed before it was measured.
- [x] **Grammar is searchable**, across the Japanese title, the pattern, the
      English meaning and the slug at once — and romaji is converted to kana
      first, so "masu" finds 〜ます without a Japanese keyboard.
- [x] **Romaji readings fade as characters are learned.** They ignored the
      known-set entirely; worse, the set could not have helped, because
      `getKnownKanji` joined `studyItems.kanjiId` only and never returned a
      single kana. That was invisible while it drove furigana (kana carry no
      furigana anyway) and stopped being invisible the moment romaji went over
      kana too. The set now counts both scripts — for this account it returns
      7 kana where it previously returned nothing.
- [x] **The WHY badge explains itself.** It marks the points carrying a sourced
      historical note, and said only "why".
- [x] **Cloze cards accept the reading, not just the kanji.** A cloze on お茶
      accepted only "お茶" and rejected "おちゃ", which tests writing 茶 rather
      than knowing the word — production of the character is what the `writing`
      facet is for. The reading was already in the prompt as `hint`, shown as a
      nudge and never counted. Fixed in `import-cloze.ts` and backfilled across
      1,332 rows by seed 018.
- [x] **A wrong answer no longer follows you to the next card.** Only `next()`
      cleared the per-card state, so changing deck or level after a failed
      answer swapped in a new card and left the old verdict and the old typed
      answer sitting under it. Extracted as `resetCard()`, now called from
      `load()` too.
- [x] **A first exposure teaches instead of testing.** Hiding the grammar point
      until reveal stopped the answer leak, but on a card never seen there is
      nothing to recall — "きのう映画を見＿＿" with no indication which pattern
      is being drilled is a guess. New cards name the pattern; reviews still
      hide it.
- [x] **The drawing no longer answers meaning cards.** A picture of coins beside
      the options "and / summer vacation / money / overseas student" is the
      answer, not decoration. Suppressed whenever the expected answer is
      English, decided from the answer's own script.
- [x] **Study filters by level.** `level` on the queue AND the decks response,
      with a picker beside the deck dropdown. Everything was levelled at import
      but nothing filtered on it, so a beginner's queue served N1 vocabulary
      among the kana. The deck counts take the same filter, or the picker would
      promise cards the queue then refuses to hand over.
- [x] **A level filter hides the 63 sound-series items**, which carry no JLPT
      level because the concept is not JLPT-graded. Unlevelled items now pass
      every level filter: narrowing to a level should narrow, not silently drop
      a whole deck. Was: excluding them is the literal meaning of the filter,
      but it means picking N5 silently drops a
      deck. Either level them or exempt them explicitly.
- [x] **Cloze cards name the script they want.** "Fill in the blank" did not
      say whether the grader would take kana, katakana or kanji, and it accepts
      only the surface forms in `accepted` — so the wrong script failed a card
      the reader knew. The hint is derived from those accepted forms, via a new
      `lib/ja/script` module that now owns the character ranges the furigana
      aligner used to keep privately.
- [x] **A due session is sealed.** `?mode=due` reached the API but the page
      still showed the deck dropdown, the "N new" count and the remembered
      deck's filter — so "3 due" handed over 0 cards, silently narrowed to
      whatever deck was last picked.

- [x] **A page that lists what is due.** `GET /study/due` plus `/due`: every
      card the scheduler wants back, named, with kind, facet, how overdue it is
      and a link to its detail page. Filter chips per kind, paged 50 at a time.
      "Due now" on Progress used to link to `/study` — the same destination as
      "Not yet seen", so neither number told you anything. "Not yet seen" now
      goes to `/study?mode=new`, which `study.vue` reads.
- [x] **Mobile navigation.** The header was a single unwrapped flex row of seven
      links plus the language dropdown and account controls; on a phone it had
      nowhere to go. Below `md` the links now live in a drawer that slides in
      from the right (w-56, capped at 70vw), teleported to `<body>`, dismissed by
      the backdrop, Esc or navigating.
- [x] **Illustrations are the card, not a thumbnail.** The drawing now sits
      behind the whole study card at `--card-art-opacity` (0.09 light / 0.06
      dark), `object-contain` so the picture is whole rather than a cropped
      slice, and a scenario deck's scene fills in for every card in that deck.
      Tap it for the full-size view, which locks scrolling behind it.
- [x] **Cloze cards no longer print their own answer.** A cloze prompt carries
      both the before/after halves AND the complete `sentence`; the template
      rendered the complete one underneath the blank.

- [x] **N5 grammar: 129 of 129 published points**, every one with four
      example sentences, tokens, audio and derived questions.
- [x] **N4 grammar: 61 points** (seeds 015–017), hand-written like N5 and
      wired into the scheduler with per-level distractors. Seven points a
      standard N4 list carries (dake, nagara, shika-nai, sugiru,
      ta-koto-ga-aru, toki, tsumori) are already taught at N5 and were dropped
      from the seed rather than left as rows that silently never insert.
- [x] **Grammar page has a level filter.** It used to state "N5 patterns" in
      prose, which was true only while N5 was the only level. `level` was
      already on the list response, so this was frontend-only.
- [x] **N3, N2 and N1 grammar: 165 points** (seeds 019–023). 276 across all
      five levels now, every one wired to the scheduler with same-level
      distractors. N1's notes carry more history than the others on purpose —
      much of N1 is classical grammar surviving inside fixed modern phrases,
      and that is what makes those forms learnable rather than memorisable.
- [x] **Twenty N5 grammar cards had NO distractors.** They came from the
      original 009/010 pass, before 013 began building them. A multiple choice
      with an empty distractor list renders one option, always the right one —
      it could not be got wrong, and it inflated the accuracy figures. Found by
      auditing after the new levels landed; backfilled in 023.
- [x] **All 276 grammar points are reviewed and published.** Every
      content_review_queue row is approved; nothing sits at 'in-review'.
- [ ] **The why-layer covers 27 of 355 topics**, all of them N5. N4, N3, N2
      and N1 have no etymology entries at all. The largest content gap after
      the illustrations.
- [x] **The review queue is clear.** All 618 rows are approved; nothing sits
      at 'in-review'. The 130 that were pending — 57 Claude etymology, 23
      hand-authored etymology, 50 grammar points — have been through.

## Phase 4 — depth and levels

- [x] Searchable dictionary — BACKEND DONE. `/dictionary/search` across words,
      kanji and grammar in one box, pg_trgm indexes, gloss-aware ranking.
      Postgres cannot segment Japanese, so Japanese matches by trigram and only
      English glosses go near a text-search config.
- [x] Kanji detail — BACKEND DONE. `/kanji/:character` assembles readings,
      strokes, sound series, sourced etymology and words that use it.
- [x] **Frontend for search, kanji detail and word detail** — the why-layer is
      now visible. Kanji pages show readings, the sound series with its
      reliability and exceptions, a stroke-order filmstrip, sourced etymology
      with citations, and words that use it. Word pages show a DRAWN pitch
      accent (the stored number is unreadable), senses, kanji links, etymology
      and example sentences with precomputed ruby and audio. Unpublished
      etymology renders with a Draft badge everywhere.
- [x] Grammar relation graph — DONE. CORRECTION: I twice reported the table as
      missing; it exists as `grammar_relations` (I checked the wrong name) and
      was simply empty. Now seeded with 28 directed relations across 24
      contrast pairs (は/が, から/ので, だけ/しか, より/ほうが, に/で, に/へ,
      と/や, 前に/後で, ましょう/ませんか, たい/つもり, い/な-adjectives) and
      surfaced on the grammar page as "Don't confuse this with".
- [x] JLPT coverage — DONE. `/progress/readiness/:levelCode`, shown on the
      progress page with a level picker and a per-kind breakdown.
      Deliberately NOT an exam-score prediction: nobody can infer a pass mark
      from SRS state, and the exam has reading and listening sections this app
      does not model. It reports share-of-curriculum and says so on the page.
      "Known" means the card graduated past FSRS's learning steps, so a big
      study session does not inflate it.
- [ ] Mock tests — not started.

## Phase 5 — speaking

- [ ] MediaRecorder shadowing, waveform comparison against the native clip.
- [ ] Optional Azure pronunciation assessment (5 free hours/month).

## Phase 6

- [ ] French — proves the multi-language schema. One language in the database.
- [ ] Or the cascade AI tutor.

## Deviations from the plan that are still open

- [ ] **TTS is macOS `say`/Kyoko, not Kokoro**, and audio lives in
      `frontend/public/` rather than R2 — ~33 MB baked into the image.
      Runtime caching is already wired, so moving it is a config change.
- [x] **Offline sync now takes a lock.** `navigator.locks` with `ifAvailable`
      makes exactly one tab the flusher; `BroadcastChannel` tells the others to
      redraw. Falls back to the old behaviour where locks are unavailable —
      wasteful but never wrong.
- [x] **Log ids are UUIDv7.** Lexicographic order is now chronological order,
      which is what the replay fold wants. 6 tests, including the >2^32 ms case
      that a 32-bit shift would silently truncate. The DEVICE id stays v4 — it is
      an identity, not a sequence.

## Smaller gaps

- [x] Stroke-order animation — opt-in play control on the stroke diagram. The
      filmstrip stays primary: checking "which stroke is third" should not mean
      watching a replay.
- [x] Weekly summary email — template, message class, and a job on the same
      cron tick as the daily reminder. Sent on the user's OWN local Sunday
      evening, honouring quiet hours. A quiet week gets an honest "nothing this
      week" rather than guilt, which is the version people do not unsubscribe
      from.
- [x] Quiet hours — local-hour window on user_settings, defaulting 22:00-07:00,
      honoured by the reminder run. Handles the wrap past midnight, which is the
      normal case not the edge case. 7 tests. Quiet hours WIN over a conflicting
      preferred hour: that is the reading that does not wake someone up.
- [ ] Import-runs admin screen.
- [ ] **Images: 9 vocab + 4 scenes of ~300 (~3%).** Hand-authored SVG; there is
      no generator and nothing runs in the background.
- [x] **59 drawings** (was 9). 50 new vocabulary SVGs in the established
      travel-poster palette, verified against the DB so every file is keyed to
      the word it actually depicts, attached to 416 prompts by `import:images`.
      Seven were redrawn after a contact sheet showed them reading wrong (the
      guitar as a lollipop, the spoon as a magnifying glass, the pool as a
      window blind).
- [ ] **Still ~0.7% coverage by word count** — 59 of 8,240. The scene backdrop
      covers scenario decks; everything else needs more drawings.
- [x] **Superseded: only 13 drawings exist** — 9 vocabulary (家 学校 山 本 猫 傘 水 魚 電車)
      and 4 scenes (konbini, restaurant, station, ward-office). That is ~0.7% of
      published vocabulary, so a session almost never shows one. The scene
      backdrop partly covers for this on scenario decks; the fix is more
      drawings.
- [x] **Images wired in.** `import:images` attaches drawings by ent_seq into
      `exercise_prompts.assets` (merged, so audio survives) and adds
      `curriculum_units.image_url` for scenes. 63 prompts and all 4 scenes
      attached; study cards render the illustration. Only attaches files that
      EXIST — a slot that sometimes 404s is worse than no slot.
- [ ] The restaurant scene's bowl reads as a lid; redraw.

## Done

Phases 0, 2 and 3 are complete: scaffold and CI, PWA with a custom service
worker and replay-based sync, FSRS with ghost reviews and streak freeze,
handwriting grading against KanjiVG, the conjugation engine, three-state
furigana, the attribution page, and the exclusive-arc schema with both
etymology publish CHECKs enforced by the database.

Content: 8,240 words, 2,004 published kanji, 7,770 with pitch accent, 1,826
sentences, 50 grammar points, 23 etymology entries, 11,793 study items.

## Not mine to do

- VPS upgrade — done.
- `nihongo.futari.live` A record.
- One dmb redeploy to pick up the Caddy block.
