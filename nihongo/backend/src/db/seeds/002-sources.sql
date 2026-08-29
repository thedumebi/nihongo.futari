-- Bibliography for the "why" layer.
--
-- `reliability_tier`: 1 = scholarly reference, 2 = reputable secondary,
-- 3 = community / crowd-sourced. The enrichment validator downgrades any claim
-- marked `attested` that has no tier-1 source behind it, so this column is
-- load-bearing rather than descriptive.
--
-- The tier-1 print references (日本国語大辞典, Frellesvig, Schuessler) are listed
-- with no URL on purpose: their `quote` rows are hand-entered from the physical
-- books. That is the acquisition cost the plan flags as the deepest risk.

INSERT INTO sources (id, slug, kind, title, abbreviation, authors, publisher, year, url, license, citation, reliability_tier, notes) VALUES
  ('src-kanjidic2', 'kanjidic2', 'database', 'KANJIDIC2', 'KANJIDIC2',
   ARRAY['Electronic Dictionary Research and Development Group'], 'EDRDG', NULL,
   'https://www.edrdg.org/wiki/index.php/KANJIDIC_Project', 'CC BY-SA 4.0',
   'KANJIDIC2, Electronic Dictionary Research and Development Group.', 2,
   'Readings, meanings, stroke counts, grades. Not an etymology source.'),

  ('src-jmdict', 'jmdict', 'dictionary', 'JMdict', 'JMdict',
   ARRAY['Electronic Dictionary Research and Development Group'], 'EDRDG', NULL,
   'https://www.edrdg.org/jmdict/j_jmdict.html', 'CC BY-SA 4.0',
   'JMdict, Electronic Dictionary Research and Development Group.', 2,
   'The lsource field is the factual spine for loanword (外来語) origins.'),

  ('src-kanjivg', 'kanjivg', 'database', 'KanjiVG', 'KanjiVG',
   ARRAY['Ulrich Apel'], NULL, NULL,
   'https://kanjivg.tagaini.net/', 'CC BY-SA 3.0',
   'KanjiVG, Ulrich Apel.', 2,
   'Stroke order and component decomposition via kvg:element / kvg:radical.'),

  ('src-tatoeba', 'tatoeba', 'corpus', 'Tatoeba', 'Tatoeba',
   ARRAY['Tatoeba Project contributors'], NULL, NULL,
   'https://tatoeba.org/', 'CC BY 2.0 FR',
   'Tatoeba Project. Attribution attaches per sentence.', 3, NULL),

  ('src-wiktionary', 'wiktionary', 'web', 'Wiktionary (English)', 'Wikt',
   ARRAY['Wiktionary contributors'], 'Wikimedia Foundation', NULL,
   'https://en.wiktionary.org/', 'CC BY-SA 3.0',
   'Wiktionary, the free dictionary.', 3,
   'Glyph-origin and grammar etymology. Thin and occasionally wrong — never the sole support for an `attested` claim.'),

  ('src-edrdg-phonetic', 'edrdg-phonetic', 'database', 'Kanji Phonetic Components', 'EDRDG-Phon',
   ARRAY['Jim Breen'], 'EDRDG', NULL,
   'https://www.edrdg.org/~jwb/kanjiphonetics/', 'EDRDG licence',
   'Kanji Phonetic Components, Jim Breen / EDRDG.', 2,
   'The ~150 phonetic components covering roughly 80% of jōyō kanji.'),

  ('src-chise-ids', 'chise-ids', 'database', 'CHISE IDS', 'CHISE',
   ARRAY['CHISE Project'], NULL, NULL,
   'https://www.chise.org/', 'GPL-compatible',
   'CHISE Ideographic Description Sequences.', 2, NULL),

  ('src-kanjium', 'kanjium', 'database', 'Kanjium', 'Kanjium',
   ARRAY['Uros Mitrovic'], NULL, NULL,
   'https://github.com/mifunetoshiro/kanjium', 'See repository',
   'Kanjium pitch accent data.', 2, NULL),

  ('src-nikkoku', 'nikkoku', 'dictionary', '日本国語大辞典', 'NKD',
   ARRAY['Shogakukan'], 'Shogakukan', 2001, NULL, NULL,
   '日本国語大辞典 第二版, 小学館, 2001.', 1,
   'Tier 1. Print. Quotes hand-entered.'),

  ('src-frellesvig', 'frellesvig-2010', 'book', 'A History of the Japanese Language', 'Frellesvig',
   ARRAY['Bjarke Frellesvig'], 'Cambridge University Press', 2010, NULL, NULL,
   'Frellesvig, B. (2010). A History of the Japanese Language. CUP.', 1,
   'Tier 1. The standard reference for historical grammar — です, ます, the te-form.'),

  ('src-schuessler', 'schuessler-2007', 'book', 'ABC Etymological Dictionary of Old Chinese', 'Schuessler',
   ARRAY['Axel Schuessler'], 'University of Hawaii Press', 2007, NULL, NULL,
   'Schuessler, A. (2007). ABC Etymological Dictionary of Old Chinese.', 1,
   'Tier 1. For on-reading layers and Sino-Japanese borrowing strata.')
ON CONFLICT (slug) DO NOTHING;
